import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Button } from "@/components/ui/button";
import { Maximize2, Minimize2, Locate } from "lucide-react";
import { LayerControl, LayerType, ForecastLayer, SatelliteLayer } from "./LayerControl";
import { MiniMapNavigator } from "./MiniMapNavigator";
import { MapAnnotations } from "./MapAnnotations";

const OPENWEATHER_API_KEY = "2647b2146eb6884d1a64a8041ea0da01";

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

interface WeatherMapWithLayersProps {
  center: LatLngExpression;
  onMapClick: (lat: number, lon: number) => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

const MapClickHandler = ({ onMapClick }: { onMapClick: (lat: number, lon: number) => void }) => {
  useMapEvents({
    click: (e) => {
      let lon = e.latlng.lng;
      while (lon > 180) lon -= 360;
      while (lon < -180) lon += 360;
      onMapClick(e.latlng.lat, lon);
    },
  });
  return null;
};

// NASA GIBS date helper
const getGIBSDate = () => {
  const date = new Date();
  date.setDate(date.getDate() - 1); // Use yesterday's data for reliability
  return date.toISOString().split('T')[0];
};

const getForecastLayerUrl = (layer: ForecastLayer): string => {
  // OpenWeatherMap tile layers with API key
  const layerMap: Record<ForecastLayer, string> = {
    temp: 'temp_new',
    wind: 'wind_new',
    humidity: 'humidity',
    cloudcover: 'clouds_new',
    precipitation: 'precipitation_new',
    pressure: 'pressure_new'
  };
  return `https://tile.openweathermap.org/map/${layerMap[layer]}/{z}/{x}/{y}.png?appid=${OPENWEATHER_API_KEY}`;
};

const getSatelliteLayerUrl = (layer: SatelliteLayer): string => {
  const date = getGIBSDate();
  const baseUrl = "https://gibs.earthdata.nasa.gov/wmts/epsg3857/best";
  
  switch (layer) {
    case "truecolor":
      return `${baseUrl}/VIIRS_SNPP_CorrectedReflectance_TrueColor/default/${date}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg`;
    case "infrared":
      return `${baseUrl}/GOES-East_ABI_Band13_Clean_Infrared/default/${date}/GoogleMapsCompatible_Level6/{z}/{y}/{x}.png`;
    case "watervapor":
      return `${baseUrl}/GOES-East_ABI_Band09_Clean_Longwave_Window/default/${date}/GoogleMapsCompatible_Level6/{z}/{y}/{x}.png`;
  }
};

export const WeatherMapWithLayers = ({ 
  center, 
  onMapClick,
  isFullscreen = false,
  onToggleFullscreen 
}: WeatherMapWithLayersProps) => {
  const [layerType, setLayerType] = useState<LayerType>("forecast");
  const [forecastLayer, setForecastLayer] = useState<ForecastLayer>("temp");
  const [satelliteLayer, setSatelliteLayer] = useState<SatelliteLayer>("truecolor");
  const [showRadar, setShowRadar] = useState(false);
  const [opacity, setOpacity] = useState(0.65);
  const [radarFrames, setRadarFrames] = useState<any[]>([]);
  const [currentRadarFrame, setCurrentRadarFrame] = useState(0);
  const [mapCenter, setMapCenter] = useState<[number, number]>(center as [number, number]);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [mapZoom, setMapZoom] = useState(isFullscreen ? 7 : 10);
  const [showAnnotations, setShowAnnotations] = useState(false);
  const [annotations, setAnnotations] = useState<any[]>([]);

  // Get user's geolocation on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userPos: [number, number] = [position.coords.latitude, position.coords.longitude];
          setUserLocation(userPos);
          setMapCenter(userPos);
        },
        () => {
          // Default to India if permission denied
          const indiaCenter: [number, number] = [20.5937, 78.9629];
          setMapCenter(indiaCenter);
        }
      );
    }
  }, []);

  // Update map center when center prop changes
  useEffect(() => {
    setMapCenter(center as [number, number]);
  }, [center]);

  // Fetch radar frames
  useEffect(() => {
    if (!showRadar) return;
    
    const fetchRadar = async () => {
      try {
        const response = await fetch('https://api.rainviewer.com/public/weather-maps.json');
        const data = await response.json();
        const allFrames = [...data.radar.past, ...data.radar.nowcast];
        setRadarFrames(allFrames);
        setCurrentRadarFrame(allFrames.length > 0 ? allFrames.length - 1 : 0);
      } catch (error) {
        console.error('Failed to fetch radar:', error);
      }
    };

    fetchRadar();
    const interval = setInterval(fetchRadar, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [showRadar]);

  const handleLocateMe = () => {
    if (userLocation) {
      setMapCenter(userLocation);
      onMapClick(userLocation[0], userLocation[1]);
    }
  };

  const handleMiniMapNavigate = (lat: number, lon: number) => {
    setMapCenter([lat, lon]);
    onMapClick(lat, lon);
  };

  const handleAddAnnotation = (annotation: any) => {
    setAnnotations(prev => [...prev, { ...annotation, id: Date.now().toString() }]);
  };

  const handleClearAnnotations = () => {
    setAnnotations([]);
  };

  const getLayerLabel = () => {
    if (layerType === "forecast") {
      const labels: Record<ForecastLayer, string> = {
        temp: "Temperature",
        wind: "Wind Speed",
        humidity: "Humidity",
        cloudcover: "Cloud Cover",
        precipitation: "Precipitation",
        pressure: "Pressure"
      };
      return labels[forecastLayer];
    } else {
      const labels: Record<SatelliteLayer, string> = {
        truecolor: "True Color",
        infrared: "Infrared",
        watervapor: "Water Vapor"
      };
      return labels[satelliteLayer];
    }
  };

  const activeLayerUrl = layerType === "forecast" 
    ? getForecastLayerUrl(forecastLayer)
    : getSatelliteLayerUrl(satelliteLayer);

  const radarUrl = showRadar && radarFrames[currentRadarFrame]
    ? `https://tilecache.rainviewer.com${radarFrames[currentRadarFrame].path}/256/{z}/{x}/{y}/2/1_1.png`
    : null;

  return (
    <div className="relative h-full w-full">
      {/* Control Buttons */}
      <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
        {onToggleFullscreen && (
          <Button
            variant="secondary"
            size="icon"
            className="bg-card/95 backdrop-blur-sm border-border shadow-lg hover:bg-card"
            onClick={onToggleFullscreen}
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </Button>
        )}
        {userLocation && (
          <Button
            variant="secondary"
            size="icon"
            className="bg-card/95 backdrop-blur-sm border-border shadow-lg hover:bg-card"
            onClick={handleLocateMe}
            title="Center on my location"
          >
            <Locate className="w-5 h-5" />
          </Button>
        )}
      </div>

      {/* Layer Badge */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] px-4 py-2 bg-card/95 backdrop-blur-sm border border-border rounded-lg shadow-lg">
        <p className="text-sm font-medium text-foreground">
          Layer: {getLayerLabel()}
        </p>
      </div>

      <LayerControl
        activeLayerType={layerType}
        activeForecastLayer={forecastLayer}
        activeSatelliteLayer={satelliteLayer}
        showRadar={showRadar}
        opacity={opacity}
        onLayerTypeChange={setLayerType}
        onForecastLayerChange={setForecastLayer}
        onSatelliteLayerChange={setSatelliteLayer}
        onRadarToggle={setShowRadar}
        onOpacityChange={setOpacity}
      />

      <MiniMapNavigator
        mainMapCenter={mapCenter}
        mainMapZoom={mapZoom}
        onNavigate={handleMiniMapNavigate}
      />

      <MapAnnotations
        annotations={annotations}
        onAddAnnotation={handleAddAnnotation}
        onClearAnnotations={handleClearAnnotations}
        isActive={showAnnotations}
        onToggle={() => setShowAnnotations(!showAnnotations)}
      />

      <div className="h-full w-full rounded-lg overflow-hidden shadow-2xl">
        <MapContainer 
          center={mapCenter} 
          zoom={mapZoom} 
          scrollWheelZoom={true} 
          className="h-full w-full"
          key={`${mapCenter[0]}-${mapCenter[1]}-${isFullscreen}`}
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {layerType === "forecast" && (
            <TileLayer
              url={activeLayerUrl}
              opacity={opacity}
              attribution='&copy; <a href="https://openweathermap.org/">OpenWeatherMap</a>'
              key={`forecast-${forecastLayer}`}
              className="animate-fade-in"
            />
          )}
          
          {layerType === "satellite" && (
            <TileLayer
              url={activeLayerUrl}
              opacity={opacity}
              attribution='&copy; <a href="https://earthdata.nasa.gov/">NASA GIBS</a>'
              key={`satellite-${satelliteLayer}`}
              maxZoom={satelliteLayer === "truecolor" ? 9 : 6}
              className="animate-fade-in"
            />
          )}

          {radarUrl && (
            <TileLayer
              url={radarUrl}
              opacity={0.6}
              attribution="RainViewer"
              key={`radar-${currentRadarFrame}`}
            />
          )}

          <Marker position={mapCenter}>
            <Popup>
              Selected Location
              <br />
              {mapCenter[0].toFixed(4)}°, {mapCenter[1].toFixed(4)}°
            </Popup>
          </Marker>
          <MapClickHandler onMapClick={onMapClick} />
        </MapContainer>
      </div>
    </div>
  );
};
