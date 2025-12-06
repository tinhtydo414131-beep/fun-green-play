import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { 
  Wallet, Trophy, Gamepad2, Users, MapPin, 
  Copy, Check, ArrowUpRight, ArrowDownLeft,
  History
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import camlyCoinPro from '@/assets/camly-coin-pro.png';

interface ProfileSidebarProps {
  profile: {
    id: string;
    username: string;
    avatar_url: string | null;
    bio?: string | null;
    total_plays: number;
    total_friends: number;
  };
  friends: Array<{
    id: string;
    username: string;
    avatar_url: string | null;
  }>;
  transactions: Array<{
    id: string;
    amount: number;
    description: string | null;
    transaction_type: string;
  }>;
  camlyBalance: number;
  userRank: number;
  walletAddress: string | null;
  isConnected: boolean;
  onConnectWallet: () => void;
}

export function ProfileSidebar({
  profile,
  friends,
  transactions,
  camlyBalance,
  userRank,
  walletAddress,
  isConnected,
  onConnectWallet,
}: ProfileSidebarProps) {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const handleCopyAddress = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      toast.success('Address copied!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shortenAddress = (address: string | null) => {
    if (!address) return 'Not connected';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="space-y-4">
      {/* Intro Card */}
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-bold">Intro</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {profile.bio && (
            <p className="text-sm text-center text-muted-foreground">{profile.bio}</p>
          )}
          
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4 text-muted-foreground" />
              <span className="font-bold text-primary">{camlyBalance.toLocaleString()} CAMLY</span>
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-muted-foreground" />
              <span>Rank #{userRank} on Leaderboard</span>
            </div>
            <div className="flex items-center gap-2">
              <Gamepad2 className="w-4 h-4 text-muted-foreground" />
              <span>{profile.total_plays} games played</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span>{profile.total_friends} friends</span>
            </div>
            {isConnected && walletAddress && (
              <button 
                onClick={handleCopyAddress}
                className="flex items-center gap-2 w-full text-left hover:bg-muted p-2 rounded-lg transition"
              >
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span className="font-mono text-xs truncate">{shortenAddress(walletAddress)}</span>
                {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
              </button>
            )}
          </div>

          <Button variant="outline" className="w-full" onClick={() => navigate('/profile')}>
            Edit Details
          </Button>
        </CardContent>
      </Card>

      {/* Friends Mini Grid */}
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold">Friends</CardTitle>
            <Button variant="link" size="sm" onClick={() => navigate('/friends')}>
              See All
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">{profile.total_friends} friends</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2">
            {friends.slice(0, 9).map((friend) => (
              <button
                key={friend.id}
                onClick={() => navigate(`/profile/${friend.id}`)}
                className="text-center hover:bg-muted p-2 rounded-lg transition"
              >
                <Avatar className="w-full aspect-square mb-1 rounded-lg">
                  <AvatarImage src={friend.avatar_url || ''} />
                  <AvatarFallback className="rounded-lg bg-gradient-to-br from-primary to-secondary text-white text-lg">
                    {friend.username?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <p className="text-xs font-medium truncate">{friend.username}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Wallet Card */}
      <Card className="shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-primary via-secondary to-accent p-6 text-white">
          <div className="flex items-center gap-3 mb-4">
            <img src={camlyCoinPro} alt="CAMLY" className="w-12 h-12" />
            <div>
              <p className="text-white/80 text-sm">Your Balance</p>
              <p className="text-3xl font-bold">{camlyBalance.toLocaleString()}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => navigate('/wallet')}
              className="flex-1 bg-white/20 hover:bg-white/30 text-white border-0"
            >
              <ArrowUpRight className="w-4 h-4 mr-2" />
              Send
            </Button>
            <Button 
              onClick={() => navigate('/wallet')}
              className="flex-1 bg-white/20 hover:bg-white/30 text-white border-0"
            >
              <ArrowDownLeft className="w-4 h-4 mr-2" />
              Receive
            </Button>
          </div>
        </div>
        {!isConnected && (
          <CardContent className="p-4">
            <Button
              onClick={onConnectWallet}
              variant="outline"
              className="w-full border-yellow-500/50 hover:bg-yellow-500/10"
            >
              <Wallet className="w-4 h-4 mr-2" />
              Connect Wallet (+50,000 CAMLY)
            </Button>
          </CardContent>
        )}
      </Card>

      {/* Recent Transactions */}
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <History className="w-4 h-4" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {transactions.slice(0, 4).map((tx, index) => (
            <motion.div 
              key={tx.id} 
              className="flex items-center gap-2 text-sm"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                tx.amount > 0 ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
              }`}>
                {tx.amount > 0 ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
              </div>
              <span className="flex-1 truncate">{tx.description || tx.transaction_type}</span>
              <span className={tx.amount > 0 ? 'text-green-500' : 'text-red-500'}>
                {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()}
              </span>
            </motion.div>
          ))}
          <Button variant="ghost" size="sm" className="w-full" onClick={() => navigate('/rewards-history')}>
            View All
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
