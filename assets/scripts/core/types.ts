export type GameState = "playing" | "victory" | "defeat";

export type Tiles = (cc.Node | null)[][];

export interface Coordinates {
  x: number;
  y: number;
}

export enum TileSpecialType {
  None,
  Bomb,
  RowRocket,
  ColRocket,
  SuperBomb,
}

export enum BoosterType {
  Bomb,
  Teleport,
}
