import { useState, useRef, useEffect, useCallback } from 'react';
import type { Point } from '../types/Geometry';
import type { PendulumSimulationItem } from '../simulation/PendulumSimulationItem';
import { buildSimulation, stepSimulation, buildChaosSwarm } from '../simulation/PendulumSimulationEngine';
import { PIXELS_PER_METER } from '../utils/Math/PhysicsConstants';

export function usePendulumSimulation() {
  const [isPaused, setIsPaused] = useState(false);
  const [simulations, setSimulations] = useState<PendulumSimulationItem[]>([]);

  const hasSimulations = simulations.length > 0;
  const animationFrameRef = useRef<number | null>(null);

  const addSimulation = useCallback(
    (
      pivot: Point,
      mass1: Point,
      mass2: Point | null,
      color: string,
      massRatio: number = 1,
      gravity : number
    ) => {
      const scaledG = gravity * PIXELS_PER_METER;
      const newSimulation = buildSimulation(pivot, mass1, mass2, color, massRatio, false, scaledG);
      setSimulations(prev => [...prev, newSimulation]);
    }, []);
  
  const addChaosSwarm = useCallback(
    (
      pivot: Point,
      mass1: Point,
      mass2: Point | null,
      baseColor: string,
      massRatio: number,
      swarmSize: number,
      epsilon: number,
      gravity: number
    ) => {
      const scaledG = gravity * PIXELS_PER_METER;
      const newSwarm = buildChaosSwarm(pivot, mass1, mass2, baseColor, massRatio, swarmSize, epsilon, scaledG);
      
      setSimulations(prev => [...prev, ...newSwarm]);
    }, []);

  const reset = useCallback(() => {
    setSimulations([]);
    setIsPaused(false);

    if (animationFrameRef.current !== null)
    {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);

  const togglePause = useCallback(() => {
    setIsPaused(prev => !prev);
  }, []);

  function updateSimulation(sim: PendulumSimulationItem): PendulumSimulationItem[]
  {
    const updated = stepSimulation(sim);
    return updated ? [updated] : [];
  }

  useEffect(() => {
    if (!hasSimulations || isPaused)
    {
      return;
    }

    const step = () => {
      setSimulations(prev => prev.flatMap(updateSimulation));
      animationFrameRef.current = requestAnimationFrame(step);
    };

    animationFrameRef.current = requestAnimationFrame(step);

    return () => {
      if (animationFrameRef.current !== null)
      {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [hasSimulations, isPaused]);

  return {
    simulations,
    setSimulations,
    hasSimulations,
    isPaused,
    addSimulation,
    addChaosSwarm,
    togglePause,
    reset,
  };
}