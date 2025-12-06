import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Music, Trash2, Download, Coins, AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  validateMusicUpload, 
  formatCoins, 
  ValidationResponse,
  ValidationCodeIcons 
} from "@/utils/musicUploadValidation";

interface MusicFile {
  name: string;
  path: string;
  created_at: string;
}

// ===== CẤU HÌNH HIỂN THỊ =====
const CONFIG = {
  MAX_DAILY_REWARDS: 4,
  REWARD_AMOUNT: 50000,
};

export default function MusicLibrary() {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [musicFiles, setMusicFiles] = useState<MusicFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [dailyInfo, setDailyInfo] = useState<{
    rewardsUsed: number;
    rewardsRemaining: number;
    maxDaily: number;
  } | null>(null);
  const [lastValidation, setLastValidation] = useState<ValidationResponse | null>(null);

  // Load daily info khi component mount
  useEffect(() => {
    if (user) {
      loadDailyInfo();
      loadMusicFiles();
    }
  }, [user]);

  const loadDailyInfo = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('daily_upload_rewards')
        .select('reward_count')
        .eq('user_id', user.id)
        .eq('reward_date', new Date().toISOString().split('T')[0])
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading daily info:', error);
        return;
      }

      const rewardsUsed = data?.reward_count || 0;
      setDailyInfo({
        rewardsUsed,
        rewardsRemaining: CONFIG.MAX_DAILY_REWARDS - rewardsUsed,
        maxDaily: CONFIG.MAX_DAILY_REWARDS
      });
    } catch (error) {
      console.error('Error loading daily info:', error);
    }
  };

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

    // Reset input
    event.target.value = '';

    // Supported audio formats
    const supportedTypes = [
      'audio/mpeg', 'audio/mp3',
      'audio/mp4', 'audio/m4a', 'audio/x-m4a',
      'audio/wav', 'audio/x-wav', 'audio/wave',
      'audio/ogg', 'audio/vorbis',
      'audio/flac', 'audio/x-flac'
    ];
    
    const supportedExtensions = ['.mp3', '.m4a', '.wav', '.ogg', '.flac'];
    
    const isValidType = supportedTypes.some(type => file.type.includes(type));
    const isValidExtension = supportedExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
    
    if (!isValidType && !isValidExtension) {
      toast.error("Chỉ chấp nhận file MP3, M4A, WAV, OGG, hoặc FLAC");
      return;
    }

    // ===== BƯỚC 1: VALIDATE CHỐNG ABUSE =====
    setValidating(true);
    setLastValidation(null);
    
    try {
      // Lấy access token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        toast.error("Phiên đăng nhập không hợp lệ");
        setValidating(false);
        return;
      }

      toast.info("🔍 Đang kiểm tra file...");
      
      // Gọi edge function validate
      const validation = await validateMusicUpload(file, session.access_token);
      setLastValidation(validation);
      
      // Cập nhật daily info nếu có
      if (validation.dailyInfo) {
        setDailyInfo(validation.dailyInfo);
      }

      // Nếu không được upload → dừng lại
      if (!validation.canUpload) {
        toast.error(validation.message);
        setValidating(false);
        return;
      }

      setValidating(false);

      // ===== BƯỚC 2: UPLOAD FILE NẾU ĐƯỢC PHÉP =====
      setUploading(true);

      // Sanitize filename
      const sanitizedFileName = file.name
        .replace(/[^\w\s.-]/g, '')
        .replace(/\s+/g, '_')
        .replace(/_{2,}/g, '_')
        .toLowerCase();
      
      const filePath = `${user.id}/${Date.now()}-${sanitizedFileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('music')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Hiển thị kết quả
      if (validation.canReceiveReward) {
        toast.success(validation.message, {
          duration: 5000,
          icon: '🎉'
        });
      } else {
        toast.warning(validation.message, {
          duration: 5000
        });
      }

      // Reload data
      loadMusicFiles();
      loadDailyInfo();

    } catch (error) {
      console.error('Error uploading music:', error);
      toast.error("Không thể tải nhạc lên. Vui lòng thử lại.");
    } finally {
      setValidating(false);
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
              Tải lên và quản lý các file nhạc của bạn
            </p>
          </div>

          {/* Daily Rewards Info */}
          {user && dailyInfo && (
            <Card className="mb-6 border-2 border-yellow-500/30 bg-gradient-to-r from-yellow-500/10 to-orange-500/10">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Coins className="w-6 h-6 text-yellow-500" />
                    <span className="font-fredoka text-lg">Thưởng Hôm Nay</span>
                  </div>
                  <span className="font-bold text-lg">
                    {dailyInfo.rewardsUsed}/{dailyInfo.maxDaily} bài
                  </span>
                </div>
                
                <Progress 
                  value={(dailyInfo.rewardsUsed / dailyInfo.maxDaily) * 100} 
                  className="h-3 mb-2"
                />
                
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>
                    {dailyInfo.rewardsRemaining > 0 
                      ? `Còn ${dailyInfo.rewardsRemaining} lần nhận ${formatCoins(CONFIG.REWARD_AMOUNT)} coins`
                      : '🎯 Đã đạt giới hạn hôm nay!'
                    }
                  </span>
                  <span className="text-yellow-600 font-semibold">
                    +{formatCoins(CONFIG.REWARD_AMOUNT)} coins/bài
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Last Validation Result */}
          {lastValidation && !lastValidation.success && (
            <Alert 
              variant={lastValidation.canUpload ? "default" : "destructive"} 
              className="mb-6"
            >
              {lastValidation.canUpload ? (
                <Info className="h-4 w-4" />
              ) : (
                <AlertTriangle className="h-4 w-4" />
              )}
              <AlertTitle>
                {ValidationCodeIcons[lastValidation.code] || '⚠️'} Thông báo
              </AlertTitle>
              <AlertDescription>
                {lastValidation.message}
              </AlertDescription>
            </Alert>
          )}

          {/* Upload Section */}
          <Card className="mb-8 border-4 border-primary/30">
            <CardHeader>
              <CardTitle className="font-fredoka text-2xl flex items-center gap-2">
                <Upload className="w-6 h-6" />
                Tải Nhạc Lên
                {dailyInfo && dailyInfo.rewardsRemaining > 0 && (
                  <span className="ml-2 px-3 py-1 bg-yellow-500/20 text-yellow-600 text-sm rounded-full">
                    +{formatCoins(CONFIG.REWARD_AMOUNT)} 🪙
                  </span>
                )}
              </CardTitle>
              <CardDescription>
                Upload nhạc để nhận thưởng Camly coins! (Tối đa {CONFIG.MAX_DAILY_REWARDS} bài/ngày)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="music-upload" className="cursor-pointer">
                    <div className={`
                      border-4 border-dashed rounded-2xl p-8 text-center transition-all
                      ${validating || uploading 
                        ? 'border-muted cursor-not-allowed opacity-60' 
                        : 'border-primary/30 hover:border-primary/60 hover:bg-primary/5'
                      }
                    `}>
                      {validating ? (
                        <>
                          <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
                          <p className="font-fredoka text-lg mb-2">
                            Đang kiểm tra file...
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Xác minh hash & metadata chống trùng lặp
                          </p>
                        </>
                      ) : uploading ? (
                        <>
                          <div className="animate-pulse">
                            <Upload className="w-12 h-12 mx-auto mb-4 text-primary" />
                          </div>
                          <p className="font-fredoka text-lg mb-2">
                            Đang tải lên...
                          </p>
                        </>
                      ) : (
                        <>
                          <Music className="w-12 h-12 mx-auto mb-4 text-primary" />
                          <p className="font-fredoka text-lg mb-2">
                            Nhấp để chọn file nhạc
                          </p>
                          <p className="text-sm text-muted-foreground">
                            MP3, M4A, WAV, OGG, FLAC (Tối đa 50MB)
                          </p>
                        </>
                      )}
                    </div>
                  </Label>
                  <Input
                    id="music-upload"
                    type="file"
                    accept=".mp3,.m4a,.wav,.ogg,.flac,audio/mpeg,audio/mp4,audio/m4a,audio/wav,audio/ogg,audio/flac"
                    className="hidden"
                    onChange={handleFileUpload}
                    disabled={uploading || validating || !user}
                  />
                </div>
                
                {!user && (
                  <p className="text-center text-sm text-muted-foreground">
                    Vui lòng đăng nhập để tải nhạc lên và nhận thưởng
                  </p>
                )}

                {/* Anti-abuse Info */}
                <div className="bg-muted/50 rounded-xl p-4 space-y-2">
                  <p className="font-semibold text-sm flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    Hệ thống chống abuse
                  </p>
                  <ul className="text-xs text-muted-foreground space-y-1 ml-6">
                    <li>• Mỗi file được kiểm tra SHA-256 hash để phát hiện trùng lặp</li>
                    <li>• Giới hạn {CONFIG.MAX_DAILY_REWARDS} bài được thưởng mỗi ngày</li>
                    <li>• Phân tích metadata (duration, bitrate) chống re-encode</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Music List */}
          <Card className="border-4 border-primary/30">
            <CardHeader>
              <CardTitle className="font-fredoka text-2xl flex items-center gap-2">
                <Music className="w-6 h-6" />
                Nhạc Của Bạn ({musicFiles.length})
              </CardTitle>
              <CardDescription>
                <Button
                  onClick={loadMusicFiles}
                  variant="outline"
                  size="sm"
                  disabled={loading || !user}
                  className="mt-2"
                >
                  {loading ? "Đang tải..." : "Làm mới danh sách"}
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
