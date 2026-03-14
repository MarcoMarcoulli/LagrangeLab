import "./App.css";
import PhysicalPanel from "../components/physical/PhysicalPanel";
import AbstractPanel from "../components/abstract/AbstractPanel";
import { usePendulumSimulation } from "../hooks/usePendulumSimulation";

function App()
{
  const
  {
    simulations,
    isSimulating,
    isPaused,
    addSimulation,
    togglePause,
    reset,
  } = usePendulumSimulation();
  
  return (
    <div className="app-container">
      <div className="left-panel">
        <PhysicalPanel
          simulations={simulations}
          isSimulating={isSimulating}
          isPaused={isPaused}
          addSimulation={addSimulation}
          togglePause={togglePause}
          reset={reset}
        />
      </div>

      <div className="right-panel">
        <AbstractPanel simulations={simulations}/>
      </div>
    </div>
  );
}

export default App;