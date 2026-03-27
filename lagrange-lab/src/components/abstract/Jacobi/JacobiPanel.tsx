import '../../Panel.css';
import { useMemo } from 'react';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { TrackballControls, Line, Edges } from '@react-three/drei';
import type { PendulumSimulationItem } from '../../../simulation/PendulumSimulationItem';
import { isDoubleState } from '../../../utils/TypeGuards';

type JacobiPanelProps = {
  simulations: PendulumSimulationItem[];
};

function JacobiAxes() {
  const segments = 120;

  // 1. Asse Toroidale (Theta 2 = 0): Il grande cerchio esterno
  const toroidalAxis = useMemo(() => {
    const points = [];
    for (let i = 0; i <= segments; i++) {
      const t1 = (i / segments) * Math.PI * 2;
      points.push(getTorusPoint(t1, 0)); // Theta 2 fisso a 0
    }
    return points;
  }, []);

  // 2. Asse Poloidale (Theta 1 = 0): Il cerchio che avvolge il tubo
  const poloidalAxis = useMemo(() => {
    const points = [];
    for (let i = 0; i <= segments; i++) {
      const t2 = (i / segments) * Math.PI * 2;
      points.push(getTorusPoint(0, t2)); // Theta 1 fisso a 0
    }
    return points;
  }, []);

  return (
    <group>
      {/* Linea Theta 2 = 0 (Orizzontale/Equatore) */}
      <Line
        points={toroidalAxis}
        color="#f9f6f5ff"
        lineWidth={3}
        transparent={true}
        opacity={1}
      />
      
      {/* Linea Theta 1 = 0 (Verticale/Sezione) */}
      <Line
        points={poloidalAxis}
        color="#fbf8f7ff" 
        lineWidth={3}
        transparent={true}
        opacity={1}
      />
    </group>
  );
}

// --- COSTANTI DEL TORO ---
const R = 2.5;   // Raggio Maggiore (la grandezza della ciambella)
const r = 1; // Raggio Minore (lo spessore del tubo)

// Funzione matematica per convertire theta1 e theta2 in coordinate 3D spaziali (X, Y, Z)
function getTorusPoint(theta1: number, theta2: number, offset: number = 0): THREE.Vector3 {
  // L'orientamento standard di Three.js per il TorusGeometry è sul piano X-Y
  const x = (R + (r + offset) * Math.cos(theta2)) * Math.cos(theta1);
  const y = (R + (r + offset) * Math.cos(theta2)) * Math.sin(theta1);
  const z = (r + offset) * Math.sin(theta2);
  return new THREE.Vector3(x, y, z);
}

function JacobiTrace({ trace, currentPoint, color }: { trace: {x: number, y: number}[], currentPoint: {x: number, y: number}, color: string }) {
  
  const points3D = useMemo(() => {
  if (!trace || trace.length < 2) return [];
  
  const maxPoints = 300;
  const recentTrace = trace.slice(-maxPoints);
  
  const rawPoints = recentTrace.map(p => getTorusPoint(p.x, p.y, 0.02));
  const curve = new THREE.CatmullRomCurve3(rawPoints, false, 'catmullrom', 0.2);
  return curve.getPoints(recentTrace.length * 2);
}, [trace]);

  const currentPos3D = getTorusPoint(currentPoint.x, currentPoint.y, 0.02);

  return (
    <group>
      {/* 1. La linea della scia */}
      {points3D.length > 1 && (
        <Line
          points={points3D}
          color={color}
          lineWidth={4} 
          transparent={true}
          toneMapped={false}
          depthTest={true}
          depthWrite={false}
          opacity={1}
        />
      )}

      {/* 2. Il "pallino" che rappresenta la posizione attuale del pendolo */}
      <mesh position={currentPos3D}>
        <sphereGeometry args={[0.08, 16, 16]} />
        {/* Emissive fa sembrare che il pallino emetta luce propria! */}
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} />
      </mesh>
    </group>
  );
}

// --- PANNELLO PRINCIPALE ---
function JacobiPanel({ simulations }: JacobiPanelProps) {
  
  return (
    <div className="panel-container" style={{ touchAction: 'none' }}>
      
      <Canvas camera={{ position: [2, -8, 6], fov: 45 }}>
        <ambientLight intensity={0.3} />
        <directionalLight position={[5, 5, 5]} intensity={1.2} castShadow />
        <pointLight position={[-5, 5, -5]} intensity={0.5} color="#444" />
        <spotLight position={[0, 10, 0]} angle={0.3} penumbra={1} intensity={1} />

        <TrackballControls 
          makeDefault 
          rotateSpeed={4.0}
          noPan={false}
          noZoom={false}
          staticMoving={false} // Aggiunge un po' di inerzia fluida
          dynamicDampingFactor={0.1}
        />

        {/* Il Palcoscenico: Il Toro */}
        <mesh>
          {/* Riducendo leggermente i segmenti (es. 40, 20) i rettangoli diventano più larghi e "matematici" */}
          <torusGeometry args={[R, r, 40, 55]} />
          
          <meshPhysicalMaterial 
            color="#0d47a1" // Un blu più profondo
            roughness={0.1}
            metalness={0.1}
            transparent={true}
            opacity={0.2}  
            transmission={0.5} 
            thickness={0.5}
          />

          {/* La griglia rettangolare */}
          <Edges
            threshold={0.1}    // Nasconde le diagonali dei triangoli
            color="#64ffda"   // Un colore ciano/neon per far risaltare la griglia
            transparent={true}
            opacity={0.8}
          />
        </mesh>

        <JacobiAxes />

        {/* Disegniamo gli attori: Le simulazioni attive */}
        {simulations.map((sim, index) => {
          const theta1 = sim.state[0];
          const theta2 = isDoubleState(sim.state) ? sim.state[2] : 0;
          
          return (
            <JacobiTrace
              key={index} // Se hai un sim.id è meglio usare quello
              trace={sim.lagrangeTrace}
              currentPoint={{ x: theta1, y: theta2 }}
              color={sim.color}
            />
          );
        })}

      </Canvas>

      <img
        src="/images/jacobi.png"
        alt="Carl Gustav Jacob Jacobi"
        className="physicist-image"
        style={{ right: 0 }}
      />
    </div>
  );
}

export default JacobiPanel;