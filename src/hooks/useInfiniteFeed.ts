import { useState, useCallback, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

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

interface UseInfiniteFeedOptions {
  userId?: string;
  pageSize?: number;
  enabled?: boolean;
}

/**
 * Hook for infinite scroll feed with proper pagination
 * Fixes: Infinite scroll feed dừng ở trang 2
 */
export function useInfiniteFeed({
  userId,
  pageSize = 10,
  enabled = true
}: UseInfiniteFeedOptions = {}) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pageRef = useRef(0);
  const loadingRef = useRef(false);
  const lastPostIdRef = useRef<string | null>(null);

  const fetchPosts = useCallback(async (reset: boolean = false) => {
    if (!enabled) return;
    if (loadingRef.current) return;
    if (!reset && !hasMore) return;

    loadingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const currentPage = reset ? 0 : pageRef.current;
      const offset = currentPage * pageSize;

      let query = supabase
        .from('posts')
        .select(`
          *,
          user:profiles!posts_user_id_fkey(username, avatar_url)
        `)
        .order('created_at', { ascending: false })
        .range(offset, offset + pageSize - 1);

      // Filter by user if provided
      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        throw fetchError;
      }

      const newPosts = (data || []).map((post: any) => ({
        ...post,
        user: post.user || { username: 'Unknown', avatar_url: null }
      }));

      if (reset) {
        setPosts(newPosts);
        pageRef.current = 1;
      } else {
        // Avoid duplicates by checking IDs
        setPosts(prev => {
          const existingIds = new Set(prev.map(p => p.id));
          const uniqueNewPosts = newPosts.filter((p: Post) => !existingIds.has(p.id));
          return [...prev, ...uniqueNewPosts];
        });
        pageRef.current = currentPage + 1;
      }

      // Update last post ID for cursor-based pagination fallback
      if (newPosts.length > 0) {
        lastPostIdRef.current = newPosts[newPosts.length - 1].id;
      }

      // Check if there are more posts
      setHasMore(newPosts.length >= pageSize);

    } catch (err: any) {
      console.error('[InfiniteFeed] Error:', err);
      setError(err.message || 'Failed to load posts');
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [enabled, hasMore, pageSize, userId]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchPosts(false);
    }
  }, [fetchPosts, loading, hasMore]);

  const refresh = useCallback(() => {
    pageRef.current = 0;
    lastPostIdRef.current = null;
    setHasMore(true);
    fetchPosts(true);
  }, [fetchPosts]);

  const addPost = useCallback((newPost: Post) => {
    setPosts(prev => [newPost, ...prev]);
  }, []);

  const updatePost = useCallback((postId: string, updates: Partial<Post>) => {
    setPosts(prev => prev.map(post => 
      post.id === postId ? { ...post, ...updates } : post
    ));
  }, []);

  const removePost = useCallback((postId: string) => {
    setPosts(prev => prev.filter(post => post.id !== postId));
  }, []);

  // Initial fetch
  useEffect(() => {
    if (enabled) {
      refresh();
    }
  }, [enabled, userId]);

  // Intersection Observer for auto-load on scroll
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useCallback((node: HTMLDivElement | null) => {
    if (loading) return;

    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !loading) {
        loadMore();
      }
    }, {
      rootMargin: '200px' // Load before reaching the end
    });

    if (node) {
      observerRef.current.observe(node);
    }
  }, [loading, hasMore, loadMore]);

  return {
    posts,
    loading,
    hasMore,
    error,
    loadMore,
    refresh,
    addPost,
    updatePost,
    removePost,
    loadMoreRef
  };
}
