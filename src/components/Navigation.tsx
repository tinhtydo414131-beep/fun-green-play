import { Gamepad2, User, LogOut, Trophy, Users, MessageCircle, Wallet, Music, Settings, Coins, Gift } from "lucide-react";
import { NavLink } from "./NavLink";
import { Button } from "./ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useWeb3Rewards } from "@/hooks/useWeb3Rewards";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const Navigation = () => {
  const { user, signOut } = useAuth();
  const { camlyBalance, isLoading: isLoadingRewards } = useWeb3Rewards();
  const navigate = useNavigate();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("avatar_url, username")
        .eq("id", user.id)
        .single();

      if (!error && data) {
        setAvatarUrl(data.avatar_url);
        setUsername(data.username);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:block fixed top-0 left-0 right-0 z-50 bg-white border-b-4 border-primary/30 shadow-lg backdrop-blur-md">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <NavLink 
              to="/" 
              className="flex items-center gap-3 group hover:scale-105 transition-transform"
            >
              <div className="p-2 bg-gradient-to-br from-primary to-secondary rounded-xl shadow-lg group-hover:shadow-xl transition-all">
                <Gamepad2 className="w-8 h-8 text-white" />
              </div>
              <span className="text-2xl font-orbitron font-black bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent tracking-wider">
                FUN Planet
              </span>
            </NavLink>

            {/* Desktop Links and Auth */}
            <div className="flex items-center gap-4">
              <NavLink 
                to="/games" 
                className="px-4 py-2 rounded-xl font-space font-semibold text-foreground hover:text-primary hover:bg-primary/10 transition-all"
              >
                Play Games
              </NavLink>
              <NavLink 
                to="/public-music" 
                className="px-4 py-2 rounded-xl font-space font-semibold text-foreground hover:text-primary hover:bg-primary/10 transition-all"
              >
                Music
              </NavLink>

              {user && (
                <button
                  onClick={() => navigate("/rewards-history")}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 hover:border-yellow-500/50 transition-all"
                >
                  <Coins className="w-4 h-4 text-yellow-500" />
                  <span className="font-bold text-sm bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
                    {isLoadingRewards ? "..." : camlyBalance.toLocaleString()}
                  </span>
                </button>
              )}

              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 active:scale-95 transition-transform">
                      <Avatar className="w-10 h-10 border-2 border-primary/30">
                        <AvatarImage src={avatarUrl || undefined} />
                        <AvatarFallback className="bg-primary/20 text-primary font-fredoka font-bold">
                          {user?.email?.[0]?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      {username && (
                        <span className="font-space font-semibold text-foreground">
                          {username}
                        </span>
                      )}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                      <User className="mr-2 h-4 w-4" />
                      My Account
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/wallet")}>
                      <Wallet className="mr-2 h-4 w-4" />
                      Fun Wallet
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/dashboard")} className="text-pink-600">
                      <Gift className="mr-2 h-4 w-4" />
                      Mời bạn bè 🎁
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/settings")}>
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Log Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  onClick={() => navigate("/auth")}
                  className="font-fredoka font-bold text-sm px-4 py-2 bg-gradient-to-r from-primary to-secondary"
                >
                  Login
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Top Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b-2 border-primary/20 shadow-md">
        <div className="flex items-center justify-between h-14 px-4">
          <NavLink 
            to="/" 
            className="flex items-center gap-2 active:scale-95 transition-transform"
          >
            <div className="p-1.5 bg-gradient-to-br from-primary to-secondary rounded-lg shadow-md">
              <Gamepad2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-orbitron font-black bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent tracking-wide">
              FUN Planet
            </span>
          </NavLink>
          
          {user && (
            <button
              onClick={() => navigate("/rewards-history")}
              className="flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30"
            >
              <Coins className="w-3.5 h-3.5 text-yellow-500" />
              <span className="font-bold text-xs bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
                {isLoadingRewards ? "..." : camlyBalance.toLocaleString()}
              </span>
            </button>
          )}
          
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 active:scale-95 transition-transform touch-manipulation">
                  <Avatar className="w-8 h-8 border-2 border-primary/30">
                    <AvatarImage src={avatarUrl || undefined} />
                    <AvatarFallback className="bg-primary/20 text-primary font-fredoka font-bold text-sm">
                      {user?.email?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  {username && (
                    <span className="font-space font-semibold text-foreground text-sm">
                      {username}
                    </span>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => navigate("/wallet")}>
                  <Wallet className="mr-2 h-4 w-4" />
                  Fun Wallet
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/settings")}>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </>
  );
};