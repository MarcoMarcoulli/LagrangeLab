import "./App.css";
import PhysicalPanel from "../components/physical/PhysicalPanel";
import AbstractPanel from "../components/abstract/AbstractPanel";
import { usePendulumSimulation } from "../hooks/usePendulumSimulation";

function App()
{
  const
  {
    simulations,
    hasSimulations,
    isPaused,
    addSimulation,
    togglePause,
    reset,
  } = usePendulumSimulation();
  
  const simulationControls =
  {
    hasSimulations,
    isPaused,
    addSimulation,
    togglePause,
    reset,
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