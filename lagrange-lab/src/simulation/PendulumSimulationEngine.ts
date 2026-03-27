import type { Point } from '../types/geometry';
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

const TRACE_POINTS_NEWTON = 60;
const TRACE_POINTS_HAMILTON = 30;
const TRACE_POINTS_LAGRANGE = 30;
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
  massRatio: number = 1
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
    color,
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

  // --- UNICO CICLO DI AVANZAMENTO ---
  for (let i = 0; i < substeps; i++) {
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
  }

  // --- CALCOLO DEI PUNTI PER LE SCIE (Dopo che la fisica è stabile) ---
  const phasePoint: Point = buildPhasePoint(currentState);
  const phasePoint2: Point | undefined = isDoubleState(currentState) 
    ? { x: currentState[2], y: currentState[3] } 
    : undefined;
  
  const configurationPoint: Point = buildConfigurationPoint(currentState);

  const currentPos = isDoubleState(currentState)
    ? computeMass2Position(sim.pivot, currentState, sim.parameters)
    : computeSimplePos(sim.pivot, currentState, sim.parameters);

  return {
    ...sim,
    state: currentState,
    newtonTrace: [...sim.newtonTrace, currentPos].slice(-TRACE_POINTS_NEWTON),
    hamiltonTrace: [...sim.hamiltonTrace, phasePoint].slice(-TRACE_POINTS_HAMILTON),
    hamiltonTrace2: (phasePoint2 && sim.hamiltonTrace2) 
        ? [...sim.hamiltonTrace2, phasePoint2].slice(-TRACE_POINTS_HAMILTON) 
        : sim.hamiltonTrace2,
    lagrangeTrace: [...sim.lagrangeTrace, configurationPoint].slice(-TRACE_POINTS_LAGRANGE),
  };
}