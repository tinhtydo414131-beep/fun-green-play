import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { BackgroundMusicPlayer } from "@/components/BackgroundMusicPlayer";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { Web3Provider } from "@/providers/Web3Provider";
import { AnimatePresence } from "framer-motion";
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
import Install from "./pages/Install";
import NotFound from "./pages/NotFound";
import ComboLeaderboard from "./pages/ComboLeaderboard";
import CamlyCoinHistory from "./pages/CamlyCoinHistory";
import UploadGame from "./pages/UploadGame";
import AdminGameReview from "./pages/AdminGameReview";
import MyGames from "./pages/MyGames";
import EditGame from "./pages/EditGame";

const queryClient = new QueryClient();

const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Index />} />
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
        <Route path="/install" element={<Install />} />
        <Route path="/combo-leaderboard" element={<ComboLeaderboard />} />
        <Route path="/camly-coins" element={<CamlyCoinHistory />} />
        <Route path="/upload-game" element={<UploadGame />} />
        <Route path="/admin/game-review" element={<AdminGameReview />} />
        <Route path="/my-games" element={<MyGames />} />
        <Route path="/edit-game/:id" element={<EditGame />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <Web3Provider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BackgroundMusicPlayer />
        <BrowserRouter>
          <MobileBottomNav />
          <AnimatedRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </Web3Provider>
  </QueryClientProvider>
);

export default App;
