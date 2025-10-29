// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

const DURATION = 0.15;

export default class ScoreAnimator {
  public static animateScoreChange(
    labelNode: cc.Node,
    prev: number,
    next: number
  ): void {
    if (!labelNode) return;

    labelNode.stopAllActions();

    const scaleUp = cc.scaleTo(DURATION, 1.25).easing(cc.easeCubicActionOut());
    const scaleDown = cc.scaleTo(DURATION, 1.0).easing(cc.easeBackOut());
    const pulse = cc.sequence(scaleUp, scaleDown);

    const colorFlash =
      next > prev
        ? cc.tintTo(DURATION, 0, 255, 120)
        : cc.tintTo(DURATION, 255, 255, 255);

    const restoreColor = cc.tintTo(DURATION, 255, 255, 255);

    labelNode.runAction(cc.sequence(cc.spawn(pulse, colorFlash), restoreColor));
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
