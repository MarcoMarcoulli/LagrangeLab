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
};

function PhysicalPanel({
  simulations,
  hasSimulations,
  isPaused,
  addSimulation,
  addChaosSwarm,
  togglePause,
  reset,
}: PhysicalPanelProps) {
  const [viewMode, setViewMode] = useState<PhysicalViewMode>('newton');

  const containerRef = useRef<HTMLDivElement>(null);

  // Blocchiamo lo scroll nativo del browser sul canvas, come in AbstractPanel
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

  // Gestore per il cambio scheda: resettiamo il canvas per avere un foglio pulito
  const handleTabChange = (mode: PhysicalViewMode) => {
    if (mode !== viewMode) {
      reset(); // Cancella le simulazioni in corso per evitare sovrapposizioni strane
      setViewMode(mode);
    }
  };

  return (
    <div className="panel-container" ref={containerRef}>
      
      {/* 1. BARRA DELLE TAB (Pulita, senza stili inline d'emergenza) */}
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

      {/* 2. I PANNELLI */}
      {viewMode === 'newton' && (
        <NewtonPanel
          simulations={simulations}
          hasSimulations={hasSimulations}
          isPaused={isPaused}
          addSimulation={addSimulation}
          togglePause={togglePause}
          reset={reset}
        />
      )}

      {viewMode === 'lyapunov' && (
        <LyapunovPanel
          simulations={simulations}
          hasSimulations={hasSimulations}
          isPaused={isPaused}
          addChaosSwarm={addChaosSwarm}
          togglePause={togglePause}
          reset={reset}
        />
      )}
    </div>
  );
}

export default PhysicalPanel;