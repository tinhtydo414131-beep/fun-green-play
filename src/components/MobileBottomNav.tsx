import { Home, Gamepad2, MessageCircle, User, Trophy } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

export const MobileBottomNav = () => {
  const location = useLocation();
  const { user } = useAuth();
  
  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: Gamepad2, label: "Games", path: "/games" },
    { icon: MessageCircle, label: "Chat", path: user ? "/messages" : "/auth" },
    { icon: User, label: "Profile", path: user ? "/dashboard" : "/auth" },
    { icon: Trophy, label: "Rank", path: "/leaderboard" },
  ];

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-t border-border shadow-[0_-4px_20px_rgba(0,0,0,0.1)] safe-area-bottom">
      <div className="grid grid-cols-5 h-[72px] max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <Link
              key={item.label}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center gap-1 transition-all duration-200 touch-manipulation active:scale-95 min-h-[72px]",
                active 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className={cn(
                "relative p-2.5 rounded-xl transition-all duration-200",
                active && "bg-primary/15"
              )}>
                <Icon className={cn(
                  "w-6 h-6 transition-all duration-200",
                  active && "scale-110"
                )} strokeWidth={active ? 2.5 : 2} />
                {active && (
                  <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-6 h-1 bg-gradient-to-r from-primary to-primary/60 rounded-full" />
                )}
              </div>
              <span className={cn(
                "text-xs font-inter font-medium transition-all duration-200",
                active ? "text-primary font-bold" : "text-muted-foreground"
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
