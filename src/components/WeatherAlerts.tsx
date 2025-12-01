import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Info, AlertCircle } from "lucide-react";
import type { WeatherAlert } from "@/lib/weather-api";
import { Badge } from "@/components/ui/badge";

interface WeatherAlertsProps {
  alerts: WeatherAlert[];
}

export const WeatherAlerts = ({ alerts }: WeatherAlertsProps) => {
  if (alerts.length === 0) {
    return null;
  }

  const getSeverityIcon = (severity: WeatherAlert['severity']) => {
    switch (severity) {
      case 'severe':
        return <AlertCircle className="h-5 w-5" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5" />;
      case 'info':
        return <Info className="h-5 w-5" />;
    }
  };

  const getSeverityColor = (severity: WeatherAlert['severity']) => {
    switch (severity) {
      case 'severe':
        return 'bg-destructive/15 border-destructive text-destructive';
      case 'warning':
        return 'bg-yellow-500/15 border-yellow-500 text-yellow-600 dark:text-yellow-400';
      case 'info':
        return 'bg-blue-500/15 border-blue-500 text-blue-600 dark:text-blue-400';
    }
  };

  const getSeverityBadge = (severity: WeatherAlert['severity']) => {
    switch (severity) {
      case 'severe':
        return <Badge variant="destructive">Severe</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600 text-black">Warning</Badge>;
      case 'info':
        return <Badge className="bg-blue-500 hover:bg-blue-600">Info</Badge>;
    }
  };

  return (
    <div className="space-y-3">
      {alerts.map((alert) => (
        <Alert key={alert.id} className={getSeverityColor(alert.severity)}>
          <div className="flex items-start gap-3">
            <div className="mt-0.5">
              {getSeverityIcon(alert.severity)}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <AlertTitle className="mb-0">{alert.title}</AlertTitle>
                {getSeverityBadge(alert.severity)}
              </div>
              <AlertDescription>{alert.description}</AlertDescription>
            </div>
          </div>
        </Alert>
      ))}
    </div>
  );
};
