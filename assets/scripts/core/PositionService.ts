// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import GridRepository from "../gameplay/GridRepository";

export default class PositionService {
  constructor(private grid: GridRepository) {}

  public getTileWorldPosition(x: number, y: number): cc.Vec2 {
    const totalWidthPx = this.grid.width * this.grid.tileSize;
    const totalHeightPx = this.grid.height * this.grid.tileSize;
    const offsetX = totalWidthPx / 2 - this.grid.tileSize / 2;
    const offsetY = totalHeightPx / 2 - this.grid.tileSize / 2;
    return cc.v2(
      x * this.grid.tileSize - offsetX,
      y * this.grid.tileSize - offsetY
    );
  }
}
