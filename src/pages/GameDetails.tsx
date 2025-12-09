import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ArrowLeft, Star, Send, Loader2, Trash2, Edit2, Download, Reply, Flag, Play, X } from "lucide-react";
import JSZip from "jszip";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const commentSchema = z.object({
  comment: z.string()
    .trim()
    .min(1, "Comment cannot be empty")
    .max(1000, "Comment must be less than 1000 characters")
});

const reportSchema = z.object({
  reason: z.string().min(1, "Please select a reason"),
  details: z.string()
    .trim()
    .max(500, "Details must be less than 500 characters")
    .optional()
});

interface GameAuthor {
  username: string;
  avatar_url: string | null;
  wallet_address: string | null;
}

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
  parent_id: string | null;
  profiles: {
    username: string;
    avatar_url: string | null;
  };
  replies?: GameComment[];
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
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [reportingComment, setReportingComment] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState("");
  const [reportDetails, setReportDetails] = useState("");
  const [author, setAuthor] = useState<GameAuthor | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameHtml, setGameHtml] = useState<string>('');
  const [loadingGame, setLoadingGame] = useState(false);

  // Helper to shorten wallet address
  const shortenAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

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
    
    // Fetch author info
    if (data.user_id) {
      const { data: authorData } = await supabase
        .from('profiles')
        .select('username, avatar_url, wallet_address')
        .eq('id', data.user_id)
        .maybeSingle();
      
      if (authorData) {
        setAuthor(authorData);
      }
    }
    
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
      // Organize comments into threads
      const commentsMap = new Map<string, GameComment>();
      const topLevelComments: GameComment[] = [];
      
      // First pass: create map of all comments
      data.forEach((comment: any) => {
        commentsMap.set(comment.id, { ...comment, replies: [] });
      });
      
      // Second pass: organize into threads
      data.forEach((comment: any) => {
        const commentObj = commentsMap.get(comment.id)!;
        if (comment.parent_id) {
          const parent = commentsMap.get(comment.parent_id);
          if (parent) {
            parent.replies!.push(commentObj);
          }
        } else {
          topLevelComments.push(commentObj);
        }
      });
      
      setComments(topLevelComments);
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
            parent_id: replyingTo,
          });

        if (error) throw error;
        toast.success(replyingTo ? "Reply posted!" : "Comment posted!");
        setReplyingTo(null);
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

  const handleReportSubmit = async () => {
    if (!user || !reportingComment) return;

    try {
      const validated = reportSchema.parse({
        reason: reportReason,
        details: reportDetails || undefined
      });

      setSubmitting(true);

      const { error } = await supabase
        .from('comment_reports')
        .insert({
          comment_id: reportingComment,
          reporter_id: user.id,
          reason: validated.reason,
          details: validated.details
        });

      if (error) {
        if (error.code === '23505') {
          toast.error("You have already reported this comment");
        } else {
          throw error;
        }
      } else {
        toast.success("Comment reported. Thank you for helping keep our community safe.");
      }

      setReportingComment(null);
      setReportReason("");
      setReportDetails("");
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        console.error('Report error:', error);
        toast.error(error.message || "Failed to submit report");
      }
    } finally {
      setSubmitting(false);
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

  const handlePlayGame = async () => {
    if (!game) return;
    
    setLoadingGame(true);
    try {
      // Download the ZIP file directly using Supabase storage
      const { data: zipData, error: downloadError } = await supabase.storage
        .from('uploaded-games')
        .download(game.game_file_path);
      
      if (downloadError || !zipData) {
        throw new Error("Could not download game file");
      }

      // Extract the ZIP
      const zip = await JSZip.loadAsync(zipData);
      
      // Find index.html in the ZIP
      let indexContent: string | null = null;
      let basePath = '';
      
      // Look for index.html at root or in subdirectories
      for (const [path, file] of Object.entries(zip.files)) {
        if (path.endsWith('index.html') && !file.dir) {
          indexContent = await file.async('string');
          basePath = path.replace('index.html', '');
          break;
        }
      }
      
      if (!indexContent) {
        toast.error("Game files not found in ZIP. Make sure index.html exists.");
        return;
      }

      // Create base64 data URLs for all files (works in srcdoc iframe)
      const fileDataUrls: Record<string, string> = {};
      
      for (const [path, file] of Object.entries(zip.files)) {
        if (!file.dir) {
          const content = await file.async('base64');
          // Determine mime type based on extension
          const ext = path.split('.').pop()?.toLowerCase() || '';
          const mimeTypes: Record<string, string> = {
            'js': 'application/javascript',
            'css': 'text/css',
            'html': 'text/html',
            'json': 'application/json',
            'png': 'image/png',
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'gif': 'image/gif',
            'svg': 'image/svg+xml',
            'woff': 'font/woff',
            'woff2': 'font/woff2',
            'ttf': 'font/ttf',
            'mp3': 'audio/mpeg',
            'wav': 'audio/wav',
            'ogg': 'audio/ogg',
            'webp': 'image/webp',
            'ico': 'image/x-icon',
          };
          const mimeType = mimeTypes[ext] || 'application/octet-stream';
          const dataUrl = `data:${mimeType};base64,${content}`;
          
          // Get relative path from basePath
          const relativePath = path.startsWith(basePath) ? path.slice(basePath.length) : path;
          if (relativePath && relativePath !== 'index.html') {
            fileDataUrls[relativePath] = dataUrl;
          }
        }
      }

      // Replace relative paths in HTML with data URLs
      let modifiedHtml = indexContent;
      for (const [path, dataUrl] of Object.entries(fileDataUrls)) {
        // Escape special regex characters in path
        const escapedPath = path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        // Replace various path formats (with and without ./ prefix)
        modifiedHtml = modifiedHtml
          .replace(new RegExp(`(src|href)=["'](\\.?\\/?)${escapedPath}["']`, 'gi'), `$1="${dataUrl}"`)
          .replace(new RegExp(`url\\(["']?(\\.?\\/?)${escapedPath}["']?\\)`, 'gi'), `url("${dataUrl}")`);
      }

      // Set game HTML (no blob URLs needed with data URLs)
      setGameHtml(modifiedHtml);
      setIsPlaying(true);
      
      // Update play count
      await supabase
        .from('uploaded_games')
        .update({ play_count: (game.play_count || 0) + 1 })
        .eq('id', game.id);
        
      toast.success("Game loaded! 🎮");
    } catch (error) {
      console.error('Error loading game:', error);
      toast.error("Failed to load game. Try downloading instead.");
    } finally {
      setLoadingGame(false);
    }
  };

  const handleCloseGame = () => {
    setGameHtml('');
    setIsPlaying(false);
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
      {/* Game Player Overlay */}
      {isPlaying && gameHtml && (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col">
          <div className="flex items-center justify-between p-4 bg-background/10 backdrop-blur">
            <h2 className="text-xl font-bold text-white">{game?.title}</h2>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleCloseGame}
            >
              <X className="h-4 w-4 mr-2" />
              Close Game
            </Button>
          </div>
          <div className="flex-1 p-4">
            <iframe
              srcDoc={gameHtml}
              className="w-full h-full rounded-lg bg-white"
              sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-popups"
              title={game?.title}
            />
          </div>
        </div>
      )}

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
                  
                  {/* Author Info */}
                  {author && (
                    <div className="flex items-center gap-2 mb-3 text-sm">
                      <span className="text-muted-foreground">🎨 Tác giả:</span>
                      <span className="font-semibold text-foreground">
                        {author.username || (author.wallet_address ? shortenAddress(author.wallet_address) : 'Anonymous')}
                      </span>
                    </div>
                  )}
                  
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
                <div className="flex flex-col gap-2">
                  <Button
                    onClick={handlePlayGame}
                    disabled={loadingGame}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                  >
                    {loadingGame ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Loading Game...
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Play Game
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={getDownloadUrl}
                    variant="outline"
                    className="w-full"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Game
                  </Button>
                </div>
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
                {(replyingTo || editingComment) && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Reply className="h-4 w-4" />
                    <span>
                      {editingComment ? "Editing comment" : `Replying to comment`}
                    </span>
                  </div>
                )}
                <Textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder={replyingTo ? "Write a reply..." : "Write a comment..."}
                  rows={3}
                  maxLength={1000}
                  className="resize-none"
                />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    {commentText.length}/1000
                  </span>
                  <div className="flex gap-2">
                    {(editingComment || replyingTo) && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          setEditingComment(null);
                          setReplyingTo(null);
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
                          {editingComment ? "Update" : replyingTo ? "Reply" : "Post"}
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
                  <div key={comment.id} className="space-y-3">
                    <Card className="border-muted">
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
                            <p className="text-sm mb-3">{comment.comment}</p>
                            <div className="flex gap-2">
                              {user && !comment.parent_id && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    setReplyingTo(comment.id);
                                    setCommentText("");
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                  }}
                                  className="text-xs h-auto py-1 px-2"
                                >
                                  <Reply className="h-3 w-3 mr-1" />
                                  Reply
                                </Button>
                              )}
                              {user && user.id !== comment.user_id && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setReportingComment(comment.id)}
                                  className="text-xs h-auto py-1 px-2 text-muted-foreground hover:text-destructive"
                                >
                                  <Flag className="h-3 w-3 mr-1" />
                                  Report
                                </Button>
                              )}
                            </div>
                          </div>
                          {user?.id === comment.user_id && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setEditingComment(comment.id);
                                  setReplyingTo(null);
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
                    
                    {/* Replies */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="ml-8 space-y-3 border-l-2 border-muted pl-4">
                        {comment.replies.map((reply) => (
                          <Card key={reply.id} className="border-muted bg-muted/30">
                            <CardContent className="p-3">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Reply className="h-3 w-3 text-muted-foreground" />
                                    <span className="font-semibold text-sm">
                                      {reply.profiles.username}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      {new Date(reply.created_at).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <p className="text-sm mb-2">{reply.comment}</p>
                                  {user && user.id !== reply.user_id && (
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => setReportingComment(reply.id)}
                                      className="text-xs h-auto py-1 px-2 text-muted-foreground hover:text-destructive"
                                    >
                                      <Flag className="h-3 w-3 mr-1" />
                                      Report
                                    </Button>
                                  )}
                                </div>
                                {user?.id === reply.user_id && (
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => {
                                        setEditingComment(reply.id);
                                        setReplyingTo(null);
                                        setCommentText(reply.comment);
                                      }}
                                    >
                                      <Edit2 className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => setCommentToDelete(reply.id)}
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
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

      <Dialog open={!!reportingComment} onOpenChange={() => {
        setReportingComment(null);
        setReportReason("");
        setReportDetails("");
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report Comment</DialogTitle>
            <DialogDescription>
              Help us maintain a safe and respectful community by reporting inappropriate content.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Reason *</Label>
              <Select value={reportReason} onValueChange={setReportReason}>
                <SelectTrigger id="reason">
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="spam">Spam</SelectItem>
                  <SelectItem value="harassment">Harassment or bullying</SelectItem>
                  <SelectItem value="hate_speech">Hate speech</SelectItem>
                  <SelectItem value="violence">Violence or threats</SelectItem>
                  <SelectItem value="inappropriate">Inappropriate content</SelectItem>
                  <SelectItem value="misinformation">Misinformation</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="details">Additional details (optional)</Label>
              <Textarea
                id="details"
                value={reportDetails}
                onChange={(e) => setReportDetails(e.target.value)}
                placeholder="Provide more context about why you're reporting this comment..."
                rows={3}
                maxLength={500}
                className="resize-none"
              />
              <span className="text-xs text-muted-foreground">
                {reportDetails.length}/500
              </span>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setReportingComment(null);
                setReportReason("");
                setReportDetails("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleReportSubmit}
              disabled={submitting || !reportReason}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Flag className="h-4 w-4 mr-2" />
                  Submit Report
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
