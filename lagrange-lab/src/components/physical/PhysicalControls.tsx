type PhysicalControlsProps = {
  instructionMessage: string;
  canStartSimulation: boolean;
  isSimulating: boolean;
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
  isSimulating,
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
        top: 16,
        left: 16,
        zIndex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        alignItems: 'flex-start',
      }}
    >
      <div
        style={{
          padding: '8px 12px',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          border: '1px solid #ccc',
          borderRadius: 8,
          fontSize: 14,
          fontWeight: 500,
        }}
      >
        {instructionMessage}
      </div>

      {canStartSimulation && !isSimulating && (
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
          }}
        >
          Play
        </button>
      )}

      {isSimulating && (
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
            }}
          >
            Reset
          </button>
        </div>
      )}

      {showDoubleOptions && (
        <div className="control-group">
          <label style={{ display: 'inline-block', width: '160px' }}>
            Rapporto Masse: <strong>{massRatio.toFixed(1)}</strong>
          </label>
          <input 
            type="range" 
            min="0.1" 
            max="10" 
            step="0.1" 
            value={massRatio} 
            onChange={(e) => onMassRatioChange(parseFloat(e.target.value))}
          />
        </div>
      )}
    </div>
  );
}

export default PhysicalControls;