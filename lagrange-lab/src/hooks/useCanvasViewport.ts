import { useState } from 'react';
import type { Point } from '../types/geometry';

import type { Viewport } from '../types/viewport';

export function useCanvasViewport(initialScale = 1) {
  const [viewport, setViewport] = useState<Viewport>({
    scale: initialScale,
    offsetX: 0,
    offsetY: 0,
  });

  const screenToWorld = (point: Point): Point => ({
    x: (point.x - viewport.offsetX) / viewport.scale,
    y: (point.y - viewport.offsetY) / viewport.scale,
  });

  const handleWheel = (event: React.WheelEvent<HTMLCanvasElement>) => {
    event.preventDefault();

    const rect = event.currentTarget.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    const zoomFactor = event.deltaY < 0 ? 1.1 : 0.9;

    setViewport((prev) => {
      const newScale = prev.scale * zoomFactor;

      const worldX = (mouseX - prev.offsetX) / prev.scale;
      const worldY = (mouseY - prev.offsetY) / prev.scale;

      return {
        scale: newScale,
        offsetX: mouseX - worldX * newScale,
        offsetY: mouseY - worldY * newScale,
      };
    });
  };

  return {
    viewport,
    setViewport,
    screenToWorld,
    handleWheel,
  };
}