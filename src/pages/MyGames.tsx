import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Edit, Trash2, Loader2, Upload, ArrowLeft, Coins, Trophy, Gamepad2 } from "lucide-react";
import { REWARDS } from "@/lib/web3-bsc";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
}

export default function MyGames() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [games, setGames] = useState<UploadedGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [gameToDelete, setGameToDelete] = useState<string | null>(null);

  // Calculate stats
  const approvedGames = games.filter(g => g.status === 'approved').length;
  const pendingGames = games.filter(g => g.status === 'pending').length;
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
      .order('created_at', { ascending: false });

    if (error) {
      toast.error("Failed to load your games");
      console.error(error);
    } else {
      setGames(data || []);
    }
    setLoading(false);
  };

  const handleDelete = async (gameId: string) => {
    setDeletingId(gameId);
    try {
      const game = games.find(g => g.id === gameId);
      if (!game) return;

      // Delete files from storage
      const { error: gameFileError } = await supabase.storage
        .from('uploaded-games')
        .remove([game.game_file_path]);

      if (gameFileError) console.error('Game file deletion error:', gameFileError);

      if (game.thumbnail_path) {
        const { error: thumbnailError } = await supabase.storage
          .from('uploaded-games')
          .remove([game.thumbnail_path]);

        if (thumbnailError) console.error('Thumbnail deletion error:', thumbnailError);
      }

      // Delete database record
      const { error: dbError } = await supabase
        .from('uploaded_games')
        .delete()
        .eq('id', gameId);

      if (dbError) throw dbError;

      toast.success("Game deleted successfully");
      loadGames();
    } catch (error: any) {
      console.error('Delete error:', error);
      toast.error(error.message || "Failed to delete game");
    } finally {
      setDeletingId(null);
      setGameToDelete(null);
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
              My Games
            </h1>
            <p className="text-muted-foreground mt-2">Manage your uploaded games</p>
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
                <p className="text-2xl font-bold">{games.length}</p>
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

        {games.length === 0 ? (
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
            {games.map((game) => (
              <Card key={game.id} className="border-primary/20 overflow-hidden">
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
                        variant="destructive"
                        size="sm"
                        onClick={() => setGameToDelete(game.id)}
                        disabled={deletingId === game.id}
                      >
                        {deletingId === game.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <AlertDialog open={!!gameToDelete} onOpenChange={() => setGameToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete your game and all associated files. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => gameToDelete && handleDelete(gameToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
