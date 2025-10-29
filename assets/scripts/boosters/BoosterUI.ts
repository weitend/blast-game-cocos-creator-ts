// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import EventManager from "../core/events/EventManager";
import { BoosterType } from "../core/types";
import Booster from "../domain/entities/Booster";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BoosterUI extends cc.Component {
  @property(Booster)
  private boosterComponent: Booster | null = null;

  @property(cc.Label)
  private quantityLabel: cc.Label | null = null;

  protected start(): void {
    this.updateQuantityLabel();
    this.setupListeners();
  }

  protected onDestroy(): void {
    this.destroyListeners();
  }

  private onClick() {
    if (this.boosterComponent.quantity <= 0) return;

    EventManager.getInstance().emit("booster-activate-request", {
      type: this.boosterComponent.getBoosterType(),
      node: this.boosterComponent.node,
    });
  }

  private setupListeners(): void {
    this.node.on(cc.Node.EventType.TOUCH_END, this.onClick, this);

    const e = EventManager.getInstance();
    e.on("booster-updated", this.onBoosterUpdated, this);
    e.on("booster-action-complete", this.onBoosterUsed, this);
  }

  private destroyListeners(): void {
    this.node.off(cc.Node.EventType.TOUCH_END, this.onClick, this);

    const e = EventManager.getInstance();
    e.off("booster-updated", this.onBoosterUpdated, this);
    e.off("booster-action-complete", this.onBoosterUsed, this);
  }

  private onBoosterUpdated({
    type,
    quantity,
  }: {
    type: BoosterType;
    quantity: number;
  }): void {
    if (type !== this.boosterComponent.getBoosterType()) return;

    this.boosterComponent.quantity = quantity;
    this.updateQuantityLabel();
  }

  private onBoosterUsed(type: BoosterType) {
    if (type !== this.boosterComponent.getBoosterType()) return;

    this.boosterComponent.useOne();
    this.updateQuantityLabel();
  }

  private updateQuantityLabel(): void {
    if (!this.quantityLabel) return;

    this.quantityLabel.string = `${this.boosterComponent.quantity}`;
  }
}
