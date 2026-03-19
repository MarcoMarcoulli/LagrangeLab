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
  ctx.strokeStyle = '#ffffffff';
  ctx.lineWidth = 1;

  ctx.beginPath();
  ctx.moveTo(0, height / 2);
  ctx.lineTo(width, height / 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(width / 2, 0);
  ctx.lineTo(width / 2, height);
  ctx.stroke();

  ctx.fillStyle = '#f8f4f4ff';
  ctx.font = '14px sans-serif';

  ctx.fillText('-π', 8, height / 2 - 8);
  ctx.fillText('0', width / 2 + 6, height / 2 - 8);
  ctx.fillText('π', width - 18, height / 2 - 8);

  ctx.fillText('-π', width / 2 + 8, height - 8);
  ctx.fillText('π', width / 2 + 8, 16);

  ctx.fillText('θ₁', width - 24, height / 2 + 16);
  ctx.fillText('θ₂', width / 2 - 10, 16);
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

type ScalarFieldFunction = (theta1: number, theta2: number) => number;

type ContourSegment = {
  start: Point;
  end: Point;
};

export function buildContourSegments(
  scalarField: ScalarFieldFunction,
  levels: number[],
  resolution = 50
): ContourSegment[] {
  const thetaStep = TWO_PI / resolution;
  const segments: ContourSegment[] = [];

  for (const level of levels) {
    for (let i = 0; i < resolution; i++) {
      for (let j = 0; j < resolution; j++) {
        const theta1a = -Math.PI + i * thetaStep;
        const theta1b = theta1a + thetaStep;
        const theta2a = -Math.PI + j * thetaStep;
        const theta2b = theta2a + thetaStep;

        const v00 = scalarField(theta1a, theta2a);
        const v10 = scalarField(theta1b, theta2a);
        const v11 = scalarField(theta1b, theta2b);
        const v01 = scalarField(theta1a, theta2b);

        const points: Point[] = [];

        if ((v00 - level) * (v10 - level) < 0) {
          const t = (level - v00) / (v10 - v00);
          points.push({ x: theta1a + t * (theta1b - theta1a), y: theta2a });
        }

        if ((v10 - level) * (v11 - level) < 0) {
          const t = (level - v10) / (v11 - v10);
          points.push({ x: theta1b, y: theta2a + t * (theta2b - theta2a) });
        }

        if ((v11 - level) * (v01 - level) < 0) {
          const t = (level - v11) / (v01 - v11);
          points.push({ x: theta1b + t * (theta1a - theta1b), y: theta2b });
        }

        if ((v01 - level) * (v00 - level) < 0) {
          const t = (level - v01) / (v00 - v01);
          points.push({ x: theta1a, y: theta2b + t * (theta2a - theta2b) });
        }

        if (points.length === 2) {
          segments.push({
            start: points[0],
            end: points[1],
          });
        }
      }
    }
  }

  return segments;
}

export function drawContourSegments(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  segments: ContourSegment[]
): void {
  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,0.25)';
  ctx.lineWidth = 1;
  ctx.beginPath();

  for (const segment of segments) {
    const start = mapConfigurationToCanvas(segment.start.x, segment.start.y, width, height);
    const end = mapConfigurationToCanvas(segment.end.x, segment.end.y, width, height);

    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
  }

  ctx.stroke();
  ctx.restore();
}