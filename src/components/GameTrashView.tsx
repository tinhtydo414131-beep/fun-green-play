import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Trash2, RotateCcw, Copy, Loader2, Clock, Gem } from "lucide-react";
import { format, differenceInDays, addDays } from "date-fns";
import { vi } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

interface DeletedGame {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  thumbnail_path: string;
  deleted_at: string;
  delete_reason: string;
  delete_reason_detail: string;
}

export default function GameTrashView() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [games, setGames] = useState<DeletedGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [revivingId, setRevivingId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadDeletedGames();
    }
  }, [user]);

  const loadDeletedGames = async () => {
    if (!user) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('uploaded_games')
      .select('*')
      .eq('user_id', user.id)
      .not('deleted_at', 'is', null)
      .order('deleted_at', { ascending: false });

    if (error) {
      console.error(error);
    } else {
      setGames(data || []);
    }
    setLoading(false);
  };

  const handleRestore = async (gameId: string) => {
    setRestoringId(gameId);
    try {
      const { error } = await supabase
        .from('uploaded_games')
        .update({ 
          deleted_at: null, 
          delete_reason: null, 
          delete_reason_detail: null 
        })
        .eq('id', gameId);

      if (error) throw error;

      // Trigger celebration
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#FFD700', '#FFA500', '#FF6B6B']
      });

      toast.success("🎉 Game đã được khôi phục thành công!");
      loadDeletedGames();
    } catch (error: any) {
      toast.error(error.message || "Không thể khôi phục game");
    } finally {
      setRestoringId(null);
    }
  };

  const handleRevive = async (game: DeletedGame) => {
    setRevivingId(game.id);
    
    // Navigate to upload page with pre-filled data
    navigate('/upload-game', { 
      state: { 
        reviveFrom: {
          title: game.title,
          description: game.description,
          category: game.category,
          tags: game.tags
        }
      }
    });
  };

  const getThumbnailUrl = (path: string) => {
    const { data } = supabase.storage
      .from('uploaded-games')
      .getPublicUrl(path);
    return data.publicUrl;
  };

  const getDaysRemaining = (deletedAt: string) => {
    const expiryDate = addDays(new Date(deletedAt), 30);
    return differenceInDays(expiryDate, new Date());
  };

  const getReasonLabel = (reason: string) => {
    const labels: Record<string, string> = {
      outdated: "🕹️ Game cũ",
      bugs: "🐛 Nhiều lỗi",
      boring: "😴 Không thú vị",
      new_idea: "💡 Ý tưởng mới",
      cleanup: "🧹 Dọn dẹp"
    };
    return labels[reason] || reason;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-amber-400" />
      </div>
    );
  }

  if (games.length === 0) {
    return (
      <Card className="border-dashed border-2 border-amber-400/30">
        <CardContent className="py-12 text-center">
          <Gem className="w-16 h-16 mx-auto mb-4 text-amber-400/50" />
          <p className="text-lg font-medium text-muted-foreground mb-2">Thùng rác trống!</p>
          <p className="text-sm text-muted-foreground">Các game đã xóa sẽ được lưu ở đây trong 30 ngày</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-full bg-amber-400/20">
          <Trash2 className="w-6 h-6 text-amber-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Thùng rác Kho Báu</h2>
          <p className="text-sm text-muted-foreground">{games.length} game đang chờ khôi phục</p>
        </div>
      </div>

      <AnimatePresence>
        <div className="grid gap-4 md:grid-cols-2">
          {games.map((game) => {
            const daysRemaining = getDaysRemaining(game.deleted_at);
            
            return (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="border-amber-400/20 bg-gradient-to-br from-amber-950/10 to-background overflow-hidden">
                  <div className="aspect-video relative overflow-hidden bg-muted/50">
                    {game.thumbnail_path ? (
                      <img
                        src={getThumbnailUrl(game.thumbnail_path)}
                        alt={game.title}
                        className="w-full h-full object-cover opacity-60"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        🎮
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <Badge 
                        variant="secondary" 
                        className={`${daysRemaining <= 7 ? 'bg-red-500/80' : 'bg-amber-500/80'} text-white`}
                      >
                        <Clock className="w-3 h-3 mr-1" />
                        {daysRemaining} ngày còn lại
                      </Badge>
                    </div>
                  </div>
                  
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg line-clamp-1 text-amber-100">{game.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {game.description || 'Không có mô tả'}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="border-amber-400/30">
                        {getReasonLabel(game.delete_reason)}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Xóa {format(new Date(game.deleted_at), 'dd/MM/yyyy', { locale: vi })}
                      </span>
                    </div>
                    
                    {game.delete_reason_detail && (
                      <p className="text-xs text-muted-foreground italic line-clamp-2">
                        "{game.delete_reason_detail}"
                      </p>
                    )}
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleRestore(game.id)}
                        disabled={restoringId === game.id}
                        className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                      >
                        {restoringId === game.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <RotateCcw className="w-4 h-4 mr-1" />
                            Khôi phục
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRevive(game)}
                        disabled={revivingId === game.id}
                        className="flex-1 border-amber-400/30 hover:bg-amber-400/10"
                      >
                        {revivingId === game.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Copy className="w-4 h-4 mr-1" />
                            Tạo bản mới
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </AnimatePresence>
    </div>
  );
}
