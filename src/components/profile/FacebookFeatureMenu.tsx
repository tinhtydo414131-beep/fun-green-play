import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  Gamepad2, Users, MessageCircle, Trophy, Wallet,
  Music, Store, PlayCircle, Gift, Bookmark, Calendar,
  Newspaper, Globe, Heart, Video, Image, Sparkles,
  Star, Zap, ShoppingBag, Bell, Settings, History,
  Crown, Award, Flame, Target, Compass, Radio,
  Camera, Film, Mic, Headphones
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface FeatureItem {
  id: string;
  icon: any;
  label: string;
  description?: string;
  gradient: string;
  route?: string;
  badge?: number;
  isNew?: boolean;
  onClick?: () => void;
}

const featureItems: FeatureItem[] = [
  {
    id: "games",
    icon: Gamepad2,
    label: "Games",
    description: "Play awesome games",
    gradient: "from-blue-500 to-indigo-600",
    route: "/games",
  },
  {
    id: "friends",
    icon: Users,
    label: "Friends",
    description: "Connect with friends",
    gradient: "from-green-500 to-emerald-600",
    route: "/friends",
    badge: 3,
  },
  {
    id: "chat",
    icon: MessageCircle,
    label: "Messages",
    description: "Chat with friends",
    gradient: "from-purple-500 to-pink-600",
    route: "/chat",
    badge: 5,
  },
  {
    id: "leaderboard",
    icon: Trophy,
    label: "Leaderboard",
    description: "See top players",
    gradient: "from-yellow-500 to-orange-600",
    route: "/camly-leaderboard",
  },
  {
    id: "wallet",
    icon: Wallet,
    label: "Wallet",
    description: "Manage your coins",
    gradient: "from-emerald-500 to-teal-600",
    route: "/wallet",
  },
  {
    id: "music",
    icon: Music,
    label: "Music",
    description: "Listen to music",
    gradient: "from-pink-500 to-rose-600",
    route: "/music",
  },
  {
    id: "watch",
    icon: PlayCircle,
    label: "Watch",
    description: "Watch videos",
    gradient: "from-red-500 to-pink-600",
    isNew: true,
  },
  {
    id: "rewards",
    icon: Gift,
    label: "Rewards",
    description: "Claim rewards",
    gradient: "from-amber-500 to-yellow-600",
    route: "/rewards-history",
  },
  {
    id: "marketplace",
    icon: Store,
    label: "Marketplace",
    description: "Buy & sell items",
    gradient: "from-teal-500 to-cyan-600",
    isNew: true,
  },
  {
    id: "events",
    icon: Calendar,
    label: "Events",
    description: "Upcoming events",
    gradient: "from-violet-500 to-purple-600",
  },
  {
    id: "saved",
    icon: Bookmark,
    label: "Saved",
    description: "Your saved items",
    gradient: "from-indigo-500 to-blue-600",
  },
  {
    id: "memories",
    icon: History,
    label: "Memories",
    description: "Recently played",
    gradient: "from-orange-500 to-red-600",
    route: "/recently-played",
  },
];

const quickActions: FeatureItem[] = [
  {
    id: "daily-bonus",
    icon: Flame,
    label: "Daily Bonus",
    gradient: "from-orange-500 to-red-500",
  },
  {
    id: "challenges",
    icon: Target,
    label: "Challenges",
    gradient: "from-purple-500 to-indigo-500",
    route: "/combo-leaderboard",
  },
  {
    id: "nft-gallery",
    icon: Award,
    label: "NFT Gallery",
    gradient: "from-cyan-500 to-blue-500",
    route: "/nft-gallery",
  },
  {
    id: "settings",
    icon: Settings,
    label: "Settings",
    gradient: "from-gray-500 to-slate-600",
    route: "/settings",
  },
];

interface FeatureButtonProps {
  item: FeatureItem;
  size?: "sm" | "md" | "lg";
  showDescription?: boolean;
  onClick: () => void;
}

const FeatureButton = ({ item, size = "md", showDescription = false, onClick }: FeatureButtonProps) => {
  const sizeClasses = {
    sm: "w-10 h-10",
    md: "w-12 h-12",
    lg: "w-14 h-14",
  };

  const iconSizes = {
    sm: "w-5 h-5",
    md: "w-6 h-6",
    lg: "w-7 h-7",
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-muted/80 transition-all group relative"
    >
      <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br ${item.gradient} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow`}>
        <item.icon className={`${iconSizes[size]} text-white`} />
      </div>
      
      {item.badge && item.badge > 0 && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-1 right-1 min-w-[20px] h-5 bg-destructive text-destructive-foreground text-xs font-bold rounded-full flex items-center justify-center px-1 shadow-md"
        >
          {item.badge > 99 ? '99+' : item.badge}
        </motion.span>
      )}
      
      {item.isNew && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-gradient-to-r from-primary to-secondary text-white text-[10px] font-bold rounded-full shadow-md"
        >
          NEW
        </motion.span>
      )}
      
      <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors text-center line-clamp-1">
        {item.label}
      </span>
      
      {showDescription && item.description && (
        <span className="text-[10px] text-muted-foreground/70 text-center line-clamp-1">
          {item.description}
        </span>
      )}
    </motion.button>
  );
};

interface FacebookFeatureMenuProps {
  variant?: "grid" | "list" | "compact";
  showQuickActions?: boolean;
  maxItems?: number;
}

export const FacebookFeatureMenu = ({ 
  variant = "grid", 
  showQuickActions = true,
  maxItems 
}: FacebookFeatureMenuProps) => {
  const navigate = useNavigate();
  const [showAll, setShowAll] = useState(false);

  const handleItemClick = (item: FeatureItem) => {
    if (item.onClick) {
      item.onClick();
    } else if (item.route) {
      navigate(item.route);
    } else {
      toast.info(`${item.label} coming soon!`);
    }
  };

  const displayItems = maxItems && !showAll 
    ? featureItems.slice(0, maxItems) 
    : featureItems;

  if (variant === "list") {
    return (
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Compass className="w-5 h-5 text-primary" />
            Shortcuts
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 p-2">
          {displayItems.map((item) => (
            <motion.button
              key={item.id}
              whileHover={{ x: 4 }}
              onClick={() => handleItemClick(item)}
              className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted transition-all group"
            >
              <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${item.gradient} flex items-center justify-center shadow-sm`}>
                <item.icon className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium group-hover:text-primary transition-colors">
                  {item.label}
                </p>
                {item.description && (
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                )}
              </div>
              {item.badge && (
                <span className="min-w-[20px] h-5 bg-destructive text-destructive-foreground text-xs font-bold rounded-full flex items-center justify-center px-1.5">
                  {item.badge}
                </span>
              )}
              {item.isNew && (
                <span className="px-1.5 py-0.5 bg-gradient-to-r from-primary to-secondary text-white text-[10px] font-bold rounded-full">
                  NEW
                </span>
              )}
            </motion.button>
          ))}
          
          {maxItems && featureItems.length > maxItems && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full mt-2"
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? "Show Less" : `See All (${featureItems.length})`}
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  if (variant === "compact") {
    return (
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {displayItems.map((item) => (
          <motion.button
            key={item.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleItemClick(item)}
            className="flex items-center gap-2 px-3 py-2 rounded-full bg-muted hover:bg-muted/80 transition-all shrink-0 relative"
          >
            <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${item.gradient} flex items-center justify-center`}>
              <item.icon className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-medium">{item.label}</span>
            {item.badge && item.badge > 0 && (
              <span className="min-w-[18px] h-4 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                {item.badge}
              </span>
            )}
          </motion.button>
        ))}
      </div>
    );
  }

  // Default grid variant
  return (
    <div className="space-y-4">
      <Card className="shadow-sm">
        <CardContent className="p-4">
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-1">
            {displayItems.map((item) => (
              <FeatureButton
                key={item.id}
                item={item}
                onClick={() => handleItemClick(item)}
              />
            ))}
          </div>
          
          {maxItems && featureItems.length > maxItems && !showAll && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full mt-3"
              onClick={() => setShowAll(true)}
            >
              See More
            </Button>
          )}
        </CardContent>
      </Card>

      {showQuickActions && (
        <Card className="shadow-sm bg-gradient-to-r from-primary/5 to-secondary/5">
          <CardContent className="p-3">
            <p className="text-xs font-semibold text-muted-foreground mb-2 px-1">Quick Actions</p>
            <div className="grid grid-cols-4 gap-1">
              {quickActions.map((item) => (
                <FeatureButton
                  key={item.id}
                  item={item}
                  size="sm"
                  onClick={() => handleItemClick(item)}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FacebookFeatureMenu;
