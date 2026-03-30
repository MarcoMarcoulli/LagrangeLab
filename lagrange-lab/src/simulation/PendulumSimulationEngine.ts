import { generateColor } from '../utils/Draw/ColorUtils';
import type { Point } from '../types/Geometry';
import type { PendulumState, PendulumParameters } from '../types/Pendulum';
import type { PendulumSimulationItem } from './PendulumSimulationItem';

import {
  buildInitialSimplePendulumState,
  buildSimplePendulumParameters,
  computeSimplePendulumDerivatives,
  computeMassPosition as computeSimplePos,
} from './models/SimplePendulum';

import {
  buildInitialDoublePendulumState,
  buildDoublePendulumParameters,
  computeDoublePendulumDerivatives,
  computeMass2Position,
} from './models/DoublePendulum';

import { rungeKutta4Step } from './integrator/RungeKutta';

import { isDoubleState } from '../utils/TypeGuards';

import { computeDoublePendulumTotalEnergy, computeDoublePendulumPotential, computeDoublePendulumKineticEnergy } from './models/DoublePendulum';
import { getTorusPoint } from '../utils/Math/TorusMath';

const TRACE_POINTS_NEWTON = 45;
const TRACE_POINTS_HAMILTON = 30;
const TRACE_POINTS_LAGRANGE = 30;
const TRACE_POINTS_JACOBI = 15;
const TRACE_POINTS_LYAPUNOV = 25;
const POINTS_POINCARE = 2000;

const FRAME_DT = 0.016;

function addStates(a: PendulumState, b: PendulumState): PendulumState {
  const result = new Float64Array(a.length);
  for (let i = 0; i < a.length; i++) {
    result[i] = a[i] + b[i];
  }
  return result;
}

function scaleState(state: PendulumState, scalar: number): PendulumState {
  const result = new Float64Array(state.length);
  for (let i = 0; i < state.length; i++) {
    result[i] = state[i] * scalar;
  }
  return result;
}

export function computeSubsteps(state: PendulumState, parameters: PendulumParameters): number
{
  if (!isDoubleState(state))
  {
    return 1;
  }

  const omega1 = state[1];
  const omega2 = state[3];

  const derivatives = computeDoublePendulumDerivatives(state, parameters);

  const dOmega1 = derivatives[1];
  const dOmega2 = derivatives[3];

  const pressure = Math.max(
    Math.abs(omega1),
    Math.abs(omega2),
    Math.abs(dOmega1),
    Math.abs(dOmega2)
  );

  if (pressure < 5) return 1;
  if (pressure < 15) return 2;
  if (pressure < 40) return 4;
  if (pressure < 100) return 8;
  return 16;
}

function buildPhasePoint(state: PendulumState): Point
{
  const theta1 = state[0];
  const omega1 = state[1];
  return{
    x: theta1,
    y: omega1,
  };
}

function buildConfigurationPoint(state: PendulumState): Point
{
  const theta1 = state[0];
  const theta2 = state[2];
  return isDoubleState(state)
    ? {
        x: theta1,
        y: theta2,
      }
    : {
        x: theta1,
        y: 0,
      };
}

function advanceState(
  state: PendulumState,
  parameters: PendulumParameters,
  dt: number
): PendulumState
{
  const derivativeFn = isDoubleState(state)
    ? computeDoublePendulumDerivatives
    : computeSimplePendulumDerivatives;
  
  return rungeKutta4Step(
    state,
    parameters,
    dt,
    derivativeFn,
    addStates,
    scaleState
  );
}

export function buildSimulation(
  pivot: Point,
  mass1: Point,
  mass2: Point | null,
  color: string,
  massRatio: number = 1,
  isSwarm: boolean = false,
  gravity: number = 9.81 * 700
): PendulumSimulationItem
{
  let initialState: PendulumState;
  let initialParams: PendulumParameters;

  if (!mass2)
  {
    initialState = buildInitialSimplePendulumState(pivot, mass1);
    initialParams = buildSimplePendulumParameters(pivot, mass1);
  }
  else
  {
    initialState = buildInitialDoublePendulumState(pivot, mass1, mass2);
    initialParams = buildDoublePendulumParameters(pivot, mass1, mass2, massRatio);
  }

  initialParams.gravity = gravity;

  return{
    id: crypto.randomUUID(),
    pivot,
    state: initialState,
    parameters: initialParams,
    newtonTrace: [],
    lagrangeTrace: [],
    hamiltonTrace: [],
    hamiltonTrace2: mass2 ? [] : undefined,
    jacobiTrace: [],
    poincarePoints: [],
    poincarePoints2: [],
    color,
    isSwarm
  };
}

export function stepSimulation(
  sim: PendulumSimulationItem
): PendulumSimulationItem | null {
  const substeps = computeSubsteps(sim.state, sim.parameters);
  const dt = FRAME_DT / substeps;

  // 1. Calcoliamo l'energia target una volta sola all'inizio del frame
  const targetEnergy = computeDoublePendulumTotalEnergy(sim.state, sim.parameters);

  let currentState = sim.state;
  const newPoincarePoints: Point[] = [];
  const newPoincarePoints2: Point[] = [];

  // --- UNICO CICLO DI AVANZAMENTO ---
  for (let i = 0; i < substeps; i++) {
    const oldState = currentState;
    // A. Avanzamento fisico con RK4
    currentState = advanceState(currentState, sim.parameters, dt);

    // B. ENERGY CLAMP (Solo per il doppio pendolo)
    if (isDoubleState(currentState)) {
      const V = computeDoublePendulumPotential(currentState[0], currentState[2], sim.parameters);
      const K = computeDoublePendulumKineticEnergy(currentState, sim.parameters);
      const currentE = V + K;

      // Correzione se l'energia deriva
      if (Math.abs(currentE - targetEnergy) > 1e-10) {
        const allowedK = targetEnergy - V;

        if (allowedK <= 0) {
          // Collisione con il limite: fermiamo le velocità
          currentState[1] = 0; // omega 1
          currentState[3] = 0; // omega 2
        } else {
          // Riscalamento delle velocità per conservare l'energia
          const correctionFactor = Math.sqrt(allowedK / K);
          currentState[1] *= correctionFactor;
          currentState[3] *= correctionFactor;
        }
      }
    }

    // C. Controllo esplosione (NaN o valori infiniti)
    if (Number.isNaN(currentState[0]) || (isDoubleState(currentState) && Number.isNaN(currentState[2]))) {
      console.error(`Physics exploded for simulation ${sim.id}`);
      return null;
    }

    // D. CATTURA SEZIONE DI POINCARÉ (Solo per doppio pendolo)
    if (isDoubleState(currentState)) {
      // Funzione helper per mappare l'angolo tra -PI e PI
      const wrap = (angle: number) => ((angle + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI;

      const th1_old = wrap(oldState[0]);
      const th1_new = wrap(currentState[0]);
      const th2_old = wrap(oldState[2]);
      const th2_new = wrap(currentState[2]);

      // CASO 1: Il primo pendolo incrocia lo zero -> Salviamo la Massa 2
        if (th1_old < 0 && th1_new >= 0 && (th1_new - th1_old) < Math.PI) {
          const f = -th1_old / (th1_new - th1_old);
          const th2_interp = oldState[2] + f * (currentState[2] - oldState[2]);
          const om2_interp = oldState[3] + f * (currentState[3] - oldState[3]);
          newPoincarePoints.push({ x: th2_interp, y: om2_interp });
        }

        // CASO 2: Il secondo pendolo incrocia lo zero -> Salviamo la Massa 1
        if (th2_old < 0 && th2_new >= 0 && (th2_new - th2_old) < Math.PI) {
          const f = -th2_old / (th2_new - th2_old);
          const th1_interp = oldState[0] + f * (currentState[0] - oldState[0]);
          const om1_interp = oldState[1] + f * (currentState[1] - oldState[1]);
          newPoincarePoints2.push({ x: th1_interp, y: om1_interp });
        }
    }
  }

  // --- CALCOLO DEI PUNTI PER LE SCIE (Dopo che la fisica è stabile) ---
  const phasePoint: Point = buildPhasePoint(currentState);
  const phasePoint2: Point | undefined = isDoubleState(currentState) 
    ? { x: currentState[2], y: currentState[3] } 
    : undefined;
  
  const configurationPoint: Point = buildConfigurationPoint(currentState);
  const currentTorusPoint = getTorusPoint(configurationPoint.x, configurationPoint.y, 0.02);

  const currentPos = isDoubleState(currentState)
    ? computeMass2Position(sim.pivot, currentState, sim.parameters)
    : computeSimplePos(sim.pivot, currentState, sim.parameters);

  const physicalTraceLimit = sim.isSwarm ? TRACE_POINTS_LYAPUNOV : TRACE_POINTS_NEWTON;

  return {
    ...sim,
    state: currentState,
    newtonTrace: [...sim.newtonTrace, currentPos].slice(-physicalTraceLimit),
    hamiltonTrace: [...sim.hamiltonTrace, phasePoint].slice(-TRACE_POINTS_HAMILTON),
    hamiltonTrace2: (phasePoint2 && sim.hamiltonTrace2) 
        ? [...sim.hamiltonTrace2, phasePoint2].slice(-TRACE_POINTS_HAMILTON) 
        : sim.hamiltonTrace2,
    lagrangeTrace: [...sim.lagrangeTrace, configurationPoint].slice(-TRACE_POINTS_LAGRANGE),
    jacobiTrace: [...sim.jacobiTrace, currentTorusPoint].slice(-TRACE_POINTS_JACOBI),
    poincarePoints: [...(sim.poincarePoints || []), ...newPoincarePoints].slice(-POINTS_POINCARE),
    poincarePoints2: [...(sim.poincarePoints2 || []), ...newPoincarePoints2].slice(-POINTS_POINCARE),
  };
}

/**
 * Crea un intero sciame di pendoli partendo da una configurazione base
 * applicando una perturbazione crescente (Epsilon)
 */
export function buildChaosSwarm(
  pivot: Point,
  mass1: Point,
  mass2: Point | null,
  baseColor: string,
  massRatio: number,
  swarmSize: number,
  epsilon: number,
  gravity: number
): PendulumSimulationItem[] {
  // 1. Creiamo il "Leader" (quello che l'utente ha disegnato)
  const leader = buildSimulation(pivot, mass1, mass2, baseColor, massRatio, true, gravity);
  
  const swarm: PendulumSimulationItem[] = [];

  for (let i = 0; i < swarmSize; i++) {
    // 2. Creiamo un clone partendo dai dati del leader
    // Nota: copiamo lo stato (Float64Array) per non condividere il riferimento in memoria!
    const newState = new Float64Array(leader.state);
    
    // 3. Applichiamo la perturbazione di Lyapunov
    // La applichiamo a theta2 (se doppio) o theta1 (se semplice)
    // Usiamo (i * epsilon) per distribuire i cloni a ventaglio
    if (isDoubleState(newState)) {
      newState[2] += (i * epsilon); // Perturbazione su Theta 2
    } else {
      newState[0] += (i * epsilon); // Perturbazione su Theta 1
    }

    const uniqueColor = i === 0 ? baseColor : generateColor();

    swarm.push({
      ...leader,
      id: crypto.randomUUID(), // Ogni clone deve avere il suo ID unico
      state: newState,
      color: uniqueColor,
      newtonTrace: [],
      poincarePoints: [],
      poincarePoints2: [],
    });
  }

  return swarm;
}