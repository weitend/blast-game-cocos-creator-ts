// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import { BoosterType, GameState, TileSpecialType } from "../types";

const { ccclass } = cc._decorator;

export interface GameEvents {
  "tile-clicked": {
    x: number;
    y: number;
    tileType: number;
    specialType: TileSpecialType;
  };
  "moves-changed": void;
  "score-changed": number;
  "game-win": void;
  "game-lose": void;
  "game-restart": void;
  "game-state-changed": GameState;
  "booster-updated": {
    type: BoosterType;
    quantity: number;
  };
  "booster-action-complete": BoosterType;
  "booster-activate-request": {
    type: BoosterType;
    node: cc.Node;
  };
}

export type GameEventType = keyof GameEvents;

@ccclass
export default class EventManager extends cc.Component {
  private static instance: EventManager;

  public static getInstance(): EventManager {
    return EventManager.instance;
  }

  protected onLoad(): void {
    if (EventManager.instance) {
      this.destroy();
      return;
    }

    EventManager.instance = this;
    cc.game.addPersistRootNode(this.node);
  }

  public emit<K extends GameEventType>(
    eventType: K,
    ...payload: GameEvents[K] extends void ? [] : [GameEvents[K]]
  ): void {
    this.node.emit(eventType, ...payload);
  }

  public on<K extends GameEventType>(
    eventType: K,
    callback: GameEvents[K] extends void
      ? () => void
      : (data: GameEvents[K]) => void,
    target?: unknown
  ): void {
    this.node.on(eventType, callback, target);
  }

  public off<K extends GameEventType>(
    eventType: K,
    callback: GameEvents[K] extends void
      ? () => void
      : (data: GameEvents[K]) => void,
    target?: unknown
  ): void {
    this.node.off(eventType, callback, target);
  }
}
