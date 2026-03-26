import type { Point } from '../../types/geometry';
import { drawRod, drawMass } from '../../utils/Draw/DrawUtils';

export function renderDoublePendulumScene(
  ctx: CanvasRenderingContext2D,
  pivot: Point,
  mass1: Point | null,
  mass2: Point | null,
  newtonTrace: Point[] = [],
  massRatio: number,
  color: string
): void {
  if (newtonTrace.length > 1) {
    ctx.beginPath();
    ctx.strokeStyle = color; 
    ctx.lineWidth = 1;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    ctx.moveTo(newtonTrace[0].x, newtonTrace[0].y);
    for (let i = 1; i < newtonTrace.length; i++)
    {
      ctx.lineTo(newtonTrace[i].x, newtonTrace[i].y);
    }
    ctx.stroke();
  }

  if (!mass1) return;

  drawRod(ctx, pivot, mass1, color);
  drawMass(ctx, mass1, color, false);

  if (!mass2) return;

  drawRod(ctx, mass1, mass2, color);
  drawMass(ctx, mass2, color, true, massRatio);
}