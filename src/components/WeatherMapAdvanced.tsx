import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Button } from "@/components/ui/button";
import { Maximize2, Minimize2, Wind } from "lucide-react";

// Fix for default marker icon
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface WeatherMapAdvancedProps {
  center: LatLngExpression;
  onMapClick: (lat: number, lon: number) => void;
  weatherCondition?: string;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

const MapClickHandler = ({ onMapClick }: { onMapClick: (lat: number, lon: number) => void }) => {
  useMapEvents({
    click: (e) => {
      // Normalize longitude to -180 to 180 range
      let lon = e.latlng.lng;
      while (lon > 180) lon -= 360;
      while (lon < -180) lon += 360;
      onMapClick(e.latlng.lat, lon);
    },
  });
  return null;
};

// Weather animation particles component
const WeatherAnimations = ({ condition }: { condition: string }) => {
  const [particles, setParticles] = useState<Array<{ id: number; left: number; delay: number }>>([]);

  useEffect(() => {
    if (condition === "rain" || condition === "wind") {
      const count = condition === "rain" ? 100 : 50;
      const newParticles = Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 3,
      }));
      setParticles(newParticles);
    } else {
      setParticles([]);
    }
  }, [condition]);

  if (condition === "rain") {
    return (
      <div className="absolute inset-0 pointer-events-none z-[1000] overflow-hidden">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="rain-drop"
            style={{
              left: `${particle.left}%`,
              animationDelay: `${particle.delay}s`,
            }}
          />
        ))}
      </div>
    );
  }

  if (condition === "wind") {
    return (
      <div className="absolute inset-0 pointer-events-none z-[1000] overflow-hidden">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="wind-particle"
            style={{
              top: `${particle.left}%`,
              animationDelay: `${particle.delay}s`,
            }}
          />
        ))}
      </div>
    );
  }

  return null;
};

// Auto-select layer based on weather condition
const getWeatherLayer = (weatherCondition?: string): string => {
  if (!weatherCondition) return "temp";
  
  const condition = weatherCondition.toLowerCase();
  if (condition.includes("rain") || condition.includes("drizzle")) return "precipitation";
  if (condition.includes("wind")) return "wind";
  if (condition.includes("cloud")) return "cloudcover";
  return "temp"; // Default to temperature
};

export const WeatherMapAdvanced = ({ 
  center, 
  onMapClick, 
  weatherCondition,
  isFullscreen = false,
  onToggleFullscreen 
}: WeatherMapAdvancedProps) => {
  const [activeLayer, setActiveLayer] = useState("temp");
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    const layer = getWeatherLayer(weatherCondition);
    setActiveLayer(layer);
    
    // Show animations for rain and wind
    setShowAnimation(
      weatherCondition?.toLowerCase().includes("rain") || 
      weatherCondition?.toLowerCase().includes("wind") || false
    );
  }, [weatherCondition]);

  const getLayerUrl = (layer: string) => {
    return `https://maps.open-meteo.com/v1/map?layer=${layer}&z={z}&x={x}&y={y}`;
  };

  const animationCondition = weatherCondition?.toLowerCase().includes("rain") 
    ? "rain" 
    : weatherCondition?.toLowerCase().includes("wind") 
    ? "wind" 
    : "";

  return (
    <div className="relative h-full w-full">
      {/* Fullscreen Toggle */}
      {onToggleFullscreen && (
        <Button
          variant="secondary"
          size="icon"
          className="absolute top-4 right-4 z-[1000] bg-card/95 backdrop-blur-sm border-border shadow-lg hover:bg-card"
          onClick={onToggleFullscreen}
        >
          {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
        </Button>
      )}

      {/* Weather Layer Indicator */}
      <div className="absolute top-4 left-4 z-[1000] bg-card/95 backdrop-blur-sm border border-border rounded-lg px-4 py-2 shadow-lg">
        <div className="flex items-center gap-2">
          <Wind className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium capitalize">{activeLayer.replace('cloudcover', 'clouds')} Layer</span>
        </div>
      </div>

      {/* Weather Animations */}
      {showAnimation && <WeatherAnimations condition={animationCondition} />}

      <div className="h-full w-full rounded-lg overflow-hidden">
        <MapContainer 
          center={center} 
          zoom={isFullscreen ? 10 : 13} 
          scrollWheelZoom={true} 
          className="h-full w-full"
          key={`${center[0]}-${center[1]}-${isFullscreen}`}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* Single Active Weather Layer */}
          <TileLayer
            url={getLayerUrl(activeLayer)}
            opacity={0.7}
            attribution="Open-Meteo"
          />

          <Marker position={center}>
            <Popup>
              Selected Location
              <br />
              {center[0].toFixed(4)}°, {center[1].toFixed(4)}°
            </Popup>
          </Marker>
          <MapClickHandler onMapClick={onMapClick} />
        </MapContainer>
      </div>
    </div>
  );
};
