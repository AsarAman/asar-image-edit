import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Sparkles, Plus, Trash2, RotateCw, Move, Crown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import UpgradeDialog from "./UpgradeDialog";

export interface LightLeakOverlay {
  id: string;
  type: string;
  url: string;
  opacity: number;
  blendMode: "screen" | "overlay" | "soft-light" | "lighten" | "normal";
  x: number; // Position as percentage
  y: number; // Position as percentage
  scale: number; // Scale as percentage
  rotation: number; // Rotation in degrees
}

interface LightLeaksProps {
  overlays: LightLeakOverlay[];
  onChange: (overlays: LightLeakOverlay[]) => void;
}

// Predefined light leak overlays
const LIGHT_LEAK_LIBRARY = [
  {
    type: "Sun Flare",
    url: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=800&q=80&auto=format&blend=FFFFFF&blend-mode=screen",
    description: "Golden sun flare",
  },
  {
    type: "Rainbow Leak",
    url: "https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=800&q=80&auto=format",
    description: "Colorful rainbow prism",
  },
  {
    type: "Warm Gradient",
    url: "https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=800&q=80&auto=format",
    description: "Warm orange glow",
  },
  {
    type: "Cool Gradient",
    url: "https://images.unsplash.com/photo-1557682224-5b8590cd9ec5?w=800&q=80&auto=format",
    description: "Cool blue tones",
  },
  {
    type: "Lens Flare",
    url: "https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=800&q=80&auto=format",
    description: "Circular lens flare",
  },
  {
    type: "Vintage Film",
    url: "https://images.unsplash.com/photo-1579546929662-711aa81148cf?w=800&q=80&auto=format",
    description: "Retro film burn",
  },
];

export default function LightLeaks({ overlays, onChange }: LightLeaksProps) {
  const [selectedOverlayId, setSelectedOverlayId] = useState<string | null>(
    overlays.length > 0 ? overlays[0].id : null
  );
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);

  // Check subscription status
  const subscription = useQuery(api.subscriptions.getSubscriptionStatus);
  const isPremium = subscription?.tier === "premium" || subscription?.tier === "lifetime";

  const selectedOverlay = overlays.find((o) => o.id === selectedOverlayId);

  const addOverlay = (type: string, url: string) => {
    // Check if user has PRO access
    if (!isPremium) {
      setUpgradeDialogOpen(true);
      return;
    }


    const newOverlay: LightLeakOverlay = {
      id: `overlay-${Date.now()}`,
      type,
      url,
      opacity: 50,
      blendMode: "screen",
      x: 50,
      y: 50,
      scale: 100,
      rotation: 0,
    };
    const updated = [...overlays, newOverlay];
    onChange(updated);
    setSelectedOverlayId(newOverlay.id);
  };

  const removeOverlay = (id: string) => {
    const updated = overlays.filter((o) => o.id !== id);
    onChange(updated);
    if (selectedOverlayId === id) {
      setSelectedOverlayId(updated.length > 0 ? updated[0].id : null);
    }
  };

  const updateOverlay = (id: string, updates: Partial<LightLeakOverlay>) => {
    const updated = overlays.map((o) => (o.id === id ? { ...o, ...updates } : o));
    onChange(updated);
  };

  return (
    <Card className="border-2 border-black shadow-neo">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="bg-neo-pink border-2 border-black p-2">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg font-black uppercase">Light Leaks & Overlays</CardTitle>
              <Badge className="bg-black text-white border-2 border-black">
                <Crown className="h-3 w-3 mr-1" />
                PRO
              </Badge>
            </div>
            <CardDescription className="font-bold">
              Add creative light effects and artistic overlays
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* PRO Feature Alert for Free Users */}
        {!isPremium && (
          <Alert className="border-2 border-black bg-neo-yellow/20">
            <Crown className="h-4 w-4" />
            <AlertDescription className="font-bold">
              Light Leaks & Overlays is a PRO feature. Upgrade to add cinematic light effects to your images!
            </AlertDescription>
          </Alert>
        )}

        {/* Overlay Library */}
        <div className="space-y-2">
          <Label className="text-sm font-black uppercase">Add Effect</Label>
          <div className="grid grid-cols-2 gap-2">
            {LIGHT_LEAK_LIBRARY.map((leak) => (
              <Button
                key={leak.type}
                variant="outline"
                size="sm"
                onClick={() => addOverlay(leak.type, leak.url)}
                className="h-auto flex-col items-start p-2 border-2 border-black shadow-neo-sm hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
              >
                <div className="w-full h-12 rounded border border-border mb-1 overflow-hidden">
                  <img
                    src={leak.url}
                    alt={leak.type}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-xs font-bold">{leak.type}</div>
                <div className="text-[10px] text-muted-foreground">{leak.description}</div>
              </Button>
            ))}
          </div>
        </div>

        {/* Active Overlays */}
        {overlays.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-black uppercase">Active Effects ({overlays.length})</Label>
            <div className="space-y-2">
              {overlays.map((overlay) => (
                <div
                  key={overlay.id}
                  className={`flex items-center gap-2 p-2 border-2 border-black rounded cursor-pointer transition-all ${
                    selectedOverlayId === overlay.id
                      ? "bg-neo-yellow shadow-neo-sm"
                      : "bg-white hover:bg-muted"
                  }`}
                  onClick={() => setSelectedOverlayId(overlay.id)}
                >
                  <div className="w-10 h-10 rounded border border-border overflow-hidden shrink-0">
                    <img
                      src={overlay.url}
                      alt={overlay.type}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold truncate">{overlay.type}</div>
                    <div className="text-[10px] text-muted-foreground">
                      {overlay.blendMode} • {overlay.opacity}%
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeOverlay(overlay.id);
                    }}
                    className="h-7 w-7 shrink-0 border-2 border-black hover:bg-red-100"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Edit Selected Overlay */}
        {selectedOverlay && (
          <div className="space-y-4 p-3 bg-neo-yellow/20 border-2 border-black rounded">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-black uppercase">Edit: {selectedOverlay.type}</Label>
              <Badge className="bg-black text-white border-2 border-black">
                Selected
              </Badge>
            </div>

            {/* Opacity */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold">Opacity</Label>
                <span className="text-xs font-bold text-muted-foreground">
                  {selectedOverlay.opacity}%
                </span>
              </div>
              <Slider
                value={[selectedOverlay.opacity]}
                onValueChange={([value]) =>
                  updateOverlay(selectedOverlay.id, { opacity: value })
                }
                min={0}
                max={100}
                step={1}
                className="w-full"
              />
            </div>

            {/* Blend Mode */}
            <div className="space-y-2">
              <Label className="text-xs font-bold">Blend Mode</Label>
              <Select
                value={selectedOverlay.blendMode}
                onValueChange={(value: LightLeakOverlay["blendMode"]) =>
                  updateOverlay(selectedOverlay.id, { blendMode: value })
                }
              >
                <SelectTrigger className="w-full border-2 border-black font-bold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="screen">Screen (Brighten)</SelectItem>
                  <SelectItem value="overlay">Overlay (Balanced)</SelectItem>
                  <SelectItem value="soft-light">Soft Light (Subtle)</SelectItem>
                  <SelectItem value="lighten">Lighten (Highlights)</SelectItem>
                  <SelectItem value="normal">Normal (Default)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Position */}
            <div className="space-y-2">
              <Label className="text-xs font-bold flex items-center gap-1">
                <Move className="h-3 w-3" />
                Position
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground">Horizontal</Label>
                  <Slider
                    value={[selectedOverlay.x]}
                    onValueChange={([value]) =>
                      updateOverlay(selectedOverlay.id, { x: value })
                    }
                    min={-50}
                    max={150}
                    step={1}
                    className="w-full"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground">Vertical</Label>
                  <Slider
                    value={[selectedOverlay.y]}
                    onValueChange={([value]) =>
                      updateOverlay(selectedOverlay.id, { y: value })
                    }
                    min={-50}
                    max={150}
                    step={1}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Scale */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold">Scale</Label>
                <span className="text-xs font-bold text-muted-foreground">
                  {selectedOverlay.scale}%
                </span>
              </div>
              <Slider
                value={[selectedOverlay.scale]}
                onValueChange={([value]) =>
                  updateOverlay(selectedOverlay.id, { scale: value })
                }
                min={10}
                max={300}
                step={5}
                className="w-full"
              />
            </div>

            {/* Rotation */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold flex items-center gap-1">
                  <RotateCw className="h-3 w-3" />
                  Rotation
                </Label>
                <span className="text-xs font-bold text-muted-foreground">
                  {selectedOverlay.rotation}°
                </span>
              </div>
              <Slider
                value={[selectedOverlay.rotation]}
                onValueChange={([value]) =>
                  updateOverlay(selectedOverlay.id, { rotation: value })
                }
                min={0}
                max={360}
                step={5}
                className="w-full"
              />
            </div>
          </div>
        )}

        {overlays.length === 0 && (
          <div className="flex items-center gap-2 p-3 bg-muted/50 border-2 border-dashed border-border rounded">
            <Plus className="h-4 w-4 text-muted-foreground" />
            <div className="text-xs text-muted-foreground font-bold">
              Click an effect above to add it to your image
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="flex items-center gap-2 p-3 bg-neo-cyan/20 border-2 border-black rounded">
          <div className="text-xs font-bold">
            💡 <span className="font-black">TIP:</span> Stack multiple overlays and adjust
            blend modes for unique cinematic effects. Screen works best for light leaks!
          </div>
        </div>

        {/* Upgrade Dialog */}
        <UpgradeDialog
          open={upgradeDialogOpen}
          onOpenChange={setUpgradeDialogOpen}
        />
      </CardContent>
    </Card>
  );
}

export type { LightLeaksProps };
