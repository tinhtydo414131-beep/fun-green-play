import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowUpRight, ArrowDownLeft, Wallet, Sparkles, Copy, CheckCircle } from "lucide-react";
import { CelebrationNotification } from "@/components/CelebrationNotification";
import { toast } from "sonner";
import { ethers } from "ethers";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

declare global {
  interface Window {
    ethereum?: any;
  }
}

export default function FunWallet() {
  const { user } = useAuth();
  const [account, setAccount] = useState<string | null>(null);
  const [balance, setBalance] = useState("0");
  const [networkName, setNetworkName] = useState("Ethereum");
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationAmount, setCelebrationAmount] = useState(0);
  const [sendAmount, setSendAmount] = useState("");
  const [sendTo, setSendTo] = useState("");
  const [sending, setSending] = useState(false);
  const [copied, setCopied] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    checkConnection();
    
    // Listen for account changes
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
        "56": "BSC",
        "137": "Polygon",
        "5": "Goerli",
        "97": "BSC Testnet",
      };
      
      setNetworkName(networkNames[network.chainId.toString()] || "Unknown Network");
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

      // Record transaction in database
      await supabase.from("wallet_transactions").insert({
        from_user_id: user?.id,
        amount: amount,
        token_type: networkName === "BSC" ? "BNB" : "ETH",
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

  const switchToBSC = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x38' }], // BSC Mainnet
      });
    } catch (error: any) {
      // Chain not added, try to add it
      if (error.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0x38',
              chainName: 'BNB Smart Chain',
              nativeCurrency: {
                name: 'BNB',
                symbol: 'BNB',
                decimals: 18
              },
              rpcUrls: ['https://bsc-dataseed.binance.org/'],
              blockExplorerUrls: ['https://bscscan.com/']
            }]
          });
        } catch (addError) {
          console.error("Error adding BSC network:", addError);
          toast.error("Failed to add BSC network");
        }
      } else {
        console.error("Error switching to BSC:", error);
        toast.error("Failed to switch network");
      }
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden pb-20">
      {/* Animated space background */}
      <div className="fixed inset-0 -z-10" style={{
        background: 'radial-gradient(ellipse at top, rgba(138,43,226,0.4) 0%, rgba(25,0,51,1) 50%, rgba(0,0,0,1) 100%)',
      }}>
        {/* Floating planets */}
        <motion.div
          animate={{
            y: [0, -30, 0],
            rotate: [0, 360]
          }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute top-20 left-10 w-32 h-32 rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle at 30% 30%, #FFD700, #FF1493)',
            filter: 'blur(2px)'
          }}
        />
        <motion.div
          animate={{
            y: [0, 40, 0],
            rotate: [360, 0]
          }}
          transition={{ duration: 25, repeat: Infinity }}
          className="absolute top-40 right-20 w-40 h-40 rounded-full opacity-15"
          style={{
            background: 'radial-gradient(circle at 30% 30%, #00FFFF, #8A2BE2)',
            filter: 'blur(3px)'
          }}
        />
        <motion.div
          animate={{
            y: [0, -20, 0],
            x: [0, 30, 0],
            rotate: [0, 180, 360]
          }}
          transition={{ duration: 30, repeat: Infinity }}
          className="absolute bottom-32 left-1/3 w-24 h-24 rounded-full opacity-25"
          style={{
            background: 'radial-gradient(circle at 30% 30%, #FFA500, #FF69B4)',
            filter: 'blur(2px)'
          }}
        />

        {/* Twinkling stars */}
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1.5, 0]
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 2
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
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
              className="w-40 h-40 mx-auto mb-8 bg-gradient-to-br from-yellow-400 via-pink-500 to-cyan-400 rounded-full flex items-center justify-center shadow-2xl"
            >
              <Wallet className="w-20 h-20 text-white" />
            </motion.div>
            
            <h1 className="text-6xl font-black mb-4 bg-gradient-to-r from-yellow-400 via-pink-500 to-cyan-400 bg-clip-text text-transparent">
              FUN WALLET
            </h1>
            
            <p className="text-2xl text-white/80 mb-8 font-bold">
              Connect your MetaMask to start having FUN! 🚀
            </p>
            
            <Button
              onClick={connectWallet}
              className="text-2xl font-black px-12 py-8 h-auto relative overflow-hidden group"
              style={{
                background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
              }}
            >
              <span className="relative z-10 text-black">🦊 CONNECT METAMASK</span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-orange-400 to-yellow-400"
                initial={{ x: '-100%' }}
                whileHover={{ x: '100%' }}
                transition={{ duration: 0.5 }}
              />
            </Button>
            
            <div className="mt-12 p-6 rounded-xl max-w-md mx-auto" style={{
              background: 'rgba(255,255,255,0.05)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,215,0,0.2)'
            }}>
              <p className="text-white/70 text-sm">
                💡 Don't have MetaMask? <a href="https://metamask.io/download/" target="_blank" className="text-yellow-400 hover:underline font-bold">Download it here</a>
              </p>
            </div>
          </motion.div>
        ) : (
          <>
            {/* Balance display */}
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-center mb-8"
            >
              <div className="flex items-center justify-center gap-3 mb-4">
                <Wallet className="w-12 h-12 text-yellow-400" />
                <h1 className="text-5xl font-black bg-gradient-to-r from-yellow-400 via-pink-500 to-cyan-400 bg-clip-text text-transparent">
                  FUN WALLET
                </h1>
                <Sparkles className="w-12 h-12 text-cyan-400 animate-pulse" />
              </div>

              {/* Address display */}
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

              {/* Network indicator */}
              <div className="flex items-center justify-center gap-2 mb-6">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-sm text-white/70">{networkName}</span>
                {networkName !== "BSC" && (
                  <Button
                    onClick={switchToBSC}
                    variant="ghost"
                    size="sm"
                    className="text-xs text-yellow-400 hover:text-yellow-300"
                  >
                    Switch to BSC
                  </Button>
                )}
              </div>
              
              <motion.div
                animate={{
                  scale: [1, 1.05, 1]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-8xl font-black mb-2"
                style={{
                  background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FFD700 100%)',
                  backgroundSize: '200% auto',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  filter: 'drop-shadow(0 0 30px rgba(255,215,0,0.6))',
                  animation: 'gradient-x 3s linear infinite'
                }}
              >
                {balance}
              </motion.div>
              <p className="text-3xl font-bold text-yellow-400">
                {networkName === "BSC" ? "BNB" : "ETH"}
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* Send Card */}
              <motion.div
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="relative overflow-hidden border-0" style={{
                  background: 'rgba(255,255,255,0.05)',
                  backdropFilter: 'blur(20px)',
                  boxShadow: '0 8px 32px 0 rgba(255,20,147,0.2), inset 0 0 0 2px rgba(255,20,147,0.3)'
                }}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                      <ArrowUpRight className="w-6 h-6 text-pink-500" />
                      <span className="bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent font-black">
                        Send FUN
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Input
                      placeholder="Recipient Address (0x...)"
                      value={sendTo}
                      onChange={(e) => setSendTo(e.target.value)}
                      className="bg-black/40 border-pink-500/50 text-white text-sm h-12 font-mono"
                    />
                    <Input
                      type="number"
                      step="0.0001"
                      placeholder="Amount"
                      value={sendAmount}
                      onChange={(e) => setSendAmount(e.target.value)}
                      className="bg-black/40 border-pink-500/50 text-white text-lg h-12"
                    />
                    <Button
                      onClick={handleSend}
                      disabled={sending || !sendTo || !sendAmount}
                      className="w-full h-12 text-lg font-black relative overflow-hidden group"
                      style={{
                        background: 'linear-gradient(135deg, #FF1493 0%, #8A2BE2 100%)',
                      }}
                    >
                      <span className="relative z-10">
                        {sending ? "SENDING... ⏳" : "SEND NOW 🚀"}
                      </span>
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600"
                        initial={{ x: '-100%' }}
                        whileHover={{ x: '100%' }}
                        transition={{ duration: 0.5 }}
                      />
                    </Button>
                  </CardContent>
                  
                  <motion.div
                    className="absolute inset-0 pointer-events-none"
                    animate={{
                      background: [
                        'linear-gradient(0deg, transparent 50%, rgba(255,20,147,0.3) 50%)',
                        'linear-gradient(360deg, transparent 50%, rgba(255,20,147,0.3) 50%)'
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    style={{ backgroundSize: '200% 200%' }}
                  />
                </Card>
              </motion.div>

              {/* Receive/Share Address Card */}
              <motion.div
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="relative overflow-hidden border-0" style={{
                  background: 'rgba(255,255,255,0.05)',
                  backdropFilter: 'blur(20px)',
                  boxShadow: '0 8px 32px 0 rgba(0,255,255,0.2), inset 0 0 0 2px rgba(0,255,255,0.3)'
                }}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                      <ArrowDownLeft className="w-6 h-6 text-cyan-400" />
                      <span className="bg-gradient-to-r from-cyan-400 to-green-400 bg-clip-text text-transparent font-black">
                        Receive
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-white/70 text-sm">Share your address to receive funds:</p>
                    <div className="bg-black/40 border border-cyan-400/50 rounded-lg p-4">
                      <p className="text-white font-mono text-xs break-all mb-3">
                        {account}
                      </p>
                      <Button
                        onClick={copyAddress}
                        className="w-full h-12 text-lg font-black relative overflow-hidden group"
                        style={{
                          background: 'linear-gradient(135deg, #00FFFF 0%, #00FF00 100%)',
                        }}
                      >
                        <span className="relative z-10 text-black flex items-center gap-2 justify-center">
                          {copied ? (
                            <>
                              <CheckCircle className="w-5 h-5" />
                              COPIED! ✓
                            </>
                          ) : (
                            <>
                              <Copy className="w-5 h-5" />
                              COPY ADDRESS 📋
                            </>
                          )}
                        </span>
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-green-400 to-cyan-400"
                          initial={{ x: '-100%' }}
                          whileHover={{ x: '100%' }}
                          transition={{ duration: 0.5 }}
                        />
                      </Button>
                    </div>
                  </CardContent>

                  <motion.div
                    className="absolute inset-0 pointer-events-none"
                    animate={{
                      background: [
                        'linear-gradient(0deg, transparent 50%, rgba(0,255,255,0.3) 50%)',
                        'linear-gradient(360deg, transparent 50%, rgba(0,255,255,0.3) 50%)'
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                    style={{ backgroundSize: '200% 200%' }}
                  />
                </Card>
              </motion.div>
            </div>

            {/* Transaction History */}
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="border-0" style={{
                background: 'rgba(255,255,255,0.05)',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 8px 32px 0 rgba(255,215,0,0.2), inset 0 0 0 2px rgba(255,215,0,0.3)'
              }}>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-3xl font-black bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                    Transaction History
                  </CardTitle>
                  <Button
                    onClick={disconnectWallet}
                    variant="outline"
                    className="border-2 border-red-500/30 hover:border-red-500 text-red-400 hover:bg-red-500/10"
                  >
                    Disconnect
                  </Button>
                </CardHeader>
                <CardContent className="space-y-3">
                  {transactions.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-white/50 text-lg">No transactions yet</p>
                      <p className="text-white/30 text-sm mt-2">Your transaction history will appear here</p>
                    </div>
                  ) : (
                    transactions.map((tx, i) => (
                      <motion.div
                        key={i}
                        initial={{ x: -50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.5 + i * 0.1 }}
                        className="flex items-center justify-between p-4 rounded-xl relative overflow-hidden group cursor-pointer"
                        style={{
                          background: 'rgba(255,255,255,0.03)',
                          border: '1px solid rgba(255,215,0,0.2)'
                        }}
                        whileHover={{ scale: 1.02 }}
                        onClick={() => {
                          if (tx.hash) {
                            const explorerUrl = networkName === "BSC" 
                              ? `https://bscscan.com/tx/${tx.hash}`
                              : `https://etherscan.io/tx/${tx.hash}`;
                            window.open(explorerUrl, '_blank');
                          }
                        }}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            tx.type === 'receive' ? 'bg-green-500/20' : 'bg-pink-500/20'
                          }`}>
                            {tx.type === 'receive' ? (
                              <ArrowDownLeft className="w-6 h-6 text-green-400" />
                            ) : (
                              <ArrowUpRight className="w-6 h-6 text-pink-400" />
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-white text-lg">
                              {tx.type === 'receive' ? 'Received' : 'Sent'}
                            </p>
                            {tx.hash && (
                              <p className="text-xs text-gray-400 font-mono">
                                {tx.hash.slice(0, 10)}...{tx.hash.slice(-8)}
                              </p>
                            )}
                            <p className="text-xs text-gray-500">{tx.time}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-2xl font-black ${
                            tx.type === 'receive' ? 'text-green-400' : 'text-pink-400'
                          }`}>
                            {tx.type === 'receive' ? '+' : '-'}{tx.amount}
                          </p>
                          <p className="text-sm text-yellow-400 font-bold">{tx.token}</p>
                        </div>

                        {/* Sparkle effect on hover */}
                        <motion.div
                          className="absolute inset-0 pointer-events-none"
                          initial={{ opacity: 0 }}
                          whileHover={{ opacity: 1 }}
                        >
                          {[...Array(5)].map((_, sparkleIdx) => (
                            <motion.div
                              key={sparkleIdx}
                              className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                              style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                              }}
                              animate={{
                                scale: [0, 1, 0],
                                opacity: [0, 1, 0]
                              }}
                              transition={{
                                duration: 1,
                                repeat: Infinity,
                                delay: sparkleIdx * 0.2
                              }}
                            />
                          ))}
                        </motion.div>
                      </motion.div>
                    ))
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </div>

      {/* Celebration notification - triggered after successful receive */}
      {showCelebration && (
        <CelebrationNotification
          amount={celebrationAmount}
          token={networkName === "BSC" ? "BNB" : "ETH"}
          onComplete={() => setShowCelebration(false)}
        />
      )}

      <style>{`
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
    </div>
  );
}
