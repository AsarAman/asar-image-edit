import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ImageTransparency {
  imageIndex: number;
  opacity: number;
}

interface TransparencyControlsProps {
  imageCount: number;
  transparencies: ImageTransparency[];
  onChange: (transparencies: ImageTransparency[]) => void;
}

export default function TransparencyControls({
  imageCount,
  transparencies,
  onChange,
}: TransparencyControlsProps) {
  const handleOpacityChange = (index: number, opacity: number) => {
    const updated = [...transparencies];
    const existing = updated.find((t) => t.imageIndex === index);

    if (existing) {
      existing.opacity = opacity;
    } else {
      updated.push({ imageIndex: index, opacity });
    }

    onChange(updated);
  };

  const getOpacity = (index: number): number => {
    const transparency = transparencies.find((t) => t.imageIndex === index);
    return transparency ? transparency.opacity : 1;
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Transparency</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {Array.from({ length: imageCount }).map((_, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Image {index + 1}</Label>
              <span className="text-xs text-muted-foreground">
                {Math.round(getOpacity(index) * 100)}%
              </span>
            </div>
            <Slider
              value={[getOpacity(index)]}
              onValueChange={([value]) => handleOpacityChange(index, value)}
              min={0}
              max={1}
              step={0.01}
              className="w-full"
            />
          </div>
        ))}
        <p className="text-xs text-muted-foreground">
          Adjust opacity for each image independently
        </p>
      </CardContent>
    </Card>
  );
}

export type { ImageTransparency };
