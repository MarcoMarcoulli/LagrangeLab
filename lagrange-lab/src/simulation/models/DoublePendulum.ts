import type { Point } from '../../types/geometry';
import type { PendulumState, PendulumParameters } from '../../types/Pendulum';
import { computeAngle, computeDistance, computePolarToCartesian } from '../../utils/GeometryUtils';
import { computeMass1Position, buildBaseParameters, buildBaseInitialState } from './PendulumCommon';

export function computeDoublePendulumDerivatives(
  state: PendulumState,
  parameters: PendulumParameters
): PendulumState
{
  const theta1 = state[0];
  const omega1 = state[1];
  const theta2 = state.length > 2 ? state[2] : 0;
  const omega2 = state.length > 2 ? state[3] : 0;

  const { length1, gravity, massRatio } = parameters;
  const length2 = parameters.length2 ?? 0;

  const m1 = 1;
  const m2 = massRatio ?? 0;
  const m1_plus_m2 = m1 + m2;

  const delta = theta1 - theta2;
  const sinDelta = Math.sin(delta);
  const cosDelta = Math.cos(delta);
  
  const omega1Sq = omega1 * omega1;
  const omega2Sq = omega2 * omega2;

  const f1 = - m2 * length2 * omega2Sq * sinDelta - m1_plus_m2 * gravity * Math.sin(theta1);
  const f2 = length1 * omega1Sq * sinDelta - gravity * Math.sin(theta2);

  const Denominator = m1 + m2 * Math.pow(sinDelta, 2);

  const denominator1 = length1 * Denominator;
  const denominator2 = length2 * Denominator;
  const numerator1 = f1 - m2 * cosDelta * f2;
  const numerator2 = m1_plus_m2 * f2 - cosDelta * f1;

  const omega1Dot = numerator1 / denominator1;
  const omega2Dot = numerator2 / denominator2

  return new Float64Array([omega1, omega1Dot, omega2, omega2Dot]);
}

export function buildInitialDoublePendulumState(pivot: Point, mass1: Point, mass2: Point): PendulumState {
  return new Float64Array([
    ...buildBaseInitialState(pivot, mass1), 
    computeAngle(mass1, mass2),             
    0                                       
  ]);
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
  const theta2 = state[2];
  return computePolarToCartesian(m1Pos, parameters.length2 ?? 0, theta2);
}

export function computeDoublePendulumPotential(
  theta1: number,
  theta2: number,
  parameters: PendulumParameters
): number
{
  const { length1, gravity, massRatio } = parameters;
  const length2 = parameters.length2 ?? 0;

  const m1 = 1;
  const m2 = massRatio ?? 0;

  return (
    -(m1 + m2) * gravity * length1 * Math.cos(theta1) -
    m2 * gravity * length2 * Math.cos(theta2)
  );
}

export function computeDoublePendulumKineticEnergy(
  state: PendulumState,
  parameters: PendulumParameters
): number
{
  const theta1 = state[0];
  const omega1 = state[1];
  const theta2 = state[2];
  const omega2 = state[3];

  const { length1, massRatio } = parameters;
  const length2 = parameters.length2 ?? 0;

  const m1 = 1;
  const m2 = massRatio ?? 0;

  return (
    0.5 * (m1 + m2) * length1 * length1 * omega1 * omega1 +
    0.5 * m2 * length2 * length2 * omega2 * omega2 +
    m2 * length1 * length2 * omega1 * omega2 * Math.cos(theta1 - theta2)
  );
}

export function computeDoublePendulumTotalEnergy(
  state: PendulumState,
  parameters: PendulumParameters
): number
{
  return (
    computeDoublePendulumKineticEnergy(state, parameters) +
    computeDoublePendulumPotential(state[0], state[2], parameters)
  );
}