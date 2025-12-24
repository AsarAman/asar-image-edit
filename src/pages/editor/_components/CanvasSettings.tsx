import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface CanvasSettingsData {
  width: number;
  height: number;
  backgroundColor: string;
}

interface CanvasSettingsProps {
  settings: CanvasSettingsData;
  onChange: (settings: CanvasSettingsData) => void;
}

const presets = [
  { name: "Square", width: 1200, height: 1200 },
  { name: "Landscape", width: 1600, height: 900 },
  { name: "Portrait", width: 900, height: 1600 },
  { name: "Default", width: 1200, height: 800 },
];

export default function CanvasSettings({
  settings,
  onChange,
}: CanvasSettingsProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Canvas Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          {presets.map((preset) => (
            <Button
              key={preset.name}
              variant="outline"
              size="sm"
              onClick={() =>
                onChange({
                  ...settings,
                  width: preset.width,
                  height: preset.height,
                })
              }
            >
              {preset.name}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label className="text-sm">Width (px)</Label>
            <Input
              type="number"
              value={settings.width}
              onChange={(e) =>
                onChange({ ...settings, width: Number(e.target.value) })
              }
              min={400}
              max={4000}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm">Height (px)</Label>
            <Input
              type="number"
              value={settings.height}
              onChange={(e) =>
                onChange({ ...settings, height: Number(e.target.value) })
              }
              min={400}
              max={4000}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm">Background Color</Label>
          <div className="flex gap-2">
            <Input
              type="color"
              value={settings.backgroundColor}
              onChange={(e) =>
                onChange({ ...settings, backgroundColor: e.target.value })
              }
              className="w-16 h-10 p-1"
            />
            <Input
              type="text"
              value={settings.backgroundColor}
              onChange={(e) =>
                onChange({ ...settings, backgroundColor: e.target.value })
              }
              placeholder="#ffffff"
              className="flex-1"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export type { CanvasSettingsData };
