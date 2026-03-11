import { useState } from 'react';
import type { PendulumSimulationItem } from '../../simulation/PendulumSimulationItem';

import ConfigurationSpacePanel from './ConfigurationSpacePanel';
import PhaseSpacePanel from './PhaseSpacePanel';

type AbstractViewMode = 'configuration' | 'phase';

type AbstractPanelProps = {
  simulations: PendulumSimulationItem[];
};

function AbstractPanel({ simulations }: AbstractPanelProps) {
  const [viewMode, setViewMode] = useState<AbstractViewMode>('configuration');

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
      }}
    >
    <div
      style={{
        position: 'absolute',
        bottom: 12,
        left: 12,
        zIndex: 1,
        display: 'flex',
        gap: 4,
        padding: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.92)',
        border: '1px solid #d0d0d0',
        borderRadius: 12,
        boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
      }}
    >
      <button
        onClick={() => setViewMode('configuration')}
        style={{
          padding: '8px 14px',
          borderRadius: 8,
          border: 'none',
          backgroundColor:
            viewMode === 'configuration' ? '#1976D2' : 'transparent',
          color: viewMode === 'configuration' ? 'white' : '#333',
          cursor: 'pointer',
          fontWeight: 600,
          boxShadow:
            viewMode === 'configuration'
              ? '0 1px 4px rgba(0,0,0,0.18)'
              : 'none',
          transition: 'all 0.18s ease',
        }}
      >
        Configuration
      </button>

      <button
        onClick={() => setViewMode('phase')}
        style={{
          padding: '8px 14px',
          borderRadius: 8,
          border: 'none',
          backgroundColor:
            viewMode === 'phase' ? '#1976D2' : 'transparent',
          color: viewMode === 'phase' ? 'white' : '#333',
          cursor: 'pointer',
          fontWeight: 600,
          boxShadow:
            viewMode === 'phase'
              ? '0 1px 4px rgba(0,0,0,0.18)'
              : 'none',
          transition: 'all 0.18s ease',
        }}
      >
        Phase
      </button>
    </div>

      {viewMode === 'configuration' ? (
        <ConfigurationSpacePanel simulations={simulations} />
      ) : (
        <PhaseSpacePanel simulations={simulations} />
      )}
    </div>
  );
}

export default AbstractPanel;