import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Loader2, AlertCircle, Crown } from "lucide-react";
import { toast } from "sonner";
import type { UploadedImage } from "./ImageUpload";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import UpgradeDialog from "./UpgradeDialog";
import { ConvexError } from "convex/values";

interface FaceRetouchProps {
  images: UploadedImage[];
  onImageUpdate: (index: number, newPreview: string) => void;
}

export default function FaceRetouch({
  images,
  onImageUpdate,
}: FaceRetouchProps) {
  const [processing, setProcessing] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
  
  // Get user subscription status
  const subscriptionStatus = useQuery(api.subscriptions.getSubscriptionStatus);
  const isPremium = subscriptionStatus?.tier === "premium" || subscriptionStatus?.tier === "lifetime";

  // Use server-side face retouch action
  const retouchFaceAction = useAction(api.faceRetouch.retouchFace);

  // Helper function to convert blob URL or image URL to base64 data URI
  const convertToBase64 = async (url: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Failed to get canvas context"));
          return;
        }
        ctx.drawImage(img, 0, 0);
        const dataUrl = canvas.toDataURL("image/png");
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = url;
    });
  };

  const handleRetouchFace = async (index: number) => {
    if (processing) return;
    
    // Check if user has premium access
    if (!isPremium) {
      setUpgradeDialogOpen(true);
      toast.error("Face retouch is a Pro feature");
      return;
    }

    setProcessing(true);
    setSelectedImageIndex(index);
    setProgress(0);

    try {
      const image = images[index];
      
      // Show initial progress
      setProgress(10);
      toast.info("Retouching face... This takes 10-30 seconds.", { duration: 3000 });

      // Convert blob URL to base64 data URI
      setProgress(20);
      const base64Image = await convertToBase64(image.preview);
      
      setProgress(30);

      // Simulate progress updates while waiting
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return prev;
          return prev + 3;
        });
      }, 1000);

      // Call server-side face retouch with base64 data URI
      const result = await retouchFaceAction({ 
        imageUrl: base64Image 
      });

      clearInterval(progressInterval);
      setProgress(95);

      // Fetch the processed image
      const response = await fetch(result.imageUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      setProgress(100);

      // Update the image
      onImageUpdate(index, url);

      toast.success(result.cached ? "Face retouched successfully! (cached)" : "Face retouched successfully!");
    } catch (error) {
      if (error instanceof ConvexError) {
        const { message } = error.data as { code: string; message: string };
        toast.error(message);
      } else {
        console.error("Face retouch error:", error);
        toast.error("Failed to retouch face. Please try again.");
      }
    } finally {
      setProcessing(false);
      setSelectedImageIndex(null);
      setProgress(0);
    }
  };

  if (images.length === 0) {
    return null;
  }

  return (
    <>
      <Card className="border-2 border-black shadow-neo">
        <CardHeader className="pb-3 bg-neo-pink/10">
          <CardTitle className="flex items-center gap-2 text-lg font-black uppercase">
            <Sparkles className="h-5 w-5" />
            Face Retouch
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
                <strong>Pro Feature:</strong> Upgrade to access AI-powered face retouching.
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
              AI-powered face enhancement. Smooths skin, brightens eyes, and removes blemishes. Processing takes 10-30 seconds per image.
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            {images.map((image, index) => {
              const isProcessing = processing && selectedImageIndex === index;
              
              return (
                <div key={index} className="space-y-2">
                  <div className="flex items-center gap-3">
                    <img
                      src={image.preview}
                      alt={`Image ${index + 1}`}
                      className="h-16 w-16 object-cover rounded border-2 border-black"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold">Image {index + 1}</p>
                      {isProcessing && (
                        <p className="text-xs text-muted-foreground">
                          Retouching... {progress}%
                        </p>
                      )}
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleRetouchFace(index)}
                      disabled={processing || !isPremium}
                      className="border-2 border-black shadow-neo-sm hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all font-bold shrink-0"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                          Processing
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-3 w-3 mr-2" />
                          Retouch
                        </>
                      )}
                    </Button>
                  </div>
                  {isProcessing && (
                    <Progress
                      value={progress}
                      className="h-2 border-2 border-black"
                    />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
      
      <UpgradeDialog open={upgradeDialogOpen} onOpenChange={setUpgradeDialogOpen} />
    </>
  );
}
