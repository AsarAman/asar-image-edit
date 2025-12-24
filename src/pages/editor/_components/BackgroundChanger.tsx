import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Palette, Upload as UploadIcon, AlertCircle, Crown } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import type { UploadedImage } from "./ImageUpload";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import UpgradeDialog from "./UpgradeDialog";

interface BackgroundChangerProps {
  images: UploadedImage[];
  onImageUpdate: (index: number, newPreview: string, isTransparent?: boolean) => void;
}

// Preset gradients
const PRESET_GRADIENTS = [
  { name: "Sunset", value: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" },
  { name: "Ocean", value: "linear-gradient(135deg, #2E3192 0%, #1BFFFF 100%)" },
  { name: "Fire", value: "linear-gradient(135deg, #FA8BFF 0%, #2BD2FF 50%, #2BFF88 100%)" },
  { name: "Forest", value: "linear-gradient(135deg, #0F2027 0%, #203A43 50%, #2C5364 100%)" },
  { name: "Rose", value: "linear-gradient(135deg, #FFA8A8 0%, #FF6B9D 100%)" },
  { name: "Sky", value: "linear-gradient(135deg, #84FAB0 0%, #8FD3F4 100%)" },
  { name: "Purple", value: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" },
  { name: "Peach", value: "linear-gradient(135deg, #FFDAB9 0%, #FFA07A 100%)" },
];

// Preset patterns
const PRESET_PATTERNS = [
  { name: "Dots", type: "dots" as const },
  { name: "Grid", type: "grid" as const },
  { name: "Diagonal", type: "diagonal" as const },
  { name: "Checkerboard", type: "checkerboard" as const },
];

// Preset background images from Unsplash
const PRESET_IMAGES = [
  { name: "Abstract 1", url: "https://images.unsplash.com/photo-1687618084751-64f314f7c15e?w=1080" },
  { name: "Abstract 2", url: "https://images.unsplash.com/photo-1687618083947-691b6c4adb4d?w=1080" },
  { name: "Abstract 3", url: "https://images.unsplash.com/photo-1687618053208-28a67cf7bddb?w=1080" },
  { name: "Abstract 4", url: "https://images.unsplash.com/photo-1687618084855-844a65a6630d?w=1080" },
  { name: "Nature 1", url: "https://images.unsplash.com/photo-1597434429739-2574d7e06807?w=1080" },
  { name: "Nature 2", url: "https://images.unsplash.com/photo-1530953845756-f7ffd1ab1cf9?w=1080" },
  { name: "Nature 3", url: "https://images.unsplash.com/photo-1542749191-320c458c8435?w=1080" },
  { name: "Nature 4", url: "https://images.unsplash.com/photo-1570810891578-c1d3c74417ef?w=1080" },
  { name: "Texture 1", url: "https://images.unsplash.com/photo-1638303322579-343c8154b80e?w=1080" },
  { name: "Texture 2", url: "https://images.unsplash.com/photo-1584531979583-18c5c4b25efc?w=1080" },
  { name: "Pattern 1", url: "https://images.unsplash.com/photo-1605106702734-205df224ecce?w=1080" },
  { name: "Pattern 2", url: "https://images.unsplash.com/photo-1605106702842-01a887a31122?w=1080" },
];

// Pattern preview component
function PatternPreview({ patternType }: { patternType: string }) {
  const canvasRef = useCallback((canvas: HTMLCanvasElement | null) => {
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = 20;
    canvas.width = 200;
    canvas.height = 80;

    // Fill background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Create pattern
    const patternCanvas = document.createElement("canvas");
    const patternCtx = patternCanvas.getContext("2d");
    if (!patternCtx) return;

    patternCanvas.width = size;
    patternCanvas.height = size;

    // Fill pattern background
    patternCtx.fillStyle = "#ffffff";
    patternCtx.fillRect(0, 0, size, size);

    // Draw pattern
    patternCtx.fillStyle = "#000000";
    patternCtx.strokeStyle = "#000000";
    patternCtx.lineWidth = 1;

    switch (patternType) {
      case "dots":
        patternCtx.beginPath();
        patternCtx.arc(size / 2, size / 2, 2, 0, Math.PI * 2);
        patternCtx.fill();
        break;
      case "grid":
        patternCtx.beginPath();
        patternCtx.moveTo(0, 0);
        patternCtx.lineTo(size, 0);
        patternCtx.moveTo(0, 0);
        patternCtx.lineTo(0, size);
        patternCtx.stroke();
        break;
      case "diagonal":
        patternCtx.beginPath();
        patternCtx.moveTo(0, size);
        patternCtx.lineTo(size, 0);
        patternCtx.stroke();
        break;
      case "checkerboard": {
        const half = size / 2;
        patternCtx.fillRect(0, 0, half, half);
        patternCtx.fillRect(half, half, half, half);
        break;
      }
    }

    const pattern = ctx.createPattern(patternCanvas, "repeat");
    if (pattern) {
      ctx.fillStyle = pattern;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }, [patternType]);

  return <canvas ref={canvasRef} className="w-full h-full" />;
}

export default function BackgroundChanger({
  images,
  onImageUpdate,
}: BackgroundChangerProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [solidColor, setSolidColor] = useState("#ffffff");
  const [processing, setProcessing] = useState(false);
  const [uploadingCustomBg, setUploadingCustomBg] = useState(false);
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
  const generateUploadUrl = useMutation(api.projects.generateUploadUrl);
  
  // Get user subscription status
  const subscriptionStatus = useQuery(api.subscriptions.getSubscriptionStatus);
  const isPremium = subscriptionStatus?.tier === "premium" || subscriptionStatus?.tier === "lifetime";

  const createPatternCanvas = (patternType: string, size: number): HTMLCanvasElement => {
    const patternCanvas = document.createElement("canvas");
    const patternCtx = patternCanvas.getContext("2d");
    if (!patternCtx) throw new Error("Failed to create pattern context");

    patternCanvas.width = size;
    patternCanvas.height = size;

    // Fill with white background
    patternCtx.fillStyle = "#ffffff";
    patternCtx.fillRect(0, 0, size, size);

    // Draw pattern
    patternCtx.fillStyle = "#000000";
    patternCtx.strokeStyle = "#000000";
    patternCtx.lineWidth = 1;

    switch (patternType) {
      case "dots":
        // Draw a dot in the center
        patternCtx.beginPath();
        patternCtx.arc(size / 2, size / 2, 2, 0, Math.PI * 2);
        patternCtx.fill();
        break;

      case "grid":
        // Draw grid lines
        patternCtx.beginPath();
        patternCtx.moveTo(0, 0);
        patternCtx.lineTo(size, 0);
        patternCtx.moveTo(0, 0);
        patternCtx.lineTo(0, size);
        patternCtx.stroke();
        break;

      case "diagonal":
        // Draw diagonal lines
        patternCtx.beginPath();
        patternCtx.moveTo(0, size);
        patternCtx.lineTo(size, 0);
        patternCtx.stroke();
        break;

      case "checkerboard": {
        // Draw checkerboard
        const half = size / 2;
        patternCtx.fillRect(0, 0, half, half);
        patternCtx.fillRect(half, half, half, half);
        break;
      }
    }

    return patternCanvas;
  };

  const applyBackground = useCallback(
    async (backgroundStyle: string, isImage = false, imageUrl = "", patternType = "") => {
      if (processing) return;
      
      // Check if user has premium access
      if (!isPremium) {
        setUpgradeDialogOpen(true);
        toast.error("Background changer is a Pro feature");
        return;
      }

      setProcessing(true);
      toast.info("Applying background...");

      try {
        const image = images[selectedImageIndex];
        if (!image) {
          throw new Error("No image selected");
        }

        // Create canvas
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) throw new Error("Failed to get canvas context");

        // Load the foreground image - use transparent version if available
        const img = new Image();
        const sourceUrl = image.transparentPreview || image.preview;
        // Only set crossOrigin for external URLs, not blob URLs
        if (!sourceUrl.startsWith("blob:")) {
          img.crossOrigin = "anonymous";
        }
        img.src = sourceUrl;

        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error("Failed to load image"));
        });

        canvas.width = img.width;
        canvas.height = img.height;

        // Draw background
        if (patternType) {
          // Create and apply pattern
          const patternCanvas = createPatternCanvas(patternType, 20);
          const pattern = ctx.createPattern(patternCanvas, "repeat");
          if (pattern) {
            ctx.fillStyle = pattern;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }
        } else if (isImage && imageUrl) {
          // Background image
          const bgImg = new Image();
          if (!imageUrl.startsWith("blob:")) {
            bgImg.crossOrigin = "anonymous";
          }
          bgImg.src = imageUrl;
          
          await new Promise<void>((resolve, reject) => {
            bgImg.onload = () => resolve();
            bgImg.onerror = () => reject(new Error("Failed to load background image"));
          });
          
          ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
        } else if (backgroundStyle.includes("gradient")) {
          // Extract gradient colors and create canvas gradient
          const colorMatches = backgroundStyle.match(/#[0-9A-Fa-f]{6}/g) || [];
          
          if (colorMatches.length >= 2) {
            const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            colorMatches.forEach((color, i) => {
              gradient.addColorStop(i / (colorMatches.length - 1), color);
            });
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          } else {
            // Fallback to solid color
            ctx.fillStyle = solidColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }
        } else {
          // Solid color
          ctx.fillStyle = backgroundStyle;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // Draw foreground image on top
        ctx.drawImage(img, 0, 0);

        // Convert to blob and update
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            onImageUpdate(selectedImageIndex, url);
            toast.success("Background applied!");
          } else {
            throw new Error("Failed to create blob");
          }
        }, "image/png");
      } catch (error) {
        console.error("Background application error:", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        toast.error(`Failed to apply background: ${errorMessage}`);
      } finally {
        setProcessing(false);
      }
    },
    [images, selectedImageIndex, onImageUpdate, processing, solidColor, isPremium]
  );

  const handleCustomBackgroundUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    setUploadingCustomBg(true);
    try {
      // Create blob URL directly
      const url = URL.createObjectURL(file);
      await applyBackground("", true, url);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload background");
    } finally {
      setUploadingCustomBg(false);
    }
  };

  if (images.length === 0) {
    return null;
  }

  return (
    <>
      <Card className="border-2 border-black shadow-neo">
      <CardHeader className="pb-3 bg-neo-blue/10">
        <CardTitle className="flex items-center gap-2 text-lg font-black uppercase">
          <Palette className="h-5 w-5" />
          Change Background
          {!isPremium && (
            <span className="ml-auto bg-neo-yellow text-black text-xs px-2 py-1 rounded font-black border-2 border-black flex items-center gap-1">
              <Crown className="h-3 w-3" />
              PRO
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        {!isPremium && (
          <Alert className="border-2 border-neo-yellow bg-neo-yellow/10">
            <Crown className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>Pro Feature:</strong> Upgrade to access background changer with colors, gradients, patterns, and custom images.
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
        
        <Alert className="border-2 border-black">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            💡 Tip: Use "Remove Background" first for best results! Backgrounds work best on transparent images.
          </AlertDescription>
        </Alert>

        {/* Image selector */}
        <div className="space-y-2">
          <Label className="font-bold">Select Image</Label>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImageIndex(index)}
                className={`shrink-0 rounded border-2 transition-all relative ${
                  selectedImageIndex === index
                    ? "border-neo-pink shadow-neo-sm"
                    : "border-black hover:border-neo-blue"
                }`}
              >
                <img
                  src={image.preview}
                  alt={`Image ${index + 1}`}
                  className="h-16 w-16 object-cover rounded"
                />
                {image.transparentPreview && (
                  <div className="absolute -top-1 -right-1 h-4 w-4 bg-green-500 border-2 border-black rounded-full flex items-center justify-center">
                    <span className="text-white text-[8px] font-bold">✓</span>
                  </div>
                )}
              </button>
            ))}
          </div>
          {images[selectedImageIndex]?.transparentPreview ? (
            <p className="text-xs text-green-600 font-bold">✓ Transparent background detected - ready for new backgrounds!</p>
          ) : (
            <p className="text-xs text-amber-600 font-bold">⚠ Use "Remove Background" first for best results</p>
          )}
        </div>

        {/* Background options */}
        <Tabs defaultValue="solid" className="w-full">
          <TabsList className="grid grid-cols-4 w-full border-2 border-black">
            <TabsTrigger value="solid" className="text-xs font-bold">COLOR</TabsTrigger>
            <TabsTrigger value="gradient" className="text-xs font-bold">GRADIENT</TabsTrigger>
            <TabsTrigger value="pattern" className="text-xs font-bold">PATTERN</TabsTrigger>
            <TabsTrigger value="image" className="text-xs font-bold">IMAGE</TabsTrigger>
          </TabsList>

          {/* Solid Colors */}
          <TabsContent value="solid" className="space-y-3">
            <div className="space-y-2">
              <Label className="font-bold">Pick Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={solidColor}
                  onChange={(e) => setSolidColor(e.target.value)}
                  className="w-20 h-10 border-2 border-black cursor-pointer"
                />
                <Input
                  type="text"
                  value={solidColor}
                  onChange={(e) => setSolidColor(e.target.value)}
                  className="flex-1 border-2 border-black font-mono"
                />
              </div>
            </div>
            <Button
              onClick={() => applyBackground(solidColor)}
              disabled={processing}
              className="w-full border-2 border-black shadow-neo-sm hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all font-bold"
            >
              Apply Color
            </Button>
          </TabsContent>

          {/* Gradients */}
          <TabsContent value="gradient" className="space-y-3">
            <ScrollArea className="h-64">
              <div className="grid grid-cols-2 gap-3">
                {PRESET_GRADIENTS.map((gradient) => (
                  <button
                    key={gradient.name}
                    onClick={() => applyBackground(gradient.value)}
                    disabled={processing}
                    className="group relative h-20 rounded border-2 border-black overflow-hidden hover:shadow-neo-sm transition-all"
                  >
                    <div
                      className="w-full h-full"
                      style={{ background: gradient.value }}
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white text-xs font-bold">
                        {gradient.name}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Patterns */}
          <TabsContent value="pattern" className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              {PRESET_PATTERNS.map((pattern) => (
                <button
                  key={pattern.name}
                  onClick={() => applyBackground("", false, "", pattern.type)}
                  disabled={processing}
                  className="group relative h-20 rounded border-2 border-black overflow-hidden hover:shadow-neo-sm transition-all bg-white"
                >
                  <PatternPreview patternType={pattern.type} />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white text-xs font-bold">
                      {pattern.name}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </TabsContent>

          {/* Images */}
          <TabsContent value="image" className="space-y-3">
            <div className="space-y-2">
              <Label className="font-bold">Upload Custom</Label>
              <label className="cursor-pointer">
                <div className="border-2 border-dashed border-black rounded p-4 hover:bg-muted/50 transition-colors text-center">
                  {uploadingCustomBg ? (
                    <div className="space-y-2">
                      <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto" />
                      <p className="text-xs text-muted-foreground">Uploading...</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <UploadIcon className="h-6 w-6 mx-auto" />
                      <p className="text-xs font-bold">Click to upload</p>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleCustomBackgroundUpload(file);
                  }}
                  disabled={uploadingCustomBg}
                />
              </label>
            </div>

            <div className="space-y-2">
              <Label className="font-bold">Preset Backgrounds</Label>
              <ScrollArea className="h-64">
                <div className="grid grid-cols-2 gap-3">
                  {PRESET_IMAGES.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => applyBackground("", true, preset.url)}
                      disabled={processing}
                      className="group relative h-20 rounded border-2 border-black overflow-hidden hover:shadow-neo-sm transition-all"
                    >
                      <img
                        src={preset.url}
                        alt={preset.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white text-xs font-bold">
                          {preset.name}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      </Card>
      
      <UpgradeDialog open={upgradeDialogOpen} onOpenChange={setUpgradeDialogOpen} />
    </>
  );
}
