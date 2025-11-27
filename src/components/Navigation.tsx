import { Gamepad2, User, LogOut, Trophy, Users, MessageCircle, Wallet, Music } from "lucide-react";
import { NavLink } from "./NavLink";
import { Button } from "./ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export const Navigation = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 backdrop-blur-lg border-b-4 border-primary/30 shadow-lg">
      <div className="container mx-auto px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Mobile-optimized Logo */}
          <NavLink to="/" className="flex items-center gap-2 sm:gap-3 text-2xl sm:text-3xl font-fredoka font-bold text-primary hover:text-secondary transition-all transform hover:scale-105">
            <div className="bg-gradient-to-br from-primary to-secondary p-1.5 sm:p-2 rounded-full shadow-lg">
              <Gamepad2 className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              FUN Planet
            </span>
          </NavLink>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <NavLink 
              to="/" 
              className="text-lg font-fredoka font-semibold text-foreground hover:text-primary transition-all transform hover:scale-110"
              activeClassName="text-primary"
            >
              Home 🏠
            </NavLink>
            <NavLink 
              to="/games" 
              className="text-lg font-fredoka font-semibold text-foreground hover:text-primary transition-all transform hover:scale-110"
              activeClassName="text-primary"
            >
              All Games 🎮
            </NavLink>
            <NavLink 
              to="/public-music" 
              className="text-lg font-fredoka font-semibold text-foreground hover:text-primary transition-all transform hover:scale-110"
              activeClassName="text-primary"
            >
              Nhạc MP3 🎵
            </NavLink>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-12 w-12 rounded-full border-4 border-primary/30 hover:border-primary transition-all hover:shadow-lg transform hover:scale-110">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white font-fredoka font-bold text-xl">
                        {user.email?.[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64 border-4 border-primary/30 shadow-xl" align="end">
                  <DropdownMenuLabel className="font-fredoka text-lg">
                    <div className="flex flex-col space-y-1">
                      <p className="text-primary font-bold">My Account 😊</p>
                      <p className="text-sm font-comic text-muted-foreground truncate">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-primary/20" />
                  <DropdownMenuItem onClick={() => navigate("/dashboard")} className="font-fredoka cursor-pointer hover:bg-primary/10">
                    <User className="mr-2 h-5 w-5 text-primary" />
                    <span>Dashboard 📊</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/leaderboard")} className="font-fredoka cursor-pointer hover:bg-accent/10">
                    <Trophy className="mr-2 h-5 w-5 text-accent" />
                    <span>Leaderboard 🏆</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/friends")} className="font-fredoka cursor-pointer hover:bg-secondary/10">
                    <Users className="mr-2 h-5 w-5 text-secondary" />
                    <span>Friends 👥</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/chat")} className="font-fredoka cursor-pointer hover:bg-primary/10">
                    <MessageCircle className="mr-2 h-5 w-5 text-primary" />
                    <span>Chat 💬</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/wallet")} className="font-fredoka cursor-pointer hover:bg-yellow-500/10">
                    <Wallet className="mr-2 h-5 w-5 text-yellow-500" />
                    <span>FUN Wallet 💰</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/music")} className="font-fredoka cursor-pointer hover:bg-purple-500/10">
                    <Music className="mr-2 h-5 w-5 text-purple-500" />
                    <span>Music Library 🎵</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-primary/20" />
                  <DropdownMenuItem onClick={handleSignOut} className="font-fredoka cursor-pointer hover:bg-destructive/10 text-destructive">
                    <LogOut className="mr-2 h-5 w-5" />
                    <span>Log Out 👋</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                onClick={() => navigate("/auth")}
                className="font-fredoka font-bold text-lg px-6 py-6 bg-gradient-to-r from-primary to-secondary hover:shadow-lg transform hover:scale-110 transition-all"
              >
                Login / Sign Up ✨
              </Button>
            )}
          </div>

          {/* Mobile Auth Button - Full Width Style on Small Screens */}
          <div className="md:hidden">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full border-3 border-primary/30 hover:border-primary transition-all">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white font-fredoka font-bold text-lg">
                        {user.email?.[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64 border-4 border-primary/30 shadow-xl" align="end">
                  <DropdownMenuLabel className="font-fredoka text-lg">
                    <div className="flex flex-col space-y-1">
                      <p className="text-primary font-bold">My Account 😊</p>
                      <p className="text-sm font-comic text-muted-foreground truncate">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-primary/20" />
                  <DropdownMenuItem onClick={() => navigate("/dashboard")} className="font-fredoka cursor-pointer hover:bg-primary/10">
                    <User className="mr-2 h-5 w-5 text-primary" />
                    <span>Dashboard 📊</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/leaderboard")} className="font-fredoka cursor-pointer hover:bg-accent/10">
                    <Trophy className="mr-2 h-5 w-5 text-accent" />
                    <span>Leaderboard 🏆</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/friends")} className="font-fredoka cursor-pointer hover:bg-secondary/10">
                    <Users className="mr-2 h-5 w-5 text-secondary" />
                    <span>Friends 👥</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/chat")} className="font-fredoka cursor-pointer hover:bg-primary/10">
                    <MessageCircle className="mr-2 h-5 w-5 text-primary" />
                    <span>Chat 💬</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/wallet")} className="font-fredoka cursor-pointer hover:bg-yellow-500/10">
                    <Wallet className="mr-2 h-5 w-5 text-yellow-500" />
                    <span>FUN Wallet 💰</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/music")} className="font-fredoka cursor-pointer hover:bg-purple-500/10">
                    <Music className="mr-2 h-5 w-5 text-purple-500" />
                    <span>Music Library 🎵</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-primary/20" />
                  <DropdownMenuItem onClick={handleSignOut} className="font-fredoka cursor-pointer hover:bg-destructive/10 text-destructive">
                    <LogOut className="mr-2 h-5 w-5" />
                    <span>Log Out 👋</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                onClick={() => navigate("/auth")}
                className="font-fredoka font-bold text-base px-5 py-2 bg-gradient-to-r from-primary to-secondary rounded-[30px] hover:shadow-lg transition-all min-w-[110px]"
              >
                Đăng nhập
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
