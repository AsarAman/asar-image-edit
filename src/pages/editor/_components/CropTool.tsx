import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Crop, Maximize2, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export interface CropData {
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  width: number; // percentage 0-100
  height: number; // percentage 0-100
}

interface CropToolProps {
  imageCount: number;
  crops: CropData[];
  images: { preview: string }[];
  onChange: (crops: CropData[]) => void;
}

interface AspectRatio {
  name: string;
  ratio: number | null; // null for freeform
  label: string;
}

const ASPECT_RATIOS: AspectRatio[] = [
  { name: "freeform", ratio: null, label: "Freeform" },
  { name: "1:1", ratio: 1, label: "1:1 Square" },
  { name: "16:9", ratio: 16 / 9, label: "16:9 Landscape" },
  { name: "9:16", ratio: 9 / 16, label: "9:16 Portrait" },
  { name: "4:3", ratio: 4 / 3, label: "4:3 Standard" },
  { name: "3:4", ratio: 3 / 4, label: "3:4 Portrait" },
  { name: "4:5", ratio: 4 / 5, label: "4:5 Instagram" },
  { name: "21:9", ratio: 21 / 9, label: "21:9 Cinematic" },
];

function CropDialog({
  open,
  onOpenChange,
  imageUrl,
  initialCrop,
  onApply,
  imageIndex,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl: string;
  initialCrop: CropData;
  onApply: (crop: CropData) => void;
  imageIndex: number;
}) {
  const [crop, setCrop] = useState<CropData>(initialCrop);
  const [selectedRatio, setSelectedRatio] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Reset crop when dialog opens
  useEffect(() => {
    if (open) {
      setCrop(initialCrop);
      setSelectedRatio(null);
    }
  }, [open, initialCrop]);

  const handleMouseDown = (e: React.MouseEvent, action: "drag" | string) => {
    e.preventDefault();
    if (action === "drag") {
      setIsDragging(true);
    } else {
      setIsResizing(action);
    }
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const deltaX = ((e.clientX - dragStart.x) / rect.width) * 100;
    const deltaY = ((e.clientY - dragStart.y) / rect.height) * 100;

    if (isDragging) {
      setCrop((prev) => ({
        ...prev,
        x: Math.max(0, Math.min(100 - prev.width, prev.x + deltaX)),
        y: Math.max(0, Math.min(100 - prev.height, prev.y + deltaY)),
      }));
      setDragStart({ x: e.clientX, y: e.clientY });
    } else if (isResizing) {
      let newCrop = { ...crop };

      if (isResizing.includes("e")) {
        const newWidth = Math.max(10, Math.min(100 - newCrop.x, newCrop.width + deltaX));
        if (selectedRatio) {
          const newHeight = newWidth / selectedRatio;
          if (newCrop.y + newHeight <= 100) {
            newCrop.width = newWidth;
            newCrop.height = newHeight;
          }
        } else {
          newCrop.width = newWidth;
        }
      }
      if (isResizing.includes("w")) {
        const newWidth = Math.max(10, Math.min(newCrop.x + newCrop.width, newCrop.width - deltaX));
        const widthDiff = newCrop.width - newWidth;
        if (selectedRatio) {
          const newHeight = newWidth / selectedRatio;
          const heightDiff = newCrop.height - newHeight;
          if (newCrop.y + heightDiff >= 0 && newCrop.y + newHeight <= 100) {
            newCrop.x += widthDiff;
            newCrop.width = newWidth;
            newCrop.height = newHeight;
          }
        } else {
          newCrop.x += widthDiff;
          newCrop.width = newWidth;
        }
      }
      if (isResizing.includes("s") && !selectedRatio) {
        newCrop.height = Math.max(10, Math.min(100 - newCrop.y, newCrop.height + deltaY));
      }
      if (isResizing.includes("n") && !selectedRatio) {
        const newHeight = Math.max(10, Math.min(newCrop.y + newCrop.height, newCrop.height - deltaY));
        const heightDiff = newCrop.height - newHeight;
        newCrop.y += heightDiff;
        newCrop.height = newHeight;
      }

      // Handle corners with aspect ratio
      if (selectedRatio && (isResizing === "se" || isResizing === "sw" || isResizing === "ne" || isResizing === "nw")) {
        if (isResizing.includes("s")) {
          const newHeight = Math.max(10, Math.min(100 - newCrop.y, newCrop.height + deltaY));
          const newWidth = newHeight * selectedRatio;
          if (isResizing.includes("e")) {
            if (newCrop.x + newWidth <= 100) {
              newCrop.height = newHeight;
              newCrop.width = newWidth;
            }
          } else {
            const widthDiff = newCrop.width - newWidth;
            if (newCrop.x + widthDiff >= 0) {
              newCrop.x += widthDiff;
              newCrop.width = newWidth;
              newCrop.height = newHeight;
            }
          }
        } else if (isResizing.includes("n")) {
          const newHeight = Math.max(10, Math.min(newCrop.y + newCrop.height, newCrop.height - deltaY));
          const newWidth = newHeight * selectedRatio;
          const heightDiff = newCrop.height - newHeight;
          if (isResizing.includes("e")) {
            if (newCrop.x + newWidth <= 100 && newCrop.y + heightDiff >= 0) {
              newCrop.y += heightDiff;
              newCrop.height = newHeight;
              newCrop.width = newWidth;
            }
          } else {
            const widthDiff = newCrop.width - newWidth;
            if (newCrop.x + widthDiff >= 0 && newCrop.y + heightDiff >= 0) {
              newCrop.x += widthDiff;
              newCrop.y += heightDiff;
              newCrop.width = newWidth;
              newCrop.height = newHeight;
            }
          }
        }
      }

      setCrop(newCrop);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(null);
  };

  useEffect(() => {
    if (isDragging || isResizing) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, isResizing, dragStart, crop, selectedRatio]);

  const applyAspectRatio = (ratio: number | null) => {
    setSelectedRatio(ratio);
    if (ratio) {
      const newWidth = crop.width;
      const newHeight = newWidth / ratio;
      if (crop.y + newHeight <= 100) {
        setCrop({ ...crop, height: newHeight });
      } else {
        const maxHeight = 100 - crop.y;
        const maxWidth = maxHeight * ratio;
        setCrop({ ...crop, width: maxWidth, height: maxHeight });
      }
    }
  };

  const resetCrop = () => {
    setCrop({ x: 0, y: 0, width: 100, height: 100 });
    setSelectedRatio(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crop Image {imageIndex + 1}</DialogTitle>
          <DialogDescription>
            Select an aspect ratio or drag to crop freeform
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Aspect Ratio Buttons */}
          <div className="flex flex-wrap gap-2">
            {ASPECT_RATIOS.map((ar) => (
              <Button
                key={ar.name}
                variant={selectedRatio === ar.ratio ? "default" : "outline"}
                size="sm"
                onClick={() => applyAspectRatio(ar.ratio)}
              >
                {ar.label}
              </Button>
            ))}
            <Button variant="outline" size="sm" onClick={resetCrop}>
              <X className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>

          {/* Crop Area */}
          <div
            ref={containerRef}
            className="relative w-full aspect-video bg-muted rounded-lg overflow-hidden"
            style={{ userSelect: "none" }}
          >
            <img
              ref={imageRef}
              src={imageUrl}
              alt="Crop preview"
              className="w-full h-full object-contain"
              draggable={false}
            />

            {/* Overlay */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Dark overlay outside crop */}
              <div
                className="absolute inset-0 bg-black/50"
                style={{
                  clipPath: `polygon(
                    0 0,
                    100% 0,
                    100% 100%,
                    0 100%,
                    0 0,
                    ${crop.x}% ${crop.y}%,
                    ${crop.x}% ${crop.y + crop.height}%,
                    ${crop.x + crop.width}% ${crop.y + crop.height}%,
                    ${crop.x + crop.width}% ${crop.y}%,
                    ${crop.x}% ${crop.y}%
                  )`,
                }}
              />

              {/* Crop box */}
              <div
                className="absolute border-2 border-primary pointer-events-auto cursor-move"
                style={{
                  left: `${crop.x}%`,
                  top: `${crop.y}%`,
                  width: `${crop.width}%`,
                  height: `${crop.height}%`,
                }}
                onMouseDown={(e) => handleMouseDown(e, "drag")}
              >
                {/* Grid lines */}
                <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div key={i} className="border border-primary/30" />
                  ))}
                </div>

                {/* Resize handles */}
                {["nw", "n", "ne", "w", "e", "sw", "s", "se"].map((handle) => (
                  <div
                    key={handle}
                    className={`absolute w-3 h-3 bg-primary border border-white rounded-sm ${
                      handle === "nw"
                        ? "top-0 left-0 -translate-x-1/2 -translate-y-1/2 cursor-nwse-resize"
                        : handle === "n"
                        ? "top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 cursor-ns-resize"
                        : handle === "ne"
                        ? "top-0 right-0 translate-x-1/2 -translate-y-1/2 cursor-nesw-resize"
                        : handle === "w"
                        ? "top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize"
                        : handle === "e"
                        ? "top-1/2 right-0 translate-x-1/2 -translate-y-1/2 cursor-ew-resize"
                        : handle === "sw"
                        ? "bottom-0 left-0 -translate-x-1/2 translate-y-1/2 cursor-nesw-resize"
                        : handle === "s"
                        ? "bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 cursor-ns-resize"
                        : "bottom-0 right-0 translate-x-1/2 translate-y-1/2 cursor-nwse-resize"
                    }`}
                    onMouseDown={(e) => handleMouseDown(e, handle)}
                    style={{ display: selectedRatio && (handle === "n" || handle === "s") ? "none" : "block" }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Crop Info */}
          <div className="text-xs text-muted-foreground space-y-1">
            <div>Position: {crop.x.toFixed(1)}%, {crop.y.toFixed(1)}%</div>
            <div>Size: {crop.width.toFixed(1)}% × {crop.height.toFixed(1)}%</div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                onApply(crop);
                onOpenChange(false);
              }}
            >
              Apply Crop
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function CropTool({ imageCount, crops, images, onChange }: CropToolProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  // Initialize crops for all images
  const ensuredCrops = Array.from({ length: imageCount }, (_, i) => 
    crops[i] || { x: 0, y: 0, width: 100, height: 100 }
  );

  const handleCropChange = (index: number, crop: CropData) => {
    const newCrops = [...ensuredCrops];
    newCrops[index] = crop;
    onChange(newCrops);
  };

  const resetCrop = (index: number) => {
    const newCrops = [...ensuredCrops];
    newCrops[index] = { x: 0, y: 0, width: 100, height: 100 };
    onChange(newCrops);
  };

  const isCropped = (crop: CropData) => {
    return crop.x !== 0 || crop.y !== 0 || crop.width !== 100 || crop.height !== 100;
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crop className="h-5 w-5" />
            Crop Images
          </CardTitle>
          <CardDescription>
            Crop individual images before merging
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {imageCount === 0 ? (
            <p className="text-sm text-muted-foreground">
              Upload images to enable cropping
            </p>
          ) : (
            <div className="space-y-3">
              <Label>Select an image to crop</Label>
              <div className="grid grid-cols-2 gap-2">
                {Array.from({ length: imageCount }).map((_, index) => (
                  <div key={index} className="space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedImageIndex(index)}
                      className="w-full"
                    >
                      <Maximize2 className="h-4 w-4 mr-2" />
                      Image {index + 1}
                      {isCropped(ensuredCrops[index]) && (
                        <span className="ml-2 text-xs text-primary">•</span>
                      )}
                    </Button>
                    {isCropped(ensuredCrops[index]) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => resetCrop(index)}
                        className="w-full"
                      >
                        <X className="h-3 w-3 mr-2" />
                        Reset
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedImageIndex !== null && (
        <CropDialog
          open={selectedImageIndex !== null}
          onOpenChange={(open) => !open && setSelectedImageIndex(null)}
          imageUrl={images[selectedImageIndex]?.preview || ""}
          initialCrop={ensuredCrops[selectedImageIndex]}
          onApply={(crop) => handleCropChange(selectedImageIndex, crop)}
          imageIndex={selectedImageIndex}
        />
      )}
    </>
  );
}
