import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Plus, X, ChevronLeft, ChevronRight, Eye, Camera, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";

interface Story {
  id: string;
  user_id: string;
  media_url: string;
  media_type: string;
  caption: string | null;
  created_at: string;
  expires_at: string;
  user: {
    username: string;
    avatar_url: string | null;
  };
  views_count?: number;
}

interface StoryGroup {
  user_id: string;
  username: string;
  avatar_url: string | null;
  stories: Story[];
  hasUnviewed: boolean;
}

export function Stories() {
  const { user } = useAuth();
  const [storyGroups, setStoryGroups] = useState<StoryGroup[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewerModal, setShowViewerModal] = useState(false);
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (user) {
      fetchStories();
    }
  }, [user]);

  useEffect(() => {
    if (showViewerModal && storyGroups[currentGroupIndex]) {
      // Start progress bar
      setProgress(0);
      progressInterval.current = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            nextStory();
            return 0;
          }
          return prev + 2;
        });
      }, 100);

      // Mark story as viewed
      markStoryViewed(storyGroups[currentGroupIndex].stories[currentStoryIndex].id);

      return () => {
        if (progressInterval.current) {
          clearInterval(progressInterval.current);
        }
      };
    }
  }, [showViewerModal, currentGroupIndex, currentStoryIndex]);

  const fetchStories = async () => {
    try {
      const { data: stories, error } = await supabase
        .from("stories")
        .select(`
          *,
          profiles!stories_user_id_fkey(username, avatar_url)
        `)
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Get viewed stories
      const { data: views } = await supabase
        .from("story_views")
        .select("story_id")
        .eq("viewer_id", user?.id);

      const viewedIds = new Set(views?.map(v => v.story_id) || []);

      // Group stories by user
      const groups: Record<string, StoryGroup> = {};
      
      stories?.forEach((story: any) => {
        const userId = story.user_id;
        if (!groups[userId]) {
          groups[userId] = {
            user_id: userId,
            username: story.profiles.username,
            avatar_url: story.profiles.avatar_url,
            stories: [],
            hasUnviewed: false
          };
        }
        groups[userId].stories.push({
          ...story,
          user: story.profiles
        });
        if (!viewedIds.has(story.id) && userId !== user?.id) {
          groups[userId].hasUnviewed = true;
        }
      });

      // Sort: own stories first, then unviewed, then viewed
      const sortedGroups = Object.values(groups).sort((a, b) => {
        if (a.user_id === user?.id) return -1;
        if (b.user_id === user?.id) return 1;
        if (a.hasUnviewed && !b.hasUnviewed) return -1;
        if (!a.hasUnviewed && b.hasUnviewed) return 1;
        return 0;
      });

      setStoryGroups(sortedGroups);
    } catch (error) {
      console.error("Error fetching stories:", error);
    }
  };

  const markStoryViewed = async (storyId: string) => {
    try {
      await supabase
        .from("story_views")
        .upsert({ story_id: storyId, viewer_id: user?.id }, { onConflict: "story_id,viewer_id" });
    } catch (error) {
      console.error("Error marking story as viewed:", error);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith("video/");
    const maxSize = isVideo ? 50 * 1024 * 1024 : 10 * 1024 * 1024;

    if (file.size > maxSize) {
      toast.error(`File too large. Max ${isVideo ? "50MB" : "10MB"}`);
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `${user?.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("chat-attachments")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("chat-attachments")
        .getPublicUrl(filePath);

      const { error: insertError } = await supabase
        .from("stories")
        .insert({
          user_id: user?.id,
          media_url: publicUrl,
          media_type: isVideo ? "video" : "image",
          caption: caption || null
        });

      if (insertError) throw insertError;

      toast.success("Story posted!");
      setShowCreateModal(false);
      setCaption("");
      fetchStories();
    } catch (error) {
      console.error("Error uploading story:", error);
      toast.error("Failed to upload story");
    } finally {
      setUploading(false);
    }
  };

  const openStories = (index: number) => {
    setCurrentGroupIndex(index);
    setCurrentStoryIndex(0);
    setShowViewerModal(true);
  };

  const nextStory = () => {
    const currentGroup = storyGroups[currentGroupIndex];
    if (currentStoryIndex < currentGroup.stories.length - 1) {
      setCurrentStoryIndex(prev => prev + 1);
    } else if (currentGroupIndex < storyGroups.length - 1) {
      setCurrentGroupIndex(prev => prev + 1);
      setCurrentStoryIndex(0);
    } else {
      setShowViewerModal(false);
    }
    setProgress(0);
  };

  const prevStory = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(prev => prev - 1);
    } else if (currentGroupIndex > 0) {
      setCurrentGroupIndex(prev => prev - 1);
      const prevGroup = storyGroups[currentGroupIndex - 1];
      setCurrentStoryIndex(prevGroup.stories.length - 1);
    }
    setProgress(0);
  };

  const currentGroup = storyGroups[currentGroupIndex];
  const currentStory = currentGroup?.stories[currentStoryIndex];

  return (
    <div className="mb-4">
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-3 p-2">
          {/* Add Story Button */}
          <div 
            className="flex flex-col items-center gap-1 cursor-pointer"
            onClick={() => setShowCreateModal(true)}
          >
            <div className="relative">
              <Avatar className="w-16 h-16 border-2 border-dashed border-primary/50">
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback className="bg-primary/10">
                  <Plus className="w-6 h-6 text-primary" />
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 bg-primary rounded-full p-1">
                <Plus className="w-3 h-3 text-primary-foreground" />
              </div>
            </div>
            <span className="text-xs text-muted-foreground">Add Story</span>
          </div>

          {/* Story Groups */}
          {storyGroups.map((group, index) => (
            <div
              key={group.user_id}
              className="flex flex-col items-center gap-1 cursor-pointer"
              onClick={() => openStories(index)}
            >
              <div className={`p-0.5 rounded-full ${group.hasUnviewed ? "bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500" : "bg-muted"}`}>
                <Avatar className="w-16 h-16 border-2 border-background">
                  <AvatarImage src={group.avatar_url || undefined} />
                  <AvatarFallback>{group.username[0]?.toUpperCase()}</AvatarFallback>
                </Avatar>
              </div>
              <span className="text-xs text-muted-foreground truncate max-w-16">
                {group.user_id === user?.id ? "Your Story" : group.username}
              </span>
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      {/* Create Story Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Story</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Add a caption..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
            />
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                <ImageIcon className="w-4 h-4 mr-2" />
                Photo
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                <Camera className="w-4 h-4 mr-2" />
                Video
              </Button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={handleFileSelect}
            />
            {uploading && (
              <div className="text-center text-sm text-muted-foreground">
                Uploading...
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Story Viewer Modal */}
      <AnimatePresence>
        {showViewerModal && currentStory && (
          <Dialog open={showViewerModal} onOpenChange={setShowViewerModal}>
            <DialogContent className="sm:max-w-lg p-0 overflow-hidden bg-black">
              <div className="relative h-[80vh]">
                {/* Progress bars */}
                <div className="absolute top-2 left-2 right-2 flex gap-1 z-10">
                  {currentGroup.stories.map((_, i) => (
                    <div key={i} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-white transition-all"
                        style={{
                          width: i < currentStoryIndex ? "100%" : i === currentStoryIndex ? `${progress}%` : "0%"
                        }}
                      />
                    </div>
                  ))}
                </div>

                {/* Header */}
                <div className="absolute top-6 left-2 right-2 flex items-center justify-between z-10">
                  <div className="flex items-center gap-2">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={currentStory.user.avatar_url || undefined} />
                      <AvatarFallback>{currentStory.user.username[0]?.toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <span className="text-white text-sm font-medium">{currentStory.user.username}</span>
                      <span className="text-white/70 text-xs ml-2">
                        {formatDistanceToNow(new Date(currentStory.created_at), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20"
                    onClick={() => setShowViewerModal(false)}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                {/* Media */}
                <div className="h-full flex items-center justify-center">
                  {currentStory.media_type === "video" ? (
                    <video
                      src={currentStory.media_url}
                      className="max-h-full max-w-full object-contain"
                      autoPlay
                      muted
                      playsInline
                    />
                  ) : (
                    <img
                      src={currentStory.media_url}
                      alt="Story"
                      className="max-h-full max-w-full object-contain"
                    />
                  )}
                </div>

                {/* Caption */}
                {currentStory.caption && (
                  <div className="absolute bottom-4 left-4 right-4 text-white text-center z-10">
                    <p className="bg-black/50 rounded-lg px-4 py-2">{currentStory.caption}</p>
                  </div>
                )}

                {/* Navigation */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-1/3 cursor-pointer"
                  onClick={prevStory}
                />
                <div
                  className="absolute right-0 top-0 bottom-0 w-1/3 cursor-pointer"
                  onClick={nextStory}
                />
              </div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  );
}