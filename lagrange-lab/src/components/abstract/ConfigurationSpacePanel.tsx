import { useCallback } from 'react';
import CanvasPanel from '../canvas/CanvasPanel';
import type { PendulumSimulationItem } from '../../simulation/PendulumSimulationItem';
import {
  drawConfigurationAxes,
  renderConfigurationSpaceScene,
} from '../../rendering/abstract/ConfigurationSpaceRenderer';

import { isDoubleState } from '../../utils/TypeGuards';

type ConfigurationSpacePanelProps = {
  simulations: PendulumSimulationItem[];
};

function ConfigurationSpacePanel({ simulations }: ConfigurationSpacePanelProps) {
  const drawScene = useCallback(
    (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      ctx.clearRect(0, 0, width, height);

      drawConfigurationAxes(ctx, width, height);

      for (const sim of simulations) {
        const currentConfigurationPoint = {
          x: sim.state.theta1,
          y: isDoubleState(sim.state) ? sim.state.theta2 ?? 0 : 0,
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
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <CanvasPanel onDraw={drawScene} />

      <img
        src="/images/lagrange.png"
        alt="Joseph-Louis Lagrange"
        style={{
          position: 'absolute',
          right: 0,
          bottom: 0,
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

export default ConfigurationSpacePanel;