export type PendulumState = {
  theta1: number;
  omega1: number;
  theta2?: number; 
  omega2?: number; 
};

export type PendulumParameters = {
  length1: number;
  gravity: number;
  length2?: number;   
  massRatio?: number; 
};