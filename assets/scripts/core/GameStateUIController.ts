// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import EndGameScreenAnimator from "../animations/EndGameScreenAnimator";
import EventManager from "./EventManager";
import { GameState } from "./types";

const { ccclass, property } = cc._decorator;

type EndState = Exclude<GameState, "playing">;

interface UIConfig {
  readonly text: string;
  readonly color: cc.Color;
}

const UI_CONFIG: Record<EndState, UIConfig> = {
  victory: { text: "Вы\nпобедили!", color: new cc.Color(6, 138, 0, 255) },
  defeat: { text: "Вы\nпроиграли", color: new cc.Color(172, 0, 0, 255) },
};

@ccclass
export default class GameStateUIController extends cc.Component {
  @property(cc.Node)
  private endGameScreen: cc.Node | null = null;

  @property(cc.Label)
  private titleLabel: cc.Label | null = null;

  @property(cc.Button)
  private restartButton: cc.Button | null = null;

  protected start(): void {
    this.hide();
    this.setupListeners();
    this.setupRestartButton();
  }

  protected onDestroy(): void {
    this.destroyListeners();
  }

  private setupListeners(): void {
    EventManager.getInstance().on(
      "game-state-changed",
      this.onStateChanged,
      this
    );
  }

  private destroyListeners(): void {
    EventManager.getInstance().off(
      "game-state-changed",
      this.onStateChanged,
      this
    );

    if (this.restartButton) {
      this.restartButton.node.off("click", this.handleRestartClick, this);
    }
  }

  private setupRestartButton(): void {
    if (!this.restartButton) return;

    this.restartButton.node.on("click", this.handleRestartClick);
  }

  private handleRestartClick = (): void => {
    EventManager.getInstance().emit("game-restart");
  };

  private onStateChanged(state: GameState): void {
    if (state === "playing") {
      this.hide();
    } else {
      this.show(state);
    }
  }

  private show(state: EndState): void {
    const config = UI_CONFIG[state];
    if (!config || !this.endGameScreen || !this.titleLabel) return;

    this.titleLabel.string = config.text;
    this.titleLabel.node.color = config.color;

    this.endGameScreen.active = true;
    EndGameScreenAnimator.show(this.endGameScreen);
  }

  private hide(): void {
    if (!this.endGameScreen) return;

    EndGameScreenAnimator.hide(this.endGameScreen);
    this.scheduleOnce(() => (this.endGameScreen.active = false), 0.2);
  }
}
