// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import BoosterAnimator from "../../animations/boosters/BoosterAnimator";
import EventManager from "../../core/events/EventManager";
import { BoosterType } from "../../core/types";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Booster extends cc.Component {
  @property(cc.Integer)
  public quantity: number = 0;

  @property({
    type: cc.Enum(BoosterType),
  })
  private boosterType: BoosterType = BoosterType.Bomb;

  public getBoosterType(): BoosterType {
    return this.boosterType;
  }

  public hasAvailable(): boolean {
    return this.quantity > 0;
  }

  public useOne(): void {
    if (!this.hasAvailable()) return;

    this.quantity--;
    EventManager.getInstance().emit("booster-updated", {
      type: this.boosterType,
      quantity: this.quantity,
    });

    BoosterAnimator.animateUse(this.node);
  }
}
