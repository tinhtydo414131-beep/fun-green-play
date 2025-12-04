import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Coins, 
  Wallet, 
  Gift, 
  Calendar, 
  Gamepad2, 
  ArrowUpRight, 
  ArrowDownLeft,
  Loader2,
  History,
  Users
} from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { motion } from 'framer-motion';

interface RewardTransaction {
  id: string;
  amount: number;
  reward_type: string;
  description: string | null;
  transaction_hash: string | null;
  claimed_to_wallet: boolean;
  created_at: string;
}

const getRewardIcon = (type: string) => {
  switch (type) {
    case 'first_wallet_connect':
      return <Wallet className="w-5 h-5" />;
    case 'first_game_play':
      return <Gamepad2 className="w-5 h-5" />;
    case 'daily_checkin':
      return <Calendar className="w-5 h-5" />;
    case 'points_conversion':
      return <Coins className="w-5 h-5" />;
    case 'claim_to_wallet':
      return <ArrowUpRight className="w-5 h-5" />;
    case 'referral_bonus':
      return <Users className="w-5 h-5" />;
    default:
      return <Gift className="w-5 h-5" />;
  }
};

const getRewardColor = (type: string) => {
  switch (type) {
    case 'first_wallet_connect':
      return 'bg-orange-500/10 text-orange-600 border-orange-500/30';
    case 'first_game_play':
      return 'bg-purple-500/10 text-purple-600 border-purple-500/30';
    case 'daily_checkin':
      return 'bg-blue-500/10 text-blue-600 border-blue-500/30';
    case 'points_conversion':
      return 'bg-green-500/10 text-green-600 border-green-500/30';
    case 'claim_to_wallet':
      return 'bg-red-500/10 text-red-600 border-red-500/30';
    case 'referral_bonus':
      return 'bg-pink-500/10 text-pink-600 border-pink-500/30';
    default:
      return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30';
  }
};

const getRewardLabel = (type: string) => {
  switch (type) {
    case 'first_wallet_connect':
      return 'First Connect';
    case 'first_game_play':
      return 'First Game';
    case 'daily_checkin':
      return 'Daily Check-in';
    case 'points_conversion':
      return 'Points Converted';
    case 'claim_to_wallet':
      return 'Claimed';
    case 'referral_bonus':
      return 'Mời bạn bè';
    default:
      return 'Reward';
  }
};

export default function RewardsHistory() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<RewardTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalEarned, setTotalEarned] = useState(0);
  const [totalClaimed, setTotalClaimed] = useState(0);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchTransactions();
    }
  }, [user]);

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('web3_reward_transactions')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setTransactions(data || []);

      // Calculate totals
      const earned = (data || [])
        .filter(t => t.amount > 0)
        .reduce((sum, t) => sum + t.amount, 0);
      const claimed = (data || [])
        .filter(t => t.amount < 0)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

      setTotalEarned(earned);
      setTotalClaimed(claimed);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-yellow-500 animate-spin mx-auto" />
          <p className="text-xl font-fredoka text-muted-foreground">Loading rewards history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <Navigation />

      <section className="pt-24 pb-20 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button
              onClick={() => navigate('/dashboard')}
              variant="outline"
              size="icon"
              className="shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-fredoka font-bold flex items-center gap-3">
                <History className="w-8 h-8 text-yellow-500" />
                Rewards History
              </h1>
              <p className="text-muted-foreground">Track your CAMLY earnings and claims</p>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                    <ArrowDownLeft className="w-6 h-6 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Earned</p>
                    <p className="text-2xl font-bold text-green-600">
                      +{totalEarned.toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-500/10 to-orange-500/10 border-red-500/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                    <ArrowUpRight className="w-6 h-6 text-red-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Claimed</p>
                    <p className="text-2xl font-bold text-red-600">
                      -{totalClaimed.toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
                    <Coins className="w-6 h-6 text-yellow-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Net Balance</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {(totalEarned - totalClaimed).toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Transactions List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-yellow-500" />
                Transaction History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <div className="text-center py-12">
                  <Coins className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-lg font-medium text-muted-foreground">No transactions yet</p>
                  <p className="text-sm text-muted-foreground">
                    Connect your wallet and start earning CAMLY!
                  </p>
                  <Button
                    onClick={() => navigate('/dashboard')}
                    className="mt-4 bg-gradient-to-r from-yellow-500 to-orange-500"
                  >
                    Go to Dashboard
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.map((tx, index) => (
                    <motion.div
                      key={tx.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                    >
                      {/* Icon */}
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getRewardColor(tx.reward_type)}`}>
                        {getRewardIcon(tx.reward_type)}
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className={getRewardColor(tx.reward_type)}>
                            {getRewardLabel(tx.reward_type)}
                          </Badge>
                          {tx.claimed_to_wallet && (
                            <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">
                              On-chain
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {tx.description || getRewardLabel(tx.reward_type)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(tx.created_at), 'dd MMM yyyy, HH:mm', { locale: vi })}
                        </p>
                      </div>

                      {/* Amount */}
                      <div className="text-right">
                        <p className={`text-xl font-bold ${tx.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {tx.amount >= 0 ? '+' : ''}{tx.amount.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">CAMLY</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
