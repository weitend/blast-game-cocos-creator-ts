// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

const SWAP_DURATION = 0.25;
const SPAWN_DURATION = 0.1;
const DESTROY_DURATION = 0.25;

export default class TileAnimator {
  public static animateFall(
    node: cc.Node,
    to: cc.Vec2,
    duration = SWAP_DURATION
  ): Promise<void> {
    if (!node) return Promise.resolve();

    return new Promise((resolve) => {
      node.runAction(
        cc.sequence(
          cc.moveTo(duration, to).easing(cc.easeCubicActionOut()),
          cc.callFunc(() => resolve())
        )
      );
    });
  }

  public static animateSwap(a: cc.Node, b: cc.Node): Promise<void> {
    if (!a || !b) return Promise.resolve();

    return new Promise((resolve) => {
      const posA = a.getPosition();
      const posB = b.getPosition();

      const jumpUp = cc.scaleTo(0.1, 1.1).easing(cc.easeSineOut());
      const jumpDown = cc.scaleTo(0.1, 1.0).easing(cc.easeSineIn());

      const moveA = cc
        .moveTo(SWAP_DURATION, posB)
        .easing(cc.easeCubicActionOut());
      const moveB = cc
        .moveTo(SWAP_DURATION, posA)
        .easing(cc.easeCubicActionOut());

      const sequenceA = cc.sequence(jumpUp, moveA, jumpDown);
      const sequenceB = cc.sequence(jumpUp.clone(), moveB, jumpDown.clone());

      a.runAction(sequenceA);
      b.runAction(sequenceB);

      a.runAction(
        cc.sequence(
          cc.delayTime(SWAP_DURATION + 0.1),
          cc.callFunc(() => resolve())
        )
      );
    });
  }

  public static animateDestroy(
    tileNode: cc.Node,
    duration = DESTROY_DURATION
  ): Promise<void> {
    return new Promise((resolve) => {
      const fade = cc.fadeOut(duration);
      const scale = cc.scaleTo(duration, 0).easing(cc.easeBackIn());
      const rotate = cc.rotateBy(
        duration,
        Math.random() * 360 * (Math.random() > 0.5 ? 1 : -1)
      );
      const action = cc.spawn(fade, scale, rotate);

      tileNode.runAction(cc.sequence(action, cc.callFunc(resolve)));
    });
  }

  public static animateSpecialTileCreate(node: cc.Node): Promise<void> {
    if (!node) return Promise.resolve();

    return new Promise((resolve) => {
      node.scale = 0.8;
      node.opacity = 0;

      const fade = cc.fadeIn(0.18);
      const scale = cc.scaleTo(0.18, 1).easing(cc.easeBackOut());

      const action = cc.spawn(fade, scale);

      node.runAction(cc.sequence(action, cc.callFunc(resolve)));
    });
  }

  public static animateSpawn(
    node: cc.Node,
    target: cc.Vec2,
    duration = SPAWN_DURATION
  ): Promise<void> {
    if (!node) return Promise.resolve();
    return new Promise((resolve) => {
      node.opacity = 0;
      node.scale = 0.8;

      const fade = cc.fadeIn(duration);
      const move = cc.moveTo(duration, target).easing(cc.easeCubicActionOut());
      const scale = cc.scaleTo(duration, 1).easing(cc.easeBackOut());

      const action = cc.spawn(fade, move, scale);

      node.runAction(cc.sequence(action, cc.callFunc(resolve)));
    });
  }
}
