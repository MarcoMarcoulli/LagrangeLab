import type { PendulumState, PendulumParameters } from '../types/Pendulum';

export function isDoubleState(state: PendulumState): boolean {
  return state.length > 2;
}

export function isDoubleParameters(params: PendulumParameters): boolean {
  return params.length2 !== undefined;
}