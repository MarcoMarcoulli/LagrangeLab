import PhysicalPanel from "../components/physical/PhysicalPanel";
import AbstractPanel from "../components/abstract/AbstractPanel";
import { usePendulumSimulation } from "../hooks/usePendulumSimulation";

function App() {
  const {
      simulations,
      isSimulating,
      isPaused,
      addSimulation,
      togglePause,
      reset,
  } = usePendulumSimulation();
  
  return (
    <div style={{ display: "flex", height: "100vh", width: "100vw"}}>
      <div style={{ width: "50%", borderRight: "1px solid gray" }}>
        <PhysicalPanel
          simulations={simulations}
          isSimulating={isSimulating}
          isPaused={isPaused}
          addSimulation={addSimulation}
          togglePause={togglePause}
          reset={reset}
        />
      </div>

      <div style={{ width: "50%" }}>
        { <AbstractPanel simulations={simulations}/> }
      </div>
    </div>
  );
}

export default App;