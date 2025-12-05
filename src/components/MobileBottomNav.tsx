import { Home, Gamepad2, MessageCircle, User, Newspaper } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

export const MobileBottomNav = () => {
  const location = useLocation();
  const { user } = useAuth();
  
  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: Newspaper, label: "Feed", path: user ? "/feed" : "/auth" },
    { icon: Gamepad2, label: "Games", path: "/games" },
    { icon: MessageCircle, label: "Chat", path: user ? "/messages" : "/auth" },
    { icon: User, label: "Profile", path: user ? "/dashboard" : "/auth" },
  ];

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-t border-border/50 shadow-[0_-4px_20px_rgba(0,0,0,0.15)] safe-area-bottom">
      <div className="grid grid-cols-5 h-16 max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <Link
              key={item.label}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 transition-all duration-200 touch-manipulation active:scale-95 min-h-0 p-0",
                active 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className={cn(
                "relative p-2 rounded-xl transition-all duration-200",
                active && "bg-primary/15"
              )}>
                <Icon className={cn(
                  "w-5 h-5 transition-all duration-200",
                  active && "scale-110"
                )} strokeWidth={active ? 2.5 : 2} />
                {active && (
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-6 h-1 bg-gradient-to-r from-primary to-primary/60 rounded-full" />
                )}
              </div>
              <span className={cn(
                "text-[10px] font-medium transition-all duration-200",
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
