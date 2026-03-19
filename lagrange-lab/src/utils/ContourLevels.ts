export function buildContourLevels(
  scalarField: (theta1: number, theta2: number) => number,
  samples = 60,
  levelCount = 12
): number[] {
  let min = Infinity;
  let max = -Infinity;

  for (let i = 0; i <= samples; i++) {
    for (let j = 0; j <= samples; j++) {
      const theta1 = -Math.PI + (i / samples) * 2 * Math.PI;
      const theta2 = -Math.PI + (j / samples) * 2 * Math.PI;
      const value = scalarField(theta1, theta2);

      if (value < min) min = value;
      if (value > max) max = value;
    }
  }

  const levels: number[] = [];
  const step = (max - min) / (levelCount + 1);

  for (let k = 1; k <= levelCount; k++) {
    levels.push(min + k * step);
  }

  return levels;
}