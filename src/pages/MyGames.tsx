import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Edit, Loader2, Upload, ArrowLeft, Coins, Trophy, Gamepad2, Gem, Trash2 } from "lucide-react";
import { REWARDS } from "@/lib/web3-bsc";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GameDeleteModal from "@/components/GameDeleteModal";
import GameTrashView from "@/components/GameTrashView";
import { useGameTrash } from "@/hooks/useGameTrash";

interface UploadedGame {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  status: string;
  game_file_path: string;
  thumbnail_path: string;
  created_at: string;
  play_count: number;
  download_count: number;
  deleted_at: string | null;
}

export default function MyGames() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [games, setGames] = useState<UploadedGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [gameToDelete, setGameToDelete] = useState<UploadedGame | null>(null);
  const [activeTab, setActiveTab] = useState("active");
  
  const { moveToTrash, isDeleting } = useGameTrash();

  // Filter only active (non-deleted) games
  const activeGames = games.filter(g => !g.deleted_at);
  
  // Calculate stats
  const approvedGames = activeGames.filter(g => g.status === 'approved').length;
  const totalCamlyEarned = approvedGames * REWARDS.UPLOAD_GAME;

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    loadGames();
  }, [user]);

  const loadGames = async () => {
    if (!user) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('uploaded_games')
      .select('*')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) {
      toast.error("Failed to load your games");
      console.error(error);
    } else {
      setGames(data || []);
    }
    setLoading(false);
  };

  const handleDeleteConfirm = async (reason: string, detail: string) => {
    if (!gameToDelete || !user) return;
    
    const success = await moveToTrash(gameToDelete.id, reason, detail, user.id);
    if (success) {
      setGameToDelete(null);
      loadGames();
    }
  };

  const getThumbnailUrl = (path: string) => {
    const { data } = supabase.storage
      .from('uploaded-games')
      .getPublicUrl(path);
    return data.publicUrl;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background p-4">
      <div className="container max-w-6xl mx-auto py-8">
        <Button
          variant="outline"
          onClick={() => navigate('/dashboard')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
        
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Quản lý Kho Báu
            </h1>
            <p className="text-muted-foreground mt-2">Quản lý và dọn dẹp game của bạn</p>
          </div>
          <Button
            onClick={() => navigate('/upload-game')}
            className="bg-gradient-to-r from-primary to-secondary"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload New Game
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="border-primary/20 bg-gradient-to-br from-primary/10 to-secondary/10">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/20">
                <Gamepad2 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeGames.length}</p>
                <p className="text-sm text-muted-foreground">Total Games</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-green-500/20 bg-gradient-to-br from-green-500/10 to-emerald-500/10">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-full bg-green-500/20">
                <Trophy className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{approvedGames}</p>
                <p className="text-sm text-muted-foreground">Approved</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-yellow-500/20 bg-gradient-to-br from-yellow-500/10 to-orange-500/10">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-full bg-yellow-500/20">
                <Coins className="w-6 h-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-600">{totalCamlyEarned.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">CAMLY Earned</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for Active Games and Trash */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
            <TabsTrigger value="active" className="flex items-center gap-2">
              <Gamepad2 className="w-4 h-4" />
              Game của tôi
            </TabsTrigger>
            <TabsTrigger value="trash" className="flex items-center gap-2">
              <Gem className="w-4 h-4" />
              Thùng rác
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active">
            {activeGames.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground mb-4">You haven't uploaded any games yet.</p>
                  <Button
                    onClick={() => navigate('/upload-game')}
                    className="bg-gradient-to-r from-primary to-secondary"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Your First Game
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {activeGames.map((game) => (
                  <Card key={game.id} className="border-primary/20 overflow-hidden group">
                    <div className="aspect-video relative overflow-hidden bg-muted">
                      {game.thumbnail_path ? (
                        <img
                          src={getThumbnailUrl(game.thumbnail_path)}
                          alt={game.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          No thumbnail
                        </div>
                      )}
                    </div>
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-xl line-clamp-1">{game.title}</CardTitle>
                        <Badge variant={game.status === 'approved' ? 'default' : 'secondary'}>
                          {game.status}
                        </Badge>
                      </div>
                      <CardDescription className="line-clamp-2">
                        {game.description || 'No description'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex gap-2 flex-wrap">
                        <Badge variant="outline">{game.category}</Badge>
                        {game.tags?.map((tag, i) => (
                          <Badge key={i} variant="outline">{tag}</Badge>
                        ))}
                      </div>
                      
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>Plays: {game.play_count}</p>
                        <p>Downloads: {game.download_count}</p>
                        <p>Uploaded: {new Date(game.created_at).toLocaleDateString()}</p>
                      </div>

                      <div className="space-y-2">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => navigate(`/game-details/${game.id}`)}
                          className="w-full bg-gradient-to-r from-primary to-secondary"
                        >
                          View Details & Reviews
                        </Button>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/edit-game/${game.id}`)}
                            className="flex-1"
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setGameToDelete(game)}
                            className="border-amber-400/50 hover:bg-amber-400/10 hover:border-amber-400"
                          >
                            <Gem className="h-4 w-4 text-amber-400" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="trash">
            <GameTrashView />
          </TabsContent>
        </Tabs>
      </div>

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
