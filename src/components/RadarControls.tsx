import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Play, Pause, SkipBack, SkipForward, Loader2 } from "lucide-react";

interface RadarControlsProps {
  frames: any[];
  currentFrameIndex: number;
  isPlaying: boolean;
  loading: boolean;
  onFrameChange: (index: number) => void;
  onPlayPause: () => void;
}

export const RadarControls = ({
  frames,
  currentFrameIndex,
  isPlaying,
  loading,
  onFrameChange,
  onPlayPause,
}: RadarControlsProps) => {
  const currentFrame = frames[currentFrameIndex];
  const frameTime = currentFrame ? new Date(currentFrame.time * 1000) : null;

  const goToPrevious = () => {
    onFrameChange(Math.max(0, currentFrameIndex - 1));
  };

  const goToNext = () => {
    onFrameChange(Math.min(frames.length - 1, currentFrameIndex + 1));
  };

  return (
    <Card className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000] bg-card/95 backdrop-blur-sm border-border shadow-2xl p-4 w-[600px] animate-fade-in">
      {loading ? (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Enhanced Time Display */}
          {frameTime && (
            <div className="text-center bg-gradient-to-br from-primary/10 to-primary/5 p-3 rounded-lg border border-primary/20">
              <div className="text-xs text-muted-foreground mb-1">Radar Timestamp</div>
              <div className="font-bold text-lg text-primary">
                {frameTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
              <div className="font-semibold text-sm text-foreground">
                {frameTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </div>
            </div>
          )}

          {/* Playback Controls */}
          <div className="flex items-center justify-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={goToPrevious}
              disabled={currentFrameIndex === 0}
              className="hover:bg-primary/10"
            >
              <SkipBack className="w-4 h-4" />
            </Button>
            
            <Button
              variant="default"
              size="icon"
              onClick={onPlayPause}
              disabled={frames.length === 0}
              className="w-14 h-14 shadow-lg"
            >
              {isPlaying ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6" />
              )}
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={goToNext}
              disabled={currentFrameIndex === frames.length - 1}
              className="hover:bg-primary/10"
            >
              <SkipForward className="w-4 h-4" />
            </Button>
          </div>

          {/* Enhanced Timeline Slider with Frame Preview */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-muted-foreground font-medium">Timeline:</span>
              <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${((currentFrameIndex + 1) / frames.length) * 100}%` }}
                />
              </div>
            </div>
            <Slider
              value={[currentFrameIndex]}
              onValueChange={(value) => onFrameChange(value[0])}
              max={Math.max(0, frames.length - 1)}
              step={1}
              disabled={frames.length === 0}
              className="cursor-pointer"
            />
            <div className="flex justify-between items-center mt-2">
              <div className="text-xs text-muted-foreground">
                Frame <span className="font-bold text-foreground">{currentFrameIndex + 1}</span> / {frames.length}
              </div>
              <div className="text-xs text-muted-foreground">
                {isPlaying ? "Playing..." : "Paused"}
              </div>
            </div>
          </div>

          {/* Frame Type Indicator */}
          <div className="flex items-center justify-center gap-2">
            {currentFrameIndex < frames.length / 2 ? (
              <div className="text-xs px-3 py-1 bg-blue-500/20 text-blue-500 rounded-full font-medium border border-blue-500/30">
                Past Data
              </div>
            ) : (
              <div className="text-xs px-3 py-1 bg-green-500/20 text-green-500 rounded-full font-medium border border-green-500/30">
                Nowcast
              </div>
            )}
          </div>
        </div>
      )}
    </Card>
  );
};
