import type { Point } from '../../types/geometry';
import { drawRod, drawMass } from '../../utils/Draw/DrawUtils';

export function renderSimplePendulumScene(
  ctx: CanvasRenderingContext2D,
  pivot: Point,
  massPosition: Point | null,
  newtonTrace: Point[] = [],
  color: string
): void {

  if (newtonTrace.length > 1)
  {
    ctx.beginPath();
    ctx.strokeStyle = color; 
    ctx.lineWidth = 1;
    ctx.lineJoin = 'round';
    
    ctx.moveTo(newtonTrace[0].x, newtonTrace[0].y);
    for (let i = 1; i < newtonTrace.length; i++)
    {
      ctx.lineTo(newtonTrace[i].x, newtonTrace[i].y);
    }
    ctx.stroke();
  }

  if (!massPosition) return;

  drawRod(ctx, pivot, massPosition, color);
  drawMass(ctx, massPosition, color, true);
}