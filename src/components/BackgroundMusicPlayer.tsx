import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Music, Volume2, VolumeX, Play, Pause } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export const BackgroundMusicPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Load saved state from localStorage
  useEffect(() => {
    const savedVolume = localStorage.getItem("funplanet_music_volume");
    const savedPlaying = localStorage.getItem("funplanet_music_playing");
    
    if (savedVolume) {
      setVolume(Number(savedVolume));
    }
    
    if (savedPlaying === "true") {
      setIsPlaying(true);
    }
  }, []);

  // Update audio volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100;
    }
  }, [volume, isMuted]);

  // Handle play/pause
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(() => {
          // Auto-play might be blocked by browser
          setIsPlaying(false);
        });
      } else {
        audioRef.current.pause();
      }
      localStorage.setItem("funplanet_music_playing", String(isPlaying));
    }
  }, [isPlaying]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    localStorage.setItem("funplanet_music_volume", String(newVolume));
    if (newVolume > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            size="lg"
            className="h-16 w-16 rounded-full bg-gradient-to-br from-primary via-secondary to-accent shadow-2xl hover:shadow-[0_20px_50px_rgba(59,130,246,0.6)] transition-all duration-300 hover:scale-110 border-4 border-white/20"
          >
            <Music className="w-8 h-8 text-white animate-pulse" />
          </Button>
        </PopoverTrigger>
        
        <PopoverContent 
          side="top" 
          className="w-80 border-4 border-primary/30 bg-background/95 backdrop-blur-xl shadow-2xl rounded-3xl p-6"
        >
          <div className="space-y-6">
            {/* Header */}
            <div className="text-center">
              <h3 className="text-2xl font-fredoka font-bold text-primary mb-2">
                🎵 Music Player
              </h3>
              <p className="text-sm font-comic text-muted-foreground">
                Enjoy the FUN Planet vibes! 🎮
              </p>
            </div>

            {/* Play/Pause Button */}
            <div className="flex justify-center">
              <Button
                onClick={togglePlay}
                size="lg"
                className="h-20 w-20 rounded-full bg-gradient-to-r from-primary to-secondary hover:shadow-xl transition-all duration-300 hover:scale-110 border-4 border-white/30"
              >
                {isPlaying ? (
                  <Pause className="w-10 h-10 text-white fill-white" />
                ) : (
                  <Play className="w-10 h-10 text-white fill-white ml-1" />
                )}
              </Button>
            </div>

            {/* Volume Control */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-fredoka font-bold text-foreground">
                  Volume
                </span>
                <span className="text-sm font-fredoka font-bold text-primary">
                  {isMuted ? "🔇" : volume}%
                </span>
              </div>
              
              <div className="flex items-center gap-3">
                <Button
                  onClick={toggleMute}
                  size="icon"
                  variant="outline"
                  className="border-2 border-primary/30 hover:border-primary hover:bg-primary/10 rounded-xl shrink-0"
                >
                  {isMuted ? (
                    <VolumeX className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <Volume2 className="w-5 h-5 text-primary" />
                  )}
                </Button>
                
                <Slider
                  value={[volume]}
                  onValueChange={handleVolumeChange}
                  max={100}
                  step={1}
                  className="flex-1"
                />
              </div>
            </div>

            {/* Info */}
            <div className="text-center text-xs font-comic text-muted-foreground">
              🎵 Upload your music file to play! 🎵
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Audio Element - Add your music file here */}
      <audio
        ref={audioRef}
        loop
        preload="auto"
      >
        {/* TODO: Add your music file path here */}
        {/* <source src="/audio/background-music.mp3" type="audio/mpeg" /> */}
      </audio>
    </div>
  );
};
