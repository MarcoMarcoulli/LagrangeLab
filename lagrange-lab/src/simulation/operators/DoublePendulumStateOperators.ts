import type { PendulumState } from '../../types/Pendulum';

export function addDoublePendulumStates(
  a: PendulumState,
  b: PendulumState
): PendulumState {
  return {
    theta1: a.theta1 + b.theta1,
    omega1: a.omega1 + b.omega1,
    theta2: (a.theta2 ?? 0) + (b.theta2 ?? 0),
    omega2: (a.omega2 ?? 0) + (b.omega2 ?? 0),
  };
}

export function scaleDoublePendulumState(
  state: PendulumState,
  scalar: number
): PendulumState {
  return {
    theta1: state.theta1 * scalar,
    omega1: state.omega1 * scalar,
    theta2: (state.theta2 ?? 0) * scalar,
    omega2: (state.omega2 ?? 0) * scalar,
  };
}