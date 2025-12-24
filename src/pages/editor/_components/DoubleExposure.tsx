import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Blend, Crown, Sparkles, RotateCcw } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { Alert, AlertDescription } from "@/components/ui/alert";
import UpgradeDialog from "./UpgradeDialog";
import type { UploadedImage } from "./ImageUpload";
import { trackFeatureUsage } from "@/lib/analytics";

export interface DoubleExposureSettings {
  enabled: boolean;
  baseImageIndex: number;
  overlayImageIndex: number;
  blendMode: "screen" | "multiply" | "overlay" | "lighten" | "darken" | "soft-light" | "hard-light" | "difference" | "exclusion";
  opacity: number;
  overlayScale: number;
  overlayX: number;
  overlayY: number;
  overlayRotation: number;
  invert: boolean;
}

interface DoubleExposureProps {
  images: UploadedImage[];
  settings: DoubleExposureSettings;
  onChange: (settings: DoubleExposureSettings) => void;
}

const BLEND_MODES = [
  { value: "screen", label: "Screen (Light blend)", description: "Best for portraits" },
  { value: "multiply", label: "Multiply (Dark blend)", description: "Best for silhouettes" },
  { value: "overlay", label: "Overlay (Balanced)", description: "Best for textures" },
  { value: "lighten", label: "Lighten", description: "Keeps lighter colors" },
  { value: "darken", label: "Darken", description: "Keeps darker colors" },
  { value: "soft-light", label: "Soft Light", description: "Subtle blend" },
  { value: "hard-light", label: "Hard Light", description: "Strong contrast" },
  { value: "difference", label: "Difference", description: "Inverts colors" },
  { value: "exclusion", label: "Exclusion", description: "Softer difference" },
];

export default function DoubleExposure({ images, settings, onChange }: DoubleExposureProps) {
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Get user subscription status
  const subscriptionStatus = useQuery(api.subscriptions.getSubscriptionStatus);
  const isPremium = subscriptionStatus?.tier === "premium" || subscriptionStatus?.tier === "lifetime";

  const handleChange = (updates: Partial<DoubleExposureSettings>) => {
    onChange({ ...settings, ...updates });
  };

  const handleToggle = () => {
    if (!isPremium) {
      setUpgradeDialogOpen(true);
      toast.error("Double Exposure is a Pro feature");
      return;
    }

    const newEnabled = !settings.enabled;
    handleChange({ enabled: newEnabled });
    
    if (newEnabled) {
      trackFeatureUsage("double_exposure");
      toast.success("Double Exposure enabled");
    }
  };

  const resetToDefaults = () => {
    handleChange({
      opacity: 70,
      overlayScale: 100,
      overlayX: 0,
      overlayY: 0,
      overlayRotation: 0,
      invert: false,
    });
    toast.success("Reset to default settings");
  };

  const applyPreset = (preset: "portrait" | "silhouette" | "texture") => {
    if (!isPremium) {
      setUpgradeDialogOpen(true);
      return;
    }

    switch (preset) {
      case "portrait":
        handleChange({
          enabled: true,
          blendMode: "screen",
          opacity: 60,
          overlayScale: 120,
          invert: false,
        });
        break;
      case "silhouette":
        handleChange({
          enabled: true,
          blendMode: "multiply",
          opacity: 80,
          overlayScale: 100,
          invert: true,
        });
        break;
      case "texture":
        handleChange({
          enabled: true,
          blendMode: "overlay",
          opacity: 50,
          overlayScale: 150,
          invert: false,
        });
        break;
    }

    trackFeatureUsage("double_exposure_preset");
    toast.success(`Applied ${preset} preset`);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Blend className="h-5 w-5" />
            Double Exposure
            {!isPremium && (
              <span className="ml-auto bg-neo-yellow text-black text-xs px-2 py-1 rounded font-black border-2 border-black flex items-center gap-1">
                <Crown className="h-3 w-3" />
                PRO
              </span>
            )}
          </CardTitle>
          <CardDescription>
            Blend two images together for artistic effects
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isPremium && (
            <Alert className="border-2 border-neo-yellow bg-neo-yellow/10">
              <Crown className="h-4 w-4" />
              <AlertDescription className="text-sm">
                <strong>Pro Feature:</strong> Create stunning double exposure effects by blending two images.
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => setUpgradeDialogOpen(true)}
                  className="h-auto p-0 ml-1 underline"
                >
                  Upgrade now
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {images.length < 2 ? (
            <p className="text-sm text-muted-foreground">
              Upload 2 or more images to create double exposure effects
            </p>
          ) : (
            <>
              {/* Enable Toggle */}
              <div className="flex items-center justify-between">
                <Label>Enable Double Exposure</Label>
                <Button
                  variant={settings.enabled ? "default" : "outline"}
                  size="sm"
                  onClick={handleToggle}
                  disabled={!isPremium}
                >
                  {settings.enabled ? "On" : "Off"}
                </Button>
              </div>

              {settings.enabled && (
                <>
                  {/* Quick Presets */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      Quick Presets
                    </Label>
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => applyPreset("portrait")}
                        className="text-xs"
                      >
                        Portrait
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => applyPreset("silhouette")}
                        className="text-xs"
                      >
                        Silhouette
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => applyPreset("texture")}
                        className="text-xs"
                      >
                        Texture
                      </Button>
                    </div>
                  </div>

                  {/* Image Selection */}
                  <div className="space-y-2">
                    <Label>Base Image</Label>
                    <Select
                      value={settings.baseImageIndex.toString()}
                      onValueChange={(value) => handleChange({ baseImageIndex: parseInt(value) })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {images.map((_, index) => (
                          <SelectItem key={index} value={index.toString()}>
                            Image {index + 1}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Overlay Image</Label>
                    <Select
                      value={settings.overlayImageIndex.toString()}
                      onValueChange={(value) => handleChange({ overlayImageIndex: parseInt(value) })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {images.map((_, index) => (
                          <SelectItem key={index} value={index.toString()}>
                            Image {index + 1}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Blend Mode */}
                  <div className="space-y-2">
                    <Label>Blend Mode</Label>
                    <Select
                      value={settings.blendMode}
                      onValueChange={(value) => handleChange({ blendMode: value as DoubleExposureSettings["blendMode"] })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {BLEND_MODES.map((mode) => (
                          <SelectItem key={mode.value} value={mode.value}>
                            {mode.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      {BLEND_MODES.find(m => m.value === settings.blendMode)?.description}
                    </p>
                  </div>

                  {/* Opacity */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Overlay Opacity</Label>
                      <span className="text-sm text-muted-foreground">{settings.opacity}%</span>
                    </div>
                    <Slider
                      value={[settings.opacity]}
                      onValueChange={([value]) => handleChange({ opacity: value })}
                      min={0}
                      max={100}
                      step={1}
                    />
                  </div>

                  {/* Invert Colors */}
                  <div className="flex items-center justify-between">
                    <Label>Invert Overlay Colors</Label>
                    <Button
                      variant={settings.invert ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleChange({ invert: !settings.invert })}
                    >
                      {settings.invert ? "On" : "Off"}
                    </Button>
                  </div>

                  {/* Advanced Controls Toggle */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="w-full"
                  >
                    {showAdvanced ? "Hide" : "Show"} Advanced Controls
                  </Button>

                  {showAdvanced && (
                    <div className="space-y-4 pt-2 border-t">
                      {/* Overlay Scale */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>Overlay Scale</Label>
                          <span className="text-sm text-muted-foreground">{settings.overlayScale}%</span>
                        </div>
                        <Slider
                          value={[settings.overlayScale]}
                          onValueChange={([value]) => handleChange({ overlayScale: value })}
                          min={50}
                          max={200}
                          step={5}
                        />
                      </div>

                      {/* Overlay Position X */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>Horizontal Position</Label>
                          <span className="text-sm text-muted-foreground">{settings.overlayX}px</span>
                        </div>
                        <Slider
                          value={[settings.overlayX]}
                          onValueChange={([value]) => handleChange({ overlayX: value })}
                          min={-500}
                          max={500}
                          step={10}
                        />
                      </div>

                      {/* Overlay Position Y */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>Vertical Position</Label>
                          <span className="text-sm text-muted-foreground">{settings.overlayY}px</span>
                        </div>
                        <Slider
                          value={[settings.overlayY]}
                          onValueChange={([value]) => handleChange({ overlayY: value })}
                          min={-500}
                          max={500}
                          step={10}
                        />
                      </div>

                      {/* Overlay Rotation */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>Rotation</Label>
                          <span className="text-sm text-muted-foreground">{settings.overlayRotation}°</span>
                        </div>
                        <Slider
                          value={[settings.overlayRotation]}
                          onValueChange={([value]) => handleChange({ overlayRotation: value })}
                          min={-180}
                          max={180}
                          step={5}
                        />
                      </div>

                      {/* Reset Button */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={resetToDefaults}
                        className="w-full"
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Reset Advanced Settings
                      </Button>
                    </div>
                  )}

                  {/* Tips */}
                  <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
                    <p className="font-medium">Tips:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Use Screen mode for light, dreamy portraits</li>
                      <li>Use Multiply mode for dark silhouettes</li>
                      <li>Try inverting the overlay for unique effects</li>
                      <li>Combine with filters for even more creative looks</li>
                    </ul>
                  </div>
                </>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <UpgradeDialog open={upgradeDialogOpen} onOpenChange={setUpgradeDialogOpen} />
    </>
  );
}
