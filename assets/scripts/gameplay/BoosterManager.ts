// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import BoosterAnimator from "../animations/BoosterAnimator";
import TileAnimator from "../animations/TileAnimator";
import EventManager from "../core/EventManager";
import { BoosterType, Coordinates } from "../core/types";
import GridRepository from "./GridRepository";
import Tile from "./Tile";
import TileActionExecutor from "./TileActionExecutor";

const { ccclass } = cc._decorator;

@ccclass
export default class BoosterManager extends cc.Component {
  private grid: GridRepository | null = null;
  private tileActions: TileActionExecutor | null = null;

  public activeBoosterType: BoosterType | null = null;
  private activeBoosterNode: cc.Node | null = null;
  private selectedTile: Coordinates | null = null;
  private isWaitingForSecondTile = false;

  public init(grid: GridRepository, tileActions: TileActionExecutor): void {
    this.grid = grid;
    this.tileActions = tileActions;

    this.setupListeners();
  }

  protected onDestroy(): void {
    this.destroyListeners();
  }

  private setupListeners(): void {
    const e = EventManager.getInstance();
    e.on("booster-activate-request", this.onBoosterActivateRequest, this);
  }

  private destroyListeners(): void {
    const e = EventManager.getInstance();
    e.off("booster-activate-request", this.onBoosterActivateRequest, this);
  }

  private onBoosterActivateRequest({
    type,
    node,
  }: {
    type: BoosterType;
    node: cc.Node;
  }): void {
    if (this.activeBoosterType === type) {
      this.deactivateBooster();
      return;
    }

    if (this.activeBoosterType !== null) {
      this.deactivateBooster();
    }

    this.activeBoosterNode = node;
    this.activeBoosterType = type;
    this.isWaitingForSecondTile = false;

    BoosterAnimator.startActivePulse(node);
  }

  public async handleBoosterUsage(x: number, y: number): Promise<void> {
    if (this.activeBoosterType === null) return;

    if (
      this.activeBoosterType === BoosterType.Teleport &&
      this.isWaitingForSecondTile
    ) {
      await this.useTeleportBooster(x, y);
      return;
    }

    switch (this.activeBoosterType) {
      case BoosterType.Bomb:
        await this.useBombBooster(x, y);
        break;
      case BoosterType.Teleport:
        await this.useTeleportBooster(x, y);
        break;
    }
  }

  private async useBombBooster(x: number, y: number): Promise<void> {
    if (!this.grid) return;

    const radius = 1;
    const targets: Coordinates[] = [];

    for (let dx = -radius; dx <= radius; dx++) {
      for (let dy = -radius; dy <= radius; dy++) {
        const cx = x + dx;
        const cy = y + dy;
        if (this.grid.isCoordinatesInsideGrid(cx, cy)) {
          targets.push({ x: cx, y: cy });
        }
      }
    }

    await Promise.all(
      targets.map(async ({ x, y }) => {
        const node = this.grid.getTileAt(x, y);
        const tileComp = node?.getComponent(Tile);

        if (tileComp) {
          await BoosterAnimator.animateBomb(node);
          await tileComp.destroyTile();
          this.grid.setTileAt(x, y, null);
        }
      })
    );

    const points = targets.length * 10;
    EventManager.getInstance().emit("score-changed", points);

    this.finishBoosterUsage();
  }

  private async useTeleportBooster(x: number, y: number): Promise<void> {
    if (!this.grid || !this.tileActions) return;

    if (this.isWaitingForSecondTile) {
      const firstNode = this.grid.getTileAt(
        this.selectedTile!.x,
        this.selectedTile!.y
      );
      const secondNode = this.grid.getTileAt(x, y);

      if (firstNode && secondNode) {
        const firstTile = firstNode.getComponent(Tile);
        const secondTile = secondNode.getComponent(Tile);

        if (firstTile && secondTile) {
          BoosterAnimator.stopActivePulse(firstNode);
          await TileAnimator.animateSwap(firstNode, secondNode);

          await this.tileActions.swapTiles(firstTile, secondTile);
        }
      }

      this.finishBoosterUsage();
    } else {
      this.selectedTile = { x, y };
      const node = this.grid.getTileAt(x, y);

      if (node) {
        BoosterAnimator.startActivePulse(node);
      }

      this.isWaitingForSecondTile = true;
    }
  }

  private deactivateBooster(): void {
    if (this.activeBoosterNode) {
      BoosterAnimator.stopActivePulse(this.activeBoosterNode);
      this.activeBoosterNode = null;
    }

    if (this.selectedTile && this.grid) {
      const node = this.grid.getTileAt(
        this.selectedTile.x,
        this.selectedTile.y
      );
      if (node) BoosterAnimator.stopActivePulse(node);
    }

    this.activeBoosterType = null;
    this.isWaitingForSecondTile = false;
    this.selectedTile = null;
  }

  private finishBoosterUsage(): void {
    if (this.activeBoosterNode) {
      BoosterAnimator.stopActivePulse(this.activeBoosterNode);
      this.activeBoosterNode = null;
    }

    EventManager.getInstance().emit(
      "booster-action-complete",
      this.activeBoosterType
    );

    this.activeBoosterType = null;
    this.isWaitingForSecondTile = false;
    this.selectedTile = null;
  }
}
