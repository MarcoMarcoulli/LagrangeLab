// Usage of Float64Array for maximum performance
// Indexes :
// 0: theta1
// 1: omega1
// 2: theta2
// 3: omega2
export type PendulumState = Float64Array;

export type PendulumParameters = {
  length1: number;
  gravity: number;
  length2?: number;
  massRatio?: number;
};