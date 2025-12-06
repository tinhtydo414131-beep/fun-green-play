import { useState, useEffect } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  ThumbsUp, MessageSquare, Share2, MoreHorizontal, 
  Heart, Send, Globe, Lock, Users as UsersIcon 
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

interface Post {
  id: string;
  user_id: string;
  content: string;
  image_url?: string | null;
  video_url?: string | null;
  feeling?: string | null;
  privacy: string;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  created_at: string;
  user?: {
    username: string;
    avatar_url: string | null;
  };
}

interface PostCardProps {
  post: Post;
  currentUserId: string;
  onDelete?: (postId: string) => void;
}

export function PostCard({ post, currentUserId, onDelete }: PostCardProps) {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes_count);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [showReactions, setShowReactions] = useState(false);

  const reactions = ['👍', '❤️', '😆', '😮', '😢', '😡'];

  useEffect(() => {
    checkIfLiked();
  }, [post.id, currentUserId]);

  const checkIfLiked = async () => {
    const { data } = await supabase
      .from('post_likes')
      .select('id')
      .eq('post_id', post.id)
      .eq('user_id', currentUserId)
      .maybeSingle();
    
    setLiked(!!data);
  };

  const handleLike = async () => {
    if (liked) {
      // Unlike
      await supabase
        .from('post_likes')
        .delete()
        .eq('post_id', post.id)
        .eq('user_id', currentUserId);
      
      setLiked(false);
      setLikesCount(prev => Math.max(0, prev - 1));
    } else {
      // Like
      await supabase
        .from('post_likes')
        .insert({ post_id: post.id, user_id: currentUserId });
      
      setLiked(true);
      setLikesCount(prev => prev + 1);
    }
  };

  const loadComments = async () => {
    if (loadingComments) return;
    setLoadingComments(true);
    
    try {
      const { data } = await supabase
        .from('post_comments')
        .select(`
          *,
          user:profiles!post_comments_user_id_fkey(username, avatar_url)
        `)
        .eq('post_id', post.id)
        .order('created_at', { ascending: true });
      
      setComments(data || []);
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleToggleComments = () => {
    if (!showComments) {
      loadComments();
    }
    setShowComments(!showComments);
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const { data, error } = await supabase
        .from('post_comments')
        .insert({
          post_id: post.id,
          user_id: currentUserId,
          content: newComment.trim()
        })
        .select(`
          *,
          user:profiles!post_comments_user_id_fkey(username, avatar_url)
        `)
        .single();

      if (error) throw error;

      setComments(prev => [...prev, data]);
      setNewComment('');
      toast.success('Comment posted!');
    } catch (error) {
      console.error('Error posting comment:', error);
      toast.error('Failed to post comment');
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`);
    toast.success('Link copied!');
  };

  const getPrivacyIcon = () => {
    switch (post.privacy) {
      case 'public': return <Globe className="w-3 h-3" />;
      case 'friends': return <UsersIcon className="w-3 h-3" />;
      case 'private': return <Lock className="w-3 h-3" />;
      default: return <Globe className="w-3 h-3" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-lg shadow-sm border border-border overflow-hidden"
    >
      {/* Post Header */}
      <div className="flex items-center gap-3 p-4">
        <Avatar className="w-10 h-10">
          <AvatarImage src={post.user?.avatar_url || ''} />
          <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white">
            {post.user?.username?.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <p className="font-semibold">{post.user?.username}</p>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <span>
              {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: vi })}
            </span>
            <span>·</span>
            {getPrivacyIcon()}
          </div>
        </div>
        {post.user_id === currentUserId && (
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="w-5 h-5" />
          </Button>
        )}
      </div>

      {/* Post Content */}
      <div className="px-4 pb-3">
        <p className="whitespace-pre-wrap">{post.content}</p>
        {post.feeling && (
          <p className="text-muted-foreground text-sm mt-1">
            — feeling {post.feeling}
          </p>
        )}
      </div>

      {/* Post Image */}
      {post.image_url && (
        <div className="relative">
          <img 
            src={post.image_url} 
            alt="Post" 
            className="w-full max-h-[500px] object-cover"
          />
        </div>
      )}

      {/* Reactions Count */}
      <div className="flex items-center justify-between px-4 py-2 text-sm text-muted-foreground border-b border-border">
        <div className="flex items-center gap-1">
          <div className="flex -space-x-1">
            <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
              <ThumbsUp className="w-3 h-3 text-white fill-white" />
            </div>
            {likesCount > 5 && (
              <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
                <Heart className="w-3 h-3 text-white fill-white" />
              </div>
            )}
          </div>
          {likesCount > 0 && (
            <span>{likesCount.toLocaleString()}</span>
          )}
        </div>
        {(post.comments_count > 0 || comments.length > 0) && (
          <button 
            onClick={handleToggleComments}
            className="hover:underline"
          >
            {comments.length || post.comments_count} comments
          </button>
        )}
      </div>

      {/* Reaction Buttons */}
      <div className="flex justify-around p-1 border-b border-border relative">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onMouseEnter={() => setShowReactions(true)}
          onMouseLeave={() => setShowReactions(false)}
          onClick={handleLike}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all flex-1 justify-center ${
            liked ? 'text-blue-500 bg-blue-500/10' : 'text-muted-foreground hover:bg-muted'
          }`}
        >
          <ThumbsUp className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
          <span className="font-medium text-sm">Like</span>
        </motion.button>

        {/* Emoji Reactions Popup */}
        <AnimatePresence>
          {showReactions && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              className="absolute bottom-full left-4 mb-2 bg-card rounded-full shadow-lg border border-border px-2 py-1 flex gap-1"
              onMouseEnter={() => setShowReactions(true)}
              onMouseLeave={() => setShowReactions(false)}
            >
              {reactions.map((emoji, index) => (
                <motion.button
                  key={emoji}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.3 }}
                  onClick={() => {
                    handleLike();
                    setShowReactions(false);
                  }}
                  className="text-2xl p-1 hover:bg-muted rounded-full"
                >
                  {emoji}
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleToggleComments}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-muted-foreground hover:bg-muted flex-1 justify-center"
        >
          <MessageSquare className="w-5 h-5" />
          <span className="font-medium text-sm">Comment</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleShare}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-muted-foreground hover:bg-muted flex-1 justify-center"
        >
          <Share2 className="w-5 h-5" />
          <span className="font-medium text-sm">Share</span>
        </motion.button>
      </div>

      {/* Comments Section */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-3 space-y-3 max-h-60 overflow-y-auto">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-2">
                  <Avatar className="w-8 h-8 shrink-0">
                    <AvatarImage src={comment.user?.avatar_url || ''} />
                    <AvatarFallback className="text-xs bg-gradient-to-br from-primary to-secondary text-white">
                      {comment.user?.username?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-muted rounded-2xl px-3 py-2 flex-1">
                    <p className="font-semibold text-sm">{comment.user?.username}</p>
                    <p className="text-sm">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Comment Input */}
            <form onSubmit={handleSubmitComment} className="flex items-center gap-2 p-3 border-t border-border">
              <Avatar className="w-8 h-8 shrink-0">
                <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white text-xs">
                  U
                </AvatarFallback>
              </Avatar>
              <Input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 rounded-full bg-muted border-0 h-9"
              />
              <Button 
                type="submit" 
                variant="ghost" 
                size="icon" 
                className="shrink-0"
                disabled={!newComment.trim()}
              >
                <Send className="w-4 h-4 text-primary" />
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
