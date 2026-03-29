import type { Point } from '../../types/Geometry';

const TWO_PI = 2 * Math.PI;

export function wrapAngle(angle: number): number {
  return ((angle + Math.PI) % TWO_PI + TWO_PI) % TWO_PI - Math.PI;
}

export function mapPoincareToCanvas(
  theta: number,
  omega: number,
  width: number,
  height: number,
  omegaMax: number
): Point {
  return {
    x: ((theta + Math.PI) / (2 * Math.PI)) * width,
    y: height / 2 - (omega / omegaMax) * (height / 2),
  };
}

export function drawPoincareAxes(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  omegaMax: number,
  viewMass: 1 | 2
): void {
  ctx.strokeStyle = '#f4efefff';
  ctx.lineWidth = 1;

  // Asse X (Theta 2)
  ctx.beginPath();
  ctx.moveTo(0, height / 2);
  ctx.lineTo(width, height / 2);
  ctx.stroke();

  // Asse Y (Omega 2)
  ctx.beginPath();
  ctx.moveTo(width / 2, 0);
  ctx.lineTo(width / 2, height);
  ctx.stroke();

  // Etichette
  ctx.fillStyle = '#f6f3f3ff';
  ctx.font = '14px sans-serif';
  ctx.fillText('-π', 8, height / 2 - 8);
  ctx.fillText('0', width / 2 + 6, height / 2 - 8);
  ctx.fillText('π', width - 18, height / 2 - 8);

  ctx.fillText(`ω max = ${omegaMax.toFixed(1)}`, 10, 20);
  
  // Nelle sezioni di Poincaré del doppio pendolo si tracciano le coordinate della massa 2
  ctx.fillText(viewMass === 2 ? 'θ₂' : 'θ₁', width - 20, height / 2 + 15);
  ctx.fillText(viewMass === 2 ? 'ω₂' : 'ω₁', width / 2 + 8, 16);
}

export function renderPoincareScene(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  poincarePoints: Point[],
  color: string,
  omegaMax: number
): void {
  if (!poincarePoints || poincarePoints.length === 0) return;

  // Impostiamo il colore per tutti i punti di questo pendolo
  ctx.fillStyle = color;

  // Disegniamo i punti storici della sezione di Poincaré
  for (let i = 0; i < poincarePoints.length; i++) {
    const p = mapPoincareToCanvas(
      wrapAngle(poincarePoints[i].x), // x è theta2
      poincarePoints[i].y,            // y è omega2
      width,
      height,
      omegaMax
    );

    ctx.beginPath();
    ctx.arc(p.x, p.y, 3, 0, TWO_PI);
    ctx.fill();
  }
  
  // (Opzionale) Possiamo evidenziare l'ULTIMO punto calcolato facendolo un po' più grande
  // per dare una sensazione di "progresso" durante la simulazione
  const lastPointIndex = poincarePoints.length - 1;
  const lastP = mapPoincareToCanvas(
    wrapAngle(poincarePoints[lastPointIndex].x),
    poincarePoints[lastPointIndex].y,
    width,
    height,
    omegaMax
  );
  
  ctx.beginPath();
  ctx.arc(lastP.x, lastP.y, 4, 0, TWO_PI); 
  ctx.fillStyle = '#ffffff'; 
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.stroke();
}