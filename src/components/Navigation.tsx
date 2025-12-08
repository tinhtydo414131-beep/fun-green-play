import { Gamepad2, User, LogOut, Trophy, Users, MessageCircle, Wallet, Music, Settings, Coins, Gift, Bell, Menu, X, Search } from "lucide-react";
import { NavLink } from "./NavLink";
import { Button } from "./ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useWeb3Rewards } from "@/hooks/useWeb3Rewards";
import { useNavigate, useLocation } from "react-router-dom";
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
import { FriendRequestNotification } from "./FriendRequestNotification";
import { useFriendRequestNotifications } from "@/hooks/useFriendRequestNotifications";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { GlobalSearchModal } from "./GlobalSearchModal";
import { MessengerButton } from "./MessengerButton";
import { Web3Header } from "./Web3Header";
import { CharityCounter } from "./CharityCounter";

export const Navigation = () => {
  const { user, signOut } = useAuth();
  const { camlyBalance, isLoading: isLoadingRewards } = useWeb3Rewards();
  const navigate = useNavigate();
  const location = useLocation();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const {
    pendingRequest,
    pendingCount,
    acceptRequest,
    rejectRequest,
    dismissNotification,
  } = useFriendRequestNotifications();

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && !["INPUT", "TEXTAREA"].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

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

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  const navLinks = [
    { path: "/games", label: "Play Games" },
    { path: "/public-music", label: "Music" },
    { path: "/leaderboard", label: "Leaderboard" },
  ];

  return (
    <>
      {/* Global Search Modal */}
      <GlobalSearchModal open={searchOpen} onOpenChange={setSearchOpen} />

      {/* Friend Request Notification */}
      <FriendRequestNotification
        request={pendingRequest}
        onClose={dismissNotification}
        onAccept={acceptRequest}
        onReject={rejectRequest}
      />

      {/* Desktop Navigation - Sticky */}
      <nav className="hidden md:block sticky-header">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <NavLink 
              to="/" 
              className="flex items-center gap-3 group hover:scale-105 transition-transform"
            >
              <div className="p-2.5 bg-gradient-to-br from-primary to-secondary rounded-xl shadow-lg group-hover:shadow-xl transition-all">
                <Gamepad2 className="w-7 h-7 text-white" />
              </div>
              <span className="text-2xl font-orbitron font-extrabold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent tracking-wide">
                FUN Planet
              </span>
            </NavLink>

            {/* Desktop Links */}
            <div className="flex items-center gap-2">
              {navLinks.map((link) => (
                <NavLink 
                  key={link.path}
                  to={link.path} 
                  className={`px-5 py-2.5 rounded-xl font-inter font-semibold text-base transition-all ${
                    isActive(link.path) 
                      ? 'bg-primary/10 text-primary border-b-2 border-primary' 
                      : 'text-foreground hover:text-primary hover:bg-primary/5'
                  }`}
                >
                  {link.label}
                </NavLink>
              ))}

              {/* Web3 Wallet Connect */}
              <Web3Header />

              {user && (
                <>
                  {/* Search Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSearchOpen(true)}
                    className="hover:bg-primary/10"
                    title="Tìm kiếm (nhấn /)"
                  >
                    <Search className="w-5 h-5" />
                  </Button>

                  {/* Messenger Button */}
                  <MessengerButton />

                  {/* Camly Balance */}
                  <button
                    onClick={() => navigate("/rewards-history")}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 hover:border-yellow-500/50 hover:scale-105 transition-all shadow-sm"
                  >
                    <Coins className="w-5 h-5 text-yellow-500" />
                    <span className="font-inter font-bold text-base bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
                      {isLoadingRewards ? "..." : camlyBalance.toLocaleString()}
                    </span>
                  </button>
                </>
              )}

              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-3 ml-2 p-1.5 rounded-xl hover:bg-muted/50 active:scale-95 transition-all">
                      <Avatar className="w-10 h-10 border-2 border-primary/30">
                        <AvatarImage src={avatarUrl || undefined} />
                        <AvatarFallback className="bg-primary/20 text-primary font-inter font-bold">
                          {user?.email?.[0]?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      {username && (
                        <span className="font-inter font-semibold text-foreground">
                          {username}
                        </span>
                      )}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 rounded-xl">
                    <DropdownMenuItem onClick={() => navigate("/profile")} className="py-3">
                      <User className="mr-3 h-5 w-5" />
                      <span className="font-medium">My Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/wallet")} className="py-3">
                      <Wallet className="mr-3 h-5 w-5" />
                      <span className="font-medium">Fun Wallet</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/find-friends")} className="py-3 relative">
                      <Users className="mr-3 h-5 w-5" />
                      <span className="font-medium">Find Friends</span>
                      {pendingCount > 0 && (
                        <Badge className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5">
                          {pendingCount}
                        </Badge>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/messages")} className="py-3">
                      <MessageCircle className="mr-3 h-5 w-5" />
                      <span className="font-medium">Messages</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/dashboard")} className="py-3 text-pink-600">
                      <Gift className="mr-3 h-5 w-5" />
                      <span className="font-medium">Invite Friends</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/settings")} className="py-3">
                      <Settings className="mr-3 h-5 w-5" />
                      <span className="font-medium">Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="py-3">
                      <LogOut className="mr-3 h-5 w-5" />
                      <span className="font-medium">Log Out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  onClick={() => navigate("/auth")}
                  className="font-inter font-bold text-base px-6 py-2.5 h-11 rounded-xl bg-gradient-to-r from-primary to-secondary shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                >
                  Login
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Top Header - Sticky */}
      <div className="md:hidden sticky-header">
        <div className="flex items-center justify-between h-16 px-4">
          <NavLink 
            to="/" 
            className="flex items-center gap-2 active:scale-95 transition-transform"
          >
            <div className="p-2 bg-gradient-to-br from-primary to-secondary rounded-xl shadow-md">
              <Gamepad2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-orbitron font-extrabold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent tracking-wide">
              FUN Planet
            </span>
          </NavLink>
          
          <div className="flex items-center gap-2">
            {user && (
              <>
                {/* Mobile Search Button */}
                <button
                  onClick={() => setSearchOpen(true)}
                  className="p-2 rounded-xl hover:bg-muted/50 transition-colors"
                >
                  <Search className="w-5 h-5 text-foreground" />
                </button>

                {/* Mobile Messenger Button */}
                <MessengerButton />

                {/* Camly Balance */}
                <button
                  onClick={() => navigate("/rewards-history")}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30"
                >
                  <Coins className="w-4 h-4 text-yellow-500" />
                  <span className="font-inter font-bold text-sm bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
                    {isLoadingRewards ? "..." : camlyBalance.toLocaleString()}
                  </span>
                </button>
              </>
            )}
            
            {/* Mobile Menu Button */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <button className="p-2 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                  <Menu className="w-6 h-6 text-foreground" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] p-0">
                <div className="flex flex-col h-full">
                  {/* Header */}
                  <div className="p-6 border-b border-border">
                    {user ? (
                      <div className="flex items-center gap-3">
                        <Avatar className="w-12 h-12 border-2 border-primary/30">
                          <AvatarImage src={avatarUrl || undefined} />
                          <AvatarFallback className="bg-primary/20 text-primary font-inter font-bold text-lg">
                            {user?.email?.[0]?.toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-inter font-bold text-foreground">{username || "User"}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    ) : (
                      <Button
                        onClick={() => {
                          navigate("/auth");
                          setMobileMenuOpen(false);
                        }}
                        className="w-full h-12 rounded-xl bg-gradient-to-r from-primary to-secondary font-inter font-bold text-base"
                      >
                        Login / Sign Up
                      </Button>
                    )}
                  </div>

                  {/* Menu Items */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {user && (
                      <>
                        <SheetClose asChild>
                          <button
                            onClick={() => navigate("/profile")}
                            className="flex items-center gap-3 w-full p-4 rounded-xl hover:bg-muted/50 transition-colors"
                          >
                            <User className="w-5 h-5 text-muted-foreground" />
                            <span className="font-inter font-medium">My Profile</span>
                          </button>
                        </SheetClose>
                        <SheetClose asChild>
                          <button
                            onClick={() => navigate("/wallet")}
                            className="flex items-center gap-3 w-full p-4 rounded-xl hover:bg-muted/50 transition-colors"
                          >
                            <Wallet className="w-5 h-5 text-muted-foreground" />
                            <span className="font-inter font-medium">Fun Wallet</span>
                          </button>
                        </SheetClose>
                        <SheetClose asChild>
                          <button
                            onClick={() => navigate("/find-friends")}
                            className="flex items-center gap-3 w-full p-4 rounded-xl hover:bg-muted/50 transition-colors"
                          >
                            <Users className="w-5 h-5 text-muted-foreground" />
                            <span className="font-inter font-medium">Find Friends</span>
                            {pendingCount > 0 && (
                              <Badge className="ml-auto bg-red-500 text-white text-xs px-2">
                                {pendingCount}
                              </Badge>
                            )}
                          </button>
                        </SheetClose>
                        <SheetClose asChild>
                          <button
                            onClick={() => navigate("/settings")}
                            className="flex items-center gap-3 w-full p-4 rounded-xl hover:bg-muted/50 transition-colors"
                          >
                            <Settings className="w-5 h-5 text-muted-foreground" />
                            <span className="font-inter font-medium">Settings</span>
                          </button>
                        </SheetClose>
                      </>
                    )}
                  </div>

                  {/* Footer */}
                  {user && (
                    <div className="p-4 border-t border-border">
                      <SheetClose asChild>
                        <button
                          onClick={handleSignOut}
                          className="flex items-center gap-3 w-full p-4 rounded-xl text-destructive hover:bg-destructive/10 transition-colors"
                        >
                          <LogOut className="w-5 h-5" />
                          <span className="font-inter font-medium">Log Out</span>
                        </button>
                      </SheetClose>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </>
  );
};
