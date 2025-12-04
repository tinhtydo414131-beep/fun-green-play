import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, Medal, Award, TrendingUp, Calendar, Send, Copy, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { TransferModal } from "@/components/TransferModal";

interface LeaderboardEntry {
  id: string;
  score: number;
  highest_tile: number;
  level_reached: number;
  created_at: string;
  user_id: string;
  profiles: {
    username: string;
    avatar_url: string | null;
    wallet_address: string | null;
  };
}

export default function NexusLeaderboard() {
  const navigate = useNavigate();
  const [weeklyLeaderboard, setWeeklyLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [alltimeLeaderboard, setAlltimeLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState<{ address: string; username: string } | null>(null);

  const shortenAddress = (address: string | null) => {
    if (!address) return null;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const copyToClipboard = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopiedAddress(address);
    toast.success("Address copied to clipboard!");
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  useEffect(() => {
    loadLeaderboards();
  }, []);

  const loadLeaderboards = async () => {
    setLoading(true);

    // Get start of current week
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const weekStart = startOfWeek.toISOString().split('T')[0];

    // Weekly leaderboard
    const { data: weeklyData } = await supabase
      .from('nexus_leaderboard')
      .select(`
        id,
        score,
        highest_tile,
        level_reached,
        created_at,
        user_id,
        profiles:user_id (
          username,
          avatar_url,
          wallet_address
        )
      `)
      .eq('week_start', weekStart)
      .order('score', { ascending: false })
      .limit(50);

    // All-time leaderboard
    const { data: alltimeData } = await supabase
      .from('nexus_leaderboard')
      .select(`
        id,
        score,
        highest_tile,
        level_reached,
        created_at,
        user_id,
        profiles:user_id (
          username,
          avatar_url,
          wallet_address
        )
      `)
      .order('score', { ascending: false })
      .limit(50);

    if (weeklyData) setWeeklyLeaderboard(weeklyData as any);
    if (alltimeData) setAlltimeLeaderboard(alltimeData as any);
    setLoading(false);
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />;
    if (rank === 3) return <Award className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />;
    return <span className="text-sm sm:text-lg font-bold text-muted-foreground">#{rank}</span>;
  };

  const LeaderboardTable = ({ data }: { data: LeaderboardEntry[] }) => (
    <div className="space-y-2">
      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Loading...</div>
      ) : data.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">No entries yet. Be the first!</div>
      ) : (
        data.map((entry, index) => (
          <Card 
            key={entry.id} 
            className={`p-2.5 sm:p-4 transition-all hover:scale-[1.01] ${
              index < 3 
                ? 'bg-gradient-to-r from-primary/10 to-accent/10 border-primary/30' 
                : 'bg-background/50 border-border/50'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              {/* Top row on mobile: rank, username, score */}
              <div className="flex items-center gap-2 sm:gap-4 w-full">
                <div className="shrink-0 w-8 sm:w-12 text-center">
                  {getRankIcon(index + 1)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm sm:text-lg truncate">
                    {entry.profiles?.username || 'Anonymous'}
                  </div>
                  <div className="flex gap-1.5 sm:gap-2 mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-muted-foreground flex-wrap items-center">
                    <Badge variant="secondary" className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0 sm:py-0.5">
                      <TrendingUp className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
                      Lv {entry.level_reached}
                    </Badge>
                    <Badge variant="outline" className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0 sm:py-0.5">
                      Best: {entry.highest_tile}
                    </Badge>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                    {entry.score.toLocaleString()}
                  </div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground">points</div>
                </div>
              </div>

              {/* Bottom row on mobile: wallet & transfer */}
              {entry.profiles?.wallet_address && (
                <div className="flex items-center justify-between gap-2 pl-10 sm:pl-0 sm:ml-auto">
                  <TooltipProvider>
                    <div className="flex items-center gap-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="font-mono text-[10px] sm:text-xs cursor-help text-muted-foreground">
                            {shortenAddress(entry.profiles.wallet_address)}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="font-mono text-xs">{entry.profiles.wallet_address}</p>
                        </TooltipContent>
                      </Tooltip>
                      <Button
                        size="sm"
                        variant="ghost"
                        className={`h-5 w-5 p-0 transition-colors duration-200 ${
                          copiedAddress === entry.profiles.wallet_address
                            ? 'text-green-500'
                            : ''
                        }`}
                        onClick={() => copyToClipboard(entry.profiles.wallet_address!)}
                      >
                        {copiedAddress === entry.profiles.wallet_address ? (
                          <Check className="w-3 h-3" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </Button>
                    </div>
                  </TooltipProvider>
                  <Button
                    size="sm"
                    onClick={() => {
                      setSelectedRecipient({
                        address: entry.profiles.wallet_address!,
                        username: entry.profiles.username
                      });
                      setTransferModalOpen(true);
                    }}
                    className="h-7 sm:h-8 text-xs sm:text-sm shrink-0"
                  >
                    <Send className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    Transfer
                  </Button>
                </div>
              )}
            </div>
          </Card>
        ))
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      <div className="container mx-auto px-3 sm:px-4 pt-20 sm:pt-24 pb-24 sm:pb-8 max-w-4xl">
        <div className="text-center mb-6 sm:mb-8 space-y-2 sm:space-y-4 animate-fade-in">
          <h1 className="text-2xl sm:text-4xl md:text-6xl font-fredoka font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            2048 NEXUS
          </h1>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-fredoka font-bold text-foreground">
            Leaderboard
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground px-4">
            Compete with players worldwide for the top spot!
          </p>
        </div>

        <Tabs defaultValue="weekly" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4 sm:mb-6 h-9 sm:h-10">
            <TabsTrigger value="weekly" className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
              <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              This Week
            </TabsTrigger>
            <TabsTrigger value="alltime" className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
              <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              All Time
            </TabsTrigger>
          </TabsList>

          <TabsContent value="weekly">
            <LeaderboardTable data={weeklyLeaderboard} />
          </TabsContent>

          <TabsContent value="alltime">
            <LeaderboardTable data={alltimeLeaderboard} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Transfer Modal */}
      {selectedRecipient && (
        <TransferModal
          open={transferModalOpen}
          onOpenChange={setTransferModalOpen}
          recipientAddress={selectedRecipient.address}
          recipientUsername={selectedRecipient.username}
        />
      )}
    </div>
  );
}
