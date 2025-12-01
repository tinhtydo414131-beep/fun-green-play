import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ArrowLeft, Star, Send, Loader2, Trash2, Edit2, Download } from "lucide-react";
import { z } from "zod";
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

const commentSchema = z.object({
  comment: z.string()
    .trim()
    .min(1, "Comment cannot be empty")
    .max(1000, "Comment must be less than 1000 characters")
});

interface GameDetails {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  thumbnail_path: string;
  game_file_path: string;
  play_count: number;
  download_count: number;
  created_at: string;
  user_id: string;
}

interface GameRating {
  id: string;
  rating: number;
  user_id: string;
  profiles: {
    username: string;
    avatar_url: string | null;
  };
}

interface GameComment {
  id: string;
  comment: string;
  user_id: string;
  created_at: string;
  profiles: {
    username: string;
    avatar_url: string | null;
  };
}

export default function GameDetails() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [game, setGame] = useState<GameDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [ratings, setRatings] = useState<GameRating[]>([]);
  const [comments, setComments] = useState<GameComment[]>([]);
  const [userRating, setUserRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadGameDetails();
      loadRatings();
      loadComments();
    }
  }, [id]);

  const loadGameDetails = async () => {
    if (!id) return;

    const { data, error } = await supabase
      .from('uploaded_games')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      toast.error("Failed to load game details");
      navigate('/games');
      return;
    }

    if (!data) {
      toast.error("Game not found");
      navigate('/games');
      return;
    }

    setGame(data);
    setLoading(false);
  };

  const loadRatings = async () => {
    if (!id) return;

    const { data, error } = await supabase
      .from('uploaded_game_ratings')
      .select('*, profiles(username, avatar_url)')
      .eq('game_id', id);

    if (!error && data) {
      setRatings(data as any);
      const myRating = data.find(r => r.user_id === user?.id);
      if (myRating) setUserRating(myRating.rating);
    }
  };

  const loadComments = async () => {
    if (!id) return;

    const { data, error } = await supabase
      .from('uploaded_game_comments')
      .select('*, profiles(username, avatar_url)')
      .eq('game_id', id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setComments(data as any);
    }
  };

  const handleRatingClick = async (rating: number) => {
    if (!user) {
      toast.error("Please log in to rate this game");
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('uploaded_game_ratings')
        .upsert({
          game_id: id!,
          user_id: user.id,
          rating,
        });

      if (error) throw error;

      setUserRating(rating);
      toast.success("Rating submitted!");
      loadRatings();
    } catch (error: any) {
      console.error('Rating error:', error);
      toast.error(error.message || "Failed to submit rating");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCommentSubmit = async () => {
    if (!user) {
      toast.error("Please log in to comment");
      return;
    }

    try {
      const validated = commentSchema.parse({ comment: commentText });
      
      setSubmitting(true);

      if (editingComment) {
        const { error } = await supabase
          .from('uploaded_game_comments')
          .update({ comment: validated.comment })
          .eq('id', editingComment);

        if (error) throw error;
        toast.success("Comment updated!");
        setEditingComment(null);
      } else {
        const { error } = await supabase
          .from('uploaded_game_comments')
          .insert({
            game_id: id!,
            user_id: user.id,
            comment: validated.comment,
          });

        if (error) throw error;
        toast.success("Comment posted!");
      }

      setCommentText("");
      loadComments();
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        console.error('Comment error:', error);
        toast.error(error.message || "Failed to post comment");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from('uploaded_game_comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;

      toast.success("Comment deleted");
      loadComments();
    } catch (error: any) {
      console.error('Delete error:', error);
      toast.error(error.message || "Failed to delete comment");
    } finally {
      setCommentToDelete(null);
    }
  };

  const getThumbnailUrl = (path: string) => {
    const { data } = supabase.storage
      .from('uploaded-games')
      .getPublicUrl(path);
    return data.publicUrl;
  };

  const getDownloadUrl = async () => {
    if (!game) return;
    const { data } = await supabase.storage
      .from('uploaded-games')
      .createSignedUrl(game.game_file_path, 3600);
    if (data?.signedUrl) window.open(data.signedUrl, '_blank');
  };

  const averageRating = ratings.length > 0
    ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(1)
    : "0";

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!game) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background p-4">
      <div className="container max-w-6xl mx-auto py-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        {/* Game Header */}
        <Card className="mb-6 border-primary/20">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="aspect-video relative overflow-hidden rounded-lg bg-muted">
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
              <div className="space-y-4">
                <div>
                  <h1 className="text-4xl font-bold text-primary mb-2">{game.title}</h1>
                  <p className="text-muted-foreground">{game.description}</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="outline">{game.category}</Badge>
                  {game.tags?.map((tag, i) => (
                    <Badge key={i} variant="outline">{tag}</Badge>
                  ))}
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>👥 {game.play_count} plays</span>
                  <span>⬇️ {game.download_count} downloads</span>
                </div>
                <Button
                  onClick={getDownloadUrl}
                  className="w-full bg-gradient-to-r from-primary to-secondary"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Game
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rating Section */}
        <Card className="mb-6 border-primary/20">
          <CardHeader>
            <CardTitle>Rating</CardTitle>
            <CardDescription>
              Average: {averageRating} ⭐ ({ratings.length} ratings)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => handleRatingClick(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  disabled={submitting}
                  className="transition-transform hover:scale-110 disabled:opacity-50"
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= (hoveredRating || userRating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground"
                    }`}
                  />
                </button>
              ))}
              {userRating > 0 && (
                <span className="ml-4 text-sm text-muted-foreground">
                  Your rating: {userRating} stars
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Comments Section */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle>Comments ({comments.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Comment Form */}
            {user && (
              <div className="space-y-2">
                <Textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment..."
                  rows={3}
                  maxLength={1000}
                  className="resize-none"
                />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    {commentText.length}/1000
                  </span>
                  <div className="flex gap-2">
                    {editingComment && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          setEditingComment(null);
                          setCommentText("");
                        }}
                      >
                        Cancel
                      </Button>
                    )}
                    <Button
                      onClick={handleCommentSubmit}
                      disabled={submitting || !commentText.trim()}
                      className="bg-gradient-to-r from-primary to-secondary"
                    >
                      {submitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          {editingComment ? "Update" : "Post"}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Comments List */}
            <div className="space-y-4">
              {comments.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No comments yet. Be the first to comment!
                </p>
              ) : (
                comments.map((comment) => (
                  <Card key={comment.id} className="border-muted">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold">
                              {comment.profiles.username}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {new Date(comment.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm">{comment.comment}</p>
                        </div>
                        {user?.id === comment.user_id && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setEditingComment(comment.id);
                                setCommentText(comment.comment);
                              }}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setCommentToDelete(comment.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={!!commentToDelete} onOpenChange={() => setCommentToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete comment?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => commentToDelete && handleDeleteComment(commentToDelete)}
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
