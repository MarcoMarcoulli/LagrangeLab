import type { Point } from '../types/geometry';
import type { PendulumState, PendulumParameters } from '../types/Pendulum';

export type PendulumSimulationItem = {
  id: string;
  pivot: Point;
  state: PendulumState;
  parameters: PendulumParameters;
  trace: Point[];
  phaseTrace: Point[];
  configurationTrace: Point[];
  color: string;
};
