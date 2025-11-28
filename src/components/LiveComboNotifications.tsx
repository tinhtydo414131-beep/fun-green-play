import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Flame, Trophy, Zap, Crown, Sparkles } from "lucide-react";

interface ComboNotification {
  id: string;
  username: string;
  avatar_url: string | null;
  combo: number;
  timestamp: number;
}

export const LiveComboNotifications = () => {
  const [notifications, setNotifications] = useState<ComboNotification[]>([]);

  useEffect(() => {
    // Subscribe to combo milestone broadcasts
    const channel = supabase.channel('combo-milestones');
    
    channel
      .on('broadcast', { event: 'milestone' }, async ({ payload }) => {
        const { username, combo, user_id } = payload;
        
        // Fetch avatar
        let avatar_url = null;
        if (user_id) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('avatar_url')
            .eq('id', user_id)
            .single();
          
          avatar_url = profile?.avatar_url || null;
        }

        const notification: ComboNotification = {
          id: `${Date.now()}-${Math.random()}`,
          username,
          avatar_url,
          combo,
          timestamp: Date.now(),
        };

        setNotifications((prev) => [notification, ...prev].slice(0, 3)); // Keep only 3 most recent

        // Remove after 5 seconds
        setTimeout(() => {
          setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
        }, 5000);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getComboIcon = (combo: number) => {
    if (combo >= 100) return <Crown className="w-6 h-6 text-yellow-500" />;
    if (combo >= 75) return <Sparkles className="w-6 h-6 text-purple-500" />;
    if (combo >= 50) return <Trophy className="w-6 h-6 text-yellow-600" />;
    if (combo >= 30) return <Zap className="w-6 h-6 text-orange-500" />;
    return <Flame className="w-6 h-6 text-red-500" />;
  };

  const getComboColor = (combo: number) => {
    if (combo >= 100) return "from-yellow-400 to-yellow-600";
    if (combo >= 75) return "from-purple-400 to-purple-600";
    if (combo >= 50) return "from-yellow-500 to-orange-500";
    if (combo >= 30) return "from-orange-400 to-red-500";
    return "from-red-400 to-pink-500";
  };

  const getComboLabel = (combo: number) => {
    if (combo >= 100) return "LEGENDARY";
    if (combo >= 75) return "AMAZING";
    if (combo >= 50) return "GREAT";
    if (combo >= 30) return "AWESOME";
    return "NICE";
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-24 right-4 z-50 space-y-2 max-w-xs pointer-events-none">
      {notifications.map((notification, index) => (
        <Card
          key={notification.id}
          className={`p-4 bg-gradient-to-r ${getComboColor(
            notification.combo
          )} border-2 border-white shadow-2xl animate-slide-in-right pointer-events-auto`}
          style={{
            animationDelay: `${index * 0.1}s`,
          }}
        >
          <div className="flex items-center gap-3">
            <div className="animate-bounce">
              {getComboIcon(notification.combo)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Avatar className="w-6 h-6 border border-white">
                  <AvatarImage src={notification.avatar_url || undefined} />
                  <AvatarFallback className="text-xs bg-white/20 text-white">
                    {notification.username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-bold text-white truncate">
                  {notification.username}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white/90">
                  {getComboLabel(notification.combo)}
                </span>
                <span className="text-lg font-black text-white">
                  {notification.combo}x
                </span>
                <Flame className="w-4 h-4 text-white animate-pulse" />
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
