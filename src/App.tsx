import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { BackgroundMusicPlayer } from "@/components/BackgroundMusicPlayer";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { Web3Provider } from "@/providers/Web3Provider";
import HonorBoard from "./pages/HonorBoard";
import Index from "./pages/Index";
import Games from "./pages/Games";
import GamePlay from "./pages/GamePlay";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import PublicProfile from "./pages/PublicProfile";
import Leaderboard from "./pages/Leaderboard";
import Friends from "./pages/Friends";
import Chat from "./pages/Chat";
import NexusLeaderboard from "./pages/NexusLeaderboard";
import FunWallet from "./pages/FunWallet";
import MusicLibrary from "./pages/MusicLibrary";
import PublicMusic from "./pages/PublicMusic";
import WalletGuide from "./pages/WalletGuide";
import RecentlyPlayed from "./pages/RecentlyPlayed";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Force rebuild to clear Vite HMR cache and fix React hooks error
const App = () => (
  <QueryClientProvider client={queryClient}>
    <Web3Provider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BackgroundMusicPlayer />
        <BrowserRouter>
          <MobileBottomNav />
          <Routes>
            <Route path="/" element={<HonorBoard />} />
            <Route path="/home" element={<Index />} />
            <Route path="/games" element={<Games />} />
            <Route path="/game/:gameId" element={<GamePlay />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/profile/:userId" element={<PublicProfile />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/nexus-leaderboard" element={<NexusLeaderboard />} />
            <Route path="/wallet" element={<FunWallet />} />
            <Route path="/friends" element={<Friends />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/music" element={<MusicLibrary />} />
            <Route path="/public-music" element={<PublicMusic />} />
            <Route path="/wallet-guide" element={<WalletGuide />} />
            <Route path="/recently-played" element={<RecentlyPlayed />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </Web3Provider>
  </QueryClientProvider>
);

export default App;
