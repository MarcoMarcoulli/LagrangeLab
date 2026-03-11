import type { Point } from '../../types/geometry';
import { drawRod, drawMass } from '../../utils/DrawUtils';

export function renderSimplePendulumScene(
  ctx: CanvasRenderingContext2D,
  pivot: Point,
  massPosition: Point | null,
  trace: Point[] = [],
  color: string
): void {

  if (trace.length > 1)
  {
    ctx.beginPath();
    ctx.strokeStyle = color; 
    ctx.lineWidth = 1;
    ctx.lineJoin = 'round';
    
    ctx.moveTo(trace[0].x, trace[0].y);
    for (let i = 1; i < trace.length; i++)
    {
      ctx.lineTo(trace[i].x, trace[i].y);
    }
    ctx.stroke();
  }

  if (!massPosition) return;

  drawRod(ctx, pivot, massPosition, color);
  drawMass(ctx, massPosition, color);
}