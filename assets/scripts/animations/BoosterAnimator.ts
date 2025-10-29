// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

const USE_DURATION = 0.2;

export default class BoosterAnimator {
  public static animateUse(node: cc.Node): void {
    if (!node) return;

    node.stopAllActions();

    const shrink = cc
      .scaleTo(USE_DURATION, 0.8)
      .easing(cc.easeCubicActionOut());
    const restore = cc.scaleTo(USE_DURATION, 1.0).easing(cc.easeBackOut());
    const flash = cc.tintTo(USE_DURATION, 255, 180, 180);

    node.runAction(
      cc.sequence(
        cc.spawn(shrink, flash),
        restore,
        cc.tintTo(0.1, 255, 255, 255)
      )
    );
  }

  static animateBomb(node: cc.Node): Promise<void> {
    if (!node) return Promise.resolve();

    return new Promise((resolve) => {
      const explode = cc.spawn(
        cc.scaleTo(0.15, 1.5).easing(cc.easeCubicActionOut()),
        cc.fadeOut(0.15)
      );
      node.runAction(cc.sequence(explode, cc.callFunc(resolve)));
    });
  }

  static animateSelect(node: cc.Node): void {
    if (!node) return;

    node.stopAllActions();
    node.runAction(cc.scaleTo(0.15, 1.2).easing(cc.easeBackOut()));
  }

  static animateTeleport(a: cc.Node, b: cc.Node): void {
    if (!a || !b) return;
    const pulse = (node: cc.Node) =>
      node.runAction(cc.sequence(cc.scaleTo(0.1, 1.3), cc.scaleTo(0.1, 1.0)));
    pulse(a);
    pulse(b);
  }

  static startActivePulse(node: cc.Node): void {
    if (!node) return;
    node.stopAllActions();

    const pulseUp = cc.scaleTo(0.4, 1.1).easing(cc.easeSineInOut());
    const pulseDown = cc.scaleTo(0.4, 1.0).easing(cc.easeSineInOut());
    const pulse = cc.repeatForever(cc.sequence(pulseUp, pulseDown));

    node.runAction(pulse);
  }

  static stopActivePulse(node: cc.Node): void {
    if (!node) return;
    node.stopAllActions();
    node.runAction(cc.scaleTo(0.2, 1).easing(cc.easeBackOut()));
  }

  public static animateDepleted(node: cc.Node): void {
    if (!node) return;

    const fade = cc.fadeTo(0.3, 120);
    const tint = cc.tintTo(0.3, 180, 180, 180);
    node.runAction(cc.spawn(fade, tint));
  }
}
