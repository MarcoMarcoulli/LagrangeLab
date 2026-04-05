import { useMemo } from 'react';
import * as THREE from 'three';
import { Line } from '@react-three/drei';
import type { Point3D } from '../../../types/Geometry';

type JacobiTraceProps = {
  fullTrace: Point3D[];
  visibleLimit: number;
  color: string;
};

export function JacobiTrace({ fullTrace, visibleLimit, color }: JacobiTraceProps) {
  
  const points3D = useMemo(() => {
    const trail = visibleLimit === 0 ? [] : fullTrace.slice(-visibleLimit);
    if (trail.length < 2) return [];
    
    const vector3Points = trail.map(p => new THREE.Vector3(p.x, p.y, p.z));

    const curve = new THREE.CatmullRomCurve3(vector3Points, false, 'catmullrom', 0.2);
    
    return curve.getPoints(trail.length * 2);
  }, [fullTrace, visibleLimit]);

  const headPoint = fullTrace.length > 0 ? fullTrace[fullTrace.length - 1] : null;

  return (
    <group>
      {points3D.length > 1 && (
        <Line
          points={points3D}
          color={color}
          lineWidth={4} 
          transparent={true}
          toneMapped={false} 
          depthTest={true}
          depthWrite={false} 
          opacity={0.8} 
        />
      )}

      {headPoint && (
        <mesh position={[headPoint.x, headPoint.y, headPoint.z]}>
          <sphereGeometry args={[0.07, 16, 16]} />
          <meshStandardMaterial 
            color={color} 
            emissive={color} 
            emissiveIntensity={3}
            toneMapped={false} 
          />
        </mesh>
      )}
    </group>
  );
}