import '../../Panel.css';
import { useState, useCallback, useRef } from 'react';
import CanvasPanel from '../../canvas/CanvasPanel';
import type { PendulumSimulationItem } from '../../../simulation/PendulumSimulationItem';

import { isDoubleState } from '../../../utils/TypeGuards';
import { computeDoublePendulumTotalEnergy } from '../../../simulation/models/DoublePendulum';

import {
  drawJacobiTorus,
  renderJacobiTrace
} from '../../../rendering/abstract/JacobiRenderer';

type JacobiPanelProps = {
  simulations: PendulumSimulationItem[];
};

function JacobiPanel({ simulations }: JacobiPanelProps) {
  const [rotation, setRotation] = useState({ x: Math.PI / 4, y: -Math.PI / 6 });
  
  const isDragging = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    lastMouse.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - lastMouse.current.x;
    const dy = e.clientY - lastMouse.current.y;
    
    setRotation(prev => ({
      x: prev.x + dy * 0.01,
      y: prev.y + dx * 0.01,
    }));
    
    lastMouse.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUpOrLeave = () => {
    isDragging.current = false;
  };

  // Prendiamo la prima simulazione in assoluto (singola o doppia non importa)
  const firstSim = simulations.length > 0 ? simulations[0] : null;

  // Calcoliamo l'energia totale (ci serve per colorare il Toro di background)
  let totalEnergy: number | null = null;
  if (firstSim) {
    if (isDoubleState(firstSim.state)) {
      totalEnergy = computeDoublePendulumTotalEnergy(firstSim.state, firstSim.parameters);
    } else {
      // NOTA: Se vuoi colorare il toro anche per il singolo, ti servirà la sua energia.
      // totalEnergy = computeSimplePendulumTotalEnergy(firstSim.state, firstSim.parameters);
      totalEnergy = 100; // Valore di fallback temporaneo per non rompere il rendering
    }
  }

  const drawScene = useCallback(
    (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      ctx.clearRect(0, 0, width, height);

      // Disegniamo il Toro di Jacobi come "palcoscenico" di base
      if (firstSim && totalEnergy !== null) {
        drawJacobiTorus(
          ctx, 
          width, 
          height, 
          totalEnergy, 
          firstSim.parameters, 
          rotation.x, 
          rotation.y,
          isDoubleState(firstSim.state) // Passiamo un flag per sapere se è doppio
        );
      }

      // Disegniamo le tracce per TUTTE le simulazioni
      for (const sim of simulations) {
        const theta1 = sim.state[0];
        // Il trucco magico: se è singolo, theta2 è semplicemente 0 (il "caso banale")
        const theta2 = isDoubleState(sim.state) ? sim.state[2] : 0;

        renderJacobiTrace(
          ctx,
          width,
          height,
          sim.jacobiTrace, // Che ha già y=0 per i pendoli singoli grazie a Lagrange!
          { x: theta1, y: theta2 },
          sim.color,
          rotation.x,
          rotation.y
        );
      }
    },
    [simulations, totalEnergy, rotation, firstSim]
  );

  return (
    <div 
      className="panel-container"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUpOrLeave}
      onMouseLeave={handleMouseUpOrLeave}
      style={{ touchAction: 'none', overflow: 'hidden', cursor: isDragging.current ? 'grabbing' : 'grab' }}
    >
      <CanvasPanel onDraw={drawScene} />

      <img
        src="/images/jacobi.png"
        alt="Carl Gustav Jacob Jacobi"
        className="physicist-image"
        style={{right:0}}
      />
    </div>
  );
}

export default JacobiPanel;