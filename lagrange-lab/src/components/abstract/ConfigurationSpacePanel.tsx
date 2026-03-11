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
    </div>
  );
}

export default ConfigurationSpacePanel;