import type { Point } from '../types/geometry';

export function drawPivot(ctx: CanvasRenderingContext2D, pivot: Point): void
{
  ctx.beginPath();
  ctx.arc(pivot.x, pivot.y, 6, 0, Math.PI * 2);
  ctx.fillStyle = 'black';
  ctx.fill();
}

export function drawRod(ctx: CanvasRenderingContext2D, start: Point, end: Point): void
{
  ctx.beginPath();
  ctx.moveTo(start.x, start.y);
  ctx.lineTo(end.x, end.y);
  ctx.strokeStyle = 'black';
  ctx.lineWidth = 2;
  ctx.stroke();
}

const BASE_RADIUS = 10;

export function drawMass(ctx: CanvasRenderingContext2D, position: Point, massRatio = 1): void
{
  const radius = Math.sqrt(massRatio) * BASE_RADIUS;
  ctx.beginPath();
  ctx.arc(position.x, position.y, radius, 0, Math.PI * 2);
  ctx.fillStyle = '#333';
  ctx.fill();

  // light reflex to give the idea of 3D
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  ctx.beginPath();
  ctx.arc(position.x - radius/3, position.y - radius/3, radius/4, 0, Math.PI * 2);
  ctx.fill();
}