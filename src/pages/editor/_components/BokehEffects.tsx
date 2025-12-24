import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { Sparkles, Info } from "lucide-react";
import UpgradeDialog from "./UpgradeDialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface BokehSettings {
  enabled: boolean;
  intensity: number;
  focalPoint: {
    x: number;
    y: number;
  };
  focalSize: number;
  shape: "circle" | "hexagon" | "octagon";
  quality: "low" | "medium" | "high";
}

interface BokehEffectsProps {
  settings: BokehSettings;
  onChange: (settings: BokehSettings) => void;
}

export default function BokehEffects({ settings, onChange }: BokehEffectsProps) {
  const subscription = useQuery(api.subscriptions.getSubscriptionStatus);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);

  const isPro = subscription?.tier === "premium" || subscription?.tier === "lifetime";

  const handleToggle = (checked: boolean) => {
    if (!isPro && checked) {
      setShowUpgradeDialog(true);
      return;
    }
    onChange({ ...settings, enabled: checked });
  };

  const handleChange = (updates: Partial<BokehSettings>) => {
    if (!isPro) {
      setShowUpgradeDialog(true);
      return;
    }
    onChange({ ...settings, ...updates });
  };

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base flex items-center gap-2">
                Bokeh & Depth Effects
                <Badge variant="secondary" className="text-xs font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
                  <Sparkles className="h-3 w-3 mr-1" />
                  PRO
                </Badge>
              </CardTitle>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="text-xs">
                    Create professional depth-of-field blur effects. Adjust the focal point by clicking on the preview to keep your subject sharp while blurring the background.
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
            <Switch
              checked={settings.enabled}
              onCheckedChange={handleToggle}
              disabled={!isPro && !settings.enabled}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isPro && (
            <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-lg">
              <p className="text-sm text-purple-900 mb-2">
                Unlock professional bokeh effects with PRO
              </p>
              <Button
                size="sm"
                onClick={() => setShowUpgradeDialog(true)}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Upgrade to PRO
              </Button>
            </div>
          )}

          {settings.enabled && (
            <>
              {/* Blur Intensity */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Blur Intensity</Label>
                  <span className="text-xs text-muted-foreground">
                    {settings.intensity}%
                  </span>
                </div>
                <Slider
                  value={[settings.intensity]}
                  onValueChange={([value]) => handleChange({ intensity: value })}
                  min={0}
                  max={100}
                  step={1}
                  disabled={!isPro}
                />
              </div>

              {/* Focal Size */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Focus Area Size</Label>
                  <span className="text-xs text-muted-foreground">
                    {settings.focalSize}%
                  </span>
                </div>
                <Slider
                  value={[settings.focalSize]}
                  onValueChange={([value]) => handleChange({ focalSize: value })}
                  min={5}
                  max={80}
                  step={1}
                  disabled={!isPro}
                />
                <p className="text-xs text-muted-foreground">
                  Size of the sharp area in focus
                </p>
              </div>

              {/* Focal Point */}
              <div className="space-y-3">
                <Label className="text-sm">Focus Center Position</Label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs">Horizontal</Label>
                      <span className="text-xs text-muted-foreground">
                        {settings.focalPoint.x}%
                      </span>
                    </div>
                    <Slider
                      value={[settings.focalPoint.x]}
                      onValueChange={([value]) =>
                        handleChange({
                          focalPoint: { ...settings.focalPoint, x: value },
                        })
                      }
                      min={0}
                      max={100}
                      step={1}
                      disabled={!isPro}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs">Vertical</Label>
                      <span className="text-xs text-muted-foreground">
                        {settings.focalPoint.y}%
                      </span>
                    </div>
                    <Slider
                      value={[settings.focalPoint.y]}
                      onValueChange={([value]) =>
                        handleChange({
                          focalPoint: { ...settings.focalPoint, y: value },
                        })
                      }
                      min={0}
                      max={100}
                      step={1}
                      disabled={!isPro}
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Click on the canvas preview to set focus point
                </p>
              </div>

              {/* Bokeh Shape */}
              <div className="space-y-2">
                <Label className="text-sm">Bokeh Shape</Label>
                <Select
                  value={settings.shape}
                  onValueChange={(value) =>
                    handleChange({ shape: value as BokehSettings["shape"] })
                  }
                  disabled={!isPro}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="circle">Circle (Smooth)</SelectItem>
                    <SelectItem value="hexagon">Hexagon (Cinema)</SelectItem>
                    <SelectItem value="octagon">Octagon (Portrait)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Shape of out-of-focus highlights
                </p>
              </div>

              {/* Quality */}
              <div className="space-y-2">
                <Label className="text-sm">Rendering Quality</Label>
                <Select
                  value={settings.quality}
                  onValueChange={(value) =>
                    handleChange({ quality: value as BokehSettings["quality"] })
                  }
                  disabled={!isPro}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low (Faster)</SelectItem>
                    <SelectItem value="medium">Medium (Balanced)</SelectItem>
                    <SelectItem value="high">High (Best Quality)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Higher quality = slower rendering
                </p>
              </div>

              {/* Quick Presets */}
              <div className="space-y-2">
                <Label className="text-sm">Quick Presets</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      handleChange({
                        intensity: 60,
                        focalSize: 30,
                        shape: "circle",
                        quality: "medium",
                      })
                    }
                    disabled={!isPro}
                    className="text-xs"
                  >
                    Portrait
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      handleChange({
                        intensity: 80,
                        focalSize: 20,
                        shape: "hexagon",
                        quality: "high",
                      })
                    }
                    disabled={!isPro}
                    className="text-xs"
                  >
                    Cinematic
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      handleChange({
                        intensity: 40,
                        focalSize: 40,
                        shape: "circle",
                        quality: "low",
                      })
                    }
                    disabled={!isPro}
                    className="text-xs"
                  >
                    Soft Focus
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      handleChange({
                        intensity: 90,
                        focalSize: 15,
                        shape: "octagon",
                        quality: "high",
                      })
                    }
                    disabled={!isPro}
                    className="text-xs"
                  >
                    Macro
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {showUpgradeDialog && (
        <UpgradeDialog
          open={showUpgradeDialog}
          onOpenChange={setShowUpgradeDialog}
        />
      )}
    </>
  );
}
