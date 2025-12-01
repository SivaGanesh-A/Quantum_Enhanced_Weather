import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

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

interface WeatherMapProps {
  center: LatLngExpression;
  onMapClick: (lat: number, lon: number) => void;
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

export const WeatherMap = ({ center, onMapClick }: WeatherMapProps) => {
  return (
    <div className="h-full w-full rounded-lg overflow-hidden">
      <MapContainer 
        center={center} 
        zoom={13} 
        scrollWheelZoom={true} 
        className="h-full w-full"
        key={`${center[0]}-${center[1]}`}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
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
  );
};
