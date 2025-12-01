import { useState, useEffect } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import { RadarControls } from "./RadarControls";

interface RadarFrame {
  time: number;
  path: string;
}

interface RainViewerResponse {
  radar: {
    past: RadarFrame[];
    nowcast: RadarFrame[];
  };
}

const RadarLayer = ({ 
  frame, 
  opacity 
}: { 
  frame: RadarFrame | null; 
  opacity: number;
}) => {
  if (!frame) return null;

  return (
    <TileLayer
      url={`https://tilecache.rainviewer.com${frame.path}/256/{z}/{x}/{y}/2/1_1.png`}
      opacity={opacity}
      attribution="RainViewer"
    />
  );
};

interface RadarOverlayProps {
  center: LatLngExpression;
}

export const RadarOverlay = ({ center }: RadarOverlayProps) => {
  const [frames, setFrames] = useState<RadarFrame[]>([]);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [opacity, setOpacity] = useState(0.6);
  const [loading, setLoading] = useState(true);

  // Fetch radar frames
  useEffect(() => {
    const fetchRadarFrames = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://api.rainviewer.com/public/weather-maps.json');
        const data: RainViewerResponse = await response.json();
        const allFrames = [...data.radar.past, ...data.radar.nowcast];
        setFrames(allFrames);
        setCurrentFrameIndex(allFrames.length > 0 ? allFrames.length - 1 : 0);
      } catch (error) {
        console.error('Failed to fetch radar frames:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRadarFrames();
    // Refresh every 5 minutes
    const interval = setInterval(fetchRadarFrames, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Animation loop
  useEffect(() => {
    if (!isPlaying || frames.length === 0) return;

    const interval = setInterval(() => {
      setCurrentFrameIndex((prev) => (prev + 1) % frames.length);
    }, 500);

    return () => clearInterval(interval);
  }, [isPlaying, frames.length]);

  const currentFrame = frames[currentFrameIndex] || null;
  const frameTime = currentFrame ? new Date(currentFrame.time * 1000) : null;

  return (
    <div className="relative h-full w-full">
      <RadarControls
        frames={frames}
        currentFrameIndex={currentFrameIndex}
        isPlaying={isPlaying}
        loading={loading}
        onFrameChange={(index) => {
          setCurrentFrameIndex(index);
          setIsPlaying(false);
        }}
        onPlayPause={() => setIsPlaying(!isPlaying)}
      />

      <div className="h-full w-full rounded-lg overflow-hidden">
        <MapContainer 
          center={center} 
          zoom={8} 
          scrollWheelZoom={true} 
          className="h-full w-full"
          key={`${center[0]}-${center[1]}`}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <RadarLayer frame={currentFrame} opacity={opacity} />
        </MapContainer>
      </div>
    </div>
  );
};
