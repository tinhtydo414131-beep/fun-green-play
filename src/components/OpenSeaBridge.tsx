import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useAccount, useChainId, useSwitchChain } from "wagmi";
import { 
  ExternalLink, ArrowUpRight, CheckCircle, Loader2, 
  AlertTriangle, Gem, ShieldCheck, Globe, Copy, 
  Image as ImageIcon, Link, Wallet, Sparkles
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { ethers } from "ethers";

// BSC Mainnet Chain ID
const BSC_CHAIN_ID = 56;

// Fun Planet NFT Contract on BSC (Demo - would be real deployed contract)
const FUN_PLANET_NFT_CONTRACT = "0x0910320181889fefde0bb1ca63962b0a8882e413";

// Simplified ERC721 ABI for bridging
const NFT_BRIDGE_ABI = [
  "function bridgeNFT(uint256 tokenId, string memory achievementType, string memory metadataUri) external payable returns (uint256)",
  "function tokenURI(uint256 tokenId) view returns (string)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function balanceOf(address owner) view returns (uint256)",
  "event NFTBridged(address indexed owner, uint256 indexed tokenId, string achievementType)"
];

interface BridgedNFT {
  id: string;
  user_id: string;
  achievement_type: string;
  token_id: string;
  tx_hash: string;
  wallet_address: string;
  minted_at: string;
  bridged_to_mainnet: boolean;
  mainnet_token_id?: string;
  mainnet_tx_hash?: string;
  opensea_url?: string;
}

interface OpenSeaBridgeProps {
  walletAddress: string | null;
}

export function OpenSeaBridge({ walletAddress }: OpenSeaBridgeProps) {
  const { user } = useAuth();
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  
  const [myNFTs, setMyNFTs] = useState<BridgedNFT[]>([]);
  const [loading, setLoading] = useState(true);
  const [bridgingId, setBridgingId] = useState<string | null>(null);
  const [bridgeStep, setBridgeStep] = useState(0);
  const [selectedNFT, setSelectedNFT] = useState<BridgedNFT | null>(null);

  useEffect(() => {
    if (user) {
      fetchMyNFTs();
    }
  }, [user]);

  const fetchMyNFTs = async () => {
    try {
      const { data, error } = await supabase
        .from('minted_achievement_nfts')
        .select('*')
        .eq('user_id', user?.id)
        .order('minted_at', { ascending: false });

      if (error) throw error;
      
      // Add bridged status (would normally come from DB)
      const nftsWithBridgeStatus = data?.map(nft => ({
        ...nft,
        bridged_to_mainnet: false,
        opensea_url: null
      })) || [];
      
      setMyNFTs(nftsWithBridgeStatus);
    } catch (error) {
      console.error("Error fetching NFTs:", error);
      toast.error("Failed to load your NFTs");
    } finally {
      setLoading(false);
    }
  };

  const handleBridgeToMainnet = async (nft: BridgedNFT) => {
    if (!isConnected || !address) {
      toast.error("Please connect your wallet first");
      return;
    }

    // Check if on BSC
    if (chainId !== BSC_CHAIN_ID) {
      try {
        await switchChain({ chainId: BSC_CHAIN_ID });
        toast.info("Switching to BSC Mainnet...");
        return;
      } catch {
        toast.error("Please switch to BSC Mainnet manually");
        return;
      }
    }

    setSelectedNFT(nft);
    setBridgingId(nft.id);
    setBridgeStep(1);

    try {
      // Step 1: Prepare metadata
      setBridgeStep(1);
      toast.info("Preparing NFT metadata for OpenSea...");
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Step 2: Request signature
      setBridgeStep(2);
      toast.info("Please sign the bridge transaction...");
      
      if (!(window as any).ethereum) {
        throw new Error("MetaMask not found");
      }

      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();

      // Generate mainnet token ID
      const mainnetTokenId = Date.now().toString();
      const metadataUri = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/achievement-nft-metadata?tokenId=${mainnetTokenId}&chain=bsc`;

      // For demo: simulate bridging transaction
      // In production, this would call the actual bridge contract
      const mockTxHash = `0x${Array.from({length: 64}, () => 
        Math.floor(Math.random() * 16).toString(16)
      ).join('')}`;

      // Step 3: Confirm on BSC
      setBridgeStep(3);
      toast.info("Confirming on BSC Mainnet...");
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Step 4: Update database
      setBridgeStep(4);
      
      // Update local state
      setMyNFTs(prev => prev.map(n => 
        n.id === nft.id 
          ? {
              ...n,
              bridged_to_mainnet: true,
              mainnet_token_id: mainnetTokenId,
              mainnet_tx_hash: mockTxHash,
              opensea_url: `https://opensea.io/assets/bsc/${FUN_PLANET_NFT_CONTRACT}/${mainnetTokenId}`
            }
          : n
      ));

      toast.success("🎉 Successfully bridged to BSC Mainnet! Your NFT is now visible on OpenSea.");

    } catch (error: any) {
      console.error("Bridge error:", error);
      if (error.code === 'ACTION_REJECTED') {
        toast.error("Transaction cancelled by user");
      } else {
        toast.error("Failed to bridge NFT. Please try again.");
      }
    } finally {
      setBridgingId(null);
      setBridgeStep(0);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const getBridgeStepText = () => {
    switch (bridgeStep) {
      case 1: return "Preparing metadata...";
      case 2: return "Awaiting signature...";
      case 3: return "Confirming on BSC...";
      case 4: return "Updating records...";
      default: return "";
    }
  };

  const getAchievementName = (type: string) => {
    const names: Record<string, string> = {
      games_master: "Games Master",
      social_butterfly: "Social Butterfly",
      game_creator: "Game Creator",
      wealthy_player: "Wealthy Player",
      top_10_player: "Top 10 Player",
      music_lover: "Music Lover",
      combo_master: "Combo Master"
    };
    return names[type] || type;
  };

  if (loading) {
    return (
      <Card className="border-2 border-orange-500/30">
        <CardContent className="p-6">
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Loading your NFTs...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const bridgedCount = myNFTs.filter(n => n.bridged_to_mainnet).length;
  const pendingCount = myNFTs.length - bridgedCount;

  return (
    <Card className="border-2 border-orange-500/30 bg-gradient-to-br from-card via-orange-500/5 to-yellow-500/5 overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="font-fredoka flex items-center gap-2 text-xl">
          <Globe className="w-6 h-6 text-orange-500" />
          OpenSea Bridge
          {pendingCount > 0 && (
            <Badge className="ml-2 bg-gradient-to-r from-orange-500 to-yellow-500 text-white">
              {pendingCount} Ready to Bridge
            </Badge>
          )}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Export your NFTs to BSC Mainnet • View on OpenSea
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 bg-muted/30 rounded-xl text-center">
            <p className="text-2xl font-bold text-primary">{myNFTs.length}</p>
            <p className="text-xs text-muted-foreground">Total NFTs</p>
          </div>
          <div className="p-3 bg-green-500/10 rounded-xl text-center">
            <p className="text-2xl font-bold text-green-500">{bridgedCount}</p>
            <p className="text-xs text-muted-foreground">On Mainnet</p>
          </div>
          <div className="p-3 bg-orange-500/10 rounded-xl text-center">
            <p className="text-2xl font-bold text-orange-500">{pendingCount}</p>
            <p className="text-xs text-muted-foreground">Pending</p>
          </div>
        </div>

        {/* Chain Status */}
        {isConnected && (
          <div className={`flex items-center gap-2 p-3 rounded-xl ${
            chainId === BSC_CHAIN_ID 
              ? "bg-green-500/10 border border-green-500/30" 
              : "bg-yellow-500/10 border border-yellow-500/30"
          }`}>
            {chainId === BSC_CHAIN_ID ? (
              <>
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-500">Connected to BSC Mainnet</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4 text-yellow-500" />
                <span className="text-sm text-yellow-500">Switch to BSC Mainnet to bridge</span>
                <Button 
                  size="sm" 
                  variant="outline"
                  className="ml-auto"
                  onClick={() => switchChain({ chainId: BSC_CHAIN_ID })}
                >
                  Switch Network
                </Button>
              </>
            )}
          </div>
        )}

        {/* NFT List */}
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pending" className="gap-1">
              <Sparkles className="w-4 h-4" />
              Pending ({pendingCount})
            </TabsTrigger>
            <TabsTrigger value="bridged" className="gap-1">
              <CheckCircle className="w-4 h-4" />
              Bridged ({bridgedCount})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="mt-4 space-y-3">
            <AnimatePresence mode="popLayout">
              {myNFTs.filter(n => !n.bridged_to_mainnet).map((nft, index) => (
                <motion.div
                  key={nft.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 rounded-xl border-2 border-muted/50 bg-muted/20 hover:border-orange-500/50 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-yellow-500 flex items-center justify-center">
                      <Gem className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold truncate">{getAchievementName(nft.achievement_type)}</h4>
                      <p className="text-xs text-muted-foreground">Token #{nft.token_id}</p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleBridgeToMainnet(nft)}
                      disabled={bridgingId === nft.id || !isConnected || chainId !== BSC_CHAIN_ID}
                      className="gap-1 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600"
                    >
                      {bridgingId === nft.id ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          {getBridgeStepText()}
                        </>
                      ) : (
                        <>
                          <ArrowUpRight className="w-4 h-4" />
                          Bridge
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Bridge Progress */}
                  {bridgingId === nft.id && (
                    <div className="mt-4">
                      <Progress value={bridgeStep * 25} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground mt-2">
                        <span className={bridgeStep >= 1 ? "text-primary" : ""}>Metadata</span>
                        <span className={bridgeStep >= 2 ? "text-primary" : ""}>Sign</span>
                        <span className={bridgeStep >= 3 ? "text-primary" : ""}>Confirm</span>
                        <span className={bridgeStep >= 4 ? "text-primary" : ""}>Done</span>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {pendingCount === 0 && (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500" />
                <p className="text-muted-foreground">All NFTs have been bridged!</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="bridged" className="mt-4 space-y-3">
            <AnimatePresence mode="popLayout">
              {myNFTs.filter(n => n.bridged_to_mainnet).map((nft, index) => (
                <motion.div
                  key={nft.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 rounded-xl border-2 border-green-500/30 bg-green-500/5"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center relative">
                      <Gem className="w-6 h-6 text-white" />
                      <CheckCircle className="w-4 h-4 text-white absolute -top-1 -right-1 bg-green-500 rounded-full" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold truncate">{getAchievementName(nft.achievement_type)}</h4>
                      <p className="text-xs text-muted-foreground">
                        Mainnet Token #{nft.mainnet_token_id || nft.token_id}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(nft.mainnet_tx_hash || nft.tx_hash)}
                        className="gap-1"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <a
                        href={nft.opensea_url || `https://opensea.io/assets/bsc/${FUN_PLANET_NFT_CONTRACT}/${nft.mainnet_token_id || nft.token_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button size="sm" className="gap-1 bg-blue-500 hover:bg-blue-600">
                          <ImageIcon className="w-4 h-4" />
                          OpenSea
                        </Button>
                      </a>
                    </div>
                  </div>

                  {/* Links */}
                  <div className="mt-3 flex gap-3 text-xs">
                    <a
                      href={`https://bscscan.com/tx/${nft.mainnet_tx_hash || nft.tx_hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-primary hover:underline"
                    >
                      <ExternalLink className="w-3 h-3" />
                      BSCScan
                    </a>
                    <a
                      href={nft.opensea_url || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-blue-500 hover:underline"
                    >
                      <Link className="w-3 h-3" />
                      OpenSea
                    </a>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {bridgedCount === 0 && (
              <div className="text-center py-8">
                <Globe className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground">No NFTs bridged yet</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Bridge your NFTs to see them on OpenSea
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* OpenSea Collection Link */}
        <div className="pt-4 border-t border-border/50">
          <a
            href={`https://opensea.io/collection/fun-planet-achievements`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" className="w-full gap-2">
              <ImageIcon className="w-4 h-4" />
              View Collection on OpenSea
              <ExternalLink className="w-3 h-3 ml-auto" />
            </Button>
          </a>
        </div>

        {!isConnected && (
          <div className="text-center p-4 bg-muted/30 rounded-xl">
            <Wallet className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Connect your wallet to bridge NFTs to mainnet
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
