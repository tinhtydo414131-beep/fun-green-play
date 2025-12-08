import { Home, Gamepad2, Upload, User, Trophy, MessageCircle, Wallet } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { motion } from "framer-motion";

export const MobileBottomNavEnhanced = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { isDev } = useUserRole();

  const baseNavItems = [
    { icon: Home, label: "Home", labelVi: "Trang chủ", path: "/", emoji: "🏠" },
    { icon: Gamepad2, label: "Games", labelVi: "Game", path: "/games", emoji: "🎮" },
    { icon: Trophy, label: "Rank", labelVi: "BXH", path: "/leaderboard", emoji: "🏆" },
  ];

  // Add upload tab for developers only
  const navItems = isDev 
    ? [
        ...baseNavItems.slice(0, 2),
        { icon: Upload, label: "Upload", labelVi: "Tải lên", path: "/upload-game", emoji: "📤" },
        ...baseNavItems.slice(2),
        { icon: User, label: "Profile", labelVi: "Cá nhân", path: user ? "/dashboard" : "/auth", emoji: "👤" },
      ]
    : [
        ...baseNavItems,
        { icon: MessageCircle, label: "Chat", labelVi: "Chat", path: user ? "/messages" : "/auth", emoji: "💬" },
        { icon: User, label: "Profile", labelVi: "Cá nhân", path: user ? "/dashboard" : "/auth", emoji: "👤" },
      ];

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <motion.nav 
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/98 backdrop-blur-xl border-t-2 border-primary/20 shadow-[0_-4px_30px_rgba(0,0,0,0.15)]"
      style={{ 
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <div className={cn(
        "grid h-[72px] max-w-lg mx-auto",
        navItems.length === 5 ? "grid-cols-5" : "grid-cols-4"
      )}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <Link
              key={item.label}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 transition-all duration-200 touch-manipulation active:scale-95 min-h-[72px] relative",
                active 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {/* Active indicator */}
              {active && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-primary to-secondary rounded-full"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              
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
              </motion.div>
              
              <span className={cn(
                "text-[10px] sm:text-xs font-medium transition-all duration-200",
                active ? "text-primary font-bold" : "text-muted-foreground"
              )}>
                {item.labelVi}
              </span>
            </Link>
          );
        })}
      </div>
    </motion.nav>
  );
};
