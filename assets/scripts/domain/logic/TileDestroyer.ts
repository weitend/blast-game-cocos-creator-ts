// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import TileAnimator from "../../animations/tiles/TileAnimator";
import { Coordinates } from "../../core/types";
import GridRepository from "../../data/GridRepository";
import Tile from "../entities/Tile";

export default class TileDestroyer {
  constructor(private readonly grid: GridRepository) {}

  public async destroyTiles(coords: Coordinates[]): Promise<number> {
    let count = 0;

    await Promise.all(
      coords.map(async ({ x, y }) => {
        const node = this.grid.getTileAt(x, y);
        if (!node) return;

        const tile = node.getComponent(Tile);
        if (tile) {
          await tile.destroyTile();
        } else {
          await TileAnimator.animateDestroy(node, 0.15);
          node.destroy();
        }

        this.grid.setTileAt(x, y, null);
        count++;
      })
    );

    return count * 10; // очки
  }
}
