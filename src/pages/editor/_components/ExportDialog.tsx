import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Download, Loader2, AlertCircle, Zap } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api.js";
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
import { drawLayout, drawTextLayers, drawStickerLayers, drawAnnotations, separateTextLayers, drawDoubleExposure, drawLightLeakOverlays, applyShadows, applyBokeh, applyDuotone, type TextLayer, type StickerLayer, type DoubleExposureSettings, type LightLeakOverlay } from "./canvas-utils";
import type { ShadowSettings } from "./Shadows";
import type { BokehSettings } from "./BokehEffects";
import type { DuotoneSettings } from "./Duotone";
import { applyGlitchEffects } from "./glitch-utils";
import UpgradeDialog from "./UpgradeDialog";
import { trackImageExport } from "@/lib/analytics";
import { estimateExportSize, formatBytes, getSizeWarningLevel } from "@/lib/image-optimization";

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
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
  projectName?: string;
}

type ExportFormat = "png" | "jpeg";

export default function ExportDialog({
  open,
  onOpenChange,
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
  projectName = "fixmyimage",
}: ExportDialogProps) {
  const [format, setFormat] = useState<ExportFormat>("png");
  const [quality, setQuality] = useState(92);
  const [isExporting, setIsExporting] = useState(false);
  const [renderKey, setRenderKey] = useState(0);
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
  const [transparentBackground, setTransparentBackground] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Check export limits
  const canExportData = useQuery(api.subscriptions.canExport);
  const trackExport = useMutation(api.subscriptions.trackExport);
  
  // Track if canvas is ready
  const [isCanvasReady, setIsCanvasReady] = useState(false);

  // Reset render key and canvas ready state when dialog opens
  useEffect(() => {
    if (open) {
      setRenderKey(0);
      setIsCanvasReady(false);
    }
  }, [open]);

  // Import the canvas drawing logic
  useEffect(() => {
    console.log("ExportDialog useEffect triggered", {
      open,
      hasCanvas: !!canvasRef.current,
      imageCount: images.length,
      renderKey,
      canvasSize: { width: canvasSettings.width, height: canvasSettings.height }
    });

    if (!open || images.length === 0) {
      console.log("ExportDialog: Skipping render - dialog closed or no images");
      return;
    }

    // If canvas isn't mounted yet, wait a bit and try again
    if (!canvasRef.current) {
      console.log("ExportDialog: Canvas not mounted yet, retrying in 50ms...");
      const timer = setTimeout(() => {
        if (canvasRef.current) {
          console.log("ExportDialog: Canvas now available, incrementing renderKey...");
          // Increment renderKey to trigger useEffect again
          setRenderKey((k) => k + 1);
        }
      }, 50);
      return () => clearTimeout(timer);
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      console.error("ExportDialog: Failed to get canvas context");
      return;
    }

    // Set canvas size
    canvas.width = canvasSettings.width;
    canvas.height = canvasSettings.height;
    console.log("ExportDialog: Canvas sized to", canvas.width, "x", canvas.height);

    // Clear canvas with background color (or transparent if enabled)
    if (!transparentBackground) {
      ctx.fillStyle = canvasSettings.backgroundColor;
      ctx.fillRect(0, 0, canvasSettings.width, canvasSettings.height);
      console.log("ExportDialog: Canvas cleared with background", canvasSettings.backgroundColor);
    } else {
      ctx.clearRect(0, 0, canvasSettings.width, canvasSettings.height);
      console.log("ExportDialog: Canvas cleared with transparent background");
    }

    // Load and draw images
    const loadImages = async () => {
      try {
        console.log("ExportDialog: Loading images...", images.map(img => img.preview));
        
        // Convert all images to data URLs to avoid CORS issues
        const imageDataUrls = await Promise.all(
          images.map(async (img, index) => {
            try {
              // Fetch the image
              const response = await fetch(img.preview);
              const blob = await response.blob();
              
              // Convert to data URL
              return new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
              });
            } catch (error) {
              console.error(`Failed to convert image ${index} to data URL:`, error);
              // Fallback to original URL
              return img.preview;
            }
          })
        );
        
        console.log("ExportDialog: Images converted to data URLs");
        
        // Now load the images from data URLs
        const imageElements = await Promise.all(
          imageDataUrls.map((dataUrl, index) => {
            return new Promise<HTMLImageElement>((resolve, reject) => {
              const imgElement = new Image();
              imgElement.crossOrigin = "anonymous"; // Allow cross-origin images
              
              imgElement.onload = () => {
                console.log(`ExportDialog: Image ${index} loaded successfully`);
                resolve(imgElement);
              };
              imgElement.onerror = (error) => {
                console.error(`ExportDialog: Failed to load image ${index}:`, dataUrl.substring(0, 50), error);
                reject(error);
              };
              imgElement.src = dataUrl;
            });
          })
        );

        console.log("ExportDialog: All images loaded, drawing layout...");
        
        // Separate text layers by z-order
        const { behindLayers, frontLayers } = separateTextLayers(textLayers);

        // Draw text layers that should be behind images
        if (behindLayers.length > 0) {
          console.log("ExportDialog: Drawing text layers behind images...");
          drawTextLayers(ctx, behindLayers, canvasSettings.width, canvasSettings.height);
        }
        
        // Draw the layout using double exposure if enabled, otherwise use normal layout
        if (doubleExposureSettings?.enabled) {
          console.log("ExportDialog: Drawing double exposure...");
          drawDoubleExposure(
            ctx,
            imageElements,
            canvasSettings.width,
            canvasSettings.height,
            doubleExposureSettings
          );
          console.log("ExportDialog: Double exposure drawn successfully");
        } else {
          console.log("ExportDialog: Drawing layout...");
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
          console.log("ExportDialog: Layout drawn successfully");
        }

        // Draw text layers that should be in front of images
        if (frontLayers.length > 0) {
          console.log("ExportDialog: Drawing text layers in front of images...");
          drawTextLayers(ctx, frontLayers, canvasSettings.width, canvasSettings.height);
          console.log("ExportDialog: Text layers drawn successfully");
        }

        // Draw sticker layers on top
        if (stickerLayers.length > 0) {
          console.log("ExportDialog: Drawing sticker layers...");
          drawStickerLayers(ctx, stickerLayers, canvasSettings.width, canvasSettings.height);
          console.log("ExportDialog: Sticker layers drawn successfully");
        }

        // Draw drawing annotations on top
        if (drawingStrokes.length > 0) {
          console.log("ExportDialog: Drawing annotations...");
          drawAnnotations(ctx, drawingStrokes, canvasSettings.width, canvasSettings.height);
          console.log("ExportDialog: Annotations drawn successfully");
        }
        
        // Apply glitch effects (before shadows, bokeh, duotone, and light leaks)
        if (glitchEffects) {
          console.log("ExportDialog: Applying glitch effects...");
          applyGlitchEffects(ctx, canvas, glitchEffects);
          console.log("ExportDialog: Glitch effects applied successfully");
        }
        
        // Apply shadows (after glitch effects but before bokeh, duotone, and light leaks)
        if (shadowSettings) {
          console.log("ExportDialog: Applying shadows...");
          applyShadows(canvas, shadowSettings);
          console.log("ExportDialog: Shadows applied successfully");
        }

        // Apply bokeh/depth effects (after shadows but before duotone and light leaks)
        if (bokehSettings) {
          console.log("ExportDialog: Applying bokeh effects...");
          applyBokeh(canvas, bokehSettings);
          console.log("ExportDialog: Bokeh effects applied successfully");
        }

        // Apply duotone (after bokeh but before light leaks)
        if (duotoneSettings) {
          console.log("ExportDialog: Applying duotone...");
          applyDuotone(canvas, duotoneSettings);
          console.log("ExportDialog: Duotone applied successfully");
        }
        
        // Draw light leak overlays last (on top of everything)
        if (lightLeakOverlays.length > 0) {
          console.log("ExportDialog: Drawing light leak overlays...");
          await drawLightLeakOverlays(ctx, lightLeakOverlays, canvasSettings.width, canvasSettings.height);
          console.log("ExportDialog: Light leak overlays drawn successfully");
        }
        
        // Mark canvas as ready
        console.log("ExportDialog: Canvas rendering complete!");
        setIsCanvasReady(true);
      } catch (error) {
        console.error("ExportDialog: Failed to load images:", error);
        toast.error("Failed to generate preview");
        setIsCanvasReady(false);
      }
    };

    loadImages();
  }, [
    open,
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
    doubleExposureSettings,
    lightLeakOverlays,
    shadowSettings,
    bokehSettings,
    duotoneSettings,
    transparentBackground,
    renderKey,
  ]);

  // Add watermark to canvas for free users
  const addWatermark = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.save();
    
    // Add semi-transparent watermark text
    ctx.font = "bold 24px sans-serif";
    ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    
    const text = "FixMyImage - Free Version";
    const x = width / 2;
    const y = height - 40;
    
    // Add text shadow for visibility
    ctx.shadowColor = "rgba(255, 255, 255, 0.3)";
    ctx.shadowBlur = 4;
    ctx.fillText(text, x, y);
    
    ctx.restore();
  };

  const handleExport = async () => {
    console.log("handleExport called", {
      hasCanvas: !!canvasRef.current,
      hasCanExportData: !!canExportData,
      isCanvasReady,
      imageCount: images.length
    });
    
    if (!canvasRef.current) {
      console.error("handleExport: No canvas ref");
      toast.error("Canvas not ready. Please try again.");
      return;
    }
    
    if (!canExportData) {
      console.error("handleExport: No export data");
      toast.error("Unable to check export limits. Please try again.");
      return;
    }
    
    if (!isCanvasReady) {
      console.error("handleExport: Canvas not ready");
      toast.error("Canvas is still rendering. Please wait a moment.");
      return;
    }

    // Check if user can export
    if (!canExportData.canExport) {
      console.log("handleExport: Export limit reached");
      
      // Show tier-specific error message
      if (canExportData.tier === "free") {
        toast.error(`Export limit reached (${canExportData.exportsLimit}/month). Upgrade to Pro for ${80} exports/month.`);
      } else if (canExportData.tier === "premium") {
        toast.error(`Export limit reached (${canExportData.exportsLimit}/month). Upgrade to Lifetime for unlimited exports.`);
      } else {
        toast.error("Export limit reached. Please upgrade.");
      }
      
      setUpgradeDialogOpen(true);
      return;
    }

    console.log("handleExport: Starting export...");
    setIsExporting(true);
    try {
      // Create a temporary canvas for export with watermark if needed
      const exportCanvas = document.createElement("canvas");
      exportCanvas.width = canvasSettings.width;
      exportCanvas.height = canvasSettings.height;
      const exportCtx = exportCanvas.getContext("2d");
      
      if (!exportCtx) {
        toast.error("Failed to create export canvas");
        setIsExporting(false);
        return;
      }

      // Copy the preview canvas to export canvas
      exportCtx.drawImage(canvasRef.current, 0, 0);

      // Add watermark for free users
      if (!canExportData.isPremium) {
        addWatermark(exportCtx, canvasSettings.width, canvasSettings.height);
      }

      // Convert canvas to blob
      const mimeType = format === "png" ? "image/png" : "image/jpeg";
      const qualityValue = format === "jpeg" ? quality / 100 : undefined;

      exportCanvas.toBlob(
        async (blob) => {
          if (!blob) {
            console.error("handleExport: toBlob returned null - canvas may be empty or corrupted");
            toast.error("Failed to export image - canvas is empty");
            setIsExporting(false);
            return;
          }

          console.log("handleExport: Blob created successfully", blob.size, "bytes");

          try {
            // Track the export in backend
            console.log("handleExport: Tracking export...");
            await trackExport({ format });
            console.log("handleExport: Export tracked successfully");

            // Track in Google Analytics
            trackImageExport(format, format === "jpeg" ? quality : undefined, false);

            // Create download link
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            const fileName = `${projectName.toLowerCase().replace(/\s+/g, "-")}.${format}`;
            link.href = url;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            console.log("handleExport: File downloaded successfully:", fileName);
            toast.success(`Image exported as ${fileName}`);
            setIsExporting(false);
            onOpenChange(false);
          } catch (error) {
            console.error("handleExport: Track export error:", error);
            toast.error("Failed to track export: " + (error instanceof Error ? error.message : String(error)));
            setIsExporting(false);
          }
        },
        mimeType,
        qualityValue
      );
    } catch (error) {
      console.error("handleExport: Export error:", error);
      toast.error("Failed to export image: " + (error instanceof Error ? error.message : String(error)));
      setIsExporting(false);
    }
  };

  const estimatedSizeBytes = estimateExportSize(
    canvasSettings.width,
    canvasSettings.height,
    format,
    quality / 100
  );

  const sizeWarningLevel = getSizeWarningLevel(estimatedSizeBytes);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Export Image</DialogTitle>
          <DialogDescription>
            Configure export settings and download your merged image
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Preview */}
          <div className="space-y-2">
            <Label>Preview</Label>
            <div className="bg-muted/30 rounded-lg p-4 flex items-center justify-center">
              <canvas
                ref={canvasRef}
                className="max-w-full max-h-96 h-auto border border-border rounded shadow-sm"
              />
            </div>
          </div>

          {/* Format Selection */}
          <div className="space-y-2">
            <Label>Format</Label>
            <Select
              value={format}
              onValueChange={(v) => {
                const newFormat = v as ExportFormat;
                setFormat(newFormat);
                // Disable transparent background if switching to JPEG
                if (newFormat === "jpeg" && transparentBackground) {
                  setTransparentBackground(false);
                }
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="png">PNG - Lossless (best quality)</SelectItem>
                <SelectItem value="jpeg">JPEG - Compressed (smaller file)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Transparent Background Option (PNG only) */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="transparent-bg"
              checked={transparentBackground}
              onCheckedChange={(checked) => {
                setTransparentBackground(checked as boolean);
                // Auto-switch to PNG if transparent background is enabled
                if (checked && format === "jpeg") {
                  setFormat("png");
                }
              }}
              disabled={format === "jpeg"}
            />
            <div className="flex-1">
              <Label
                htmlFor="transparent-bg"
                className={format === "jpeg" ? "text-muted-foreground cursor-not-allowed" : "cursor-pointer"}
              >
                Transparent Background
              </Label>
              <p className="text-xs text-muted-foreground">
                Remove canvas background (PNG only)
              </p>
            </div>
          </div>

          {/* Quality Slider (JPEG only) */}
          {format === "jpeg" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Quality</Label>
                <span className="text-sm text-muted-foreground">{quality}%</span>
              </div>
              <Slider
                value={[quality]}
                onValueChange={([value]) => setQuality(value)}
                min={1}
                max={100}
                step={1}
              />
              <p className="text-xs text-muted-foreground">
                Higher quality = larger file size, better image quality
              </p>
            </div>
          )}

          {/* Image Info */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Dimensions</p>
              <p className="font-medium">
                {canvasSettings.width} × {canvasSettings.height}px
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Estimated Size</p>
              <p className="font-medium flex items-center gap-2">
                {formatBytes(estimatedSizeBytes)}
                {sizeWarningLevel === "critical" && (
                  <span className="text-xs text-red-600 dark:text-red-400">Very Large</span>
                )}
                {sizeWarningLevel === "warning" && (
                  <span className="text-xs text-orange-600 dark:text-orange-400">Large</span>
                )}
              </p>
            </div>
          </div>

          {/* File Size Warning */}
          {sizeWarningLevel !== "none" && (
            <Alert className={sizeWarningLevel === "critical" ? "border-red-500/50 bg-red-500/10" : "border-orange-500/50 bg-orange-500/10"}>
              <Zap className={`h-4 w-4 ${sizeWarningLevel === "critical" ? "text-red-600" : "text-orange-600"}`} />
              <AlertDescription className="text-sm">
                {sizeWarningLevel === "critical" ? (
                  <>
                    <strong>Very large file size.</strong> Consider using JPEG format or reducing quality for faster downloads.
                  </>
                ) : (
                  <>
                    <strong>Large file size.</strong> {format === "png" && "Consider using JPEG for a smaller file."} {format === "jpeg" && quality > 85 && "Lower quality can significantly reduce file size."}
                  </>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Export limit info */}
          {canExportData && (
            <div className={`${!canExportData.isPremium ? 'bg-orange-500/10 border-orange-500/20' : 'bg-blue-500/10 border-blue-500/20'} border rounded-lg p-3 flex items-start gap-2`}>
              <AlertCircle className={`h-5 w-5 ${!canExportData.isPremium ? 'text-orange-600' : 'text-blue-600'} shrink-0 mt-0.5`} />
              <div className="flex-1 text-sm">
                {!canExportData.isPremium ? (
                  <>
                    <p className="font-medium text-orange-900 dark:text-orange-100 mb-1">
                      Free Version Watermark
                    </p>
                    <p className="text-orange-800 dark:text-orange-200 text-xs">
                      Exported images will include a watermark. You have {canExportData.exportsRemaining} of {canExportData.exportsLimit} exports remaining this month. Upgrade to Pro for more exports.
                    </p>
                  </>
                ) : canExportData.tier === "premium" ? (
                  <>
                    <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                      Pro Plan
                    </p>
                    <p className="text-blue-800 dark:text-blue-200 text-xs">
                      You have {canExportData.exportsRemaining} of {canExportData.exportsLimit} exports remaining this month.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                      Lifetime Plan
                    </p>
                    <p className="text-blue-800 dark:text-blue-200 text-xs">
                      Unlimited exports available.
                    </p>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={isExporting || images.length === 0 || !canExportData || !isCanvasReady}>
            {isExporting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Exporting...
              </>
            ) : !isCanvasReady ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Preparing...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Export
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>

      <UpgradeDialog
        open={upgradeDialogOpen}
        onOpenChange={setUpgradeDialogOpen}
      />
    </Dialog>
  );
}
