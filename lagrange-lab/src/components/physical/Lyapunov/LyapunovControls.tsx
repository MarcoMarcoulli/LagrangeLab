import { ControlBarContainer, InstructionLabel, PauseResumeButton, ResetButton, RestartButton, MassRatioControl, GravityControl } from '../PhysicalControls';
import '../../../styles/Controls.css';
import TraceLengthSlider from '../../TraceLengthSlider';

type LyapunovControlsProps = {
  instructionMessage: string;
  canStartSimulation: boolean;
  hasSimulations: boolean;
  isPaused: boolean;
  onPlayChaos: () => void;
  onTogglePause: () => void;
  onReset: () => void;
  onRestart: () => void;
  massRatio: number;
  onMassRatioChange: (value: number) => void;
  showDoubleOptions: boolean;
  
  swarmSize: number;
  onSwarmSizeChange: (value: number) => void;
  delta: number;
  onEpsilonChange: (value: number) => void;

  gravity: number; 
  onGravityChange: (value: number) => void;

  traceLength: number;
  onTraceLengthChange: (value: number) => void;
};

export default function LyapunovControls({
  instructionMessage,
  canStartSimulation,
  hasSimulations,
  isPaused,
  onPlayChaos,
  onTogglePause,
  onReset,
  onRestart,
  massRatio,
  onMassRatioChange,
  showDoubleOptions,
  swarmSize,
  onSwarmSizeChange,
  delta,
  onEpsilonChange,
  gravity,
  onGravityChange,
  traceLength,
  onTraceLengthChange
}: LyapunovControlsProps) {
  return (
    <ControlBarContainer>
      <div className="action-column">
        {!hasSimulations && (
          <InstructionLabel text={instructionMessage} />
        )}

        <div className="buttons-row">
          {canStartSimulation && !hasSimulations && (
            <button className="action-btn btn-chaos" onClick={onPlayChaos}>
              Play
            </button>
          )}

          {(canStartSimulation || hasSimulations) && (
            <ResetButton onReset={onReset} />
          )}

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
        </div>
        
      </div>

      {canStartSimulation && !hasSimulations && (
        <div className="sliders-wrapper">
          <div className="control-group">
            <label className="slider-label lyapunov">
              N: <strong>{swarmSize}</strong>
            </label>
            <input type="range" min="2" max="50" step="1" value={swarmSize} onChange={(e) => onSwarmSizeChange(parseInt(e.target.value))} style={{ accentColor: '#b7b7b7' }} />
          </div>
          
          <div className="control-group">
            <label className="slider-label lyapunov">
              Delta: <strong>{delta.toFixed(4)}</strong>
            </label>
            <input type="range" min="0.0001" max="0.03" step="0.0001" value={delta} onChange={(e) => onEpsilonChange(parseFloat(e.target.value))} style={{ accentColor: '#bcbbbc' }} />
          </div>
        </div>
      )}

      {showDoubleOptions && !hasSimulations && (
        <MassRatioControl massRatio={massRatio} onChange={onMassRatioChange} />
      )}

      <GravityControl gravity={gravity} onChange={onGravityChange} />
      
      {hasSimulations &&<TraceLengthSlider
        value={traceLength}
        onChange={onTraceLengthChange}
        style={{ display: 'flex', alignItems: 'center' }}
      />}
    </ControlBarContainer>
  );
}