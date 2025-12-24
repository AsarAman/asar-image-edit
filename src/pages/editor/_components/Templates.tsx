import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Instagram, 
  Facebook, 
  Twitter, 
  Linkedin, 
  Youtube,
  Image as ImageIcon,
  FileImage,
  Sparkles,
  Palette
} from "lucide-react";
import type { LayoutType } from "./LayoutSelector";
import type { BlendMode } from "./BlendModeSelector";
import type { CanvasSettingsData } from "./CanvasSettings";
import type { VisualEffectsData } from "./VisualEffects";
import type { FilterSettings } from "./Filters";

export interface TemplateSettings {
  name: string;
  description: string;
  icon: React.ReactNode;
  canvasSettings: CanvasSettingsData;
  layout?: LayoutType;
  visualEffects?: Partial<VisualEffectsData>;
  filters?: Partial<FilterSettings>;
  blendMode?: BlendMode;
}

interface TemplatesProps {
  onApplyTemplate: (template: TemplateSettings) => void;
}

// Social Media Templates
const SOCIAL_MEDIA_TEMPLATES: TemplateSettings[] = [
  {
    name: "Instagram Post",
    description: "1080x1080 - Perfect square for Instagram feed",
    icon: <Instagram className="h-5 w-5" />,
    canvasSettings: { width: 1080, height: 1080, backgroundColor: "#ffffff" },
    layout: "grid",
  },
  {
    name: "Instagram Story",
    description: "1080x1920 - Full screen vertical story",
    icon: <Instagram className="h-5 w-5" />,
    canvasSettings: { width: 1080, height: 1920, backgroundColor: "#ffffff" },
    layout: "vertical",
  },
  {
    name: "Facebook Post",
    description: "1200x630 - Optimized for Facebook feed",
    icon: <Facebook className="h-5 w-5" />,
    canvasSettings: { width: 1200, height: 630, backgroundColor: "#ffffff" },
    layout: "horizontal",
  },
  {
    name: "Facebook Cover",
    description: "820x312 - Facebook cover photo",
    icon: <Facebook className="h-5 w-5" />,
    canvasSettings: { width: 820, height: 312, backgroundColor: "#ffffff" },
    layout: "horizontal",
  },
  {
    name: "Twitter Post",
    description: "1200x675 - Twitter card image",
    icon: <Twitter className="h-5 w-5" />,
    canvasSettings: { width: 1200, height: 675, backgroundColor: "#ffffff" },
    layout: "horizontal",
  },
  {
    name: "LinkedIn Post",
    description: "1200x627 - LinkedIn share image",
    icon: <Linkedin className="h-5 w-5" />,
    canvasSettings: { width: 1200, height: 627, backgroundColor: "#ffffff" },
    layout: "horizontal",
  },
  {
    name: "YouTube Thumbnail",
    description: "1280x720 - YouTube video thumbnail",
    icon: <Youtube className="h-5 w-5" />,
    canvasSettings: { width: 1280, height: 720, backgroundColor: "#ffffff" },
    layout: "horizontal",
  },
  {
    name: "Pinterest Pin",
    description: "1000x1500 - Tall Pinterest pin",
    icon: <ImageIcon className="h-5 w-5" />,
    canvasSettings: { width: 1000, height: 1500, backgroundColor: "#ffffff" },
    layout: "vertical",
  },
];

// Print Templates
const PRINT_TEMPLATES: TemplateSettings[] = [
  {
    name: "A4 Portrait",
    description: "2480x3508 - Standard print size",
    icon: <FileImage className="h-5 w-5" />,
    canvasSettings: { width: 2480, height: 3508, backgroundColor: "#ffffff" },
    layout: "vertical",
  },
  {
    name: "A4 Landscape",
    description: "3508x2480 - Standard print size",
    icon: <FileImage className="h-5 w-5" />,
    canvasSettings: { width: 3508, height: 2480, backgroundColor: "#ffffff" },
    layout: "horizontal",
  },
  {
    name: "Letter Portrait",
    description: "2550x3300 - US letter size",
    icon: <FileImage className="h-5 w-5" />,
    canvasSettings: { width: 2550, height: 3300, backgroundColor: "#ffffff" },
    layout: "vertical",
  },
  {
    name: "Letter Landscape",
    description: "3300x2550 - US letter size",
    icon: <FileImage className="h-5 w-5" />,
    canvasSettings: { width: 3300, height: 2550, backgroundColor: "#ffffff" },
    layout: "horizontal",
  },
  {
    name: "Business Card",
    description: "1050x600 - Standard business card",
    icon: <FileImage className="h-5 w-5" />,
    canvasSettings: { width: 1050, height: 600, backgroundColor: "#ffffff" },
    layout: "horizontal",
  },
  {
    name: "Postcard",
    description: "1800x1200 - Standard postcard",
    icon: <FileImage className="h-5 w-5" />,
    canvasSettings: { width: 1800, height: 1200, backgroundColor: "#ffffff" },
    layout: "horizontal",
  },
];

// Style Presets
const STYLE_PRESETS: TemplateSettings[] = [
  {
    name: "Classic Border",
    description: "Black border with shadow",
    icon: <Sparkles className="h-5 w-5" />,
    canvasSettings: { width: 1200, height: 800, backgroundColor: "#ffffff" },
    visualEffects: {
      borderWidth: 10,
      borderColor: "#000000",
      cornerRadius: 0,
      shadowBlur: 20,
      shadowOffsetX: 5,
      shadowOffsetY: 5,
      shadowColor: "#00000066",
      margin: 40,
    },
  },
  {
    name: "Rounded Frame",
    description: "Rounded corners with soft shadow",
    icon: <Sparkles className="h-5 w-5" />,
    canvasSettings: { width: 1200, height: 800, backgroundColor: "#f5f5f5" },
    visualEffects: {
      borderWidth: 0,
      borderColor: "#000000",
      cornerRadius: 30,
      shadowBlur: 30,
      shadowOffsetX: 0,
      shadowOffsetY: 10,
      shadowColor: "#00000033",
      margin: 50,
    },
  },
  {
    name: "Polaroid",
    description: "Classic photo print style",
    icon: <Sparkles className="h-5 w-5" />,
    canvasSettings: { width: 1000, height: 1200, backgroundColor: "#ffffff" },
    visualEffects: {
      borderWidth: 0,
      borderColor: "#000000",
      cornerRadius: 0,
      shadowBlur: 25,
      shadowOffsetX: 0,
      shadowOffsetY: 15,
      shadowColor: "#00000044",
      margin: 80,
    },
  },
  {
    name: "Film Strip",
    description: "Dark background with heavy borders",
    icon: <Sparkles className="h-5 w-5" />,
    canvasSettings: { width: 1200, height: 800, backgroundColor: "#1a1a1a" },
    visualEffects: {
      borderWidth: 3,
      borderColor: "#ffffff",
      cornerRadius: 0,
      shadowBlur: 0,
      shadowOffsetX: 0,
      shadowOffsetY: 0,
      shadowColor: "#000000",
      margin: 60,
    },
  },
  {
    name: "Minimalist",
    description: "Clean and simple",
    icon: <Sparkles className="h-5 w-5" />,
    canvasSettings: { width: 1200, height: 800, backgroundColor: "#ffffff" },
    visualEffects: {
      borderWidth: 0,
      borderColor: "#000000",
      cornerRadius: 0,
      shadowBlur: 0,
      shadowOffsetX: 0,
      shadowOffsetY: 0,
      shadowColor: "#000000",
      margin: 20,
    },
  },
  {
    name: "Golden Frame",
    description: "Luxury gold border",
    icon: <Sparkles className="h-5 w-5" />,
    canvasSettings: { width: 1200, height: 800, backgroundColor: "#2a2a2a" },
    visualEffects: {
      borderWidth: 20,
      borderColor: "#d4af37",
      cornerRadius: 0,
      shadowBlur: 40,
      shadowOffsetX: 0,
      shadowOffsetY: 0,
      shadowColor: "#d4af3766",
      margin: 60,
    },
  },
];

// Color & Filter Presets
const FILTER_PRESETS: TemplateSettings[] = [
  {
    name: "Warm Vintage",
    description: "Sepia with warm tones",
    icon: <Palette className="h-5 w-5" />,
    canvasSettings: { width: 1200, height: 800, backgroundColor: "#f5f5dc" },
    filters: {
      brightness: 110,
      contrast: 110,
      saturation: 80,
      sepia: 40,
      hueRotate: 10,
      blur: 0,
      grayscale: 0,
      invert: 0,
    },
  },
  {
    name: "Cool Blue",
    description: "Cool, crisp blue tones",
    icon: <Palette className="h-5 w-5" />,
    canvasSettings: { width: 1200, height: 800, backgroundColor: "#e6f2ff" },
    filters: {
      brightness: 105,
      contrast: 115,
      saturation: 120,
      hueRotate: -15,
      blur: 0,
      grayscale: 0,
      sepia: 0,
      invert: 0,
    },
  },
  {
    name: "Black & White",
    description: "Classic monochrome",
    icon: <Palette className="h-5 w-5" />,
    canvasSettings: { width: 1200, height: 800, backgroundColor: "#ffffff" },
    filters: {
      brightness: 100,
      contrast: 120,
      saturation: 0,
      grayscale: 100,
      blur: 0,
      hueRotate: 0,
      sepia: 0,
      invert: 0,
    },
  },
  {
    name: "High Contrast",
    description: "Bold and vibrant",
    icon: <Palette className="h-5 w-5" />,
    canvasSettings: { width: 1200, height: 800, backgroundColor: "#ffffff" },
    filters: {
      brightness: 110,
      contrast: 140,
      saturation: 130,
      blur: 0,
      grayscale: 0,
      hueRotate: 0,
      sepia: 0,
      invert: 0,
    },
  },
  {
    name: "Soft Dream",
    description: "Soft and dreamy with slight blur",
    icon: <Palette className="h-5 w-5" />,
    canvasSettings: { width: 1200, height: 800, backgroundColor: "#faf9f6" },
    filters: {
      brightness: 115,
      contrast: 90,
      saturation: 80,
      blur: 1,
      grayscale: 0,
      hueRotate: 0,
      sepia: 0,
      invert: 0,
    },
  },
  {
    name: "Dramatic",
    description: "Dark and moody",
    icon: <Palette className="h-5 w-5" />,
    canvasSettings: { width: 1200, height: 800, backgroundColor: "#1a1a1a" },
    filters: {
      brightness: 80,
      contrast: 150,
      saturation: 70,
      blur: 0,
      grayscale: 0,
      hueRotate: 0,
      sepia: 0,
      invert: 0,
    },
  },
];

export default function Templates({ onApplyTemplate }: TemplatesProps) {
  const handleApply = (template: TemplateSettings) => {
    onApplyTemplate(template);
  };

  const renderTemplateGrid = (templates: TemplateSettings[]) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {templates.map((template, index) => (
        <button
          key={index}
          onClick={() => handleApply(template)}
          className="group relative p-4 rounded-lg border border-border bg-card hover:bg-accent hover:border-primary transition-all text-left"
        >
          <div className="flex items-start gap-3">
            <div className="shrink-0 p-2 rounded-md bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              {template.icon}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-semibold text-sm mb-1 truncate">{template.name}</h4>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {template.description}
              </p>
            </div>
          </div>
        </button>
      ))}
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Templates & Presets</CardTitle>
        <CardDescription>
          Quickly apply pre-configured settings for common use cases
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="social" className="w-full">
          <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full mb-4">
            <TabsTrigger value="social" className="text-xs sm:text-sm">
              Social Media
            </TabsTrigger>
            <TabsTrigger value="print" className="text-xs sm:text-sm">
              Print
            </TabsTrigger>
            <TabsTrigger value="styles" className="text-xs sm:text-sm">
              Styles
            </TabsTrigger>
            <TabsTrigger value="filters" className="text-xs sm:text-sm">
              Filters
            </TabsTrigger>
          </TabsList>

          <TabsContent value="social" className="mt-0">
            <ScrollArea className="h-[400px] pr-4">
              {renderTemplateGrid(SOCIAL_MEDIA_TEMPLATES)}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="print" className="mt-0">
            <ScrollArea className="h-[400px] pr-4">
              {renderTemplateGrid(PRINT_TEMPLATES)}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="styles" className="mt-0">
            <ScrollArea className="h-[400px] pr-4">
              {renderTemplateGrid(STYLE_PRESETS)}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="filters" className="mt-0">
            <ScrollArea className="h-[400px] pr-4">
              {renderTemplateGrid(FILTER_PRESETS)}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
