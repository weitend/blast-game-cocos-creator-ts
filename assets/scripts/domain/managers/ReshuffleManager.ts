// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import GridAppearAnimator from "../../animations/ui/GridAppearAnimator";
import EventManager from "../../core/events/EventManager";
import GridRepository from "../../data/GridRepository";
import TileFactory from "../../data/TileFactory";
import Tile from "../entities/Tile";
import TileMatchManager from "./TileMatchManager";

const { ccclass } = cc._decorator;

@ccclass
export default class ReshuffleManager extends cc.Component {
  private readonly maxReshuffles = 3;
  private reshuffleCount = 0;
  private readonly appearAnimator = new GridAppearAnimator();

  private grid: GridRepository | null = null;
  private factory: TileFactory | null = null;
  private matcher: TileMatchManager | null = null;

  public init(
    grid: GridRepository,
    factory: TileFactory,
    matcher: TileMatchManager
  ): void {
    this.grid = grid;
    this.factory = factory;
    this.matcher = matcher;
  }

  public async checkAndReshuffle(): Promise<boolean> {
    if (this.hasAvailableMoves()) return true;

    if (this.reshuffleCount >= this.maxReshuffles) {
      EventManager.getInstance().emit("game-lose");
      return false;
    }

    await this.reshuffleField();
    return this.checkAndReshuffle();
  }

  private hasAvailableMoves(): boolean {
    if (!this.grid || !this.matcher) return false;

    return this.grid.someTile((x, y) => {
      const tileNode = this.grid!.getTileAt(x, y);
      const tileComp = tileNode.getComponent(Tile);
      if (!tileComp) return false;

      const connected = this.matcher!.findConnectedTiles(
        x,
        y,
        tileComp.getTileType()
      );

      return connected.length >= 2;
    });
  }

  private async reshuffleField(): Promise<void> {
    if (!this.grid || !this.factory) return;

    this.reshuffleCount++;

    this.clearField();
    this.factory.populateField(this.grid);

    await this.appearAnimator.animateGridAppearance(this.grid);
  }

  private clearField(): void {
    if (!this.grid) return;

    this.grid.forEachTile((x, y) => {
      const tile = this.grid!.getTileAt(x, y);
      tile?.destroy();
      this.grid!.setTileAt(x, y, null);
    });
  }

  public reset(): void {
    this.reshuffleCount = 0;
  }
}
