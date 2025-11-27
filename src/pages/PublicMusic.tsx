import { useState, useRef } from "react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, Pause, Download, Save, Music, Volume2, VolumeX } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";

interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  src: string;
  duration: string;
}

const PUBLIC_TRACKS: MusicTrack[] = [
  {
    id: "1",
    title: "Radiant Dreamland",
    artist: "FUN Planet",
    src: "/audio/radiant-dreamland.mp3",
    duration: "3:45"
  },
  {
    id: "2", 
    title: "Angel of the Stars",
    artist: "FUN Planet",
    src: "/audio/angel-of-the-stars.mp3",
    duration: "4:12"
  }
];

export default function PublicMusic() {
  const { user } = useAuth();
  const [currentTrack, setCurrentTrack] = useState<MusicTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(70);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handlePlayPause = (track: MusicTrack) => {
    if (currentTrack?.id === track.id) {
      if (isPlaying) {
        audioRef.current?.pause();
        setIsPlaying(false);
      } else {
        audioRef.current?.play();
        setIsPlaying(true);
      }
    } else {
      setCurrentTrack(track);
      setIsPlaying(true);
      setTimeout(() => {
        audioRef.current?.play();
      }, 100);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume / 100;
    }
    if (newVolume > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleDownload = async (track: MusicTrack) => {
    try {
      const response = await fetch(track.src);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${track.title}.mp3`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Đã tải xuống nhạc!");
    } catch (error) {
      console.error('Download error:', error);
      toast.error("Không thể tải xuống");
    }
  };

  const handleSaveToLibrary = async (track: MusicTrack) => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để lưu nhạc");
      return;
    }

    try {
      const response = await fetch(track.src);
      const blob = await response.blob();
      const file = new File([blob], `${track.title}.mp3`, { type: 'audio/mpeg' });
      
      const filePath = `${user.id}/${Date.now()}-${track.title}.mp3`;
      
      const { error } = await supabase.storage
        .from('music')
        .upload(filePath, file);

      if (error) throw error;

      toast.success("Đã lưu vào thư viện của bạn!");
    } catch (error) {
      console.error('Save error:', error);
      toast.error("Không thể lưu nhạc");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 pt-24 pb-32">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-fredoka font-bold text-primary mb-4">
              🎵 Thư Viện Nhạc FUN
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground font-comic">
              Nghe, tải về và lưu trữ những bản nhạc yêu thích
            </p>
          </div>

          {/* Music Player */}
          {currentTrack && (
            <Card className="mb-8 border-4 border-primary/40 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
              <CardHeader>
                <CardTitle className="font-fredoka text-2xl flex items-center gap-2">
                  <Music className="w-6 h-6 text-primary animate-pulse" />
                  Đang Phát
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <h3 className="text-2xl font-fredoka font-bold text-primary mb-1">
                    {currentTrack.title}
                  </h3>
                  <p className="text-lg text-muted-foreground font-comic">
                    {currentTrack.artist}
                  </p>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <Slider
                    value={[currentTime]}
                    max={duration || 100}
                    step={0.1}
                    onValueChange={handleSeek}
                    className="cursor-pointer"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground font-comic">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>

                {/* Volume Control */}
                <div className="flex items-center gap-4">
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={toggleMute}
                    className="border-2 border-primary/30 hover:border-primary shrink-0"
                  >
                    {isMuted ? (
                      <VolumeX className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <Volume2 className="w-5 h-5 text-primary" />
                    )}
                  </Button>
                  <Slider
                    value={[volume]}
                    max={100}
                    step={1}
                    onValueChange={handleVolumeChange}
                    className="flex-1"
                  />
                  <span className="text-sm font-fredoka font-bold text-primary w-12 text-right">
                    {isMuted ? "🔇" : `${volume}%`}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Track List */}
          <Card className="border-4 border-primary/30">
            <CardHeader>
              <CardTitle className="font-fredoka text-3xl flex items-center gap-2">
                <Music className="w-7 h-7 text-primary" />
                Danh Sách Nhạc
              </CardTitle>
              <CardDescription className="text-base">
                {PUBLIC_TRACKS.length} bài hát có sẵn
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {PUBLIC_TRACKS.map((track) => (
                  <div
                    key={track.id}
                    className={`flex items-center justify-between p-6 border-4 rounded-2xl transition-all ${
                      currentTrack?.id === track.id
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50 hover:bg-accent/30'
                    }`}
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <Button
                        size="icon"
                        onClick={() => handlePlayPause(track)}
                        className="h-14 w-14 rounded-full bg-gradient-to-br from-primary to-secondary hover:shadow-xl transition-all hover:scale-110 shrink-0"
                      >
                        {isPlaying && currentTrack?.id === track.id ? (
                          <Pause className="w-6 h-6 text-white fill-white" />
                        ) : (
                          <Play className="w-6 h-6 text-white fill-white ml-0.5" />
                        )}
                      </Button>

                      <div className="min-w-0 flex-1">
                        <h3 className="text-xl font-fredoka font-bold text-foreground truncate">
                          {track.title}
                        </h3>
                        <p className="text-sm text-muted-foreground font-comic">
                          {track.artist} • {track.duration}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 ml-4">
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => handleDownload(track)}
                        className="border-3 border-primary/30 hover:border-primary hover:bg-primary/10"
                        title="Tải xuống"
                      >
                        <Download className="w-5 h-5 text-primary" />
                      </Button>

                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => handleSaveToLibrary(track)}
                        className="border-3 border-secondary/30 hover:border-secondary hover:bg-secondary/10"
                        title="Lưu vào thư viện"
                        disabled={!user}
                      >
                        <Save className="w-5 h-5 text-secondary" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Hidden Audio Element */}
      {currentTrack && (
        <audio
          ref={audioRef}
          src={currentTrack.src}
          onTimeUpdate={handleTimeUpdate}
          onEnded={() => setIsPlaying(false)}
          onLoadedMetadata={handleTimeUpdate}
        />
      )}
    </div>
  );
}
