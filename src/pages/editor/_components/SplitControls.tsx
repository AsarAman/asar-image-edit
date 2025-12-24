import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SplitSettings {
  splitPosition: number;
}

interface SplitControlsProps {
  settings: SplitSettings;
  onChange: (settings: SplitSettings) => void;
}

export default function SplitControls({
  settings,
  onChange,
}: SplitControlsProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Split View Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm">Split Position</Label>
            <span className="text-xs text-muted-foreground">
              {Math.round(settings.splitPosition * 100)}%
            </span>
          </div>
          <Slider
            value={[settings.splitPosition]}
            onValueChange={([value]) =>
              onChange({ ...settings, splitPosition: value })
            }
            min={0}
            max={1}
            step={0.01}
            className="w-full"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Drag the slider on the canvas to adjust the split position
        </p>
      </CardContent>
    </Card>
  );
}

export type { SplitSettings };
