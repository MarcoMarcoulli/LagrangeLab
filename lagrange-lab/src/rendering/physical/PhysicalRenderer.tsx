import type { Point } from '../../types/Geometry';
import { drawRod, drawMass } from '../../utils/Draw/DrawUtils';

/**
 * Helper interno per disegnare la scia (Trace)
 * Evita di duplicare il codice della scia in ogni renderer
 */
function drawTrace(ctx: CanvasRenderingContext2D, trace: Point[], color: string): void {
  if (trace.length < 2) return;

  ctx.beginPath();
  // Usiamo rgba per supportare l'opacità della scia
  ctx.strokeStyle = color; 
  ctx.lineWidth = 1.5;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  ctx.moveTo(trace[0].x, trace[0].y);
  for (let i = 1; i < trace.length; i++) {
    ctx.lineTo(trace[i].x, trace[i].y);
  }
  ctx.stroke();
  ctx.globalAlpha = 1.0; // Reset
}

export function renderDoublePendulumScene(
  ctx: CanvasRenderingContext2D,
  pivot: Point,
  m1: Point,
  m2: Point,
  trace: Point[],
  massRatio: number,
  color: string,
  opacity: number = 1.0 // Default a 1 per Newton
): void {
  // 1. Disegna la scia per prima (sta sotto al pendolo)
  drawTrace(ctx, trace, color); // Scia un po' più chiara del pendolo

  // 2. Imposta l'opacità per i componenti fisici
  ctx.globalAlpha = opacity;

  drawRod(ctx, pivot, m1, color);
  drawMass(ctx, m1, color, false);

  drawRod(ctx, m1, m2, color);
  drawMass(ctx, m2, color, true, massRatio);

  ctx.globalAlpha = 1.0; // Reset
}

export function renderSimplePendulumScene(
  ctx: CanvasRenderingContext2D,
  pivot: Point,
  m1: Point,
  trace: Point[],
  color: string,
  opacity: number = 1.0
): void {
  drawTrace(ctx, trace, color);

  ctx.globalAlpha = opacity;
  drawRod(ctx, pivot, m1, color);
  drawMass(ctx, m1, color, true);
  ctx.globalAlpha = 1.0;
}