import type { Point } from '../../types/Geometry';
import { drawRod, drawMass } from '../../utils/Draw/DrawUtils';

/**
 * Helper interno per disegnare la scia (Trace)
 * Evita di duplicare il codice della scia in ogni renderer
 */
function drawTrace(ctx: CanvasRenderingContext2D, trace: Point[], color: string, pointsToDraw: number): void {
  if (pointsToDraw <= 0 || trace.length < 2) return;
  const start = Math.max(0, trace.length - pointsToDraw);

  ctx.beginPath();
  ctx.strokeStyle = color; 
  ctx.lineWidth = 1.2;
  ctx.lineJoin = 'bevel';
  ctx.lineCap = 'round';

  ctx.moveTo(trace[start].x, trace[start].y);
  for (let i = start + 1; i < trace.length; i++) {
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
  fullTrace: Point[],
  massRatio: number,
  color: string,
  traceLimit: number = 30,
  opacity: number = 1.0
): void {
  // 1. Disegna la scia per prima (sta sotto al pendolo)
  drawTrace(ctx, fullTrace, color, traceLimit);

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
  fullTrace: Point[],
  color: string,
  traceLimit: number = 100,
  opacity: number = 1.0
): void {
  drawTrace(ctx, fullTrace, color, traceLimit);

  ctx.globalAlpha = opacity;
  drawRod(ctx, pivot, m1, color);
  drawMass(ctx, m1, color, true);
  ctx.globalAlpha = 1.0;
}