import type { Point } from '../../types/geometry';
import type { PendulumState, PendulumParameters } from '../../types/Pendulum';
import { computeAngle, computeDistance, computePolarToCartesian } from '../../utils/GeometryUtils';
import { computeMass1Position, buildBaseParameters, buildBaseInitialState } from './PendulumCommon';

export function computeDoublePendulumDerivatives(
  state: PendulumState,
  parameters: PendulumParameters
): PendulumState
{
  const { theta1, omega1} = state;
  const theta2 = state.theta2 ?? 0;
  const omega2 = state.omega2 ?? 0;
  const { length1, gravity, massRatio } = parameters;
  const length2 = parameters.length2 ?? 0;

  const m1 = 1;
  const m2 = massRatio ?? 0;

  const delta = theta1 - theta2;

  const denominator1 =
    length1 * (2 * m1 + m2 - m2 * Math.cos(2 * theta1 - 2 * theta2));

  const denominator2 =
    length2 * (2 * m1 + m2 - m2 * Math.cos(2 * theta1 - 2 * theta2));

  const omega1Dot =
    (-gravity * (2 * m1 + m2) * Math.sin(theta1) -
      m2 * gravity * Math.sin(theta1 - 2 * theta2) -
      2 *
        Math.sin(delta) *
        m2 *
        (omega2 * omega2 * length2 + omega1 * omega1 * length1 * Math.cos(delta))) / denominator1;

  const omega2Dot =
    (2 *
      Math.sin(delta) *
      (omega1 * omega1 * length1 * (m1 + m2) +
        gravity * (m1 + m2) * Math.cos(theta1) +
        omega2 * omega2 * length2 * m2 * Math.cos(delta))) /
    denominator2;

  return {
    theta1: omega1,
    omega1: omega1Dot,
    theta2: omega2,
    omega2: omega2Dot,
  };
}

export function buildInitialDoublePendulumState(pivot: Point, mass1: Point, mass2: Point): PendulumState {
  return {
    ...buildBaseInitialState(pivot, mass1),
    theta2: computeAngle(mass1, mass2),
    omega2: 0,
  };
}

export function buildDoublePendulumParameters(pivot: Point, mass1: Point, mass2: Point, massRatio = 1): PendulumParameters {
  return {
    ...buildBaseParameters(pivot, mass1),
    length2: computeDistance(mass1, mass2),
    massRatio,
  };
}

export function computeMass2Position(pivot: Point, state: PendulumState, parameters: PendulumParameters): Point {
  const m1Pos = computeMass1Position(pivot, state, parameters);
  return computePolarToCartesian(m1Pos, parameters.length2 ?? 0, state.theta2 ?? 0);
}