import '../../../styles/Panel.css';
import { useState, useCallback, useEffect, useRef } from 'react';
import CanvasPanel from '../../canvas/CanvasPanel';
import type { PendulumSimulationItem } from '../../../simulation/PendulumSimulationItem';
import { isDoubleState } from '../../../utils/TypeGuards';
import {
  drawPhaseAxes,
  renderHamiltonScene,
} from '../../../rendering/abstract/HamiltonRenderer';
import TraceLengthSlider from '../../TraceLengthSlider';

type HamiltonPanelProps = {
  simulations: PendulumSimulationItem[];
};

function HamiltonPanel({ simulations }: HamiltonPanelProps)
{
  const [traceLength, setTraceLength] = useState(50);
  const [omegaMax, setOmegaMax] = useState(40);
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

      drawPhaseAxes(ctx, width, height, omegaMax);

      for (const sim of simulations) {
        const theta1 = sim.state[0];
        const omega1 = sim.state[1];
        const currentPhasePoint = { x: theta1, y: omega1, };

        renderHamiltonScene(
          ctx,
          width,
          height,
          sim.hamiltonTrace,
          currentPhasePoint,
          sim.color,
          omegaMax,
          false,
          traceLength
        );

        if (isDoubleState(sim.state) && sim.hamiltonTrace2) {
          const theta2 = sim.state[2];
          const omega2 = sim.state[3];
          const currentPhasePoint2 = { x: theta2, y: omega2 };

          renderHamiltonScene(
            ctx,
            width,
            height,
            sim.hamiltonTrace2,
            currentPhasePoint2,
            sim.color,
            omegaMax,
            true,
            traceLength
          );
        }
      }
    },
    [simulations, omegaMax, traceLength]
  );

  return (
    <div className="panel-container" ref={containerRef}>
      <TraceLengthSlider
        value={traceLength} 
        onChange={setTraceLength} 
        style={{ position: 'absolute', top: 16, right: 16, zIndex: 10 }}
        max={100}
      />
      <CanvasPanel onDraw={drawScene} />
      <img
        src="/images/hamilton.png"
        alt="William Rowan Hamilton"
        className="physicist-image"
        style={{right:0}}
      />
    </div>
  );
}

export default HamiltonPanel;