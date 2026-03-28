import { ControlBarContainer, InstructionLabel, ActiveSimulationButtons, MassRatioControl } from '../PhysicalControls';
import '../../../styles/Controls.css';

type NewtonControlsProps = {
  instructionMessage: string; canStartSimulation: boolean; hasSimulations: boolean;
  isPaused: boolean; onPlay: () => void; onTogglePause: () => void; onReset: () => void;
  massRatio: number; onMassRatioChange: (value: number) => void; showDoubleOptions: boolean;
};

export default function NewtonControls({
  instructionMessage, canStartSimulation, hasSimulations, isPaused,
  onPlay, onTogglePause, onReset, massRatio, onMassRatioChange, showDoubleOptions
}: NewtonControlsProps) {
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
        <ActiveSimulationButtons isPaused={isPaused} onTogglePause={onTogglePause} onReset={onReset} />
      )}

      {showDoubleOptions && !hasSimulations && (
        <MassRatioControl massRatio={massRatio} onChange={onMassRatioChange} />
      )}
    </ControlBarContainer>
  );
}