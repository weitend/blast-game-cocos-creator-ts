// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

// assets/scripts/animations/MoveCounterAnimator.ts

const ANIMATION_DURATION = 0.15;

export default class MoveCounterAnimator {
  public static animateDecrement(labelNode: cc.Node): void {
    if (!labelNode) return;

    labelNode.stopAllActions();

    const scaleUp = cc
      .scaleTo(ANIMATION_DURATION, 1.2)
      .easing(cc.easeCubicActionOut());
    const scaleDown = cc
      .scaleTo(ANIMATION_DURATION, 1.0)
      .easing(cc.easeBackOut());
    const fadeOut = cc.fadeTo(ANIMATION_DURATION, 150);
    const fadeIn = cc.fadeTo(ANIMATION_DURATION, 255);

    const pulse = cc.spawn(
      cc.sequence(scaleUp, scaleDown),
      cc.sequence(fadeOut, fadeIn)
    );

    labelNode.runAction(pulse);
  }

  public static animateReset(labelNode: cc.Node): void {
    if (!labelNode) return;

    labelNode.stopAllActions();
    labelNode.opacity = 0;
    labelNode.scale = 0.8;

    const appear = cc.spawn(
      cc.fadeIn(0.25),
      cc.scaleTo(0.25, 1).easing(cc.easeBackOut())
    );

    labelNode.runAction(appear);
  }
}
