import { ControlBarContainer, InstructionLabel, ActiveSimulationButtons, MassRatioControl } from '../PhysicalControls';
import '../../../styles/Controls.css';

type LyapunovControlsProps = {
  instructionMessage: string;
  canStartSimulation: boolean;
  hasSimulations: boolean;
  isPaused: boolean;
  onPlayChaos: () => void;
  onTogglePause: () => void;
  onReset: () => void;
  massRatio: number;
  onMassRatioChange: (value: number) => void;
  showDoubleOptions: boolean;
  
  swarmSize: number;
  onSwarmSizeChange: (value: number) => void;
  epsilonExponent: number;
  onEpsilonChange: (value: number) => void;
};

export default function LyapunovControls({
  instructionMessage,
  canStartSimulation,
  hasSimulations,
  isPaused,
  onPlayChaos,
  onTogglePause,
  onReset,
  massRatio,
  onMassRatioChange,
  showDoubleOptions,
  swarmSize,
  onSwarmSizeChange,
  epsilonExponent,
  onEpsilonChange
}: LyapunovControlsProps) {
  return (
    <ControlBarContainer>
      <InstructionLabel text={instructionMessage} />

      {/* BOTTONE PLAY CAOS */}
      {canStartSimulation && !hasSimulations && (
        <button className="action-btn btn-chaos" onClick={onPlayChaos}>
          Scatena il Caos
        </button>
      )}

      {hasSimulations && (
        <ActiveSimulationButtons isPaused={isPaused} onTogglePause={onTogglePause} onReset={onReset} />
      )}

      {/* SLIDER DELLO SCIAME */}
      {canStartSimulation && !hasSimulations && (
        <div className="sliders-wrapper">
          <div className="control-group">
            <label className="slider-label lyapunov-color" style={{ width: '130px' }}>
              Sciame: <strong>{swarmSize}</strong>
            </label>
            <input type="range" min="2" max="100" step="1" value={swarmSize} onChange={(e) => onSwarmSizeChange(parseInt(e.target.value))} style={{ accentColor: '#9c27b0' }} />
          </div>
          
          <div className="control-group">
            <label className="slider-label lyapunov-color" style={{ width: '150px' }}>
              Delta (ε): <strong>10^{epsilonExponent}</strong>
            </label>
            <input type="range" min="-4" max="-1" step="1" value={epsilonExponent} onChange={(e) => onEpsilonChange(parseInt(e.target.value))} style={{ accentColor: '#9c27b0' }} />
          </div>
        </div>
      )}

      {showDoubleOptions && !hasSimulations && (
        <MassRatioControl massRatio={massRatio} onChange={onMassRatioChange} />
      )}
    </ControlBarContainer>
  );
}