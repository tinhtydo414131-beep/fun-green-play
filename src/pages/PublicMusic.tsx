import { useState, useRef, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, Pause, Download, Save, Music, Volume2, VolumeX, Upload, Trash2, Send, Share2, Link2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  src: string;
  duration: string;
  isUserUpload?: boolean;
  userId?: string;
  storagePath?: string;
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
  
  // Upload state
  const [userTracks, setUserTracks] = useState<MusicTrack[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadArtist, setUploadArtist] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);

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

  // Load user uploaded tracks
  const loadUserTracks = async () => {
    try {
      const { data, error } = await supabase
        .from('user_music')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const tracks: MusicTrack[] = data.map(music => {
        const { data: urlData } = supabase.storage
          .from('music')
          .getPublicUrl(music.storage_path);

        return {
          id: music.id,
          title: music.title,
          artist: music.artist || 'Người dùng',
          src: urlData.publicUrl,
          duration: music.duration || '0:00',
          isUserUpload: true,
          userId: music.user_id,
          storagePath: music.storage_path
        };
      });

      setUserTracks(tracks);
    } catch (error) {
      console.error('Error loading user tracks:', error);
    }
  };

  useEffect(() => {
    loadUserTracks();
  }, []);

  // Handle file upload
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.includes('audio/mpeg') && !file.name.endsWith('.mp3')) {
      toast.error("Chỉ chấp nhận file MP3");
      return;
    }

    setUploadFile(file);
    setUploadTitle(file.name.replace('.mp3', ''));
  };

  const handleUpload = async () => {
    if (!user || !uploadFile || !uploadTitle) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    setUploading(true);
    try {
      const filePath = `${user.id}/${Date.now()}-${uploadFile.name}`;
      
      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('music')
        .upload(filePath, uploadFile);

      if (uploadError) throw uploadError;

      // Get audio duration
      const audio = new Audio();
      const audioDuration = await new Promise<string>((resolve) => {
        audio.src = URL.createObjectURL(uploadFile);
        audio.onloadedmetadata = () => {
          const minutes = Math.floor(audio.duration / 60);
          const seconds = Math.floor(audio.duration % 60);
          resolve(`${minutes}:${seconds.toString().padStart(2, '0')}`);
        };
      });

      // Save metadata to database
      const { error: dbError } = await supabase
        .from('user_music')
        .insert({
          user_id: user.id,
          title: uploadTitle,
          artist: uploadArtist || user.email?.split('@')[0],
          storage_path: filePath,
          file_size: uploadFile.size,
          duration: audioDuration
        });

      if (dbError) throw dbError;

      toast.success("Đã tải nhạc lên thành công!");
      setUploadDialogOpen(false);
      setUploadTitle("");
      setUploadArtist("");
      setUploadFile(null);
      loadUserTracks();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error("Không thể tải nhạc lên");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteTrack = async (track: MusicTrack) => {
    if (!user || !track.isUserUpload || track.userId !== user.id) {
      toast.error("Bạn không có quyền xóa bài nhạc này");
      return;
    }

    if (!confirm("Bạn có chắc muốn xóa bài nhạc này?")) return;

    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('music')
        .remove([track.storagePath!]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('user_music')
        .delete()
        .eq('id', track.id);

      if (dbError) throw dbError;

      toast.success("Đã xóa bài nhạc");
      loadUserTracks();
      
      if (currentTrack?.id === track.id) {
        setCurrentTrack(null);
        setIsPlaying(false);
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error("Không thể xóa bài nhạc");
    }
  };

  const handleShareTelegram = (track: MusicTrack) => {
    const shareUrl = `${window.location.origin}${window.location.pathname}?track=${encodeURIComponent(track.id)}`;
    const text = `🎵 ${track.title} - ${track.artist}`;
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`;
    window.open(telegramUrl, '_blank');
    toast.success("Đang mở Telegram để chia sẻ");
  };

  const handleShareFacebook = (track: MusicTrack) => {
    const shareUrl = `${window.location.origin}${window.location.pathname}?track=${encodeURIComponent(track.id)}`;
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(facebookUrl, '_blank', 'width=600,height=400');
    toast.success("Đang mở Facebook để chia sẻ");
  };

  const handleCopyLink = (track: MusicTrack) => {
    const shareUrl = `${window.location.origin}${window.location.pathname}?track=${encodeURIComponent(track.id)}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      toast.success("Đã sao chép link chia sẻ!");
    }).catch(() => {
      toast.error("Không thể sao chép link");
    });
  };

  const allTracks = [...PUBLIC_TRACKS, ...userTracks];

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
            
            <Card className="mt-6 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 border-2 border-primary/30">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4 justify-center flex-wrap">
                  <div className="text-4xl">🤖</div>
                  <div className="text-left">
                    <h3 className="font-fredoka text-xl font-bold text-primary mb-1">
                      Telegram Music Bot
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Gửi file MP3 qua Telegram để tự động tải lên!
                    </p>
                  </div>
                  <Button 
                    onClick={() => window.open('https://t.me/YOUR_BOT_USERNAME', '_blank')}
                    className="bg-gradient-to-r from-primary to-secondary hover:shadow-xl transition-all"
                  >
                    Mở Telegram Bot
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {user && (
              <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="mt-6 bg-gradient-to-r from-primary to-secondary hover:shadow-xl transition-all text-lg px-8 py-6 rounded-full">
                    <Upload className="w-5 h-5 mr-2" />
                    Tải Nhạc Lên
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle className="font-fredoka text-2xl text-primary">
                      Tải Nhạc MP3 Lên
                    </DialogTitle>
                    <DialogDescription>
                      Chia sẻ bài nhạc yêu thích của bạn với mọi người
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="upload-file">File MP3</Label>
                      <Input
                        id="upload-file"
                        type="file"
                        accept="audio/mpeg,.mp3"
                        onChange={handleFileSelect}
                        disabled={uploading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="title">Tên bài hát *</Label>
                      <Input
                        id="title"
                        value={uploadTitle}
                        onChange={(e) => setUploadTitle(e.target.value)}
                        placeholder="Nhập tên bài hát"
                        disabled={uploading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="artist">Nghệ sĩ</Label>
                      <Input
                        id="artist"
                        value={uploadArtist}
                        onChange={(e) => setUploadArtist(e.target.value)}
                        placeholder="Nhập tên nghệ sĩ (tùy chọn)"
                        disabled={uploading}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      onClick={handleUpload}
                      disabled={uploading || !uploadFile || !uploadTitle}
                      className="bg-gradient-to-r from-primary to-secondary"
                    >
                      {uploading ? "Đang tải lên..." : "Tải Lên"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
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
                {allTracks.length} bài hát ({PUBLIC_TRACKS.length} công khai + {userTracks.length} từ cộng đồng)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {allTracks.map((track) => (
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
                        onClick={() => handleShareTelegram(track)}
                        className="border-3 border-primary/30 hover:border-primary hover:bg-primary/10"
                        title="Chia sẻ qua Telegram"
                      >
                        <Send className="w-5 h-5 text-primary" />
                      </Button>

                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => handleShareFacebook(track)}
                        className="border-3 border-primary/30 hover:border-primary hover:bg-primary/10"
                        title="Chia sẻ lên Facebook"
                      >
                        <Share2 className="w-5 h-5 text-primary" />
                      </Button>

                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => handleCopyLink(track)}
                        className="border-3 border-primary/30 hover:border-primary hover:bg-primary/10"
                        title="Sao chép link"
                      >
                        <Link2 className="w-5 h-5 text-primary" />
                      </Button>

                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => handleDownload(track)}
                        className="border-3 border-primary/30 hover:border-primary hover:bg-primary/10"
                        title="Tải xuống"
                      >
                        <Download className="w-5 h-5 text-primary" />
                      </Button>

                      {!track.isUserUpload && (
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
                      )}

                      {track.isUserUpload && user && track.userId === user.id && (
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => handleDeleteTrack(track)}
                          className="border-3 border-destructive/30 hover:border-destructive hover:bg-destructive/10"
                          title="Xóa bài nhạc"
                        >
                          <Trash2 className="w-5 h-5 text-destructive" />
                        </Button>
                      )}
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
