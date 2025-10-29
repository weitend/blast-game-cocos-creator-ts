// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import TileAnimator from "../animations/tiles/TileAnimator";
import PositionService from "../core/services/PositionService";
import { TileSpecialType } from "../core/types";
import Tile from "../domain/entities/Tile";
import GridRepository from "./GridRepository";

export default class TileFactory {
  constructor(
    private readonly tilePrefab: cc.Prefab,
    private readonly parentNode: cc.Node,
    private readonly positionService: PositionService,
    private readonly grid: GridRepository
  ) {}

  public createTile(
    x: number,
    y: number,
    type: number | null = null,
    specialType: TileSpecialType = TileSpecialType.None,
    animateSpawn = false
  ): cc.Node {
    const node = cc.instantiate(this.tilePrefab);
    const tileComp = node.getComponent(Tile);

    if (!tileComp) {
      throw new Error("Tile component missing on prefab");
    }

    node.parent = this.parentNode;

    tileComp.init(
      x,
      y,
      type || this.getRandomTileType(),
      this.positionService,
      specialType
    );

    const pos = this.positionService.getTileWorldPosition(x, y);
    node.setPosition(pos);

    this.grid.setTileAt(x, y, node);

    if (animateSpawn) {
      TileAnimator.animateSpawn(node, pos);
    }

    return node;
  }

  public async createFallingTile(
    x: number,
    yStart: number,
    yEnd: number,
    type: number | null,
    specialType: TileSpecialType = TileSpecialType.None
  ): Promise<void> {
    const node = cc.instantiate(this.tilePrefab);
    node.parent = this.parentNode;

    const tileComp = node.getComponent(Tile);
    if (!tileComp) {
      throw new Error("Tile component missing on prefab");
    }

    tileComp.init(x, yEnd, type, this.positionService, specialType);

    const startPos = this.positionService.getTileWorldPosition(x, yStart);
    const endPos = this.positionService.getTileWorldPosition(x, yEnd);
    node.setPosition(startPos);

    await TileAnimator.animateFall(node, endPos);

    this.grid.setTileAt(x, yEnd, node);
  }
  populateField(grid: GridRepository): void {
    this.grid.forEachTile((x, y) => {
      const tile = this.createTile(x, y);

      tile.setPosition(this.positionService.getTileWorldPosition(x, y));
      grid.setTileAt(x, y, tile);
    });
  }

  public getRandomTileType(): number {
    return Math.floor(Math.random() * this.grid.tileTypesCount);
  }
}
