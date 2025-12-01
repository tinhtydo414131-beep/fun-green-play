import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { CheckCircle, XCircle, Clock, Shield } from "lucide-react";

interface PendingGame {
  id: string;
  title: string;
  description: string;
  category: string;
  created_at: string;
  thumbnail_path: string | null;
  user_id: string;
  profiles: {
    username: string;
  };
}

const AdminReview = () => {
  const { user } = useAuth();
  const [pendingGames, setPendingGames] = useState<PendingGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectionNote, setRejectionNote] = useState<{[key: string]: string}>({});
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAdmin();
    fetchPendingGames();
  }, [user]);

  const checkAdmin = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();
    
    setIsAdmin(!!data);
  };

  const fetchPendingGames = async () => {
    try {
      const { data, error } = await supabase
        .from('uploaded_games')
        .select(`
          *,
          profiles!uploaded_games_user_id_fkey (username)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPendingGames(data || []);
    } catch (error: any) {
      console.error("Fetch error:", error);
      toast.error("Failed to load pending games");
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (gameId: string, status: 'approved' | 'rejected', creatorId: string) => {
    if (!user) return;

    try {
      // Update game status
      const { error: updateError } = await supabase
        .from('uploaded_games')
        .update({
          status,
          approved_by: user.id,
          approved_at: new Date().toISOString(),
          rejection_note: status === 'rejected' ? rejectionNote[gameId] : null
        })
        .eq('id', gameId);

      if (updateError) throw updateError;

      // Create review record
      const { error: reviewError } = await supabase
        .from('game_reviews')
        .insert({
          game_id: gameId,
          reviewer_id: user.id,
          status,
          notes: status === 'rejected' ? rejectionNote[gameId] : 'Game approved'
        });

      if (reviewError) throw reviewError;

      // Award 1M coins if approved
      if (status === 'approved') {
        const { data: currentProfile } = await supabase
          .from('profiles')
          .select('wallet_balance')
          .eq('id', creatorId)
          .single();

        if (currentProfile) {
          await supabase
            .from('profiles')
            .update({ 
              wallet_balance: (currentProfile.wallet_balance || 0) + 1000000
            })
            .eq('id', creatorId);
        }
      }

      toast.success(
        status === 'approved' 
          ? "✅ Game approved! Creator awarded 1,000,000 coins!" 
          : "❌ Game rejected"
      );
      
      fetchPendingGames();
    } catch (error: any) {
      console.error("Review error:", error);
      toast.error("Failed to process review");
    }
  };

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8">
          <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-center">Admin access required</p>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-primary/10 rounded-xl">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Admin Review Dashboard</h1>
            <p className="text-muted-foreground">{pendingGames.length} games pending review</p>
          </div>
        </div>

        {pendingGames.length === 0 ? (
          <Card className="p-12 text-center">
            <Clock className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Pending Games</h3>
            <p className="text-muted-foreground">All caught up! Check back later.</p>
          </Card>
        ) : (
          <div className="grid gap-6">
            {pendingGames.map((game) => (
              <Card key={game.id} className="p-6 shadow-lg border-2 border-primary/20">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-shrink-0">
                    {game.thumbnail_path ? (
                      <img
                        src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/uploaded-games/${game.thumbnail_path}`}
                        alt={game.title}
                        className="w-full md:w-48 h-48 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-full md:w-48 h-48 bg-muted rounded-lg flex items-center justify-center">
                        <span className="text-4xl">🎮</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-2xl font-bold mb-2">{game.title}</h3>
                        <p className="text-muted-foreground mb-2">
                          by {game.profiles.username}
                        </p>
                        <Badge variant="secondary">{game.category}</Badge>
                      </div>
                    </div>

                    <p className="text-sm mb-4">{game.description || "No description provided"}</p>

                    <div className="space-y-4">
                      <Textarea
                        placeholder="Rejection note (optional)..."
                        value={rejectionNote[game.id] || ''}
                        onChange={(e) => setRejectionNote({
                          ...rejectionNote,
                          [game.id]: e.target.value
                        })}
                        rows={2}
                      />

                      <div className="flex gap-3">
                        <Button
                          onClick={() => handleReview(game.id, 'approved', game.user_id)}
                          className="flex-1 bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Approve (+1M Coins)
                        </Button>
                        <Button
                          onClick={() => handleReview(game.id, 'rejected', game.user_id)}
                          variant="destructive"
                          className="flex-1"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminReview;
