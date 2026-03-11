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
  onWheel?: (event: React.WheelEvent<HTMLCanvasElement>) => void;
  onCanvasMouseDown?: (point: Point, event: React.MouseEvent<HTMLCanvasElement>) => void;
  onCanvasMouseMove?: (point: Point, event: React.MouseEvent<HTMLCanvasElement>) => void;
  onCanvasMouseUp?: (point: Point, event: React.MouseEvent<HTMLCanvasElement>) => void;
};

function CanvasPanel({ onDraw,
                      onCanvasClick,
                      onResize,
                      onWheel,
                      onCanvasMouseDown,
                      onCanvasMouseMove,
                      onCanvasMouseUp, }: CanvasPanelProps)
{
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !onWheel) {
      return;
    }

    const nativeWheelHandler = (event: WheelEvent) => {
      event.preventDefault();
    };

    canvas.addEventListener('wheel', nativeWheelHandler, { passive: false });

    return () => {
      canvas.removeEventListener('wheel', nativeWheelHandler);
    };
  }, [onWheel]);
  
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
  }, [onDraw, onResize]);

  const getCanvasPoint = (
    event: React.MouseEvent<HTMLCanvasElement>
  ): Point | null => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return null;
    }

    const rect = canvas.getBoundingClientRect();

    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  };

  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!onCanvasMouseDown) return;
    const point = getCanvasPoint(event);
    if (point) onCanvasMouseDown(point, event);
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!onCanvasMouseMove) return;
    const point = getCanvasPoint(event);
    if (point) onCanvasMouseMove(point, event);
  };

  const handleMouseUp = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!onCanvasMouseUp) return;
    const point = getCanvasPoint(event);
    if (point) onCanvasMouseUp(point, event);
  };

  const handleClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!onCanvasClick) return;
    const point = getCanvasPoint(event);
    if (point) onCanvasClick(point);
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
        onWheel={onWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
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