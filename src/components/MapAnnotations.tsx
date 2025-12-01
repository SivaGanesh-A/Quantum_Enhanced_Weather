import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Square, Circle, Type, Trash2, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Annotation {
  id: string;
  type: "text" | "rectangle" | "circle" | "line";
  position: [number, number];
  content?: string;
  color: string;
}

interface MapAnnotationsProps {
  annotations: Annotation[];
  onAddAnnotation: (annotation: Omit<Annotation, "id">) => void;
  onClearAnnotations: () => void;
  isActive: boolean;
  onToggle: () => void;
}

export const MapAnnotations = ({
  annotations,
  onAddAnnotation,
  onClearAnnotations,
  isActive,
  onToggle,
}: MapAnnotationsProps) => {
  const [selectedTool, setSelectedTool] = useState<"text" | "rectangle" | "circle" | "line" | null>(null);
  const [selectedColor, setSelectedColor] = useState("#ff0000");

  const colors = [
    { name: "Red", value: "#ff0000" },
    { name: "Blue", value: "#0000ff" },
    { name: "Green", value: "#00ff00" },
    { name: "Yellow", value: "#ffff00" },
    { name: "Orange", value: "#ff8800" },
    { name: "Purple", value: "#8800ff" },
  ];

  return (
    <>
      {/* Toggle Button */}
      <Button
        variant={isActive ? "default" : "secondary"}
        size="icon"
        className="absolute top-20 right-4 z-[1000] bg-card/95 backdrop-blur-sm border-border shadow-lg hover:bg-card"
        onClick={onToggle}
        title="Annotation Tools"
      >
        {isActive ? <X className="w-5 h-5" /> : <Pencil className="w-5 h-5" />}
      </Button>

      {/* Annotation Toolbar */}
      {isActive && (
        <Card className="absolute top-36 right-4 z-[1000] bg-card/95 backdrop-blur-sm border-border shadow-2xl p-4 w-64 animate-fade-in">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold mb-2">Drawing Tools</h3>
              <div className="grid grid-cols-4 gap-2">
                <Button
                  variant={selectedTool === "text" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setSelectedTool("text")}
                  title="Text"
                >
                  <Type className="w-4 h-4" />
                </Button>
                <Button
                  variant={selectedTool === "line" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setSelectedTool("line")}
                  title="Line"
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  variant={selectedTool === "rectangle" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setSelectedTool("rectangle")}
                  title="Rectangle"
                >
                  <Square className="w-4 h-4" />
                </Button>
                <Button
                  variant={selectedTool === "circle" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setSelectedTool("circle")}
                  title="Circle"
                >
                  <Circle className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-2">Color</h3>
              <div className="grid grid-cols-6 gap-2">
                {colors.map((color) => (
                  <button
                    key={color.value}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      selectedColor === color.value ? "border-foreground scale-110" : "border-border/50"
                    }`}
                    style={{ backgroundColor: color.value }}
                    onClick={() => setSelectedColor(color.value)}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">Annotations</span>
                <Badge variant="secondary">{annotations.length}</Badge>
              </div>
              <Button
                variant="destructive"
                size="sm"
                className="w-full"
                onClick={onClearAnnotations}
                disabled={annotations.length === 0}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            </div>

            {selectedTool && (
              <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                <p className="text-xs text-muted-foreground">
                  Click on the map to place {selectedTool}
                </p>
              </div>
            )}
          </div>
        </Card>
      )}
    </>
  );
};
