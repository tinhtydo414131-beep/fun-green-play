import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { BackgroundMusicPlayer } from "@/components/BackgroundMusicPlayer";
import { MobileBottomNavEnhanced } from "@/components/MobileBottomNavEnhanced";
import { Web3Provider } from "@/providers/Web3Provider";
import { CoinNotification } from "@/components/CoinNotification";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { RoleSelectionModal } from "@/components/RoleSelectionModal";
import { CharityCounter } from "@/components/CharityCounter";
import { FloatingChatWindows, useChatWindows } from "@/components/private-chat/FloatingChatWindows";
import { CallProvider } from "@/components/private-chat/CallProvider";
import { AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import Index from "./pages/Index";
import Games from "./pages/Games";
import GamePlay from "./pages/GamePlay";
import Auth from "./pages/Auth";
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
import UploadGame from "./pages/UploadGame";
import AdminGameReview from "./pages/AdminGameReview";
import MyGames from "./pages/MyGames";
import EditGame from "./pages/EditGame";
import GameDetails from "./pages/GameDetails";
import RewardsHistory from "./pages/RewardsHistory";
import CamlyLeaderboard from "./pages/CamlyLeaderboard";
import Profile from "./pages/Profile";
import FindFriends from "./pages/FindFriends";
import PrivateMessages from "./pages/PrivateMessages";
import NFTGallery from "./pages/NFTGallery";

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
        <Route path="/dashboard" element={<Profile />} />
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
        <Route path="/upload-game" element={<UploadGame />} />
        <Route path="/admin/game-review" element={<AdminGameReview />} />
        <Route path="/my-games" element={<MyGames />} />
        <Route path="/edit-game/:id" element={<EditGame />} />
        <Route path="/game-details/:id" element={<GameDetails />} />
        <Route path="/rewards-history" element={<RewardsHistory />} />
        <Route path="/camly-leaderboard" element={<CamlyLeaderboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/find-friends" element={<FindFriends />} />
        <Route path="/messages" element={<PrivateMessages />} />
        <Route path="/nft-gallery" element={<NFTGallery />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
};

// Floating Chat Windows Component
const FloatingChats = () => {
  const { user } = useAuth();
  const { windows, closeChat, toggleMinimize } = useChatWindows();
  
  if (!user || windows.length === 0) return null;
  
  return (
    <FloatingChatWindows
      currentUserId={user.id}
      windows={windows}
      onClose={closeChat}
      onToggleMinimize={toggleMinimize}
    />
  );
};

const AppContent = () => {
  const { user } = useAuth();
  const { needsRoleSelection, loading: roleLoading } = useUserRole();

  return (
    <>
      <Toaster />
      <Sonner />
      <CoinNotification />
      <BackgroundMusicPlayer />
      <PWAInstallPrompt />
      
      {/* Role Selection Modal for new users */}
      {user && !roleLoading && (
        <RoleSelectionModal 
          isOpen={needsRoleSelection} 
          onClose={() => {}} 
        />
      )}
      
      <BrowserRouter>
        <MobileBottomNavEnhanced />
        <AnimatedRoutes />
        
        {/* Floating Chat Windows for Desktop */}
        <FloatingChats />
        
        {/* Charity Counter - Fixed bottom right on desktop */}
        <div className="hidden md:block fixed bottom-4 right-4 z-40">
          <CharityCounter />
        </div>
      </BrowserRouter>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <Web3Provider>
      <TooltipProvider>
        <CallProvider>
          <AppContent />
        </CallProvider>
      </TooltipProvider>
    </Web3Provider>
  </QueryClientProvider>
);

export default App;
