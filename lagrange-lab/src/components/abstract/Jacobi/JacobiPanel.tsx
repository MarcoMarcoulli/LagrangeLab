import '../../../styles/Panel.css';
import { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { TrackballControls } from '@react-three/drei';
import type { PendulumSimulationItem } from '../../../simulation/PendulumSimulationItem';
import { isDoubleState } from '../../../utils/TypeGuards';

import { Torus } from './Torus';
import { TorusAxes } from './TorusAxes';
import { JacobiTrace } from './JacobiTrace';

import { computeDoublePendulumTotalEnergy } from '../../../simulation/models/DoublePendulum';

type JacobiPanelProps = {
  simulations: PendulumSimulationItem[];
};

function JacobiPanel({ simulations }: JacobiPanelProps) {

  // filter only double pendulums
  const doublePendulumSims = simulations.filter(sim => isDoubleState(sim.state));
  
  // the torus should be colored only if there is one double pendulum simulating
  const activeSim = doublePendulumSims.length === 1 ? doublePendulumSims[0] : null;

  const numDoubleSims = simulations.filter(sim => isDoubleState(sim.state)).length;
  const useColorfulMapStyle = numDoubleSims === 1;

  const totalEnergy = useMemo(() =>
  {
    if (!activeSim || !isDoubleState(activeSim.state)) return null;

    return computeDoublePendulumTotalEnergy(activeSim.state, activeSim.parameters);
    
  }, [activeSim?.id]);

  return (
    <div className="panel-container" style={{ touchAction: 'none' }}>
      
      <Canvas camera={{ position: [2, -8, 6], fov: 45 }}>

        <ambientLight intensity={0.3} />
        <directionalLight position={[5, 5, 5]} intensity={1.2} castShadow />
        <pointLight position={[-5, 5, -5]} intensity={0.5} color="#444" />
        <spotLight position={[0, 10, 0]} angle={0.3} penumbra={1} intensity={1} />

        <TrackballControls makeDefault rotateSpeed={4.0} dynamicDampingFactor={0.1} />

        <Torus
          key={activeSim ? activeSim.id : 'empty'} 
          parameters={activeSim ? activeSim.parameters : null} 
          totalEnergy={totalEnergy}

          useColorfulMapStyle={useColorfulMapStyle}
        />
        <TorusAxes />

        {simulations.map((sim) => (
          <JacobiTrace
            key={sim.id} 
            // Usiamo la traccia 3D pre-calcolata dal motore fisico!
            trace={sim.jacobiTrace} 
            color={sim.color}
          />
        ))}
      </Canvas>

      <img
        src="/images/jacobi.png"
        alt="Carl Gustav Jacob Jacobi"
        className="physicist-image"
        style={{right:0}}
      />
    </div>
  );
}

export default JacobiPanel;