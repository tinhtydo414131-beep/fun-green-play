import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Play, 
  Download, 
  Rocket, 
  Star,
  Sparkles,
  Globe,
  CheckCircle,
  XCircle,
  Loader2,
  ShieldCheck
} from "lucide-react";
import { GameSubmissionModal } from "./GameSubmissionModal";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface LovableGame {
  id: string;
  name: string;
  title: string;
  description: string | null;
  project_url: string;
  image_url: string | null;
  zip_url: string | null;
  approved: boolean;
  created_at: string;
}

const planetColors = [
  "from-violet-500 via-purple-500 to-fuchsia-500",
  "from-cyan-500 via-blue-500 to-indigo-500",
  "from-emerald-500 via-green-500 to-teal-500",
  "from-amber-500 via-orange-500 to-red-500",
  "from-pink-500 via-rose-500 to-red-500",
  "from-blue-500 via-indigo-500 to-violet-500"
];

export const LovableGamesHub = () => {
  const { user } = useAuth();
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [games, setGames] = useState<LovableGame[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [pendingGames, setPendingGames] = useState<LovableGame[]>([]);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  // Check if user is admin
  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) {
        setIsAdmin(false);
        return;
      }
      
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();
      
      setIsAdmin(!!data);
    };
    
    checkAdmin();
  }, [user]);

  // Fetch approved games
  useEffect(() => {
    const fetchGames = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("lovable_games")
        .select("*")
        .eq("approved", true)
        .order("created_at", { ascending: false });
      
      if (!error && data) {
        setGames(data);
      }
      setIsLoading(false);
    };

    fetchGames();

    // Subscribe to realtime updates for approved games
    const channel = supabase
      .channel("lovable-games-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "lovable_games",
          filter: "approved=eq.true"
        },
        () => {
          // Refetch on any change
          fetchGames();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Fetch pending games for admin
  useEffect(() => {
    const fetchPending = async () => {
      if (!isAdmin) {
        setPendingGames([]);
        return;
      }
      
      const { data } = await supabase
        .from("lovable_games")
        .select("*")
        .eq("approved", false)
        .order("created_at", { ascending: false });
      
      if (data) {
        setPendingGames(data);
      }
    };

    fetchPending();

    if (isAdmin) {
      const channel = supabase
        .channel("pending-games-changes")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "lovable_games"
          },
          () => {
            fetchPending();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [isAdmin]);

  const handlePlay = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleDownload = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleApprove = async (gameId: string) => {
    setApprovingId(gameId);
    const { error } = await supabase
      .from("lovable_games")
      .update({ approved: true })
      .eq("id", gameId);
    
    if (error) {
      toast.error("Failed to approve game");
    } else {
      toast.success("Game approved! 🎉");
    }
    setApprovingId(null);
  };

  const handleReject = async (gameId: string) => {
    setApprovingId(gameId);
    const { error } = await supabase
      .from("lovable_games")
      .delete()
      .eq("id", gameId);
    
    if (error) {
      toast.error("Failed to reject game");
    } else {
      toast.success("Game rejected");
    }
    setApprovingId(null);
  };

  const renderGameCard = (game: LovableGame, index: number, showAdminControls: boolean = false) => (
    <motion.div
      key={game.id}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      onMouseEnter={() => setHoveredCard(game.id)}
      onMouseLeave={() => setHoveredCard(null)}
    >
      <Card 
        className={`relative overflow-hidden border-2 transition-all duration-300 bg-card/80 backdrop-blur-sm group
          ${hoveredCard === game.id 
            ? "border-primary shadow-[0_0_30px_rgba(var(--primary),0.3)] scale-105" 
            : "border-primary/30 hover:border-primary/60"
          }
          ${showAdminControls && !game.approved ? "border-yellow-500/50" : ""}`}
      >
        {/* Glowing border effect */}
        <div className={`absolute inset-0 rounded-lg bg-gradient-to-r ${planetColors[index % planetColors.length]} opacity-0 group-hover:opacity-20 transition-opacity duration-300`} />
        
        {/* Thumbnail */}
        <div className={`relative aspect-video bg-gradient-to-br ${planetColors[index % planetColors.length]} flex items-center justify-center overflow-hidden`}>
          {game.image_url ? (
            <img 
              src={game.image_url} 
              alt={game.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <motion.div 
              className="relative"
              animate={hoveredCard === game.id ? { scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] } : {}}
              transition={{ duration: 0.5 }}
            >
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-white/30 to-white/10 flex items-center justify-center shadow-2xl">
                <Globe className="w-10 h-10 text-white drop-shadow-lg" />
              </div>
              <motion.div 
                className="absolute inset-0 border-2 border-white/30 rounded-full"
                style={{ transform: "rotateX(70deg)" }}
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              />
            </motion.div>
          )}
          
          {/* Pending badge for admin */}
          {showAdminControls && !game.approved && (
            <div className="absolute top-2 left-2 bg-yellow-500 text-black rounded-full px-2 py-1 flex items-center gap-1">
              <span className="text-xs font-bold">PENDING</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          <h3 className="text-lg font-fredoka font-bold text-foreground truncate">
            {game.title}
          </h3>
          <p className="text-xs font-comic text-muted-foreground">by {game.name}</p>
          <p className="text-sm font-comic text-muted-foreground line-clamp-2 min-h-[2.5rem]">
            {game.description || "A fun Lovable game!"}
          </p>
          
          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              onClick={() => handlePlay(game.project_url)}
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-fredoka font-bold shadow-lg hover:shadow-xl transition-all"
              size="sm"
            >
              <Play className="w-4 h-4 mr-1 fill-current" />
              Play
            </Button>
            
            {game.zip_url ? (
              <Button
                onClick={() => handleDownload(game.zip_url!)}
                variant="outline"
                className="flex-1 border-2 border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white font-fredoka font-bold transition-all"
                size="sm"
              >
                <Download className="w-4 h-4 mr-1" />
                ZIP
              </Button>
            ) : (
              <Button
                variant="outline"
                className="flex-1 border-2 border-muted-foreground/30 text-muted-foreground font-fredoka cursor-not-allowed"
                size="sm"
                disabled
              >
                <Download className="w-4 h-4 mr-1" />
                N/A
              </Button>
            )}
          </div>

          {/* Admin controls */}
          {showAdminControls && !game.approved && (
            <div className="flex gap-2 pt-2 border-t border-primary/20">
              <Button
                onClick={() => handleApprove(game.id)}
                disabled={approvingId === game.id}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-fredoka font-bold"
                size="sm"
              >
                {approvingId === game.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Approve
                  </>
                )}
              </Button>
              <Button
                onClick={() => handleReject(game.id)}
                disabled={approvingId === game.id}
                variant="destructive"
                className="flex-1 font-fredoka font-bold"
                size="sm"
              >
                <XCircle className="w-4 h-4 mr-1" />
                Reject
              </Button>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );

  return (
    <section className="relative py-20 px-4 overflow-hidden">
      {/* Cosmic background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background">
        {/* Floating stars */}
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-primary/60 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.3, 1, 0.3],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
        
        {/* Floating planets */}
        <motion.div
          className="absolute top-20 left-10 w-24 h-24 rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 blur-xl"
          animate={{ y: [0, 20, 0], rotate: [0, 180, 360] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-32 h-32 rounded-full bg-gradient-to-br from-accent/30 to-primary/30 blur-xl"
          animate={{ y: [0, -30, 0], rotate: [360, 180, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute top-1/2 right-10 w-16 h-16 rounded-full bg-gradient-to-br from-secondary/40 to-accent/40 blur-lg"
          animate={{ x: [0, 20, 0], y: [0, -10, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        />
      </div>

      <div className="container mx-auto max-w-7xl relative z-10">
        {/* Header */}
        <motion.div 
          className="text-center mb-16 space-y-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <Globe className="w-10 h-10 text-primary" />
            </motion.div>
            <Sparkles className="w-8 h-8 text-secondary animate-pulse" />
          </div>
          
          <h2 className="text-4xl md:text-5xl font-fredoka font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Lovable Games Hub 🚀
          </h2>
          <p className="text-xl md:text-2xl font-comic text-foreground/80 font-bold">
            Play & Download Instantly!
          </p>
          <p className="text-lg font-comic text-muted-foreground max-w-2xl mx-auto">
            Discover amazing games built with Lovable. Play online or download the full project!
          </p>
        </motion.div>

        {/* Admin Pending Section */}
        {isAdmin && pendingGames.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <ShieldCheck className="w-6 h-6 text-yellow-500" />
              <h3 className="text-2xl font-fredoka font-bold text-yellow-500">
                Pending Approval ({pendingGames.length})
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {pendingGames.map((game, index) => renderGameCard(game, index, true))}
            </div>
          </div>
        )}

        {/* Games Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
          </div>
        ) : games.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
            {games.map((game, index) => renderGameCard(game, index))}
          </div>
        ) : (
          <div className="text-center py-16 mb-12">
            <Globe className="w-20 h-20 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-xl font-fredoka text-muted-foreground">
              No games yet! Be the first to submit one! 🚀
            </p>
          </div>
        )}

        {/* Submit Button */}
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Button
            onClick={() => setIsSubmitModalOpen(true)}
            size="lg"
            className="font-fredoka font-bold text-xl px-10 py-8 bg-gradient-to-r from-primary via-purple-500 to-secondary hover:shadow-[0_0_40px_rgba(var(--primary),0.4)] transform hover:scale-105 transition-all group"
          >
            <Rocket className="w-6 h-6 mr-2 group-hover:animate-bounce" />
            Submit Your Lovable Game
            <Sparkles className="w-5 h-5 ml-2 animate-pulse" />
          </Button>
          <p className="mt-4 text-sm font-comic text-muted-foreground">
            Built something cool? Share it with the community! 🌟
          </p>
        </motion.div>
      </div>

      {/* Submission Modal */}
      <GameSubmissionModal 
        isOpen={isSubmitModalOpen} 
        onClose={() => setIsSubmitModalOpen(false)} 
      />
    </section>
  );
};
