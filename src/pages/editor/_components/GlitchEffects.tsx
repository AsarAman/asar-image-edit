import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Zap, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { toast } from "sonner";
import UpgradeDialog from "./UpgradeDialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState } from "react";

export interface GlitchEffectsData {
  enabled: boolean;
  rgbSplit: {
    enabled: boolean;
    intensity: number;
  };
  scanlines: {
    enabled: boolean;
    intensity: number;
    count: number;
  };
  distortion: {
    enabled: boolean;
    intensity: number;
    frequency: number;
  };
  noise: {
    enabled: boolean;
    intensity: number;
  };
  colorShift: {
    enabled: boolean;
    hueShift: number;
    saturationShift: number;
  };
}

interface GlitchEffectsProps {
  effects: GlitchEffectsData;
  onChange: (effects: GlitchEffectsData) => void;
}

export default function GlitchEffects({ effects, onChange }: GlitchEffectsProps) {
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
  
  // Get user subscription status
  const subscriptionStatus = useQuery(api.subscriptions.getSubscriptionStatus);
  const isPremium = subscriptionStatus?.tier === "premium" || subscriptionStatus?.tier === "lifetime";

  const handleToggleGlobal = (enabled: boolean) => {
    // Check if user has premium access
    if (enabled && !isPremium) {
      setUpgradeDialogOpen(true);
      toast.error("Glitch effects are a Pro feature");
      return;
    }
    
    onChange({ ...effects, enabled });
  };

  const handleToggleEffect = (effectName: keyof Omit<GlitchEffectsData, "enabled">, enabled: boolean) => {
    onChange({
      ...effects,
      [effectName]: { ...effects[effectName], enabled },
    });
  };

  const handleEffectChange = <T extends keyof Omit<GlitchEffectsData, "enabled">>(
    effectName: T,
    property: keyof GlitchEffectsData[T],
    value: number
  ) => {
    onChange({
      ...effects,
      [effectName]: { ...effects[effectName], [property]: value },
    });
  };

  const handleReset = () => {
    onChange({
      enabled: false,
      rgbSplit: { enabled: false, intensity: 5 },
      scanlines: { enabled: false, intensity: 50, count: 100 },
      distortion: { enabled: false, intensity: 10, frequency: 5 },
      noise: { enabled: false, intensity: 20 },
      colorShift: { enabled: false, hueShift: 0, saturationShift: 0 },
    });
  };

  return (
    <>
      <Card className="border-2 border-black shadow-neo">
        <CardHeader className="pb-3 bg-neo-purple/10">
          <CardTitle className="flex items-center gap-2 text-lg font-black uppercase">
            <Zap className="h-5 w-5" />
            Glitch Effects
            {!isPremium && (
              <span className="ml-auto bg-neo-yellow text-black text-xs px-2 py-1 rounded font-black border-2 border-black flex items-center gap-1">
                <Crown className="h-3 w-3" />
                PRO
              </span>
            )}
          </CardTitle>
          <CardDescription>
            Advanced digital glitch and distortion effects
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4 space-y-6">
          {!isPremium && (
            <Alert className="border-2 border-neo-yellow bg-neo-yellow/10">
              <Crown className="h-4 w-4" />
              <AlertDescription className="text-sm">
                <strong>Pro Feature:</strong> Unlock glitch effects including RGB Split, Scanlines, and more.
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
          
          {/* Global Toggle */}
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border-2 border-black">
            <Label htmlFor="glitch-enabled" className="font-bold">
              Enable Glitch Effects
            </Label>
            <Switch
              id="glitch-enabled"
              checked={effects.enabled}
              onCheckedChange={handleToggleGlobal}
              disabled={!isPremium}
            />
          </div>

        {effects.enabled && (
          <>
            {/* RGB Split Effect */}
            <div className="space-y-3 p-4 bg-gradient-to-br from-red-50 via-green-50 to-blue-50 rounded-lg border-2 border-black">
              <div className="flex items-center justify-between">
                <Label htmlFor="rgb-split" className="font-bold">
                  RGB Split
                </Label>
                <Switch
                  id="rgb-split"
                  checked={effects.rgbSplit.enabled}
                  onCheckedChange={(enabled) => handleToggleEffect("rgbSplit", enabled)}
                />
              </div>
              {effects.rgbSplit.enabled && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <Label className="text-muted-foreground">Intensity</Label>
                    <span className="font-bold">{effects.rgbSplit.intensity}px</span>
                  </div>
                  <Slider
                    value={[effects.rgbSplit.intensity]}
                    onValueChange={([value]) => handleEffectChange("rgbSplit", "intensity", value)}
                    min={0}
                    max={20}
                    step={1}
                    className="border-2 border-black"
                  />
                  <p className="text-[10px] text-muted-foreground">
                    Separates RGB channels for chromatic aberration effect
                  </p>
                </div>
              )}
            </div>

            {/* Scanlines Effect */}
            <div className="space-y-3 p-4 bg-gradient-to-b from-gray-100 to-gray-200 rounded-lg border-2 border-black">
              <div className="flex items-center justify-between">
                <Label htmlFor="scanlines" className="font-bold">
                  Scanlines
                </Label>
                <Switch
                  id="scanlines"
                  checked={effects.scanlines.enabled}
                  onCheckedChange={(enabled) => handleToggleEffect("scanlines", enabled)}
                />
              </div>
              {effects.scanlines.enabled && (
                <div className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <Label className="text-muted-foreground">Opacity</Label>
                      <span className="font-bold">{effects.scanlines.intensity}%</span>
                    </div>
                    <Slider
                      value={[effects.scanlines.intensity]}
                      onValueChange={([value]) => handleEffectChange("scanlines", "intensity", value)}
                      min={0}
                      max={100}
                      step={5}
                      className="border-2 border-black"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <Label className="text-muted-foreground">Line Count</Label>
                      <span className="font-bold">{effects.scanlines.count}</span>
                    </div>
                    <Slider
                      value={[effects.scanlines.count]}
                      onValueChange={([value]) => handleEffectChange("scanlines", "count", value)}
                      min={20}
                      max={500}
                      step={10}
                      className="border-2 border-black"
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    Horizontal lines like old CRT monitors
                  </p>
                </div>
              )}
            </div>

            {/* Digital Distortion Effect */}
            <div className="space-y-3 p-4 bg-gradient-to-br from-cyan-50 to-purple-50 rounded-lg border-2 border-black">
              <div className="flex items-center justify-between">
                <Label htmlFor="distortion" className="font-bold">
                  Digital Distortion
                </Label>
                <Switch
                  id="distortion"
                  checked={effects.distortion.enabled}
                  onCheckedChange={(enabled) => handleToggleEffect("distortion", enabled)}
                />
              </div>
              {effects.distortion.enabled && (
                <div className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <Label className="text-muted-foreground">Intensity</Label>
                      <span className="font-bold">{effects.distortion.intensity}px</span>
                    </div>
                    <Slider
                      value={[effects.distortion.intensity]}
                      onValueChange={([value]) => handleEffectChange("distortion", "intensity", value)}
                      min={0}
                      max={50}
                      step={1}
                      className="border-2 border-black"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <Label className="text-muted-foreground">Frequency</Label>
                      <span className="font-bold">{effects.distortion.frequency}</span>
                    </div>
                    <Slider
                      value={[effects.distortion.frequency]}
                      onValueChange={([value]) => handleEffectChange("distortion", "frequency", value)}
                      min={1}
                      max={20}
                      step={1}
                      className="border-2 border-black"
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    Horizontal pixel displacement waves
                  </p>
                </div>
              )}
            </div>

            {/* Noise Effect */}
            <div className="space-y-3 p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border-2 border-black">
              <div className="flex items-center justify-between">
                <Label htmlFor="noise" className="font-bold">
                  Noise
                </Label>
                <Switch
                  id="noise"
                  checked={effects.noise.enabled}
                  onCheckedChange={(enabled) => handleToggleEffect("noise", enabled)}
                />
              </div>
              {effects.noise.enabled && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <Label className="text-muted-foreground">Intensity</Label>
                    <span className="font-bold">{effects.noise.intensity}%</span>
                  </div>
                  <Slider
                    value={[effects.noise.intensity]}
                    onValueChange={([value]) => handleEffectChange("noise", "intensity", value)}
                    min={0}
                    max={100}
                    step={5}
                    className="border-2 border-black"
                  />
                  <p className="text-[10px] text-muted-foreground">
                    Random grain and static noise overlay
                  </p>
                </div>
              )}
            </div>

            {/* Color Shift Effect */}
            <div className="space-y-3 p-4 bg-gradient-to-br from-pink-50 to-yellow-50 rounded-lg border-2 border-black">
              <div className="flex items-center justify-between">
                <Label htmlFor="color-shift" className="font-bold">
                  Color Shift
                </Label>
                <Switch
                  id="color-shift"
                  checked={effects.colorShift.enabled}
                  onCheckedChange={(enabled) => handleToggleEffect("colorShift", enabled)}
                />
              </div>
              {effects.colorShift.enabled && (
                <div className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <Label className="text-muted-foreground">Hue Shift</Label>
                      <span className="font-bold">{effects.colorShift.hueShift}°</span>
                    </div>
                    <Slider
                      value={[effects.colorShift.hueShift]}
                      onValueChange={([value]) => handleEffectChange("colorShift", "hueShift", value)}
                      min={-180}
                      max={180}
                      step={5}
                      className="border-2 border-black"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <Label className="text-muted-foreground">Saturation Shift</Label>
                      <span className="font-bold">{effects.colorShift.saturationShift}%</span>
                    </div>
                    <Slider
                      value={[effects.colorShift.saturationShift]}
                      onValueChange={([value]) => handleEffectChange("colorShift", "saturationShift", value)}
                      min={-100}
                      max={100}
                      step={5}
                      className="border-2 border-black"
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    Shift colors for surreal effects
                  </p>
                </div>
              )}
            </div>

            {/* Reset Button */}
            <Button
              variant="outline"
              onClick={handleReset}
              className="w-full border-2 border-black shadow-neo-sm hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all font-bold"
            >
              Reset All Glitch Effects
            </Button>
          </>
        )}
        </CardContent>
      </Card>
      
      <UpgradeDialog open={upgradeDialogOpen} onOpenChange={setUpgradeDialogOpen} />
    </>
  );
}
