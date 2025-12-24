import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface VisualEffectsData {
  borderWidth: number;
  borderColor: string;
  cornerRadius: number;
  shadowBlur: number;
  shadowOffsetX: number;
  shadowOffsetY: number;
  shadowColor: string;
  margin: number;
}

interface VisualEffectsProps {
  settings: VisualEffectsData;
  onChange: (settings: VisualEffectsData) => void;
}

export default function VisualEffects({
  settings,
  onChange,
}: VisualEffectsProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Visual Effects</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Border */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm">Border Width</Label>
            <span className="text-xs text-muted-foreground">
              {settings.borderWidth}px
            </span>
          </div>
          <Slider
            value={[settings.borderWidth]}
            onValueChange={([value]) =>
              onChange({ ...settings, borderWidth: value })
            }
            min={0}
            max={50}
            step={1}
          />

          {settings.borderWidth > 0 && (
            <div className="flex gap-2">
              <Input
                type="color"
                value={settings.borderColor}
                onChange={(e) =>
                  onChange({ ...settings, borderColor: e.target.value })
                }
                className="w-16 h-8 p-1"
              />
              <Input
                type="text"
                value={settings.borderColor}
                onChange={(e) =>
                  onChange({ ...settings, borderColor: e.target.value })
                }
                placeholder="#000000"
                className="flex-1 h-8 text-xs"
              />
            </div>
          )}
        </div>

        {/* Corner Radius */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm">Corner Radius</Label>
            <span className="text-xs text-muted-foreground">
              {settings.cornerRadius}px
            </span>
          </div>
          <Slider
            value={[settings.cornerRadius]}
            onValueChange={([value]) =>
              onChange({ ...settings, cornerRadius: value })
            }
            min={0}
            max={100}
            step={1}
          />
        </div>

        {/* Shadow */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm">Shadow Blur</Label>
            <span className="text-xs text-muted-foreground">
              {settings.shadowBlur}px
            </span>
          </div>
          <Slider
            value={[settings.shadowBlur]}
            onValueChange={([value]) =>
              onChange({ ...settings, shadowBlur: value })
            }
            min={0}
            max={50}
            step={1}
          />

          {settings.shadowBlur > 0 && (
            <>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label className="text-xs">Offset X</Label>
                  <Slider
                    value={[settings.shadowOffsetX]}
                    onValueChange={([value]) =>
                      onChange({ ...settings, shadowOffsetX: value })
                    }
                    min={-50}
                    max={50}
                    step={1}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Offset Y</Label>
                  <Slider
                    value={[settings.shadowOffsetY]}
                    onValueChange={([value]) =>
                      onChange({ ...settings, shadowOffsetY: value })
                    }
                    min={-50}
                    max={50}
                    step={1}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Input
                  type="color"
                  value={settings.shadowColor}
                  onChange={(e) =>
                    onChange({ ...settings, shadowColor: e.target.value })
                  }
                  className="w-16 h-8 p-1"
                />
                <Input
                  type="text"
                  value={settings.shadowColor}
                  onChange={(e) =>
                    onChange({ ...settings, shadowColor: e.target.value })
                  }
                  placeholder="#000000"
                  className="flex-1 h-8 text-xs"
                />
              </div>
            </>
          )}
        </div>

        {/* Margin */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm">Margin/Padding</Label>
            <span className="text-xs text-muted-foreground">
              {settings.margin}px
            </span>
          </div>
          <Slider
            value={[settings.margin]}
            onValueChange={([value]) =>
              onChange({ ...settings, margin: value })
            }
            min={0}
            max={100}
            step={1}
          />
        </div>
      </CardContent>
    </Card>
  );
}

export type { VisualEffectsData };
