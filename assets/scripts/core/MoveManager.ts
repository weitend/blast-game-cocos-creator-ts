// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import MoveCounterAnimator from "../animations/MoveCounterAnimator";
import EventManager from "./EventManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class MoveManager extends cc.Component {
  @property(cc.Label)
  moveLabel: cc.Label | null = null;

  @property(cc.Integer)
  initialMoves: number = 37;

  private movesCount: number = 0;

  protected onLoad(): void {
    this.resetMoves();
    this.updateLabel();
  }

  protected start(): void {
    this.setupListeners();
  }

  protected onDestroy(): void {
    this.destroyListeners();
    this.resetMoves();
  }

  private setupListeners(): void {
    const e = EventManager.getInstance();

    e.on("moves-changed", this.onMovesChanged, this);
    e.on("game-restart", this.onGameRestart, this);
  }

  private destroyListeners(): void {
    const e = EventManager.getInstance();

    e.off("moves-changed", this.onMovesChanged, this);
    e.off("game-restart", this.onGameRestart, this);
  }

  updateLabel() {
    if (!this.moveLabel) return;

    this.moveLabel.string = String(this.movesCount);
  }

  private onMovesChanged() {
    this.decrementMove();
    this.updateLabel();

    if (this.moveLabel) {
      MoveCounterAnimator.animateDecrement(this.moveLabel.node);
    }

    if (this.movesCount <= 0) {
      EventManager.getInstance().emit("game-lose");
    }
  }

  private onGameRestart(): void {
    this.resetMoves();
    this.updateLabel();

    if (this.moveLabel) {
      MoveCounterAnimator.animateReset(this.moveLabel.node);
    }
  }

  private decrementMove() {
    if (this.movesCount > 0) {
      this.movesCount--;
    }
  }

  private resetMoves() {
    this.movesCount = this.initialMoves;
  }
}
