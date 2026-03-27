import { useMemo } from 'react';
import { Line } from '@react-three/drei';
import { getTorusPoint } from '../../../utils/Math/TorusMath'; 

export function TorusAxes() {
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
        color="#f9f6f5" // Bianco fumo
        lineWidth={3}
        transparent={true}
        opacity={1}
      />
      
      {/* Linea Theta 1 = 0 (Verticale/Sezione) */}
      <Line
        points={poloidalAxis}
        color="#fbf8f7" // Bianco fumo
        lineWidth={3}
        transparent={true}
        opacity={1}
      />
    </group>
  );
}