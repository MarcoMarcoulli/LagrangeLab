import { useMemo } from 'react';
import * as THREE from 'three';
import { Line } from '@react-three/drei';
import type { Point3D } from '../../../types/Geometry';

type JacobiTraceProps = {
  // Ora passiamo direttamente l'array di Point3D che il motore ha già calcolato
  trace: Point3D[]; 
  color: string;
};

export function JacobiTrace({ trace, color }: JacobiTraceProps) {
  
  const points3D = useMemo(() => {
    if (!trace || trace.length < 2) return [];
    
    // Trasformiamo i Point3D in Vector3 (formato nativo di Three.js)
    const vector3Points = trace.map(p => new THREE.Vector3(p.x, p.y, p.z));
    
    // Creiamo la curva fluida
    const curve = new THREE.CatmullRomCurve3(vector3Points, false, 'catmullrom', 0.2);
    
    // Campioniamo la curva per renderla solida
    return curve.getPoints(trace.length * 2);
  }, [trace]);

  // La "testa" è semplicemente l'ultimo punto della traccia
  const headPoint = trace.length > 0 ? trace[trace.length - 1] : null;

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
          opacity={0.8} // Un pelo di trasparenza la rende più eterea
        />
      )}

      {/* 2. Il "pallino" di testa */}
      {headPoint && (
        <mesh position={[headPoint.x, headPoint.y, headPoint.z]}>
          <sphereGeometry args={[0.07, 16, 16]} />
          <meshStandardMaterial 
            color={color} 
            emissive={color} 
            emissiveIntensity={3} // Più ignorante, per farlo risaltare bene
            toneMapped={false} 
          />
        </mesh>
      )}
    </group>
  );
}