import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { haptics } from '@/utils/haptics';
import { cn } from '@/lib/utils';

interface VoiceMessageProps {
  audioUrl: string;
  duration?: number;
  isOwn?: boolean;
}

export const VoiceMessage = ({ audioUrl, duration = 0, isOwn = false }: VoiceMessageProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(duration);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    audio.addEventListener('loadedmetadata', () => {
      if (audio.duration && isFinite(audio.duration)) {
        setAudioDuration(Math.floor(audio.duration));
      }
    });

    audio.addEventListener('timeupdate', () => {
      setCurrentTime(audio.currentTime);
    });

    audio.addEventListener('ended', () => {
      setIsPlaying(false);
      setCurrentTime(0);
    });

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, [audioUrl]);

  const togglePlayback = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
      haptics.light();
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !progressRef.current) return;

    const rect = progressRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = percentage * audioDuration;

    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
    haptics.selection();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = audioDuration > 0 ? (currentTime / audioDuration) * 100 : 0;

  // Generate waveform bars (simplified visualization)
  const waveformBars = Array.from({ length: 20 }, (_, i) => {
    const height = 20 + Math.sin(i * 0.5) * 15 + Math.random() * 10;
    return height;
  });

  return (
    <div className={cn(
      "flex items-center gap-3 p-3 rounded-2xl min-w-[200px] max-w-[280px]",
      isOwn 
        ? "bg-primary/20 border border-primary/30" 
        : "bg-muted/50 border border-border/50"
    )}>
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "h-10 w-10 rounded-full shrink-0",
          isOwn 
            ? "bg-primary text-primary-foreground hover:bg-primary/80" 
            : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
        )}
        onClick={togglePlayback}
      >
        {isPlaying ? (
          <Pause className="h-5 w-5" />
        ) : (
          <Play className="h-5 w-5 ml-0.5" />
        )}
      </Button>

      <div className="flex-1 min-w-0">
        <div 
          ref={progressRef}
          className="flex items-end gap-[2px] h-8 cursor-pointer"
          onClick={handleProgressClick}
        >
          {waveformBars.map((height, i) => {
            const barProgress = (i / waveformBars.length) * 100;
            const isActive = barProgress <= progress;
            
            return (
              <div
                key={i}
                className={cn(
                  "w-1 rounded-full transition-colors duration-150",
                  isActive 
                    ? isOwn ? "bg-primary" : "bg-foreground" 
                    : isOwn ? "bg-primary/30" : "bg-muted-foreground/30"
                )}
                style={{ height: `${height}%` }}
              />
            );
          })}
        </div>
        
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-muted-foreground">
            {formatTime(isPlaying ? currentTime : 0)}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatTime(audioDuration)}
          </span>
        </div>
      </div>

      <Volume2 className="h-4 w-4 text-muted-foreground shrink-0" />
    </div>
  );
};
