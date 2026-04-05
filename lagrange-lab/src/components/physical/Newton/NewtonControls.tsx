import { ControlBarContainer, InstructionLabel, ActiveSimulationButtons, MassRatioControl, GravityControl } from '../PhysicalControls';
import '../../../styles/Controls.css';

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
};

export default function NewtonControls({
  instructionMessage, canStartSimulation, hasSimulations, isPaused,
  onPlay, onTogglePause, onReset, onRestart, massRatio, onMassRatioChange, showDoubleOptions, gravity, onGravityChange
}: NewtonControlsProps) {
  const showGravitySlider = (!hasSimulations && !showDoubleOptions) || (hasSimulations && !canStartSimulation);
  
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

      {hasSimulations && (
        <>
        <ActiveSimulationButtons isPaused={isPaused} onTogglePause={onTogglePause} onReset={onReset} />
        <button 
            onClick={onRestart} 
            className="action-btn btn-restart"
          >
            Restart
          </button>
        </>
      )}

      {showDoubleOptions && (
        <MassRatioControl massRatio={massRatio} onChange={onMassRatioChange} />
      )}

      {showGravitySlider && (
        <GravityControl gravity={gravity} onChange={onGravityChange} />
      )}
    </ControlBarContainer>
  );
}