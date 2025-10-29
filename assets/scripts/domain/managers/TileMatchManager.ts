// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import { Coordinates } from "../../core/types";
import GridRepository from "../../data/GridRepository";
import Tile from "../entities/Tile";

export default class TileMatchManager {
  constructor(private readonly grid: GridRepository) {}

  findConnectedTiles(x: number, y: number, type: number): Coordinates[] {
    const visited = new Set<string>();
    const stack = [{ x, y }];
    const connected: Coordinates[] = [];

    const dirs = [
      { dx: 1, dy: 0 },
      { dx: -1, dy: 0 },
      { dx: 0, dy: 1 },
      { dx: 0, dy: -1 },
    ];

    while (stack.length) {
      const current = stack.pop();
      if (!current) continue;

      const key = `${current.x}_${current.y}`;
      if (visited.has(key)) continue;
      visited.add(key);

      const tileNode = this.grid.getTileAt(current.x, current.y);
      const tileComp = tileNode?.getComponent(Tile);
      if (!tileComp || tileComp.getTileType() !== type) continue;

      connected.push(current);

      for (const { dx, dy } of dirs) {
        const nx = current.x + dx;
        const ny = current.y + dy;
        if (
          nx >= 0 &&
          nx < this.grid.width &&
          ny >= 0 &&
          ny < this.grid.height
        ) {
          stack.push({ x: nx, y: ny });
        }
      }
    }

    return connected;
  }
}
