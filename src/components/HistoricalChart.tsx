import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import type { HistoricalWeatherData } from "@/lib/weather-api";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface HistoricalChartProps {
  data: HistoricalWeatherData[];
  loading?: boolean;
}

export const HistoricalChart = ({ data, loading }: HistoricalChartProps) => {
  const [visibleMetrics, setVisibleMetrics] = useState({
    temperature: true,
    humidity: true,
    precipitation: true,
  });

  const toggleMetric = (metric: keyof typeof visibleMetrics) => {
    setVisibleMetrics(prev => ({ ...prev, [metric]: !prev[metric] }));
  };

  if (loading) {
    return (
      <Card className="p-6 bg-card animate-fade-in">
        <Skeleton className="h-8 w-64 mb-4" />
        <Skeleton className="h-[400px] w-full" />
      </Card>
    );
  }

  const stats = data.length > 0 ? {
    avgTemp: (data.reduce((sum, d) => sum + d.temperature, 0) / data.length).toFixed(1),
    totalPrecip: data.reduce((sum, d) => sum + d.precipitation, 0).toFixed(1),
    avgHumidity: (data.reduce((sum, d) => sum + d.humidity, 0) / data.length).toFixed(0),
  } : null;

  return (
    <Card className="p-6 bg-card animate-fade-in border-2 border-border/50">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <TrendingUp className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-semibold">Historical Weather Trends</h3>
            <p className="text-sm text-muted-foreground">Last {data.length} days analysis</p>
          </div>
        </div>
        <Badge variant="outline" className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {data.length} days
        </Badge>
      </div>

      {/* Quick Stats */}
      {stats && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-gradient-to-br from-muted/50 to-muted/30 p-4 rounded-lg border border-border/30">
            <div className="text-xs text-muted-foreground mb-1">Avg Temperature</div>
            <div className="text-2xl font-bold text-chart-1">{stats.avgTemp}°C</div>
          </div>
          <div className="bg-gradient-to-br from-muted/50 to-muted/30 p-4 rounded-lg border border-border/30">
            <div className="text-xs text-muted-foreground mb-1">Avg Humidity</div>
            <div className="text-2xl font-bold text-chart-2">{stats.avgHumidity}%</div>
          </div>
          <div className="bg-gradient-to-br from-muted/50 to-muted/30 p-4 rounded-lg border border-border/30">
            <div className="text-xs text-muted-foreground mb-1">Total Precipitation</div>
            <div className="text-2xl font-bold text-chart-3">{stats.totalPrecip} mm</div>
          </div>
        </div>
      )}

      {/* Metric Toggle Buttons */}
      <div className="flex gap-2 mb-4">
        <Button
          variant={visibleMetrics.temperature ? "default" : "outline"}
          size="sm"
          onClick={() => toggleMetric("temperature")}
          className="text-xs"
        >
          <div className="w-3 h-3 rounded-full bg-chart-1 mr-2" />
          Temperature
        </Button>
        <Button
          variant={visibleMetrics.humidity ? "default" : "outline"}
          size="sm"
          onClick={() => toggleMetric("humidity")}
          className="text-xs"
        >
          <div className="w-3 h-3 rounded-full bg-chart-2 mr-2" />
          Humidity
        </Button>
        <Button
          variant={visibleMetrics.precipitation ? "default" : "outline"}
          size="sm"
          onClick={() => toggleMetric("precipitation")}
          className="text-xs"
        >
          <div className="w-3 h-3 rounded-full bg-chart-3 mr-2" />
          Precipitation
        </Button>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="date" 
            stroke="hsl(var(--muted-foreground))"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="hsl(var(--muted-foreground))"
            style={{ fontSize: '12px' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
              color: "hsl(var(--foreground))",
            }}
          />
          <Legend 
            wrapperStyle={{
              color: "hsl(var(--foreground))",
            }}
          />
          {visibleMetrics.temperature && (
            <Line
              type="monotone"
              dataKey="temperature"
              stroke="hsl(var(--chart-1))"
              strokeWidth={2}
              name="Temperature (°C)"
              dot={{ fill: "hsl(var(--chart-1))" }}
              animationDuration={800}
            />
          )}
          {visibleMetrics.humidity && (
            <Line
              type="monotone"
              dataKey="humidity"
              stroke="hsl(var(--chart-2))"
              strokeWidth={2}
              name="Humidity (%)"
              dot={{ fill: "hsl(var(--chart-2))" }}
              animationDuration={800}
            />
          )}
          {visibleMetrics.precipitation && (
            <Line
              type="monotone"
              dataKey="precipitation"
              stroke="hsl(var(--chart-3))"
              strokeWidth={2}
              name="Precipitation (mm)"
              dot={{ fill: "hsl(var(--chart-3))" }}
              animationDuration={800}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
};
