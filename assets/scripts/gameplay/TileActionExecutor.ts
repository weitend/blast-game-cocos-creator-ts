// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import GridRepository from "./GridRepository";
import PositionService from "../core/PositionService";
import Tile from "./Tile";
import { TileSpecialType, type Coordinates } from "../core/types";
import TileAnimator from "../animations/TileAnimator";
import TileFactory from "./TileFactory";

export default class TileActionExecutor {
  constructor(
    private grid: GridRepository,
    private positionService: PositionService
  ) {}

  public async destroyConnectedTiles(
    connected: Coordinates[],
    clickX: number,
    clickY: number
  ): Promise<number> {
    const specialType = this.determineSpecialType(connected.length);
    const shouldCreateSpecial = specialType !== TileSpecialType.None;

    const connectedWithoutSpecial = connected.filter(
      ({ x, y }) => !(x === clickX && y === clickY && shouldCreateSpecial)
    );
    await this.destroyTiles(connectedWithoutSpecial);

    if (shouldCreateSpecial) {
      const node = this.grid.getTileAt(clickX, clickY);
      const tile = node?.getComponent(Tile);

      if (tile) {
        tile.transformToSpecial(specialType);
        TileAnimator.animateSpecialTileCreate(node);
      }
    }

    return connected.length * 10;
  }

  public async activateSpecialTile(tile: Tile): Promise<number> {
    const { x, y } = tile.getGridPosition();
    const type = tile.getSpecialType();
    const targets: Coordinates[] = [];

    switch (type) {
      case TileSpecialType.Bomb:
        this.collectRadius(x, y, 1, targets);
        break;
      case TileSpecialType.RowRocket:
        for (let cx = 0; cx < this.grid.width; cx++) targets.push({ x: cx, y });
        break;
      case TileSpecialType.ColRocket:
        for (let cy = 0; cy < this.grid.height; cy++)
          targets.push({ x, y: cy });
        break;
      case TileSpecialType.SuperBomb:
        this.grid.forEachTile((cx, cy) => targets.push({ x: cx, y: cy }));
        break;
    }

    await this.destroyTiles(targets);

    return targets.length * 10;
  }

  private collectRadius(
    x: number,
    y: number,
    r: number,
    out: Coordinates[]
  ): void {
    for (let dx = -r; dx <= r; dx++) {
      for (let dy = -r; dy <= r; dy++) {
        const cx = x + dx,
          cy = y + dy;
        if (this.grid.isCoordinatesInsideGrid(cx, cy))
          out.push({ x: cx, y: cy });
      }
    }
  }

  public async swapTiles(firstTile: Tile, secondTile: Tile): Promise<void> {
    const firstPosition = this.positionService.getTileWorldPosition(
      firstTile.getGridPosition().x,
      firstTile.getGridPosition().y
    );
    const secondPosition = this.positionService.getTileWorldPosition(
      secondTile.getGridPosition().x,
      secondTile.getGridPosition().y
    );

    firstTile.node.setPosition(secondPosition);
    secondTile.node.setPosition(firstPosition);

    this.grid.setTileAt(
      secondTile.getGridPosition().x,
      secondTile.getGridPosition().y,
      firstTile.node
    );
    this.grid.setTileAt(
      firstTile.getGridPosition().x,
      firstTile.getGridPosition().y,
      secondTile.node
    );

    const firstGridPosition = firstTile.getGridPosition();
    const secondGridPosition = secondTile.getGridPosition();

    firstTile.setGridPosition(secondGridPosition.x, secondGridPosition.y);
    secondTile.setGridPosition(firstGridPosition.x, firstGridPosition.y);
  }

  private determineSpecialType(size: number): TileSpecialType {
    if (size >= 9) return TileSpecialType.SuperBomb;
    if (size >= 6)
      return Math.random() < 0.5
        ? TileSpecialType.RowRocket
        : TileSpecialType.ColRocket;
    if (size >= 5) return TileSpecialType.Bomb;
    return TileSpecialType.None;
  }

  private async destroyTiles(targets: Coordinates[]): Promise<void> {
    await Promise.all(
      targets.map(async ({ x, y }) => {
        const node = this.grid.getTileAt(x, y);
        const tile = node?.getComponent(Tile);
        if (tile) await tile.destroyTile();
        this.grid.setTileAt(x, y, null);
      })
    );
  }
}
