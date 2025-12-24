import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Wand2, Sparkles, Crown } from "lucide-react";
import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { toast } from "sonner";
import UpgradeDialog from "./UpgradeDialog";
import { Alert, AlertDescription } from "@/components/ui/alert";

export interface FilterSettings {
  brightness: number; // 0-200, default 100
  contrast: number; // 0-200, default 100
  saturation: number; // 0-200, default 100
  blur: number; // 0-20, default 0
  hueRotate: number; // 0-360, default 0
  grayscale: number; // 0-100, default 0
  sepia: number; // 0-100, default 0
  invert: number; // 0-100, default 0
}

interface ColorGradingPreset {
  name: string;
  description: string;
  settings: FilterSettings;
  category: "vintage" | "cinematic" | "warm" | "cool" | "creative" | "natural" | "dramatic";
}

const COLOR_GRADING_PRESETS: ColorGradingPreset[] = [
  // Vintage & Retro
  {
    name: "Vintage Film",
    description: "Classic film camera look",
    category: "vintage",
    settings: { brightness: 105, contrast: 110, saturation: 85, blur: 0, hueRotate: 15, grayscale: 0, sepia: 35, invert: 0 }
  },
  {
    name: "Faded Retro",
    description: "Soft faded colors",
    category: "vintage",
    settings: { brightness: 110, contrast: 85, saturation: 70, blur: 0, hueRotate: 0, grayscale: 0, sepia: 25, invert: 0 }
  },
  {
    name: "Old Photo",
    description: "Aged photograph effect",
    category: "vintage",
    settings: { brightness: 95, contrast: 120, saturation: 60, blur: 0.5, hueRotate: 20, grayscale: 0, sepia: 60, invert: 0 }
  },
  {
    name: "Polaroid",
    description: "Instant camera aesthetic",
    category: "vintage",
    settings: { brightness: 110, contrast: 95, saturation: 110, blur: 0, hueRotate: 5, grayscale: 0, sepia: 15, invert: 0 }
  },

  // Cinematic
  {
    name: "Cinematic Blue",
    description: "Hollywood blockbuster look",
    category: "cinematic",
    settings: { brightness: 95, contrast: 125, saturation: 110, blur: 0, hueRotate: 200, grayscale: 0, sepia: 0, invert: 0 }
  },
  {
    name: "Film Noir",
    description: "Classic black and white drama",
    category: "cinematic",
    settings: { brightness: 90, contrast: 140, saturation: 0, blur: 0, hueRotate: 0, grayscale: 100, sepia: 0, invert: 0 }
  },
  {
    name: "Teal & Orange",
    description: "Modern Hollywood color grade",
    category: "cinematic",
    settings: { brightness: 100, contrast: 115, saturation: 120, blur: 0, hueRotate: 180, grayscale: 0, sepia: 0, invert: 0 }
  },
  {
    name: "Bleach Bypass",
    description: "High contrast desaturated look",
    category: "cinematic",
    settings: { brightness: 105, contrast: 135, saturation: 65, blur: 0, hueRotate: 0, grayscale: 0, sepia: 0, invert: 0 }
  },
  {
    name: "Anamorphic",
    description: "Wide-screen cinematic feel",
    category: "cinematic",
    settings: { brightness: 98, contrast: 120, saturation: 115, blur: 0, hueRotate: 185, grayscale: 0, sepia: 0, invert: 0 }
  },

  // Warm Tones
  {
    name: "Warm Sunset",
    description: "Golden hour glow",
    category: "warm",
    settings: { brightness: 110, contrast: 105, saturation: 120, blur: 0, hueRotate: 25, grayscale: 0, sepia: 20, invert: 0 }
  },
  {
    name: "Golden Hour",
    description: "Soft warm sunlight",
    category: "warm",
    settings: { brightness: 115, contrast: 100, saturation: 110, blur: 0, hueRotate: 30, grayscale: 0, sepia: 15, invert: 0 }
  },
  {
    name: "Autumn Warm",
    description: "Rich fall colors",
    category: "warm",
    settings: { brightness: 105, contrast: 110, saturation: 125, blur: 0, hueRotate: 15, grayscale: 0, sepia: 25, invert: 0 }
  },
  {
    name: "Desert Heat",
    description: "Hot dry atmosphere",
    category: "warm",
    settings: { brightness: 115, contrast: 115, saturation: 95, blur: 0, hueRotate: 35, grayscale: 0, sepia: 30, invert: 0 }
  },
  {
    name: "Candlelight",
    description: "Intimate warm lighting",
    category: "warm",
    settings: { brightness: 90, contrast: 95, saturation: 105, blur: 0, hueRotate: 25, grayscale: 0, sepia: 40, invert: 0 }
  },

  // Cool Tones
  {
    name: "Cool Blue",
    description: "Icy cold atmosphere",
    category: "cool",
    settings: { brightness: 100, contrast: 110, saturation: 105, blur: 0, hueRotate: 200, grayscale: 0, sepia: 0, invert: 0 }
  },
  {
    name: "Arctic Frost",
    description: "Frozen winter tones",
    category: "cool",
    settings: { brightness: 115, contrast: 105, saturation: 90, blur: 0, hueRotate: 180, grayscale: 0, sepia: 0, invert: 0 }
  },
  {
    name: "Ocean Deep",
    description: "Underwater blue-green",
    category: "cool",
    settings: { brightness: 95, contrast: 115, saturation: 110, blur: 0, hueRotate: 170, grayscale: 0, sepia: 0, invert: 0 }
  },
  {
    name: "Moonlight",
    description: "Cool night illumination",
    category: "cool",
    settings: { brightness: 85, contrast: 105, saturation: 80, blur: 0, hueRotate: 210, grayscale: 0, sepia: 0, invert: 0 }
  },
  {
    name: "Nordic",
    description: "Scandinavian cool tones",
    category: "cool",
    settings: { brightness: 105, contrast: 100, saturation: 95, blur: 0, hueRotate: 190, grayscale: 0, sepia: 0, invert: 0 }
  },

  // Natural
  {
    name: "Natural Enhance",
    description: "Subtle enhancement",
    category: "natural",
    settings: { brightness: 105, contrast: 110, saturation: 110, blur: 0, hueRotate: 0, grayscale: 0, sepia: 0, invert: 0 }
  },
  {
    name: "Vivid Nature",
    description: "Enhanced natural colors",
    category: "natural",
    settings: { brightness: 105, contrast: 115, saturation: 130, blur: 0, hueRotate: 0, grayscale: 0, sepia: 0, invert: 0 }
  },
  {
    name: "Soft Natural",
    description: "Gentle color enhancement",
    category: "natural",
    settings: { brightness: 110, contrast: 95, saturation: 105, blur: 0, hueRotate: 0, grayscale: 0, sepia: 5, invert: 0 }
  },
  {
    name: "True Color",
    description: "Accurate color representation",
    category: "natural",
    settings: { brightness: 100, contrast: 105, saturation: 105, blur: 0, hueRotate: 0, grayscale: 0, sepia: 0, invert: 0 }
  },

  // Creative
  {
    name: "Cyberpunk",
    description: "Neon futuristic look",
    category: "creative",
    settings: { brightness: 110, contrast: 130, saturation: 150, blur: 0, hueRotate: 280, grayscale: 0, sepia: 0, invert: 0 }
  },
  {
    name: "Purple Dream",
    description: "Dreamy purple haze",
    category: "creative",
    settings: { brightness: 105, contrast: 105, saturation: 125, blur: 1, hueRotate: 270, grayscale: 0, sepia: 0, invert: 0 }
  },
  {
    name: "Infrared",
    description: "False color infrared",
    category: "creative",
    settings: { brightness: 120, contrast: 120, saturation: 140, blur: 0, hueRotate: 330, grayscale: 0, sepia: 0, invert: 0 }
  },
  {
    name: "Neon Glow",
    description: "Electric vibrant colors",
    category: "creative",
    settings: { brightness: 115, contrast: 135, saturation: 160, blur: 0, hueRotate: 300, grayscale: 0, sepia: 0, invert: 0 }
  },
  {
    name: "Pop Art",
    description: "Bold saturated colors",
    category: "creative",
    settings: { brightness: 110, contrast: 140, saturation: 180, blur: 0, hueRotate: 0, grayscale: 0, sepia: 0, invert: 0 }
  },

  // Dramatic
  {
    name: "High Contrast B&W",
    description: "Dramatic monochrome",
    category: "dramatic",
    settings: { brightness: 100, contrast: 150, saturation: 0, blur: 0, hueRotate: 0, grayscale: 100, sepia: 0, invert: 0 }
  },
  {
    name: "Dark Moody",
    description: "Deep shadows and mood",
    category: "dramatic",
    settings: { brightness: 75, contrast: 135, saturation: 90, blur: 0, hueRotate: 0, grayscale: 0, sepia: 0, invert: 0 }
  },
  {
    name: "HDR Effect",
    description: "High dynamic range look",
    category: "dramatic",
    settings: { brightness: 110, contrast: 145, saturation: 140, blur: 0, hueRotate: 0, grayscale: 0, sepia: 0, invert: 0 }
  },
  {
    name: "Dramatic Sky",
    description: "Enhanced clouds and sky",
    category: "dramatic",
    settings: { brightness: 95, contrast: 140, saturation: 115, blur: 0, hueRotate: 200, grayscale: 0, sepia: 0, invert: 0 }
  },
  {
    name: "Storm",
    description: "Dark ominous atmosphere",
    category: "dramatic",
    settings: { brightness: 70, contrast: 130, saturation: 85, blur: 0, hueRotate: 210, grayscale: 0, sepia: 0, invert: 0 }
  }
];

interface FiltersProps {
  settings: FilterSettings;
  onChange: (settings: FilterSettings) => void;
}

export default function Filters({ settings, onChange }: FiltersProps) {
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [showAllPresets, setShowAllPresets] = useState(false);
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
  
  // Get user subscription status
  const subscriptionStatus = useQuery(api.subscriptions.getSubscriptionStatus);
  const isPremium = subscriptionStatus?.tier === "premium" || subscriptionStatus?.tier === "lifetime";

  const handleChange = (key: keyof FilterSettings, value: number) => {
    onChange({ ...settings, [key]: value });
    setSelectedPreset(null); // Clear preset selection when manual adjustment is made
  };

  const applyPreset = (preset: ColorGradingPreset) => {
    // Check if user has premium access
    if (!isPremium) {
      setUpgradeDialogOpen(true);
      toast.error("Color grading presets are a Pro feature");
      return;
    }
    
    onChange(preset.settings);
    setSelectedPreset(preset.name);
  };

  const resetFilters = () => {
    onChange({
      brightness: 100,
      contrast: 100,
      saturation: 100,
      blur: 0,
      hueRotate: 0,
      grayscale: 0,
      sepia: 0,
      invert: 0
    });
    setSelectedPreset(null);
  };

  const displayedPresets = showAllPresets ? COLOR_GRADING_PRESETS : COLOR_GRADING_PRESETS.slice(0, 8);

  const getCategoryColor = (category: ColorGradingPreset["category"]) => {
    const colors = {
      vintage: "bg-amber-100 dark:bg-amber-950 border-amber-300 dark:border-amber-800 hover:bg-amber-200 dark:hover:bg-amber-900",
      cinematic: "bg-blue-100 dark:bg-blue-950 border-blue-300 dark:border-blue-800 hover:bg-blue-200 dark:hover:bg-blue-900",
      warm: "bg-orange-100 dark:bg-orange-950 border-orange-300 dark:border-orange-800 hover:bg-orange-200 dark:hover:bg-orange-900",
      cool: "bg-cyan-100 dark:bg-cyan-950 border-cyan-300 dark:border-cyan-800 hover:bg-cyan-200 dark:hover:bg-cyan-900",
      creative: "bg-purple-100 dark:bg-purple-950 border-purple-300 dark:border-purple-800 hover:bg-purple-200 dark:hover:bg-purple-900",
      natural: "bg-green-100 dark:bg-green-950 border-green-300 dark:border-green-800 hover:bg-green-200 dark:hover:bg-green-900",
      dramatic: "bg-red-100 dark:bg-red-950 border-red-300 dark:border-red-800 hover:bg-red-200 dark:hover:bg-red-900"
    };
    return colors[category];
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-4 w-4" />
            Filters & Enhancements
          </CardTitle>
          <CardDescription>Apply color grading presets or adjust filters manually</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Color Grading Presets */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Color Grading Presets
                {!isPremium && (
                  <span className="ml-2 bg-neo-yellow text-black text-xs px-2 py-0.5 rounded font-black border-2 border-black flex items-center gap-1">
                    <Crown className="h-3 w-3" />
                    PRO
                  </span>
                )}
              </Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="text-xs h-7"
              >
                Reset All
              </Button>
            </div>
            
            {!isPremium && (
              <Alert className="border-2 border-neo-yellow bg-neo-yellow/10">
                <Crown className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  <strong>Pro Feature:</strong> Unlock 33 professional color grading presets.
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
          
          <div className="grid grid-cols-2 gap-2">
            {displayedPresets.map((preset) => (
              <Button
                key={preset.name}
                variant="outline"
                size="sm"
                onClick={() => applyPreset(preset)}
                className={`h-auto flex flex-col items-start p-3 transition-all ${
                  getCategoryColor(preset.category)
                } ${
                  selectedPreset === preset.name
                    ? "ring-2 ring-primary ring-offset-2"
                    : ""
                }`}
              >
                <span className="font-bold text-xs">{preset.name}</span>
                <span className="text-[10px] text-muted-foreground text-left line-clamp-1">
                  {preset.description}
                </span>
              </Button>
            ))}
          </div>

          {isPremium && !showAllPresets && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAllPresets(true)}
              className="w-full"
            >
              Show All {COLOR_GRADING_PRESETS.length} Presets
            </Button>
          )}

          {isPremium && showAllPresets && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAllPresets(false)}
              className="w-full"
            >
              Show Less
            </Button>
          )}
        </div>

          <div className="border-t pt-6">
            <Label className="text-sm font-semibold mb-4 block">Manual Adjustments</Label>
        {/* Brightness */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Brightness</Label>
            <span className="text-sm text-muted-foreground">{settings.brightness}%</span>
          </div>
          <Slider
            value={[settings.brightness]}
            onValueChange={([value]) => handleChange("brightness", value)}
            min={0}
            max={200}
            step={1}
          />
        </div>

        {/* Contrast */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Contrast</Label>
            <span className="text-sm text-muted-foreground">{settings.contrast}%</span>
          </div>
          <Slider
            value={[settings.contrast]}
            onValueChange={([value]) => handleChange("contrast", value)}
            min={0}
            max={200}
            step={1}
          />
        </div>

        {/* Saturation */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Saturation</Label>
            <span className="text-sm text-muted-foreground">{settings.saturation}%</span>
          </div>
          <Slider
            value={[settings.saturation]}
            onValueChange={([value]) => handleChange("saturation", value)}
            min={0}
            max={200}
            step={1}
          />
        </div>

        {/* Blur */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Blur</Label>
            <span className="text-sm text-muted-foreground">{settings.blur}px</span>
          </div>
          <Slider
            value={[settings.blur]}
            onValueChange={([value]) => handleChange("blur", value)}
            min={0}
            max={20}
            step={0.5}
          />
        </div>

        {/* Hue Rotate */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Hue Rotation</Label>
            <span className="text-sm text-muted-foreground">{settings.hueRotate}°</span>
          </div>
          <Slider
            value={[settings.hueRotate]}
            onValueChange={([value]) => handleChange("hueRotate", value)}
            min={0}
            max={360}
            step={1}
          />
        </div>

        {/* Grayscale */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Grayscale</Label>
            <span className="text-sm text-muted-foreground">{settings.grayscale}%</span>
          </div>
          <Slider
            value={[settings.grayscale]}
            onValueChange={([value]) => handleChange("grayscale", value)}
            min={0}
            max={100}
            step={1}
          />
        </div>

        {/* Sepia */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Sepia</Label>
            <span className="text-sm text-muted-foreground">{settings.sepia}%</span>
          </div>
          <Slider
            value={[settings.sepia]}
            onValueChange={([value]) => handleChange("sepia", value)}
            min={0}
            max={100}
            step={1}
          />
        </div>

        {/* Invert */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Invert</Label>
            <span className="text-sm text-muted-foreground">{settings.invert}%</span>
          </div>
          <Slider
            value={[settings.invert]}
            onValueChange={([value]) => handleChange("invert", value)}
            min={0}
            max={100}
            step={1}
          />
        </div>
          </div>
        </CardContent>
      </Card>
      
      <UpgradeDialog open={upgradeDialogOpen} onOpenChange={setUpgradeDialogOpen} />
    </>
  );
}
