import "./App.css";
import { useState, useCallback } from "react";
import PhysicalPanel from "../components/physical/PhysicalPanel";
import AbstractPanel from "../components/abstract/AbstractPanel";
import { usePendulumSimulation } from "../hooks/usePendulumSimulation";
import { PIXELS_PER_METER } from "../utils/Math/PhysicsConstants";

function App()
{
  const [gravity, setGravity] = useState(9.81);

  const
  {
    simulations,
    setSimulations,
    hasSimulations,
    isPaused,
    addSimulation : internalAddSimulation,
    addChaosSwarm : internalAddChaosSwarm,
    togglePause,
    reset,
    restart,
    } = usePendulumSimulation();
  
  const handleGravityChange = useCallback((newG: number) => {
    setGravity(newG);
    const scaledG = newG * PIXELS_PER_METER;

    // Aggiorniamo istantaneamente i parametri di tutti i pendoli attivi
    setSimulations((prev) =>
      prev.map((sim) => ({
        ...sim,
        parameters: {
          ...sim.parameters,
          gravity: scaledG,
        },
      }))
    );
  }, [setSimulations]);

  // 3. Wrapper per aggiungere simulazioni con la gravità attuale
  const handleAddSimulation = useCallback((pivot: any, m1: any, m2: any, color: string, ratio: number) => {
    internalAddSimulation(pivot, m1, m2, color, ratio, gravity);
  }, [internalAddSimulation, gravity]);

  const handleAddChaosSwarm = useCallback((pivot: any, m1: any, m2: any, color: string, ratio: number, size: number, eps: number) => {
    internalAddChaosSwarm(pivot, m1, m2, color, ratio, size, eps, gravity);
  }, [internalAddChaosSwarm, gravity]);
  
  const simulationControls = {
    hasSimulations,
    isPaused,
    addSimulation: handleAddSimulation,
    addChaosSwarm: handleAddChaosSwarm,    
    togglePause,
    reset,
    restart,
    gravity,
    onGravityChange: handleGravityChange,
  };
  
  return (
    <main className="app-container">
      <section className="left-panel">
        <PhysicalPanel
          simulations={simulations}
          {...simulationControls}
        />
      </section>

      <section className="right-panel">
        <AbstractPanel simulations={simulations}/>
      </section>
    </main>
  );
}

export default App;