import { useState, useRef, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, Pause, Download, Save, Music, Volume2, VolumeX, Upload, Trash2, Send, Share2, Link2, ListMusic, Plus, Filter } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  src: string;
  duration: string;
  genre?: string;
  isUserUpload?: boolean;
  userId?: string;
  storagePath?: string;
}

interface Playlist {
  id: string;
  name: string;
  description: string | null;
  user_id: string;
  is_public: boolean;
  created_at: string;
}

const PUBLIC_TRACKS: MusicTrack[] = [
  {
    id: "1",
    title: "Radiant Dreamland",
    artist: "FUN Planet",
    src: "/audio/radiant-dreamland.mp3",
    duration: "3:45",
    genre: "electronic"
  },
  {
    id: "2", 
    title: "Angel of the Stars",
    artist: "FUN Planet",
    src: "/audio/angel-of-the-stars.mp3",
    duration: "4:12",
    genre: "ambient"
  }
];

const GENRES = [
  { value: "all", label: "Tất cả" },
  { value: "pop", label: "🎤 Pop" },
  { value: "rock", label: "🎸 Rock" },
  { value: "electronic", label: "🎹 Electronic" },
  { value: "hiphop", label: "🎧 Hip Hop" },
  { value: "classical", label: "🎻 Classical" },
  { value: "jazz", label: "🎺 Jazz" },
  { value: "ambient", label: "🌌 Ambient" },
  { value: "other", label: "📀 Khác" },
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
  const [uploadGenre, setUploadGenre] = useState("other");
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  // Playlist state
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState<string | null>(null);
  const [playlistTracks, setPlaylistTracks] = useState<MusicTrack[]>([]);
  const [createPlaylistOpen, setCreatePlaylistOpen] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [newPlaylistDesc, setNewPlaylistDesc] = useState("");
  const [newPlaylistPublic, setNewPlaylistPublic] = useState(false);

  // Filter state
  const [selectedGenre, setSelectedGenre] = useState("all");

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
          genre: music.genre || 'other',
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

  // Load playlists
  const loadPlaylists = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('playlists')
        .select('*')
        .or(`user_id.eq.${user.id},is_public.eq.true`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPlaylists(data || []);
    } catch (error) {
      console.error('Error loading playlists:', error);
    }
  };

  // Load playlist tracks
  const loadPlaylistTracks = async (playlistId: string) => {
    try {
      const { data, error } = await supabase
        .from('playlist_items')
        .select('music_id')
        .eq('playlist_id', playlistId)
        .order('position', { ascending: true });

      if (error) throw error;

      const musicIds = data.map(item => item.music_id);
      const { data: musicData, error: musicError } = await supabase
        .from('user_music')
        .select('*')
        .in('id', musicIds);

      if (musicError) throw musicError;

      const tracks: MusicTrack[] = musicData.map(music => {
        const { data: urlData } = supabase.storage
          .from('music')
          .getPublicUrl(music.storage_path);

        return {
          id: music.id,
          title: music.title,
          artist: music.artist || 'Người dùng',
          src: urlData.publicUrl,
          duration: music.duration || '0:00',
          genre: music.genre || 'other',
          isUserUpload: true,
          userId: music.user_id,
          storagePath: music.storage_path
        };
      });

      setPlaylistTracks(tracks);
    } catch (error) {
      console.error('Error loading playlist tracks:', error);
    }
  };

  useEffect(() => {
    loadUserTracks();
    if (user) {
      loadPlaylists();
    }
  }, [user]);

  useEffect(() => {
    if (selectedPlaylist) {
      loadPlaylistTracks(selectedPlaylist);
    }
  }, [selectedPlaylist]);

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
          duration: audioDuration,
          genre: uploadGenre
        });

      if (dbError) throw dbError;

      toast.success("Đã tải nhạc lên thành công!");
      setUploadDialogOpen(false);
      setUploadTitle("");
      setUploadArtist("");
      setUploadGenre("other");
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
      const { error: storageError } = await supabase.storage
        .from('music')
        .remove([track.storagePath!]);

      if (storageError) throw storageError;

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

  const handleCreatePlaylist = async () => {
    if (!user || !newPlaylistName.trim()) {
      toast.error("Vui lòng nhập tên playlist");
      return;
    }

    try {
      const { error } = await supabase
        .from('playlists')
        .insert({
          user_id: user.id,
          name: newPlaylistName,
          description: newPlaylistDesc || null,
          is_public: newPlaylistPublic
        });

      if (error) throw error;

      toast.success("Đã tạo playlist!");
      setCreatePlaylistOpen(false);
      setNewPlaylistName("");
      setNewPlaylistDesc("");
      setNewPlaylistPublic(false);
      loadPlaylists();
    } catch (error) {
      console.error('Create playlist error:', error);
      toast.error("Không thể tạo playlist");
    }
  };

  const handleAddToPlaylist = async (playlistId: string, trackId: string) => {
    try {
      const { error } = await supabase
        .from('playlist_items')
        .insert({
          playlist_id: playlistId,
          music_id: trackId,
          position: 0
        });

      if (error) {
        if (error.code === '23505') {
          toast.error("Bài hát đã có trong playlist");
        } else {
          throw error;
        }
        return;
      }

      toast.success("Đã thêm vào playlist!");
      if (selectedPlaylist === playlistId) {
        loadPlaylistTracks(playlistId);
      }
    } catch (error) {
      console.error('Add to playlist error:', error);
      toast.error("Không thể thêm vào playlist");
    }
  };

  const handleRemoveFromPlaylist = async (trackId: string) => {
    if (!selectedPlaylist) return;

    try {
      const { error } = await supabase
        .from('playlist_items')
        .delete()
        .eq('playlist_id', selectedPlaylist)
        .eq('music_id', trackId);

      if (error) throw error;

      toast.success("Đã xóa khỏi playlist");
      loadPlaylistTracks(selectedPlaylist);
    } catch (error) {
      console.error('Remove from playlist error:', error);
      toast.error("Không thể xóa khỏi playlist");
    }
  };

  const allTracks = [...PUBLIC_TRACKS, ...userTracks];
  
  const filteredTracks = selectedGenre === "all" 
    ? allTracks 
    : allTracks.filter(track => track.genre === selectedGenre);

  const displayTracks = selectedPlaylist ? playlistTracks : filteredTracks;

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
              <div className="flex gap-3 justify-center mt-6">
                <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-primary to-secondary hover:shadow-xl transition-all text-lg px-8 py-6 rounded-full">
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
                      <div className="space-y-2">
                        <Label htmlFor="genre">Thể loại</Label>
                        <Select value={uploadGenre} onValueChange={setUploadGenre} disabled={uploading}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {GENRES.filter(g => g.value !== 'all').map(genre => (
                              <SelectItem key={genre.value} value={genre.value}>
                                {genre.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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

                <Dialog open={createPlaylistOpen} onOpenChange={setCreatePlaylistOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="text-lg px-8 py-6 rounded-full border-2 border-primary/30">
                      <ListMusic className="w-5 h-5 mr-2" />
                      Tạo Playlist
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="font-fredoka text-2xl text-primary">
                        Tạo Playlist Mới
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="playlist-name">Tên playlist *</Label>
                        <Input
                          id="playlist-name"
                          value={newPlaylistName}
                          onChange={(e) => setNewPlaylistName(e.target.value)}
                          placeholder="Nhạc yêu thích..."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="playlist-desc">Mô tả</Label>
                        <Input
                          id="playlist-desc"
                          value={newPlaylistDesc}
                          onChange={(e) => setNewPlaylistDesc(e.target.value)}
                          placeholder="Mô tả playlist (tùy chọn)"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="playlist-public"
                          checked={newPlaylistPublic}
                          onChange={(e) => setNewPlaylistPublic(e.target.checked)}
                          className="w-4 h-4"
                        />
                        <Label htmlFor="playlist-public">Công khai (mọi người có thể xem)</Label>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleCreatePlaylist} disabled={!newPlaylistName.trim()}>
                        Tạo Playlist
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
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

          {/* Tabs for Playlists */}
          <Card className="border-4 border-primary/30 mb-6">
            <CardContent className="pt-6">
              <Tabs defaultValue="all" onValueChange={(value) => {
                if (value === "all") {
                  setSelectedPlaylist(null);
                } else {
                  setSelectedPlaylist(value);
                }
              }}>
                <div className="flex items-center gap-4 flex-wrap mb-4">
                  <TabsList className="bg-primary/10">
                    <TabsTrigger value="all">
                      <Music className="w-4 h-4 mr-2" />
                      Tất cả nhạc
                    </TabsTrigger>
                    {playlists.map(playlist => (
                      <TabsTrigger key={playlist.id} value={playlist.id}>
                        <ListMusic className="w-4 h-4 mr-2" />
                        {playlist.name}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {!selectedPlaylist && (
                    <div className="flex items-center gap-2 ml-auto">
                      <Filter className="w-4 h-4 text-muted-foreground" />
                      <Select value={selectedGenre} onValueChange={setSelectedGenre}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {GENRES.map(genre => (
                            <SelectItem key={genre.value} value={genre.value}>
                              {genre.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                <TabsContent value="all" className="mt-0">
                  <p className="text-sm text-muted-foreground mb-4">
                    {filteredTracks.length} bài hát
                  </p>
                </TabsContent>
                
                {playlists.map(playlist => (
                  <TabsContent key={playlist.id} value={playlist.id} className="mt-0">
                    <p className="text-sm text-muted-foreground mb-4">
                      {playlist.description || `${playlistTracks.length} bài hát`}
                    </p>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>

          {/* Track List */}
          <Card className="border-4 border-primary/30">
            <CardContent className="pt-6">
              <div className="space-y-4">
                {displayTracks.length === 0 ? (
                  <div className="text-center py-12">
                    <Music className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-lg text-muted-foreground">
                      {selectedPlaylist ? "Playlist trống" : "Không có bài hát nào"}
                    </p>
                  </div>
                ) : (
                  displayTracks.map((track) => (
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
                            {track.genre && ` • ${GENRES.find(g => g.value === track.genre)?.label || track.genre}`}
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

                        {user && playlists.length > 0 && !selectedPlaylist && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                size="icon"
                                variant="outline"
                                className="border-3 border-primary/30 hover:border-primary hover:bg-primary/10"
                                title="Thêm vào playlist"
                              >
                                <Plus className="w-5 h-5 text-primary" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {playlists.filter(p => p.user_id === user.id).map(playlist => (
                                <DropdownMenuItem
                                  key={playlist.id}
                                  onClick={() => handleAddToPlaylist(playlist.id, track.id)}
                                >
                                  <ListMusic className="w-4 h-4 mr-2" />
                                  {playlist.name}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}

                        {selectedPlaylist && (
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => handleRemoveFromPlaylist(track.id)}
                            className="border-3 border-destructive/30 hover:border-destructive hover:bg-destructive/10"
                            title="Xóa khỏi playlist"
                          >
                            <Trash2 className="w-5 h-5 text-destructive" />
                          </Button>
                        )}

                        {track.isUserUpload && track.userId === user?.id && !selectedPlaylist && (
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => handleDeleteTrack(track)}
                            className="border-3 border-destructive/30 hover:border-destructive hover:bg-destructive/10"
                            title="Xóa bài hát"
                          >
                            <Trash2 className="w-5 h-5 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <audio
        ref={audioRef}
        src={currentTrack?.src}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
      />
    </div>
  );
}
