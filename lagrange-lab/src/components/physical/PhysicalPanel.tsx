import { useCallback, useState, useMemo } from 'react';
import CanvasPanel from '../canvas/CanvasPanel';
import PhysicalControls from './PhysicalControls';
import type { PendulumSimulationItem } from '../../simulation/PendulumSimulationItem';
import type { Point } from '../../types/geometry';

import { drawMass, drawPivot, drawRod } from '../../utils/DrawUtils';

import { renderSimplePendulumScene } from '../../rendering/physical/SimplePendulumRenderer';
import { renderDoublePendulumScene } from '../../rendering/physical/DoublePendulumRenderer';

import { computeMass1Position } from '../../simulation/models/PendulumCommon';
import { computeMass2Position } from '../../simulation/models/DoublePendulum';

import { isDoubleState } from '../../utils/TypeGuards';

import { generateColor } from '../../utils/ColorUtils';

type PhysicalPanelProps = {
  simulations: PendulumSimulationItem[];
  isSimulating: boolean;
  isPaused: boolean;
  addSimulation: (
    pivot: Point,
    mass1: Point,
    mass2: Point | null,
    color: string,
    massRatio: number,
  ) => void;
  togglePause: () => void;
  reset: () => void;
};

function PhysicalPanel({
  simulations,
  isSimulating,
  isPaused,
  addSimulation,
  togglePause,
  reset,
}: PhysicalPanelProps)
{
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [mass1, setMass1] = useState<Point | null>(null);
  const [mass2, setMass2] = useState<Point | null>(null);
  const [massRatio, setMassRatio] = useState(1);
  const [draftColor, setDraftColor] = useState<string>(() => generateColor());
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastDragPoint, setLastDragPoint] = useState<Point | null>(null);

  const pivot: Point = useMemo(() => ({
    x: canvasSize.width / 2,
    y: canvasSize.height * 0.35,
  }), [canvasSize.width, canvasSize.height]);

  const handleWheel = useCallback((e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    e.stopPropagation();

    setZoom(prev => {
      const factor = e.deltaY < 0 ? 1.1 : 0.9;
      const next = prev * factor;
      return Math.min(5, Math.max(0.2, next));
    });
  }, []);

  const handleMouseDown = useCallback((point: Point, event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!event.shiftKey) {
      return;
    }

    setIsDragging(true);
    setLastDragPoint(point);
  }, []);

  const handleMouseMove = useCallback((point: Point) => {
    if (!isDragging || !lastDragPoint) {
      return;
    }

    const dx = point.x - lastDragPoint.x;
    const dy = point.y - lastDragPoint.y;

    setPan(prev => ({
      x: prev.x + dx,
      y: prev.y + dy,
    }));

    setLastDragPoint(point);
  }, [isDragging, lastDragPoint]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setLastDragPoint(null);
  }, []);

  const handleCanvasClick = useCallback((point: Point) => {
    const worldPoint: Point = {
      x: pivot.x + (point.x - pivot.x - pan.x) / zoom,
      y: pivot.y + (point.y - pivot.y - pan.y) / zoom,
    };
    if (!mass1) setMass1(worldPoint);
    else if (!mass2) setMass2(worldPoint);
  }, [mass1, mass2, pivot, pan, zoom]);

  const drawScene = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.clearRect(0, 0, width, height);

    ctx.save();
    ctx.translate(pivot.x + pan.x, pivot.y + pan.y);
    ctx.scale(zoom, zoom);
    ctx.translate(-pivot.x, -pivot.y);

    drawPivot(ctx, pivot);

    for (const simulation of simulations) {
      const { state, parameters, trace, color } = simulation;

      if (isDoubleState(state)) {
        const m1 = computeMass1Position(pivot, state, parameters);
        const m2 = computeMass2Position(pivot, state, parameters);
        renderDoublePendulumScene(
          ctx,
          pivot,
          m1,
          m2,
          trace,
          parameters.massRatio ?? 1,
          color
        );
      } else {
        const mPos = computeMass1Position(pivot, state, parameters);
        renderSimplePendulumScene(ctx, pivot, mPos, trace, color);
      }
    }

    if (mass1) {
      drawRod(ctx, pivot, mass1, draftColor);
      drawMass(ctx, mass1, draftColor);
    }

    if (mass1 && mass2) {
      drawRod(ctx, mass1, mass2, draftColor);
      drawMass(ctx, mass2, draftColor, massRatio);
    }

    ctx.restore();
  }, [simulations, pivot, mass1, mass2, massRatio, draftColor, zoom, pan]);

  const getInstructionMessage = () => {
    if (!mass1) {
      return isPaused
        ? 'Simulazioni in pausa. Clicca per posizionare la prima massa.'
        : 'Clicca per posizionare la prima massa.';
    }

    if (!mass2) {
      return 'Premi Play per aggiungere un pendolo semplice oppure clicca per posizionare la seconda massa.';
    }

    return 'Premi Play per aggiungere il doppio pendolo.';
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
        showDoubleOptions={!!mass2}
        onPlay={() => {
          if (!mass1) return;

          addSimulation(pivot, mass1, mass2, draftColor, massRatio);

          setMass1(null);
          setMass2(null);
          setMassRatio(1);
          setDraftColor(generateColor());
        }}
        onTogglePause={togglePause}
        onReset={() => {
          reset();
          setMass1(null);
          setMass2(null);
          setMassRatio(1);
          setDraftColor(generateColor());
        }}
      />

      <CanvasPanel
        onDraw={drawScene}
        onCanvasClick={handleCanvasClick}
        onWheel={handleWheel}
        onCanvasMouseDown={handleMouseDown}
        onCanvasMouseMove={handleMouseMove}
        onCanvasMouseUp={handleMouseUp}
        onResize={(w, h) => {
          setCanvasSize(prev =>
            prev.width === w && prev.height === h ? prev : { width: w, height: h }
          );
        }}
      />

      <img
        src="/images/newton.png"
        alt="Isaac Newton"
        style={{
          position: 'absolute',
          left:0,
          bottom:0,
          width: 100,
          height: 'auto',
          zIndex: 1,
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      />
    </div>
  );
}

export default PhysicalPanel;