import '../../styles/Panel.css'
import { useState, useEffect, useRef } from 'react';
import type { PendulumSimulationItem } from '../../simulation/PendulumSimulationItem';

import LagrangePanel from './Lagrange/LagrangePanel';
import HamiltonPanel from './Hamilton/HamiltonPanel';
import JacobiPanel from './Jacobi/JacobiPanel'
import PoincarePanel from './Poincare/PoincarePanel';

type AbstractViewMode = 'lagrange' | 'hamilton' | 'jacobi' | 'poincare';

type AbstractPanelProps = {
  simulations: PendulumSimulationItem[];
};

function AbstractPanel({ simulations }: AbstractPanelProps) {
  const [viewMode, setViewMode] = useState<AbstractViewMode>('lagrange');

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const div = containerRef.current;
    if (!div) return;

    const handleNativeWheel = (e: WheelEvent) => {
      // Ferma lo scroll della pagina e lo zoom (Ctrl + Rotella)
      e.preventDefault(); 
    };

    div.addEventListener('wheel', handleNativeWheel, { passive: false });

    return () => {
      div.removeEventListener('wheel', handleNativeWheel);
    };
  }, []);

  return (
    <div className="panel-container" ref={containerRef} style={{ touchAction: 'none' }}>
      <div className="view-toggle-container" style={{left: 8}}>
        <button
          onClick={() => setViewMode('lagrange')}
          className={`view-toggle-btn ${viewMode === 'lagrange' ? 'active' : ''}`}
        >
          Lagrange
        </button>

        <button
          onClick={() => setViewMode('hamilton')}
          className={`view-toggle-btn ${viewMode === 'hamilton' ? 'active' : ''}`}
        >
          Hamilton
        </button>
          
        <button
          onClick={() => setViewMode('jacobi')}
          className={`view-toggle-btn ${viewMode === 'jacobi' ? 'active' : ''}`}
        >
          Jacobi
        </button>

        <button
          onClick={() => setViewMode('poincare')}
          className={`view-toggle-btn ${viewMode === 'poincare' ? 'active' : ''}`}
        >
          Poincaré
        </button>
      </div>

      {viewMode === 'lagrange' && <LagrangePanel simulations={simulations} />}
      {viewMode === 'hamilton' && <HamiltonPanel simulations={simulations} />}
      {viewMode === 'jacobi' && <JacobiPanel simulations={simulations} />}
      {viewMode === 'poincare' && <PoincarePanel simulations={simulations} />}
    </div>
  );
}

export default AbstractPanel;