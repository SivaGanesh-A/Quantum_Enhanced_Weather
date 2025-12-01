import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Card } from "@/components/ui/card";

interface MiniMapNavigatorProps {
  mainMapCenter: [number, number];
  mainMapZoom: number;
  onNavigate: (lat: number, lon: number) => void;
}

export const MiniMapNavigator = ({ mainMapCenter, mainMapZoom, onNavigate }: MiniMapNavigatorProps) => {
  const miniMapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!miniMapRef.current || mapInstanceRef.current) return;

    // Initialize mini map
    const miniMap = L.map(miniMapRef.current, {
      center: mainMapCenter,
      zoom: Math.max(1, mainMapZoom - 4),
      zoomControl: false,
      attributionControl: false,
      dragging: true,
      scrollWheelZoom: false,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
    }).addTo(miniMap);

    // Add marker for main map center
    const marker = L.marker(mainMapCenter, {
      icon: L.divIcon({
        className: "custom-mini-marker",
        html: '<div style="width: 20px; height: 20px; background: hsl(var(--primary)); border: 2px solid white; border-radius: 50%; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>',
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      }),
    }).addTo(miniMap);

    // Click to navigate
    miniMap.on("click", (e) => {
      onNavigate(e.latlng.lat, e.latlng.lng);
    });

    mapInstanceRef.current = miniMap;
    markerRef.current = marker;

    return () => {
      miniMap.remove();
      mapInstanceRef.current = null;
      markerRef.current = null;
    };
  }, []);

  // Update marker position when main map center changes
  useEffect(() => {
    if (markerRef.current && mapInstanceRef.current) {
      markerRef.current.setLatLng(mainMapCenter);
      mapInstanceRef.current.setView(mainMapCenter, Math.max(1, mainMapZoom - 4), { animate: true });
    }
  }, [mainMapCenter, mainMapZoom]);

  return (
    <Card className="absolute bottom-24 right-4 z-[1000] w-48 h-48 overflow-hidden shadow-2xl border-2 border-border/50 bg-card/95 backdrop-blur-sm">
      <div ref={miniMapRef} className="w-full h-full" />
      <div className="absolute bottom-1 left-1 bg-card/90 px-2 py-1 rounded text-xs font-medium">
        Navigator
      </div>
    </Card>
  );
};
