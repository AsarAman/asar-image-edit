import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RotateCw, FlipHorizontal, FlipVertical } from "lucide-react";

interface ImageTransformData {
  imageIndex: number;
  rotation: number;
  flipHorizontal: boolean;
  flipVertical: boolean;
}

interface ImageTransformProps {
  imageCount: number;
  transforms: ImageTransformData[];
  onChange: (transforms: ImageTransformData[]) => void;
}

export default function ImageTransform({
  imageCount,
  transforms,
  onChange,
}: ImageTransformProps) {
  const getTransform = (index: number): ImageTransformData => {
    const existing = transforms.find((t) => t.imageIndex === index);
    return (
      existing || {
        imageIndex: index,
        rotation: 0,
        flipHorizontal: false,
        flipVertical: false,
      }
    );
  };

  const updateTransform = (
    index: number,
    updates: Partial<ImageTransformData>
  ) => {
    const updated = [...transforms];
    const existingIndex = updated.findIndex((t) => t.imageIndex === index);

    if (existingIndex >= 0) {
      updated[existingIndex] = { ...updated[existingIndex], ...updates };
    } else {
      updated.push({ ...getTransform(index), imageIndex: index, ...updates });
    }

    onChange(updated);
  };

  const rotate = (index: number) => {
    const current = getTransform(index);
    updateTransform(index, { rotation: (current.rotation + 90) % 360 });
  };

  const toggleFlipH = (index: number) => {
    const current = getTransform(index);
    updateTransform(index, { flipHorizontal: !current.flipHorizontal });
  };

  const toggleFlipV = (index: number) => {
    const current = getTransform(index);
    updateTransform(index, { flipVertical: !current.flipVertical });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Transform Images</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {Array.from({ length: imageCount }).map((_, index) => {
          const transform = getTransform(index);
          return (
            <div key={index} className="space-y-2">
              <Label className="text-sm">Image {index + 1}</Label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => rotate(index)}
                  className="flex-1"
                >
                  <RotateCw className="h-4 w-4 mr-2" />
                  Rotate {transform.rotation}°
                </Button>
                <Button
                  variant={transform.flipHorizontal ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleFlipH(index)}
                >
                  <FlipHorizontal className="h-4 w-4" />
                </Button>
                <Button
                  variant={transform.flipVertical ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleFlipV(index)}
                >
                  <FlipVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

export type { ImageTransformData };
