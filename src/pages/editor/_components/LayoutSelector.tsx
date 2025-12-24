import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type LayoutType = "single" | "horizontal" | "vertical" | "grid" | "collage1" | "collage2" | "overlay" | "diagonal" | "circular" | "stacked" | "mosaic";

interface LayoutSelectorProps {
  selectedLayout: LayoutType;
  onLayoutChange: (layout: LayoutType) => void;
  imageCount: number;
}

const layouts = [
  {
    id: "single" as LayoutType,
    name: "Single",
    description: "Display single image centered",
    minImages: 1,
    icon: (
      <div className="flex items-center justify-center h-8">
        <div className="w-12 h-full bg-primary/30 rounded" />
      </div>
    ),
  },
  {
    id: "horizontal" as LayoutType,
    name: "Side by Side",
    description: "Place images horizontally",
    minImages: 2,
    icon: (
      <div className="flex gap-1 h-8">
        <div className="flex-1 bg-primary/20 rounded" />
        <div className="flex-1 bg-primary/20 rounded" />
      </div>
    ),
  },
  {
    id: "vertical" as LayoutType,
    name: "Top to Bottom",
    description: "Stack images vertically",
    minImages: 2,
    icon: (
      <div className="flex flex-col gap-1 h-8">
        <div className="flex-1 bg-primary/20 rounded" />
        <div className="flex-1 bg-primary/20 rounded" />
      </div>
    ),
  },
  {
    id: "grid" as LayoutType,
    name: "Grid",
    description: "Arrange in a grid layout",
    minImages: 2,
    icon: (
      <div className="grid grid-cols-2 gap-1 h-8">
        <div className="bg-primary/20 rounded" />
        <div className="bg-primary/20 rounded" />
        <div className="bg-primary/20 rounded col-span-2" />
      </div>
    ),
  },
  {
    id: "diagonal" as LayoutType,
    name: "Diagonal",
    description: "Images arranged diagonally",
    minImages: 2,
    icon: (
      <div className="relative h-8">
        <div className="absolute top-0 left-0 w-5 h-5 bg-primary/30 rounded" />
        <div className="absolute top-2 left-3 w-5 h-5 bg-primary/25 rounded" />
        <div className="absolute top-4 left-6 w-5 h-5 bg-primary/20 rounded" />
      </div>
    ),
  },
  {
    id: "circular" as LayoutType,
    name: "Circular",
    description: "Images arranged in a circle",
    minImages: 3,
    icon: (
      <div className="relative h-8 flex items-center justify-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-primary/30 rounded" />
        <div className="absolute bottom-0 left-0 w-4 h-4 bg-primary/25 rounded" />
        <div className="absolute bottom-0 right-0 w-4 h-4 bg-primary/20 rounded" />
      </div>
    ),
  },
  {
    id: "stacked" as LayoutType,
    name: "Stacked",
    description: "Polaroid-style photo stack",
    minImages: 2,
    icon: (
      <div className="relative h-8">
        <div className="absolute top-0 left-1 w-12 h-7 bg-primary/15 rounded border-2 border-primary/10 rotate-[-8deg]" />
        <div className="absolute top-0.5 left-2 w-12 h-7 bg-primary/25 rounded border-2 border-primary/20 rotate-[5deg]" />
        <div className="absolute top-1 left-3 w-12 h-7 bg-primary/35 rounded border-2 border-primary/30" />
      </div>
    ),
  },
  {
    id: "mosaic" as LayoutType,
    name: "Mosaic",
    description: "Artistic asymmetric layout",
    minImages: 2,
    icon: (
      <div className="grid grid-cols-3 gap-0.5 h-8">
        <div className="row-span-2 bg-primary/30 rounded" />
        <div className="col-span-2 bg-primary/20 rounded" />
        <div className="bg-primary/25 rounded" />
        <div className="bg-primary/15 rounded" />
      </div>
    ),
  },
  {
    id: "collage1" as LayoutType,
    name: "Collage Style 1",
    description: "Creative overlapping layout",
    minImages: 2,
    icon: (
      <div className="relative h-8">
        <div className="absolute top-0 left-0 w-14 h-6 bg-primary/30 rounded" />
        <div className="absolute top-2 left-4 w-14 h-6 bg-primary/20 rounded" />
      </div>
    ),
  },
  {
    id: "collage2" as LayoutType,
    name: "Collage Style 2",
    description: "Magazine-style arrangement",
    minImages: 2,
    icon: (
      <div className="grid grid-cols-3 gap-1 h-8">
        <div className="col-span-2 bg-primary/20 rounded" />
        <div className="flex flex-col gap-1">
          <div className="flex-1 bg-primary/30 rounded" />
          <div className="flex-1 bg-primary/30 rounded" />
        </div>
      </div>
    ),
  },
  {
    id: "overlay" as LayoutType,
    name: "Overlay",
    description: "Layer one image over another",
    minImages: 2,
    icon: (
      <div className="relative h-8">
        <div className="absolute inset-0 bg-primary/20 rounded" />
        <div className="absolute top-2 left-2 right-2 bottom-0 bg-primary/40 rounded" />
      </div>
    ),
  },
];

export default function LayoutSelector({
  selectedLayout,
  onLayoutChange,
  imageCount,
}: LayoutSelectorProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold">Layout</h3>
        <p className="text-sm text-muted-foreground">
          Choose how to arrange your images
        </p>
      </div>

      <div className="grid gap-3">
        {layouts.map((layout) => {
          const isDisabled = imageCount < layout.minImages;
          const isSelected = selectedLayout === layout.id;

          return (
            <Card
              key={layout.id}
              className={cn(
                "cursor-pointer transition-all hover:border-primary/50",
                isSelected && "border-primary bg-primary/5",
                isDisabled && "opacity-50 cursor-not-allowed"
              )}
              onClick={() => !isDisabled && onLayoutChange(layout.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="w-16 flex-shrink-0">{layout.icon}</div>
                  <div className="flex-1">
                    <div className="font-medium">{layout.name}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {layout.description}
                    </p>
                  </div>
                  {isSelected && (
                    <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                      <svg
                        className="h-3 w-3 text-primary-foreground"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export type { LayoutType };
