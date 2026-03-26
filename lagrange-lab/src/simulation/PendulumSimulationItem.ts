import type { Point, Point3D } from '../types/geometry';
import type { PendulumState, PendulumParameters } from '../types/Pendulum';

export type PendulumSimulationItem = {
  id: string;
  pivot: Point;
  state: PendulumState;
  parameters: PendulumParameters;
  newtonTrace: Point[];
  lagrangeTrace: Point[];
  hamiltonTrace: Point[];
  hamiltonTrace2?: Point[];
  jacobiTrace: Point3D[];
  color: string;
};
