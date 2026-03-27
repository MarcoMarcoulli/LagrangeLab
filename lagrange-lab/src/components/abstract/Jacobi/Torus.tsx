import { useMemo } from 'react';
import * as THREE from 'three';
import { Edges } from '@react-three/drei';
import { TORUS_R, TORUS_r } from '../../../utils/Math/TorusMath';
import type { PendulumParameters } from '../../../types/Pendulum';
import { computeDoublePendulumPotential } from '../../../simulation/models/DoublePendulum';

type TorusProps = {
  parameters?: PendulumParameters | null;
  totalEnergy?: number | null;
};

export function Torus({ parameters, totalEnergy }: TorusProps) {
  
  const curvatureTexture = useMemo(() => {
    if (!parameters || totalEnergy === null) return null;

    const size = 512; 
    const data = new Uint8Array(size * size * 4); 

    for (let i = 0; i < size; i++)
    {
      for (let j = 0; j < size; j++) {
        const theta1 = (j / size) * Math.PI * 2; 
        const theta2 = (i / size) * Math.PI * 2;

        const V = computeDoublePendulumPotential(theta1, theta2, parameters);
        const W = totalEnergy! - V;

        const stride = (i * size + j) * 4;

        const thickness = Math.max(0.2, Math.abs(totalEnergy!) * 0.03);
        const lineIntensity = Math.exp(-Math.pow(W / thickness, 2));

        if (lineIntensity > 0.5) { 
          // Se la vedi ancora troppo spessa, alza 0.5 a 0.7 o 0.8
          // Se non la vedi, abbassa 0.5 a 0.3
          data[stride] = 255; 
          data[stride + 1] = 255; 
          data[stride + 2] = 255; 
          data[stride + 3] = 255;
        }
        else if (W <= 0) {
          // 2. REGIONE PROIBITA (Viola scuro)
          data[stride] = 15; 
          data[stride + 1] = 5; 
          data[stride + 2] = 25; 
          data[stride + 3] = 255;
        } 
        else {
          // 3. REGIONE PERMESSA (Magma / Oro)
          const maxW = totalEnergy! + Math.abs(V);
          let normW = Math.min(1, W / maxW);
          
          // Smoothing del bordo magma per non sovrapporsi male alla linea
          const smoothEdge = Math.min(1, W * 30);
          const intensity = Math.pow(normW, 0.5) * smoothEdge;

          let r, g, b;
          if (intensity < 0.3) {
            const t = intensity / 0.3;
            r = 20 + 120 * t; g = 10 + 20 * t; b = 40 + 100 * t;
          } else if (intensity < 0.7) {
            const t = (intensity - 0.3) / 0.4;
            r = 140 + 115 * t; g = 30 + 100 * t; b = 140 * (1 - t);
          } else {
            const t = (intensity - 0.7) / 0.3;
            r = 255; g = 130 + 125 * t; b = 50 * t;
          }

          data[stride] = Math.floor(r);
          data[stride + 1] = Math.floor(g);
          data[stride + 2] = Math.floor(b);
          data[stride + 3] = 255;
        }
      }
    }

    const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.magFilter = THREE.LinearFilter; // Smoothing dei pixel
    texture.needsUpdate = true; 
    return texture;

  }, [parameters, totalEnergy]);

  return (
    <mesh>
      <torusGeometry args={[TORUS_R, TORUS_r, 64, 100]} />
      
      <meshPhysicalMaterial 
        color={curvatureTexture ? "#ffffff" : "#0d47a1"} 
        map={curvatureTexture}
        
        roughness={0.4}
        metalness={0.2}
        // Emissive rende i colori vibranti anche nelle zone d'ombra
        emissive={curvatureTexture ? "#001122" : "#000000"}
        emissiveIntensity={0.5}
        
        transparent={true}
        opacity={1.0}  
        transmission={0.0}
        thickness={0.5}
      />
      
      <Edges
        threshold={0.1}
        color={curvatureTexture ? "#ffffff" : "#64ffda"}
        transparent
        opacity={curvatureTexture ? 0.15 : 0.8}
      />
    </mesh>
  );
}