import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Trash2, MoveUp, MoveDown } from "lucide-react";

export interface StickerLayer {
  id: string;
  type: string;
  emoji: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  zIndex: number;
}

interface StickersProps {
  stickerLayers: StickerLayer[];
  onChange: (layers: StickerLayer[]) => void;
}

const STICKER_LIBRARY = {
  hearts: ["❤️", "💖", "💕", "💓", "💗", "💘", "💝", "💞", "💟", "🧡", "💛", "💚", "💙", "💜", "🤎", "🖤", "🤍"],
  shapes: ["⭐", "✨", "💫", "⚡", "🔥", "💥", "✅", "❌", "⭕", "🔴", "🟠", "🟡", "🟢", "🔵", "🟣", "🟤", "⚫", "⚪"],
  nature: ["🌸", "🌺", "🌻", "🌼", "🌷", "🌹", "🌿", "🍀", "🍁", "🍂", "🍃", "🌾", "🌲", "🌳", "🌴", "🌵"],
  emojis: ["😀", "😃", "😄", "😁", "😅", "😂", "🤣", "😊", "😇", "🙂", "😉", "😍", "🥰", "😘", "😋", "😎", "🤩", "🥳"],
  hands: ["👍", "👎", "👌", "✌️", "🤞", "🤘", "🤙", "👏", "🙌", "👐", "🤲", "🙏", "✍️", "💪"],
  objects: ["🎈", "🎉", "🎊", "🎁", "🏆", "🥇", "🥈", "🥉", "🏅", "🎖️", "⚽", "🏀", "🎯", "🎨", "🎭", "🎪"],
  food: ["🍕", "🍔", "🍟", "🌭", "🍿", "🧃", "🍩", "🍪", "🎂", "🧁", "🍰", "🍦", "🍨", "🍧"],
  symbols: ["♥️", "♦️", "♣️", "♠️", "☀️", "🌙", "⭐", "💫", "✨", "🌈", "☁️", "⛅", "⚡", "🔥", "💧", "❄️"],
};

export default function Stickers({ stickerLayers, onChange }: StickersProps) {
  const addSticker = (emoji: string, type: string) => {
    const newSticker: StickerLayer = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      emoji,
      x: 50,
      y: 50,
      width: 100,
      height: 100,
      rotation: 0,
      opacity: 1,
      zIndex: stickerLayers.length,
    };
    onChange([...stickerLayers, newSticker]);
  };

  const removeSticker = (id: string) => {
    onChange(stickerLayers.filter((s) => s.id !== id));
  };

  const updateSticker = (id: string, updates: Partial<StickerLayer>) => {
    onChange(
      stickerLayers.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
  };

  const moveLayer = (id: string, direction: "up" | "down") => {
    const index = stickerLayers.findIndex((s) => s.id === id);
    if (index === -1) return;

    const newLayers = [...stickerLayers];
    if (direction === "up" && index < newLayers.length - 1) {
      [newLayers[index], newLayers[index + 1]] = [newLayers[index + 1], newLayers[index]];
    } else if (direction === "down" && index > 0) {
      [newLayers[index], newLayers[index - 1]] = [newLayers[index - 1], newLayers[index]];
    }

    // Update zIndex
    onChange(newLayers.map((s, i) => ({ ...s, zIndex: i })));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Stickers & Graphics</CardTitle>
        <CardDescription>Add fun stickers and graphics to your composition</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Sticker Library */}
        <div>
          <Label className="text-sm font-medium mb-3 block">Add Stickers</Label>
          <Tabs defaultValue="hearts" className="w-full">
            <TabsList className="grid grid-cols-4 w-full mb-3">
              <TabsTrigger value="hearts" className="text-xs">Hearts</TabsTrigger>
              <TabsTrigger value="shapes" className="text-xs">Shapes</TabsTrigger>
              <TabsTrigger value="nature" className="text-xs">Nature</TabsTrigger>
              <TabsTrigger value="emojis" className="text-xs">Emojis</TabsTrigger>
            </TabsList>
            <TabsList className="grid grid-cols-4 w-full mb-3">
              <TabsTrigger value="hands" className="text-xs">Hands</TabsTrigger>
              <TabsTrigger value="objects" className="text-xs">Objects</TabsTrigger>
              <TabsTrigger value="food" className="text-xs">Food</TabsTrigger>
              <TabsTrigger value="symbols" className="text-xs">Symbols</TabsTrigger>
            </TabsList>

            {Object.entries(STICKER_LIBRARY).map(([category, emojis]) => (
              <TabsContent key={category} value={category} className="mt-0">
                <ScrollArea className="h-48 rounded-md border p-3">
                  <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
                    {emojis.map((emoji, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        size="sm"
                        className="h-10 w-10 p-0 text-2xl hover:bg-muted"
                        onClick={() => addSticker(emoji, category)}
                      >
                        {emoji}
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
            ))}
          </Tabs>
        </div>

        {/* Active Stickers */}
        {stickerLayers.length > 0 && (
          <div>
            <Label className="text-sm font-medium mb-3 block">
              Active Stickers ({stickerLayers.length})
            </Label>
            <ScrollArea className="h-64 rounded-md border">
              <div className="space-y-3 p-3">
                {stickerLayers.map((sticker, index) => (
                  <div key={sticker.id} className="space-y-3 p-3 bg-muted/50 rounded-md">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{sticker.emoji}</span>
                        <span className="text-xs text-muted-foreground">
                          Layer {index + 1}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => moveLayer(sticker.id, "up")}
                          disabled={index === stickerLayers.length - 1}
                        >
                          <MoveUp className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => moveLayer(sticker.id, "down")}
                          disabled={index === 0}
                        >
                          <MoveDown className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive"
                          onClick={() => removeSticker(sticker.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    {/* Position X */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs">X Position</Label>
                        <span className="text-xs text-muted-foreground">{sticker.x}%</span>
                      </div>
                      <Slider
                        value={[sticker.x]}
                        onValueChange={(v) => updateSticker(sticker.id, { x: v[0] })}
                        min={0}
                        max={100}
                        step={1}
                      />
                    </div>

                    {/* Position Y */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs">Y Position</Label>
                        <span className="text-xs text-muted-foreground">{sticker.y}%</span>
                      </div>
                      <Slider
                        value={[sticker.y]}
                        onValueChange={(v) => updateSticker(sticker.id, { y: v[0] })}
                        min={0}
                        max={100}
                        step={1}
                      />
                    </div>

                    {/* Size */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs">Size</Label>
                        <span className="text-xs text-muted-foreground">{sticker.width}px</span>
                      </div>
                      <Slider
                        value={[sticker.width]}
                        onValueChange={(v) =>
                          updateSticker(sticker.id, { width: v[0], height: v[0] })
                        }
                        min={20}
                        max={400}
                        step={5}
                      />
                    </div>

                    {/* Rotation */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs">Rotation</Label>
                        <span className="text-xs text-muted-foreground">{sticker.rotation}°</span>
                      </div>
                      <Slider
                        value={[sticker.rotation]}
                        onValueChange={(v) => updateSticker(sticker.id, { rotation: v[0] })}
                        min={0}
                        max={360}
                        step={5}
                      />
                    </div>

                    {/* Opacity */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs">Opacity</Label>
                        <span className="text-xs text-muted-foreground">
                          {Math.round(sticker.opacity * 100)}%
                        </span>
                      </div>
                      <Slider
                        value={[sticker.opacity * 100]}
                        onValueChange={(v) => updateSticker(sticker.id, { opacity: v[0] / 100 })}
                        min={0}
                        max={100}
                        step={5}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {stickerLayers.length === 0 && (
          <div className="text-center py-8 text-sm text-muted-foreground border rounded-md">
            <Plus className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No stickers added yet</p>
            <p className="text-xs mt-1">Select a sticker from the library above</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
