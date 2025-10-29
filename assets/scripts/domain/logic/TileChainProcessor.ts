// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import TileEffectResolver from "./TileEffectResolver";
import TileDestroyer from "./TileDestroyer";
import GridRepository from "../../data/GridRepository";
import { Coordinates } from "../../core/types";
import Tile from "../entities/Tile";

export default class TileChainProcessor {
  constructor(
    private readonly grid: GridRepository,
    private readonly resolver: TileEffectResolver,
    private readonly destroyer: TileDestroyer
  ) {}

  public async processChain(initialTargets: Coordinates[]): Promise<number> {
    const processed = new Set<string>();
    const queue: Coordinates[] = [...initialTargets];
    const toDestroy: Coordinates[] = [];

    while (queue.length > 0) {
      const current = queue.shift()!;
      const key = `${current.x}_${current.y}`;
      if (processed.has(key)) continue;
      processed.add(key);

      const node = this.grid.getTileAt(current.x, current.y);
      if (!node) continue;

      const tile = node.getComponent(Tile);
      if (!tile) continue;

      toDestroy.push(current);

      if (tile.isSpecial()) {
        const extraTargets = this.resolver.resolve(
          tile.getSpecialType(),
          current
        );
        for (const t of extraTargets) {
          const tk = `${t.x}_${t.y}`;
          if (!processed.has(tk)) queue.push(t);
        }
      }
    }

    const points = await this.destroyer.destroyTiles(toDestroy);
    return points;
  }
}
