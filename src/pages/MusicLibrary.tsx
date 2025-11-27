import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Music, Trash2, Download } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

interface MusicFile {
  name: string;
  path: string;
  created_at: string;
}

export default function MusicLibrary() {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [musicFiles, setMusicFiles] = useState<MusicFile[]>([]);
  const [loading, setLoading] = useState(false);

  const loadMusicFiles = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase.storage
        .from('music')
        .list(`${user.id}/`, {
          limit: 100,
          offset: 0,
          sortBy: { column: 'created_at', order: 'desc' }
        });

      if (error) throw error;

      setMusicFiles(data.map(file => ({
        name: file.name,
        path: `${user.id}/${file.name}`,
        created_at: file.created_at
      })));
    } catch (error) {
      console.error('Error loading music files:', error);
      toast.error("Không thể tải danh sách nhạc");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Check if file is MP3
    if (!file.type.includes('audio/mpeg') && !file.name.endsWith('.mp3')) {
      toast.error("Chỉ chấp nhận file MP3");
      return;
    }

    setUploading(true);
    try {
      const filePath = `${user.id}/${Date.now()}-${file.name}`;
      
      const { error } = await supabase.storage
        .from('music')
        .upload(filePath, file);

      if (error) throw error;

      toast.success("Tải nhạc lên thành công!");
      loadMusicFiles();
    } catch (error) {
      console.error('Error uploading music:', error);
      toast.error("Không thể tải nhạc lên");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (path: string) => {
    if (!confirm("Bạn có chắc muốn xóa file nhạc này?")) return;

    try {
      const { error } = await supabase.storage
        .from('music')
        .remove([path]);

      if (error) throw error;

      toast.success("Đã xóa file nhạc");
      loadMusicFiles();
    } catch (error) {
      console.error('Error deleting music:', error);
      toast.error("Không thể xóa file nhạc");
    }
  };

  const getPublicUrl = (path: string) => {
    const { data } = supabase.storage
      .from('music')
      .getPublicUrl(path);
    return data.publicUrl;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-fredoka font-bold text-primary mb-4">
              🎵 Thư Viện Nhạc
            </h1>
            <p className="text-lg text-muted-foreground font-comic">
              Tải lên và quản lý các file nhạc MP3 của bạn
            </p>
          </div>

          {/* Upload Section */}
          <Card className="mb-8 border-4 border-primary/30">
            <CardHeader>
              <CardTitle className="font-fredoka text-2xl flex items-center gap-2">
                <Upload className="w-6 h-6" />
                Tải Nhạc Lên
              </CardTitle>
              <CardDescription>
                Chọn file MP3 để tải lên thư viện của bạn
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="music-upload" className="cursor-pointer">
                    <div className="border-4 border-dashed border-primary/30 rounded-2xl p-8 text-center hover:border-primary/60 transition-colors">
                      <Music className="w-12 h-12 mx-auto mb-4 text-primary" />
                      <p className="font-fredoka text-lg mb-2">
                        Nhấp để chọn file MP3
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Hoặc kéo thả file vào đây
                      </p>
                    </div>
                  </Label>
                  <Input
                    id="music-upload"
                    type="file"
                    accept="audio/mpeg,.mp3"
                    className="hidden"
                    onChange={handleFileUpload}
                    disabled={uploading || !user}
                  />
                </div>
                
                {!user && (
                  <p className="text-center text-sm text-muted-foreground">
                    Vui lòng đăng nhập để tải nhạc lên
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Music List */}
          <Card className="border-4 border-primary/30">
            <CardHeader>
              <CardTitle className="font-fredoka text-2xl flex items-center gap-2">
                <Music className="w-6 h-6" />
                Nhạc Của Bạn
              </CardTitle>
              <CardDescription>
                <Button
                  onClick={loadMusicFiles}
                  variant="outline"
                  size="sm"
                  disabled={loading || !user}
                  className="mt-2"
                >
                  {loading ? "Đang tải..." : "Tải danh sách"}
                </Button>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                {musicFiles.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Music className="w-16 h-16 mx-auto mb-4 opacity-20" />
                    <p className="font-comic">
                      Chưa có nhạc nào. Tải lên file đầu tiên nhé!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {musicFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 border-2 border-border rounded-xl hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <Music className="w-5 h-5 text-primary shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="font-fredoka font-bold truncate">
                              {file.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(file.created_at).toLocaleDateString('vi-VN')}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 shrink-0">
                          <Button
                            size="icon"
                            variant="outline"
                            asChild
                            className="border-2 border-primary/30"
                          >
                            <a
                              href={getPublicUrl(file.path)}
                              download
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Download className="w-4 h-4" />
                            </a>
                          </Button>
                          
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => handleDelete(file.path)}
                            className="border-2 border-destructive/30 hover:bg-destructive/10"
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
