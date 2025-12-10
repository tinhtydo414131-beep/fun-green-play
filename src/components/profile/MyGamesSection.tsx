import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  Gamepad2, 
  Eye, 
  Edit, 
  Trash2, 
  Plus, 
  Loader2, 
  Clock, 
  CheckCircle2, 
  XCircle,
  Download,
  Play,
  Gem,
  RotateCcw,
  Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import GameDeleteModal from "@/components/GameDeleteModal";
import { useGameTrash } from "@/hooks/useGameTrash";
import { useAuth } from "@/hooks/useAuth";

interface UploadedGame {
  id: string;
  title: string;
  description: string | null;
  status: string;
  thumbnail_path: string | null;
  play_count: number;
  download_count: number;
  created_at: string;
  deleted_at: string | null;
  delete_reason: string | null;
}

interface MyGamesSectionProps {
  userId: string;
}

export function MyGamesSection({ userId }: MyGamesSectionProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [games, setGames] = useState<UploadedGame[]>([]);
  const [deletedGames, setDeletedGames] = useState<UploadedGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<"active" | "trash">("active");
  const [gameToDelete, setGameToDelete] = useState<UploadedGame | null>(null);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const { moveToTrash, isDeleting } = useGameTrash();

  useEffect(() => {
    if (userId) {
      loadGames();
    }
  }, [userId]);

  const loadGames = async () => {
    setLoading(true);
    try {
      // Fetch active games
      const { data: activeGames, error: activeError } = await supabase
        .from("uploaded_games")
        .select("id, title, description, status, thumbnail_path, play_count, download_count, created_at, deleted_at, delete_reason")
        .eq("user_id", userId)
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

      if (activeError) throw activeError;

      // Fetch deleted games
      const { data: trashedGames, error: trashError } = await supabase
        .from("uploaded_games")
        .select("id, title, description, status, thumbnail_path, play_count, download_count, created_at, deleted_at, delete_reason")
        .eq("user_id", userId)
        .not("deleted_at", "is", null)
        .order("deleted_at", { ascending: false });

      if (trashError) throw trashError;

      setGames(activeGames || []);
      setDeletedGames(trashedGames || []);
    } catch (error) {
      console.error("Error loading games:", error);
      toast.error("Không thể tải danh sách game");
    } finally {
      setLoading(false);
    }
  };

  const getThumbnailUrl = (path: string | null) => {
    if (!path) return "/images/games/platformer.jpg";
    return supabase.storage.from("game-thumbnails").getPublicUrl(path).data.publicUrl;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500/20 text-green-500 border-green-500/30"><CheckCircle2 className="w-3 h-3 mr-1" /> Đã duyệt</Badge>;
      case "rejected":
        return <Badge className="bg-red-500/20 text-red-500 border-red-500/30"><XCircle className="w-3 h-3 mr-1" /> Từ chối</Badge>;
      default:
        return <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30"><Clock className="w-3 h-3 mr-1" /> Chờ duyệt</Badge>;
    }
  };

  const handleDeleteConfirm = async (reason: string, detail: string) => {
    if (!gameToDelete || !user) return;
    
    const success = await moveToTrash(gameToDelete.id, reason, detail, user.id);
    if (success) {
      setGameToDelete(null);
      loadGames();
    }
  };

  const handleRestore = async (gameId: string) => {
    setRestoringId(gameId);
    try {
      const { error } = await supabase
        .from("uploaded_games")
        .update({ deleted_at: null, delete_reason: null, delete_reason_detail: null })
        .eq("id", gameId);

      if (error) throw error;
      toast.success("🎮 Game đã được khôi phục!");
      loadGames();
    } catch (error) {
      console.error("Error restoring game:", error);
      toast.error("Không thể khôi phục game");
    } finally {
      setRestoringId(null);
    }
  };

  const getDaysRemaining = (deletedAt: string) => {
    const deleted = new Date(deletedAt);
    const expiry = new Date(deleted.getTime() + 30 * 24 * 60 * 60 * 1000);
    const now = new Date();
    const days = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, days);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const totalGames = games.length;
  const approvedGames = games.filter(g => g.status === "approved").length;

  return (
    <div className="space-y-6">
      {/* Stats Header */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-4 text-center">
            <Gamepad2 className="w-8 h-8 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold text-primary">{totalGames}</p>
            <p className="text-xs text-muted-foreground">Tổng game</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
          <CardContent className="p-4 text-center">
            <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-green-500" />
            <p className="text-2xl font-bold text-green-500">{approvedGames}</p>
            <p className="text-xs text-muted-foreground">Đã duyệt</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
          <CardContent className="p-4 text-center">
            <Play className="w-8 h-8 mx-auto mb-2 text-blue-500" />
            <p className="text-2xl font-bold text-blue-500">
              {games.reduce((sum, g) => sum + (g.play_count || 0), 0)}
            </p>
            <p className="text-xs text-muted-foreground">Lượt chơi</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/20">
          <CardContent className="p-4 text-center">
            <Download className="w-8 h-8 mx-auto mb-2 text-amber-500" />
            <p className="text-2xl font-bold text-amber-500">
              {games.reduce((sum, g) => sum + (g.download_count || 0), 0)}
            </p>
            <p className="text-xs text-muted-foreground">Lượt tải</p>
          </CardContent>
        </Card>
      </div>

      {/* View Tabs */}
      <Tabs value={activeView} onValueChange={(v) => setActiveView(v as "active" | "trash")}>
        <div className="flex items-center justify-between">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="active" className="gap-2">
              <Gamepad2 className="w-4 h-4" />
              Game đang hoạt động ({games.length})
            </TabsTrigger>
            <TabsTrigger value="trash" className="gap-2">
              <Gem className="w-4 h-4" />
              Thùng rác ({deletedGames.length})
            </TabsTrigger>
          </TabsList>
          <Button onClick={() => navigate("/upload-game")} className="gap-2 bg-gradient-to-r from-primary to-secondary">
            <Plus className="w-4 h-4" />
            Upload Game
          </Button>
        </div>

        {/* Active Games */}
        <TabsContent value="active" className="mt-4">
          {games.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <Gamepad2 className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
                <h3 className="text-lg font-semibold mb-2">Chưa có game nào</h3>
                <p className="text-muted-foreground mb-4">Bắt đầu sáng tạo và upload game đầu tiên của bạn!</p>
                <Button onClick={() => navigate("/upload-game")} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Upload Game Ngay
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              <AnimatePresence>
                {games.map((game, index) => (
                  <motion.div
                    key={game.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="overflow-hidden hover:shadow-lg transition-all group">
                      <div className="flex">
                        <div className="w-32 h-24 flex-shrink-0">
                          <img
                            src={getThumbnailUrl(game.thumbnail_path)}
                            alt={game.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <CardContent className="flex-1 p-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold truncate">{game.title}</h3>
                              <p className="text-xs text-muted-foreground line-clamp-1">{game.description}</p>
                              <div className="flex items-center gap-2 mt-2">
                                {getStatusBadge(game.status)}
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Play className="w-3 h-3" /> {game.play_count || 0}
                                </span>
                              </div>
                            </div>
                            <div className="flex flex-col gap-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7"
                                onClick={() => navigate(`/game-details/${game.id}`)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7"
                                onClick={() => navigate(`/edit-game/${game.id}`)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 text-amber-500 hover:text-amber-600 hover:bg-amber-500/10"
                                onClick={() => setGameToDelete(game)}
                              >
                                <Gem className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </TabsContent>

        {/* Trash */}
        <TabsContent value="trash" className="mt-4">
          {deletedGames.length === 0 ? (
            <Card className="border-dashed border-amber-400/30">
              <CardContent className="py-12 text-center">
                <Gem className="w-16 h-16 mx-auto mb-4 text-amber-400/30" />
                <h3 className="text-lg font-semibold mb-2">Thùng rác trống!</h3>
                <p className="text-muted-foreground">Không có game nào trong thùng rác</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              <AnimatePresence>
                {deletedGames.map((game, index) => (
                  <motion.div
                    key={game.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="overflow-hidden border-amber-400/20 bg-gradient-to-br from-amber-950/10 to-background">
                      <div className="flex">
                        <div className="w-32 h-24 flex-shrink-0 relative">
                          <img
                            src={getThumbnailUrl(game.thumbnail_path)}
                            alt={game.title}
                            className="w-full h-full object-cover opacity-60"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        </div>
                        <CardContent className="flex-1 p-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold truncate">{game.title}</h3>
                              <p className="text-xs text-amber-500">
                                Còn {getDaysRemaining(game.deleted_at!)} ngày
                              </p>
                              <Badge variant="outline" className="mt-1 text-xs border-amber-400/30 text-amber-400">
                                <Sparkles className="w-3 h-3 mr-1" />
                                Trong thùng rác
                              </Badge>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-amber-400/30 text-amber-500 hover:bg-amber-500/10"
                              onClick={() => handleRestore(game.id)}
                              disabled={restoringId === game.id}
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
                          </div>
                        </CardContent>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Delete Modal */}
      <GameDeleteModal
        open={!!gameToDelete}
        onOpenChange={(open) => !open && setGameToDelete(null)}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
        gameTitle={gameToDelete?.title || ""}
      />
    </div>
  );
}
