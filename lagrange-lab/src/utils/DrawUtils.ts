import type { Point } from '../types/geometry';

export function drawPivot(ctx: CanvasRenderingContext2D, pivot: Point): void
{
  ctx.beginPath();
  ctx.arc(pivot.x, pivot.y, 6, 0, Math.PI * 2);
  ctx.fillStyle = 'white';
  ctx.fill();
}

export function drawRod(ctx: CanvasRenderingContext2D, start: Point, end: Point, color: string = '#444'): void
{
  ctx.beginPath();
  ctx.moveTo(start.x, start.y);
  ctx.lineTo(end.x, end.y);
  ctx.strokeStyle = color;
  ctx.lineWidth = 4;
  ctx.stroke();
}

const BASE_RADIUS = 10;

export function drawMass(ctx: CanvasRenderingContext2D, position: Point, color: string = '#444', massRatio = 1, ): void
{
  const radius = Math.sqrt(massRatio) * BASE_RADIUS;
  ctx.beginPath();
  ctx.arc(position.x, position.y, radius, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.stroke();
}