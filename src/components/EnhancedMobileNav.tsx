import { Home, Gamepad2, Upload, MessageCircle, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const EnhancedMobileNav = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch unread messages count
  useEffect(() => {
    if (!user) return;

    const fetchUnread = async () => {
      const { count } = await supabase
        .from('private_messages')
        .select('*', { count: 'exact', head: true })
        .eq('receiver_id', user.id)
        .eq('is_read', false);
      
      setUnreadCount(count || 0);
    };

    fetchUnread();

    // Subscribe to new messages
    const channel = supabase
      .channel('mobile_nav_messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'private_messages',
          filter: `receiver_id=eq.${user.id}`
        },
        () => fetchUnread()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Hide on game pages
  const hideOnPaths = ['/game/', '/lovable-game/'];
  const shouldHide = hideOnPaths.some(path => location.pathname.startsWith(path));
  if (shouldHide) return null;

  const navItems = [
    { 
      icon: Home, 
      label: "Trang chủ", 
      path: "/", 
      emoji: "🏠",
      gradient: "from-orange-500 to-pink-500"
    },
    { 
      icon: Gamepad2, 
      label: "Game", 
      path: "/games", 
      emoji: "🎮",
      gradient: "from-blue-500 to-cyan-500"
    },
    { 
      icon: Upload, 
      label: "Tải lên", 
      path: "/upload-game", 
      emoji: "✨",
      gradient: "from-green-500 to-emerald-500",
      isSpecial: true
    },
    { 
      icon: MessageCircle, 
      label: "Chat", 
      path: "/chat", 
      emoji: "💬",
      gradient: "from-purple-500 to-pink-500",
      badge: unreadCount > 0 ? unreadCount : undefined
    },
    { 
      icon: User, 
      label: "Cá nhân", 
      path: user ? "/profile" : "/auth", 
      emoji: "👤",
      gradient: "from-yellow-500 to-orange-500"
    },
  ];

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    if (path === "/profile") return location.pathname === "/profile" || location.pathname === "/dashboard";
    return location.pathname.startsWith(path);
  };

  return (
    <motion.nav 
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/98 backdrop-blur-xl border-t-2 border-primary/20 shadow-[0_-4px_30px_rgba(0,0,0,0.15)]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="grid grid-cols-5 h-[72px] max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <Link
              key={item.label}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 transition-all duration-200 touch-manipulation active:scale-95 min-h-[72px] relative",
                active ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {/* Active indicator line */}
              {active && (
                <motion.div
                  layoutId="mobileActiveTab"
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-primary to-secondary rounded-full"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              
              {/* Special upload button */}
              {item.isSpecial ? (
                <motion.div 
                  className={cn(
                    "relative -mt-6 p-3 rounded-full bg-gradient-to-r shadow-lg",
                    item.gradient
                  )}
                  whileTap={{ scale: 0.9 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <Icon className="w-6 h-6 text-white" strokeWidth={2.5} />
                  {/* Pulsing ring */}
                  <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-green-500 to-emerald-500"
                  />
                </motion.div>
              ) : (
                <motion.div 
                  className={cn(
                    "relative p-2 rounded-xl transition-all duration-200",
                    active && "bg-primary/15"
                  )}
                  whileTap={{ scale: 0.9 }}
                >
                  <Icon 
                    className={cn(
                      "w-5 h-5 sm:w-6 sm:h-6 transition-all duration-200",
                      active && "scale-110"
                    )} 
                    strokeWidth={active ? 2.5 : 2} 
                  />
                  
                  {/* Badge for notifications */}
                  {item.badge && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-white text-[10px] font-bold rounded-full flex items-center justify-center"
                    >
                      {item.badge > 99 ? '99+' : item.badge}
                    </motion.span>
                  )}
                </motion.div>
              )}
              
              <span className={cn(
                "text-[10px] sm:text-xs font-medium transition-all duration-200",
                active ? "text-primary font-bold" : "text-muted-foreground",
                item.isSpecial && "mt-1"
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </motion.nav>
  );
};

export default EnhancedMobileNav;
