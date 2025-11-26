import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowUpRight, ArrowDownLeft, Wallet, Sparkles, Copy, CheckCircle, ChevronDown, ExternalLink, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CelebrationNotification } from "@/components/CelebrationNotification";
import { toast } from "sonner";
import { ethers } from "ethers";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

declare global {
  interface Window {
    ethereum?: any;
  }
}

const networks = [
  { id: "1", name: "Ethereum", symbol: "ETH", color: "#627EEA", icon: "⟠", chainId: "0x1" },
  { id: "56", name: "BNB Chain", symbol: "BNB", color: "#F0B90B", icon: "◆", chainId: "0x38" },
  { id: "137", name: "Polygon", symbol: "MATIC", color: "#8247E5", icon: "⬡", chainId: "0x89" },
];

const tokens = [
  { symbol: "BNB", name: "BNB", gradient: "from-yellow-400 to-yellow-600", emoji: "◆" },
  { symbol: "CAMLY", name: "CAMLY COIN", gradient: "from-pink-400 via-yellow-300 to-pink-500", emoji: "🎮", special: true },
  { symbol: "ETH", name: "Ethereum", gradient: "from-blue-400 to-purple-600", emoji: "⟠" },
  { symbol: "BTC", name: "Bitcoin", gradient: "from-orange-400 to-orange-600", emoji: "₿" },
  { symbol: "USDT", name: "Tether", gradient: "from-green-400 to-green-600", emoji: "💵" },
  { symbol: "FUN", name: "FUN TOKEN", gradient: "from-cyan-400 to-purple-600", emoji: "🎯" }
];

export default function FunWallet() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [account, setAccount] = useState<string | null>(null);
  const [balance, setBalance] = useState("0");
  const [networkName, setNetworkName] = useState("BNB Chain");
  const [selectedNetwork, setSelectedNetwork] = useState(networks[1]);
  const [selectedToken, setSelectedToken] = useState(tokens[0]);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationAmount, setCelebrationAmount] = useState(0);
  const [sendAmount, setSendAmount] = useState("");
  const [sendTo, setSendTo] = useState("");
  const [sending, setSending] = useState(false);
  const [copied, setCopied] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    checkConnection();
    
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          getBalance(accounts[0]);
          updateProfileWallet(accounts[0]);
        } else {
          setAccount(null);
          setBalance("0");
        }
      });

      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
  }, []);

  useEffect(() => {
    if (account) {
      fetchTransactionHistory();
    }
  }, [account]);

  const checkConnection = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          await getBalance(accounts[0]);
          await getNetworkName();
          updateProfileWallet(accounts[0]);
        }
      } catch (error) {
        console.error("Error checking connection:", error);
      }
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      toast.error("Please install MetaMask to use FUN Wallet! 🦊");
      window.open("https://metamask.io/download/", "_blank");
      return;
    }

    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      setAccount(accounts[0]);
      await getBalance(accounts[0]);
      await getNetworkName();
      updateProfileWallet(accounts[0]);
      
      toast.success("Wallet connected! Welcome to FUN Planet! 🎉");
    } catch (error: any) {
      console.error("Error connecting wallet:", error);
      toast.error("Couldn't connect wallet 😢");
    }
  };

  const getNetworkName = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const network = await provider.getNetwork();
      
      const networkNames: { [key: string]: string } = {
        "1": "Ethereum",
        "56": "BNB Chain",
        "137": "Polygon",
      };
      
      const name = networkNames[network.chainId.toString()] || "Unknown Network";
      setNetworkName(name);
      
      const foundNetwork = networks.find(n => n.name === name);
      if (foundNetwork) setSelectedNetwork(foundNetwork);
    } catch (error) {
      console.error("Error getting network:", error);
    }
  };

  const getBalance = async (address: string) => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const balanceWei = await provider.getBalance(address);
      const balanceEth = ethers.formatEther(balanceWei);
      setBalance(parseFloat(balanceEth).toFixed(6));
    } catch (error) {
      console.error("Error getting balance:", error);
    }
  };

  const updateProfileWallet = async (address: string) => {
    if (!user) return;

    try {
      await supabase
        .from("profiles")
        .update({ wallet_address: address })
        .eq("id", user.id);
    } catch (error) {
      console.error("Error updating wallet:", error);
    }
  };

  const fetchTransactionHistory = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("wallet_transactions")
        .select("*")
        .or(`from_user_id.eq.${user.id},to_user_id.eq.${user.id}`)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;

      const formattedTxs = data?.map(tx => ({
        type: tx.from_user_id === user.id ? "send" : "receive",
        amount: tx.amount,
        token: tx.token_type || "ETH",
        time: new Date(tx.created_at || "").toLocaleString(),
        hash: tx.transaction_hash,
        from: tx.from_user_id,
        to: tx.to_user_id,
      })) || [];

      setTransactions(formattedTxs);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  const handleSend = async () => {
    if (!account || !sendTo || !sendAmount) {
      toast.error("Please fill in all fields!");
      return;
    }

    if (!ethers.isAddress(sendTo)) {
      toast.error("Invalid recipient address!");
      return;
    }

    const amount = parseFloat(sendAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount!");
      return;
    }

    setSending(true);

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const tx = await signer.sendTransaction({
        to: sendTo,
        value: ethers.parseEther(sendAmount),
      });

      toast.success("Transaction sent! Waiting for confirmation... ⏳");

      await tx.wait();

      await supabase.from("wallet_transactions").insert({
        from_user_id: user?.id,
        amount: amount,
        token_type: selectedToken.symbol,
        transaction_hash: tx.hash,
        status: "completed",
      });

      toast.success("Transaction confirmed! 🎉");
      setSendAmount("");
      setSendTo("");
      await getBalance(account);
      await fetchTransactionHistory();
    } catch (error: any) {
      console.error("Error sending transaction:", error);
      if (error.code === 4001) {
        toast.error("Transaction rejected by user");
      } else if (error.code === -32603) {
        toast.error("Insufficient funds for transaction");
      } else {
        toast.error("Transaction failed! Please try again");
      }
    } finally {
      setSending(false);
    }
  };

  const copyAddress = () => {
    if (account) {
      navigator.clipboard.writeText(account);
      setCopied(true);
      toast.success("Address copied! 📋");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setBalance("0");
    setTransactions([]);
    toast.success("Wallet disconnected! 👋");
  };

  const switchNetwork = async (network: typeof networks[0]) => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: network.chainId }],
      });
      setSelectedNetwork(network);
      setNetworkName(network.name);
      toast.success(`Switched to ${network.name}! 🌟`);
    } catch (error: any) {
      if (error.code === 4902) {
        toast.error(`Please add ${network.name} to MetaMask first!`);
      }
    }
  };

  return (
    <div 
      className="min-h-screen relative overflow-hidden pb-20 transition-all duration-1000"
      style={{
        background: `linear-gradient(135deg, 
          #1E0033 0%, 
          ${selectedNetwork.color}20 25%,
          #9D00FF 40%,
          #00FFFF 60%,
          #0088FF 80%,
          #1E0033 100%)`
      }}
    >
      {/* Dreamy galaxy background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse at top, rgba(157,0,255,0.3) 0%, rgba(30,0,51,0.8) 50%, rgba(0,0,0,0.9) 100%)',
        }} />

        {/* Dreamy floating planets */}
        <motion.div
          animate={{
            y: [0, -40, 0],
            x: [0, 20, 0],
            rotate: [0, 360]
          }}
          transition={{ duration: 25, repeat: Infinity }}
          className="absolute top-20 left-10 w-40 h-40 rounded-full opacity-30"
          style={{
            background: 'radial-gradient(circle at 30% 30%, #9D00FF, #00FFFF)',
            filter: 'blur(3px)',
            boxShadow: '0 0 60px rgba(157,0,255,0.6)'
          }}
        />
        <motion.div
          animate={{
            y: [0, 50, 0],
            x: [0, -30, 0],
            rotate: [360, 0]
          }}
          transition={{ duration: 30, repeat: Infinity }}
          className="absolute top-40 right-20 w-56 h-56 rounded-full opacity-25"
          style={{
            background: 'radial-gradient(circle at 30% 30%, #00FFFF, #0088FF)',
            filter: 'blur(4px)',
            boxShadow: '0 0 80px rgba(0,255,255,0.5)'
          }}
        />
        <motion.div
          animate={{
            y: [0, -30, 0],
            x: [0, 40, 0],
            rotate: [0, 180, 360]
          }}
          transition={{ duration: 35, repeat: Infinity }}
          className="absolute bottom-32 left-1/3 w-32 h-32 rounded-full opacity-30"
          style={{
            background: 'radial-gradient(circle at 30% 30%, #FF00FF, #FFA500)',
            filter: 'blur(2px)',
            boxShadow: '0 0 50px rgba(255,0,255,0.5)'
          }}
        />

        {/* Stardust particles */}
        {[...Array(80)].map((_, i) => (
          <motion.div
            key={`stardust-${i}`}
            className="absolute rounded-full"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: Math.random() * 3 + 1,
              height: Math.random() * 3 + 1,
              background: ['#FFD700', '#00FFFF', '#FF00FF', '#FFA500'][Math.floor(Math.random() * 4)],
              boxShadow: `0 0 ${Math.random() * 20 + 10}px currentColor`
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1.5, 0],
              y: [0, -50]
            }}
            transition={{
              duration: Math.random() * 4 + 3,
              repeat: Infinity,
              delay: Math.random() * 3
            }}
          />
        ))}

        {/* Rainbow twinkling stars */}
        {[...Array(100)].map((_, i) => (
          <motion.div
            key={`star-${i}`}
            className="absolute rounded-full"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: Math.random() * 2 + 1,
              height: Math.random() * 2 + 1,
              background: Math.random() > 0.5 ? '#FFFFFF' : ['#FFD700', '#00FFFF', '#FF00FF'][Math.floor(Math.random() * 3)],
              boxShadow: '0 0 10px currentColor'
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 2, 0]
            }}
            transition={{
              duration: Math.random() * 4 + 2,
              repeat: Infinity,
              delay: Math.random() * 3
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back to Home Button */}
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="mb-6"
        >
          <Button
            onClick={() => navigate("/")}
            variant="outline"
            className="border-0 font-bold text-lg px-6 py-3 transition-all duration-300 group"
            style={{
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 0 30px rgba(157,0,255,0.3), inset 0 0 20px rgba(255,255,255,0.1)',
            }}
          >
            <Home className="w-5 h-5 mr-2 text-cyan-400 group-hover:scale-110 transition-transform" />
            <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Về Trang Chính
            </span>
          </Button>
        </motion.div>

        {!account ? (
          /* Connect Wallet Screen */
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <motion.div
              animate={{
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-40 h-40 mx-auto mb-8 rounded-full flex items-center justify-center shadow-2xl relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #9D00FF, #00FFFF, #0088FF)',
                boxShadow: '0 0 80px rgba(157,0,255,0.8)'
              }}
            >
              <Wallet className="w-20 h-20 text-white" />
            </motion.div>
            
            <h1 className="text-6xl font-black mb-4 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-400 bg-clip-text text-transparent">
              FUN WALLET
            </h1>
            
            <p className="text-2xl text-white/80 mb-8 font-bold">
              Connect your MetaMask to start having FUN! 🚀
            </p>
            
            <Button
              onClick={connectWallet}
              className="text-2xl font-black px-12 py-8 h-auto relative overflow-hidden group border-0"
              style={{
                background: 'linear-gradient(135deg, #9D00FF 0%, #00FFFF 100%)',
                boxShadow: '0 0 40px rgba(157,0,255,0.6)'
              }}
            >
              <span className="relative z-10">🦊 CONNECT METAMASK</span>
            </Button>
          </motion.div>
        ) : (
          <>
            {/* Main Wallet Card */}
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="mb-8"
            >
              <Card className="border-0 overflow-hidden relative" style={{
                background: 'rgba(30,0,51,0.4)',
                backdropFilter: 'blur(40px)',
                boxShadow: `0 0 60px ${selectedNetwork.color}40, 0 20px 80px rgba(0,0,0,0.5), inset 0 0 0 2px ${selectedNetwork.color}60`
              }}>
                <motion.div
                  className="absolute inset-0 rounded-lg pointer-events-none"
                  animate={{
                    boxShadow: [
                      `0 0 20px ${selectedNetwork.color}60`,
                      `0 0 40px ${selectedNetwork.color}80`,
                      `0 0 20px ${selectedNetwork.color}60`
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />

                <CardContent className="p-8">
                  {/* Header with Network Selector */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                      >
                        <Sparkles className="w-10 h-10 text-cyan-400" />
                      </motion.div>
                      <h1 className="text-4xl font-black bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-400 bg-clip-text text-transparent">
                        FUN WALLET
                      </h1>
                    </div>

                    {/* Network Selector */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="outline" 
                          className="border-0 font-bold text-lg px-6 py-6 h-auto transition-all duration-300"
                          style={{
                            background: `linear-gradient(135deg, ${selectedNetwork.color}40, ${selectedNetwork.color}20)`,
                            backdropFilter: 'blur(20px)',
                            boxShadow: `0 0 30px ${selectedNetwork.color}60, inset 0 0 20px ${selectedNetwork.color}20`,
                            color: selectedNetwork.color
                          }}
                        >
                          <span className="text-2xl mr-2">{selectedNetwork.icon}</span>
                          {selectedNetwork.name}
                          <ChevronDown className="ml-2 w-5 h-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent 
                        className="border-0 p-2 z-[100]"
                        style={{
                          background: 'rgba(30,0,51,0.95)',
                          backdropFilter: 'blur(40px)',
                          boxShadow: '0 20px 60px rgba(0,0,0,0.8), inset 0 0 0 1px rgba(157,0,255,0.5)'
                        }}
                      >
                        {networks.map((network) => (
                          <DropdownMenuItem
                            key={network.id}
                            onClick={() => switchNetwork(network)}
                            className="px-4 py-3 cursor-pointer transition-all duration-200"
                            style={{
                              background: selectedNetwork.id === network.id ? `${network.color}20` : 'transparent',
                              color: network.color,
                              borderLeft: selectedNetwork.id === network.id ? `4px solid ${network.color}` : 'none'
                            }}
                          >
                            <span className="text-2xl mr-3">{network.icon}</span>
                            <span className="font-bold text-lg">{network.name}</span>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Address */}
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <p className="text-sm text-white/60 font-mono">
                      {account.slice(0, 6)}...{account.slice(-4)}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={copyAddress}
                      className="h-6 w-6 p-0"
                    >
                      {copied ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4 text-white/60" />
                      )}
                    </Button>
                  </div>

                  {/* Balance */}
                  <div className="text-center mb-6">
                    <motion.div
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="text-7xl font-black mb-2"
                      style={{
                        background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FFD700 100%)',
                        backgroundSize: '200% auto',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        filter: 'drop-shadow(0 0 30px rgba(255,215,0,0.6))',
                      }}
                    >
                      {balance}
                    </motion.div>
                    <p className="text-2xl font-bold" style={{ color: selectedNetwork.color }}>
                      {selectedNetwork.symbol}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Token Selector */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="mb-6"
            >
              <div className="flex gap-3 overflow-x-auto pb-4 px-2 scrollbar-hide">
                {tokens.map((token) => (
                  <motion.button
                    key={token.symbol}
                    onClick={() => setSelectedToken(token)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className={`flex-shrink-0 px-6 py-4 rounded-2xl border-0 font-bold transition-all duration-300 ${
                      selectedToken.symbol === token.symbol ? 'scale-110' : 'scale-100 opacity-70'
                    }`}
                    style={{
                      background: selectedToken.symbol === token.symbol
                        ? `linear-gradient(135deg, ${token.gradient})`
                        : 'rgba(255,255,255,0.1)',
                      backdropFilter: 'blur(20px)',
                      boxShadow: selectedToken.symbol === token.symbol
                        ? `0 0 40px ${token.special ? '#FFD700' : 'rgba(255,255,255,0.5)'}`
                        : 'none'
                    }}
                  >
                    <motion.div
                      animate={selectedToken.symbol === token.symbol ? { rotate: 360 } : {}}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="text-3xl mb-1"
                    >
                      {token.emoji}
                    </motion.div>
                    <div className="text-white font-black text-sm">{token.symbol}</div>
                  </motion.button>
                ))}
              </div>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* Send Card */}
              <motion.div
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="relative overflow-hidden border-0" style={{
                  background: 'rgba(255,20,147,0.1)',
                  backdropFilter: 'blur(30px)',
                  boxShadow: '0 8px 32px 0 rgba(255,20,147,0.3), inset 0 0 0 2px rgba(255,20,147,0.4)'
                }}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      >
                        <ArrowUpRight className="w-6 h-6 text-pink-400" />
                      </motion.div>
                      <span className="bg-gradient-to-r from-pink-400 to-purple-500 bg-clip-text text-transparent font-black">
                        Send FUN
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm text-white/60 mb-2 block">Recipient Address</label>
                      <Input
                        value={sendTo}
                        onChange={(e) => setSendTo(e.target.value)}
                        placeholder="0x..."
                        className="border-0 text-white placeholder:text-white/40"
                        style={{
                          background: 'rgba(255,255,255,0.05)',
                          backdropFilter: 'blur(10px)',
                          boxShadow: `inset 0 0 0 1px ${selectedNetwork.color}40`
                        }}
                      />
                    </div>
                    <div>
                      <label className="text-sm text-white/60 mb-2 block">Amount ({selectedToken.symbol})</label>
                      <Input
                        type="number"
                        value={sendAmount}
                        onChange={(e) => setSendAmount(e.target.value)}
                        placeholder="0.00"
                        className="border-0 text-white placeholder:text-white/40"
                        style={{
                          background: 'rgba(255,255,255,0.05)',
                          backdropFilter: 'blur(10px)',
                          boxShadow: `inset 0 0 0 1px ${selectedNetwork.color}40`
                        }}
                      />
                    </div>
                    <Button
                      onClick={handleSend}
                      disabled={sending}
                      className="w-full font-black text-xl py-6 border-0 relative overflow-hidden group"
                      style={{
                        background: 'linear-gradient(135deg, #FF1493 0%, #9D00FF 100%)',
                        boxShadow: '0 0 30px rgba(255,20,147,0.6)'
                      }}
                    >
                      <motion.div
                        animate={{
                          background: [
                            'linear-gradient(135deg, #FF1493 0%, #9D00FF 100%)',
                            'linear-gradient(135deg, #9D00FF 0%, #FF1493 100%)',
                            'linear-gradient(135deg, #FF1493 0%, #9D00FF 100%)'
                          ]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute inset-0"
                      />
                      <span className="relative z-10">
                        {sending ? "SENDING..." : "SEND NOW ⚡"}
                      </span>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Receive Card */}
              <motion.div
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="relative overflow-hidden border-0" style={{
                  background: 'rgba(0,255,255,0.1)',
                  backdropFilter: 'blur(30px)',
                  boxShadow: '0 8px 32px 0 rgba(0,255,255,0.3), inset 0 0 0 2px rgba(0,255,255,0.4)'
                }}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                      <motion.div
                        animate={{ rotate: -360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      >
                        <ArrowDownLeft className="w-6 h-6 text-cyan-400" />
                      </motion.div>
                      <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent font-black">
                        Receive
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-6 rounded-xl text-center" style={{
                      background: 'rgba(255,255,255,0.05)',
                      backdropFilter: 'blur(10px)',
                    }}>
                      <p className="text-xs text-white/60 mb-3">Your Address</p>
                      <p className="font-mono text-sm text-white break-all mb-4">
                        {account}
                      </p>
                      <Button
                        onClick={copyAddress}
                        className="w-full font-black text-lg py-6 border-0"
                        style={{
                          background: 'linear-gradient(135deg, #00FFFF 0%, #0088FF 100%)',
                          boxShadow: '0 0 30px rgba(0,255,255,0.6)'
                        }}
                      >
                        <Copy className="w-5 h-5 mr-2" />
                        {copied ? "COPIED! ✨" : "COPY ADDRESS 🔥"}
                      </Button>
                    </div>

                    <div className="text-center">
                      <Button
                        onClick={() => {
                          setCelebrationAmount(0.042);
                          setShowCelebration(true);
                        }}
                        variant="outline"
                        className="text-sm border-cyan-400/30 text-cyan-400"
                      >
                        Test Celebration 🎉
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Transaction History */}
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="border-0" style={{
                background: 'rgba(30,0,51,0.4)',
                backdropFilter: 'blur(30px)',
                boxShadow: '0 8px 32px 0 rgba(157,0,255,0.2), inset 0 0 0 2px rgba(157,0,255,0.3)'
              }}>
                <CardHeader>
                  <CardTitle className="text-2xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Recent Transactions ✨
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {transactions.length === 0 ? (
                    <p className="text-center text-white/40 py-8">No transactions yet! Start sending FUN! 🚀</p>
                  ) : (
                    <div className="space-y-3">
                      {transactions.map((tx, i) => (
                        <motion.div
                          key={i}
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: i * 0.1 }}
                          className="p-4 rounded-xl flex items-center justify-between"
                          style={{
                            background: tx.type === "receive" 
                              ? 'rgba(0,255,0,0.05)'
                              : 'rgba(255,0,255,0.05)',
                            backdropFilter: 'blur(10px)',
                            boxShadow: tx.type === "receive"
                              ? '0 0 20px rgba(0,255,0,0.2)'
                              : '0 0 20px rgba(255,0,255,0.2)'
                          }}
                        >
                          <div className="flex items-center gap-3">
                            {tx.type === "receive" ? (
                              <ArrowDownLeft className="w-5 h-5 text-green-400" />
                            ) : (
                              <ArrowUpRight className="w-5 h-5 text-purple-400" />
                            )}
                            <div>
                              <p className="font-bold text-white">
                                {tx.type === "receive" ? (
                                  <span className="text-green-400">+{tx.amount} {tx.token}</span>
                                ) : (
                                  <span className="text-purple-400">-{tx.amount} {tx.token}</span>
                                )}
                              </p>
                              <p className="text-xs text-white/40">{tx.time}</p>
                            </div>
                          </div>
                          {tx.hash && (
                            <a
                              href={`https://${networkName === "BSC" ? "bscscan" : "etherscan"}.com/tx/${tx.hash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-cyan-400 hover:text-cyan-300"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </div>

      {/* Celebration */}
      <AnimatePresence>
        {showCelebration && (
          <CelebrationNotification
            amount={celebrationAmount}
            token={selectedToken.symbol}
            onComplete={() => setShowCelebration(false)}
          />
        )}
      </AnimatePresence>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
