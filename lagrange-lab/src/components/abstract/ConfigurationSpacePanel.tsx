import type { PendulumSimulationItem } from '../../simulation/PendulumSimulationItem';

type ConfigurationSpacePanelProps = {
  simulations: PendulumSimulationItem[];
};

function ConfigurationSpacePanel({
  simulations,
}: ConfigurationSpacePanelProps) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 18,
        color: '#444',
      }}
    >
      Spazio delle configurazioni ({simulations.length} simulazioni)

      <img
        src="/images/lagrange.png"
        alt="Isaac Newton"
        style={{
          position: 'absolute',
          right:0,
          bottom:0,
          width: 150,
          height: 'auto',
          zIndex: 1,
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      />
    </div>
    
  );
}

export default ConfigurationSpacePanel;