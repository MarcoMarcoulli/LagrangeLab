import '../../../styles/Panel.css'
import { useCallback, useMemo, useState} from 'react';
import CanvasPanel from '../../canvas/CanvasPanel';
import type { PendulumSimulationItem } from '../../../simulation/PendulumSimulationItem';
import {
  drawConfigurationAxes,
  renderLagrangeScene,
  buildContourSegments,
  drawContourSegments,
} from '../../../rendering/abstract/LagrangeRenderer';

import { isDoubleState } from '../../../utils/TypeGuards';

import { computeDoublePendulumPotential } from '../../../simulation/models/DoublePendulum';

import { buildContourLevels } from '../../../utils/ContourLevels';

import { computeDoublePendulumTotalEnergy } from '../../../simulation/models/DoublePendulum';

import TraceLengthSlider from '../../TraceLengthSlider';
import { TRACE_POINTS_LAGRANGE } from '../../../simulation/PendulumSimulationEngine';

type LagrangePanelProps = {
  simulations: PendulumSimulationItem[];
};

function LagrangePanel({ simulations }: LagrangePanelProps) {

  const [traceLength, setTraceLength] = useState(TRACE_POINTS_LAGRANGE / 2);

  const doublePendulumSimulations = simulations.filter(sim => isDoubleState(sim.state));

  const firstDoubleSim = doublePendulumSimulations.length === 1 ? doublePendulumSimulations[0] : null;

  const totalEnergy = firstDoubleSim
    ? computeDoublePendulumTotalEnergy(firstDoubleSim.state, firstDoubleSim.parameters)
    : null;
  
  const contourSegments = useMemo(() => {
    if (!firstDoubleSim || totalEnergy === null) {
      return [];
    }

    const kineticMarginField = (theta1: number, theta2: number) =>
      totalEnergy - computeDoublePendulumPotential(theta1, theta2, firstDoubleSim.parameters);

    const levels = buildContourLevels(kineticMarginField, 80, 16);

    return buildContourSegments(kineticMarginField, levels, 60);
  }, [firstDoubleSim?.parameters.length1,
  firstDoubleSim?.parameters.length2,
  firstDoubleSim?.parameters.massRatio,
  firstDoubleSim?.parameters.gravity, totalEnergy,]);

  const drawScene = useCallback(
    (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      ctx.clearRect(0, 0, width, height);

      if (contourSegments.length > 0) {
        drawContourSegments(ctx, width, height, contourSegments);
      }
      
      drawConfigurationAxes(ctx, width, height);

      for (const sim of simulations) {
        const theta1 = sim.state[0];
        const theta2 = sim.state[2];
        const currentConfigurationPoint = {
          x: theta1,
          y: isDoubleState(sim.state) ? theta2 : 0,
        };
        
        renderLagrangeScene(
          ctx,
          width,
          height,
          sim.lagrangeTrace,
          currentConfigurationPoint,
          sim.color,
          traceLength
        );
      }
    },
    [simulations, contourSegments, traceLength]
  );

  return (
    <div className="panel-container">
      <TraceLengthSlider
        value={traceLength} 
        onChange={setTraceLength} 
        style={{ position: 'absolute', top: 16, right: 16, zIndex: 10 }}
        max = {TRACE_POINTS_LAGRANGE}
      />
      <CanvasPanel onDraw={drawScene} />

      <img
        src="/images/lagrange.png"
        alt="Joseph-Louis Lagrange"
        className="physicist-image"
        style={{right:0}}
      />
    </div>
  );
}

export default LagrangePanel;