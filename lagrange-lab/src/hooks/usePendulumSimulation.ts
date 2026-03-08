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

const MAX_TRACE_POINTS = 100; 

export function usePendulumSimulation() {
  const [isSimulating, setIsSimulating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [pendulumState, setPendulumState] = useState<PendulumState | null>(null);
  const [pendulumParameters, setPendulumParameters] = useState<PendulumParameters | null>(null);
  const [trace, setTrace] = useState<Point[]>([]);

  const currentPivotRef = useRef<Point | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  
  const paramsRef = useRef<PendulumParameters | null>(null);
  const stateRef = useRef<PendulumState | null>(null);

  useEffect(() => { paramsRef.current = pendulumParameters; }, [pendulumParameters]);
  useEffect(() => { stateRef.current = pendulumState; }, [pendulumState]);

  const start = useCallback((pivot: Point, mass1: Point, mass2: Point | null, massRatio: number = 1) => {
    currentPivotRef.current = pivot;
    
    let initialState: PendulumState;
    let initialParams: PendulumParameters;

    if (!mass2) {
      initialState = buildInitialSimplePendulumState(pivot, mass1);
      initialParams = buildSimplePendulumParameters(pivot, mass1);
    } else {
      initialState = buildInitialDoublePendulumState(pivot, mass1, mass2);
      initialParams = buildDoublePendulumParameters(pivot, mass1, mass2, massRatio);
    }

    setPendulumParameters(initialParams);
    
    setPendulumState(initialState);
    setTrace([]);
    setIsSimulating(true);
    setIsPaused(false);
  }, []);

  const reset = useCallback(() => {
    setIsSimulating(false);
    setIsPaused(false);
    setPendulumState(null);
    setPendulumParameters(null);
    setTrace([]);
    currentPivotRef.current = null;
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  }, []);

  useEffect(() => {
    if (!isSimulating || isPaused) return;

    const dt = 0.016; // 60 FPS target

    const step = () => {
      const currentParams = paramsRef.current;
      const currentState = stateRef.current;
      const pivot = currentPivotRef.current;

      if (!currentState || !currentParams || !pivot) {
        animationFrameRef.current = requestAnimationFrame(step);
        return;
      }

      let newState: PendulumState;
      const isDouble = isDoubleState(currentState);
      if (isDouble) {
        newState = rungeKutta4Step(
          currentState,
          currentParams as PendulumParameters,
          dt,
          computeDoublePendulumDerivatives,
          addDoublePendulumStates,
          scaleDoublePendulumState
        );
      } else {
        newState = rungeKutta4Step(
          currentState as PendulumState,
          currentParams as PendulumParameters,
          dt,
          computeSimplePendulumDerivatives,
          addSimplePendulumStates,
          scaleSimplePendulumState
        );
      }

      const hasExploded = isNaN(newState.theta1) || (isDouble && isNaN(newState.theta2!));

      if (hasExploded)
      {
        console.error("physics exploded, NaN angles detected");
        setIsSimulating(false);
        return;
      }

      const currentPos = isDouble
        ? computeMass2Position(pivot, newState, currentParams)
        : computeSimplePos(pivot, newState, currentParams);

      setPendulumState(newState);
      setTrace((prev) => [...prev, currentPos].slice(-MAX_TRACE_POINTS));

      animationFrameRef.current = requestAnimationFrame(step);
    };

    animationFrameRef.current = requestAnimationFrame(step);

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isSimulating, isPaused]);

  return {
    pendulumState,
    pendulumParameters,
    trace,
    isSimulating,
    isPaused,
    start,
    togglePause: () => setIsPaused(p => !p),
    reset,
  };
}