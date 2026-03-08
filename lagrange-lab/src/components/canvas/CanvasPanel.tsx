import { useEffect, useRef } from 'react';
import type { Point } from '../../types/geometry';

type CanvasPanelProps = {
  onDraw?: (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ) => void;
  onCanvasClick?: (point: Point) => void;
  onResize?: (width: number, height: number) => void;
};

function CanvasPanel({ onDraw, onCanvasClick, onResize }: CanvasPanelProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;

    if (!container || !canvas) {
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    const drawCanvas = () => {
      const cssWidth = container.clientWidth;
      const cssHeight = container.clientHeight;
      const dpr = window.devicePixelRatio || 1;

      const displayWidth = Math.round(cssWidth * dpr);
      const displayHeight = Math.round(cssHeight * dpr);

      if (canvas.width !== displayWidth) {
        canvas.width = displayWidth;
      }

      if (canvas.height !== displayHeight) {
        canvas.height = displayHeight;
      }

      canvas.style.width = `${cssWidth}px`;
      canvas.style.height = `${cssHeight}px`;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);

      if (onDraw) {
        onDraw(ctx, cssWidth, cssHeight);
      }

      if (onResize) {
        onResize(cssWidth, cssHeight);
      }
    };

    const handleResize = () => {
      drawCanvas();
    };

    drawCanvas();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [onDraw]);

  const handleClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !onCanvasClick) {
      return;
    }

    const rect = canvas.getBoundingClientRect();

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    onCanvasClick({ x, y });
  };

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
      }}
    >
      <canvas
        ref={canvasRef}
        onClick={handleClick}
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
        }}
      />
    </div>
  );
}

export default CanvasPanel;