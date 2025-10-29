// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

export default class EndGameScreenAnimator {
  public static show(node: cc.Node, duration: number = 0.3): void {
    if (!node) return;
    node.scale = 0.8;
    node.opacity = 0;
    node.stopAllActions();

    const action = cc.spawn(
      cc.scaleTo(duration, 1).easing(cc.easeBackOut()),
      cc.fadeIn(duration)
    );

    node.runAction(action);
  }

  public static hide(node: cc.Node, duration: number = 0.2): void {
    if (!node) return;
    node.stopAllActions();

    const action = cc.spawn(
      cc.scaleTo(duration, 0.9).easing(cc.easeIn(0.3)),
      cc.fadeOut(duration)
    );

    node.runAction(action);
  }
}
