import type { Point, Point3D } from '../types/Geometry';
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
  poincarePoints: Point[];  // Sezione quando θ1 = 0 (mostra Massa 2)
  poincarePoints2: Point[]; // Sezione quando θ2 = 0 (mostra Massa 1)
  color: string;
  isSwarm: boolean;
};
