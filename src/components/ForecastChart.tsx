import { Card } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface ForecastData {
  date: string;
  temperature: number;
  rainfall: number;
}

interface ForecastChartProps {
  data: ForecastData[];
  loading: boolean;
}

export const ForecastChart = ({ data, loading }: ForecastChartProps) => {
  if (loading) {
    return (
      <Card className="p-6 bg-card">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-muted rounded"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className="p-6 bg-card">
        <h2 className="text-2xl font-bold mb-4">7-Day Forecast</h2>
        <p className="text-muted-foreground text-center">No forecast data available</p>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-card">
      <h2 className="text-2xl font-bold mb-6">7-Day Forecast</h2>
      
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="date" 
            stroke="hsl(var(--muted-foreground))"
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
          />
          <YAxis 
            yAxisId="left"
            stroke="hsl(var(--muted-foreground))"
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
            label={{ value: 'Temperature °C', angle: -90, position: 'insideLeft', fill: 'hsl(var(--muted-foreground))' }}
          />
          <YAxis 
            yAxisId="right" 
            orientation="right"
            stroke="hsl(var(--chart-1))"
            tick={{ fill: 'hsl(var(--chart-1))' }}
            label={{ value: 'Precipitation mm', angle: 90, position: 'insideRight', fill: 'hsl(var(--chart-1))' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'hsl(var(--card))', 
              border: '1px solid hsl(var(--border))',
              borderRadius: '0.5rem'
            }}
          />
          <Legend />
          <Bar yAxisId="right" dataKey="rainfall" fill="hsl(var(--chart-1))" name="Rainfall (mm)" />
          <Line 
            yAxisId="left" 
            type="monotone" 
            dataKey="temperature" 
            stroke="hsl(var(--chart-1))" 
            strokeWidth={2}
            dot={{ fill: 'hsl(var(--chart-1))', r: 4 }}
            name="Temperature (°C)"
          />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
};
