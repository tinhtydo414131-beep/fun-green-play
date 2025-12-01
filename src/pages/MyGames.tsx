import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Upload, Clock, CheckCircle, XCircle, Trash2 } from "lucide-react";

interface UploadedGame {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'pending' | 'approved' | 'rejected';
  thumbnail_path: string | null;
  play_count: number;
  created_at: string;
  rejection_note: string | null;
}

const MyGames = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [games, setGames] = useState<UploadedGame[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchMyGames();
  }, [user]);

  const fetchMyGames = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('uploaded_games')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGames(data || []);
    } catch (error: any) {
      console.error("Fetch error:", error);
      toast.error("Failed to load your games");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (gameId: string) => {
    if (!confirm("Are you sure you want to delete this game?")) return;

    try {
      const { error } = await supabase
        .from('uploaded_games')
        .delete()
        .eq('id', gameId)
        .eq('user_id', user?.id);

      if (error) throw error;
      toast.success("Game deleted successfully");
      fetchMyGames();
    } catch (error: any) {
      console.error("Delete error:", error);
      toast.error("Failed to delete game");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'approved': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'rejected': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: any = {
      pending: 'secondary',
      approved: 'default',
      rejected: 'destructive'
    };
    return <Badge variant={variants[status] || 'secondary'}>{status.toUpperCase()}</Badge>;
  };

  const renderGameCard = (game: UploadedGame) => (
    <Card key={game.id} className="p-6 shadow-lg">
      <div className="flex gap-4">
        <div className="flex-shrink-0">
          {game.thumbnail_path ? (
            <img
              src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/uploaded-games/${game.thumbnail_path}`}
              alt={game.title}
              className="w-32 h-32 object-cover rounded-lg"
            />
          ) : (
            <div className="w-32 h-32 bg-muted rounded-lg flex items-center justify-center">
              <span className="text-4xl">🎮</span>
            </div>
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="text-xl font-bold">{game.title}</h3>
              <p className="text-sm text-muted-foreground">{game.category}</p>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(game.status)}
              {getStatusBadge(game.status)}
            </div>
          </div>

          <p className="text-sm mb-4">{game.description || "No description"}</p>

          {game.status === 'approved' && (
            <p className="text-sm text-muted-foreground mb-4">
              Plays: {game.play_count}
            </p>
          )}

          {game.status === 'rejected' && game.rejection_note && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 mb-4">
              <p className="text-sm text-destructive font-medium mb-1">Rejection Reason:</p>
              <p className="text-sm">{game.rejection_note}</p>
            </div>
          )}

          <div className="flex gap-2">
            {game.status === 'pending' && (
              <Button
                onClick={() => handleDelete(game.id)}
                variant="destructive"
                size="sm"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8">
          <p className="text-center">Please sign in to view your games</p>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const pending = games.filter(g => g.status === 'pending');
  const approved = games.filter(g => g.status === 'approved');
  const rejected = games.filter(g => g.status === 'rejected');

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">My Games</h1>
            <p className="text-muted-foreground">Manage your uploaded games</p>
          </div>
          <Button onClick={() => navigate('/upload-game')} size="lg">
            <Upload className="w-5 h-5 mr-2" />
            Upload New Game
          </Button>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="all">
              All ({games.length})
            </TabsTrigger>
            <TabsTrigger value="pending">
              <Clock className="w-4 h-4 mr-2" />
              Pending ({pending.length})
            </TabsTrigger>
            <TabsTrigger value="approved">
              <CheckCircle className="w-4 h-4 mr-2" />
              Approved ({approved.length})
            </TabsTrigger>
            <TabsTrigger value="rejected">
              <XCircle className="w-4 h-4 mr-2" />
              Rejected ({rejected.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {games.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-xl text-muted-foreground mb-4">No games uploaded yet</p>
                <Button onClick={() => navigate('/upload-game')}>
                  <Upload className="w-5 h-5 mr-2" />
                  Upload Your First Game
                </Button>
              </Card>
            ) : (
              games.map(renderGameCard)
            )}
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
            {pending.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">No pending games</p>
              </Card>
            ) : (
              pending.map(renderGameCard)
            )}
          </TabsContent>

          <TabsContent value="approved" className="space-y-4">
            {approved.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">No approved games yet</p>
              </Card>
            ) : (
              approved.map(renderGameCard)
            )}
          </TabsContent>

          <TabsContent value="rejected" className="space-y-4">
            {rejected.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">No rejected games</p>
              </Card>
            ) : (
              rejected.map(renderGameCard)
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MyGames;
