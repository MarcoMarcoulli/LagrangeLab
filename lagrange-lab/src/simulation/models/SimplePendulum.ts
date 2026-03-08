import type { PendulumParameters, PendulumState } from '../../types/Pendulum';
import { computeMass1Position, buildBaseParameters, buildBaseInitialState } from './PendulumCommon';

export const buildInitialSimplePendulumState = buildBaseInitialState;
export const buildSimplePendulumParameters = buildBaseParameters;
export const computeMassPosition = computeMass1Position;

export function computeSimplePendulumDerivatives(state: PendulumState, parameters: PendulumParameters): PendulumState {
  return {
    theta1: state.omega1,
    omega1: -(parameters.gravity / parameters.length1) * Math.sin(state.theta1),
  };
}