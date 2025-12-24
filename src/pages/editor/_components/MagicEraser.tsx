import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wand2, Loader2, AlertCircle, Crown, Trash2, Undo2 } from "lucide-react";
import { toast } from "sonner";
import type { UploadedImage } from "./ImageUpload";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import UpgradeDialog from "./UpgradeDialog";
import { ConvexError } from "convex/values";

interface MagicEraserProps {
  images: UploadedImage[];
  onImageUpdate: (index: number, newPreview: string) => void;
}

export default function MagicEraser({
  images,
  onImageUpdate,
}: MagicEraserProps) {
  const [processing, setProcessing] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushSize, setBrushSize] = useState(30);
  const [hasMask, setHasMask] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  
  // Get user subscription status
  const subscriptionStatus = useQuery(api.subscriptions.getSubscriptionStatus);
  const isPremium = subscriptionStatus?.tier === "premium" || subscriptionStatus?.tier === "lifetime";

  // Use server-side magic eraser action
  const eraseObjectsAction = useAction(api.magicEraser.eraseObjects);

  // Initialize canvas when image is selected
  useEffect(() => {
    if (selectedImageIndex === null) return;
    
    const canvas = canvasRef.current;
    const maskCanvas = maskCanvasRef.current;
    const image = imageRef.current;
    
    if (!canvas || !maskCanvas || !image) return;

    // Load the selected image
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      // Set canvas sizes to actual image dimensions
      canvas.width = img.width;
      canvas.height = img.height;
      maskCanvas.width = img.width;
      maskCanvas.height = img.height;
      
      // Draw image on main canvas
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      }
      
      // Clear mask canvas
      const maskCtx = maskCanvas.getContext("2d");
      if (maskCtx) {
        maskCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
      }
      
      // Set the image element src to maintain aspect ratio
      image.src = images[selectedImageIndex].preview;
      
      setHasMask(false);
    };
    img.src = images[selectedImageIndex].preview;
  }, [selectedImageIndex, images]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing && e.type !== "mousedown") return;
    if (!maskCanvasRef.current) return;

    const canvas = maskCanvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    // Draw with the scaled brush size
    const scaledBrushSize = brushSize * scaleX;
    ctx.fillStyle = "rgba(255, 0, 0, 0.6)";
    ctx.beginPath();
    ctx.arc(x, y, scaledBrushSize, 0, Math.PI * 2);
    ctx.fill();
    
    setHasMask(true);
  };

  const clearMask = () => {
    const maskCanvas = maskCanvasRef.current;
    if (!maskCanvas) return;
    
    const ctx = maskCanvas.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
      setHasMask(false);
    }
  };

  const convertCanvasToBase64 = (canvas: HTMLCanvasElement): string => {
    return canvas.toDataURL("image/png");
  };

  const convertMaskToBlackWhite = (maskCanvas: HTMLCanvasElement): string => {
    // Create a new canvas for the black and white mask
    const bwCanvas = document.createElement("canvas");
    bwCanvas.width = maskCanvas.width;
    bwCanvas.height = maskCanvas.height;
    const bwCtx = bwCanvas.getContext("2d");
    
    if (!bwCtx) return "";
    
    // Get the mask data
    const maskCtx = maskCanvas.getContext("2d");
    if (!maskCtx) return "";
    
    const imageData = maskCtx.getImageData(0, 0, maskCanvas.width, maskCanvas.height);
    const data = imageData.data;
    
    // Fill with black background
    bwCtx.fillStyle = "black";
    bwCtx.fillRect(0, 0, bwCanvas.width, bwCanvas.height);
    
    // Convert to pure white where there's any mask
    bwCtx.fillStyle = "white";
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] > 0) { // If alpha > 0
        const x = (i / 4) % maskCanvas.width;
        const y = Math.floor((i / 4) / maskCanvas.width);
        bwCtx.fillRect(x, y, 1, 1);
      }
    }
    
    return bwCanvas.toDataURL("image/png");
  };

  const handleEraseObjects = async () => {
    if (selectedImageIndex === null || processing || !hasMask) return;
    
    // Check if user has premium access
    if (!isPremium) {
      setUpgradeDialogOpen(true);
      toast.error("Magic Eraser is a Pro feature");
      return;
    }

    const canvas = canvasRef.current;
    const maskCanvas = maskCanvasRef.current;
    
    if (!canvas || !maskCanvas) return;

    setProcessing(true);
    setProgress(0);

    try {
      // Show initial progress
      setProgress(10);
      toast.info("Erasing objects... This takes 10-20 seconds.", { duration: 3000 });

      // Convert canvases to base64
      setProgress(20);
      const imageBase64 = convertCanvasToBase64(canvas);
      const maskBase64 = convertMaskToBlackWhite(maskCanvas);
      
      setProgress(30);

      // Simulate progress updates while waiting
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return prev;
          return prev + 3;
        });
      }, 1000);

      // Call server-side magic eraser with base64 data URIs
      const result = await eraseObjectsAction({ 
        imageUrl: imageBase64,
        maskUrl: maskBase64,
      });

      clearInterval(progressInterval);
      setProgress(95);

      // Fetch the processed image
      const response = await fetch(result.imageUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      setProgress(100);

      // Update the image
      onImageUpdate(selectedImageIndex, url);

      toast.success(result.cached ? "Objects erased successfully! (cached)" : "Objects erased successfully!");
      
      // Reset
      setSelectedImageIndex(null);
      clearMask();
    } catch (error) {
      if (error instanceof ConvexError) {
        const { message } = error.data as { code: string; message: string };
        toast.error(message);
      } else {
        console.error("Magic Eraser error:", error);
        toast.error("Failed to erase objects. Please try again.");
      }
    } finally {
      setProcessing(false);
      setProgress(0);
    }
  };

  if (images.length === 0) {
    return null;
  }

  return (
    <>
      <Card className="border-2 border-black shadow-neo">
        <CardHeader className="pb-3 bg-neo-cyan/10">
          <CardTitle className="flex items-center gap-2 text-lg font-black uppercase">
            <Wand2 className="h-5 w-5" />
            Magic Eraser
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
                <strong>Pro Feature:</strong> Upgrade to access AI-powered object removal.
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
              Brush over unwanted objects, people, or text to remove them. AI fills in the area naturally. Processing takes 10-20 seconds.
            </AlertDescription>
          </Alert>

          {/* Image Selection */}
          {selectedImageIndex === null ? (
            <div className="space-y-3">
              <Label className="text-sm font-bold">Select an image to edit:</Label>
              {images.map((image, index) => (
                <div key={index} className="flex items-center gap-3">
                  <img
                    src={image.preview}
                    alt={`Image ${index + 1}`}
                    className="h-16 w-16 object-cover rounded border-2 border-black"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold">Image {index + 1}</p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => setSelectedImageIndex(index)}
                    disabled={!isPremium}
                    className="border-2 border-black shadow-neo-sm hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all font-bold shrink-0"
                  >
                    <Wand2 className="h-3 w-3 mr-2" />
                    Edit
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Canvas for drawing mask */}
              <div className="relative border-4 border-black rounded-lg bg-gray-100 dark:bg-gray-900 overflow-auto shadow-neo" style={{ minHeight: "500px", maxHeight: "700px" }}>
                <div className="relative inline-block min-w-full">
                  <canvas
                    ref={canvasRef}
                    className="absolute top-0 left-0 w-full h-full pointer-events-none"
                    style={{ display: "block" }}
                  />
                  <canvas
                    ref={maskCanvasRef}
                    className="absolute top-0 left-0 w-full h-full cursor-crosshair"
                    style={{ display: "block", mixBlendMode: "darken", touchAction: "none" }}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                  />
                  <img
                    ref={imageRef}
                    className="w-full h-auto block"
                    style={{ minWidth: "800px", maxWidth: "100%", visibility: "hidden" }}
                    alt="Selected"
                  />
                </div>
              </div>

              <Alert className="border-2 border-black bg-blue-500/10">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  <strong>Tip:</strong> Click and drag to brush over areas you want to remove. The red overlay shows what will be erased. Scroll or zoom if the image is large.
                </AlertDescription>
              </Alert>

              {/* Brush Size Control */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-bold">Brush Size</Label>
                  <span className="text-sm text-muted-foreground">{brushSize}px</span>
                </div>
                <Slider
                  value={[brushSize]}
                  onValueChange={([value]) => setBrushSize(value)}
                  min={5}
                  max={150}
                  step={5}
                  className="border-2 border-black"
                />
                <p className="text-xs text-muted-foreground">
                  Adjust brush size for fine details or large areas
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={clearMask}
                  disabled={!hasMask || processing}
                  className="border-2 border-black shadow-neo-sm hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all font-bold"
                >
                  <Trash2 className="h-3 w-3 mr-2" />
                  Clear Mask
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelectedImageIndex(null);
                    clearMask();
                  }}
                  disabled={processing}
                  className="border-2 border-black shadow-neo-sm hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all font-bold"
                >
                  <Undo2 className="h-3 w-3 mr-2" />
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleEraseObjects}
                  disabled={!hasMask || processing}
                  className="border-2 border-black shadow-neo-sm hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all font-bold ml-auto"
                >
                  {processing ? (
                    <>
                      <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                      Processing {progress}%
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-3 w-3 mr-2" />
                      Erase Objects
                    </>
                  )}
                </Button>
              </div>

              {/* Progress */}
              {processing && (
                <Progress
                  value={progress}
                  className="h-2 border-2 border-black"
                />
              )}
            </div>
          )}
        </CardContent>
      </Card>
      
      <UpgradeDialog open={upgradeDialogOpen} onOpenChange={setUpgradeDialogOpen} />
    </>
  );
}
