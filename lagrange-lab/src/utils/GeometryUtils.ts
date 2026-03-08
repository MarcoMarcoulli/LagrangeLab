import type { Point } from "../types/geometry"

export function computeDistance(p1: Point, p2: Point): number
{
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.hypot(dx, dy);
}

export function computeAngle(start: Point, end: Point): number
{
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  return Math.atan2(dx, dy);
}

export function computePolarToCartesian(pivot: Point, length: number, angle: number): Point {
  return {
    x: pivot.x + length * Math.sin(angle),
    y: pivot.y + length * Math.cos(angle),
  };
}