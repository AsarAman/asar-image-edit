import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Play, Download, Loader2, Film, Repeat, Crown } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import UpgradeDialog from "./UpgradeDialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { UploadedImage } from "./ImageUpload";
import type { CanvasSettingsData } from "./CanvasSettings";
import type { VisualEffectsData } from "./VisualEffects";
import type { ImageTransformData } from "./ImageTransform";
import type { FilterSettings } from "./Filters";
import type { CropData } from "./CropTool";
import { drawLayout, type TextLayer, type StickerLayer } from "./canvas-utils";
// @ts-expect-error - gif.js has no types
import GIF from "gif.js";

export interface AnimationSettings {
  enabled: boolean;
  duration: number; // seconds per image
  transition: "none" | "fade" | "slide-left" | "slide-right" | "slide-up" | "slide-down" | "zoom-in" | "zoom-out" | "dissolve";
  transitionDuration: number; // transition time in seconds
  loop: boolean;
  loopCount: number; // 0 = infinite
  fps: number;
}

interface AnimationSettingsProps {
  images: UploadedImage[];
  canvasSettings: CanvasSettingsData;
  visualEffects: VisualEffectsData;
  imageTransforms: ImageTransformData[];
  crops: CropData[];
  filterSettings: FilterSettings;
  textLayers: TextLayer[];
  stickerLayers: StickerLayer[];
  settings: AnimationSettings;
  onChange: (settings: AnimationSettings) => void;
}

const TRANSITIONS = [
  { value: "none", label: "None (Cut)" },
  { value: "fade", label: "Fade" },
  { value: "slide-left", label: "Slide Left" },
  { value: "slide-right", label: "Slide Right" },
  { value: "slide-up", label: "Slide Up" },
  { value: "slide-down", label: "Slide Down" },
  { value: "zoom-in", label: "Zoom In" },
  { value: "zoom-out", label: "Zoom Out" },
  { value: "dissolve", label: "Dissolve" },
];

function AnimationPreview({
  open,
  onOpenChange,
  images,
  canvasSettings,
  visualEffects,
  imageTransforms,
  crops,
  filterSettings,
  textLayers,
  stickerLayers,
  animationSettings,
  onExport,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  images: UploadedImage[];
  canvasSettings: CanvasSettingsData;
  visualEffects: VisualEffectsData;
  imageTransforms: ImageTransformData[];
  crops: CropData[];
  filterSettings: FilterSettings;
  textLayers: TextLayer[];
  stickerLayers: StickerLayer[];
  animationSettings: AnimationSettings;
  onExport: (format: "gif" | "webm") => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<"gif" | "webm">("gif");
  const [currentFrame, setCurrentFrame] = useState(0);

  // Load images
  const [loadedImages, setLoadedImages] = useState<HTMLImageElement[]>([]);

  useEffect(() => {
    if (!open) return;

    const loadImages = async () => {
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
      setLoadedImages(imageElements);
    };

    loadImages();
  }, [open, images]);

  // Animation loop
  useEffect(() => {
    if (!isPlaying || !canvasRef.current || loadedImages.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = canvasSettings.width;
    canvas.height = canvasSettings.height;

    const frameDuration = 1000 / animationSettings.fps;
    const imageDuration = animationSettings.duration * 1000;
    const transitionDuration = animationSettings.transitionDuration * 1000;
    const totalDuration = (imageDuration + (animationSettings.transition !== "none" ? transitionDuration : 0)) * images.length;

    let startTime = Date.now();
    let lastFrameTime = startTime;

    const animate = () => {
      const now = Date.now();
      const elapsed = now - startTime;

      // Calculate current position in animation
      let position = elapsed % totalDuration;
      const imageWithTransition = imageDuration + (animationSettings.transition !== "none" ? transitionDuration : 0);
      const currentIndex = Math.floor(position / imageWithTransition);
      const positionInSegment = position % imageWithTransition;

      setCurrentFrame(currentIndex);

      // Clear canvas
      ctx.fillStyle = canvasSettings.backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const currentImage = loadedImages[currentIndex % loadedImages.length];
      const nextImage = loadedImages[(currentIndex + 1) % loadedImages.length];

      // Check if we're in transition
      const inTransition = animationSettings.transition !== "none" && positionInSegment > imageDuration;
      const transitionProgress = inTransition ? (positionInSegment - imageDuration) / transitionDuration : 0;

      if (inTransition && animationSettings.transition !== "none") {
        drawTransition(
          ctx,
          currentImage,
          nextImage,
          transitionProgress,
          animationSettings.transition,
          canvas.width,
          canvas.height
        );
      } else {
        // Draw current image
        drawSingleImage(ctx, currentImage, canvas.width, canvas.height);
      }

      // Continue animation
      if (now - lastFrameTime >= frameDuration) {
        lastFrameTime = now;
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, loadedImages, canvasSettings, animationSettings, images.length]);

  const drawSingleImage = (
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    width: number,
    height: number
  ) => {
    const scale = Math.min(width / img.width, height / img.height);
    const scaledWidth = img.width * scale;
    const scaledHeight = img.height * scale;
    const x = (width - scaledWidth) / 2;
    const y = (height - scaledHeight) / 2;

    ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
  };

  const drawTransition = (
    ctx: CanvasRenderingContext2D,
    fromImg: HTMLImageElement,
    toImg: HTMLImageElement,
    progress: number,
    transition: string,
    width: number,
    height: number
  ) => {
    const easeProgress = easeInOutCubic(progress);

    switch (transition) {
      case "fade":
        ctx.globalAlpha = 1 - easeProgress;
        drawSingleImage(ctx, fromImg, width, height);
        ctx.globalAlpha = easeProgress;
        drawSingleImage(ctx, toImg, width, height);
        ctx.globalAlpha = 1;
        break;

      case "slide-left":
        ctx.save();
        ctx.translate(-width * easeProgress, 0);
        drawSingleImage(ctx, fromImg, width, height);
        ctx.restore();
        ctx.save();
        ctx.translate(width * (1 - easeProgress), 0);
        drawSingleImage(ctx, toImg, width, height);
        ctx.restore();
        break;

      case "slide-right":
        ctx.save();
        ctx.translate(width * easeProgress, 0);
        drawSingleImage(ctx, fromImg, width, height);
        ctx.restore();
        ctx.save();
        ctx.translate(-width * (1 - easeProgress), 0);
        drawSingleImage(ctx, toImg, width, height);
        ctx.restore();
        break;

      case "slide-up":
        ctx.save();
        ctx.translate(0, -height * easeProgress);
        drawSingleImage(ctx, fromImg, width, height);
        ctx.restore();
        ctx.save();
        ctx.translate(0, height * (1 - easeProgress));
        drawSingleImage(ctx, toImg, width, height);
        ctx.restore();
        break;

      case "slide-down":
        ctx.save();
        ctx.translate(0, height * easeProgress);
        drawSingleImage(ctx, fromImg, width, height);
        ctx.restore();
        ctx.save();
        ctx.translate(0, -height * (1 - easeProgress));
        drawSingleImage(ctx, toImg, width, height);
        ctx.restore();
        break;

      case "zoom-in": {
        ctx.save();
        ctx.globalAlpha = 1 - easeProgress;
        const scale1 = 1 + easeProgress * 0.2;
        ctx.translate(width / 2, height / 2);
        ctx.scale(scale1, scale1);
        ctx.translate(-width / 2, -height / 2);
        drawSingleImage(ctx, fromImg, width, height);
        ctx.restore();
        ctx.globalAlpha = easeProgress;
        drawSingleImage(ctx, toImg, width, height);
        ctx.globalAlpha = 1;
        break;
      }

      case "zoom-out": {
        ctx.save();
        ctx.globalAlpha = 1 - easeProgress;
        const scale2 = 1 - easeProgress * 0.2;
        ctx.translate(width / 2, height / 2);
        ctx.scale(scale2, scale2);
        ctx.translate(-width / 2, -height / 2);
        drawSingleImage(ctx, fromImg, width, height);
        ctx.restore();
        ctx.globalAlpha = easeProgress;
        drawSingleImage(ctx, toImg, width, height);
        ctx.globalAlpha = 1;
        break;
      }

      case "dissolve": {
        // Random pixel dissolve effect
        drawSingleImage(ctx, fromImg, width, height);
        const imageData = ctx.getImageData(0, 0, width, height);
        const pixels = imageData.data;
        
        // Create temp canvas for next image
        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = width;
        tempCanvas.height = height;
        const tempCtx = tempCanvas.getContext("2d");
        if (tempCtx) {
          drawSingleImage(tempCtx, toImg, width, height);
          const nextImageData = tempCtx.getImageData(0, 0, width, height);
          const nextPixels = nextImageData.data;
          
          // Mix pixels based on progress with randomness
          for (let i = 0; i < pixels.length; i += 4) {
            const random = Math.random();
            if (random < easeProgress) {
              pixels[i] = nextPixels[i];
              pixels[i + 1] = nextPixels[i + 1];
              pixels[i + 2] = nextPixels[i + 2];
              pixels[i + 3] = nextPixels[i + 3];
            }
          }
          
          ctx.putImageData(imageData, 0, 0);
        }
        break;
      }

      default:
        drawSingleImage(ctx, toImg, width, height);
    }
  };

  const easeInOutCubic = (t: number): number => {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  };

  const handleExport = async () => {
    if (loadedImages.length === 0) {
      toast.error("No images to export");
      return;
    }

    setIsExporting(true);
    setIsPlaying(false);

    try {
      if (exportFormat === "gif") {
        await exportGIF();
      } else {
        await exportWebM();
      }
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export animation");
    } finally {
      setIsExporting(false);
    }
  };

  const exportGIF = async () => {
    return new Promise<void>((resolve, reject) => {
      const gif = new GIF({
        workers: 2,
        quality: 10,
        width: canvasSettings.width,
        height: canvasSettings.height,
        workerScript: "/gif.worker.js",
      });

      const canvas = document.createElement("canvas");
      canvas.width = canvasSettings.width;
      canvas.height = canvasSettings.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Failed to get canvas context"));
        return;
      }

      const frameDuration = 1000 / animationSettings.fps;
      const framesPerImage = Math.floor((animationSettings.duration * 1000) / frameDuration);
      const transitionFrames = animationSettings.transition !== "none"
        ? Math.floor((animationSettings.transitionDuration * 1000) / frameDuration)
        : 0;

      let totalFrames = 0;
      let addedFrames = 0;

      // Calculate total frames for progress
      totalFrames = loadedImages.length * framesPerImage;
      if (animationSettings.transition !== "none") {
        totalFrames += loadedImages.length * transitionFrames;
      }

      // Show progress toast
      const progressToastId = toast.loading(`Generating GIF... 0%`);

      // Progress callback
      gif.on("progress", (progress: number) => {
        const percent = Math.round(progress * 100);
        toast.loading(`Generating GIF... ${percent}%`, { id: progressToastId });
      });

      // Generate frames
      try {
        for (let i = 0; i < loadedImages.length; i++) {
          const currentImg = loadedImages[i];
          const nextImg = loadedImages[(i + 1) % loadedImages.length];

          // Add frames for current image
          for (let f = 0; f < framesPerImage; f++) {
            ctx.fillStyle = canvasSettings.backgroundColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            drawSingleImage(ctx, currentImg, canvas.width, canvas.height);
            gif.addFrame(canvas, { delay: frameDuration, copy: true });
            addedFrames++;
          }

          // Add transition frames (for all images to create seamless loop)
          if (animationSettings.transition !== "none") {
            for (let f = 0; f < transitionFrames; f++) {
              const progress = f / transitionFrames;
              ctx.fillStyle = canvasSettings.backgroundColor;
              ctx.fillRect(0, 0, canvas.width, canvas.height);
              drawTransition(
                ctx,
                currentImg,
                nextImg,
                progress,
                animationSettings.transition,
                canvas.width,
                canvas.height
              );
              gif.addFrame(canvas, { delay: frameDuration, copy: true });
              addedFrames++;
            }
          }
        }

        console.log(`Added ${addedFrames} frames to GIF`);
      } catch (error) {
        toast.dismiss(progressToastId);
        reject(error);
        return;
      }

      gif.on("finished", (blob: Blob) => {
        toast.dismiss(progressToastId);
        
        console.log("GIF rendering complete, blob size:", blob.size);
        
        // Create download with better browser compatibility
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "fixmyimage-animation.gif";
        link.style.display = "none";
        
        // Append to body, click, and remove
        document.body.appendChild(link);
        
        // Use setTimeout to ensure the link is in the DOM
        setTimeout(() => {
          link.click();
          
          // Clean up after a delay
          setTimeout(() => {
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
          }, 100);
          
          toast.success("GIF downloaded successfully!");
          resolve();
        }, 100);
      });

      gif.on("error", (error: Error) => {
        toast.dismiss(progressToastId);
        console.error("GIF rendering error:", error);
        reject(error);
      });

      // Start rendering
      gif.render();
    });
  };

  const exportWebM = async () => {
    const canvas = canvasRef.current;
    if (!canvas) {
      throw new Error("Canvas not found");
    }

    const stream = canvas.captureStream(animationSettings.fps);
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: "video/webm;codecs=vp9",
      videoBitsPerSecond: 2500000,
    });

    const chunks: Blob[] = [];
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunks.push(e.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: "video/webm" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "animation.webm";
      link.click();
      URL.revokeObjectURL(url);
      toast.success("Video exported successfully!");
    };

    // Start recording
    mediaRecorder.start();
    setIsPlaying(true);

    // Calculate total duration
    const totalDuration =
      (animationSettings.duration +
        (animationSettings.transition !== "none" ? animationSettings.transitionDuration : 0)) *
      images.length *
      (animationSettings.loop ? animationSettings.loopCount || 1 : 1);

    // Stop recording after duration
    setTimeout(() => {
      mediaRecorder.stop();
      setIsPlaying(false);
    }, totalDuration * 1000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Animation Preview & Export</DialogTitle>
          <DialogDescription>
            Preview your animation and export as GIF or WebM video
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Preview Canvas */}
          <div className="relative bg-muted rounded-lg overflow-hidden">
            <canvas
              ref={canvasRef}
              className="w-full h-auto"
              style={{ maxHeight: "500px", objectFit: "contain" }}
            />
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsPlaying(!isPlaying)}
              >
                <Play className="h-4 w-4 mr-2" />
                {isPlaying ? "Pause" : "Play"}
              </Button>
              <span className="text-sm bg-background/80 px-3 py-1 rounded">
                Frame {currentFrame + 1} / {images.length}
              </span>
            </div>
          </div>

          {/* Export Settings */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Export Format</Label>
              <Select
                value={exportFormat}
                onValueChange={(value) => setExportFormat(value as "gif" | "webm")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gif">Animated GIF</SelectItem>
                  <SelectItem value="webm">WebM Video</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="text-xs text-muted-foreground space-y-1">
              <div>• GIF: Universal compatibility, larger file size</div>
              <div>• WebM: Smaller file size, may require modern browser</div>
              <div>
                • Total Duration: {(animationSettings.duration + (animationSettings.transition !== "none" ? animationSettings.transitionDuration : 0)) * images.length}s
              </div>
              <div>• FPS: {animationSettings.fps}</div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={handleExport} disabled={isExporting}>
            {isExporting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Export {exportFormat.toUpperCase()}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function AnimationSettingsComponent({
  images,
  canvasSettings,
  visualEffects,
  imageTransforms,
  crops,
  filterSettings,
  textLayers,
  stickerLayers,
  settings,
  onChange,
}: AnimationSettingsProps) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
  
  // Get user subscription status
  const subscriptionStatus = useQuery(api.subscriptions.getSubscriptionStatus);
  const isPremium = subscriptionStatus?.tier === "premium" || subscriptionStatus?.tier === "lifetime";

  const handleChange = (updates: Partial<AnimationSettings>) => {
    onChange({ ...settings, ...updates });
  };
  
  const handlePreviewClick = () => {
    // Check if user has premium access
    if (!isPremium) {
      setUpgradeDialogOpen(true);
      toast.error("GIF/Animation export is a Pro feature");
      return;
    }
    
    setPreviewOpen(true);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Film className="h-5 w-5" />
            Animation & GIF
            {!isPremium && (
              <span className="ml-auto bg-neo-yellow text-black text-xs px-2 py-1 rounded font-black border-2 border-black flex items-center gap-1">
                <Crown className="h-3 w-3" />
                PRO
              </span>
            )}
          </CardTitle>
          <CardDescription>
            Create animated GIFs or videos from your images
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isPremium && (
            <Alert className="border-2 border-neo-yellow bg-neo-yellow/10">
              <Crown className="h-4 w-4" />
              <AlertDescription className="text-sm">
                <strong>Pro Feature:</strong> Create animated GIFs and videos from your images.
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => setUpgradeDialogOpen(true)}
                  className="h-auto p-0 ml-1 underline"
                >
                  Upgrade now
                </Button>
              </AlertDescription>
            </Alert>
          )}
          
          {images.length < 2 ? (
            <p className="text-sm text-muted-foreground">
              Upload 2 or more images to create animations
            </p>
          ) : (
            <>
              {/* Duration per Image */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Duration per Image</Label>
                  <span className="text-sm text-muted-foreground">
                    {settings.duration.toFixed(1)}s
                  </span>
                </div>
                <Slider
                  value={[settings.duration]}
                  onValueChange={([value]) => handleChange({ duration: value })}
                  min={0.1}
                  max={5}
                  step={0.1}
                />
              </div>

              {/* Transition Effect */}
              <div className="space-y-2">
                <Label>Transition Effect</Label>
                <Select
                  value={settings.transition}
                  onValueChange={(value) => handleChange({ transition: value as AnimationSettings["transition"] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TRANSITIONS.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Transition Duration */}
              {settings.transition !== "none" && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Transition Duration</Label>
                    <span className="text-sm text-muted-foreground">
                      {settings.transitionDuration.toFixed(1)}s
                    </span>
                  </div>
                  <Slider
                    value={[settings.transitionDuration]}
                    onValueChange={([value]) => handleChange({ transitionDuration: value })}
                    min={0.1}
                    max={2}
                    step={0.1}
                  />
                </div>
              )}

              {/* FPS */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Frames Per Second (FPS)</Label>
                  <span className="text-sm text-muted-foreground">
                    {settings.fps}
                  </span>
                </div>
                <Slider
                  value={[settings.fps]}
                  onValueChange={([value]) => handleChange({ fps: value })}
                  min={10}
                  max={60}
                  step={5}
                />
              </div>

              {/* Loop Settings */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <Repeat className="h-4 w-4" />
                    Loop Animation
                  </Label>
                  <Button
                    variant={settings.loop ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleChange({ loop: !settings.loop })}
                  >
                    {settings.loop ? "On" : "Off"}
                  </Button>
                </div>
              </div>

              {settings.loop && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Loop Count</Label>
                    <span className="text-sm text-muted-foreground">
                      {settings.loopCount === 0 ? "Infinite" : `${settings.loopCount}x`}
                    </span>
                  </div>
                  <Slider
                    value={[settings.loopCount]}
                    onValueChange={([value]) => handleChange({ loopCount: value })}
                    min={0}
                    max={10}
                    step={1}
                  />
                  <p className="text-xs text-muted-foreground">
                    0 = infinite loop (GIF only)
                  </p>
                </div>
              )}

              {/* Preview Button */}
              <div className="pt-4">
                <Button
                  onClick={handlePreviewClick}
                  disabled={!isPremium}
                  className="w-full"
                  size="lg"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Preview & Export Animation
                </Button>
              </div>

              {/* Info */}
              <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
                <div>
                  • Total Duration: {(settings.duration + (settings.transition !== "none" ? settings.transitionDuration : 0)) * images.length}s per loop
                </div>
                <div>• {images.length} images</div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <AnimationPreview
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        images={images}
        canvasSettings={canvasSettings}
        visualEffects={visualEffects}
        imageTransforms={imageTransforms}
        crops={crops}
        filterSettings={filterSettings}
        textLayers={textLayers}
        stickerLayers={stickerLayers}
        animationSettings={settings}
        onExport={(format) => console.log("Export", format)}
      />
      
      <UpgradeDialog open={upgradeDialogOpen} onOpenChange={setUpgradeDialogOpen} />
    </>
  );
}
