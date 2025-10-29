// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import EventManager from "./EventManager";
import { GameState } from "./types";

const { ccclass } = cc._decorator;

@ccclass
export default class GameStateManager extends cc.Component {
  private _state: GameState = "playing";

  public get state(): GameState {
    return this._state;
  }

  public set state(value: GameState) {
    if (this._state === value) return;
    this._state = value;
    EventManager.getInstance().emit("game-state-changed", value);
  }

  private handleGameWin = () => {
    this.state = "victory";
  };
  private handleGameLose = () => {
    this.state = "defeat";
  };
  private handleGameRestart = () => {
    this.state = "playing";
  };

  protected start(): void {
    this.setupListeners();
  }

  protected onDestroy(): void {
    this.destroyListeners();
  }

  private setupListeners(): void {
    const e = EventManager.getInstance();

    e.on("game-win", this.handleGameWin, this);
    e.on("game-lose", this.handleGameLose, this);
    e.on("game-restart", this.handleGameRestart, this);
  }

  private destroyListeners(): void {
    const e = EventManager.getInstance();

    e.off("game-win", this.handleGameWin, this);
    e.off("game-lose", this.handleGameLose, this);
    e.off("game-restart", this.handleGameRestart, this);
  }
}
