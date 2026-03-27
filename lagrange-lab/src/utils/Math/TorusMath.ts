import * as THREE from 'three';

export const TORUS_R = 2.5; 
export const TORUS_r = 1.0; 

export function getTorusPoint(theta1: number, theta2: number, offset: number = 0): THREE.Vector3 {
  const x = (TORUS_R + (TORUS_r + offset) * Math.cos(theta2)) * Math.cos(theta1);
  const y = (TORUS_R + (TORUS_r + offset) * Math.cos(theta2)) * Math.sin(theta1);
  const z = (TORUS_r + offset) * Math.sin(theta2);
  return new THREE.Vector3(x, y, z);
}