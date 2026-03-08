import PhysicalPanel from "../components/physical/PhysicalPanel";
// import AbstractPanel from "../components/abstract/AbstractPanel";

function App() {
  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <div style={{ flex: 1, borderRight: "1px solid gray" }}>
        <PhysicalPanel />
      </div>

      <div style={{ flex: 1 }}>
        {/* <AbstractPanel /> */}
      </div>
    </div>
  );
}

export default App;