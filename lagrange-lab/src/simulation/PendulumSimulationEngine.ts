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

const TRACE_POINTS_NEWTON = 60;
const TRACE_POINTS_HAMILTON = 200;
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
    trace: [],
    phaseTrace: [],
    configurationTrace: [],
    color,
  };
}

export function stepSimulation(
  sim: PendulumSimulationItem
): PendulumSimulationItem | null
{
  const substeps = computeSubsteps(sim.state, sim.parameters);
  const dt = FRAME_DT / substeps;

  let currentState = sim.state;

  const phasePoint: Point = buildPhasePoint(currentState);
  const configurationPoint: Point = buildConfigurationPoint(currentState);

  for (let i = 0; i < substeps; i++) {
    const wasDouble = isDoubleState(currentState);
    currentState = advanceState(currentState, sim.parameters, dt);
    const theta1 = currentState[0];
    const theta2 = currentState[2];

    const exploded =
      Number.isNaN(theta1) ||
      (wasDouble && isNaN(theta2 ?? NaN));

    if (exploded)
    {
      console.error(`Physics exploded for simulation ${sim.id}`);
      return null;
    }
  }

  const currentPos = isDoubleState(currentState)
    ? computeMass2Position(sim.pivot, currentState, sim.parameters)
    : computeSimplePos(sim.pivot, currentState, sim.parameters);

  return {
    ...sim,
    state: currentState,
    trace: [...sim.trace, currentPos].slice(-TRACE_POINTS_NEWTON),
    phaseTrace: [...sim.phaseTrace, phasePoint].slice(-TRACE_POINTS_HAMILTON),
    configurationTrace: [...sim.configurationTrace, configurationPoint].slice(-TRACE_POINTS_LAGRANGE),
  };
}