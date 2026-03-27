import { useMemo } from 'react';
import * as THREE from 'three';
import { Line } from '@react-three/drei';
import { getTorusPoint } from '../../../utils/Math/TorusMath';

type JacobiTraceProps = {
  trace: { x: number; y: number }[];
  currentPoint: { x: number; y: number };
  color: string;
};

export function JacobiTrace({ trace, currentPoint, color }: JacobiTraceProps) {
  
  const points3D = useMemo(() => {
    if (!trace || trace.length < 2) return [];
    
    const maxPoints = 300;
    const recentTrace = trace.slice(-maxPoints);
    
    // Generiamo i punti crudi con un piccolo offset (0.02) per non sprofondare nel toro
    const rawPoints = recentTrace.map(p => getTorusPoint(p.x, p.y, 0.02));
    
    // Creiamo la curva fluida
    const curve = new THREE.CatmullRomCurve3(rawPoints, false, 'catmullrom', 0.2);
    
    // Aumentiamo i campionamenti per una linea bella piena e solida
    return curve.getPoints(recentTrace.length * 2);
  }, [trace]);

  // Calcoliamo la posizione del pallino di testa (leggermente più sporgente, 0.02 o 0.03)
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
          toneMapped={false}  // Disabilitiamo il tone mapping per mantenere i colori brillanti
          depthTest={true}
          depthWrite={false}  // Lasciamolo false se abbiamo transparent={true}
          opacity={1}
        />
      )}

      {/* 2. Il "pallino" che rappresenta la posizione attuale del pendolo */}
      <mesh position={currentPos3D}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial 
          color={color} 
          emissive={color} 
          emissiveIntensity={2} 
          toneMapped={false} // Rende il pallino "acceso" come un neon
        />
      </mesh>
    </group>
  );
}