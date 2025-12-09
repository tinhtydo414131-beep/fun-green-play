import { useState, useEffect } from 'react';
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useAccount } from "wagmi";
import { motion } from "framer-motion";
import { Award, Trophy, Gamepad2, Users, Star, Crown, ExternalLink, Sparkles, Globe, Wallet, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OpenSeaBridge } from "@/components/OpenSeaBridge";
import { Link } from "react-router-dom";

interface MintedNFT {
  id: string;
  user_id: string;
  achievement_type: string;
  token_id: string;
  tx_hash: string;
  wallet_address: string;
  minted_at: string;
  profile?: {
    username: string;
    avatar_url: string | null;
  };
}

const ACHIEVEMENT_INFO: Record<string, { name: string; description: string; icon: any; rarity: string }> = {
  first_game: { name: "First Steps", description: "Play your first game", icon: Gamepad2, rarity: "Common" },
  play_10_games: { name: "Getting Started", description: "Play 10 games", icon: Award, rarity: "Common" },
  play_50_games: { name: "Dedicated Player", description: "Play 50 games", icon: Trophy, rarity: "Rare" },
  play_100_games: { name: "Game Master", description: "Play 100 games", icon: Crown, rarity: "Epic" },
  first_friend: { name: "Social Butterfly", description: "Make your first friend", icon: Users, rarity: "Common" },
  friends_10: { name: "Popular Player", description: "Make 10 friends", icon: Users, rarity: "Rare" },
  friends_50: { name: "Community Star", description: "Make 50 friends", icon: Star, rarity: "Epic" },
  combo_master: { name: "Combo Master", description: "Achieve 50+ combo", icon: Sparkles, rarity: "Legendary" },
  games_master: { name: "Games Master", description: "Master all games", icon: Trophy, rarity: "Legendary" },
  social_butterfly: { name: "Social Butterfly", description: "Make many friends", icon: Users, rarity: "Rare" },
  game_creator: { name: "Game Creator", description: "Upload a game", icon: Gamepad2, rarity: "Epic" },
  wealthy_player: { name: "Wealthy Player", description: "Earn 1M CAMLY", icon: Crown, rarity: "Epic" },
  top_10_player: { name: "Top 10 Player", description: "Reach top 10 leaderboard", icon: Trophy, rarity: "Legendary" },
  music_lover: { name: "Music Lover", description: "Listen to 100 songs", icon: Star, rarity: "Rare" },
};

const RARITY_COLORS: Record<string, string> = {
  Common: "from-gray-400 to-gray-600",
  Rare: "from-blue-400 to-blue-600",
  Epic: "from-purple-400 to-purple-600",
  Legendary: "from-yellow-400 via-orange-500 to-red-500",
};

const RARITY_BORDER: Record<string, string> = {
  Common: "border-gray-400/50",
  Rare: "border-blue-400/50",
  Epic: "border-purple-400/50",
  Legendary: "border-yellow-400/50",
};

export default function NFTGallery() {
  const { user } = useAuth();
  const { address, isConnected } = useAccount();
  const [nfts, setNfts] = useState<MintedNFT[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<string>("gallery");

  useEffect(() => {
    fetchNFTs();
  }, []);

  const fetchNFTs = async () => {
    try {
      const { data: mintedNfts, error } = await supabase
        .from('minted_achievement_nfts')
        .select('*')
        .order('minted_at', { ascending: false });

      if (error) throw error;

      // Fetch profiles for each NFT
      const userIds = [...new Set(mintedNfts?.map(n => n.user_id) || [])];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .in('id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.id, p]));

      const nftsWithProfiles = mintedNfts?.map(nft => ({
        ...nft,
        profile: profileMap.get(nft.user_id)
      })) || [];

      setNfts(nftsWithProfiles);
    } catch (error) {
      console.error('Error fetching NFTs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredNfts = filter === "all" 
    ? nfts 
    : nfts.filter(nft => ACHIEVEMENT_INFO[nft.achievement_type]?.rarity === filter);

  const rarities = ["all", "Common", "Rare", "Epic", "Legendary"];

  const shortenAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const shortenTxHash = (hash: string) => {
    return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 pt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold font-fredoka bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent mb-2">
            NFT Gallery
          </h1>
          <p className="text-muted-foreground">
            Discover achievement NFTs & Bridge to OpenSea
          </p>
        </motion.div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
            <TabsTrigger value="gallery" className="gap-2">
              <Sparkles className="w-4 h-4" />
              Community Gallery
            </TabsTrigger>
            <TabsTrigger value="bridge" className="gap-2">
              <Globe className="w-4 h-4" />
              OpenSea Bridge
            </TabsTrigger>
          </TabsList>

          {/* Gallery Tab */}
          <TabsContent value="gallery" className="mt-6">
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
                <CardContent className="p-4 text-center">
                  <p className="text-3xl font-bold text-primary">{nfts.length}</p>
                  <p className="text-sm text-muted-foreground">Total NFTs</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5">
                <CardContent className="p-4 text-center">
                  <p className="text-3xl font-bold text-blue-500">
                    {new Set(nfts.map(n => n.user_id)).size}
                  </p>
                  <p className="text-sm text-muted-foreground">Collectors</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5">
                <CardContent className="p-4 text-center">
                  <p className="text-3xl font-bold text-purple-500">
                    {nfts.filter(n => ACHIEVEMENT_INFO[n.achievement_type]?.rarity === "Epic").length}
                  </p>
                  <p className="text-sm text-muted-foreground">Epic NFTs</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/5">
                <CardContent className="p-4 text-center">
                  <p className="text-3xl font-bold text-yellow-500">
                    {nfts.filter(n => ACHIEVEMENT_INFO[n.achievement_type]?.rarity === "Legendary").length}
                  </p>
                  <p className="text-sm text-muted-foreground">Legendary NFTs</p>
                </CardContent>
              </Card>
            </div>

            {/* Filter */}
            <div className="flex flex-wrap gap-2 justify-center mb-8">
              {rarities.map((rarity) => (
                <Button
                  key={rarity}
                  variant={filter === rarity ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter(rarity)}
                  className={filter === rarity && rarity !== "all" ? `bg-gradient-to-r ${RARITY_COLORS[rarity]} text-white` : ""}
                >
                  {rarity === "all" ? "All" : rarity}
                  {rarity !== "all" && (
                    <span className="ml-1 text-xs">
                      ({nfts.filter(n => ACHIEVEMENT_INFO[n.achievement_type]?.rarity === rarity).length})
                    </span>
                  )}
                </Button>
              ))}
            </div>

            {/* NFT Grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <Skeleton className="h-40 w-full mb-4" />
                      <Skeleton className="h-4 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredNfts.length === 0 ? (
              <Card className="max-w-md mx-auto">
                <CardContent className="p-8 text-center">
                  <Sparkles className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No NFTs Found</h3>
                  <p className="text-muted-foreground">
                    {filter === "all" 
                      ? "Be the first to mint an achievement NFT!"
                      : `No ${filter} NFTs have been minted yet.`}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredNfts.map((nft, index) => {
                  const info = ACHIEVEMENT_INFO[nft.achievement_type] || {
                    name: nft.achievement_type,
                    description: "Achievement NFT",
                    icon: Award,
                    rarity: "Common"
                  };
                  const Icon = info.icon;

                  return (
                    <motion.div
                      key={nft.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className={`overflow-hidden border-2 ${RARITY_BORDER[info.rarity]} hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}>
                        {/* NFT Image/Icon */}
                        <div className={`h-40 bg-gradient-to-br ${RARITY_COLORS[info.rarity]} flex items-center justify-center relative`}>
                          <Icon className="w-20 h-20 text-white/90" />
                          <Badge className="absolute top-2 right-2 bg-black/50 text-white">
                            #{nft.token_id}
                          </Badge>
                        </div>

                        <CardContent className="p-4">
                          {/* Achievement Name */}
                          <h3 className="font-bold text-lg mb-1">{info.name}</h3>
                          <p className="text-sm text-muted-foreground mb-3">{info.description}</p>

                          {/* Rarity Badge */}
                          <Badge 
                            variant="outline" 
                            className={`mb-3 bg-gradient-to-r ${RARITY_COLORS[info.rarity]} text-white border-none`}
                          >
                            {info.rarity}
                          </Badge>

                          {/* Owner */}
                          <div className="flex items-center gap-2 mb-3 p-2 bg-muted/50 rounded-lg">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={nft.profile?.avatar_url || undefined} />
                              <AvatarFallback>
                                {nft.profile?.username?.charAt(0).toUpperCase() || "?"}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">
                                {nft.profile?.username || "Unknown"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {shortenAddress(nft.wallet_address)}
                              </p>
                            </div>
                          </div>

                          {/* Transaction */}
                          <a
                            href={`https://bscscan.com/tx/${nft.tx_hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs text-primary hover:underline"
                          >
                            <ExternalLink className="w-3 h-3" />
                            {shortenTxHash(nft.tx_hash)}
                          </a>

                          {/* Minted Date */}
                          <p className="text-xs text-muted-foreground mt-2">
                            Minted {new Date(nft.minted_at).toLocaleDateString()}
                          </p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* OpenSea Bridge Tab */}
          <TabsContent value="bridge" className="mt-6">
            <div className="max-w-2xl mx-auto">
              {user ? (
                <OpenSeaBridge walletAddress={address || null} />
              ) : (
                <Card className="text-center p-8">
                  <Wallet className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-bold mb-2">Login Required</h3>
                  <p className="text-muted-foreground mb-4">
                    Please login to bridge your NFTs to OpenSea
                  </p>
                  <Link to="/auth">
                    <Button className="gap-2">
                      <ArrowUpRight className="w-4 h-4" />
                      Login Now
                    </Button>
                  </Link>
                </Card>
              )}

              {/* OpenSea Info */}
              <Card className="mt-6 border-blue-500/30 bg-gradient-to-br from-blue-500/5 to-purple-500/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Globe className="w-5 h-5 text-blue-500" />
                    What is OpenSea Bridge?
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <p>
                    <strong className="text-foreground">Export to BSC Mainnet:</strong> Move your achievement NFTs from our platform to the BSC blockchain.
                  </p>
                  <p>
                    <strong className="text-foreground">View on OpenSea:</strong> Once bridged, your NFTs appear in your OpenSea profile and can be traded.
                  </p>
                  <p>
                    <strong className="text-foreground">True Ownership:</strong> Your achievements become permanent, verifiable assets on the blockchain.
                  </p>
                  <div className="pt-3 border-t border-border/50">
                    <a
                      href="https://opensea.io/collection/fun-planet-achievements"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-blue-500 hover:underline"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View Fun Planet Collection on OpenSea
                    </a>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
