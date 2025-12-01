import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Star, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";

export interface SavedLocation {
  id: string;
  name: string;
  country: string;
  lat: number;
  lon: number;
}

interface SavedLocationsProps {
  currentLocation: { lat: number; lon: number };
  onLocationSelect: (lat: number, lon: number) => void;
  currentLocationName?: string;
}

export const SavedLocations = ({
  currentLocation,
  onLocationSelect,
  currentLocationName,
}: SavedLocationsProps) => {
  const [savedLocations, setSavedLocations] = useState<SavedLocation[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("savedLocations");
    if (saved) {
      setSavedLocations(JSON.parse(saved));
    }
  }, []);

  const saveCurrentLocation = () => {
    if (!currentLocationName) return;

    const newLocation: SavedLocation = {
      id: Date.now().toString(),
      name: currentLocationName.split(",")[0],
      country: currentLocationName.split(",").pop()?.trim() || "",
      lat: currentLocation.lat,
      lon: currentLocation.lon,
    };

    const updated = [...savedLocations, newLocation];
    setSavedLocations(updated);
    localStorage.setItem("savedLocations", JSON.stringify(updated));
  };

  const removeLocation = (id: string) => {
    const updated = savedLocations.filter((loc) => loc.id !== id);
    setSavedLocations(updated);
    localStorage.setItem("savedLocations", JSON.stringify(updated));
  };

  const isCurrentLocationSaved = savedLocations.some(
    (loc) =>
      Math.abs(loc.lat - currentLocation.lat) < 0.01 &&
      Math.abs(loc.lon - currentLocation.lon) < 0.01
  );

  return (
    <Card className="p-6 bg-card space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Star className="w-6 h-6" />
          Saved Locations
        </h2>
        {currentLocationName && !isCurrentLocationSaved && (
          <Button onClick={saveCurrentLocation} size="sm" variant="outline">
            <Star className="w-4 h-4 mr-2" />
            Save Current
          </Button>
        )}
      </div>

      {savedLocations.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">
          No saved locations yet. Save your favorite cities to quickly access their weather.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {savedLocations.map((location) => (
            <div
              key={location.id}
              className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
            >
              <button
                onClick={() => onLocationSelect(location.lat, location.lon)}
                className="flex items-center gap-3 flex-1 text-left"
              >
                <MapPin className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-semibold">{location.name}</p>
                  <p className="text-sm text-muted-foreground">{location.country}</p>
                </div>
              </button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeLocation(location.id)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
