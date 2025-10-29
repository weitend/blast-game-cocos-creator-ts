// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html
import TileAnimator from "../animations/TileAnimator";
import EventManager from "../core/EventManager";
import PositionService from "../core/PositionService";
import GridRepository from "./GridRepository";
import Tile from "./Tile";
import TileFactory from "./TileFactory";

const { ccclass } = cc._decorator;

@ccclass
export default class TileGravityManager {
  private grid: GridRepository | null = null;
  private factory: TileFactory | null = null;
  private positionService: PositionService | null = null;

  public init(
    grid: GridRepository,
    factory: TileFactory,
    positionService: PositionService
  ): void {
    this.grid = grid;
    this.factory = factory;
    this.positionService = positionService;
  }

  public async applyGravity(): Promise<void> {
    if (!this.grid) return;

    const movePromises: Promise<void>[] = [];

    for (let x = 0; x < this.grid.width; x++) {
      let emptyCount = 0;

      for (let y = 0; y < this.grid.height; y++) {
        const tile = this.grid.getTileAt(x, y);

        if (!tile) {
          emptyCount++;
        } else if (emptyCount > 0) {
          const newY = y - emptyCount;
          const tileComp = tile.getComponent(Tile);

          if (tileComp) {
            const promise = tileComp.moveToGrid(x, newY);
            movePromises.push(promise);
          }

          this.grid.setTileAt(x, newY, tile);
          this.grid.setTileAt(x, y, null);
        }
      }

      for (let i = 0; i < emptyCount; i++) {
        const yStart = this.grid.height + i;
        const yEnd = this.grid.height - emptyCount + i;

        const promise = this.createFallingTile(x, yStart, yEnd);

        movePromises.push(promise);
      }
    }

    await Promise.all(movePromises);
  }

  private async createFallingTile(
    x: number,
    yStart: number,
    yEnd: number
  ): Promise<void> {
    const node = this.factory.createTile(x, yEnd);

    const startPos = this.positionService.getTileWorldPosition(x, yStart);
    node.setPosition(startPos);

    const endPos = this.positionService.getTileWorldPosition(x, yEnd);
    await TileAnimator.animateFall(node, endPos);

    node.setPosition(endPos);
    this.grid.setTileAt(x, yEnd, node);
  }
}
