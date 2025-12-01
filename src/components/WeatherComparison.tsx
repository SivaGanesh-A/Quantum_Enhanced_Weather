import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { fetchWeatherData, type WeatherData } from "@/lib/weather-api";
import { getWeatherIcon } from "@/lib/weather-icons";
import { Skeleton } from "@/components/ui/skeleton";
import { X, MapPin } from "lucide-react";

interface SavedLocation {
  name: string;
  lat: number;
  lon: number;
}

interface WeatherComparison extends SavedLocation {
  weather: WeatherData | null;
  loading: boolean;
}

export const WeatherComparison = () => {
  const [locations, setLocations] = useState<WeatherComparison[]>([]);

  useEffect(() => {
    const savedLocations = localStorage.getItem("savedLocations");
    if (savedLocations) {
      const parsed: SavedLocation[] = JSON.parse(savedLocations);
      const comparisons = parsed.slice(0, 4).map((loc) => ({
        ...loc,
        weather: null,
        loading: true,
      }));
      setLocations(comparisons);

      // Fetch weather for each location
      comparisons.forEach((loc, index) => {
        fetchWeatherData(loc.lat, loc.lon)
          .then((weather) => {
            setLocations((prev) =>
              prev.map((l, i) => (i === index ? { ...l, weather, loading: false } : l))
            );
          })
          .catch(() => {
            setLocations((prev) =>
              prev.map((l, i) => (i === index ? { ...l, loading: false } : l))
            );
          });
      });
    }
  }, []);

  const removeLocation = (index: number) => {
    setLocations((prev) => prev.filter((_, i) => i !== index));
  };

  if (locations.length === 0) {
    return (
      <Card className="p-6 bg-card">
        <h3 className="text-xl font-semibold mb-4">Location Comparison</h3>
        <p className="text-muted-foreground">
          Save multiple locations to compare their weather conditions side by side.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-card">
      <h3 className="text-xl font-semibold mb-4">Location Comparison</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {locations.map((location, index) => {
          const WeatherIcon = location.weather
            ? getWeatherIcon(location.weather.weatherCode)
            : MapPin;

          return (
            <div key={index} className="bg-muted/50 rounded-lg p-4 relative">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-6 w-6"
                onClick={() => removeLocation(index)}
              >
                <X className="w-4 h-4" />
              </Button>

              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-4 h-4 text-primary" />
                <h4 className="font-semibold text-sm">{location.name}</h4>
              </div>

              {location.loading ? (
                <div className="space-y-2">
                  <Skeleton className="h-12 w-12" />
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ) : location.weather ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <WeatherIcon className="w-12 h-12 text-primary" />
                    <div>
                      <div className="text-3xl font-bold">
                        {location.weather.temperature.toFixed(1)}°C
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Feels {location.weather.feelsLike.toFixed(1)}°C
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Humidity</span>
                      <span className="font-medium">{location.weather.humidity}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Wind</span>
                      <span className="font-medium">{location.weather.windSpeed.toFixed(1)} km/h</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Pressure</span>
                      <span className="font-medium">{location.weather.pressure.toFixed(0)} hPa</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">UV Index</span>
                      <span className="font-medium">{location.weather.uvIndex.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Failed to load weather data</p>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
};
