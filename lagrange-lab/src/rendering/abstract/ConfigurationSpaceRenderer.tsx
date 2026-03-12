import type { Point } from '../../types/geometry';

const TWO_PI = 2 * Math.PI;

export function wrapAngle(angle: number): number {
  return ((angle + Math.PI) % TWO_PI + TWO_PI) % TWO_PI - Math.PI;
}

export function mapConfigurationToCanvas(
  theta1: number,
  theta2: number,
  width: number,
  height: number
): Point {
  return {
    x: ((theta1 + Math.PI) / TWO_PI) * width,
    y: height - ((theta2 + Math.PI) / TWO_PI) * height,
  };
}

export function drawConfigurationAxes(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): void {
  ctx.strokeStyle = '#888';
  ctx.lineWidth = 1;

  ctx.beginPath();
  ctx.moveTo(0, height / 2);
  ctx.lineTo(width, height / 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(width / 2, 0);
  ctx.lineTo(width / 2, height);
  ctx.stroke();

  ctx.fillStyle = '#444';
  ctx.font = '14px sans-serif';

  ctx.fillText('-π', 8, height / 2 - 8);
  ctx.fillText('0', width / 2 + 6, height / 2 - 8);
  ctx.fillText('π', width - 18, height / 2 - 8);

  ctx.fillText('-π', width / 2 + 8, height - 8);
  ctx.fillText('π', width / 2 + 8, 16);

  ctx.fillText('θ₁', width - 24, height / 2 + 16);
  ctx.fillText('θ₂', width / 2 + 8, 16);
}

export function renderConfigurationSpaceScene(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  configurationTrace: Point[],
  currentConfigurationPoint: Point,
  color: string
): void {
  if (configurationTrace.length > 1) {
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    const first = mapConfigurationToCanvas(
      wrapAngle(configurationTrace[0].x),
      wrapAngle(configurationTrace[0].y),
      width,
      height
    );
    ctx.moveTo(first.x, first.y);

    for (let i = 1; i < configurationTrace.length; i++)
    {
        const prev = configurationTrace[i - 1];
        const curr = configurationTrace[i];

        const prevWrappedX = wrapAngle(prev.x);
        const prevWrappedY = wrapAngle(prev.y);
        const currWrappedX = wrapAngle(curr.x);
        const currWrappedY = wrapAngle(curr.y);

        const dx = Math.abs(currWrappedX - prevWrappedX);
        const dy = Math.abs(currWrappedY - prevWrappedY);

        const p = mapConfigurationToCanvas(
            currWrappedX,
            currWrappedY,
            width,
            height
        );

        if (dx > Math.PI || dy > Math.PI) {
            ctx.moveTo(p.x, p.y);
        } else {
            ctx.lineTo(p.x, p.y);
        }
        }

    ctx.stroke();
  }

  const current = mapConfigurationToCanvas(
    wrapAngle(currentConfigurationPoint.x),
    wrapAngle(currentConfigurationPoint.y),
    width,
    height
  );

  ctx.beginPath();
  ctx.fillStyle = color;
  ctx.arc(current.x, current.y, 6, 0, TWO_PI);
  ctx.fill();
}