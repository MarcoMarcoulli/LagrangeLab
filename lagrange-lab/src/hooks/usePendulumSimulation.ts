import { useState, useRef, useEffect, useCallback } from 'react';
import type { Point } from '../types/geometry';

import type { PendulumState, PendulumParameters } from '../types/Pendulum';
import {
  buildInitialSimplePendulumState,
  buildSimplePendulumParameters,
  computeSimplePendulumDerivatives,
  computeMassPosition as computeSimplePos,
} from '../simulation/models/SimplePendulum';
import {
  addSimplePendulumStates,
  scaleSimplePendulumState,
} from '../simulation/operators/SimplePendulumStateOperators';

import {
  buildInitialDoublePendulumState,
  buildDoublePendulumParameters,
  computeDoublePendulumDerivatives,
  computeMass2Position,
} from '../simulation/models/DoublePendulum';
import {
  addDoublePendulumStates,
  scaleDoublePendulumState,
} from '../simulation/operators/DoublePendulumStateOperators';

import { rungeKutta4Step } from '../simulation/integrator/RungeKutta';

import { isDoubleState } from '../utils/TypeGuards';

import type { PendulumSimulationItem } from '../simulation/PendulumSimulationItem';

const TRACE_POINTS_NEWTON = 60; 
const TRACE_POINTS_HAMILTON = 200;
const TRACE_POINTS_LAGRANGE = 30;

function computeSubsteps(
  state: PendulumState,
  parameters: PendulumParameters
): number {
  if (!isDoubleState(state)) {
    return 1;
  }

  const derivatives = computeDoublePendulumDerivatives(state, parameters);

  const pressure = Math.max(
    Math.abs(state.omega1),
    Math.abs(state.omega2 ?? 0),
    Math.abs(derivatives.omega1),
    Math.abs(derivatives.omega2 ?? 0)
  );

  if (pressure < 5) return 1;
  if (pressure < 15) return 2;
  if (pressure < 40) return 4;
  if (pressure < 100) return 8;
  return 16;
}

export function usePendulumSimulation() {
  const [isPaused, setIsPaused] = useState(false);
  const [simulations, setSimulations] = useState<PendulumSimulationItem[]>([]);

  const isSimulating = simulations.length > 0;

  const animationFrameRef = useRef<number | null>(null);

  const addSimulation = useCallback((
    pivot: Point,
    mass1: Point,
    mass2: Point | null,
    color: string,
    massRatio: number = 1
  ) => {
    let initialState: PendulumState;
    let initialParams: PendulumParameters;

    if (!mass2) {
      initialState = buildInitialSimplePendulumState(pivot, mass1);
      initialParams = buildSimplePendulumParameters(pivot, mass1);
    } else {
      initialState = buildInitialDoublePendulumState(pivot, mass1, mass2);
      initialParams = buildDoublePendulumParameters(pivot, mass1, mass2, massRatio);
    }

    const newSimulation: PendulumSimulationItem = {
      id: crypto.randomUUID(),
      pivot,
      state: initialState,
      parameters: initialParams,
      trace: [],
      phaseTrace: [],
      configurationTrace: [],
      color,
    };

    setSimulations(prev => [...prev, newSimulation]);
  }, []);

  const reset = useCallback(() => {
    setSimulations([]);
    setIsPaused(false);

    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  }, []);

  useEffect(() => {
  if (simulations.length === 0 || isPaused) {
    return;
  }

  const step = () => {
    setSimulations(prev =>
      prev.flatMap(sim => {
        const frameDt = 0.016;
        const substeps = computeSubsteps(sim.state, sim.parameters);
        const dt = frameDt / substeps;

        let currentState = sim.state;

        const phasePoint: Point = {
          x: currentState.theta1,
          y: currentState.omega1,
        };

        const configurationPoint: Point = isDoubleState(currentState)
            ? {
                x: currentState.theta1,
                y: currentState.theta2 ?? 0,
              }
            : {
                x: currentState.theta1,
                y: 0,
              };

        for (let i = 0; i < substeps; i++) {
          const isCurrentDouble = isDoubleState(currentState);
          if (isCurrentDouble) {
            currentState = rungeKutta4Step(
              currentState,
              sim.parameters,
              dt,
              computeDoublePendulumDerivatives,
              addDoublePendulumStates,
              scaleDoublePendulumState
            );
          } else {
            currentState = rungeKutta4Step(
              currentState,
              sim.parameters,
              dt,
              computeSimplePendulumDerivatives,
              addSimplePendulumStates,
              scaleSimplePendulumState
            );
          }
          const exploded =
              isNaN(currentState.theta1) ||
              (isCurrentDouble && isNaN(currentState.theta2 ?? NaN));

          if (exploded) {
            console.error(`Physics exploded for simulation ${sim.id}`);
            return [];
          }
        }

        const currentPos = isDoubleState(currentState)
          ? computeMass2Position(sim.pivot, currentState, sim.parameters)
          : computeSimplePos(sim.pivot, currentState, sim.parameters);

        return [{
          ...sim,
          state: currentState,
          trace: [...sim.trace, currentPos].slice(-TRACE_POINTS_NEWTON),
          phaseTrace: [...sim.phaseTrace, phasePoint].slice(-TRACE_POINTS_HAMILTON),
          configurationTrace: [...sim.configurationTrace, configurationPoint].slice(-TRACE_POINTS_LAGRANGE),
        }];
      })
    );

    animationFrameRef.current = requestAnimationFrame(step);
  };

  animationFrameRef.current = requestAnimationFrame(step);

  return () => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  };
}, [simulations.length, isPaused]);
  
const togglePause = useCallback(() => {
  setIsPaused(prev => !prev);
}, []);

return {
  simulations,
  isSimulating,
  isPaused,
  addSimulation,
  togglePause,
  reset,
};
}