import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { Sparkles } from "lucide-react";
import UpgradeDialog from "./UpgradeDialog";

export interface ShadowSettings {
  enabled: boolean;
  type: "drop" | "inner" | "angle" | "curved";
  blur: number;
  offsetX: number;
  offsetY: number;
  color: string;
  opacity: number;
  spread: number;
  angle: number;
  distance: number;
  curve: number;
}

interface ShadowsProps {
  settings: ShadowSettings;
  onChange: (settings: ShadowSettings) => void;
}

export default function Shadows({ settings, onChange }: ShadowsProps) {
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

  const handleChange = (updates: Partial<ShadowSettings>) => {
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
            <CardTitle className="text-base flex items-center gap-2">
              Shadows
              <Badge variant="secondary" className="text-xs font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
                <Sparkles className="h-3 w-3 mr-1" />
                PRO
              </Badge>
            </CardTitle>
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
                Unlock advanced shadows with PRO
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
              {/* Shadow Type */}
              <div className="space-y-2">
                <Label className="text-sm">Shadow Type</Label>
                <Select
                  value={settings.type}
                  onValueChange={(value) =>
                    handleChange({ type: value as ShadowSettings["type"] })
                  }
                  disabled={!isPro}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="drop">Drop Shadow</SelectItem>
                    <SelectItem value="inner">Inner Shadow</SelectItem>
                    <SelectItem value="angle">Angle Shadow</SelectItem>
                    <SelectItem value="curved">Curved Shadow</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Blur */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Blur</Label>
                  <span className="text-xs text-muted-foreground">
                    {settings.blur}px
                  </span>
                </div>
                <Slider
                  value={[settings.blur]}
                  onValueChange={([value]) => handleChange({ blur: value })}
                  min={0}
                  max={100}
                  step={1}
                  disabled={!isPro}
                />
              </div>

              {/* Offset Controls - shown for drop, inner, and angle */}
              {(settings.type === "drop" ||
                settings.type === "inner" ||
                settings.type === "angle") && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs">Offset X</Label>
                      <span className="text-xs text-muted-foreground">
                        {settings.offsetX}px
                      </span>
                    </div>
                    <Slider
                      value={[settings.offsetX]}
                      onValueChange={([value]) => handleChange({ offsetX: value })}
                      min={-100}
                      max={100}
                      step={1}
                      disabled={!isPro}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs">Offset Y</Label>
                      <span className="text-xs text-muted-foreground">
                        {settings.offsetY}px
                      </span>
                    </div>
                    <Slider
                      value={[settings.offsetY]}
                      onValueChange={([value]) => handleChange({ offsetY: value })}
                      min={-100}
                      max={100}
                      step={1}
                      disabled={!isPro}
                    />
                  </div>
                </div>
              )}

              {/* Angle and Distance - for angle shadow */}
              {settings.type === "angle" && (
                <>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Angle</Label>
                      <span className="text-xs text-muted-foreground">
                        {settings.angle}°
                      </span>
                    </div>
                    <Slider
                      value={[settings.angle]}
                      onValueChange={([value]) => handleChange({ angle: value })}
                      min={0}
                      max={360}
                      step={1}
                      disabled={!isPro}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Distance</Label>
                      <span className="text-xs text-muted-foreground">
                        {settings.distance}px
                      </span>
                    </div>
                    <Slider
                      value={[settings.distance]}
                      onValueChange={([value]) => handleChange({ distance: value })}
                      min={0}
                      max={100}
                      step={1}
                      disabled={!isPro}
                    />
                  </div>
                </>
              )}

              {/* Curve - for curved shadow */}
              {settings.type === "curved" && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Curve Intensity</Label>
                    <span className="text-xs text-muted-foreground">
                      {settings.curve}%
                    </span>
                  </div>
                  <Slider
                    value={[settings.curve]}
                    onValueChange={([value]) => handleChange({ curve: value })}
                    min={0}
                    max={100}
                    step={1}
                    disabled={!isPro}
                  />
                </div>
              )}

              {/* Spread */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Spread</Label>
                  <span className="text-xs text-muted-foreground">
                    {settings.spread}px
                  </span>
                </div>
                <Slider
                  value={[settings.spread]}
                  onValueChange={([value]) => handleChange({ spread: value })}
                  min={0}
                  max={50}
                  step={1}
                  disabled={!isPro}
                />
              </div>

              {/* Color */}
              <div className="space-y-2">
                <Label className="text-sm">Shadow Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={settings.color}
                    onChange={(e) => handleChange({ color: e.target.value })}
                    className="w-16 h-9 p-1"
                    disabled={!isPro}
                  />
                  <Input
                    type="text"
                    value={settings.color}
                    onChange={(e) => handleChange({ color: e.target.value })}
                    placeholder="#000000"
                    className="flex-1 h-9 text-xs"
                    disabled={!isPro}
                  />
                </div>
              </div>

              {/* Opacity */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Opacity</Label>
                  <span className="text-xs text-muted-foreground">
                    {settings.opacity}%
                  </span>
                </div>
                <Slider
                  value={[settings.opacity]}
                  onValueChange={([value]) => handleChange({ opacity: value })}
                  min={0}
                  max={100}
                  step={1}
                  disabled={!isPro}
                />
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
