import type { Point } from '../../types/geometry';

const BASE_RADIUS = 10;

export function drawPivot(ctx: CanvasRenderingContext2D, pivot: Point): void
{
  ctx.beginPath();
  ctx.arc(pivot.x, pivot.y, BASE_RADIUS, 0, Math.PI * 2);
  ctx.fillStyle = 'white';
  ctx.fill();
}

export function drawRod(ctx: CanvasRenderingContext2D, start: Point, end: Point, color: string = '#444'): void
{
  const angle = Math.atan2(end.y - start.y, end.x - start.x);

  const startX = start.x + Math.cos(angle) * BASE_RADIUS;
  const startY = start.y + Math.sin(angle) * BASE_RADIUS;

  const endX = end.x - Math.cos(angle) * BASE_RADIUS;
  const endY = end.y - Math.sin(angle) * BASE_RADIUS;

  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.lineTo(endX, endY);
  ctx.strokeStyle = color;
  ctx.lineWidth = 4;
  ctx.stroke();
}

export function drawMass(ctx: CanvasRenderingContext2D, position: Point, color: string, fill: boolean, massRatio = 1): void
{
  const radius = Math.sqrt(massRatio) * BASE_RADIUS;
  ctx.beginPath();
  ctx.arc(position.x, position.y, radius, 0, Math.PI * 2);

  if (fill)
  {
    ctx.fillStyle = color;
    ctx.fill();
  }
  else
  {
    ctx.strokeStyle = color;
    ctx.stroke();
  }
}