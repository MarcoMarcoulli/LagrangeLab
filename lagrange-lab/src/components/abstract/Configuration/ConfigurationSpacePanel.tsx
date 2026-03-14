import './ConfigurationSpacePanel.css'
import { useCallback } from 'react';
import CanvasPanel from '../../canvas/CanvasPanel';
import type { PendulumSimulationItem } from '../../../simulation/PendulumSimulationItem';
import {
  drawConfigurationAxes,
  renderConfigurationSpaceScene,
} from '../../../rendering/abstract/ConfigurationSpaceRenderer';

import { isDoubleState } from '../../../utils/TypeGuards';

type ConfigurationSpacePanelProps = {
  simulations: PendulumSimulationItem[];
};

function ConfigurationSpacePanel({ simulations }: ConfigurationSpacePanelProps) {
  const drawScene = useCallback(
    (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      ctx.clearRect(0, 0, width, height);

      drawConfigurationAxes(ctx, width, height);

      for (const sim of simulations) {
        const theta1 = sim.state[0];
        const theta2 = sim.state[2];
        const currentConfigurationPoint = {
          x: theta1,
          y: isDoubleState(sim.state) ? theta2 : 0,
        };
        
        renderConfigurationSpaceScene(
          ctx,
          width,
          height,
          sim.configurationTrace,
          currentConfigurationPoint,
          sim.color
        );
      }
    },
    [simulations]
  );

  return (
    <div className="configuration-space-container">
      <CanvasPanel onDraw={drawScene} />

      <img
        src="/images/lagrange.png"
        alt="Joseph-Louis Lagrange"
        className="configuration-space-image"
      />
    </div>
  );
}

export default ConfigurationSpacePanel;