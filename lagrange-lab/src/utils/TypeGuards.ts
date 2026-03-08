import type { PendulumState, PendulumParameters } from '../types/Pendulum';

export function isDoubleState(state: PendulumState): boolean {
  return state.theta2 !== undefined;
}

export function isDoubleParameters(params: PendulumParameters): boolean {
  return params.length2 !== undefined;
}