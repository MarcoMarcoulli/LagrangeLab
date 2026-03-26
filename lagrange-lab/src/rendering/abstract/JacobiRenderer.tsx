import type { Point } from '../../types/geometry';

// Se hai un tipo per i parametri, importalo. Per ora usiamo 'any' come placeholder.
// import type { DoublePendulumParameters } from '../../../simulation/models/DoublePendulum';

export interface Point3D {
  x: number;
  y: number;
  z: number;
}

const TWO_PI = 2 * Math.PI;

export function wrapAngle(angle: number): number {
  return ((angle + Math.PI) % TWO_PI + TWO_PI) % TWO_PI - Math.PI;
}

/**
 * Disegna la superficie del Toro (background)
 */
export function drawJacobiTorus(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  totalEnergy: number,
  params: any, // Sostituisci con il tipo corretto
  angleX: number,
  angleY: number,
  isDouble: boolean = true
): void {
  // TODO 1: Generare la griglia di punti (theta1, theta2)
  // TODO 2: Mappare i punti sulle coordinate 3D (x, y, z) del toro
  // TODO 3: Calcolare il colore di ogni quadrante (Metrica di Jacobi: Etot - V)
  // TODO 4: Proiettare i punti 3D in 2D usando angleX e angleY
  // TODO 5: Ordinare i poligoni dal più lontano al più vicino (Z-Sorting)
  // TODO 6: Disegnare i poligoni sul Canvas
}

/**
 * Disegna la scia del pendolo sulla superficie del Toro
 */
export function renderJacobiTrace(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  trace: Point[],
  currentPoint: Point, // {x: theta1, y: theta2}
  color: string,
  angleX: number,
  angleY: number
): void {
  if (!trace || trace.length === 0) return;

  // TODO 1: Convertire i punti della traccia (theta1, theta2) in coordinate 3D sul toro
  // TODO 2: Proiettare i punti 3D in 2D usando angleX e angleY
  // TODO 3: Disegnare la linea della scia sul Canvas
  // TODO 4: Disegnare il punto attuale (la posizione del pendolo)
}