import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { SearchBox } from "@/components/SearchBox";
import { WeatherMapWithLayers } from "@/components/WeatherMapWithLayers";
import { RadarOverlay } from "@/components/RadarOverlay";
import { AQICard } from "@/components/AQICard";
import { SettingsPanel } from "@/components/SettingsPanel";
import { WeatherTable } from "@/components/WeatherTable";
import { ForecastChart } from "@/components/ForecastChart";
import { HourlyForecast } from "@/components/HourlyForecast";
import { SavedLocations } from "@/components/SavedLocations";
import { HistoricalChart } from "@/components/HistoricalChart";
import { WeatherComparison } from "@/components/WeatherComparison";
import { WeatherAlerts } from "@/components/WeatherAlerts";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  fetchWeatherData,
  fetchForecastData,
  fetchHourlyForecast,
  fetchHistoricalWeather,
  analyzeWeatherAlerts,
  geocodeCity,
  getUserLocation,
  type WeatherData,
  type ForecastData,
  type HourlyForecastData,
  type HistoricalWeatherData,
  type WeatherAlert,
} from "@/lib/weather-api";
import { Menu, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

const Index = () => {
  const [activeView, setActiveView] = useState<"forecast" | "map" | "climate" | "historical" | "comparison" | "radar" | "settings">("forecast");
  const [location, setLocation] = useState<{ lat: number; lon: number }>({
    lat: 17.385,
    lon: 78.4867,
  });
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [forecastData, setForecastData] = useState<ForecastData[]>([]);
  const [hourlyData, setHourlyData] = useState<HourlyForecastData[]>([]);
  const [historicalData, setHistoricalData] = useState<HistoricalWeatherData[]>([]);
  const [weatherAlerts, setWeatherAlerts] = useState<WeatherAlert[]>([]);
  const [locationName, setLocationName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMapFullscreen, setIsMapFullscreen] = useState(false);
  const { toast } = useToast();

  // Fetch weather data when location changes
  useEffect(() => {
    const loadWeatherData = async () => {
      setLoading(true);
      try {
        const [weather, forecast, hourly, historical] = await Promise.all([
          fetchWeatherData(location.lat, location.lon),
          fetchForecastData(location.lat, location.lon),
          fetchHourlyForecast(location.lat, location.lon),
          fetchHistoricalWeather(location.lat, location.lon, 7),
        ]);
        setWeatherData(weather);
        setForecastData(forecast);
        setHourlyData(hourly);
        setHistoricalData(historical);
        
        // Analyze for weather alerts
        const alerts = analyzeWeatherAlerts(weather);
        setWeatherAlerts(alerts);
        
        // Reverse geocode to get location name using Nominatim
        try {
          const reverseGeocodeUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${location.lat}&lon=${location.lon}&zoom=10&addressdetails=1`;
          const reverseResponse = await fetch(reverseGeocodeUrl, {
            headers: {
              'User-Agent': 'WeatherDashboard/1.0'
            }
          });
          if (reverseResponse.ok) {
            const reverseData = await reverseResponse.json();
            const address = reverseData.address;
            const city = address.city || address.town || address.village || address.county || address.state;
            const country = address.country;
            if (city && country) {
              setLocationName(`${city}, ${country}`);
            } else if (reverseData.display_name) {
              // Fallback to display name if city/country not available
              const parts = reverseData.display_name.split(',');
              setLocationName(parts.slice(0, 2).join(','));
            }
          }
        } catch (reverseError) {
          console.error('Reverse geocoding failed:', reverseError);
          // Set a fallback location name with coordinates
          setLocationName(`Location (${location.lat.toFixed(2)}°, ${location.lon.toFixed(2)}°)`);
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch weather data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadWeatherData();
  }, [location, toast]);

  // Try to get user's location on mount
  useEffect(() => {
    const detectLocation = async () => {
      try {
        const loc = await getUserLocation();
        setLocation(loc);
        toast({
          title: "Location detected",
          description: "Showing weather for your current location",
        });
      } catch (error) {
        // Silently fail and use default location (Hyderabad)
        console.log('Failed to detect location, using default');
      }
    };
    detectLocation();
  }, [toast]);

  const handleSearch = async (cityName: string) => {
    try {
      const result = await geocodeCity(cityName);
      if (result) {
        setLocation({ lat: result.latitude, lon: result.longitude });
        setLocationName(`${result.name}, ${result.country}`);
        toast({
          title: "Location updated",
          description: `Showing weather for ${result.name}, ${result.country}`,
        });
      } else {
        toast({
          title: "City not found",
          description: "Please try a different city name.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Search failed",
        description: "Failed to search for city. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleMapClick = (lat: number, lon: number) => {
    setLocation({ lat, lon });
    toast({
      title: "Location updated",
      description: `Coordinates: ${lat.toFixed(4)}, ${lon.toFixed(4)}`,
    });
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile Menu Button */}
      {!isMapFullscreen && (
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-4 left-4 z-50 md:hidden"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <Menu className="w-6 h-6" />
        </Button>
      )}

      {/* Sidebar - Hidden in fullscreen mode */}
      {!isMapFullscreen && (
        <div className={`${sidebarOpen ? "block" : "hidden"} md:block fixed md:relative inset-0 z-40 md:z-0`}>
          <Sidebar activeView={activeView} onViewChange={(view) => {
            setActiveView(view);
            setSidebarOpen(false);
          }} />
        </div>
      )}

      {/* Main Content */}
      <main className={`flex-1 ${isMapFullscreen ? 'p-0' : 'p-6 md:p-8'} space-y-6 overflow-auto`}>
        {/* Header with Location and Search - Hidden in fullscreen mode */}
        {!isMapFullscreen && (
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              <div>
                <h2 className="text-2xl font-bold">{locationName || "Loading location..."}</h2>
                <p className="text-sm text-muted-foreground">
                  {location.lat.toFixed(4)}°, {location.lon.toFixed(4)}°
                </p>
              </div>
            </div>
            <div className="max-w-md w-full md:w-auto">
              <SearchBox onSearch={handleSearch} />
            </div>
          </div>
        )}

        {/* Forecast View */}
        {activeView === "forecast" && (
          <>
            {weatherAlerts.length > 0 && <WeatherAlerts alerts={weatherAlerts} />}
            <WeatherTable data={weatherData} loading={loading} />
            <HourlyForecast data={hourlyData} loading={loading} />
            <ForecastChart data={forecastData} loading={loading} />
            <SavedLocations 
              currentLocation={location} 
              onLocationSelect={(lat, lon) => setLocation({ lat, lon })}
              currentLocationName={locationName}
            />
          </>
        )}

        {/* Weather Map View */}
        {activeView === "map" && (
          <Card className={`${isMapFullscreen ? 'h-screen' : 'h-[calc(100vh-12rem)]'} bg-card ${isMapFullscreen ? 'p-0 rounded-none' : 'p-4'} animate-fade-in`}>
            <WeatherMapWithLayers
              center={[location.lat, location.lon]}
              onMapClick={handleMapClick}
              isFullscreen={isMapFullscreen}
              onToggleFullscreen={() => setIsMapFullscreen(!isMapFullscreen)}
            />
          </Card>
        )}

        {/* Radar View */}
        {activeView === "radar" && (
          <Card className="h-[calc(100vh-12rem)] bg-card p-4 animate-fade-in">
            <RadarOverlay center={[location.lat, location.lon]} />
          </Card>
        )}

        {/* Historical Data View */}
        {activeView === "historical" && (
          <>
            <HistoricalChart data={historicalData} loading={loading} />
            <Card className="p-6 bg-card">
              <h3 className="text-xl font-semibold mb-4">About Historical Data</h3>
              <p className="text-muted-foreground">
                Historical weather data shows trends over the past 7 days, including temperature,
                humidity, and precipitation patterns. This data can help you understand recent
                weather patterns and trends in your selected location.
              </p>
            </Card>
          </>
        )}

        {/* Comparison View */}
        {activeView === "comparison" && (
          <WeatherComparison />
        )}

        {/* Settings View */}
        {activeView === "settings" && (
          <SettingsPanel />
        )}

        {/* Climate Info */}
        {activeView === "climate" && (
          <>
            <AQICard lat={location.lat} lon={location.lon} />
            <Card className="p-6 bg-card space-y-6 animate-fade-in">
              <h2 className="text-2xl font-bold">Climate Information</h2>
            
            <div className="bg-muted/50 p-4 rounded-lg">
              <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Current Location
              </h3>
              <div className="space-y-2">
                <p className="text-lg font-medium">{locationName || "Unknown location"}</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Latitude:</span>
                    <span className="ml-2 font-mono">{location.lat.toFixed(6)}°</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Longitude:</span>
                    <span className="ml-2 font-mono">{location.lon.toFixed(6)}°</span>
                  </div>
                </div>
              </div>
            </div>

            {weatherData && (
              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="text-xl font-semibold mb-3">Current Conditions Summary</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 px-3">Metric</th>
                        <th className="text-right py-2 px-3">Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-border/50">
                        <td className="py-2 px-3 text-muted-foreground">Temperature</td>
                        <td className="py-2 px-3 text-right font-medium">{weatherData.temperature.toFixed(1)}°C</td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="py-2 px-3 text-muted-foreground">Feels Like</td>
                        <td className="py-2 px-3 text-right font-medium">{weatherData.feelsLike.toFixed(1)}°C</td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="py-2 px-3 text-muted-foreground">Humidity</td>
                        <td className="py-2 px-3 text-right font-medium">{weatherData.humidity}%</td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="py-2 px-3 text-muted-foreground">Wind Speed</td>
                        <td className="py-2 px-3 text-right font-medium">{weatherData.windSpeed.toFixed(1)} km/h</td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="py-2 px-3 text-muted-foreground">Pressure</td>
                        <td className="py-2 px-3 text-right font-medium">{weatherData.pressure.toFixed(0)} hPa</td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="py-2 px-3 text-muted-foreground">UV Index</td>
                        <td className="py-2 px-3 text-right font-medium">{weatherData.uvIndex.toFixed(1)}</td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="py-2 px-3 text-muted-foreground">Visibility</td>
                        <td className="py-2 px-3 text-right font-medium">{weatherData.visibility.toFixed(1)} km</td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="py-2 px-3 text-muted-foreground">Cloud Cover</td>
                        <td className="py-2 px-3 text-right font-medium">{weatherData.cloudCover}%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Data Sources</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Weather Data</h4>
                  <p className="text-sm text-muted-foreground">Open-Meteo API</p>
                  <p className="text-xs text-muted-foreground mt-1">Real-time weather & forecasts</p>
                </div>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Map Tiles</h4>
                  <p className="text-sm text-muted-foreground">OpenStreetMap</p>
                  <p className="text-xs text-muted-foreground mt-1">Interactive map display</p>
                </div>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Geolocation</h4>
                  <p className="text-sm text-muted-foreground">Browser API</p>
                  <p className="text-xs text-muted-foreground mt-1">Auto-detect your location</p>
                </div>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Geocoding</h4>
                  <p className="text-sm text-muted-foreground">Open-Meteo Geocoding</p>
                  <p className="text-xs text-muted-foreground mt-1">City name to coordinates</p>
                </div>
              </div>
            </div>
          </Card>
          </>
        )}
      </main>
    </div>
  );
};

export default Index;
