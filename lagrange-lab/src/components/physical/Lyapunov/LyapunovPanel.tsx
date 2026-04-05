import '../../../styles/Panel.css';
import { useCallback, useState, useMemo } from 'react';
import CanvasPanel from '../../canvas/CanvasPanel';
import LyapunovControls from './LyapunovControls'; 
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

type LyapunovPanelProps = {
  simulations: PendulumSimulationItem[];
  hasSimulations: boolean;
  isPaused: boolean;
  gravity: number;
  onGravityChange: (newGravity: number) => void;
  addChaosSwarm: (
    pivot: Point,
    mass1: Point,
    mass2: Point | null,
    baseColor: string,
    massRatio: number,
    swarmSize: number,
    epsilon: number
  ) => void;
  togglePause: () => void;
  reset: () => void;
  restart: () => void;
};

export default function LyapunovPanel({
  simulations,
  hasSimulations,
  isPaused,
  gravity,      
  onGravityChange,
  addChaosSwarm,
  togglePause,
  reset,
  restart,
}: LyapunovPanelProps) {
  
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [mass1, setMass1] = useState<Point | null>(null);
  const [mass2, setMass2] = useState<Point | null>(null);
  const [massRatio, setMassRatio] = useState(1);
  const [draftColor, setDraftColor] = useState<string>(() => generateColor());

  const [swarmSize, setSwarmSize] = useState(10);
  const [delta, setDelta] = useState(0.0001);

  const { viewport, handleWheel, screenToWorld } = useCanvasViewport();

  const pivot: Point = useMemo(() => ({
    x: canvasSize.width / 2,
    y: canvasSize.height * 0.35,
  }), [canvasSize.width, canvasSize.height]);

  const instructionMessage = useMemo(() => {
    if (!mass1)
    {
      return isPaused
        ? 'Simulations paused'
        : 'Click to place the first mass';
    }
    if (!mass2) {
      return 'Click to place the second mass or set the swarm of pendulums';
    }
    return 'Press Play to start the swarm of pendulums.';
  }, [mass1, mass2, isPaused]);

  const resetDraft = useCallback(() => {
    setMass1(null);
    setMass2(null);
    setMassRatio(1);
    setDraftColor(generateColor());
  }, []);

  const handleCanvasClick = useCallback((point: Point) => {
    const worldPoint = screenToWorld(point);
    if (!mass1) setMass1(worldPoint);
    else if (!mass2) setMass2(worldPoint);
  }, [mass1, mass2, screenToWorld]);

  const drawScene = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.clearRect(0, 0, width, height);

    ctx.save();
    ctx.translate(viewport.offsetX, viewport.offsetY);
    ctx.scale(viewport.scale, viewport.scale);

    drawPivot(ctx, pivot);

    if (simulations.length > 0) {
      for (let i = 1; i < simulations.length; i++)
      {
        const sim = simulations[i];
        if (isDoubleState(sim.state))
        {
          const m1 = computeMass1Position(pivot, sim.state, sim.parameters);
          const m2 = computeMass2Position(pivot, sim.state, sim.parameters);
          renderDoublePendulumScene(ctx, pivot, m1, m2, sim.newtonTrace, sim.parameters.massRatio ?? 1, sim.color);
        }
        else
        {
          const mPos = computeMass1Position(pivot, sim.state, sim.parameters);
          renderSimplePendulumScene(ctx, pivot, mPos, sim.newtonTrace, sim.color);
        }
      }

      const leader = simulations[0];
      if (isDoubleState(leader.state)) {
        const m1 = computeMass1Position(pivot, leader.state, leader.parameters);
        const m2 = computeMass2Position(pivot, leader.state, leader.parameters);
        renderDoublePendulumScene(ctx, pivot, m1, m2, leader.newtonTrace, leader.parameters.massRatio ?? 1, leader.color);
      } else {
        const mPos = computeMass1Position(pivot, leader.state, leader.parameters);
        renderSimplePendulumScene(ctx, pivot, mPos, leader.newtonTrace, leader.color);
      }
    }

    if (mass1 && !hasSimulations) {
      const dx1 = mass1.x - pivot.x;
      const dy1 = mass1.y - pivot.y;
      const L1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
      const baseTheta1 = Math.atan2(dx1, dy1);

      for (let i = 1; i < swarmSize; i++)
      {
        const pTheta1 = (!mass2) ? baseTheta1 + (i * delta) : baseTheta1;
        const pMass1 = { x: pivot.x + L1 * Math.sin(pTheta1), y: pivot.y + L1 * Math.cos(pTheta1) };
        const previewColor = `hsl(${(i * 137.5) % 360}, 70%, 60%)`;

        drawRod(ctx, pivot, pMass1, previewColor);
        drawMass(ctx, pMass1, previewColor, true);

        if (mass2)
        {
          const dx2 = mass2.x - mass1.x;
          const dy2 = mass2.y - mass1.y;
          const L2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
          const baseTheta2 = Math.atan2(dx2, dy2) + (i * delta);
          const pMass2 = { x: pMass1.x + L2 * Math.sin(baseTheta2), y: pMass1.y + L2 * Math.cos(baseTheta2) };
          drawRod(ctx, pMass1, pMass2, previewColor);
          drawMass(ctx, pMass2, previewColor, true, massRatio);
        }
      }

      const lM1 = { x: pivot.x + L1 * Math.sin(baseTheta1), y: pivot.y + L1 * Math.cos(baseTheta1) };
      drawRod(ctx, pivot, lM1, draftColor);
      drawMass(ctx, lM1, draftColor, true);

      if (mass2)
      {
        const dx2 = mass2.x - mass1.x;
        const dy2 = mass2.y - mass1.y;
        const L2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
        const baseTheta2 = Math.atan2(dx2, dy2);
        const lM2 = { x: lM1.x + L2 * Math.sin(baseTheta2), y: lM1.y + L2 * Math.cos(baseTheta2) };
        drawRod(ctx, lM1, lM2, draftColor);
        drawMass(ctx, lM2, draftColor, true, massRatio);
      }
    }

    ctx.restore();
  }, [simulations, pivot, mass1, mass2, massRatio, draftColor, viewport, hasSimulations, swarmSize, delta]);

  const handlePlayChaos = useCallback(() => {
    if (!mass1) return;
    addChaosSwarm(pivot, mass1, mass2, draftColor, massRatio, swarmSize, delta);
    resetDraft();
  }, [mass1, mass2, draftColor, massRatio, pivot, addChaosSwarm, resetDraft, swarmSize, delta]);

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
      <LyapunovControls
        instructionMessage={instructionMessage}
        canStartSimulation={!!mass1}
        hasSimulations={hasSimulations}
        isPaused={isPaused}
        massRatio={massRatio}
        onMassRatioChange={setMassRatio}
        showDoubleOptions={!!mass2}
        swarmSize={swarmSize}
        onSwarmSizeChange={setSwarmSize}
        delta={delta}
        onEpsilonChange={setDelta}
        onPlayChaos={handlePlayChaos}
        onTogglePause={togglePause}
        onReset={handleReset}
        onRestart={restart}
        gravity={gravity}           
        onGravityChange={onGravityChange}
      />

      <CanvasPanel
        onDraw={drawScene}
        onCanvasClick={handleCanvasClick}
        onWheel={handleWheel}
        onResize={handleResize}
      />

      <img
        src="/images/lyapunov.png"
        alt="Aleksandr Lyapunov"
        className="physicist-image"
      />
    </div>
  );
}