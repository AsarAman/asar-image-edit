import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type BlendMode =
  | "normal"
  | "multiply"
  | "screen"
  | "overlay"
  | "darken"
  | "lighten"
  | "soft-light"
  | "hard-light";

interface BlendModeSelectorProps {
  blendMode: BlendMode;
  onChange: (mode: BlendMode) => void;
}

const blendModes: { value: BlendMode; label: string; description: string }[] = [
  {
    value: "normal",
    label: "Normal",
    description: "Standard blending",
  },
  {
    value: "multiply",
    label: "Multiply",
    description: "Darkens by multiplying colors",
  },
  {
    value: "screen",
    label: "Screen",
    description: "Lightens by inverting and multiplying",
  },
  {
    value: "overlay",
    label: "Overlay",
    description: "Combination of multiply and screen",
  },
  {
    value: "darken",
    label: "Darken",
    description: "Keeps darkest pixels",
  },
  {
    value: "lighten",
    label: "Lighten",
    description: "Keeps lightest pixels",
  },
  {
    value: "soft-light",
    label: "Soft Light",
    description: "Subtle lighting effect",
  },
  {
    value: "hard-light",
    label: "Hard Light",
    description: "Strong lighting effect",
  },
];

export default function BlendModeSelector({
  blendMode,
  onChange,
}: BlendModeSelectorProps) {
  const selectedMode = blendModes.find((m) => m.value === blendMode);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Blend Mode</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label className="text-sm">Mode</Label>
          <Select value={blendMode} onValueChange={(value) => onChange(value as BlendMode)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {blendModes.map((mode) => (
                <SelectItem key={mode.value} value={mode.value}>
                  {mode.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedMode && (
            <p className="text-xs text-muted-foreground">
              {selectedMode.description}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
