import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Thermometer, Wind, Droplets, Cloud, CloudRain, Gauge, Satellite, CloudRainWind } from "lucide-react";
import { cn } from "@/lib/utils";

export type LayerType = "forecast" | "satellite" | "radar";
export type ForecastLayer = "temp" | "wind" | "humidity" | "cloudcover" | "precipitation" | "pressure";
export type SatelliteLayer = "truecolor" | "infrared" | "watervapor";

interface LayerControlProps {
  activeLayerType: LayerType;
  activeForecastLayer: ForecastLayer;
  activeSatelliteLayer: SatelliteLayer;
  showRadar: boolean;
  opacity: number;
  onLayerTypeChange: (type: LayerType) => void;
  onForecastLayerChange: (layer: ForecastLayer) => void;
  onSatelliteLayerChange: (layer: SatelliteLayer) => void;
  onRadarToggle: (show: boolean) => void;
  onOpacityChange: (opacity: number) => void;
}

const forecastLayers = [
  { id: "temp" as const, label: "Temperature", icon: Thermometer },
  { id: "wind" as const, label: "Wind", icon: Wind },
  { id: "humidity" as const, label: "Humidity", icon: Droplets },
  { id: "cloudcover" as const, label: "Clouds", icon: Cloud },
  { id: "precipitation" as const, label: "Precipitation", icon: CloudRain },
  { id: "pressure" as const, label: "Pressure", icon: Gauge },
];

const satelliteLayers = [
  { id: "truecolor" as const, label: "True Color" },
  { id: "infrared" as const, label: "Infrared" },
  { id: "watervapor" as const, label: "Water Vapor" },
];

export const LayerControl = ({
  activeLayerType,
  activeForecastLayer,
  activeSatelliteLayer,
  showRadar,
  opacity,
  onLayerTypeChange,
  onForecastLayerChange,
  onSatelliteLayerChange,
  onRadarToggle,
  onOpacityChange,
}: LayerControlProps) => {
  return (
    <Card className="absolute top-4 left-4 z-[1000] bg-card/95 backdrop-blur-sm border-border shadow-xl p-4 w-80 animate-fade-in">
      <Label className="text-base font-bold mb-4 block flex items-center gap-2">
        <Cloud className="w-5 h-5 text-primary" />
        Weather Layers
      </Label>
      
      {/* Layer Type Selector */}
      <div className="flex gap-2 mb-4">
        <Button
          variant={activeLayerType === "forecast" ? "default" : "outline"}
          size="sm"
          onClick={() => onLayerTypeChange("forecast")}
          className="flex-1 transition-all"
        >
          <CloudRain className="w-4 h-4 mr-1" />
          Forecast
        </Button>
        <Button
          variant={activeLayerType === "satellite" ? "default" : "outline"}
          size="sm"
          onClick={() => onLayerTypeChange("satellite")}
          className="flex-1 transition-all"
        >
          <Satellite className="w-4 h-4 mr-1" />
          Satellite
        </Button>
      </div>

      {/* Forecast Layers */}
      {activeLayerType === "forecast" && (
        <div className="space-y-1.5 mb-4">
          <Label className="text-xs text-muted-foreground uppercase tracking-wide mb-2 block">Select Layer</Label>
          {forecastLayers.map((layer) => {
            const Icon = layer.icon;
            return (
              <Button
                key={layer.id}
                variant={activeForecastLayer === layer.id ? "secondary" : "ghost"}
                size="sm"
                onClick={() => onForecastLayerChange(layer.id)}
                className={cn(
                  "w-full justify-start transition-all hover:scale-[1.02]",
                  activeForecastLayer === layer.id && "bg-primary/20 border border-primary/50 shadow-sm"
                )}
              >
                <Icon className="w-4 h-4 mr-2 text-primary" />
                {layer.label}
              </Button>
            );
          })}
        </div>
      )}

      {/* Satellite Layers */}
      {activeLayerType === "satellite" && (
        <div className="space-y-1.5 mb-4">
          <Label className="text-xs text-muted-foreground uppercase tracking-wide mb-2 block">Select View</Label>
          {satelliteLayers.map((layer) => (
            <Button
              key={layer.id}
              variant={activeSatelliteLayer === layer.id ? "secondary" : "ghost"}
              size="sm"
              onClick={() => onSatelliteLayerChange(layer.id)}
              className={cn(
                "w-full justify-start transition-all hover:scale-[1.02]",
                activeSatelliteLayer === layer.id && "bg-primary/20 border border-primary/50 shadow-sm"
              )}
            >
              <Satellite className="w-4 h-4 mr-2 text-primary" />
              {layer.label}
            </Button>
          ))}
        </div>
      )}

      {/* Radar Overlay Toggle */}
      <div className="mb-4 pt-3 border-t border-border">
        <Label className="text-xs text-muted-foreground uppercase tracking-wide mb-2 block">Additional Overlays</Label>
        <Button
          variant={showRadar ? "secondary" : "outline"}
          size="sm"
          onClick={() => onRadarToggle(!showRadar)}
          className={cn(
            "w-full transition-all",
            showRadar && "bg-primary/20 border-primary/50"
          )}
        >
          <CloudRainWind className="w-4 h-4 mr-2" />
          {showRadar ? "Hide" : "Show"} Rain Radar
        </Button>
      </div>

      {/* Opacity Slider */}
      <div className="pt-3 border-t border-border">
        <Label htmlFor="layer-opacity-slider" className="text-xs text-muted-foreground mb-2 block flex items-center justify-between">
          <span className="uppercase tracking-wide">Layer Opacity</span>
          <span className="text-primary font-mono">{Math.round(opacity * 100)}%</span>
        </Label>
        <Slider
          id="layer-opacity-slider"
          value={[opacity * 100]}
          onValueChange={(value) => onOpacityChange(value[0] / 100)}
          max={100}
          step={5}
          className="cursor-pointer"
        />
      </div>
    </Card>
  );
};
