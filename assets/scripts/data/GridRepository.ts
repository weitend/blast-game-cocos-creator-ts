// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html
import type { Tiles } from "../core/types";

export default class GridRepository {
  public readonly width: number;
  public readonly height: number;
  public readonly tileSize: number;
  public readonly tileTypesCount: number;
  private readonly tiles: Tiles = [];

  constructor(
    width: number,
    height: number,
    tileSize: number,
    tileTypesCount: number
  ) {
    this.width = width;
    this.height = height;
    this.tileSize = tileSize;
    this.tileTypesCount = tileTypesCount;

    this.tiles = Array.from({ length: height }, () =>
      Array<cc.Node | null>(width).fill(null)
    );
  }

  getTileAt(x: number, y: number): cc.Node | null {
    return this.tiles?.[y]?.[x] || null;
  }

  setTileAt(x: number, y: number, tile: cc.Node | null): void {
    if (!this.isCoordinatesInsideGrid(x, y)) return;

    this.tiles[y][x] = tile;
  }

  public forEachTile(callback: (x: number, y: number) => void): void {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        callback(x, y);
      }
    }
  }

  public someTile(predicate: (x: number, y: number) => boolean): boolean {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (predicate(x, y)) return true;
      }
    }
    return false;
  }

  public isCoordinatesInsideGrid(x: number, y: number): boolean {
    return x >= 0 && y >= 0 && x < this.width && y < this.height;
  }
}
