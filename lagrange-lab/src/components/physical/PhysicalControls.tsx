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

export function ActiveSimulationButtons({ 
  isPaused, onTogglePause, onReset 
}: { 
  isPaused: boolean; onTogglePause: () => void; onReset: () => void;
}) {
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <button
        onClick={onTogglePause}
        className={`action-btn ${isPaused ? 'btn-resume' : 'btn-pause'}`}
      >
        {isPaused ? 'Riprendi' : 'Pausa'}
      </button>
      
      <button
        onClick={onReset}
        className="action-btn btn-reset"
      >
        Reset
      </button>
    </div>
  );
}

// 4. SLIDER RAPPORTO MASSE
export function MassRatioControl({ 
  massRatio, onChange 
}: { 
  massRatio: number; onChange: (v: number) => void;
}) {
  return (
    <div className="sliders-wrapper">
      <label className="slider-label" style={{ width: '120px' }}>
        Rapporto Masse: <strong>{massRatio.toFixed(2)}</strong>
      </label>
      
      <input
        style={{ width: '200px' }}  
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
      <label className="slider-label" style={{ width: '80px' }}>
        Gravità: <strong>{gravity.toFixed(2)}</strong>
      </label>
      
      <input
        style={{ width: '100px', accentColor: '#ff4757' }}
        type="range" min="0.1" max="30" step="0.1" 
        value={gravity} 
        onChange={(e) => onChange(parseFloat(e.target.value))}
      />
    </div>
  );
}