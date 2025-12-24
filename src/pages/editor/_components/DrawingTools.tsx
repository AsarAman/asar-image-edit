import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import {
  Pencil,
  Minus,
  ArrowRight,
  Square,
  Circle,
  Highlighter,
  Eraser,
  Trash2,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export type DrawingToolType = "pen" | "line" | "arrow" | "rectangle" | "circle" | "highlighter";

export interface DrawingStroke {
  id: string;
  tool: DrawingToolType;
  color: string;
  size: number;
  opacity: number;
  points: { x: number; y: number }[]; // For pen strokes
  startPoint?: { x: number; y: number }; // For shapes
  endPoint?: { x: number; y: number }; // For shapes
}

interface DrawingToolsProps {
  strokes: DrawingStroke[];
  onChange: (strokes: DrawingStroke[]) => void;
  onToolSelect?: (tool: DrawingToolType | null) => void;
  onSettingsChange?: (settings: { tool: DrawingToolType; color: string; size: number; opacity: number }) => void;
  isDrawingMode?: boolean;
  onDrawingModeChange?: (enabled: boolean) => void;
}

const toolOptions = [
  { value: "pen", label: "Pen", icon: Pencil },
  { value: "line", label: "Line", icon: Minus },
  { value: "arrow", label: "Arrow", icon: ArrowRight },
  { value: "rectangle", label: "Rectangle", icon: Square },
  { value: "circle", label: "Circle", icon: Circle },
  { value: "highlighter", label: "Highlighter", icon: Highlighter },
];

const colorPresets = [
  "#000000", // Black
  "#FFFFFF", // White
  "#FF0000", // Red
  "#00FF00", // Green
  "#0000FF", // Blue
  "#FFFF00", // Yellow
  "#FF00FF", // Magenta
  "#00FFFF", // Cyan
  "#FFA500", // Orange
  "#800080", // Purple
];

export default function DrawingTools({
  strokes,
  onChange,
  onToolSelect,
  onSettingsChange,
  isDrawingMode = false,
  onDrawingModeChange,
}: DrawingToolsProps) {
  const [selectedTool, setSelectedTool] = useState<DrawingToolType>("pen");
  const [brushSize, setBrushSize] = useState(3);
  const [brushColor, setBrushColor] = useState("#FF0000");
  const [brushOpacity, setBrushOpacity] = useState(100);

  // Notify parent of settings changes
  const notifySettingsChange = (tool: DrawingToolType, color: string, size: number, opacity: number) => {
    if (onSettingsChange) {
      onSettingsChange({
        tool,
        color,
        size,
        opacity: opacity / 100,
      });
    }
  };

  const handleToolSelect = (tool: DrawingToolType) => {
    setSelectedTool(tool);
    if (onToolSelect) {
      onToolSelect(tool);
    }
    
    // Notify settings change
    notifySettingsChange(tool, brushColor, brushSize, brushOpacity);
    
    // Auto-enable drawing mode when a tool is selected
    if (onDrawingModeChange && !isDrawingMode) {
      onDrawingModeChange(true);
    }
  };

  const handleDrawingModeToggle = () => {
    const newMode = !isDrawingMode;
    if (onDrawingModeChange) {
      onDrawingModeChange(newMode);
    }
    if (onToolSelect && !newMode) {
      onToolSelect(null);
    }
  };

  const handleClearAll = () => {
    onChange([]);
  };

  const handleUndo = () => {
    if (strokes.length > 0) {
      onChange(strokes.slice(0, -1));
    }
  };

  // Get current tool settings for the canvas
  const getCurrentToolSettings = () => ({
    tool: selectedTool,
    color: brushColor,
    size: brushSize,
    opacity: brushOpacity / 100,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Pencil className="h-5 w-5" />
          Drawing & Annotations
        </CardTitle>
        <CardDescription>
          Draw and annotate directly on your canvas
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Drawing Mode Toggle */}
        <div className="flex items-center justify-between">
          <Label>Drawing Mode</Label>
          <Button
            variant={isDrawingMode ? "default" : "outline"}
            size="sm"
            onClick={handleDrawingModeToggle}
          >
            {isDrawingMode ? "On" : "Off"}
          </Button>
        </div>

        {isDrawingMode && (
          <>
            <Tabs defaultValue="tools" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="tools">Tools</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              {/* Tools Tab */}
              <TabsContent value="tools" className="space-y-4 mt-4">
                {/* Tool Selector */}
                <div className="space-y-3">
                  <Label>Drawing Tool</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {toolOptions.map((option) => {
                      const Icon = option.icon;
                      return (
                        <Button
                          key={option.value}
                          variant={selectedTool === option.value ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleToolSelect(option.value as DrawingToolType)}
                          className="flex flex-col items-center gap-1 h-auto py-3"
                        >
                          <Icon className="h-5 w-5" />
                          <span className="text-xs">{option.label}</span>
                        </Button>
                      );
                    })}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="space-y-2">
                  <Label>Quick Actions</Label>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleUndo}
                      disabled={strokes.length === 0}
                      className="flex-1"
                    >
                      <Eraser className="h-4 w-4 mr-2" />
                      Undo Last
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleClearAll}
                      disabled={strokes.length === 0}
                      className="flex-1"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear All
                    </Button>
                  </div>
                </div>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings" className="space-y-4 mt-4">
                {/* Color Presets */}
                <div className="space-y-3">
                  <Label>Color Presets</Label>
                  <div className="grid grid-cols-5 gap-2">
                    {colorPresets.map((color) => (
                      <button
                        key={color}
                        onClick={() => {
                          setBrushColor(color);
                          notifySettingsChange(selectedTool, color, brushSize, brushOpacity);
                        }}
                        className={`h-10 rounded-md border-2 transition-all ${
                          brushColor === color
                            ? "border-primary ring-2 ring-primary/20"
                            : "border-border hover:border-primary/50"
                        }`}
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>

                {/* Custom Color */}
                <div className="space-y-2">
                  <Label>Custom Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={brushColor}
                      onChange={(e) => {
                        setBrushColor(e.target.value);
                        notifySettingsChange(selectedTool, e.target.value, brushSize, brushOpacity);
                      }}
                      className="h-10 w-20 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={brushColor}
                      onChange={(e) => {
                        setBrushColor(e.target.value);
                        notifySettingsChange(selectedTool, e.target.value, brushSize, brushOpacity);
                      }}
                      placeholder="#FF0000"
                      className="flex-1"
                    />
                  </div>
                </div>

                {/* Brush Size */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>
                      {selectedTool === "highlighter" ? "Highlighter" : "Brush"} Size
                    </Label>
                    <span className="text-sm text-muted-foreground">
                      {brushSize}px
                    </span>
                  </div>
                  <Slider
                    value={[brushSize]}
                    onValueChange={([value]) => {
                      setBrushSize(value);
                      notifySettingsChange(selectedTool, brushColor, value, brushOpacity);
                    }}
                    min={1}
                    max={selectedTool === "highlighter" ? 40 : 20}
                    step={1}
                  />
                </div>

                {/* Opacity */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Opacity</Label>
                    <span className="text-sm text-muted-foreground">
                      {brushOpacity}%
                    </span>
                  </div>
                  <Slider
                    value={[brushOpacity]}
                    onValueChange={([value]) => {
                      setBrushOpacity(value);
                      notifySettingsChange(selectedTool, brushColor, brushSize, value);
                    }}
                    min={10}
                    max={100}
                    step={5}
                  />
                </div>

                {/* Preview */}
                <div className="space-y-2">
                  <Label>Preview</Label>
                  <div className="h-20 rounded-md border bg-muted flex items-center justify-center">
                    <div
                      className="rounded-full"
                      style={{
                        width: `${Math.min(brushSize * 3, 60)}px`,
                        height: `${Math.min(brushSize * 3, 60)}px`,
                        backgroundColor: brushColor,
                        opacity: brushOpacity / 100,
                      }}
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {/* Stroke Count */}
            {strokes.length > 0 && (
              <div className="text-xs text-muted-foreground pt-2 border-t">
                {strokes.length} annotation{strokes.length !== 1 ? "s" : ""} on canvas
              </div>
            )}
          </>
        )}

        {/* Info when drawing mode is off */}
        {!isDrawingMode && (
          <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
            <p>• Enable drawing mode to annotate your canvas</p>
            <p>• Draw freehand or add shapes, arrows, and lines</p>
            <p>• Use the highlighter for emphasis</p>
            <p>• Perfect for tutorials and presentations</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
