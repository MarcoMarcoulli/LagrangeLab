import type { ReactNode } from 'react';
import { massRatioToSlider, sliderToMassRatio, SLIDER_MIN, SLIDER_MAX } from "../../utils/Draw/SliderUtils";
import '../../styles/Controls.css';

export function ControlBarContainer({ children }: { children: ReactNode }) {
  return (
    <div className="control-bar-container">
      {children}
    </div>
  );
}

export function InstructionLabel({ text }: { text: string }) {
  return (
    <div className="instruction-label">
      {text}
    </div>
  );
}

export function PauseResumeButton({ 
  isPaused, 
  onTogglePause 
}: { 
  isPaused: boolean; 
  onTogglePause: () => void; 
}) {
  return (
    <button
      onClick={onTogglePause}
      className={`action-btn ${isPaused ? 'btn-resume' : 'btn-pause'}`}
    >
      {isPaused ? 'Resume' : 'Pause'}
    </button>
  );
}

export function ResetButton({ 
  onReset 
}: { 
  onReset: () => void; 
}) {
  return (
    <button
      onClick={onReset}
      className="action-btn btn-reset"
    >
      Reset
    </button>
  );
}

export function RestartButton({ 
  onRestart 
}: { 
  onRestart: () => void; 
}) {
  return (
    <button
      onClick={onRestart}
      className="action-btn btn-restart"
    >
      Restart
    </button>
  );
}

// Mass ratio slider
export function MassRatioControl({ 
  massRatio, onChange 
}: { 
  massRatio: number; onChange: (v: number) => void;
}) {
  return (
    <div className="sliders-wrapper">
      <label className="slider-label">
        Mass Ratio: <strong>{massRatio.toFixed(2)}</strong>
      </label>
      
      <input
        type="range" min={SLIDER_MIN} max={SLIDER_MAX} step="1" 
        value={massRatioToSlider(massRatio)} 
        onChange={(e) => onChange(sliderToMassRatio(parseFloat(e.target.value)))}
      />
    </div>
  );
}

export function GravityControl({ 
  gravity, onChange 
}: { 
  gravity: number; onChange: (v: number) => void;
}) {
  return (
    <div className="sliders-wrapper">
      <label className="slider-label">
        Gravity: <strong>{gravity.toFixed(2)}</strong>
      </label>
      
      <input
        style={{ accentColor: '#ff4757' }}
        type="range" min="0.1" max="30" step="0.1" 
        value={gravity} 
        onChange={(e) => onChange(parseFloat(e.target.value))}
      />
    </div>
  );
}