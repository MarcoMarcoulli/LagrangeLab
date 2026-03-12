import { useCallback } from 'react';
import CanvasPanel from '../canvas/CanvasPanel';
import type { PendulumSimulationItem } from '../../simulation/PendulumSimulationItem';
import { isDoubleState } from '../../utils/TypeGuards';
import {
  drawPhaseAxes,
  renderPhaseSpaceScene,
} from '../../rendering/abstract/PhaseSpaceRenderer';

type PhaseSpacePanelProps = {
  simulations: PendulumSimulationItem[];
};

const OMEGA_MAX = 20;

function PhaseSpacePanel({ simulations }: PhaseSpacePanelProps) {
  const simpleSimulations = simulations.filter(sim => !isDoubleState(sim.state));

  const drawScene = useCallback(
    (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      ctx.clearRect(0, 0, width, height);

      drawPhaseAxes(ctx, width, height, OMEGA_MAX);

      for (const sim of simpleSimulations) {
        renderPhaseSpaceScene(
          ctx,
          width,
          height,
          sim.phaseTrace,
          {
            x: sim.state.theta1,
            y: sim.state.omega1,
          },
          sim.color,
          OMEGA_MAX
        );
      }
    },
    [simpleSimulations]
  );

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <CanvasPanel onDraw={drawScene} />
      <img
        src="/images/hamilton.png"
        alt="Isaac Newton"
        style={{
          position: 'absolute',
          right:0,
          bottom:0,
          width: 150,
          height: 'auto',
          zIndex: 1,
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      />
    </div>
  );
}

export default PhaseSpacePanel;