import { ControlBarContainer, InstructionLabel, PauseResumeButton, ResetButton, RestartButton, MassRatioControl, GravityControl } from '../PhysicalControls';
import '../../../styles/Controls.css';
import TraceLengthSlider from '../../TraceLengthSlider';
import { TRACE_POINTS_NEWTON } from '../../../simulation/PendulumSimulationEngine';

type NewtonControlsProps = {
  instructionMessage: string;
  canStartSimulation: boolean;
  hasSimulations: boolean;
  isPaused: boolean;
  onPlay: () => void;
  onTogglePause: () => void;
  onReset: () => void;
  onRestart: () => void;
  massRatio: number;
  onMassRatioChange: (value: number) => void;
  showDoubleOptions: boolean;
  gravity: number;
  onGravityChange: (value: number) => void;
  traceLength: number;
  onTraceLengthChange: (value: number) => void;
};

export default function NewtonControls({
  instructionMessage,
  canStartSimulation,
  hasSimulations,
  isPaused,
  onPlay,
  onTogglePause,
  onReset,
  onRestart,
  massRatio,
  onMassRatioChange,
  showDoubleOptions,
  gravity,
  onGravityChange,
  traceLength,
  onTraceLengthChange
}: NewtonControlsProps) {
  const showGravitySlider = (!hasSimulations && !showDoubleOptions) || (hasSimulations && !canStartSimulation);
  const showTraceSlider = !(hasSimulations && canStartSimulation);

  return (
    <ControlBarContainer>
      <InstructionLabel text={instructionMessage} />

      {canStartSimulation && (
        <button
          onClick={onPlay}
          className="action-btn btn-play" 
        >
          Play
        </button>
      )}

      {(canStartSimulation || hasSimulations) &&
        <ResetButton 
            onReset={onReset} 
        />
      }

      {hasSimulations && (
        <>
          <PauseResumeButton 
            isPaused={isPaused} 
            onTogglePause={onTogglePause} 
          />

          <RestartButton 
            onRestart={onRestart} 
          />
        </>
      )}

      {showDoubleOptions && (
        <MassRatioControl massRatio={massRatio} onChange={onMassRatioChange} />
      )}

      {showGravitySlider && (
        <GravityControl gravity={gravity} onChange={onGravityChange} />
      )}

      {showTraceSlider && (
        <TraceLengthSlider
          value={traceLength}
          onChange={onTraceLengthChange}
          style={{ display: 'flex', alignItems: 'center' }}
          max = {TRACE_POINTS_NEWTON}
        />
      )}
    </ControlBarContainer>
  );
}