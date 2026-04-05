import React from 'react';

type TraceLengthSliderProps = {
  value: number;
  onChange: (newValue: number) => void;
  max?: number;
  style?: React.CSSProperties;
};

export default function TraceLengthSlider({ 
  value,
  onChange,
  max = 30,
  style
}: TraceLengthSliderProps) {
  const percentage = Math.round((value / max) * 100);
  return (
      <div style={style}>
      <div className="sliders-wrapper" style={{ padding: '8px 16px', minWidth: '60px' }}>
        <div className="control-group">
          <label className="slider-label" style={{ margin: 0, marginBottom: '4px' }}>
            Tail Length : <strong>{percentage}%</strong>
          </label>
          <input 
            type="range" 
            min="0" 
            max={max} 
            step="1" 
            value={value} 
            onChange={(e) => onChange(parseInt(e.target.value))}
          />
        </div>
      </div>
    </div>
  );
}