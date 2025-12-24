import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Share2,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Copy,
  Download,
  Mail,
  MessageSquare,
  Link as LinkIcon,
  Check,
} from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import type { Id } from "@/convex/_generated/dataModel.d.ts";
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
import { drawLayout, drawTextLayers, drawStickerLayers, drawAnnotations, separateTextLayers, type TextLayer, type StickerLayer } from "./canvas-utils";
import { applyGlitchEffects } from "./glitch-utils";
import { trackSocialShare } from "@/lib/analytics";

interface ShareDialogProps {
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
  projectName?: string;
}

export default function ShareDialog({
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
  projectName = "fixmyimage",
}: ShareDialogProps) {
  const [shareUrl, setShareUrl] = useState("");
  const [shareTitle, setShareTitle] = useState("Check out my FixMyImage creation!");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageBlob, setImageBlob] = useState<Blob | null>(null);
  const [storageId, setStorageId] = useState<Id<"_storage"> | null>(null);
  
  const generateUploadUrl = useMutation(api.projects.generateUploadUrl);
  const permanentUrl = useQuery(
    api.projects.getStorageUrl,
    storageId ? { storageId } : "skip"
  );

  // Generate image when dialog opens
  useEffect(() => {
    if (!open || images.length === 0) {
      return;
    }

    const generateImage = async () => {
      setIsGenerating(true);
      try {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Set canvas size
        canvas.width = canvasSettings.width;
        canvas.height = canvasSettings.height;

        // Clear canvas with background color
        ctx.fillStyle = canvasSettings.backgroundColor;
        ctx.fillRect(0, 0, canvasSettings.width, canvasSettings.height);

        // Load and draw images
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

        // Draw the layout
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

        // Draw sticker layers
        if (stickerLayers.length > 0) {
          drawStickerLayers(ctx, stickerLayers, canvasSettings.width, canvasSettings.height);
        }

        // Draw drawing annotations
        if (drawingStrokes.length > 0) {
          drawAnnotations(ctx, drawingStrokes, canvasSettings.width, canvasSettings.height);
        }

        // Apply glitch effects last
        if (glitchEffects) {
          applyGlitchEffects(ctx, canvas, glitchEffects);
        }

        // Convert to blob
        canvas.toBlob(async (blob) => {
          if (blob) {
            setImageBlob(blob);
            // Create a temporary URL for preview
            const url = URL.createObjectURL(blob);
            setShareUrl(url);
            
            // Upload to Convex storage for permanent URL
            try {
              const uploadUrl = await generateUploadUrl();
              const uploadResult = await fetch(uploadUrl, {
                method: "POST",
                headers: { "Content-Type": "image/png" },
                body: blob,
              });
              const { storageId: newStorageId } = await uploadResult.json();
              setStorageId(newStorageId);
            } catch (error) {
              console.error("Failed to upload for sharing:", error);
              // Continue without permanent URL - blob URL still works for download
            }
          }
        }, "image/png");
      } catch (error) {
        console.error("Failed to generate image:", error);
        toast.error("Failed to generate image for sharing");
      } finally {
        setIsGenerating(false);
      }
    };

    generateImage();
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
  ]);

  const handleDownloadAndShare = async () => {
    if (!imageBlob) {
      toast.error("Please wait for image to generate");
      return;
    }

    try {
      // Create download link
      const url = URL.createObjectURL(imageBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${projectName}-share.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("Image downloaded! You can now share it on your preferred platform.");
    } catch (error) {
      console.error("Download failed:", error);
      toast.error("Failed to download image");
    }
  };

  const handleCopyLink = async () => {
    // Use permanent URL if available, otherwise fall back to blob URL
    const urlToCopy = permanentUrl || (imageBlob ? URL.createObjectURL(imageBlob) : null);
    
    if (!urlToCopy) {
      toast.error("Please wait for image to generate");
      return;
    }

    try {
      await navigator.clipboard.writeText(urlToCopy);
      setIsCopied(true);
      toast.success("Image link copied to clipboard!");
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
      toast.error("Failed to copy link");
    }
  };

  const handleShareToEmail = () => {
    const subject = encodeURIComponent(shareTitle);
    const body = encodeURIComponent(
      `Check out my image created with FixMyImage!\n\n${window.location.origin}`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`, "_blank");
    trackSocialShare("email");
  };

  const handleShareToSMS = () => {
    const text = encodeURIComponent(
      `${shareTitle}\n${window.location.origin}`
    );
    window.open(`sms:?body=${text}`, "_blank");
    trackSocialShare("sms");
  };

  const handleNativeShare = async () => {
    if (!imageBlob) {
      toast.error("Please wait for image to generate");
      return;
    }

    if (!navigator.share) {
      toast.error("Sharing not supported on this device");
      return;
    }

    try {
      const file = new File([imageBlob], `${projectName}.png`, { type: "image/png" });
      
      // Check if we can share files
      if (navigator.canShare && !navigator.canShare({ files: [file] })) {
        // Fallback: share without file
        await navigator.share({
          title: shareTitle,
          text: "Check out my FixMyImage creation!",
          url: window.location.origin,
        });
        toast.success("Link shared! Download the image separately to include it.");
        trackSocialShare("native");
        return;
      }

      await navigator.share({
        title: shareTitle,
        text: "Check out my FixMyImage creation!",
        files: [file],
      });
      toast.success("Shared successfully!");
      trackSocialShare("native");
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        console.error("Share failed:", error);
        // Better error message for permission issues
        if ((error as Error).name === "NotAllowedError") {
          toast.error("Permission denied. Please download the image and share it manually.");
        } else {
          toast.error("Failed to share. Try downloading the image instead.");
        }
      }
    }
  };

  const shareToSocial = (platform: string) => {
    // Prefer permanent URL, fallback to app URL
    const imageUrl = permanentUrl || window.location.origin;
    const text = encodeURIComponent(shareTitle);
    
    const urls: Record<string, string> = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(imageUrl)}`,
      twitter: `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(imageUrl)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(imageUrl)}`,
      pinterest: `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(imageUrl)}&media=${encodeURIComponent(imageUrl)}&description=${text}`,
    };

    if (urls[platform]) {
      // For Twitter and LinkedIn, download first so user can manually attach
      if ((platform === "twitter" || platform === "linkedin") && imageBlob) {
        const url = URL.createObjectURL(imageBlob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${projectName}-share.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        toast.success(`Image downloaded! Now opening ${platform} - attach the downloaded image to your post.`, {
          duration: 5000,
        });
      }
      
      window.open(urls[platform], "_blank", "width=600,height=400");
      trackSocialShare(platform);
    }
  };

  return (
    <>
      {/* Hidden canvas for rendering */}
      <canvas ref={canvasRef} style={{ display: "none" }} />

      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5" />
              Share Your Creation
            </DialogTitle>
            <DialogDescription>
              Share your image across social media or download to share manually
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Preview */}
            {shareUrl && (
              <div className="rounded-lg border bg-muted/30 p-4">
                <img
                  src={shareUrl}
                  alt="Preview"
                  className="w-full h-auto rounded shadow-sm max-h-64 object-contain mx-auto"
                />
              </div>
            )}

            {isGenerating && (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">Generating preview...</p>
              </div>
            )}

            {/* Share Title */}
            <div className="space-y-2">
              <Label htmlFor="share-title">Share Message</Label>
              <Input
                id="share-title"
                value={shareTitle}
                onChange={(e) => setShareTitle(e.target.value)}
                placeholder="Add a message to your share..."
              />
            </div>

            <Tabs defaultValue="social" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="social">Social Media</TabsTrigger>
                <TabsTrigger value="direct">Direct Share</TabsTrigger>
                <TabsTrigger value="download">Download</TabsTrigger>
              </TabsList>

              {/* Social Media Tab */}
              <TabsContent value="social" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    className="h-auto py-4 flex-col gap-2"
                    onClick={() => shareToSocial("facebook")}
                  >
                    <Facebook className="h-6 w-6 text-[#1877F2]" />
                    <span className="text-sm">Facebook</span>
                  </Button>

                  <Button
                    variant="outline"
                    className="h-auto py-4 flex-col gap-2"
                    onClick={() => shareToSocial("twitter")}
                  >
                    <Twitter className="h-6 w-6 text-[#1DA1F2]" />
                    <span className="text-sm">Twitter</span>
                  </Button>

                  <Button
                    variant="outline"
                    className="h-auto py-4 flex-col gap-2"
                    onClick={() => shareToSocial("linkedin")}
                  >
                    <Linkedin className="h-6 w-6 text-[#0A66C2]" />
                    <span className="text-sm">LinkedIn</span>
                  </Button>

                  <Button
                    variant="outline"
                    className="h-auto py-4 flex-col gap-2"
                    onClick={() => shareToSocial("pinterest")}
                  >
                    <Instagram className="h-6 w-6 text-[#E4405F]" />
                    <span className="text-sm">Pinterest</span>
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground text-center">
                  Twitter & LinkedIn: Image will download automatically - attach it to your post.
                  <br />
                  Facebook & Pinterest: Manually upload the image after the share dialog opens.
                </p>
              </TabsContent>

              {/* Direct Share Tab */}
              <TabsContent value="direct" className="space-y-4 mt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    className="h-auto py-4 flex-col gap-2"
                    onClick={handleCopyLink}
                    disabled={!imageBlob || isGenerating}
                  >
                    {isCopied ? (
                      <Check className="h-6 w-6 text-green-500" />
                    ) : (
                      <Copy className="h-6 w-6" />
                    )}
                    <span className="text-sm">Copy Image Link</span>
                  </Button>

                  <Button
                    variant="outline"
                    className="h-auto py-4 flex-col gap-2"
                    onClick={handleShareToEmail}
                  >
                    <Mail className="h-6 w-6" />
                    <span className="text-sm">Email</span>
                  </Button>

                  <Button
                    variant="outline"
                    className="h-auto py-4 flex-col gap-2"
                    onClick={handleShareToSMS}
                  >
                    <MessageSquare className="h-6 w-6" />
                    <span className="text-sm">SMS</span>
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground text-center">
                  Copy the image link to share on messaging apps or download to share on social media
                </p>
              </TabsContent>

              {/* Download Tab */}
              <TabsContent value="download" className="space-y-4 mt-4">
                <div className="space-y-3">
                  <Button
                    variant="default"
                    className="w-full h-auto py-4 flex items-center justify-center gap-3"
                    onClick={handleDownloadAndShare}
                    disabled={!imageBlob || isGenerating}
                  >
                    <Download className="h-5 w-5" />
                    <div className="text-left">
                      <div className="font-semibold">Download Image</div>
                      <div className="text-xs opacity-90">
                        Save to your device and share anywhere
                      </div>
                    </div>
                  </Button>

                  <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
                    <div className="flex items-start gap-2">
                      <LinkIcon className="h-4 w-4 mt-0.5 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">Image Link</p>
                        <p className="text-xs text-muted-foreground break-all">
                          {permanentUrl 
                            ? permanentUrl.substring(0, 50) + "..." 
                            : imageBlob 
                              ? "Uploading..." 
                              : "Generating..."}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCopyLink}
                        disabled={!imageBlob || isGenerating}
                      >
                        {isCopied ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg bg-blue-50 dark:bg-blue-950/20 p-4 space-y-2 border border-blue-200 dark:border-blue-800">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    💡 Sharing Tips
                  </p>
                  <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1 list-disc list-inside">
                    <li>Download the image to share on Instagram Stories or Posts</li>
                    <li>Copy image link to share your creation directly</li>
                    <li>High-quality PNG format preserves all your edits</li>
                  </ul>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
