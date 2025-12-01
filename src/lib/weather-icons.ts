import {
  Sun,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  Wind,
  type LucideIcon,
} from "lucide-react";

/**
 * Map WMO Weather codes to Lucide icons
 * https://open-meteo.com/en/docs
 */
export const getWeatherIcon = (code: number): LucideIcon => {
  if (code === 0) return Sun; // Clear sky
  if (code <= 3) return Cloud; // Partly cloudy
  if (code <= 49) return CloudFog; // Fog
  if (code <= 59) return CloudDrizzle; // Drizzle
  if (code <= 69) return CloudRain; // Rain
  if (code <= 79) return CloudSnow; // Snow
  if (code <= 84) return CloudRain; // Rain showers
  if (code <= 86) return CloudSnow; // Snow showers
  if (code <= 99) return CloudLightning; // Thunderstorm
  return Cloud; // Default
};

export const getWeatherDescription = (code: number): string => {
  if (code === 0) return "Clear sky";
  if (code === 1) return "Mainly clear";
  if (code === 2) return "Partly cloudy";
  if (code === 3) return "Overcast";
  if (code <= 49) return "Foggy";
  if (code <= 59) return "Drizzle";
  if (code <= 69) return "Rain";
  if (code <= 79) return "Snow";
  if (code <= 84) return "Rain showers";
  if (code <= 86) return "Snow showers";
  if (code <= 99) return "Thunderstorm";
  return "Unknown";
};

export const getUVLevel = (uvIndex: number): { level: string; color: string } => {
  if (uvIndex <= 2) return { level: "Low", color: "text-green-500" };
  if (uvIndex <= 5) return { level: "Moderate", color: "text-yellow-500" };
  if (uvIndex <= 7) return { level: "High", color: "text-orange-500" };
  if (uvIndex <= 10) return { level: "Very High", color: "text-red-500" };
  return { level: "Extreme", color: "text-purple-500" };
};
