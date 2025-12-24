import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Grid3x3, LayoutGrid, Image as ImageIcon, Sparkles } from "lucide-react";
import type { LayoutType } from "./LayoutSelector";
import type { CanvasSettingsData } from "./CanvasSettings";

export interface CollageTemplate {
  id: string;
  name: string;
  description: string;
  category: "grid" | "story" | "creative" | "polaroid";
  layout: LayoutType;
  canvasSettings: CanvasSettingsData;
  minImages: number;
  maxImages: number;
  preview: React.ReactNode;
}

interface CollageTemplatesProps {
  onApplyTemplate: (template: CollageTemplate) => void;
  currentImageCount: number;
}

// Define 16+ professional collage templates
const COLLAGE_TEMPLATES: CollageTemplate[] = [
  // GRID LAYOUTS (Perfect for organized collections)
  {
    id: "grid-2x2",
    name: "Classic Grid 2×2",
    description: "4 images in perfect square grid",
    category: "grid",
    layout: "grid",
    canvasSettings: { width: 1200, height: 1200, backgroundColor: "#ffffff" },
    minImages: 4,
    maxImages: 4,
    preview: (
      <div className="grid grid-cols-2 gap-0.5 w-full h-full">
        <div className="bg-primary/20" />
        <div className="bg-primary/30" />
        <div className="bg-primary/25" />
        <div className="bg-primary/35" />
      </div>
    ),
  },
  {
    id: "grid-3x3",
    name: "Instagram Grid 3×3",
    description: "9 images in classic Instagram grid",
    category: "grid",
    layout: "grid",
    canvasSettings: { width: 1080, height: 1080, backgroundColor: "#ffffff" },
    minImages: 9,
    maxImages: 9,
    preview: (
      <div className="grid grid-cols-3 gap-0.5 w-full h-full">
        {[...Array(9)].map((_, i) => (
          <div key={i} className="bg-primary/20" />
        ))}
      </div>
    ),
  },
  {
    id: "grid-2x3",
    name: "Portrait Grid 2×3",
    description: "6 images in vertical arrangement",
    category: "grid",
    layout: "grid",
    canvasSettings: { width: 1000, height: 1500, backgroundColor: "#ffffff" },
    minImages: 6,
    maxImages: 6,
    preview: (
      <div className="grid grid-cols-2 gap-0.5 w-full h-full">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-primary/20" />
        ))}
      </div>
    ),
  },
  {
    id: "grid-3x2",
    name: "Landscape Grid 3×2",
    description: "6 images in horizontal arrangement",
    category: "grid",
    layout: "grid",
    canvasSettings: { width: 1500, height: 1000, backgroundColor: "#ffffff" },
    minImages: 6,
    maxImages: 6,
    preview: (
      <div className="grid grid-cols-3 gap-0.5 w-full h-full">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-primary/20" />
        ))}
      </div>
    ),
  },

  // STORY LAYOUTS (Perfect for storytelling)
  {
    id: "story-vertical",
    name: "Story Vertical",
    description: "2 images stacked vertically",
    category: "story",
    layout: "vertical",
    canvasSettings: { width: 1080, height: 1920, backgroundColor: "#ffffff" },
    minImages: 2,
    maxImages: 2,
    preview: (
      <div className="flex flex-col gap-0.5 w-full h-full">
        <div className="flex-1 bg-primary/20" />
        <div className="flex-1 bg-primary/30" />
      </div>
    ),
  },
  {
    id: "story-horizontal",
    name: "Story Horizontal",
    description: "2 images side by side",
    category: "story",
    layout: "horizontal",
    canvasSettings: { width: 1920, height: 1080, backgroundColor: "#ffffff" },
    minImages: 2,
    maxImages: 2,
    preview: (
      <div className="flex gap-0.5 w-full h-full">
        <div className="flex-1 bg-primary/20" />
        <div className="flex-1 bg-primary/30" />
      </div>
    ),
  },
  {
    id: "story-triple-vertical",
    name: "Triple Story",
    description: "3 images vertically stacked",
    category: "story",
    layout: "vertical",
    canvasSettings: { width: 1080, height: 1920, backgroundColor: "#f5f5f5" },
    minImages: 3,
    maxImages: 3,
    preview: (
      <div className="flex flex-col gap-0.5 w-full h-full">
        <div className="flex-1 bg-primary/20" />
        <div className="flex-1 bg-primary/25" />
        <div className="flex-1 bg-primary/30" />
      </div>
    ),
  },
  {
    id: "story-triple-horizontal",
    name: "Triple Horizontal",
    description: "3 images side by side",
    category: "story",
    layout: "horizontal",
    canvasSettings: { width: 1920, height: 1080, backgroundColor: "#f5f5f5" },
    minImages: 3,
    maxImages: 3,
    preview: (
      <div className="flex gap-0.5 w-full h-full">
        <div className="flex-1 bg-primary/20" />
        <div className="flex-1 bg-primary/25" />
        <div className="flex-1 bg-primary/30" />
      </div>
    ),
  },

  // CREATIVE LAYOUTS (Magazine & Editorial style)
  {
    id: "magazine-hero",
    name: "Magazine Hero",
    description: "1 large + 2 small images",
    category: "creative",
    layout: "mosaic",
    canvasSettings: { width: 1200, height: 1600, backgroundColor: "#ffffff" },
    minImages: 3,
    maxImages: 3,
    preview: (
      <div className="flex flex-col gap-0.5 w-full h-full">
        <div className="h-2/3 bg-primary/30" />
        <div className="flex-1 flex gap-0.5">
          <div className="flex-1 bg-primary/20" />
          <div className="flex-1 bg-primary/25" />
        </div>
      </div>
    ),
  },
  {
    id: "magazine-sidebar",
    name: "Magazine Sidebar",
    description: "1 large + 3 small sidebar",
    category: "creative",
    layout: "overlay",
    canvasSettings: { width: 1600, height: 1200, backgroundColor: "#ffffff" },
    minImages: 4,
    maxImages: 4,
    preview: (
      <div className="flex gap-0.5 w-full h-full">
        <div className="w-2/3 bg-primary/30" />
        <div className="flex-1 flex flex-col gap-0.5">
          <div className="flex-1 bg-primary/20" />
          <div className="flex-1 bg-primary/22" />
          <div className="flex-1 bg-primary/25" />
        </div>
      </div>
    ),
  },
  {
    id: "collage-scattered",
    name: "Scattered Collage",
    description: "4-8 images in overlapping style",
    category: "creative",
    layout: "collage1",
    canvasSettings: { width: 1200, height: 1200, backgroundColor: "#f8f8f8" },
    minImages: 4,
    maxImages: 8,
    preview: (
      <div className="relative w-full h-full">
        <div className="absolute top-2 left-2 w-1/2 h-1/2 bg-primary/20 rotate-[-5deg]" />
        <div className="absolute top-1/4 right-2 w-1/3 h-1/3 bg-primary/25 rotate-[8deg]" />
        <div className="absolute bottom-2 left-1/4 w-1/3 h-1/3 bg-primary/30 rotate-[-3deg]" />
        <div className="absolute bottom-1/4 right-1/4 w-1/4 h-1/4 bg-primary/35 rotate-[12deg]" />
      </div>
    ),
  },
  {
    id: "split-diagonal",
    name: "Diagonal Split",
    description: "2 images split diagonally",
    category: "creative",
    layout: "diagonal",
    canvasSettings: { width: 1200, height: 1200, backgroundColor: "#ffffff" },
    minImages: 2,
    maxImages: 2,
    preview: (
      <div className="relative w-full h-full overflow-hidden">
        <div 
          className="absolute bg-primary/25" 
          style={{ 
            clipPath: "polygon(0 0, 100% 0, 0 100%)",
            width: "100%",
            height: "100%"
          }}
        />
        <div 
          className="absolute bg-primary/35" 
          style={{ 
            clipPath: "polygon(100% 0, 100% 100%, 0 100%)",
            width: "100%",
            height: "100%"
          }}
        />
      </div>
    ),
  },

  // POLAROID LAYOUTS (Classic photo style)
  {
    id: "polaroid-single",
    name: "Classic Polaroid",
    description: "Single image with white frame",
    category: "polaroid",
    layout: "single",
    canvasSettings: { width: 1000, height: 1200, backgroundColor: "#ffffff" },
    minImages: 1,
    maxImages: 1,
    preview: (
      <div className="flex items-center justify-center w-full h-full p-2">
        <div className="w-4/5 h-3/4 bg-primary/25 border-8 border-white shadow-lg" />
      </div>
    ),
  },
  {
    id: "polaroid-double",
    name: "Double Polaroid",
    description: "2 polaroid-style photos",
    category: "polaroid",
    layout: "horizontal",
    canvasSettings: { width: 1400, height: 1000, backgroundColor: "#f5f5f5" },
    minImages: 2,
    maxImages: 2,
    preview: (
      <div className="flex gap-4 items-center justify-center w-full h-full p-4">
        <div className="w-2/5 h-3/4 bg-primary/20 border-8 border-white shadow-lg rotate-[-5deg]" />
        <div className="w-2/5 h-3/4 bg-primary/30 border-8 border-white shadow-lg rotate-[5deg]" />
      </div>
    ),
  },
  {
    id: "polaroid-wall",
    name: "Polaroid Wall",
    description: "4 polaroids pinned to wall",
    category: "polaroid",
    layout: "grid",
    canvasSettings: { width: 1200, height: 1200, backgroundColor: "#e8e4d9" },
    minImages: 4,
    maxImages: 4,
    preview: (
      <div className="grid grid-cols-2 gap-4 w-full h-full p-4">
        <div className="bg-primary/20 border-8 border-white shadow-md rotate-[-3deg]" />
        <div className="bg-primary/25 border-8 border-white shadow-md rotate-[4deg]" />
        <div className="bg-primary/22 border-8 border-white shadow-md rotate-[2deg]" />
        <div className="bg-primary/28 border-8 border-white shadow-md rotate-[-5deg]" />
      </div>
    ),
  },
  {
    id: "polaroid-stack",
    name: "Polaroid Stack",
    description: "6 polaroids stacked casually",
    category: "polaroid",
    layout: "collage2",
    canvasSettings: { width: 1200, height: 1200, backgroundColor: "#f0ebe3" },
    minImages: 6,
    maxImages: 6,
    preview: (
      <div className="relative w-full h-full p-4">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-primary/20 border-8 border-white shadow-lg"
            style={{
              width: "35%",
              height: "40%",
              top: `${10 + i * 8}%`,
              left: `${20 + i * 5}%`,
              transform: `rotate(${-10 + i * 4}deg)`,
            }}
          />
        ))}
      </div>
    ),
  },
];

export default function CollageTemplates({ onApplyTemplate, currentImageCount }: CollageTemplatesProps) {
  const [selectedCategory, setSelectedCategory] = useState<CollageTemplate["category"]>("grid");

  const filteredTemplates = COLLAGE_TEMPLATES.filter((t) => t.category === selectedCategory);

  const canUseTemplate = (template: CollageTemplate) => {
    return currentImageCount >= template.minImages && currentImageCount <= template.maxImages;
  };

  return (
    <Card className="border-2 border-black shadow-neo">
      <CardHeader className="pb-3 bg-neo-blue/10">
        <CardTitle className="flex items-center gap-2 text-lg font-black uppercase">
          <LayoutGrid className="h-5 w-5" />
          Collage Templates
        </CardTitle>
        <CardDescription>
          16 professional multi-image arrangements. {currentImageCount > 0 && `You have ${currentImageCount} image${currentImageCount === 1 ? "" : "s"} uploaded.`}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        {/* Category Tabs */}
        <div className="flex gap-2 mb-4 flex-wrap">
          <Button
            size="sm"
            variant={selectedCategory === "grid" ? "default" : "outline"}
            onClick={() => setSelectedCategory("grid")}
            className="border-2 border-black shadow-neo-sm hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all font-bold"
          >
            <Grid3x3 className="h-4 w-4 mr-2" />
            Grid
          </Button>
          <Button
            size="sm"
            variant={selectedCategory === "story" ? "default" : "outline"}
            onClick={() => setSelectedCategory("story")}
            className="border-2 border-black shadow-neo-sm hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all font-bold"
          >
            <ImageIcon className="h-4 w-4 mr-2" />
            Story
          </Button>
          <Button
            size="sm"
            variant={selectedCategory === "creative" ? "default" : "outline"}
            onClick={() => setSelectedCategory("creative")}
            className="border-2 border-black shadow-neo-sm hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all font-bold"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Creative
          </Button>
          <Button
            size="sm"
            variant={selectedCategory === "polaroid" ? "default" : "outline"}
            onClick={() => setSelectedCategory("polaroid")}
            className="border-2 border-black shadow-neo-sm hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all font-bold"
          >
            <ImageIcon className="h-4 w-4 mr-2" />
            Polaroid
          </Button>
        </div>

        {/* Templates Grid */}
        <ScrollArea className="h-[450px]">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pr-4">
            {filteredTemplates.map((template) => {
              const isUsable = canUseTemplate(template);
              
              return (
                <button
                  key={template.id}
                  onClick={() => isUsable && onApplyTemplate(template)}
                  disabled={!isUsable}
                  className={`
                    group relative rounded-lg border-2 border-black bg-white overflow-hidden
                    transition-all shadow-neo hover:shadow-neo-lg
                    ${isUsable 
                      ? "hover:translate-x-[-2px] hover:translate-y-[-2px] cursor-pointer" 
                      : "opacity-50 cursor-not-allowed"
                    }
                  `}
                >
                  {/* Preview */}
                  <div className="aspect-square p-3 bg-gradient-to-br from-muted/30 to-muted/10">
                    <div className="w-full h-full rounded border-2 border-black/10 overflow-hidden">
                      {template.preview}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-3 bg-white border-t-2 border-black">
                    <h4 className="font-black text-xs mb-1 uppercase truncate">
                      {template.name}
                    </h4>
                    <p className="text-[10px] text-muted-foreground line-clamp-2 mb-1">
                      {template.description}
                    </p>
                    {!isUsable && (
                      <p className="text-[10px] font-bold text-destructive">
                        Needs {template.minImages}-{template.maxImages} images
                      </p>
                    )}
                  </div>

                  {/* Overlay on hover */}
                  {isUsable && (
                    <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors pointer-events-none" />
                  )}
                </button>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
