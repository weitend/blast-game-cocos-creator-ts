// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import BoosterManager from "../../boosters/BoosterManager";
import EventManager from "../../core/events/EventManager";
import { TileSpecialType } from "../../core/types";
import GridRepository from "../../data/GridRepository";
import Tile from "../entities/Tile";
import TileActionExecutor from "../logic/TileActionExecutor";
import TileGravityManager from "../logic/TileGravityManager";
import ReshuffleManager from "./ReshuffleManager";
import TileMatchManager from "./TileMatchManager";

export default class TileTurnController {
  private isProcessing = false;

  constructor(
    private grid: GridRepository,
    private matcher: TileMatchManager,
    private tileActions: TileActionExecutor,
    private gravity: TileGravityManager,
    private reshuffler: ReshuffleManager,
    private boosterManager: BoosterManager,
    private gridNode: cc.Node
  ) {}

  public async onTileClicked({
    x,
    y,
    tileType,
  }: {
    x: number;
    y: number;
    tileType: number;
  }) {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      if (await this.tryHandleBooster(x, y)) return;
      EventManager.getInstance().emit("moves-changed");

      const tile = this.getTile(x, y);
      if (!tile) return;

      if (await this.tryHandleSpecial(tile)) return;
      await this.tryHandleConnected(x, y, tileType);
    } finally {
      await this.finalizeTurn();
    }
  }

  private getTile(x: number, y: number): Tile | null {
    const node = this.grid.getTileAt(x, y);
    return node?.getComponent(Tile) ?? null;
  }

  private async tryHandleBooster(x: number, y: number): Promise<boolean> {
    if (this.boosterManager.activeBoosterType === null) return false;
    await this.boosterManager.handleBoosterUsage(x, y);
    return true;
  }

  private async tryHandleSpecial(tile: Tile): Promise<boolean> {
    if (tile.getSpecialType() === TileSpecialType.None) return false;

    const points = await this.tileActions.activateSpecialTile(tile);
    EventManager.getInstance().emit("score-changed", points);
    return true;
  }

  private async tryHandleConnected(
    x: number,
    y: number,
    tileType: number
  ): Promise<void> {
    const connected = this.matcher.findConnectedTiles(x, y, tileType);
    if (connected.length < 2) return;

    const points = await this.tileActions.destroyConnectedTiles(
      connected,
      x,
      y
    );
    EventManager.getInstance().emit("score-changed", points);
  }

  private async finalizeTurn(): Promise<void> {
    await this.gravity.applyGravity();
    await this.reshuffler.checkAndReshuffle();
    this.resortTilesByDepth();
    this.isProcessing = false;
  }

  private resortTilesByDepth(): void {
    this.gridNode.children.forEach((child) => {
      child.zIndex = +child.y;
    });
  }
}
