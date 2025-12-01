import { Card } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { HourlyForecastData } from "@/lib/weather-api";
import { getWeatherIcon } from "@/lib/weather-icons";
import { Droplets, Wind } from "lucide-react";

interface HourlyForecastProps {
  data: HourlyForecastData[];
  loading: boolean;
}

export const HourlyForecast = ({ data, loading }: HourlyForecastProps) => {
  if (loading) {
    return (
      <Card className="p-6 bg-card">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-32 bg-muted rounded"></div>
          <div className="flex gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-32 w-24 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className="p-6 bg-card">
        <p className="text-muted-foreground text-center">No hourly forecast data available</p>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-card space-y-4">
      <h2 className="text-2xl font-bold">24-Hour Forecast</h2>
      
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-4 pb-4">
          {data.map((hour, index) => {
            const WeatherIcon = getWeatherIcon(hour.weatherCode);
            return (
              <div
                key={index}
                className="flex flex-col items-center gap-2 p-4 bg-muted/50 rounded-lg min-w-[100px]"
              >
                <span className="text-sm font-medium">{hour.time}</span>
                <WeatherIcon className="w-8 h-8 text-primary" />
                <span className="text-2xl font-bold">{hour.temperature.toFixed(1)}°</span>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Droplets className="w-3 h-3" />
                  <span>{hour.precipitation.toFixed(1)}mm</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Wind className="w-3 h-3" />
                  <span>{hour.windSpeed.toFixed(0)}km/h</span>
                </div>
              </div>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </Card>
  );
};
