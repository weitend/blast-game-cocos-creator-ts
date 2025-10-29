// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import ScoreAnimator from "../../animations/ui/ScoreAnimator";
import EventManager from "../events/EventManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ScoreManager extends cc.Component {
  @property(cc.Label)
  scoreLabel: cc.Label | null = null;

  @property(cc.Integer)
  totalScore: number = 500;

  @property(cc.Integer)
  earnedScore: number = 0;

  protected start(): void {
    this.updateLabel();
    this.setupListeners();
  }

  protected onDestroy(): void {
    this.destroyListeners();
    this.resetScore();
  }

  private setupListeners(): void {
    const e = EventManager.getInstance();

    e.on("score-changed", this.onScoreChanged, this);
    e.on("game-restart", this.onGameRestart, this);
  }

  private destroyListeners(): void {
    const e = EventManager.getInstance();

    e.off("score-changed", this.onScoreChanged, this);
    e.off("game-restart", this.onGameRestart, this);
  }

  private onGameRestart(): void {
    this.resetScore();
    this.updateLabel();

    if (this.scoreLabel) {
      ScoreAnimator.animateReset(this.scoreLabel.node);
    }
  }

  onScoreChanged(points: number) {
    const prevScore = this.earnedScore;
    this.earnedScore = Math.min(this.earnedScore + points, this.totalScore);

    this.updateLabel();

    if (this.scoreLabel) {
      ScoreAnimator.animateScoreChange(
        this.scoreLabel.node,
        prevScore,
        this.earnedScore
      );
    }

    if (this.earnedScore >= this.totalScore) {
      EventManager.getInstance().emit("game-win");
    }
  }

  updateLabel() {
    if (!this.scoreLabel) return;

    this.scoreLabel.string = `${this.earnedScore}/${this.totalScore}`;
  }

  private resetScore() {
    this.earnedScore = 0;
  }
}
