import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { CheckCircle, XCircle, Loader2, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";

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
  user_id: string;
}

export default function AdminGameReview() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [games, setGames] = useState<UploadedGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [rejectionNote, setRejectionNote] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    checkAdminStatus();
  }, [user]);

  const checkAdminStatus = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    const { data, error } = await supabase.rpc('has_role', {
      _user_id: user.id,
      _role: 'admin',
    });

    if (error || !data) {
      toast.error("You don't have permission to access this page");
      navigate('/dashboard');
      return;
    }

    setIsAdmin(true);
    loadGames();
  };

  const loadGames = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('uploaded_games')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error("Failed to load games");
      console.error(error);
    } else {
      setGames(data || []);
    }
    setLoading(false);
  };

  const handleApprove = async (gameId: string, userId: string) => {
    setProcessingId(gameId);
    try {
      // Update game status
      const { error: updateError } = await supabase
        .from('uploaded_games')
        .update({
          status: 'approved',
          approved_by: user?.id,
          approved_at: new Date().toISOString(),
        })
        .eq('id', gameId);

      if (updateError) throw updateError;

      // Award 1 million Camly Coins
      const { error: coinError } = await supabase
        .from('camly_coin_transactions')
        .insert({
          user_id: userId,
          amount: 1000000,
          transaction_type: 'game_approved',
          description: 'Game approved and published - Creator reward',
        });

      if (coinError) throw coinError;

      toast.success("Game approved and creator rewarded with 1,000,000 Camly Coins!");
      loadGames();
    } catch (error: any) {
      console.error('Approval error:', error);
      toast.error(error.message || "Failed to approve game");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (gameId: string) => {
    const note = rejectionNote[gameId];
    if (!note || note.trim() === '') {
      toast.error("Please provide a rejection reason");
      return;
    }

    setProcessingId(gameId);
    try {
      const { error } = await supabase
        .from('uploaded_games')
        .update({
          status: 'rejected',
          rejection_note: note,
        })
        .eq('id', gameId);

      if (error) throw error;

      toast.success("Game rejected");
      loadGames();
    } catch (error: any) {
      console.error('Rejection error:', error);
      toast.error(error.message || "Failed to reject game");
    } finally {
      setProcessingId(null);
    }
  };

  const getDownloadUrl = async (path: string) => {
    const { data } = await supabase.storage
      .from('uploaded-games')
      .createSignedUrl(path, 3600);
    return data?.signedUrl;
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background p-4">
      <div className="container max-w-6xl mx-auto py-8">
        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Game Review Dashboard
        </h1>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : games.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No games to review
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {games.map((game) => (
              <Card key={game.id} className="border-primary/20">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{game.title}</CardTitle>
                      <CardDescription>
                        Uploaded on {new Date(game.created_at).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <Badge
                      variant={
                        game.status === 'approved'
                          ? 'default'
                          : game.status === 'rejected'
                          ? 'destructive'
                          : 'secondary'
                      }
                    >
                      {game.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Description:</p>
                    <p>{game.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline">{game.category}</Badge>
                    {game.tags?.map((tag, i) => (
                      <Badge key={i} variant="outline">{tag}</Badge>
                    ))}
                  </div>

                  {game.status === 'pending' && (
                    <div className="space-y-4 pt-4 border-t">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={async () => {
                            const url = await getDownloadUrl(game.game_file_path);
                            if (url) window.open(url, '_blank');
                          }}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download Game
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={async () => {
                            const url = await getDownloadUrl(game.thumbnail_path);
                            if (url) window.open(url, '_blank');
                          }}
                        >
                          View Thumbnail
                        </Button>
                      </div>

                      <div className="space-y-2">
                        <Textarea
                          placeholder="Rejection reason (optional)"
                          value={rejectionNote[game.id] || ''}
                          onChange={(e) =>
                            setRejectionNote({ ...rejectionNote, [game.id]: e.target.value })
                          }
                        />
                      </div>

                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleApprove(game.id, game.user_id)}
                          disabled={processingId === game.id}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {processingId === game.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Approve & Award 1M Coins
                            </>
                          )}
                        </Button>
                        <Button
                          onClick={() => handleReject(game.id)}
                          disabled={processingId === game.id}
                          variant="destructive"
                        >
                          {processingId === game.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <XCircle className="h-4 w-4 mr-2" />
                              Reject
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
