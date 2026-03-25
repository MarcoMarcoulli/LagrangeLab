import './AbstractPanel.css'
import { useState } from 'react';
import type { PendulumSimulationItem } from '../../simulation/PendulumSimulationItem';

import LagrangePanel from './Lagrange/LagrangePanel';
import HamiltonPanel from './Hamilton/HamiltonPanel';

type AbstractViewMode = 'configuration' | 'phase';

type AbstractPanelProps = {
  simulations: PendulumSimulationItem[];
};

function AbstractPanel({ simulations }: AbstractPanelProps) {
  const [viewMode, setViewMode] = useState<AbstractViewMode>('configuration');

  return (
    <div className="abstract-panel-container">
    <div className="view-toggle-container">
      <button
        onClick={() => setViewMode('configuration')}
        className={`view-toggle-btn ${viewMode === 'configuration' ? 'active' : ''}`}
      >
        Configuration
      </button>

      <button
        onClick={() => setViewMode('phase')}
        className={`view-toggle-btn ${viewMode === 'phase' ? 'active' : ''}`}
      >
        Phase
      </button>
    </div>

      {viewMode === 'configuration' ? (<LagrangePanel simulations={simulations} />) :
      (<HamiltonPanel simulations={simulations}/>)}
    </div>
  );
}

export default AbstractPanel;