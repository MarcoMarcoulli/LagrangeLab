import type { PendulumState } from '../../types/Pendulum';

export function addSimplePendulumStates(
  a: PendulumState,
  b: PendulumState
): PendulumState {
  return {
    theta1: a.theta1 + b.theta1,
    omega1: a.omega1 + b.omega1,
  };
}

export function scaleSimplePendulumState(
  state: PendulumState,
  scalar: number
): PendulumState {
  return {
    theta1: state.theta1 * scalar,
    omega1: state.omega1 * scalar,
  };
}