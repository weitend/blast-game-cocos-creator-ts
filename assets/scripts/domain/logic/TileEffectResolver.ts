// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import { Coordinates, TileSpecialType } from "../../core/types";
import GridRepository from "../../data/GridRepository";

export default class TileEffectResolver {
  constructor(private readonly grid: GridRepository) {}

  public resolve(type: TileSpecialType, origin: Coordinates): Coordinates[] {
    const { x, y } = origin;
    const result: Coordinates[] = [];

    switch (type) {
      case TileSpecialType.Bomb:
        this.collectRadius(x, y, 1, result);
        break;
      case TileSpecialType.RowRocket:
        for (let cx = 0; cx < this.grid.width; cx++) result.push({ x: cx, y });
        break;
      case TileSpecialType.ColRocket:
        for (let cy = 0; cy < this.grid.height; cy++) result.push({ x, y: cy });
        break;
      case TileSpecialType.SuperBomb:
        this.grid.forEachTile((cx, cy) => result.push({ x: cx, y: cy }));
        break;
    }

    return result;
  }

  private collectRadius(
    x: number,
    y: number,
    r: number,
    out: Coordinates[]
  ): void {
    for (let dx = -r; dx <= r; dx++) {
      for (let dy = -r; dy <= r; dy++) {
        const cx = x + dx,
          cy = y + dy;
        if (this.grid.isCoordinatesInsideGrid(cx, cy))
          out.push({ x: cx, y: cy });
      }
    }
  }
}
