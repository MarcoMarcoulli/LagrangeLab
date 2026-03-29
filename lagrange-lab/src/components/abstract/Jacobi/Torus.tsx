import { useMemo } from 'react';
import * as THREE from 'three';
import { Edges } from '@react-three/drei';
import { TORUS_R, TORUS_r } from '../../../utils/Math/TorusMath';
import type { PendulumParameters } from '../../../types/Pendulum';
import { computeDoublePendulumPotential } from '../../../simulation/models/DoublePendulum';

type TorusProps = {
  parameters?: PendulumParameters | null;
  totalEnergy?: number | null;
  useColorfulMapStyle: boolean;
};

export function Torus({ parameters, totalEnergy, useColorfulMapStyle }: TorusProps) {
  
  const { curvatureTexture, gridTexture } = useMemo(() => {
    if (!parameters || totalEnergy === undefined || totalEnergy === null)
    {
      return { curvatureTexture: null, gridTexture: null };
    }
    const { length1, gravity, massRatio } = parameters;
    const length2 = parameters.length2 ?? 0;
    const m1 = 1;
    const m2 = massRatio ?? 0;

    // CALCOLO DEL MINIMO E MASSIMO POTENZIALE TEORICO
    // Minimo: entrambi giù (cos = 1)
    const minV = -(m1 + m2) * gravity * length1 - m2 * gravity * length2;

    // L'energia cinetica massima che il pendolo può raggiungere in QUESTA simulazione
    const maxKInThisSim = totalEnergy! - minV;

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

        if (lineIntensity > 0.85)
        {
          // Se la vedi ancora troppo spessa, alza 0.5 a 0.7 o 0.8
          // Se non la vedi, abbassa 0.5 a 0.3
          data[stride] = 0;
          data[stride + 1] = 100;
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
          // ratio va da 0 (linea bianca) a 1 (max velocità)
          let ratio = Math.min(1, W / maxKInThisSim);

          let r, g, b;

          if (ratio < 0.25) {
            // 1. Da VIOLA SCURO (15, 5, 25) a ROSSO CUPO (180, 20, 0)
            const t = ratio / 0.25;
            r = 15 + (180 - 15) * t;
            g = 5 + (20 - 5) * t;
            b = 25 + (0 - 25) * t;
          } 
          else if (ratio < 0.7) {
            // 2. Da ROSSO CUPO (180, 20, 0) a ORO/GIALLO (255, 200, 50)
            const t = (ratio - 0.25) / 0.45;
            r = 180 + (255 - 180) * t;
            g = 20 + (200 - 20) * t;
            b = 0 + (50 - 0) * t;
          } 
          else {
            // 3. Da ORO (255, 200, 50) a BIANCO PURO (255, 255, 255)
            const t = (ratio - 0.7) / 0.3;
            r = 255;
            g = 200 + (255 - 200) * t;
            b = 50 + (255 - 50) * t;
          }

          data[stride] = Math.floor(r); 
          data[stride+1] = Math.floor(g); 
          data[stride+2] = Math.floor(b);
          data[stride+3] = 255;
        }
      }
    }

    const colorfulTexture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
    colorfulTexture.colorSpace = THREE.SRGBColorSpace;
    colorfulTexture.magFilter = THREE.LinearFilter; 
    colorfulTexture.anisotropy = 16;
    colorfulTexture.needsUpdate = true; 

    return{ 
      curvatureTexture: colorfulTexture, 
    };
  }, [parameters, totalEnergy ? Math.round(totalEnergy * 1000) : null, useColorfulMapStyle]);

  // 1. Texture principale
  const mainMap = useColorfulMapStyle ? curvatureTexture : gridTexture;

  const baseColor = useColorfulMapStyle ? "#9b3333" : "#430b0b";

  // 3. EMISSIVE: Questa è la chiave per la luce costante
  // Se siamo in modalità griglia, l'emissive deve essere lo stesso blu del baseColor
  const emissiveColor = useColorfulMapStyle 
    ? (curvatureTexture ? "#ffffff" : "#000000") 
    : "#06102a"; // Blu costante per la griglia

  const emissiveIntensity = useColorfulMapStyle ? 0.6 : 0.1;

  return (
    <mesh>
      <torusGeometry args={[TORUS_R, TORUS_r, 64, 100]} />
      
      <meshPhysicalMaterial 
        color={baseColor}
        map={mainMap}
        
        emissiveMap={mainMap} 
        emissive={emissiveColor}
        emissiveIntensity={emissiveIntensity}

        transparent={true}
        opacity={useColorfulMapStyle ? 1 : 0.8}  
        transmission={0.0}
        thickness={0.5}
      />
      
      <Edges
        threshold={0.1}
        color={useColorfulMapStyle ? "#4a4444" : "#534cb0"}
        transparent
        opacity={useColorfulMapStyle ? 0.9 : 0.6}
      />
    </mesh>
  );
}