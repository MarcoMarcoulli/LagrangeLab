import type { Point } from '../../types/geometry';
import { drawPivot, drawRod, drawMass } from '../../utils/DrawUtils';

export function renderSimplePendulumScene(
  ctx: CanvasRenderingContext2D,
  pivot: Point,
  massPosition: Point | null,
  trace: Point[] = []
): void {

  if (trace.length > 1)
  {
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(76, 175, 80, 0.3)'; 
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    
    ctx.moveTo(trace[0].x, trace[0].y);
    for (let i = 1; i < trace.length; i++)
    {
      ctx.lineTo(trace[i].x, trace[i].y);
    }
    ctx.stroke();
  }

  drawPivot(ctx, pivot);

  if (!massPosition) return;

  drawRod(ctx, pivot, massPosition);
  drawMass(ctx, massPosition);
}