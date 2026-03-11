import type { Point } from '../../types/geometry';
import { drawRod, drawMass } from '../../utils/DrawUtils';

export function renderDoublePendulumScene(
  ctx: CanvasRenderingContext2D,
  pivot: Point,
  mass1: Point | null,
  mass2: Point | null,
  trace: Point[] = [],
  massRatio: number,
  color: string
): void {
  if (trace.length > 1) {
    ctx.beginPath();
    ctx.strokeStyle = color; 
    ctx.lineWidth = 1;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    ctx.moveTo(trace[0].x, trace[0].y);
    for (let i = 1; i < trace.length; i++) {
      ctx.lineTo(trace[i].x, trace[i].y);
    }
    ctx.stroke();
  }

  if (!mass1) return;

  drawRod(ctx, pivot, mass1, color);
  drawMass(ctx, mass1, color);

  if (!mass2) return;

  drawRod(ctx, mass1, mass2, color);
  drawMass(ctx, mass2, color, massRatio);
}