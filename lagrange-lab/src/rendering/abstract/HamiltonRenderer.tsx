import type { Point } from '../../types/geometry';

const TWO_PI = 2 * Math.PI;

export function wrapAngle(angle: number): number {
  return ((angle + Math.PI) % TWO_PI + TWO_PI) % TWO_PI - Math.PI;
}

export function mapPhaseToCanvas(
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

export function drawPhaseAxes(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  omegaMax: number
): void {
  ctx.strokeStyle = '#f4efefff';
  ctx.lineWidth = 1;

  ctx.beginPath();
  ctx.moveTo(0, height / 2);
  ctx.lineTo(width, height / 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(width / 2, 0);
  ctx.lineTo(width / 2, height);
  ctx.stroke();

  ctx.fillStyle = '#f6f3f3ff';
  ctx.font = '14px sans-serif';
  ctx.fillText('-π', 8, height / 2 - 8);
  ctx.fillText('0', width / 2 + 6, height / 2 - 8);
  ctx.fillText('π', width - 18, height / 2 - 8);

  ctx.fillText(`ω max = ${omegaMax.toFixed(1)}`, 10, 20);
  ctx.fillText('θ', width - 20, height / 2 + 15);
  ctx.fillText('ω', width / 2 + 8, 16);
}

export function renderHamiltonScene(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  hamiltonTrace: Point[],
  currentPhasePoint: Point,
  color: string,
  omegaMax: number,
  isMass2: boolean = false
): void {
  if (hamiltonTrace.length > 1) {
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = isMass2 ? 2 : 1;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    let prevPoint = mapPhaseToCanvas(
      wrapAngle(hamiltonTrace[0].x),
      hamiltonTrace[0].y,
      width,
      height,
      omegaMax
    );
    ctx.moveTo(prevPoint.x, prevPoint.y);

    for (let i = 1; i < hamiltonTrace.length; i++) {
      const p = mapPhaseToCanvas(
        wrapAngle(hamiltonTrace[i].x),
        hamiltonTrace[i].y,
        width,
        height,
        omegaMax
      );

      if (Math.abs(p.x - prevPoint.x) > width / 2) {
        ctx.moveTo(p.x, p.y);
      } else {
        ctx.lineTo(p.x, p.y);
      }
      
      prevPoint = p;
    }

    ctx.stroke();
  }

  const current = mapPhaseToCanvas(
    wrapAngle(currentPhasePoint.x),
    currentPhasePoint.y,
    width,
    height,
    omegaMax
  );

  ctx.beginPath();
  ctx.arc(current.x, current.y, 6, 0, 2 * Math.PI);
  
  if(isMass2)
  {
    ctx.fillStyle = color;
    ctx.fill(); 
  }
  else
  {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke(); 
  }
}