import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, X, Image as ImageIcon, ChevronUp, ChevronDown, GripVertical, AlertCircle, Zap } from "lucide-react";
import { useMutation, useQuery, useConvex } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import type { Id } from "@/convex/_generated/dataModel.d.ts";
import { toast } from "sonner";
import { trackImageUpload } from "@/lib/analytics";
import { compressImage, needsCompression, formatBytes } from "@/lib/image-optimization";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";

interface UploadedImage {
  file: File;
  preview: string;
  storageId?: string;
  order: number;
  transparentPreview?: string; // Stores the version with background removed
  originalPreview?: string; // Stores the original unedited preview URL for before/after comparison
}

interface ImageUploadProps {
  onImagesChange: (images: UploadedImage[]) => void;
  maxImages?: number;
}

export default function ImageUpload({
  onImagesChange,
  maxImages = 8,
}: ImageUploadProps) {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
  const generateUploadUrl = useMutation(api.projects.generateUploadUrl);
  const convex = useConvex(); // For getting storage URLs
  
  // Get upload limits from backend
  const uploadLimits = useQuery(api.subscriptions.getUploadLimits);
  
  // Use tier-based max images or fallback to prop
  const effectiveMaxImages = uploadLimits?.maxImages ?? maxImages;

  const handleFileSelect = useCallback(
    async (files: FileList | null, inputElement?: HTMLInputElement) => {
      if (!files || files.length === 0) return;
      
      if (!uploadLimits) {
        toast.error("Loading upload limits. Please try again.");
        return;
      }

      const fileArray = Array.from(files);
      const validFiles = fileArray.filter((file) =>
        file.type.startsWith("image/")
      );

      if (validFiles.length === 0) {
        toast.error("Please select valid image files");
        return;
      }

      const currentCount = images.length;
      const availableSlots = effectiveMaxImages - currentCount;

      if (validFiles.length > availableSlots) {
        const tierName = uploadLimits.tier === "free" ? "Free" : uploadLimits.tier === "premium" ? "Pro" : "Lifetime";
        if (uploadLimits.tier === "free") {
          toast.error(`Upload limit reached. Free users can upload up to ${effectiveMaxImages} images. Upgrade to Pro for ${8} images.`);
        } else {
          toast.error(`You can only upload ${effectiveMaxImages} images total on the ${tierName} plan.`);
        }
        return;
      }

      setUploading(true);
      setUploadProgress({ current: 0, total: validFiles.length });

      // Detect if on mobile
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      console.log(`Processing ${validFiles.length} images on ${isMobile ? 'mobile' : 'desktop'}`);

      try {
        // Process images sequentially on mobile to avoid memory issues
        const results: Awaited<ReturnType<typeof processImage>>[] = [];
        
        const processImage = async (file: File, i: number) => {
          try {
            console.log(`[${i + 1}/${validFiles.length}] Starting: ${file.name} (${formatBytes(file.size)})`);
            
            let finalFile: File | Blob = file;
            let wasCompressed = false;
            let savedBytes = 0;

            // Validate file size
            const maxSize = 20 * 1024 * 1024; // 20MB
            if (file.size > maxSize) {
              throw new Error(`File too large (max 20MB)`);
            }

            // Basic file type check
            if (!file.type || !file.type.startsWith('image/')) {
              throw new Error(`Not an image file`);
            }

            // SIMPLIFIED: Just create a simple blob URL - no validation
            const tempPreview = URL.createObjectURL(file);
            console.log(`[${i + 1}/${validFiles.length}] Preview created`);
            
            // Wait a moment for blob URL to be ready (mobile needs this)
            await new Promise(resolve => setTimeout(resolve, 100));

            // Skip compression on mobile
            if (!isMobile && needsCompression(file.size, 3)) {
              try {
                console.log(`Compressing ${file.name}...`);
                const compressionResult = await compressImage(file, {
                  maxWidth: 1920,
                  maxHeight: 1920,
                  quality: 0.85,
                });

                if (compressionResult.compressedSize < file.size) {
                  URL.revokeObjectURL(tempPreview);
                  finalFile = compressionResult.blob;
                  wasCompressed = true;
                  savedBytes = compressionResult.originalSize - compressionResult.compressedSize;
                }
              } catch (error) {
                console.error("Compression failed (continuing with original):", error);
              }
            }

            // Upload to Convex - SIMPLE, NO RETRIES
            console.log(`[${i + 1}/${validFiles.length}] Uploading to server...`);
            
            try {
              const uploadUrl = await generateUploadUrl();
              const contentType = finalFile instanceof File ? finalFile.type : file.type;
              
              const result = await fetch(uploadUrl, {
                method: "POST",
                headers: { "Content-Type": contentType },
                body: finalFile,
              });
              
              if (!result.ok) {
                throw new Error(`Server error ${result.status}`);
              }

              const data = await result.json();
              
              if (!data.storageId) {
                throw new Error("No storage ID");
              }

              console.log(`[${i + 1}/${validFiles.length}] ✓ Uploaded! ID: ${data.storageId}`);
              
              // Fetch the storage URL from Convex
              console.log(`[${i + 1}/${validFiles.length}] Fetching storage URL...`);
              const storageUrl = await convex.query(api.projects.getStorageUrl, { 
                storageId: data.storageId as Id<"_storage">
              });
              
              if (!storageUrl) {
                throw new Error("Failed to get storage URL");
              }
              
              console.log(`[${i + 1}/${validFiles.length}] ✓ Got storage URL`);
              
              // Clean up temp blob URL now that we have the storage URL
              URL.revokeObjectURL(tempPreview);
              
              console.log(`[${i + 1}/${validFiles.length}] ✓ Complete!`);
              
              setUploadProgress(prev => ({ ...prev, current: prev.current + 1 }));

              return {
                file,
                preview: storageUrl, // Use storage URL as preview
                originalPreview: storageUrl,
                storageId: data.storageId,
                order: currentCount + i,
                wasCompressed,
                savedBytes,
              };
            } catch (error) {
              URL.revokeObjectURL(tempPreview);
              throw error;
            }
          } catch (error) {
            const errorMsg = error instanceof Error ? error.message : "Unknown error";
            console.error(`[${i + 1}/${validFiles.length}] ✗ FAILED: ${errorMsg}`);
            throw error;
          }
        };

        // Process sequentially on mobile, parallel on desktop
        const errors: string[] = [];
        
        if (isMobile) {
          for (let i = 0; i < validFiles.length; i++) {
            try {
              const result = await processImage(validFiles[i], i);
              results.push(result);
            } catch (error) {
              const errorMsg = error instanceof Error ? error.message : "Unknown error";
              console.error(`Failed ${validFiles[i].name}:`, errorMsg);
              errors.push(`${validFiles[i].name}: ${errorMsg}`);
            }
          }
        } else {
          const allResults = await Promise.allSettled(
            validFiles.map((file, i) => processImage(file, i))
          );
          results.push(
            ...allResults
              .filter((r): r is PromiseFulfilledResult<Awaited<ReturnType<typeof processImage>>> => 
                r.status === "fulfilled"
              )
              .map(r => r.value)
          );
          
          // Collect errors from failed uploads
          allResults
            .filter((r): r is PromiseRejectedResult => r.status === "rejected")
            .forEach((r, i) => {
              const errorMsg = r.reason instanceof Error ? r.reason.message : "Unknown error";
              errors.push(`${validFiles[i].name}: ${errorMsg}`);
            });
        }

        const failed = validFiles.length - results.length;

        if (results.length === 0) {
          console.error("All uploads failed. Errors:", errors);
          const detailedError = errors.length > 0 ? errors[0] : "Unknown error";
          // Show detailed error in alert for mobile debugging
          toast.error(
            <div className="space-y-1">
              <p className="font-semibold">Upload Failed</p>
              <p className="text-xs">{detailedError}</p>
              {errors.length > 1 && (
                <p className="text-xs opacity-70">+{errors.length - 1} more errors</p>
              )}
            </div>,
            { duration: 8000 }
          );
          throw new Error(`Upload failed: ${detailedError}`);
        }
        
        const compressedCount = results.filter(r => r.wasCompressed).length;
        const totalSaved = results.reduce((sum, r) => sum + r.savedBytes, 0);
        
        const newImages = results.map(({ wasCompressed, savedBytes, ...image }) => image);

        const updatedImages = [...images, ...newImages];
        setImages(updatedImages);
        onImagesChange(updatedImages);
        
        if (failed > 0) {
          // Show which files failed
          const failedFiles = errors.map(e => e.split(':')[0]).join(', ');
          toast.warning(
            <div className="space-y-1">
              <p className="font-semibold">{results.length} of {validFiles.length} uploaded</p>
              <p className="text-xs">Failed: {failedFiles}</p>
              <p className="text-xs opacity-70">{errors[0].split(':')[1]}</p>
            </div>,
            { duration: 6000 }
          );
        } else if (compressedCount > 0) {
          toast.success(`${results.length} image(s) uploaded (${compressedCount} optimized, saved ${formatBytes(totalSaved)})`);
        } else {
          toast.success(`${results.length} image(s) uploaded successfully`);
        }
        
        trackImageUpload(results.length);
      } catch (error) {
        console.error("Upload error:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to upload images";
        
        // Show detailed error for debugging
        toast.error(
          <div className="space-y-1">
            <p className="font-semibold">Upload Error</p>
            <p className="text-xs break-words">{errorMessage}</p>
          </div>,
          { duration: 8000 }
        );
      } finally {
        setUploading(false);
        setUploadProgress({ current: 0, total: 0 });
      }
    },
    [images, effectiveMaxImages, generateUploadUrl, onImagesChange, uploadLimits, convex]
  );

  // Helper to handle file input change and reset
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    handleFileSelect(files);
    // Reset input to allow re-selecting same file
    e.target.value = '';
  }, [handleFileSelect]);

  const removeImage = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index);
    // Update order
    const reorderedImages = updatedImages.map((img, i) => ({
      ...img,
      order: i,
    }));
    setImages(reorderedImages);
    onImagesChange(reorderedImages);
  };

  const moveImage = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= images.length) return;

    const updatedImages = arrayMove(images, index, newIndex);
    const reorderedImages = updatedImages.map((img, i) => ({
      ...img,
      order: i,
    }));
    setImages(reorderedImages);
    onImagesChange(reorderedImages);
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = images.findIndex((_, i) => i === active.id);
      const newIndex = images.findIndex((_, i) => i === over.id);

      const updatedImages = arrayMove(images, oldIndex, newIndex);
      const reorderedImages = updatedImages.map((img, i) => ({
        ...img,
        order: i,
      }));
      setImages(reorderedImages);
      onImagesChange(reorderedImages);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Upload Images</h3>
          <p className="text-sm text-muted-foreground">
            Upload 1-{effectiveMaxImages} images to edit or merge
            {uploadLimits?.tier === "free" && (
              <span className="text-xs ml-1">(Upgrade to Pro for 8 images)</span>
            )}
          </p>
        </div>
        <div className="text-sm text-muted-foreground">
          {images.length}/{effectiveMaxImages}
        </div>
      </div>

      {/* Image Grid */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={images.map((_, i) => i)} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {images.map((image, index) => (
              <SortableImageCard
                key={index}
                id={index}
                image={image}
                index={index}
                onRemove={() => removeImage(index)}
                onMoveUp={() => moveImage(index, "up")}
                onMoveDown={() => moveImage(index, "down")}
                canMoveUp={index > 0}
                canMoveDown={index < images.length - 1}
              />
            ))}

            {/* Upload Button */}
            {images.length < effectiveMaxImages && (
              <label className="cursor-pointer">
                <Card className="h-full border-dashed hover:bg-muted/50 transition-colors">
                  <CardContent className="p-2 h-full flex flex-col items-center justify-center min-h-[152px]">
                    {uploading ? (
                      <div className="space-y-2 text-center">
                        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
                        <p className="text-xs text-muted-foreground font-medium">
                          {uploadProgress.current > 0 
                            ? `Uploading ${uploadProgress.current}/${uploadProgress.total}` 
                            : 'Processing...'}
                        </p>
                        {uploadProgress.total > 1 && (
                          <p className="text-[10px] text-muted-foreground">
                            Please wait...
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2 text-center">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                          <Upload className="h-4 w-4 text-primary" />
                        </div>
                        <p className="text-xs text-muted-foreground">Add Image</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleInputChange}
                  disabled={uploading}
                />
              </label>
            )}
          </div>
        </SortableContext>
      </DndContext>

      {images.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <ImageIcon className="h-8 w-8 text-primary" />
            </div>
            <div>
              <p className="font-medium">No images uploaded</p>
              <p className="text-sm text-muted-foreground">
                Upload up to {effectiveMaxImages} images to edit or merge
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                💡 On mobile? For best results, use images under 10MB
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface SortableImageCardProps {
  id: number;
  image: UploadedImage;
  index: number;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}

function SortableImageCard({
  id,
  image,
  index,
  onRemove,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}: SortableImageCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className="relative group overflow-hidden"
    >
      <CardContent className="p-2">
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing z-10 bg-background/80 backdrop-blur-sm rounded p-1"
        >
          <GripVertical className="h-4 w-4" />
        </div>

        {/* Image Order Badge */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-background/80 backdrop-blur-sm rounded-full px-2 py-0.5 text-xs font-semibold z-10">
          {index + 1}
        </div>

        {/* Image */}
        <img
          src={image.preview}
          alt={`Upload ${index + 1}`}
          className="w-full h-32 object-cover rounded"
        />

        {/* Controls */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1">
          <Button
            size="icon"
            variant="secondary"
            className="h-6 w-6"
            onClick={onMoveUp}
            disabled={!canMoveUp}
          >
            <ChevronUp className="h-3 w-3" />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className="h-6 w-6"
            onClick={onMoveDown}
            disabled={!canMoveDown}
          >
            <ChevronDown className="h-3 w-3" />
          </Button>
          <Button
            size="icon"
            variant="destructive"
            className="h-6 w-6"
            onClick={onRemove}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export type { UploadedImage };
