import { useState, useRef, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SplitIcon, ArrowRightIcon, ArrowLeftIcon } from "lucide-react";
import type { UploadedImage } from "./ImageUpload";
import type { LayoutType } from "./LayoutSelector";
import type { OverlaySettings } from "./OverlayControls";
import type { BlendMode } from "./BlendModeSelector";
import type { ImageTransparency } from "./TransparencyControls";
import type { CanvasSettingsData } from "./CanvasSettings";
import type { VisualEffectsData } from "./VisualEffects";
import type { ImageTransformData } from "./ImageTransform";
import type { FilterSettings } from "./Filters";
import type { CropData } from "./CropTool";
import type { ImageMask } from "./ImageMasks";
import type { DrawingStroke } from "./DrawingTools";
import type { GlitchEffectsData } from "./GlitchEffects";
import { drawLayout, drawTextLayers, drawStickerLayers, drawAnnotations, separateTextLayers, drawLightLeakOverlays, type TextLayer, type StickerLayer, type LightLeakOverlay } from "./canvas-utils";
import { applyGlitchEffects } from "./glitch-utils";

interface BeforeAfterComparisonProps {
  images: UploadedImage[];
  originalImages: UploadedImage[]; // Store originals separately
  layout: LayoutType;
  canvasSettings: CanvasSettingsData;
  visualEffects: VisualEffectsData;
  imageTransforms: ImageTransformData[];
  crops: CropData[];
  masks: ImageMask[];
  filterSettings: FilterSettings;
  overlaySettings?: OverlaySettings;
  blendMode?: BlendMode;
  transparencies?: ImageTransparency[];
  textLayers?: TextLayer[];
  stickerLayers?: StickerLayer[];
  drawingStrokes?: DrawingStroke[];
  glitchEffects?: GlitchEffectsData;
  lightLeakOverlays?: LightLeakOverlay[];
}

export default function BeforeAfterComparison({
  images,
  originalImages,
  layout,
  canvasSettings,
  visualEffects,
  imageTransforms,
  crops,
  masks,
  filterSettings,
  overlaySettings,
  blendMode = "normal",
  transparencies = [],
  textLayers = [],
  stickerLayers = [],
  drawingStrokes = [],
  glitchEffects,
  lightLeakOverlays = [],
}: BeforeAfterComparisonProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Canvas refs
  const beforeCanvasRef = useRef<HTMLCanvasElement>(null);
  const afterCanvasRef = useRef<HTMLCanvasElement>(null);

  // Helper function to draw before image
  const drawBeforeImage = useCallback(async (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = canvasSettings.width;
    canvas.height = canvasSettings.height;

    ctx.fillStyle = canvasSettings.backgroundColor;
    ctx.fillRect(0, 0, canvasSettings.width, canvasSettings.height);

    const imageElements = await Promise.all(
      originalImages.map((img) => {
        return new Promise<HTMLImageElement>((resolve, reject) => {
          const imgElement = new Image();
          imgElement.crossOrigin = "anonymous"; // Allow cross-origin images
          imgElement.onload = () => resolve(imgElement);
          imgElement.onerror = reject;
          imgElement.src = img.preview;
        });
      })
    );

    // Draw with only basic layout, no filters or effects
    drawLayout(
      ctx,
      imageElements,
      layout,
      canvasSettings.width,
      canvasSettings.height,
      {
        borderWidth: 0,
        borderColor: "#000000",
        cornerRadius: 0,
        shadowBlur: 0,
        shadowOffsetX: 0,
        shadowOffsetY: 0,
        shadowColor: "#000000",
        margin: 20,
      },
      [],
      [],
      [],
      undefined,
      overlaySettings,
      blendMode,
      []
    );
  }, [originalImages, layout, canvasSettings, overlaySettings, blendMode]);

  // Generate before image
  useEffect(() => {
    if (!beforeCanvasRef.current || originalImages.length === 0) return;
    drawBeforeImage(beforeCanvasRef.current);
  }, [drawBeforeImage, originalImages]);

  // Helper function to draw after image
  const drawAfterImage = useCallback(async (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = canvasSettings.width;
    canvas.height = canvasSettings.height;

    ctx.fillStyle = canvasSettings.backgroundColor;
    ctx.fillRect(0, 0, canvasSettings.width, canvasSettings.height);

    const imageElements = await Promise.all(
      images.map((img) => {
        return new Promise<HTMLImageElement>((resolve, reject) => {
          const imgElement = new Image();
          imgElement.crossOrigin = "anonymous"; // Allow cross-origin images
          imgElement.onload = () => resolve(imgElement);
          imgElement.onerror = reject;
          imgElement.src = img.preview;
        });
      })
    );

    // Separate text layers by z-order
    const { behindLayers, frontLayers } = separateTextLayers(textLayers);

    // Draw text layers that should be behind images
    if (behindLayers.length > 0) {
      drawTextLayers(ctx, behindLayers, canvasSettings.width, canvasSettings.height);
    }

    // Draw images
    drawLayout(
      ctx,
      imageElements,
      layout,
      canvasSettings.width,
      canvasSettings.height,
      visualEffects,
      imageTransforms,
      crops,
      masks,
      filterSettings,
      overlaySettings,
      blendMode,
      transparencies
    );

    // Draw text layers that should be in front of images
    if (frontLayers.length > 0) {
      drawTextLayers(ctx, frontLayers, canvasSettings.width, canvasSettings.height);
    }

    if (stickerLayers.length > 0) {
      drawStickerLayers(ctx, stickerLayers, canvasSettings.width, canvasSettings.height);
    }

    if (drawingStrokes.length > 0) {
      drawAnnotations(ctx, drawingStrokes, canvasSettings.width, canvasSettings.height);
    }

    // Apply glitch effects (before light leaks)
    if (glitchEffects) {
      applyGlitchEffects(ctx, canvas, glitchEffects);
    }

    // Draw light leak overlays last (on top of everything)
    if (lightLeakOverlays.length > 0) {
      await drawLightLeakOverlays(ctx, lightLeakOverlays, canvasSettings.width, canvasSettings.height);
    }
  }, [
    images,
    layout,
    canvasSettings,
    visualEffects,
    imageTransforms,
    crops,
    masks,
    filterSettings,
    overlaySettings,
    blendMode,
    transparencies,
    textLayers,
    stickerLayers,
    drawingStrokes,
    glitchEffects,
    lightLeakOverlays,
  ]);

  // Generate after image
  useEffect(() => {
    if (!afterCanvasRef.current || images.length === 0) return;
    drawAfterImage(afterCanvasRef.current);
  }, [drawAfterImage, images]);

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    setSliderPosition(Math.max(0, Math.min(100, percentage)));
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging || !containerRef.current) return;

    const touch = e.touches[0];
    const rect = containerRef.current.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    setSliderPosition(Math.max(0, Math.min(100, percentage)));
  };

  useEffect(() => {
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  if (images.length === 0 || originalImages.length === 0) {
    return null;
  }

  return (
    <Card className="border-2 border-black shadow-neo">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="bg-neo-cyan border-2 border-black p-2">
            <SplitIcon className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-lg font-black uppercase">Before/After Comparison</CardTitle>
            <CardDescription className="font-bold">
              Compare your original image with all edits applied
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          ref={containerRef}
          className="relative w-full overflow-hidden border-4 border-black rounded-lg bg-muted cursor-ew-resize"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onTouchStart={handleMouseDown}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleMouseUp}
          style={{ touchAction: "none" }}
        >
          {/* After image (full) */}
          <div className="relative w-full">
            <canvas
              ref={afterCanvasRef}
              className="max-w-full h-auto block"
            />
          </div>

          {/* Before image (clipped) */}
          <div
            className="absolute top-0 left-0 h-full overflow-hidden"
            style={{ width: `${sliderPosition}%` }}
          >
            <canvas
              ref={beforeCanvasRef}
              className="max-w-full h-auto block"
            />
          </div>

          {/* Slider handle */}
          <div
            className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize"
            style={{ left: `${sliderPosition}%`, transform: "translateX(-50%)" }}
          >
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white border-4 border-black rounded-full p-2 shadow-neo-sm">
              <div className="flex items-center gap-1">
                <ArrowLeftIcon className="h-3 w-3" />
                <ArrowRightIcon className="h-3 w-3" />
              </div>
            </div>
          </div>

          {/* Labels */}
          <div className="absolute top-2 left-2 bg-black text-white px-3 py-1 text-sm font-bold uppercase border-2 border-white">
            BEFORE
          </div>
          <div className="absolute top-2 right-2 bg-black text-white px-3 py-1 text-sm font-bold uppercase border-2 border-white">
            AFTER
          </div>
        </div>

        <div className="mt-2 text-center text-xs text-muted-foreground font-bold">
          Drag the slider or click anywhere to compare
        </div>

        <div className="flex items-center gap-2 p-3 bg-neo-cyan/20 border-2 border-black rounded">
          <div className="text-xs font-bold">
            💡 <span className="font-black">TIP:</span> The "Before" view preserves your original image,
            even after background removal or other destructive edits.
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export type { BeforeAfterComparisonProps };
