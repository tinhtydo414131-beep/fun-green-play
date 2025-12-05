import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Stories } from "@/components/Stories";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { Heart, MessageCircle, Share2, Gamepad2, UserPlus, Trophy, Star, Sparkles } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";

interface ActivityItem {
  id: string;
  user_id: string;
  activity_type: string;
  content: any;
  created_at: string;
  user: {
    username: string;
    avatar_url: string | null;
  };
}

export default function Feed() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchActivities();
      subscribeToActivities();
    }
  }, [user]);

  const fetchActivities = async () => {
    try {
      const { data, error } = await supabase
        .from("activity_feed")
        .select(`
          *,
          profiles!activity_feed_user_id_fkey(username, avatar_url)
        `)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      setActivities(data?.map((a: any) => ({
        ...a,
        user: a.profiles
      })) || []);
    } catch (error) {
      console.error("Error fetching activities:", error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToActivities = () => {
    const channel = supabase
      .channel("feed-activities")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "activity_feed"
        },
        async (payload) => {
          const { data: userData } = await supabase
            .from("profiles")
            .select("username, avatar_url")
            .eq("id", payload.new.user_id)
            .single();

          const newActivity: ActivityItem = {
            ...payload.new as any,
            user: userData || { username: "Unknown", avatar_url: null }
          };

          setActivities(prev => [newActivity, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "game_played":
        return <Gamepad2 className="w-4 h-4 text-green-500" />;
      case "friend_added":
        return <UserPlus className="w-4 h-4 text-blue-500" />;
      case "achievement":
        return <Trophy className="w-4 h-4 text-yellow-500" />;
      case "story_posted":
        return <Star className="w-4 h-4 text-purple-500" />;
      default:
        return <Sparkles className="w-4 h-4 text-primary" />;
    }
  };

  const getActivityText = (activity: ActivityItem) => {
    const content = activity.content || {};
    switch (activity.activity_type) {
      case "game_played":
        return `played ${content.game_name || "a game"}`;
      case "friend_added":
        return `became friends with ${content.friend_name || "someone"}`;
      case "achievement":
        return `earned the "${content.achievement_name || "Unknown"}" achievement`;
      case "story_posted":
        return "posted a new story";
      default:
        return content.message || "did something cool";
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navigation />
      
      <main className="container mx-auto px-4 py-6 max-w-2xl">
        <h1 className="text-2xl font-bold mb-4">News Feed</h1>

        {/* Stories Section */}
        <Stories />

        {/* Activity Feed */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : activities.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <Sparkles className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-semibold mb-2">No activity yet</h3>
                <p className="text-sm text-muted-foreground">
                  Add friends to see their activities here
                </p>
                <Button 
                  className="mt-4"
                  onClick={() => navigate("/find-friends")}
                >
                  Find Friends
                </Button>
              </CardContent>
            </Card>
          ) : (
            activities.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-center gap-3">
                      <Avatar 
                        className="cursor-pointer"
                        onClick={() => navigate(`/profile/${activity.user_id}`)}
                      >
                        <AvatarImage src={activity.user.avatar_url || undefined} />
                        <AvatarFallback>
                          {activity.user.username[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span 
                            className="font-semibold hover:underline cursor-pointer truncate"
                            onClick={() => navigate(`/profile/${activity.user_id}`)}
                          >
                            {activity.user.username}
                          </span>
                          {getActivityIcon(activity.activity_type)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {getActivityText(activity)}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                      </span>
                    </div>
                  </CardHeader>
                  
                  {activity.content?.image_url && (
                    <CardContent className="p-0">
                      <img 
                        src={activity.content.image_url} 
                        alt="Activity" 
                        className="w-full aspect-video object-cover"
                      />
                    </CardContent>
                  )}

                  <CardContent className="p-4 pt-2">
                    <div className="flex items-center gap-4">
                      <Button variant="ghost" size="sm" className="gap-2">
                        <Heart className="w-4 h-4" />
                        <span className="text-xs">{activity.content?.likes || 0}</span>
                      </Button>
                      <Button variant="ghost" size="sm" className="gap-2">
                        <MessageCircle className="w-4 h-4" />
                        <span className="text-xs">Comment</span>
                      </Button>
                      <Button variant="ghost" size="sm" className="gap-2">
                        <Share2 className="w-4 h-4" />
                        <span className="text-xs">Share</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}