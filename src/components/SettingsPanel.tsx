import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Settings as SettingsIcon, Sun, Moon, Monitor } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SettingsConfig {
  tempUnit: "celsius" | "fahrenheit";
  windUnit: "kmh" | "mph";
  pressureUnit: "hpa" | "mmhg";
  theme: "light" | "dark" | "auto";
  enableAnimations: boolean;
  enableMapTransitions: boolean;
}

const defaultSettings: SettingsConfig = {
  tempUnit: "celsius",
  windUnit: "kmh",
  pressureUnit: "hpa",
  theme: "dark",
  enableAnimations: true,
  enableMapTransitions: true,
};

interface SettingsPanelProps {
  onSettingsChange?: (settings: SettingsConfig) => void;
}

export const SettingsPanel = ({ onSettingsChange }: SettingsPanelProps) => {
  const [settings, setSettings] = useState<SettingsConfig>(() => {
    const saved = localStorage.getItem("weatherSettings");
    return saved ? JSON.parse(saved) : defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem("weatherSettings", JSON.stringify(settings));
    onSettingsChange?.(settings);
  }, [settings, onSettingsChange]);

  const updateSetting = <K extends keyof SettingsConfig>(
    key: K,
    value: SettingsConfig[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <Card className="p-6 bg-card animate-fade-in space-y-6">
      <div className="flex items-center gap-3">
        <SettingsIcon className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-bold">Settings</h2>
      </div>

      {/* Unit Preferences */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Unit Preferences</h3>
        
        <div className="space-y-2">
          <Label htmlFor="temp-unit">Temperature</Label>
          <Select
            value={settings.tempUnit}
            onValueChange={(value: "celsius" | "fahrenheit") =>
              updateSetting("tempUnit", value)
            }
          >
            <SelectTrigger id="temp-unit">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="celsius">Celsius (°C)</SelectItem>
              <SelectItem value="fahrenheit">Fahrenheit (°F)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="wind-unit">Wind Speed</Label>
          <Select
            value={settings.windUnit}
            onValueChange={(value: "kmh" | "mph") =>
              updateSetting("windUnit", value)
            }
          >
            <SelectTrigger id="wind-unit">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="kmh">km/h</SelectItem>
              <SelectItem value="mph">mph</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="pressure-unit">Pressure</Label>
          <Select
            value={settings.pressureUnit}
            onValueChange={(value: "hpa" | "mmhg") =>
              updateSetting("pressureUnit", value)
            }
          >
            <SelectTrigger id="pressure-unit">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hpa">hPa</SelectItem>
              <SelectItem value="mmhg">mmHg</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Theme Options */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Theme</h3>
        <div className="grid grid-cols-3 gap-2">
          <Button
            variant={settings.theme === "light" ? "default" : "outline"}
            onClick={() => updateSetting("theme", "light")}
            className="flex flex-col items-center gap-2 h-auto py-3"
          >
            <Sun className="w-5 h-5" />
            <span className="text-xs">Light</span>
          </Button>
          <Button
            variant={settings.theme === "dark" ? "default" : "outline"}
            onClick={() => updateSetting("theme", "dark")}
            className="flex flex-col items-center gap-2 h-auto py-3"
          >
            <Moon className="w-5 h-5" />
            <span className="text-xs">Dark</span>
          </Button>
          <Button
            variant={settings.theme === "auto" ? "default" : "outline"}
            onClick={() => updateSetting("theme", "auto")}
            className="flex flex-col items-center gap-2 h-auto py-3"
          >
            <Monitor className="w-5 h-5" />
            <span className="text-xs">Auto</span>
          </Button>
        </div>
      </div>

      {/* Animation Preferences */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Animations</h3>
        
        <div className="flex items-center justify-between">
          <Label htmlFor="enable-animations" className="cursor-pointer">
            Enable UI Animations
          </Label>
          <Switch
            id="enable-animations"
            checked={settings.enableAnimations}
            onCheckedChange={(checked) => updateSetting("enableAnimations", checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="enable-map-transitions" className="cursor-pointer">
            Enable Map Transitions
          </Label>
          <Switch
            id="enable-map-transitions"
            checked={settings.enableMapTransitions}
            onCheckedChange={(checked) => updateSetting("enableMapTransitions", checked)}
          />
        </div>
      </div>

      {/* Reset Button */}
      <div className="pt-4 border-t border-border">
        <Button
          variant="outline"
          onClick={() => setSettings(defaultSettings)}
          className="w-full"
        >
          Reset to Defaults
        </Button>
      </div>
    </Card>
  );
};
