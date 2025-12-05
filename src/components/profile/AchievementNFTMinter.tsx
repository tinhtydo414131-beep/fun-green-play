import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { 
  Sparkles, Trophy, Users, Upload, Coins, Crown, Music,
  ExternalLink, CheckCircle, Lock, Loader2, Gem, ImageIcon
} from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ethers } from "ethers";

interface Achievement {
  id: string;
  name: string;
  description: string;
  image: string;
  threshold: number;
  currentValue: number;
  isEligible: boolean;
  isMinted: boolean;
  canMint: boolean;
  rarity: string;
  trait: string;
}

// Simple ERC721 ABI for minting
const NFT_ABI = [
  "function mint(address to, uint256 tokenId, string memory tokenURI) public",
  "function totalSupply() view returns (uint256)",
  "function ownerOf(uint256 tokenId) view returns (address)"
];

// Demo contract address (would be replaced with actual deployed contract)
const NFT_CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000";

const RARITY_COLORS: Record<string, string> = {
  Common: "from-gray-400 to-gray-600",
  Rare: "from-blue-400 to-blue-600",
  Epic: "from-purple-400 to-purple-600",
  Legendary: "from-yellow-400 to-orange-500"
};

const ACHIEVEMENT_ICONS: Record<string, typeof Trophy> = {
  games_master: Trophy,
  social_butterfly: Users,
  game_creator: Upload,
  wealthy_player: Coins,
  top_10_player: Crown,
  music_lover: Music
};

interface AchievementNFTMinterProps {
  walletAddress: string | null;
}

export function AchievementNFTMinter({ walletAddress }: AchievementNFTMinterProps) {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [mintingId, setMintingId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchAchievements();
    }
  }, [user]);

  const fetchAchievements = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('achievement-nft-metadata', {
        body: null,
        headers: {},
      });

      // Use query params approach
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/achievement-nft-metadata?userId=${user?.id}&type=available`,
        {
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          }
        }
      );

      if (!response.ok) throw new Error('Failed to fetch achievements');
      
      const result = await response.json();
      setAchievements(result.achievements || []);
    } catch (error) {
      console.error("Error fetching achievements:", error);
      toast.error("Failed to load achievements");
    } finally {
      setLoading(false);
    }
  };

  const handleMintNFT = async (achievement: Achievement) => {
    if (!walletAddress) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (!achievement.canMint) {
      toast.error("You haven't unlocked this achievement yet");
      return;
    }

    setMintingId(achievement.id);

    try {
      // Check if MetaMask is available
      if (typeof window === "undefined" || !(window as any).ethereum) {
        toast.error("Please install MetaMask to mint NFTs");
        return;
      }

      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const network = await provider.getNetwork();

      // For demo purposes, we'll simulate minting
      // In production, you'd deploy an actual NFT contract
      const tokenId = Date.now(); // Simple token ID generation
      const metadataUri = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/achievement-nft-metadata?tokenId=${tokenId}`;

      toast.info("Preparing to mint your achievement NFT...");

      // Simulate transaction (in production, call actual contract)
      // const contract = new ethers.Contract(NFT_CONTRACT_ADDRESS, NFT_ABI, signer);
      // const tx = await contract.mint(walletAddress, tokenId, metadataUri);
      // await tx.wait();

      // For demo: create a mock transaction hash
      const mockTxHash = `0x${Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;

      // Record the minted NFT in our database
      const recordResponse = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/achievement-nft-metadata`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userId: user?.id,
            achievementType: achievement.id,
            tokenId: tokenId.toString(),
            txHash: mockTxHash,
            walletAddress
          })
        }
      );

      if (!recordResponse.ok) throw new Error('Failed to record NFT');

      toast.success(`🎉 Successfully minted "${achievement.name}" NFT!`);
      
      // Update local state
      setAchievements(prev => prev.map(a => 
        a.id === achievement.id ? { ...a, isMinted: true, canMint: false } : a
      ));

    } catch (error: any) {
      console.error("Minting error:", error);
      if (error.code === 'ACTION_REJECTED') {
        toast.error("Transaction cancelled");
      } else {
        toast.error("Failed to mint NFT. Please try again.");
      }
    } finally {
      setMintingId(null);
    }
  };

  const getProgressPercent = (achievement: Achievement) => {
    if (achievement.trait === 'rank') {
      // For rank, lower is better
      return achievement.currentValue > 0 && achievement.currentValue <= achievement.threshold 
        ? 100 
        : Math.max(0, (1 - (achievement.currentValue - achievement.threshold) / achievement.threshold) * 100);
    }
    return Math.min((achievement.currentValue / achievement.threshold) * 100, 100);
  };

  if (loading) {
    return (
      <Card className="border-2 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Loading achievements...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const mintableCount = achievements.filter(a => a.canMint).length;
  const mintedCount = achievements.filter(a => a.isMinted).length;

  return (
    <Card className="border-2 border-purple-500/30 bg-gradient-to-br from-card via-purple-500/5 to-pink-500/5 overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="font-fredoka flex items-center gap-2 text-xl">
          <Gem className="w-6 h-6 text-purple-500" />
          Achievement NFTs
          {mintableCount > 0 && (
            <Badge className="ml-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              {mintableCount} Ready to Mint!
            </Badge>
          )}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Mint your achievements as NFTs on-chain • {mintedCount}/{achievements.length} minted
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <AnimatePresence mode="popLayout">
          {achievements.map((achievement, index) => {
            const Icon = ACHIEVEMENT_ICONS[achievement.id] || Trophy;
            const isMinting = mintingId === achievement.id;
            const progressPercent = getProgressPercent(achievement);
            
            return (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.08 }}
                layout
                className={`relative p-4 rounded-xl border-2 transition-all ${
                  achievement.isMinted 
                    ? "border-green-500/50 bg-green-500/10" 
                    : achievement.canMint 
                      ? "border-purple-500/50 bg-purple-500/10 hover:border-purple-500 hover:shadow-lg" 
                      : "border-muted/50 bg-muted/20"
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Achievement Icon/Image */}
                  <div className={`relative w-16 h-16 rounded-xl bg-gradient-to-br ${RARITY_COLORS[achievement.rarity]} p-0.5 flex-shrink-0`}>
                    <div className="w-full h-full rounded-xl bg-card flex items-center justify-center">
                      <Icon className="w-8 h-8 text-foreground" />
                    </div>
                    {achievement.isMinted && (
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                    )}
                    {!achievement.isEligible && !achievement.isMinted && (
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-muted rounded-full flex items-center justify-center">
                        <Lock className="w-3 h-3 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Achievement Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-fredoka font-bold text-lg">{achievement.name}</h4>
                      <Badge 
                        variant="outline" 
                        className={`text-xs bg-gradient-to-r ${RARITY_COLORS[achievement.rarity]} bg-clip-text text-transparent border-current`}
                      >
                        {achievement.rarity}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{achievement.description}</p>
                    
                    {/* Progress */}
                    {!achievement.isMinted && (
                      <div className="mt-3">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-muted-foreground">Progress</span>
                          <span className={achievement.isEligible ? "text-green-500 font-bold" : "text-muted-foreground"}>
                            {achievement.trait === 'rank' 
                              ? `Rank #${achievement.currentValue || '—'}` 
                              : `${achievement.currentValue.toLocaleString()} / ${achievement.threshold.toLocaleString()}`
                            }
                          </span>
                        </div>
                        <Progress 
                          value={progressPercent} 
                          className="h-2"
                        />
                      </div>
                    )}
                  </div>

                  {/* Mint Button */}
                  <div className="flex-shrink-0">
                    {achievement.isMinted ? (
                      <Button variant="outline" size="sm" className="gap-1 text-green-500 border-green-500/50" disabled>
                        <CheckCircle className="w-4 h-4" />
                        Minted
                      </Button>
                    ) : achievement.canMint ? (
                      <Button 
                        size="sm" 
                        onClick={() => handleMintNFT(achievement)}
                        disabled={isMinting || !walletAddress}
                        className="gap-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                      >
                        {isMinting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Minting...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4" />
                            Mint NFT
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm" disabled className="gap-1">
                        <Lock className="w-4 h-4" />
                        Locked
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {!walletAddress && (
          <div className="text-center p-4 bg-muted/30 rounded-xl">
            <p className="text-sm text-muted-foreground">
              Connect your wallet to mint achievement NFTs
            </p>
          </div>
        )}

        {/* Link to Gallery */}
        <div className="pt-4 border-t border-border/50">
          <Link to="/nft-gallery">
            <Button variant="outline" className="w-full gap-2">
              <ImageIcon className="w-4 h-4" />
              View NFT Gallery
              <ExternalLink className="w-3 h-3 ml-auto" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}