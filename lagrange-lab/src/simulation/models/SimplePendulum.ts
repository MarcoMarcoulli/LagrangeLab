import type { PendulumParameters, PendulumState } from '../../types/Pendulum';
import { computeMass1Position, buildBaseParameters, buildBaseInitialState } from './PendulumCommon';

export const buildInitialSimplePendulumState = buildBaseInitialState;
export const buildSimplePendulumParameters = buildBaseParameters;
export const computeMassPosition = computeMass1Position;

export function computeSimplePendulumDerivatives(state: PendulumState, parameters: PendulumParameters): PendulumState
{
  const theta1 = state[0];
  const omega1 = state[1];

  const { gravity, length1 } = parameters;

  const omega1Dot = -(gravity / length1) * Math.sin(theta1);
  
  return new Float64Array([omega1, omega1Dot]);
}