import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Music, Volume2, VolumeX, Play, Pause, SkipForward, SkipBack } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAuth } from "@/hooks/useAuth";

const PLAYLIST = [
  { title: "Radiant Dreamland", src: "/audio/radiant-dreamland.mp3" },
  { title: "Angel of the Stars", src: "/audio/angel-of-the-stars.mp3" }
];

export const BackgroundMusicPlayer = () => {
  const { user } = useAuth();
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Auto-play when user logs in
  useEffect(() => {
    const savedVolume = localStorage.getItem("funplanet_music_volume");
    
    if (savedVolume) {
      setVolume(Number(savedVolume));
    }
    
    // Auto-play when user is authenticated
    if (user && !isPlaying) {
      setIsPlaying(true);
    }
  }, [user]);

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

  const nextTrack = () => {
    setCurrentTrack((prev) => (prev + 1) % PLAYLIST.length);
  };

  const previousTrack = () => {
    setCurrentTrack((prev) => (prev - 1 + PLAYLIST.length) % PLAYLIST.length);
  };

  const handleTrackEnd = () => {
    nextTrack();
  };

  if (!user) return null;

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
              <p className="text-sm font-comic text-muted-foreground truncate">
                {PLAYLIST[currentTrack].title}
              </p>
            </div>

            {/* Track Controls */}
            <div className="flex items-center justify-center gap-4">
              <Button
                onClick={previousTrack}
                size="icon"
                variant="outline"
                className="border-2 border-primary/30 hover:border-primary hover:bg-primary/10 rounded-full"
              >
                <SkipBack className="w-5 h-5 text-primary" />
              </Button>

              <Button
                onClick={togglePlay}
                size="lg"
                className="h-16 w-16 rounded-full bg-gradient-to-r from-primary to-secondary hover:shadow-xl transition-all duration-300 hover:scale-110 border-4 border-white/30"
              >
                {isPlaying ? (
                  <Pause className="w-8 h-8 text-white fill-white" />
                ) : (
                  <Play className="w-8 h-8 text-white fill-white ml-1" />
                )}
              </Button>

              <Button
                onClick={nextTrack}
                size="icon"
                variant="outline"
                className="border-2 border-primary/30 hover:border-primary hover:bg-primary/10 rounded-full"
              >
                <SkipForward className="w-5 h-5 text-primary" />
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

            {/* Track Info */}
            <div className="text-center text-xs font-comic text-muted-foreground">
              Track {currentTrack + 1} of {PLAYLIST.length}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Audio Element */}
      <audio
        ref={audioRef}
        src={PLAYLIST[currentTrack].src}
        preload="auto"
        onEnded={handleTrackEnd}
      />
    </div>
  );
};
