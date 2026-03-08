import { useCallback, useState, useMemo } from 'react';
import CanvasPanel from '../canvas/CanvasPanel';
import PhysicalControls from './PhysicalControls';
import { usePendulumSimulation } from '../../hooks/usePendulumSimulation';
import type { Point } from '../../types/geometry';

import { drawMass, drawPivot, drawRod } from '../../utils/DrawUtils';

import { renderSimplePendulumScene } from '../../rendering/physical/SimplePendulumRenderer';
import { renderDoublePendulumScene } from '../../rendering/physical/DoublePendulumRenderer';

import { computeMass1Position } from '../../simulation/models/PendulumCommon';
import { computeMass2Position } from '../../simulation/models/DoublePendulum';

import { isDoubleState } from '../../utils/TypeGuards';

function PhysicalPanel() {
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [mass1, setMass1] = useState<Point | null>(null);
  const [mass2, setMass2] = useState<Point | null>(null);
  const [massRatio, setMassRatio] = useState(1);

  const pivot: Point = useMemo(() => ({
    x: canvasSize.width / 2,
    y: canvasSize.height * 0.35,
  }), [canvasSize.width, canvasSize.height]);

  const {
    pendulumState,
    pendulumParameters,
    trace,
    isSimulating,
    isPaused,
    start,
    togglePause,
    reset,
  } = usePendulumSimulation();

  const handleCanvasClick = useCallback((point: Point) => {
    if (isSimulating) return;
    if (!mass1) setMass1(point);
    else if (!mass2) setMass2(point);
  }, [isSimulating, mass1, mass2]);

  const drawScene = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.clearRect(0, 0, width, height);

    if (!isSimulating) {
      drawPivot(ctx, pivot);
      if (mass1) {
        drawRod(ctx, pivot, mass1);
        drawMass(ctx, mass1);
      }
      if (mass1 && mass2) {
        drawRod(ctx, mass1, mass2);
        drawMass(ctx, mass2, massRatio);
      }
    }
    else if (pendulumState && pendulumParameters)
    {
      if (isDoubleState(pendulumState))
      { 
        const m1 = computeMass1Position(pivot, pendulumState, pendulumParameters);
        const m2 = computeMass2Position(pivot, pendulumState, pendulumParameters);
        renderDoublePendulumScene(ctx, pivot, m1, m2, trace, (pendulumParameters.massRatio ?? 0));
      }
      else
      {
        const mPos = computeMass1Position(
          pivot, 
          pendulumState, 
          pendulumParameters
        );
        renderSimplePendulumScene(ctx, pivot, mPos, trace);
      }
    }
  }, [isSimulating, mass1, mass2, massRatio, pendulumState, pendulumParameters, trace, pivot]);

  const getInstructionMessage = () => {
    if (isSimulating && isPaused) return 'Simulazione in pausa.';
    if (isSimulating) return 'Simulazione in corso...';
    if (!mass1) return 'Clicca per posizionare la prima massa';
    if (!mass2) return 'Avvia la simulazione del pendolo semplice o aggiungi la seconda massa';
    return 'Avvia simulazione del doppio pendolo';
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <PhysicalControls
        instructionMessage={getInstructionMessage()}
        canStartSimulation={!!mass1}
        isSimulating={isSimulating}
        isPaused={isPaused}
        massRatio={massRatio}
        onMassRatioChange={setMassRatio}
        showDoubleOptions={!!mass2 && !isSimulating}
        onPlay={() => start(pivot, mass1!, mass2, massRatio)}
        onTogglePause={togglePause}
        onReset={() => {
          reset();
          setMass1(null);
          setMass2(null);
          setMassRatio(1);
        }}
      />

      <CanvasPanel
        onDraw={drawScene}
        onCanvasClick={handleCanvasClick}
        onResize={(w, h) => setCanvasSize({ width: w, height: h })}
      />
    </div>
  );
}

export default PhysicalPanel;