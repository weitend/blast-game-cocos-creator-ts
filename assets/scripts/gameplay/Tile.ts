// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import TileAnimator from "../animations/TileAnimator";
import EventManager from "../core/EventManager";
import PositionService from "../core/PositionService";
import { Coordinates, TileSpecialType } from "../core/types";
const { ccclass, property } = cc._decorator;
@ccclass
export default class Tile extends cc.Component {
  @property([cc.SpriteFrame])
  private tileSprites: cc.SpriteFrame[] = [];

  @property([cc.SpriteFrame])
  private specialSprites: cc.SpriteFrame[] = [];

  private sprite: cc.Sprite | null = null;
  private positionService: PositionService | null = null;
  private tileType: number | null = 0;
  private specialType: TileSpecialType = TileSpecialType.None;
  private gridX = 0;
  private gridY = 0;

  public init(
    x: number,
    y: number,
    type: number | null,
    positionService: PositionService,
    specialType: TileSpecialType = TileSpecialType.None
  ): void {
    this.gridX = x;
    this.gridY = y;
    this.tileType = type;
    this.specialType = specialType;
    this.positionService = positionService;
  }

  protected start(): void {
    this.updateSprite();
  }

  protected onLoad(): void {
    this.sprite = this.getComponent(cc.Sprite);
    this.setupListeners();
  }

  protected onDestroy(): void {
    this.destroyListeners();
  }

  private setupListeners(): void {
    this.node.on(cc.Node.EventType.TOUCH_END, this.onClick, this);
  }

  private destroyListeners(): void {
    this.node.on(cc.Node.EventType.TOUCH_END, this.onClick, this);
  }

  public getGridPosition(): Coordinates {
    return { x: this.gridX, y: this.gridY };
  }

  public setGridPosition(x: number, y: number): void {
    this.gridX = x;
    this.gridY = y;
  }

  public getTileType(): number | null {
    return this.tileType;
  }

  public getSpecialType(): TileSpecialType {
    return this.specialType;
  }

  public isSpecial(): boolean {
    return this.specialType !== TileSpecialType.None;
  }

  public async moveToGrid(x: number, y: number): Promise<void> {
    if (!this.positionService) return;

    this.gridX = x;
    this.gridY = y;

    const target = this.positionService.getTileWorldPosition(x, y);

    await TileAnimator.animateFall(this.node, target);
  }

  public async destroyTile(duration = 0.15): Promise<void> {
    await TileAnimator.animateDestroy(this.node, duration);
    this.node.destroy();
  }

  public transformToSpecial(specialType: TileSpecialType): void {
    this.specialType = specialType;
    this.tileType = null;

    this.updateSprite();
  }

  private onClick(): void {
    const e = EventManager.getInstance();

    e.emit("tile-clicked", {
      x: this.gridX,
      y: this.gridY,
      tileType: this.tileType,
      specialType: this.specialType,
    });
  }

  private updateSprite(): void {
    if (!this.sprite) return;

    if (this.isSpecial() && this.specialSprites[this.specialType]) {
      this.sprite.spriteFrame = this.specialSprites[this.specialType];
    } else if (this.tileSprites[this.tileType]) {
      this.sprite.spriteFrame = this.tileSprites[this.tileType];
    }
  }
}
