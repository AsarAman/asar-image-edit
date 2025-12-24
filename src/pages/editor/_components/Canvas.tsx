import { useEffect, useRef, memo, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
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
import type { DrawingStroke, DrawingToolType } from "./DrawingTools";
import type { GlitchEffectsData } from "./GlitchEffects";
import { drawLayout, drawTextLayers, drawStickerLayers, drawAnnotations, separateTextLayers, drawDoubleExposure, drawLightLeakOverlays, applyShadows, applyBokeh, applyDuotone, type TextLayer, type StickerLayer, type DoubleExposureSettings, type LightLeakOverlay } from "./canvas-utils";
import type { ShadowSettings } from "./Shadows";
import type { BokehSettings } from "./BokehEffects";
import type { DuotoneSettings } from "./Duotone";
import { applyGlitchEffects } from "./glitch-utils";
import DrawingCanvas from "./DrawingCanvas";

interface CanvasProps {
  images: UploadedImage[];
  layout: LayoutType;
  canvasSettings: CanvasSettingsData;
  visualEffects: VisualEffectsData;
  imageTransforms: ImageTransformData[];
  crops?: CropData[];
  masks?: ImageMask[];
  filterSettings?: FilterSettings;
  overlaySettings?: OverlaySettings;
  blendMode?: BlendMode;
  transparencies?: ImageTransparency[];
  textLayers?: TextLayer[];
  stickerLayers?: StickerLayer[];
  drawingStrokes?: DrawingStroke[];
  glitchEffects?: GlitchEffectsData;
  doubleExposureSettings?: DoubleExposureSettings;
  lightLeakOverlays?: LightLeakOverlay[];
  shadowSettings?: ShadowSettings;
  bokehSettings?: BokehSettings;
  duotoneSettings?: DuotoneSettings;
  onDrawingStrokesChange?: (strokes: DrawingStroke[]) => void;
  currentDrawingTool?: DrawingToolType | null;
  drawingToolSettings?: {
    tool: DrawingToolType;
    color: string;
    size: number;
    opacity: number;
  };
  isDrawingEnabled?: boolean;
}

const Canvas = memo(function Canvas({
  images,
  layout,
  canvasSettings,
  visualEffects,
  imageTransforms,
  crops = [],
  masks = [],
  filterSettings,
  overlaySettings,
  blendMode = "normal",
  transparencies = [],
  textLayers = [],
  stickerLayers = [],
  drawingStrokes = [],
  glitchEffects,
  doubleExposureSettings,
  lightLeakOverlays = [],
  shadowSettings,
  bokehSettings,
  duotoneSettings,
  onDrawingStrokesChange,
  currentDrawingTool = null,
  drawingToolSettings,
  isDrawingEnabled = false,
}: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderTimeoutRef = useRef<number | undefined>(undefined);

  // Memoize settings to prevent unnecessary re-renders
  const memoizedSettings = useMemo(() => ({
    canvasSettings,
    visualEffects,
    filterSettings,
  }), [canvasSettings, visualEffects, filterSettings]);

  useEffect(() => {
    // Clear any pending render
    if (renderTimeoutRef.current) {
      clearTimeout(renderTimeoutRef.current);
    }

    // Debounce canvas rendering for better performance
    renderTimeoutRef.current = window.setTimeout(() => {
    if (!canvasRef.current || images.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    canvas.width = memoizedSettings.canvasSettings.width;
    canvas.height = memoizedSettings.canvasSettings.height;

    // Clear canvas with background color
    ctx.fillStyle = memoizedSettings.canvasSettings.backgroundColor;
    ctx.fillRect(0, 0, memoizedSettings.canvasSettings.width, memoizedSettings.canvasSettings.height);

    // Load and draw images
    const loadImages = async () => {
      const imageElements = await Promise.all(
        images.map((img, index) => {
          return new Promise<HTMLImageElement>((resolve, reject) => {
            const imgElement = new Image();
            
            // Only set crossOrigin for remote URLs (not blob or data URLs)
            if (!img.preview.startsWith('blob:') && !img.preview.startsWith('data:')) {
              imgElement.crossOrigin = "anonymous";
            }
            
            // Add timeout for mobile devices
            const timeout = setTimeout(() => {
              reject(new Error(`Image ${index + 1} failed to load (timeout)`));
            }, 10000); // 10 second timeout
            
            imgElement.onload = () => {
              clearTimeout(timeout);
              resolve(imgElement);
            };
            
            imgElement.onerror = (error) => {
              clearTimeout(timeout);
              console.error(`Failed to load image ${index + 1}:`, error);
              reject(new Error(`Image ${index + 1} failed to load. Try re-uploading this image.`));
            };
            
            imgElement.src = img.preview;
          });
        })
      ).catch((error) => {
        console.error("Canvas rendering error:", error);
        // Show error but don't crash the whole canvas
        throw error;
      });

      // Separate text layers by z-order
      const { behindLayers, frontLayers } = separateTextLayers(textLayers);

      // Draw text layers that should be behind images
      if (behindLayers.length > 0) {
        drawTextLayers(ctx, behindLayers, memoizedSettings.canvasSettings.width, memoizedSettings.canvasSettings.height);
      }

      // Draw images - use double exposure if enabled, otherwise use normal layout
      if (doubleExposureSettings?.enabled) {
        drawDoubleExposure(
          ctx,
          imageElements,
          memoizedSettings.canvasSettings.width,
          memoizedSettings.canvasSettings.height,
          doubleExposureSettings
        );
      } else {
        drawLayout(
          ctx,
          imageElements,
          layout,
          memoizedSettings.canvasSettings.width,
          memoizedSettings.canvasSettings.height,
          memoizedSettings.visualEffects,
          imageTransforms,
          crops,
          masks,
          memoizedSettings.filterSettings,
          overlaySettings,
          blendMode,
          transparencies
        );
      }

      // Draw text layers that should be in front of images
      if (frontLayers.length > 0) {
        drawTextLayers(ctx, frontLayers, memoizedSettings.canvasSettings.width, memoizedSettings.canvasSettings.height);
      }

      // Draw sticker layers on top
      if (stickerLayers.length > 0) {
        drawStickerLayers(ctx, stickerLayers, memoizedSettings.canvasSettings.width, memoizedSettings.canvasSettings.height);
      }

      // Draw drawing annotations on top
      if (drawingStrokes.length > 0) {
        drawAnnotations(ctx, drawingStrokes, memoizedSettings.canvasSettings.width, memoizedSettings.canvasSettings.height);
      }

      // Apply glitch effects (after all rendering but before shadows, bokeh, and light leaks)
      if (glitchEffects) {
        applyGlitchEffects(ctx, canvas, glitchEffects);
      }

      // Apply shadows (after glitch effects but before bokeh and light leaks)
      if (shadowSettings) {
        console.log("Applying shadows with settings:", shadowSettings);
        applyShadows(canvas, shadowSettings);
      }

      // Apply bokeh/depth effects (after shadows but before duotone and light leaks)
      if (bokehSettings) {
        applyBokeh(canvas, bokehSettings);
      }

      // Apply duotone (after bokeh but before light leaks)
      if (duotoneSettings) {
        applyDuotone(canvas, duotoneSettings);
      }

      // Draw light leak overlays last (on top of everything)
      if (lightLeakOverlays.length > 0) {
        await drawLightLeakOverlays(ctx, lightLeakOverlays, memoizedSettings.canvasSettings.width, memoizedSettings.canvasSettings.height);
      }
    };

    loadImages();
    }, 50); // 50ms debounce

    return () => {
      if (renderTimeoutRef.current) {
        clearTimeout(renderTimeoutRef.current);
      }
    };
  }, [images, layout, memoizedSettings, imageTransforms, crops, masks, overlaySettings, blendMode, transparencies, textLayers, stickerLayers, drawingStrokes, glitchEffects, doubleExposureSettings, lightLeakOverlays, shadowSettings, bokehSettings, duotoneSettings]);

  if (images.length === 0) {
    return (
      <Card className="h-full">
        <CardContent className="h-full flex items-center justify-center min-h-[300px] sm:min-h-[500px]">
          <div className="text-center space-y-2 px-4">
            <p className="text-sm sm:text-base text-muted-foreground">Preview will appear here</p>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Upload images to start editing
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Check if any images have invalid previews
  const hasInvalidPreviews = images.some(img => !img.preview || img.preview === '');
  if (hasInvalidPreviews) {
    return (
      <Card className="h-full">
        <CardContent className="h-full flex items-center justify-center min-h-[300px] sm:min-h-[500px]">
          <div className="text-center space-y-2 px-4">
            <p className="text-sm sm:text-base text-destructive font-medium">Unable to load image preview</p>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Please try uploading your images again
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-2 sm:p-4">
        <div className="bg-muted/30 rounded-lg p-2 sm:p-4 overflow-x-auto">
          <div className="relative inline-block mx-auto">
            <canvas
              ref={canvasRef}
              className="max-w-full h-auto border border-border rounded shadow-lg"
              style={{
                touchAction: isDrawingEnabled ? "none" : "pan-x pan-y pinch-zoom",
                display: "block",
              }}
            />
            {/* Drawing overlay canvas */}
            {isDrawingEnabled && onDrawingStrokesChange && drawingToolSettings && (
              <DrawingCanvas
                width={canvasSettings.width}
                height={canvasSettings.height}
                strokes={drawingStrokes}
                onStrokesChange={onDrawingStrokesChange}
                currentTool={currentDrawingTool}
                toolSettings={drawingToolSettings}
                isEnabled={isDrawingEnabled}
                baseCanvasRef={canvasRef}
              />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

export default Canvas;
