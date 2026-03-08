import type { Point } from '../../types/geometry';
import type { PendulumParameters, PendulumState } from '../../types/Pendulum';
import { computeAngle, computeDistance, computePolarToCartesian } from '../../utils/GeometryUtils';
import { SCALED_GRAVITY } from '../../utils/PhysicsConstants';

export function computeMass1Position(
  pivot: Point, 
  state: PendulumState, 
  parameters: PendulumParameters
): Point {
  return computePolarToCartesian(pivot, parameters.length1, state.theta1);
}

export function buildBaseParameters(pivot: Point, mass1: Point, gravity = SCALED_GRAVITY) {
  return {
    length1: computeDistance(pivot, mass1),
    gravity,
  };
}

export function buildBaseInitialState(pivot: Point, mass1: Point) {
  return {
    theta1: computeAngle(pivot, mass1),
    omega1: 0,
  };
}