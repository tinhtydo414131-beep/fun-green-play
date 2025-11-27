import { Home, Gamepad2, Trophy, Wallet, User, Music } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

export const MobileBottomNav = () => {
  const location = useLocation();
  const { user } = useAuth();
  
  const navItems = [
    { icon: Home, label: "Trang chủ", path: "/" },
    { icon: Gamepad2, label: "Trò chơi", path: "/games" },
    { icon: Music, label: "Nhạc MP3", path: "/public-music" },
    { icon: Wallet, label: "Ví", path: user ? "/wallet" : "/auth" },
    { icon: User, label: "Cá nhân", path: user ? "/dashboard" : "/auth" },
  ];

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t-4 border-primary/30 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] pb-safe">
      <div className="grid grid-cols-5 h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 transition-all touch-manipulation active:scale-95",
                active 
                  ? "text-primary" 
                  : "text-muted-foreground active:text-primary"
              )}
            >
              <div className={cn(
                "relative p-1.5 rounded-xl transition-all",
                active && "bg-primary/10"
              )}>
                <Icon className={cn(
                  "w-5 h-5 transition-all",
                  active && "scale-110"
                )} />
                {active && (
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-full" />
                )}
              </div>
              <span className={cn(
                "text-[10px] font-fredoka font-semibold transition-all",
                active && "scale-105"
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