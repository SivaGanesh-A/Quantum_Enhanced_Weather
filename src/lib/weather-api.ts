export interface WeatherData {
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

export interface HourlyForecastData {
  time: string;
  temperature: number;
  precipitation: number;
  windSpeed: number;
  weatherCode: number;
}

export interface ForecastData {
  date: string;
  temperature: number;
  rainfall: number;
}

export interface GeocodingResult {
  name: string;
  latitude: number;
  longitude: number;
  country: string;
}

/**
 * Fetch current weather data from Open-Meteo API
 */
export const fetchWeatherData = async (lat: number, lon: number): Promise<WeatherData> => {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,pressure_msl,cloud_cover,wind_speed_10m,uv_index,visibility,weather_code&daily=sunrise,sunset&timezone=auto`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch weather data");
  }
  
  const data = await response.json();
  const current = data.current;
  const daily = data.daily;
  
  return {
    temperature: current.temperature_2m,
    humidity: current.relative_humidity_2m,
    windSpeed: current.wind_speed_10m,
    pressure: current.pressure_msl,
    rainfall: current.precipitation,
    cloudCover: current.cloud_cover,
    feelsLike: current.apparent_temperature,
    uvIndex: current.uv_index,
    visibility: current.visibility / 1000, // Convert to km
    sunrise: daily.sunrise[0],
    sunset: daily.sunset[0],
    weatherCode: current.weather_code,
  };
};

/**
 * Fetch 7-day forecast from Open-Meteo API
 */
export const fetchForecastData = async (lat: number, lon: number): Promise<ForecastData[]> => {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,precipitation_sum&timezone=auto&forecast_days=7`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch forecast data");
  }
  
  const data = await response.json();
  const daily = data.daily;
  
  return daily.time.map((date: string, index: number) => {
    const dateObj = new Date(date);
    const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
    
    return {
      date: dayName,
      temperature: daily.temperature_2m_max[index],
      rainfall: daily.precipitation_sum[index],
    };
  });
};

/**
 * Geocode city name to coordinates using Open-Meteo Geocoding API
 */
export const geocodeCity = async (cityName: string): Promise<GeocodingResult | null> => {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to geocode city");
  }
  
  const data = await response.json();
  
  if (!data.results || data.results.length === 0) {
    return null;
  }
  
  const result = data.results[0];
  return {
    name: result.name,
    latitude: result.latitude,
    longitude: result.longitude,
    country: result.country,
  };
};

/**
 * Fetch 24-hour hourly forecast from Open-Meteo API
 */
export const fetchHourlyForecast = async (lat: number, lon: number): Promise<HourlyForecastData[]> => {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,precipitation,wind_speed_10m,weather_code&timezone=auto&forecast_days=2`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch hourly forecast data");
  }
  
  const data = await response.json();
  const hourly = data.hourly;
  
  // Get next 24 hours
  return hourly.time.slice(0, 24).map((time: string, index: number) => ({
    time: new Date(time).toLocaleTimeString('en-US', { hour: 'numeric', hour12: true }),
    temperature: hourly.temperature_2m[index],
    precipitation: hourly.precipitation[index],
    windSpeed: hourly.wind_speed_10m[index],
    weatherCode: hourly.weather_code[index],
  }));
};

export interface HistoricalWeatherData {
  date: string;
  temperature: number;
  humidity: number;
  precipitation: number;
}

export interface WeatherAlert {
  id: string;
  severity: 'info' | 'warning' | 'severe';
  title: string;
  description: string;
  metric: string;
  value: number;
}

/**
 * Fetch historical weather data from Open-Meteo API
 */
export const fetchHistoricalWeather = async (
  lat: number,
  lon: number,
  days: number = 7
): Promise<HistoricalWeatherData[]> => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const formatDate = (date: Date) => date.toISOString().split('T')[0];

  const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${formatDate(startDate)}&end_date=${formatDate(endDate)}&daily=temperature_2m_mean,relative_humidity_2m_mean,precipitation_sum&timezone=auto`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch historical weather data");
  }

  const data = await response.json();
  const daily = data.daily;

  return daily.time.map((date: string, index: number) => ({
    date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    temperature: daily.temperature_2m_mean[index],
    humidity: daily.relative_humidity_2m_mean[index],
    precipitation: daily.precipitation_sum[index],
  }));
};

/**
 * Analyze weather data for alerts
 */
export const analyzeWeatherAlerts = (weather: WeatherData): WeatherAlert[] => {
  const alerts: WeatherAlert[] = [];

  // High temperature alert
  if (weather.temperature > 35) {
    alerts.push({
      id: 'high-temp',
      severity: weather.temperature > 40 ? 'severe' : 'warning',
      title: 'High Temperature Alert',
      description: `Extreme heat detected. Temperature is ${weather.temperature.toFixed(1)}°C`,
      metric: 'Temperature',
      value: weather.temperature,
    });
  }

  // Low temperature alert
  if (weather.temperature < 0) {
    alerts.push({
      id: 'low-temp',
      severity: weather.temperature < -10 ? 'severe' : 'warning',
      title: 'Freezing Temperature Alert',
      description: `Freezing conditions detected. Temperature is ${weather.temperature.toFixed(1)}°C`,
      metric: 'Temperature',
      value: weather.temperature,
    });
  }

  // High wind speed alert
  if (weather.windSpeed > 50) {
    alerts.push({
      id: 'high-wind',
      severity: weather.windSpeed > 80 ? 'severe' : 'warning',
      title: 'High Wind Alert',
      description: `Strong winds detected. Wind speed is ${weather.windSpeed.toFixed(1)} km/h`,
      metric: 'Wind Speed',
      value: weather.windSpeed,
    });
  }

  // Heavy rainfall alert
  if (weather.rainfall > 10) {
    alerts.push({
      id: 'heavy-rain',
      severity: weather.rainfall > 50 ? 'severe' : 'warning',
      title: 'Heavy Rainfall Alert',
      description: `Heavy precipitation detected. Rainfall is ${weather.rainfall.toFixed(1)} mm`,
      metric: 'Rainfall',
      value: weather.rainfall,
    });
  }

  // High UV index alert
  if (weather.uvIndex > 8) {
    alerts.push({
      id: 'high-uv',
      severity: weather.uvIndex > 11 ? 'severe' : 'warning',
      title: 'High UV Index Alert',
      description: `Extreme UV levels detected. UV index is ${weather.uvIndex.toFixed(1)}`,
      metric: 'UV Index',
      value: weather.uvIndex,
    });
  }

  // Low visibility alert
  if (weather.visibility < 1) {
    alerts.push({
      id: 'low-visibility',
      severity: weather.visibility < 0.5 ? 'severe' : 'warning',
      title: 'Low Visibility Alert',
      description: `Poor visibility conditions. Visibility is ${weather.visibility.toFixed(1)} km`,
      metric: 'Visibility',
      value: weather.visibility,
    });
  }

  return alerts;
};

/**
 * Get user's current location using browser geolocation API
 */
export const getUserLocation = (): Promise<{ lat: number; lon: number }> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
      },
      (error) => {
        reject(error);
      }
    );
  });
};
