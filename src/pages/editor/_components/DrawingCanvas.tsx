import { useRef, useEffect, useState, useCallback } from "react";
import type { DrawingStroke, DrawingToolType } from "./DrawingTools";

interface DrawingCanvasProps {
  width: number;
  height: number;
  strokes: DrawingStroke[];
  onStrokesChange: (strokes: DrawingStroke[]) => void;
  currentTool: DrawingToolType | null;
  toolSettings: {
    tool: DrawingToolType;
    color: string;
    size: number;
    opacity: number;
  };
  isEnabled: boolean;
  baseCanvasRef: React.RefObject<HTMLCanvasElement | null>;
}

export default function DrawingCanvas({
  width,
  height,
  strokes,
  onStrokesChange,
  currentTool,
  toolSettings,
  isEnabled,
  baseCanvasRef,
}: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState<DrawingStroke | null>(null);

  // Get mouse position relative to canvas
  const getMousePos = useCallback(
    (e: MouseEvent | TouchEvent): { x: number; y: number } | null => {
      const canvas = canvasRef.current;
      if (!canvas) return null;

      const rect = canvas.getBoundingClientRect();
      const clientX = "touches" in e ? e.touches[0]?.clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0]?.clientY : e.clientY;

      if (clientX === undefined || clientY === undefined) return null;

      // Convert from screen coordinates to canvas coordinates
      const x = ((clientX - rect.left) / rect.width) * width;
      const y = ((clientY - rect.top) / rect.height) * height;

      return { x, y };
    },
    [width, height]
  );

  // Start drawing
  const handleMouseDown = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (!isEnabled || !currentTool) return;

      e.preventDefault();
      const pos = getMousePos(e);
      if (!pos) return;

      setIsDrawing(true);

      const newStroke: DrawingStroke = {
        id: `stroke_${Date.now()}_${Math.random()}`,
        tool: toolSettings.tool,
        color: toolSettings.color,
        size: toolSettings.size,
        opacity: toolSettings.opacity,
        points: [pos],
        startPoint: pos,
        endPoint: pos,
      };

      setCurrentStroke(newStroke);
    },
    [isEnabled, currentTool, toolSettings, getMousePos]
  );

  // Continue drawing
  const handleMouseMove = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (!isDrawing || !currentStroke) return;

      e.preventDefault();
      const pos = getMousePos(e);
      if (!pos) return;

      if (currentStroke.tool === "pen" || currentStroke.tool === "highlighter") {
        // Add point to freehand stroke
        setCurrentStroke({
          ...currentStroke,
          points: [...currentStroke.points, pos],
        });
      } else {
        // Update end point for shapes
        setCurrentStroke({
          ...currentStroke,
          endPoint: pos,
        });
      }
    },
    [isDrawing, currentStroke, getMousePos]
  );

  // Stop drawing
  const handleMouseUp = useCallback(() => {
    if (!isDrawing || !currentStroke) return;

    setIsDrawing(false);
    onStrokesChange([...strokes, currentStroke]);
    setCurrentStroke(null);
  },
  [isDrawing, currentStroke, strokes, onStrokesChange]);

  // Add event listeners
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("mouseleave", handleMouseUp);
    
    canvas.addEventListener("touchstart", handleMouseDown);
    canvas.addEventListener("touchmove", handleMouseMove);
    canvas.addEventListener("touchend", handleMouseUp);

    return () => {
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseup", handleMouseUp);
      canvas.removeEventListener("mouseleave", handleMouseUp);
      
      canvas.removeEventListener("touchstart", handleMouseDown);
      canvas.removeEventListener("touchmove", handleMouseMove);
      canvas.removeEventListener("touchend", handleMouseUp);
    };
  }, [handleMouseDown, handleMouseMove, handleMouseUp]);

  // Render all strokes and current stroke
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw all completed strokes
    strokes.forEach((stroke) => {
      drawStroke(ctx, stroke);
    });

    // Draw current stroke
    if (currentStroke) {
      drawStroke(ctx, currentStroke);
    }
  }, [strokes, currentStroke, width, height]);

  // Function to draw a single stroke
  const drawStroke = (ctx: CanvasRenderingContext2D, stroke: DrawingStroke) => {
    ctx.save();
    ctx.strokeStyle = stroke.color;
    ctx.fillStyle = stroke.color;
    ctx.lineWidth = stroke.size;
    ctx.globalAlpha = stroke.opacity;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    switch (stroke.tool) {
      case "pen":
        if (stroke.points.length > 1) {
          ctx.beginPath();
          ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
          for (let i = 1; i < stroke.points.length; i++) {
            ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
          }
          ctx.stroke();
        }
        break;

      case "highlighter":
        ctx.globalAlpha = stroke.opacity * 0.4; // Make highlighter more transparent
        ctx.lineWidth = stroke.size * 1.5; // Make highlighter wider
        if (stroke.points.length > 1) {
          ctx.beginPath();
          ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
          for (let i = 1; i < stroke.points.length; i++) {
            ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
          }
          ctx.stroke();
        }
        break;

      case "line":
        if (stroke.startPoint && stroke.endPoint) {
          ctx.beginPath();
          ctx.moveTo(stroke.startPoint.x, stroke.startPoint.y);
          ctx.lineTo(stroke.endPoint.x, stroke.endPoint.y);
          ctx.stroke();
        }
        break;

      case "arrow":
        if (stroke.startPoint && stroke.endPoint) {
          const headLength = stroke.size * 3;
          const dx = stroke.endPoint.x - stroke.startPoint.x;
          const dy = stroke.endPoint.y - stroke.startPoint.y;
          const angle = Math.atan2(dy, dx);

          // Draw line
          ctx.beginPath();
          ctx.moveTo(stroke.startPoint.x, stroke.startPoint.y);
          ctx.lineTo(stroke.endPoint.x, stroke.endPoint.y);
          ctx.stroke();

          // Draw arrowhead
          ctx.beginPath();
          ctx.moveTo(stroke.endPoint.x, stroke.endPoint.y);
          ctx.lineTo(
            stroke.endPoint.x - headLength * Math.cos(angle - Math.PI / 6),
            stroke.endPoint.y - headLength * Math.sin(angle - Math.PI / 6)
          );
          ctx.moveTo(stroke.endPoint.x, stroke.endPoint.y);
          ctx.lineTo(
            stroke.endPoint.x - headLength * Math.cos(angle + Math.PI / 6),
            stroke.endPoint.y - headLength * Math.sin(angle + Math.PI / 6)
          );
          ctx.stroke();
        }
        break;

      case "rectangle":
        if (stroke.startPoint && stroke.endPoint) {
          const x = Math.min(stroke.startPoint.x, stroke.endPoint.x);
          const y = Math.min(stroke.startPoint.y, stroke.endPoint.y);
          const w = Math.abs(stroke.endPoint.x - stroke.startPoint.x);
          const h = Math.abs(stroke.endPoint.y - stroke.startPoint.y);
          ctx.strokeRect(x, y, w, h);
        }
        break;

      case "circle":
        if (stroke.startPoint && stroke.endPoint) {
          const centerX = stroke.startPoint.x;
          const centerY = stroke.startPoint.y;
          const radius = Math.sqrt(
            Math.pow(stroke.endPoint.x - stroke.startPoint.x, 2) +
              Math.pow(stroke.endPoint.y - stroke.startPoint.y, 2)
          );
          ctx.beginPath();
          ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
          ctx.stroke();
        }
        break;
    }

    ctx.restore();
  };

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        cursor: isEnabled && currentTool ? "crosshair" : "default",
        pointerEvents: isEnabled ? "auto" : "none",
        touchAction: "none",
      }}
    />
  );
}
