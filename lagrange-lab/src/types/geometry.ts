export type Point = {
  x: number;
  y: number;
};

export interface Point3D extends Point {
  z: number;
}

export type Segment = {
  start: Point;
  end: Point;
};

