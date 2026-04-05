import '../../styles/Panel.css';
import { useState, useEffect, useRef } from 'react';
import type { PendulumSimulationItem } from '../../simulation/PendulumSimulationItem';
import type { Point } from '../../types/Geometry';

import NewtonPanel from './Newton/NewtonPanel';
import LyapunovPanel from './Lyapunov/LyapunovPanel';

type PhysicalViewMode = 'newton' | 'lyapunov';

type PhysicalPanelProps = {
  simulations: PendulumSimulationItem[];
  hasSimulations: boolean;
  isPaused: boolean;
  gravity: number;
  onGravityChange: (newGravity: number) => void;
  addSimulation: (
    pivot: Point, 
    mass1: Point, 
    mass2: Point | null, 
    color: string, 
    massRatio: number
  ) => void;
  addChaosSwarm: (
    pivot: Point, 
    mass1: Point, 
    mass2: Point | null, 
    baseColor: string, 
    massRatio: number, 
    swarmSize: number, 
    epsilon: number
  ) => void;
  togglePause: () => void;
  reset: () => void;
  restart: () => void;
};

function PhysicalPanel({
  simulations,
  hasSimulations,
  isPaused,
  gravity,
  onGravityChange,
  addSimulation,
  addChaosSwarm,
  togglePause,
  reset,
  restart,
}: PhysicalPanelProps) {
  const [viewMode, setViewMode] = useState<PhysicalViewMode>('newton');

  const containerRef = useRef<HTMLDivElement>(null);

  // Block native browser scrolling on the canvas.
  useEffect(() => {
    const div = containerRef.current;
    if (!div) return;

    const handleNativeWheel = (e: WheelEvent) => {
      e.preventDefault(); 
    };

    div.addEventListener('wheel', handleNativeWheel, { passive: false });

    return () => {
      div.removeEventListener('wheel', handleNativeWheel);
    };
  }, []);

  const handleTabChange = (mode: PhysicalViewMode) => {
    if (mode !== viewMode) {
      reset();
      setViewMode(mode);
    }
  };

  return (
    <div className="panel-container" ref={containerRef}>
      <div className="view-toggle-container" style={{right: 8}}>
        <button
          onClick={() => handleTabChange('newton')}
          className={`view-toggle-btn ${viewMode === 'newton' ? 'active' : ''}`}
        >
          Newton
        </button>

        <button
          onClick={() => handleTabChange('lyapunov')}
          className={`view-toggle-btn ${viewMode === 'lyapunov' ? 'active' : ''}`}
        >
          Lyapunov
        </button>
      </div>

      {viewMode === 'newton' && (
        <NewtonPanel
          simulations={simulations}
          hasSimulations={hasSimulations}
          isPaused={isPaused}
          gravity={gravity} 
          onGravityChange={onGravityChange}
          addSimulation={addSimulation}
          togglePause={togglePause}
          reset={reset}
          restart={restart}
        />
      )}

      {viewMode === 'lyapunov' && (
        <LyapunovPanel
          simulations={simulations}
          hasSimulations={hasSimulations}
          isPaused={isPaused}
          gravity={gravity}             
          onGravityChange={onGravityChange}
          addChaosSwarm={addChaosSwarm}
          togglePause={togglePause}
          reset={reset}
          restart={restart}
        />
      )}
    </div>
  );
}

export default PhysicalPanel;