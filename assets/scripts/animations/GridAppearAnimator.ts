// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import GridRepository from "../gameplay/GridRepository";

const DURATION = 0.35;

export default class GridAppearAnimator {
  private readonly duration: number;

  constructor(duration = 0.35) {
    this.duration = duration;
  }

  public async animateGridAppearance(grid: GridRepository): Promise<void> {
    const animations: Promise<void>[] = [];

    grid.forEachTile((x, y) => {
      const tile = grid.getTileAt(x, y);
      if (!tile) return;

      tile.opacity = 0;
      tile.scale = 0.8;

      const fadeIn = cc.fadeIn(this.duration);
      const scaleUp = cc.scaleTo(this.duration, 1).easing(cc.easeBackOut());
      const action = cc.spawn(fadeIn, scaleUp);

      const promise = new Promise<void>((resolve) => {
        tile.runAction(cc.sequence(action, cc.callFunc(resolve)));
      });

      animations.push(promise);
    });

    await Promise.all(animations);
  }
}
