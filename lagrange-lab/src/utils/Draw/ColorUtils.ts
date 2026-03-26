let currentHue = Math.random() * 360;

export function generateColor(): string {
  const goldenRatioConjugate = 0.618033988749895;

  currentHue += 360 * goldenRatioConjugate;
  currentHue %= 360; 
  
  return `hsl(${Math.floor(currentHue)}, 90%, 50%)`;
}