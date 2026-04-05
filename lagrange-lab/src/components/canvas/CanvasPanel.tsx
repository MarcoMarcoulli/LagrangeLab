import { useEffect, useRef, useCallback } from 'react';
import type { Point } from '../../types/Geometry';

type CanvasPanelProps = {
  onDraw?: (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ) => void;
  onCanvasClick?: (point: Point) => void;
  onResize?: (width: number, height: number) => void;
  onWheel?: (event: React.WheelEvent<HTMLCanvasElement>) => void;
  onCanvasMouseDown?: (point: Point, event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => void;
  onCanvasMouseMove?: (point: Point, event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => void;
  onCanvasMouseUp?: (point: Point, event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => void;
};

function CanvasPanel({
  onDraw,
  onCanvasClick,
  onResize,
  onWheel,
  onCanvasMouseDown,
  onCanvasMouseMove,
  onCanvasMouseUp,
}: CanvasPanelProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const onDrawRef = useRef(onDraw);
  const onResizeRef = useRef(onResize);

  useEffect(() => {
    onDrawRef.current = onDraw;
  }, [onDraw]);

  useEffect(() => {
    onResizeRef.current = onResize;
  }, [onResize]);

  const drawCanvas = useCallback((width: number, height: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);

    onDrawRef.current?.(ctx, width, height);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;

        if (width === 0 || height === 0) continue;

        const dpr = window.devicePixelRatio || 1;
        const displayWidth = Math.round(width * dpr);
        const displayHeight = Math.round(height * dpr);

        if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
          canvas.width = displayWidth;
          canvas.height = displayHeight;
        }

        onResizeRef.current?.(width, height);
        drawCanvas(width, height);
      }
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, [drawCanvas]);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      drawCanvas(container.clientWidth, container.clientHeight);
    }
  }, [onDraw, drawCanvas]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !onWheel) return;

    const nativeWheelHandler = (event: WheelEvent) => {
      event.preventDefault();
    };

    canvas.addEventListener('wheel', nativeWheelHandler, { passive: false });

    return () => {
      canvas.removeEventListener('wheel', nativeWheelHandler);
    };
  }, [onWheel]);

  // --- MOUSE ---
  const getCanvasPoint = (event: React.MouseEvent<HTMLCanvasElement>): Point | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

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

  // --- TOUCH (MOBILE) ---
  const getTouchPoint = (event: React.TouchEvent<HTMLCanvasElement>): Point | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    
    const touch = event.touches.length > 0 ? event.touches[0] : event.changedTouches[0];
    
    return {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
    };
  };

  const handleTouchStart = (event: React.TouchEvent<HTMLCanvasElement>) => {
    event.preventDefault(); 
    if (!onCanvasMouseDown) return;
    const point = getTouchPoint(event);
    if (point) onCanvasMouseDown(point, event);
  };

  const handleTouchMove = (event: React.TouchEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    if (!onCanvasMouseMove) return;
    const point = getTouchPoint(event);
    if (point) onCanvasMouseMove(point, event);
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    const point = getTouchPoint(event);
    if (point)
    {
      if (onCanvasMouseUp) onCanvasMouseUp(point, event);
      if (onCanvasClick) onCanvasClick(point); 
    }
  };

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <canvas
        ref={canvasRef}
        // Mouse Events(PC)
        onClick={handleClick}
        onWheel={onWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        //  Touch events (Mobile)
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          touchAction: 'none',
        }}
      />
    </div>
  );
}

export default CanvasPanel;