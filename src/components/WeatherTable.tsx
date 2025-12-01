import { Card } from "@/components/ui/card";
import { getWeatherIcon, getWeatherDescription, getUVLevel } from "@/lib/weather-icons";
import { Sunrise, Sunset, Eye, Thermometer } from "lucide-react";

interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  pressure: number;
  rainfall: number;
  cloudCover: number;
  feelsLike: number;
  uvIndex: number;
  visibility: number;
  sunrise: string;
  sunset: string;
  weatherCode: number;
}

interface WeatherTableProps {
  data: WeatherData | null;
  loading: boolean;
}

export const WeatherTable = ({ data, loading }: WeatherTableProps) => {
  if (loading) {
    return (
      <Card className="p-6 bg-card">
        <div className="animate-pulse space-y-4">
          <div className="h-20 bg-muted rounded"></div>
          <div className="grid grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className="p-6 bg-card">
        <p className="text-muted-foreground text-center">No weather data available</p>
      </Card>
    );
  }

  const WeatherIcon = getWeatherIcon(data.weatherCode);
  const weatherDesc = getWeatherDescription(data.weatherCode);
  const uvLevel = getUVLevel(data.uvIndex);
  
  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <Card className="p-6 bg-card space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Live Weather</h2>
        <div className="flex items-center gap-2 text-muted-foreground">
          <WeatherIcon className="w-8 h-8" />
          <span className="text-lg">{weatherDesc}</span>
        </div>
      </div>
      
      <div className="flex items-baseline gap-2">
        <span className="text-7xl font-bold">{data.temperature.toFixed(1)}</span>
        <span className="text-4xl text-muted-foreground">°C</span>
      </div>

      <div className="flex items-center gap-2 text-muted-foreground">
        <Thermometer className="w-5 h-5" />
        <span>Feels like {data.feelsLike.toFixed(1)}°C</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <div className="space-y-1 p-3 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground">Humidity</p>
          <p className="text-2xl font-semibold">{data.humidity}<span className="text-base text-muted-foreground">%</span></p>
        </div>
        
        <div className="space-y-1 p-3 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground">Wind Speed</p>
          <p className="text-2xl font-semibold">{data.windSpeed.toFixed(1)}<span className="text-base text-muted-foreground">km/h</span></p>
        </div>
        
        <div className="space-y-1 p-3 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground">Pressure</p>
          <p className="text-2xl font-semibold">{Math.round(data.pressure)}<span className="text-base text-muted-foreground">hPa</span></p>
        </div>
        
        <div className="space-y-1 p-3 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground">Rainfall</p>
          <p className="text-2xl font-semibold">{data.rainfall.toFixed(1)}<span className="text-base text-muted-foreground">mm</span></p>
        </div>
        
        <div className="space-y-1 p-3 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground">Cloud Cover</p>
          <p className="text-2xl font-semibold">{Math.round(data.cloudCover)}<span className="text-base text-muted-foreground">%</span></p>
        </div>
        
        <div className="space-y-1 p-3 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <Eye className="w-4 h-4" />
            Visibility
          </p>
          <p className="text-2xl font-semibold">{data.visibility.toFixed(1)}<span className="text-base text-muted-foreground">km</span></p>
        </div>
        
        <div className="space-y-1 p-3 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground">UV Index</p>
          <p className="text-2xl font-semibold">{data.uvIndex.toFixed(1)}<span className={`text-base ml-2 ${uvLevel.color}`}>{uvLevel.level}</span></p>
        </div>
        
        <div className="space-y-1 p-3 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <Sunrise className="w-4 h-4" />
            Sunrise
          </p>
          <p className="text-xl font-semibold">{formatTime(data.sunrise)}</p>
        </div>
        
        <div className="space-y-1 p-3 bg-muted/50 rounded-lg col-span-2 md:col-span-1">
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <Sunset className="w-4 h-4" />
            Sunset
          </p>
          <p className="text-xl font-semibold">{formatTime(data.sunset)}</p>
        </div>
      </div>
    </Card>
  );
};
