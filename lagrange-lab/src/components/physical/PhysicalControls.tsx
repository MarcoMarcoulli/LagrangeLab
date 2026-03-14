import {
  massRatioToSlider,
  sliderToMassRatio,
  SLIDER_MIN,
  SLIDER_MAX} from "../../utils/SliderUtils";

type PhysicalControlsProps = {
  instructionMessage: string;
  canStartSimulation: boolean;
  hasSimulations: boolean;
  isPaused: boolean;
  onPlay: () => void;
  onTogglePause: () => void;
  onReset: () => void;
  massRatio: number;
  onMassRatioChange: (value: number) => void;
  showDoubleOptions: boolean;
};

function PhysicalControls({
  instructionMessage,
  canStartSimulation,
  hasSimulations,
  isPaused,
  onPlay,
  onTogglePause,
  onReset,
  massRatio,
  onMassRatioChange,
  showDoubleOptions
}: PhysicalControlsProps) {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1,
        display: 'flex',
        flexDirection: 'row', 
        gap: '20px',        
        alignItems: 'center',
        justifyContent: 'center',
        padding: '12px 24px',
        backgroundColor: 'transparent', 
        borderBottom: '1px solid #ccc',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          padding: '8px 12px',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          borderRadius: 1,
          fontSize: 14,
          fontWeight: 500,
          color: 'black',
        }}
      >
        {instructionMessage}
      </div>

      {canStartSimulation && (
        <button
          onClick={onPlay}
          style={{
            padding: '8px 14px',
            borderRadius: 8,
            border: '1px solid #888',
            backgroundColor: '#4CAF50',
            color: 'white',
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 'bold',
            pointerEvents: 'auto',
          }}
        >
          Play
        </button>
      )}

      {hasSimulations && (
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={onTogglePause}
            style={{
              padding: '8px 14px',
              borderRadius: 8,
              border: '1px solid #888',
              backgroundColor: isPaused ? '#2196F3' : '#FF9800',
              color: 'white',
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 'bold',
              pointerEvents: 'auto',
            }}
          >
            {isPaused ? 'Riprendi' : 'Pausa'}
          </button>

          <button
            onClick={onReset}
            style={{
              padding: '8px 14px',
              borderRadius: 8,
              border: '1px solid #888',
              backgroundColor: '#f44336',
              color: 'white',
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 'bold',
              pointerEvents: 'auto',
            }}
          >
            Reset
          </button>
        </div>
      )}

      {showDoubleOptions && (
        <div className="control-group" style={{ pointerEvents: 'auto' }}>
          <label style={{ display: 'inline-block', width: '160px' }}>
            Rapporto Masse: <strong>{massRatio.toFixed(2)}</strong>
          </label>
          <input 
            type="range" 
            min= {SLIDER_MIN}
            max= {SLIDER_MAX}
            step="1" 
            value={massRatioToSlider(massRatio)} 
            onChange={(e) => {
              const sliderValue = parseFloat(e.target.value);
              onMassRatioChange(sliderToMassRatio(sliderValue));
            }}
          />
        </div>
      )}
    </div>
  );
}

export default PhysicalControls;