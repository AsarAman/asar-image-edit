import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Plus, Trash2, Type } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";

export interface TextLayer {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  color: string;
  align: "left" | "center" | "right";
  bold: boolean;
  italic: boolean;
  strokeWidth: number;
  strokeColor: string;
  shadowBlur: number;
  shadowOffsetX: number;
  shadowOffsetY: number;
  shadowColor: string;
  behindImages: boolean;
}

interface TextLayersProps {
  textLayers: TextLayer[];
  onChange: (layers: TextLayer[]) => void;
}

const FONT_FAMILIES = [
  "Arial",
  "Helvetica",
  "Times New Roman",
  "Georgia",
  "Courier New",
  "Verdana",
  "Impact",
  "Comic Sans MS",
  "Trebuchet MS",
  "Arial Black",
];

export default function TextLayers({ textLayers, onChange }: TextLayersProps) {
  const [expandedLayer, setExpandedLayer] = useState<string | undefined>(undefined);

  const addTextLayer = () => {
    const newLayer: TextLayer = {
      id: `text-${Date.now()}`,
      text: "Add your text here",
      x: 50,
      y: 50,
      fontSize: 48,
      fontFamily: "Arial",
      color: "#000000",
      align: "center",
      bold: false,
      italic: false,
      strokeWidth: 0,
      strokeColor: "#ffffff",
      shadowBlur: 0,
      shadowOffsetX: 0,
      shadowOffsetY: 0,
      shadowColor: "#000000",
      behindImages: false,
    };
    const updated = [...textLayers, newLayer];
    onChange(updated);
    setExpandedLayer(newLayer.id);
  };

  const updateTextLayer = (id: string, updates: Partial<TextLayer>) => {
    onChange(
      textLayers.map((layer) =>
        layer.id === id ? { ...layer, ...updates } : layer
      )
    );
  };

  const removeTextLayer = (id: string) => {
    onChange(textLayers.filter((layer) => layer.id !== id));
    if (expandedLayer === id) {
      setExpandedLayer(undefined);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Type className="h-5 w-5" />
          Text Layers
        </CardTitle>
        <CardDescription>Add and customize text overlays</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={addTextLayer} className="w-full" variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Add Text Layer
        </Button>

        {textLayers.length > 0 && (
          <Accordion
            type="single"
            collapsible
            value={expandedLayer}
            onValueChange={setExpandedLayer}
          >
            {textLayers.map((layer, index) => (
              <AccordionItem key={layer.id} value={layer.id}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-2 text-left">
                    <Type className="h-4 w-4" />
                    <span className="truncate">
                      {layer.text || `Text Layer ${index + 1}`}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 pt-2">
                    {/* Text Content */}
                    <div className="space-y-2">
                      <Label>Text</Label>
                      <Input
                        value={layer.text}
                        onChange={(e) =>
                          updateTextLayer(layer.id, { text: e.target.value })
                        }
                        placeholder="Enter text"
                      />
                    </div>

                    {/* Position */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>X Position: {layer.x}%</Label>
                        <Slider
                          value={[layer.x]}
                          onValueChange={([x]) =>
                            updateTextLayer(layer.id, { x })
                          }
                          min={0}
                          max={100}
                          step={1}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Y Position: {layer.y}%</Label>
                        <Slider
                          value={[layer.y]}
                          onValueChange={([y]) =>
                            updateTextLayer(layer.id, { y })
                          }
                          min={0}
                          max={100}
                          step={1}
                        />
                      </div>
                    </div>

                    {/* Font Settings */}
                    <div className="space-y-2">
                      <Label>Font Family</Label>
                      <Select
                        value={layer.fontFamily}
                        onValueChange={(fontFamily) =>
                          updateTextLayer(layer.id, { fontFamily })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {FONT_FAMILIES.map((font) => (
                            <SelectItem key={font} value={font}>
                              {font}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Font Size: {layer.fontSize}px</Label>
                      <Slider
                        value={[layer.fontSize]}
                        onValueChange={([fontSize]) =>
                          updateTextLayer(layer.id, { fontSize })
                        }
                        min={12}
                        max={200}
                        step={1}
                      />
                    </div>

                    {/* Text Color */}
                    <div className="space-y-2">
                      <Label>Text Color</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={layer.color}
                          onChange={(e) =>
                            updateTextLayer(layer.id, { color: e.target.value })
                          }
                          className="w-20 h-10"
                        />
                        <Input
                          value={layer.color}
                          onChange={(e) =>
                            updateTextLayer(layer.id, { color: e.target.value })
                          }
                          placeholder="#000000"
                        />
                      </div>
                    </div>

                    {/* Alignment */}
                    <div className="space-y-2">
                      <Label>Text Alignment</Label>
                      <Select
                        value={layer.align}
                        onValueChange={(align: "left" | "center" | "right") =>
                          updateTextLayer(layer.id, { align })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="left">Left</SelectItem>
                          <SelectItem value="center">Center</SelectItem>
                          <SelectItem value="right">Right</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Style Options */}
                    <div className="space-y-3">
                      <Label>Text Style</Label>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`bold-${layer.id}`}
                            checked={layer.bold}
                            onCheckedChange={(checked) =>
                              updateTextLayer(layer.id, { bold: checked as boolean })
                            }
                          />
                          <label
                            htmlFor={`bold-${layer.id}`}
                            className="text-sm font-medium cursor-pointer"
                          >
                            Bold
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`italic-${layer.id}`}
                            checked={layer.italic}
                            onCheckedChange={(checked) =>
                              updateTextLayer(layer.id, { italic: checked as boolean })
                            }
                          />
                          <label
                            htmlFor={`italic-${layer.id}`}
                            className="text-sm font-medium cursor-pointer"
                          >
                            Italic
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Layer Order */}
                    <div className="space-y-3">
                      <Label>Layer Order</Label>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`behind-${layer.id}`}
                          checked={layer.behindImages}
                          onCheckedChange={(checked) =>
                            updateTextLayer(layer.id, { behindImages: checked as boolean })
                          }
                        />
                        <label
                          htmlFor={`behind-${layer.id}`}
                          className="text-sm font-medium cursor-pointer"
                        >
                          Place text behind images
                        </label>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        When enabled, text will appear behind images instead of on top
                      </p>
                    </div>

                    {/* Stroke/Outline */}
                    <div className="space-y-3">
                      <Label>Text Stroke</Label>
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">
                          Width: {layer.strokeWidth}px
                        </Label>
                        <Slider
                          value={[layer.strokeWidth]}
                          onValueChange={([strokeWidth]) =>
                            updateTextLayer(layer.id, { strokeWidth })
                          }
                          min={0}
                          max={10}
                          step={1}
                        />
                      </div>
                      {layer.strokeWidth > 0 && (
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            value={layer.strokeColor}
                            onChange={(e) =>
                              updateTextLayer(layer.id, {
                                strokeColor: e.target.value,
                              })
                            }
                            className="w-20 h-10"
                          />
                          <Input
                            value={layer.strokeColor}
                            onChange={(e) =>
                              updateTextLayer(layer.id, {
                                strokeColor: e.target.value,
                              })
                            }
                            placeholder="#ffffff"
                          />
                        </div>
                      )}
                    </div>

                    {/* Shadow */}
                    <div className="space-y-3">
                      <Label>Text Shadow</Label>
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">
                          Blur: {layer.shadowBlur}px
                        </Label>
                        <Slider
                          value={[layer.shadowBlur]}
                          onValueChange={([shadowBlur]) =>
                            updateTextLayer(layer.id, { shadowBlur })
                          }
                          min={0}
                          max={20}
                          step={1}
                        />
                      </div>
                      {layer.shadowBlur > 0 && (
                        <>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label className="text-xs text-muted-foreground">
                                Offset X: {layer.shadowOffsetX}px
                              </Label>
                              <Slider
                                value={[layer.shadowOffsetX]}
                                onValueChange={([shadowOffsetX]) =>
                                  updateTextLayer(layer.id, { shadowOffsetX })
                                }
                                min={-20}
                                max={20}
                                step={1}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-xs text-muted-foreground">
                                Offset Y: {layer.shadowOffsetY}px
                              </Label>
                              <Slider
                                value={[layer.shadowOffsetY]}
                                onValueChange={([shadowOffsetY]) =>
                                  updateTextLayer(layer.id, { shadowOffsetY })
                                }
                                min={-20}
                                max={20}
                                step={1}
                              />
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Input
                              type="color"
                              value={layer.shadowColor}
                              onChange={(e) =>
                                updateTextLayer(layer.id, {
                                  shadowColor: e.target.value,
                                })
                              }
                              className="w-20 h-10"
                            />
                            <Input
                              value={layer.shadowColor}
                              onChange={(e) =>
                                updateTextLayer(layer.id, {
                                  shadowColor: e.target.value,
                                })
                              }
                              placeholder="#000000"
                            />
                          </div>
                        </>
                      )}
                    </div>

                    {/* Delete Button */}
                    <Button
                      variant="destructive"
                      size="sm"
                      className="w-full"
                      onClick={() => removeTextLayer(layer.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove Text Layer
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}

        {textLayers.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No text layers added yet. Click "Add Text Layer" to get started.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
