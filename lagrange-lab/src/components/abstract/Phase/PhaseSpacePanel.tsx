import './PhaseSpacePanel.css'
import { useCallback } from 'react';
import CanvasPanel from '../../canvas/CanvasPanel';
import type { PendulumSimulationItem } from '../../../simulation/PendulumSimulationItem';
import { isDoubleState } from '../../../utils/TypeGuards';
import {
  drawPhaseAxes,
  renderPhaseSpaceScene,
} from '../../../rendering/abstract/PhaseSpaceRenderer';

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
        const theta1 = sim.state[0];
        const omega1 = sim.state[1];
        const currentPhasePoint = { x: theta1, y: omega1, };

        renderPhaseSpaceScene(
          ctx,
          width,
          height,
          sim.phaseTrace,
          currentPhasePoint,
          sim.color,
          OMEGA_MAX
        );
      }
    },
    [simpleSimulations]
  );

  return (
    <div className="configuration-space-container">
      <CanvasPanel onDraw={drawScene} />
      <img
        src="/images/hamilton.png"
        alt="William Rowan Hamilton"
        className="phase-space-image"
      />
    </div>
  );
}

export default PhaseSpacePanel;