import '../../../styles/Panel.css';
import { useState, useCallback, useEffect, useRef } from 'react';
import CanvasPanel from '../../canvas/CanvasPanel';
import type { PendulumSimulationItem } from '../../../simulation/PendulumSimulationItem';
import { isDoubleState } from '../../../utils/TypeGuards';

// Importeremo le funzioni di rendering da un nuovo file dedicato a Poincaré
import {
  drawPoincareAxes,
  renderPoincareScene,
} from '../../../rendering/abstract/PoincareRenderer';

type PoincarePanelProps = {
  simulations: PendulumSimulationItem[];
};

function PoincarePanel({ simulations }: PoincarePanelProps) {

  const [omegaMax, setOmegaMax] = useState(40);
  const [viewMass, setViewMass] = useState<1 | 2>(2);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const div = containerRef.current;
    if (!div) return;

    const handleNativeWheel = (e: WheelEvent) => {
      e.preventDefault(); 

      const zoomSensitivity = 0.1;
      const direction = e.deltaY > 0 ? 1 : -1;
      
      setOmegaMax(prev => {
        const next = prev + (prev * zoomSensitivity * direction);
        return Math.max(3, next); 
      });
    };

    div.addEventListener('wheel', handleNativeWheel, { passive: false });

    return () => {
      div.removeEventListener('wheel', handleNativeWheel);
    };
  }, []);

  const drawScene = useCallback(
    (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      ctx.clearRect(0, 0, width, height);

      drawPoincareAxes(ctx, width, height, omegaMax, viewMass);

      for (const sim of simulations)
      {
        if (!isDoubleState(sim.state)) continue;

        const pointsToDraw = viewMass === 2 ? sim.poincarePoints : sim.poincarePoints2;

        if (pointsToDraw && pointsToDraw.length > 0)
        {
          renderPoincareScene(
            ctx,
            width,
            height,
            pointsToDraw, 
            sim.color,
            omegaMax
          );
        }
      }
    },
    [simulations, omegaMax, viewMass]
  );

  return (
    <div className="panel-container" ref={containerRef} style={{ touchAction: 'none' }}>
      <div style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 10, display: 'flex', gap: '5px' }}>
        <button 
          onClick={() => setViewMass(1)}
          style={{ padding: '5px 10px', cursor: 'pointer', background: viewMass === 1 ? '#007bff' : '#333', color: 'white', border: 'none', borderRadius: '4px' }}
        >
          Mass 1
        </button>
        <button 
          onClick={() => setViewMass(2)}
          style={{ padding: '5px 10px', cursor: 'pointer', background: viewMass === 2 ? '#007bff' : '#333', color: 'white', border: 'none', borderRadius: '4px' }}
        >
          Mass 2
        </button>
      </div>
      <CanvasPanel onDraw={drawScene} />
      
      <img
        src="/images/poincare.png"
        alt="Henri Poincaré"
        className="physicist-image"
        style={{ right: 0 }}
      />
    </div>
  );
}

export default PoincarePanel;