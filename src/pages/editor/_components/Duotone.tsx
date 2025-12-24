import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, Sparkles } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { trackCheckoutStarted } from "@/lib/analytics";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

export interface DuotoneSettings {
  enabled: boolean;
  shadowColor: string;
  highlightColor: string;
  intensity: number;
  contrast: number;
}

interface DuotoneProps {
  settings: DuotoneSettings;
  onChange: (settings: DuotoneSettings) => void;
}

// Popular duotone color combinations
const DUOTONE_PRESETS = [
  { name: "Classic Blue/Orange", shadow: "#001F3F", highlight: "#FF851B" },
  { name: "Purple/Yellow", shadow: "#5E35B1", highlight: "#FFD600" },
  { name: "Teal/Pink", shadow: "#00897B", highlight: "#F06292" },
  { name: "Navy/Cyan", shadow: "#1A237E", highlight: "#00E5FF" },
  { name: "Forest/Lime", shadow: "#1B5E20", highlight: "#C6FF00" },
  { name: "Crimson/Gold", shadow: "#B71C1C", highlight: "#FFD700" },
  { name: "Indigo/Coral", shadow: "#283593", highlight: "#FF6E40" },
  { name: "Vintage Brown/Cream", shadow: "#4E342E", highlight: "#FFF3E0" },
];

export default function Duotone({ settings, onChange }: DuotoneProps) {
  const subscription = useQuery(api.subscriptions.getSubscriptionStatus);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);

  // Check if user has access to PRO features
  const hasProAccess = subscription?.tier === "premium" || subscription?.tier === "lifetime";

  const handleToggle = (enabled: boolean) => {
    if (enabled && !hasProAccess) {
      setShowUpgradeDialog(true);
      return;
    }
    onChange({ ...settings, enabled });
  };

  const handlePresetClick = (shadow: string, highlight: string) => {
    if (!hasProAccess) {
      setShowUpgradeDialog(true);
      return;
    }
    onChange({
      ...settings,
      shadowColor: shadow,
      highlightColor: highlight,
      enabled: true,
    });
  };

  const handleUpgradeClick = () => {
    trackCheckoutStarted("duotone_feature");
    window.location.href = "https://fixmyimage.lemonsqueezy.com/buy/04e15b2b-82f2-48e6-91c3-2fc9fda87a71";
  };

  return (
    <>
      <Card className="border-2 border-black shadow-neo hover:shadow-neo-hover transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base sm:text-lg font-black flex items-center gap-2">
              <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
              Duotone
              <Badge variant="secondary" className="border-2 border-black shadow-neo-sm">
                <Crown className="h-3 w-3 mr-1" />
                PRO
              </Badge>
            </CardTitle>
          </div>
          <CardDescription className="text-xs sm:text-sm">
            Create stylistic two-tone color effects
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="duotone-enabled" className="text-sm font-bold">
              Enable Duotone
            </Label>
            <Switch
              id="duotone-enabled"
              checked={settings.enabled}
              onCheckedChange={handleToggle}
            />
          </div>

          {settings.enabled && hasProAccess && (
            <>
              {/* Quick Presets */}
              <div className="space-y-2">
                <Label className="text-sm font-bold">Quick Presets</Label>
                <div className="grid grid-cols-2 gap-2">
                  {DUOTONE_PRESETS.map((preset, index) => (
                    <Tooltip key={index}>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-12 border-2 border-black shadow-neo-sm hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
                          onClick={() => handlePresetClick(preset.shadow, preset.highlight)}
                        >
                          <div className="flex items-center gap-2 w-full">
                            <div className="flex gap-1">
                              <div 
                                className="w-4 h-4 rounded border border-black" 
                                style={{ backgroundColor: preset.shadow }}
                              />
                              <div 
                                className="w-4 h-4 rounded border border-black" 
                                style={{ backgroundColor: preset.highlight }}
                              />
                            </div>
                          </div>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>{preset.name}</TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </div>

              {/* Shadow Color */}
              <div className="space-y-2">
                <Label htmlFor="shadow-color" className="text-sm font-bold">
                  Shadow Color (Darks)
                </Label>
                <div className="flex gap-2 items-center">
                  <input
                    id="shadow-color"
                    type="color"
                    value={settings.shadowColor}
                    onChange={(e) => onChange({ ...settings, shadowColor: e.target.value })}
                    className="h-10 w-20 border-2 border-black rounded-md shadow-neo-sm cursor-pointer"
                  />
                  <input
                    type="text"
                    value={settings.shadowColor}
                    onChange={(e) => onChange({ ...settings, shadowColor: e.target.value })}
                    className="flex-1 h-10 px-3 border-2 border-black rounded-md shadow-neo-sm font-mono text-sm"
                  />
                </div>
              </div>

              {/* Highlight Color */}
              <div className="space-y-2">
                <Label htmlFor="highlight-color" className="text-sm font-bold">
                  Highlight Color (Lights)
                </Label>
                <div className="flex gap-2 items-center">
                  <input
                    id="highlight-color"
                    type="color"
                    value={settings.highlightColor}
                    onChange={(e) => onChange({ ...settings, highlightColor: e.target.value })}
                    className="h-10 w-20 border-2 border-black rounded-md shadow-neo-sm cursor-pointer"
                  />
                  <input
                    type="text"
                    value={settings.highlightColor}
                    onChange={(e) => onChange({ ...settings, highlightColor: e.target.value })}
                    className="flex-1 h-10 px-3 border-2 border-black rounded-md shadow-neo-sm font-mono text-sm"
                  />
                </div>
              </div>

              {/* Intensity */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-sm font-bold">Intensity</Label>
                  <span className="text-sm font-mono">{settings.intensity}%</span>
                </div>
                <Slider
                  value={[settings.intensity]}
                  onValueChange={([value]) => onChange({ ...settings, intensity: value })}
                  min={0}
                  max={100}
                  step={1}
                  className="cursor-pointer"
                />
              </div>

              {/* Contrast */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-sm font-bold">Contrast</Label>
                  <span className="text-sm font-mono">{settings.contrast}%</span>
                </div>
                <Slider
                  value={[settings.contrast]}
                  onValueChange={([value]) => onChange({ ...settings, contrast: value })}
                  min={50}
                  max={150}
                  step={1}
                  className="cursor-pointer"
                />
              </div>
            </>
          )}

          {settings.enabled && !hasProAccess && (
            <div className="p-4 border-2 border-black rounded-lg bg-muted/50 space-y-3">
              <p className="text-sm font-bold">Unlock Duotone Effects</p>
              <p className="text-xs text-muted-foreground">
                Upgrade to PRO to create stunning two-tone color effects with custom colors and presets.
              </p>
              <Button
                size="sm"
                className="w-full border-2 border-black shadow-neo hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all font-bold"
                onClick={handleUpgradeClick}
              >
                <Crown className="h-4 w-4 mr-2" />
                Upgrade to PRO
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upgrade Dialog */}
      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <DialogContent className="border-2 border-black shadow-neo max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-black">
              <Crown className="h-5 w-5" />
              Unlock Duotone Effects
            </DialogTitle>
            <DialogDescription className="text-base">
              Upgrade to PRO to access powerful duotone color effects with:
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <Sparkles className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>8 carefully crafted duotone presets</span>
              </li>
              <li className="flex items-start gap-2">
                <Sparkles className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>Custom shadow and highlight color selection</span>
              </li>
              <li className="flex items-start gap-2">
                <Sparkles className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>Adjustable intensity and contrast controls</span>
              </li>
              <li className="flex items-start gap-2">
                <Sparkles className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>Perfect for artistic and vintage looks</span>
              </li>
            </ul>
            <Button
              className="w-full border-2 border-black shadow-neo hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all font-bold"
              onClick={handleUpgradeClick}
            >
              <Crown className="h-4 w-4 mr-2" />
              Upgrade to PRO
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
