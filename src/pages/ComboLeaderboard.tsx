import { useState, useEffect, useRef } from "react";
import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Trophy, Flame, Medal, Crown, Zap, Users, Send, Copy, Check } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ComboPeriodTimer } from "@/components/ComboPeriodTimer";
import { ComboPrizeNotification } from "@/components/ComboPrizeNotification";
import { LiveComboNotifications } from "@/components/LiveComboNotifications";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import { TransferModal } from "@/components/TransferModal";

interface ComboRecord {
  id: string;
  user_id: string;
  highest_combo: number;
  level_achieved: number;
  total_value: number;
  created_at: string;
  profiles: {
    username: string;
    avatar_url: string | null;
    wallet_address: string | null;
  };
}

const ComboLeaderboard = () => {
  const navigate = useNavigate();
  const [dailyRecords, setDailyRecords] = useState<ComboRecord[]>([]);
  const [weeklyRecords, setWeeklyRecords] = useState<ComboRecord[]>([]);
  const [monthlyRecords, setMonthlyRecords] = useState<ComboRecord[]>([]);
  const [allTimeRecords, setAllTimeRecords] = useState<ComboRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [newEntryId, setNewEntryId] = useState<string | null>(null);
  const [liveViewers, setLiveViewers] = useState(0);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState<{ address: string; username: string } | null>(null);
  const channelRef = useRef<any>(null);
  const presenceChannelRef = useRef<any>(null);

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
    fetchLeaderboards();
    setupRealtimeSubscription();
    setupPresenceTracking();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
      if (presenceChannelRef.current) {
        supabase.removeChannel(presenceChannelRef.current);
      }
    };
  }, []);

  const setupPresenceTracking = () => {
    const presenceChannel = supabase.channel('combo-leaderboard-viewers');
    
    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState();
        const count = Object.keys(state).length;
        setLiveViewers(count);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel.track({
            online_at: new Date().toISOString(),
          });
        }
      });

    presenceChannelRef.current = presenceChannel;
  };

  const setupRealtimeSubscription = () => {
    // Subscribe to database changes
    const channel = supabase
      .channel('combo-leaderboard-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'gold_miner_combos'
        },
        async (payload) => {
          console.log('Realtime update:', payload);
          
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const record = payload.new;
            
            // Fetch profile data for the new record
            const { data: profile } = await supabase
              .from('profiles')
              .select('username, avatar_url, wallet_address')
              .eq('id', record.user_id)
              .single();

            const recordWithProfile = {
              ...record,
              profiles: profile || { username: 'Unknown', avatar_url: null, wallet_address: null }
            };

            // Highlight new entry with animation
            setNewEntryId(record.id);
            setTimeout(() => setNewEntryId(null), 3000);

            // Update leaderboards
            await fetchLeaderboards();

            // Show notification for significant combos
            if (record.highest_combo >= 50 && payload.eventType === 'INSERT') {
              toast.success(
                `🔥 ${profile?.username || 'Someone'} just hit ${record.highest_combo}x combo!`,
                {
                  duration: 5000,
                  icon: <Flame className="w-5 h-5 text-orange-500" />,
                }
              );
            }
          }
        }
      )
      .subscribe();

    channelRef.current = channel;

    // Subscribe to broadcast channel for milestone notifications
    const broadcastChannel = supabase.channel('combo-milestones');
    
    broadcastChannel
      .on('broadcast', { event: 'milestone' }, ({ payload }) => {
        const { username, combo, level } = payload;
        
        let title = '';
        let icon = '🔥';
        
        if (combo >= 100) {
          title = `👑 ${username} achieved LEGENDARY ${combo}x combo!`;
          icon = '👑';
        } else if (combo >= 75) {
          title = `✨ ${username} hit an AMAZING ${combo}x combo!`;
          icon = '✨';
        } else if (combo >= 50) {
          title = `🌟 ${username} reached ${combo}x combo!`;
          icon = '🌟';
        } else if (combo >= 30) {
          title = `⚡ ${username} got ${combo}x combo!`;
          icon = '⚡';
        }

        if (title) {
          toast(title, {
            duration: 4000,
            icon: icon,
            className: 'animate-bounce',
          });
        }
      })
      .subscribe();
  };

  const fetchLeaderboards = async () => {
    try {
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      // Fetch all time periods in parallel
      const [dailyData, weeklyData, monthlyData, allTimeData] = await Promise.all([
        supabase
          .from("gold_miner_combos")
          .select("*")
          .gte("created_at", todayStart)
          .order("highest_combo", { ascending: false })
          .limit(100),
        supabase
          .from("gold_miner_combos")
          .select("*")
          .gte("created_at", weekStart)
          .order("highest_combo", { ascending: false })
          .limit(100),
        supabase
          .from("gold_miner_combos")
          .select("*")
          .gte("created_at", monthStart)
          .order("highest_combo", { ascending: false })
          .limit(100),
        supabase
          .from("gold_miner_combos")
          .select("*")
          .order("highest_combo", { ascending: false })
          .limit(100),
      ]);

      // Process each dataset with profiles
      const processRecords = async (data: any) => {
        if (data?.data && data.data.length > 0) {
          const userIds = data.data.map((record: any) => record.user_id);
          const { data: profiles } = await supabase
            .from("profiles")
            .select("id, username, avatar_url, wallet_address")
            .in("id", userIds);

          const profilesMap = new Map(
            profiles?.map((profile) => [profile.id, profile]) || []
          );

          return data.data.map((record: any) => ({
            ...record,
            profiles: profilesMap.get(record.user_id) || {
              username: "Unknown",
              avatar_url: null,
              wallet_address: null,
            },
          }));
        }
        return [];
      };

      const [daily, weekly, monthly, allTime] = await Promise.all([
        processRecords(dailyData),
        processRecords(weeklyData),
        processRecords(monthlyData),
        processRecords(allTimeData),
      ]);

      setDailyRecords(daily);
      setWeeklyRecords(weekly);
      setMonthlyRecords(monthly);
      setAllTimeRecords(allTime);
    } catch (error) {
      console.error("Error fetching leaderboards:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return "from-yellow-400 to-yellow-600";
    if (rank === 2) return "from-gray-300 to-gray-500";
    if (rank === 3) return "from-orange-400 to-orange-600";
    return "from-blue-400 to-blue-600";
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-orange-500" />;
    return <Flame className="w-5 h-5 text-blue-500" />;
  };

  const getComboColor = (combo: number) => {
    if (combo >= 100) return "text-purple-500";
    if (combo >= 50) return "text-red-500";
    if (combo >= 30) return "text-orange-500";
    if (combo >= 20) return "text-yellow-500";
  return "text-blue-500";
};

const LeaderboardContent = ({ records }: { records: ComboRecord[] }) => {
  const getRankColor = (rank: number) => {
    if (rank === 1) return "from-yellow-400 to-yellow-600";
    if (rank === 2) return "from-gray-300 to-gray-500";
    if (rank === 3) return "from-orange-400 to-orange-600";
    return "from-blue-400 to-blue-600";
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-orange-500" />;
    return <Flame className="w-5 h-5 text-blue-500" />;
  };

  const getComboColor = (combo: number) => {
    if (combo >= 100) return "text-purple-500";
    if (combo >= 50) return "text-red-500";
    if (combo >= 30) return "text-orange-500";
    if (combo >= 20) return "text-yellow-500";
    return "text-blue-500";
  };

  if (records.length === 0) {
    return (
      <Card className="p-12 text-center">
        <div className="text-6xl mb-4">😢</div>
        <p className="text-2xl font-fredoka text-muted-foreground mb-2">
          Chưa có ai lên bảng xếp hạng!
        </p>
        <p className="text-lg font-comic text-muted-foreground">
          Hãy là người đầu tiên đạt combo cao!
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {records.map((record, index) => {
        const rank = index + 1;
        const isNewEntry = record.id === newEntryId;
        return (
          <Card
            key={record.id}
            className={`p-4 transition-all hover:scale-105 hover:shadow-xl animate-slide-up ${
              rank <= 3 ? "border-2" : ""
            } ${isNewEntry ? "animate-pulse-glow border-yellow-500 border-3" : ""}`}
            style={{
              animationDelay: `${index * 0.05}s`,
              borderColor: rank <= 3 ? `hsl(var(--primary))` : undefined,
            }}
          >
            <div className="flex items-center gap-4">
              {/* New Entry Badge */}
              {isNewEntry && (
                <div className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs font-bold px-3 py-1 rounded-full animate-bounce flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  NEW!
                </div>
              )}
              
              {/* Rank */}
              <div
                className={`flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br ${getRankColor(
                  rank
                )} flex items-center justify-center font-bold text-white shadow-lg`}
              >
                {rank <= 3 ? getRankIcon(rank) : rank}
              </div>

              {/* Avatar & Username */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Avatar className="w-12 h-12 border-2 border-primary/30">
                  <AvatarImage src={record.profiles.avatar_url || undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary font-bold">
                    {record.profiles.username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-fredoka font-bold text-lg truncate">
                    {record.profiles.username}
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm text-muted-foreground">
                      Level {record.level_achieved} • {record.total_value.toLocaleString()} 💰
                    </p>
                    {record.profiles.wallet_address && (
                      <TooltipProvider>
                        <div className="flex items-center gap-1">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="text-xs font-mono text-muted-foreground/80 cursor-help">
                                {shortenAddress(record.profiles.wallet_address)}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="font-mono text-xs">{record.profiles.wallet_address}</p>
                            </TooltipContent>
                          </Tooltip>
                          <Button
                            size="sm"
                            variant="ghost"
                            className={`h-5 w-5 p-0 transition-colors duration-200 ${
                              copiedAddress === record.profiles.wallet_address
                                ? 'text-green-500'
                                : ''
                            }`}
                            onClick={() => copyToClipboard(record.profiles.wallet_address!)}
                          >
                            {copiedAddress === record.profiles.wallet_address ? (
                              <Check className="w-3 h-3" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </Button>
                        </div>
                      </TooltipProvider>
                    )}
                  </div>
                </div>
              </div>

              {/* Transfer & Combo Score */}
              <div className="flex items-center gap-3">
                {record.profiles.wallet_address && (
                  <Button
                    size="sm"
                    onClick={() => {
                      setSelectedRecipient({
                        address: record.profiles.wallet_address!,
                        username: record.profiles.username
                      });
                      setTransferModalOpen(true);
                    }}
                    className="h-8 flex-shrink-0"
                  >
                    <Send className="w-4 h-4 mr-1" />
                    Transfer
                  </Button>
                )}
                <div className="flex-shrink-0 text-right">
                  <div
                    className={`text-3xl font-bold ${getComboColor(
                      record.highest_combo
                    )}`}
                  >
                    {record.highest_combo}x
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                    <Flame className="w-3 h-3" />
                    COMBO
                  </div>
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto py-32 px-4 text-center">
          <div className="animate-bounce text-6xl mb-4">🔥</div>
          <p className="text-2xl font-fredoka text-primary">Đang tải bảng xếp hạng... ⏳</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <LiveComboNotifications />
      
      <section className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Back Button */}
          <div className="mb-8">
            <Link to="/game/gold-miner">
              <Button variant="outline" className="font-bold">
                <ArrowLeft className="mr-2 h-5 w-5" />
                Quay lại Game
              </Button>
            </Link>
          </div>

          {/* Header */}
          <div className="text-center mb-8 space-y-4 animate-slide-up">
            <div className="flex items-center justify-center gap-3">
              <Flame className="w-12 h-12 text-orange-500 animate-pulse" />
              <h1 className="text-4xl md:text-5xl font-fredoka font-bold text-primary">
                Combo Leaderboard
              </h1>
              <Flame className="w-12 h-12 text-orange-500 animate-pulse" />
            </div>
            <div className="flex items-center justify-center gap-3">
              <p className="text-lg text-muted-foreground font-comic">
                Top combo cao nhất theo từng thời kỳ! 🔥
              </p>
              {liveViewers > 0 && (
                <Badge variant="secondary" className="animate-pulse">
                  <Users className="w-3 h-3 mr-1" />
                  {liveViewers} đang xem
                </Badge>
              )}
            </div>
            <p className="text-sm text-green-500 font-bold animate-bounce">
              ⚡ LIVE - Cập nhật realtime
            </p>
          </div>

          {/* Period Timer & Prizes */}
          <div className="mb-8">
            <ComboPeriodTimer />
          </div>

          {/* Prize Info */}
          <Card className="mb-8 p-6 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/20">
            <div className="flex items-center gap-3 mb-4">
              <Crown className="w-6 h-6 text-yellow-500" />
              <h3 className="font-fredoka font-bold text-xl">Phần thưởng 🎁</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <span><strong>Daily Winner:</strong> 100 tokens (tối thiểu 10x combo)</span>
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-orange-500" />
                <span><strong>Weekly Winner:</strong> 500 tokens (tối thiểu 10x combo)</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              * Phần thưởng tự động được thêm vào ví khi period kết thúc
            </p>
          </Card>

          {/* Prize Notifications */}
          <ComboPrizeNotification />

          {/* Tabs for time periods */}
          <Tabs defaultValue="all-time" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="daily">Hôm nay</TabsTrigger>
              <TabsTrigger value="weekly">Tuần này</TabsTrigger>
              <TabsTrigger value="monthly">Tháng này</TabsTrigger>
              <TabsTrigger value="all-time">Mọi lúc</TabsTrigger>
            </TabsList>

            <TabsContent value="daily">
              <LeaderboardContent records={dailyRecords} />
            </TabsContent>

            <TabsContent value="weekly">
              <LeaderboardContent records={weeklyRecords} />
            </TabsContent>

            <TabsContent value="monthly">
              <LeaderboardContent records={monthlyRecords} />
            </TabsContent>

            <TabsContent value="all-time">
              <LeaderboardContent records={allTimeRecords} />
            </TabsContent>
          </Tabs>

          {/* Legend */}
          <Card className="mt-8 p-6 bg-secondary/10">
            <h3 className="font-fredoka font-bold text-lg mb-4 text-center">
              🎯 Combo Levels
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-center text-sm">
              <div>
                <div className="text-blue-500 text-xl font-bold">10-19x</div>
                <div className="text-muted-foreground">Khởi đầu</div>
              </div>
              <div>
                <div className="text-yellow-500 text-xl font-bold">20-29x</div>
                <div className="text-muted-foreground">Giỏi</div>
              </div>
              <div>
                <div className="text-orange-500 text-xl font-bold">30-49x</div>
                <div className="text-muted-foreground">Xuất sắc</div>
              </div>
              <div>
                <div className="text-red-500 text-xl font-bold">50-99x</div>
                <div className="text-muted-foreground">Siêu đẳng</div>
              </div>
              <div>
                <div className="text-purple-500 text-xl font-bold">100x+</div>
                <div className="text-muted-foreground">Huyền thoại</div>
              </div>
            </div>
          </Card>
        </div>
      </section>

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
};

export default ComboLeaderboard;
