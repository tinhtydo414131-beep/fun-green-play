import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Music, Volume2, VolumeX, Play, Pause, SkipForward, SkipBack, Shuffle, Repeat, Repeat1, GripVertical } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useDraggable } from "@/hooks/useDraggable";
import { useAuth } from "@/hooks/useAuth";

const PLAYLIST = [
  { title: "Radiant Dreamland", src: "https://media.funplanet.life/audio/radiant-dreamland.mp3" },
  { title: "Angel of the Stars", src: "https://media.funplanet.life/audio/angel-of-the-stars.mp3" }
];

export const BackgroundMusicPlayer = () => {
  const { user } = useAuth();
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [autoSkip, setAutoSkip] = useState(() => {
    const saved = localStorage.getItem("music_auto_skip");
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [shuffle, setShuffle] = useState(() => {
    const saved = localStorage.getItem("music_shuffle");
    return saved !== null ? JSON.parse(saved) : false;
  });
  const [repeatMode, setRepeatMode] = useState<'off' | 'one' | 'all'>(() => {
    const saved = localStorage.getItem("music_repeat_mode");
    return (saved as 'off' | 'one' | 'all') || 'all';
  });
  const audioRef = useRef<HTMLAudioElement>(null);

  // Load saved volume on mount
  useEffect(() => {
    const savedVolume = localStorage.getItem("funplanet_music_volume");
    
    if (savedVolume) {
      setVolume(Number(savedVolume));
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

  const nextTrack = () => {
    if (shuffle) {
      let nextIndex;
      do {
        nextIndex = Math.floor(Math.random() * PLAYLIST.length);
      } while (nextIndex === currentTrack && PLAYLIST.length > 1);
      setCurrentTrack(nextIndex);
    } else {
      setCurrentTrack((prev) => (prev + 1) % PLAYLIST.length);
    }
  };

  const previousTrack = () => {
    if (shuffle) {
      let prevIndex;
      do {
        prevIndex = Math.floor(Math.random() * PLAYLIST.length);
      } while (prevIndex === currentTrack && PLAYLIST.length > 1);
      setCurrentTrack(prevIndex);
    } else {
      setCurrentTrack((prev) => (prev - 1 + PLAYLIST.length) % PLAYLIST.length);
    }
  };

  const handleTrackEnd = () => {
    if (repeatMode === 'one') {
      // Replay current track
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
    } else if (repeatMode === 'all') {
      // Auto-advance to next track
      nextTrack();
    } else if (autoSkip) {
      // Auto-skip if repeat is off
      nextTrack();
    } else {
      // Stop playing if no auto-skip and no repeat
      setIsPlaying(false);
    }
  };

  const handleAutoSkipToggle = (checked: boolean) => {
    setAutoSkip(checked);
    localStorage.setItem("music_auto_skip", JSON.stringify(checked));
  };

  const handleShuffleToggle = (checked: boolean) => {
    setShuffle(checked);
    localStorage.setItem("music_shuffle", JSON.stringify(checked));
  };

  const handleRepeatToggle = () => {
    const modes: Array<'off' | 'one' | 'all'> = ['off', 'one', 'all'];
    const currentIndex = modes.indexOf(repeatMode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    setRepeatMode(nextMode);
    localStorage.setItem("music_repeat_mode", nextMode);
  };

  if (!user) return null;

  const { position, isDragging, handleMouseDown, style } = useDraggable({
    storageKey: "music_player_position",
    defaultPosition: { x: 0, y: 0 },
  });

  return (
    <div 
      className="fixed bottom-6 right-6 z-50 select-none"
      style={style}
    >
      <div className="relative group">
        {/* Drag handle */}
        <div
          onMouseDown={handleMouseDown}
          onTouchStart={handleMouseDown}
          className={`absolute -top-2 -left-2 w-6 h-6 rounded-full bg-primary/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 ${isDragging ? 'opacity-100' : ''}`}
          title="Drag to move"
        >
          <GripVertical className="w-3 h-3 text-white" />
        </div>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button
              size="lg"
              className={`h-16 w-16 rounded-full bg-gradient-to-br from-primary via-secondary to-accent shadow-2xl hover:shadow-[0_20px_50px_rgba(59,130,246,0.6)] transition-all duration-300 hover:scale-110 border-4 border-white/20 ${isDragging ? 'cursor-grabbing scale-105' : ''}`}
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

              <Button
                onClick={handleRepeatToggle}
                size="icon"
                variant="outline"
                className={`border-2 rounded-full transition-all ${
                  repeatMode !== 'off' 
                    ? 'border-accent bg-accent/20 text-accent hover:bg-accent/30' 
                    : 'border-primary/30 hover:border-primary hover:bg-primary/10'
                }`}
                title={repeatMode === 'off' ? 'No repeat' : repeatMode === 'one' ? 'Repeat one' : 'Repeat all'}
              >
                {repeatMode === 'one' ? (
                  <Repeat1 className="w-5 h-5" />
                ) : (
                  <Repeat className="w-5 h-5" />
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

            {/* Auto-Skip Toggle */}
            <div className="flex items-center justify-between bg-gradient-to-r from-primary/5 to-secondary/5 px-4 py-3 rounded-2xl border-2 border-primary/20">
              <div className="flex items-center gap-2">
                <SkipForward className="h-4 w-4 text-primary" />
                <Label htmlFor="auto-skip" className="font-fredoka font-bold text-sm cursor-pointer">
                  Auto-Skip
                </Label>
              </div>
              <Switch
                id="auto-skip"
                checked={autoSkip}
                onCheckedChange={handleAutoSkipToggle}
                className="data-[state=checked]:bg-primary"
              />
            </div>

            {/* Shuffle Toggle */}
            <div className="flex items-center justify-between bg-gradient-to-r from-primary/5 to-secondary/5 px-4 py-3 rounded-2xl border-2 border-primary/20">
              <div className="flex items-center gap-2">
                <Shuffle className="h-4 w-4 text-secondary" />
                <Label htmlFor="shuffle" className="font-fredoka font-bold text-sm cursor-pointer">
                  Shuffle
                </Label>
              </div>
              <Switch
                id="shuffle"
                checked={shuffle}
                onCheckedChange={handleShuffleToggle}
                className="data-[state=checked]:bg-secondary"
              />
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
    </div>
  );
};
