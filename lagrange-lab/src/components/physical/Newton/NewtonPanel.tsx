import '../../../styles/Panel.css';
import { useCallback, useState, useMemo } from 'react';
import CanvasPanel from '../../canvas/CanvasPanel';
import NewtonControls from './NewtonControls';
import type { PendulumSimulationItem } from '../../../simulation/PendulumSimulationItem';
import type { Point } from '../../../types/Geometry';

import { useCanvasViewport } from '../../../hooks/useCanvasViewport';

import { drawMass, drawPivot, drawRod } from '../../../utils/Draw/DrawUtils';

import { 
  renderSimplePendulumScene, 
  renderDoublePendulumScene 
} from '../../../rendering/physical/PhysicalRenderer';

import { computeMass1Position } from '../../../simulation/models/PendulumCommon';
import { computeMass2Position } from '../../../simulation/models/DoublePendulum';

import { isDoubleState } from '../../../utils/TypeGuards';

import { generateColor } from '../../../utils/Draw/ColorUtils';

type NewtonPanelProps = {
  simulations: PendulumSimulationItem[];
  hasSimulations: boolean;
  isPaused: boolean;
  gravity: number;
  onGravityChange: (newGravity: number) => void;
  addSimulation: (
    pivot: Point,
    mass1: Point,
    mass2: Point | null,
    color: string,
    massRatio: number,
  ) => void;
  togglePause: () => void;
  reset: () => void;
  restart: () => void;
};

function NewtonPanel({
  simulations,
  hasSimulations,
  isPaused,
  gravity,      
  onGravityChange,
  addSimulation,
  togglePause,
  reset,
  restart,
}: NewtonPanelProps)
{
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [mass1, setMass1] = useState<Point | null>(null);
  const [mass2, setMass2] = useState<Point | null>(null);
  const [massRatio, setMassRatio] = useState(1);
  const [draftColor, setDraftColor] = useState<string>(() => generateColor());
  const [traceLength, setTraceLength] = useState(50);

  const { viewport, handleWheel, screenToWorld } = useCanvasViewport();

  const pivot: Point = useMemo(() => ({
    x: canvasSize.width / 2,
    y: canvasSize.height * 0.4,
  }), [canvasSize.width, canvasSize.height]);

  const instructionMessage = useMemo(() => {
    if (!mass1) {
      return isPaused
        ? 'Simulations paused'
        : 'Click to place the first mass';
    }

    if (!mass2) {
      return 'Start simulation or click to place the second mass';
    }

    return 'Press Play to start the double pendulum';
  }, [mass1, mass2, isPaused]);

  const resetDraft = useCallback(() => {
    setMass1(null);
    setMass2(null);
    setMassRatio(1);
    setDraftColor(generateColor());
  }, []);

  const handleCanvasClick = useCallback((point: Point) => {
    const worldPoint = screenToWorld(point);
    if (!mass1)
    {
      setMass1(worldPoint);
    }
    else if (!mass2)
    {
      setMass2(worldPoint);
    }
  }, [mass1, mass2, screenToWorld]);

  const drawScene = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.clearRect(0, 0, width, height);

    ctx.save();
    ctx.translate(viewport.offsetX, viewport.offsetY);
    ctx.scale(viewport.scale, viewport.scale);

    drawPivot(ctx, pivot);

    for (const simulation of simulations)
    {
      const { state, parameters, newtonTrace, color } = simulation;
      const slicedTrace = traceLength === 0 ? [] : newtonTrace.slice(-traceLength);

      if (isDoubleState(state)) 
      {
        const m1 = computeMass1Position(pivot, state, parameters);
        const m2 = computeMass2Position(pivot, state, parameters);
        renderDoublePendulumScene(
          ctx,
          pivot,
          m1,
          m2,
          slicedTrace,
          parameters.massRatio ?? 1,
          color
        );
      }
      else
      {
        const mPos = computeMass1Position(pivot, state, parameters);
        renderSimplePendulumScene(ctx, pivot, mPos, newtonTrace.slice(-traceLength), color);
      }
    }

    if (mass1)
    {
      drawRod(ctx, pivot, mass1, draftColor);
      drawMass(ctx, mass1, draftColor, true);
    }

    if (mass1 && mass2)
    {
      drawRod(ctx, mass1, mass2, draftColor);
      drawMass(ctx, mass2, draftColor, true, massRatio);
    }

    ctx.restore();
  }, [simulations, pivot, mass1, mass2, massRatio, draftColor, viewport, traceLength]);

  const handlePlay = useCallback(() => {
    if (!mass1) {
      return;
    }

    addSimulation(pivot, mass1, mass2, draftColor, massRatio);
    resetDraft();
  }, [mass1, mass2, draftColor, massRatio, pivot, addSimulation, resetDraft]);

  const handleReset = useCallback(() => {
    reset();
    resetDraft();
  }, [reset, resetDraft]);

  const handleResize = useCallback((w: number, h: number) => {
    setCanvasSize(prev =>
      prev.width === w && prev.height === h ? prev : { width: w, height: h }
    );
  }, []);

  return (
    <div className="panel-content-wrapper">
      <NewtonControls
        instructionMessage={instructionMessage}
        canStartSimulation={!!mass1}
        hasSimulations={hasSimulations}
        isPaused={isPaused}
        massRatio={massRatio}
        onMassRatioChange={setMassRatio}
        showDoubleOptions={!!mass2}
        onPlay={handlePlay}
        onTogglePause={togglePause}
        onReset={handleReset}
        onRestart={restart}
        gravity={gravity}
        onGravityChange={onGravityChange}
        traceLength={traceLength}
        onTraceLengthChange={setTraceLength}
      />

      <CanvasPanel
        onDraw={drawScene}
        onCanvasClick={handleCanvasClick}
        onWheel={handleWheel}
        onResize={handleResize}
      />

      <img
        src="/images/newton.png"
        alt="Isaac Newton"
        className="physicist-image"
        style={{ left: 0 }}
      />
    </div>
  );
}

export default NewtonPanel;