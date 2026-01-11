export enum CellType {
  STREET = 0,
  BUILDING_LOW = 1,
  BUILDING_HIGH = 2,
  PARK = 3,
}

export interface Point {
  x: number;
  y: number;
}

export interface Tower {
  id: string;
  x: number;
  y: number;
  range: number;
}

export type Grid = CellType[][];

export interface GameState {
  grid: Grid;
  towers: Tower[];
  coverage: boolean[][]; // mirrors grid, true if lit
  score: number; // percentage
  maxTowers: number;
}
