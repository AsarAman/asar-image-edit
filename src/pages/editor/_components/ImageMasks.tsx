import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Circle, Heart, Star, Pentagon, Hexagon, Square, Eraser, Sparkles } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";

export type MaskShape = "none" | "circle" | "heart" | "star" | "pentagon" | "hexagon" | "square";
export type GradientDirection = "horizontal" | "vertical" | "radial" | "diagonal";

export interface ImageMask {
  imageIndex: number;
  shape: MaskShape;
  customPath?: string; // For custom drawn masks
  gradientEnabled: boolean;
  gradientDirection: GradientDirection;
  gradientStart: number; // 0-100
  gradientEnd: number; // 0-100
  feather: number; // Edge softness 0-50
  invert: boolean; // Invert mask
}

interface ImageMasksProps {
  imageCount: number;
  masks: ImageMask[];
  onChange: (masks: ImageMask[]) => void;
}

const shapeOptions = [
  { value: "none", label: "None", icon: Eraser },
  { value: "circle", label: "Circle", icon: Circle },
  { value: "heart", label: "Heart", icon: Heart },
  { value: "star", label: "Star", icon: Star },
  { value: "pentagon", label: "Pentagon", icon: Pentagon },
  { value: "hexagon", label: "Hexagon", icon: Hexagon },
  { value: "square", label: "Square", icon: Square },
];

export default function ImageMasks({ imageCount, masks, onChange }: ImageMasksProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Get or create mask for selected image
  const currentMask = masks[selectedImageIndex] || {
    imageIndex: selectedImageIndex,
    shape: "none",
    gradientEnabled: false,
    gradientDirection: "horizontal",
    gradientStart: 0,
    gradientEnd: 100,
    feather: 0,
    invert: false,
  };

  // Update mask for current image
  const updateMask = (updates: Partial<ImageMask>) => {
    const newMasks = [...masks];
    const existingIndex = newMasks.findIndex((m) => m.imageIndex === selectedImageIndex);
    
    const updatedMask = {
      ...currentMask,
      ...updates,
      imageIndex: selectedImageIndex,
    };

    if (existingIndex >= 0) {
      newMasks[existingIndex] = updatedMask;
    } else {
      newMasks.push(updatedMask);
    }

    onChange(newMasks);
  };

  const handleShapeChange = (shape: MaskShape) => {
    updateMask({ shape });
  };

  const handleGradientToggle = () => {
    updateMask({ gradientEnabled: !currentMask.gradientEnabled });
  };

  const handleInvertToggle = () => {
    updateMask({ invert: !currentMask.invert });
  };

  const handleReset = () => {
    const newMasks = masks.filter((m) => m.imageIndex !== selectedImageIndex);
    onChange(newMasks);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Image Masks
        </CardTitle>
        <CardDescription>
          Apply shape masks and gradient blending effects
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Image Selector */}
        <div className="space-y-2">
          <Label>Select Image</Label>
          <Select
            value={selectedImageIndex.toString()}
            onValueChange={(value) => setSelectedImageIndex(parseInt(value))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: imageCount }, (_, i) => (
                <SelectItem key={i} value={i.toString()}>
                  Image {i + 1}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Tabs defaultValue="shape" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="shape">Shape Masks</TabsTrigger>
            <TabsTrigger value="gradient">Gradient Masks</TabsTrigger>
          </TabsList>

          {/* Shape Masks Tab */}
          <TabsContent value="shape" className="space-y-4 mt-4">
            {/* Shape Selector */}
            <div className="space-y-3">
              <Label>Mask Shape</Label>
              <div className="grid grid-cols-4 gap-2">
                {shapeOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <Button
                      key={option.value}
                      variant={currentMask.shape === option.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleShapeChange(option.value as MaskShape)}
                      className="flex flex-col items-center gap-1 h-auto py-3"
                    >
                      <Icon className="h-5 w-5" />
                      <span className="text-xs">{option.label}</span>
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Invert Mask */}
            {currentMask.shape !== "none" && (
              <div className="flex items-center justify-between">
                <Label>Invert Mask</Label>
                <Button
                  variant={currentMask.invert ? "default" : "outline"}
                  size="sm"
                  onClick={handleInvertToggle}
                >
                  {currentMask.invert ? "On" : "Off"}
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Gradient Masks Tab */}
          <TabsContent value="gradient" className="space-y-4 mt-4">
            {/* Enable Gradient */}
            <div className="flex items-center justify-between">
              <Label>Enable Gradient Blend</Label>
              <Button
                variant={currentMask.gradientEnabled ? "default" : "outline"}
                size="sm"
                onClick={handleGradientToggle}
              >
                {currentMask.gradientEnabled ? "On" : "Off"}
              </Button>
            </div>

            {currentMask.gradientEnabled && (
              <>
                {/* Gradient Direction */}
                <div className="space-y-2">
                  <Label>Gradient Direction</Label>
                  <Select
                    value={currentMask.gradientDirection}
                    onValueChange={(value) =>
                      updateMask({ gradientDirection: value as GradientDirection })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="horizontal">Horizontal (Left to Right)</SelectItem>
                      <SelectItem value="vertical">Vertical (Top to Bottom)</SelectItem>
                      <SelectItem value="radial">Radial (Center to Edge)</SelectItem>
                      <SelectItem value="diagonal">Diagonal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Gradient Start */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Gradient Start</Label>
                    <span className="text-sm text-muted-foreground">
                      {currentMask.gradientStart}%
                    </span>
                  </div>
                  <Slider
                    value={[currentMask.gradientStart]}
                    onValueChange={([value]) => updateMask({ gradientStart: value })}
                    min={0}
                    max={100}
                    step={1}
                  />
                </div>

                {/* Gradient End */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Gradient End</Label>
                    <span className="text-sm text-muted-foreground">
                      {currentMask.gradientEnd}%
                    </span>
                  </div>
                  <Slider
                    value={[currentMask.gradientEnd]}
                    onValueChange={([value]) => updateMask({ gradientEnd: value })}
                    min={0}
                    max={100}
                    step={1}
                  />
                </div>

                {/* Visual Preview */}
                <div className="space-y-2">
                  <Label>Preview</Label>
                  <div
                    className="h-20 rounded-md border"
                    style={{
                      background:
                        currentMask.gradientDirection === "horizontal"
                          ? `linear-gradient(to right, rgba(0,0,0,${currentMask.gradientStart / 100}) 0%, rgba(0,0,0,${currentMask.gradientEnd / 100}) 100%)`
                          : currentMask.gradientDirection === "vertical"
                            ? `linear-gradient(to bottom, rgba(0,0,0,${currentMask.gradientStart / 100}) 0%, rgba(0,0,0,${currentMask.gradientEnd / 100}) 100%)`
                            : currentMask.gradientDirection === "radial"
                              ? `radial-gradient(circle, rgba(0,0,0,${currentMask.gradientStart / 100}) 0%, rgba(0,0,0,${currentMask.gradientEnd / 100}) 100%)`
                              : `linear-gradient(135deg, rgba(0,0,0,${currentMask.gradientStart / 100}) 0%, rgba(0,0,0,${currentMask.gradientEnd / 100}) 100%)`,
                    }}
                  />
                  <p className="text-xs text-muted-foreground">
                    This shows the gradient opacity that will be applied
                  </p>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>

        {/* Reset Button */}
        {(currentMask.shape !== "none" || currentMask.gradientEnabled) && (
          <Button variant="outline" size="sm" onClick={handleReset} className="w-full">
            <Eraser className="h-4 w-4 mr-2" />
            Reset Mask for Image {selectedImageIndex + 1}
          </Button>
        )}

        {/* Info */}
        <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
          <p>• Shape masks clip images to specific shapes</p>
          <p>• Gradient masks create smooth transitions and blending</p>
          <p>• Invert option masks everything except the shape</p>
          <p>• Combine shapes with gradients for unique effects</p>
        </div>
      </CardContent>
    </Card>
  );
}
