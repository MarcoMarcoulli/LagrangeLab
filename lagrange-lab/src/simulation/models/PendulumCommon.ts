import type { Point } from '../../types/Geometry';
import type { PendulumParameters, PendulumState } from '../../types/Pendulum';
import { computeAngle, computeDistance, computePolarToCartesian } from '../../utils/Math/GeometryUtils';
import { SCALED_GRAVITY } from '../../utils/Math/PhysicsConstants';

export function computeMass1Position(
  pivot: Point, 
  state: PendulumState, 
  parameters: PendulumParameters
): Point {
  const theta1 = state[0];
  return computePolarToCartesian(pivot, parameters.length1, theta1);
}

export function buildBaseParameters(pivot: Point, mass1: Point, gravity = SCALED_GRAVITY) {
  return {
    length1: computeDistance(pivot, mass1),
    gravity,
  };
}

export function buildBaseInitialState(pivot: Point, mass1: Point) {
  return new Float64Array([
    computeAngle(pivot, mass1),
    0 
  ]);
}