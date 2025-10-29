// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import TileEffectResolver from "./TileEffectResolver";
import TileDestroyer from "./TileDestroyer";
import TileChainProcessor from "./TileChainProcessor";
import GridRepository from "../../data/GridRepository";
import PositionService from "../../core/services/PositionService";
import { Coordinates, TileSpecialType } from "../../core/types";
import Tile from "../entities/Tile";
import TileAnimator from "../../animations/tiles/TileAnimator";

export default class TileActionExecutor {
  private readonly effects: TileEffectResolver;
  private readonly destroyer: TileDestroyer;
  private readonly chainProcessor: TileChainProcessor;

  constructor(
    private readonly grid: GridRepository,
    private readonly positionService: PositionService
  ) {
    this.effects = new TileEffectResolver(grid);
    this.destroyer = new TileDestroyer(grid);
    this.chainProcessor = new TileChainProcessor(
      grid,
      this.effects,
      this.destroyer
    );
  }

  public async destroyConnectedTiles(
    connected: Coordinates[],
    clickX: number,
    clickY: number
  ): Promise<number> {
    const specialType = this.determineSpecialType(connected.length);
    const shouldCreateSpecial = specialType !== TileSpecialType.None;

    const connectedWithoutSpecial = shouldCreateSpecial
      ? connected.filter(({ x, y }) => !(x === clickX && y === clickY))
      : connected;

    if (shouldCreateSpecial)
      this.createSpecialTileAt(clickX, clickY, specialType);

    return this.chainProcessor.processChain(connectedWithoutSpecial);
  }

  public async activateSpecialTile(tile: Tile): Promise<number> {
    const targets = this.effects.resolve(
      tile.getSpecialType(),
      tile.getGridPosition()
    );
    return this.chainProcessor.processChain(targets);
  }

  private createSpecialTileAt(
    x: number,
    y: number,
    type: TileSpecialType
  ): void {
    const node = this.grid.getTileAt(x, y);
    const tile = node?.getComponent(Tile);
    if (!tile) return;

    tile.transformToSpecial(type);
    TileAnimator.animateSpecialTileCreate(node);
  }

  public async swapTiles(first: Tile, second: Tile): Promise<void> {
    const pos1 = this.positionService.getTileWorldPosition(
      first.getGridPosition().x,
      first.getGridPosition().y
    );
    const pos2 = this.positionService.getTileWorldPosition(
      second.getGridPosition().x,
      second.getGridPosition().y
    );

    first.node.setPosition(pos2);
    second.node.setPosition(pos1);

    const gp1 = first.getGridPosition();
    const gp2 = second.getGridPosition();

    this.grid.setTileAt(gp2.x, gp2.y, first.node);
    this.grid.setTileAt(gp1.x, gp1.y, second.node);

    first.setGridPosition(gp2.x, gp2.y);
    second.setGridPosition(gp1.x, gp1.y);
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

  public async destroyTilesWithChain(targets: Coordinates[]): Promise<number> {
    return this.chainProcessor.processChain(targets);
  }
}
