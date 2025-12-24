import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface OverlaySettings {
  opacity: number;
  x: number;
  y: number;
  scale: number;
  rotation: number;
}

interface OverlayControlsProps {
  settings: OverlaySettings;
  onChange: (settings: OverlaySettings) => void;
}

export default function OverlayControls({
  settings,
  onChange,
}: OverlayControlsProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Overlay Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm">Opacity</Label>
            <span className="text-xs text-muted-foreground">
              {Math.round(settings.opacity * 100)}%
            </span>
          </div>
          <Slider
            value={[settings.opacity]}
            onValueChange={([value]) =>
              onChange({ ...settings, opacity: value })
            }
            min={0}
            max={1}
            step={0.01}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm">Horizontal Position</Label>
            <span className="text-xs text-muted-foreground">
              {Math.round(settings.x)}px
            </span>
          </div>
          <Slider
            value={[settings.x]}
            onValueChange={([value]) => onChange({ ...settings, x: value })}
            min={-200}
            max={200}
            step={1}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm">Vertical Position</Label>
            <span className="text-xs text-muted-foreground">
              {Math.round(settings.y)}px
            </span>
          </div>
          <Slider
            value={[settings.y]}
            onValueChange={([value]) => onChange({ ...settings, y: value })}
            min={-200}
            max={200}
            step={1}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm">Scale</Label>
            <span className="text-xs text-muted-foreground">
              {Math.round(settings.scale * 100)}%
            </span>
          </div>
          <Slider
            value={[settings.scale]}
            onValueChange={([value]) =>
              onChange({ ...settings, scale: value })
            }
            min={0.2}
            max={2}
            step={0.01}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm">Rotation</Label>
            <span className="text-xs text-muted-foreground">
              {Math.round(settings.rotation)}°
            </span>
          </div>
          <Slider
            value={[settings.rotation]}
            onValueChange={([value]) =>
              onChange({ ...settings, rotation: value })
            }
            min={0}
            max={360}
            step={1}
            className="w-full"
          />
        </div>
      </CardContent>
    </Card>
  );
}

export type { OverlaySettings };
