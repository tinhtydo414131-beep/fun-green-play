import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ArrowUpRight, ArrowDownLeft, Wallet, Sparkles, Copy, CheckCircle, ChevronDown, ExternalLink, Home, Send, Zap, Shield, QrCode } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CelebrationNotification } from "@/components/CelebrationNotification";
import { AirdropConfirmModal } from "@/components/AirdropConfirmModal";
import { TransactionHistory } from "@/components/TransactionHistory";
import { toast } from "sonner";
import { ethers } from "ethers";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { QRCodeSVG } from "qrcode.react";
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
  { symbol: "BNB", name: "BNB", gradient: "from-yellow-400 to-yellow-600", emoji: "◆", contract: null },
  { 
    symbol: "CAMLY", 
    name: "CAMLY COIN", 
    gradient: "from-pink-400 via-yellow-300 to-pink-500", 
    emoji: "👑", 
    special: true,
    contract: "0x0910320181889fefde0bb1ca63962b0a8882e413",
    verified: true
  },
  { symbol: "ETH", name: "Ethereum", gradient: "from-blue-400 to-purple-600", emoji: "⟠", contract: null },
  { symbol: "USDT", name: "Tether", gradient: "from-green-400 to-green-600", emoji: "💵", contract: null },
  { symbol: "FUN", name: "FUN TOKEN", gradient: "from-cyan-400 to-purple-600", emoji: "🎯", contract: null }
];

const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function decimals() view returns (uint8)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)"
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
  const [camlyBalance, setCamlyBalance] = useState("0");
  const [bulkAddresses, setBulkAddresses] = useState("");
  const [bulkAmount, setBulkAmount] = useState("1000");
  const [bulkSending, setBulkSending] = useState(false);
  const [bulkProgress, setBulkProgress] = useState(0);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [bulkProgressText, setBulkProgressText] = useState("");

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
      
      await getCamlyBalance(address);
    } catch (error) {
      console.error("Error getting balance:", error);
    }
  };

  const getCamlyBalance = async (address: string) => {
    try {
      const camlyToken = tokens.find(t => t.symbol === "CAMLY");
      if (!camlyToken?.contract) return;

      console.log("Fetching CAMLY balance for:", address);
      console.log("CAMLY Contract:", camlyToken.contract);

      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(camlyToken.contract, ERC20_ABI, provider);
      
      const balance = await contract.balanceOf(address);
      const decimals = await contract.decimals();
      
      console.log("CAMLY Balance (raw):", balance.toString());
      console.log("CAMLY Decimals:", decimals.toString());
      
      const formatted = ethers.formatUnits(balance, decimals);
      console.log("CAMLY Balance (formatted):", formatted);
      
      setCamlyBalance(parseFloat(formatted).toFixed(2));
    } catch (error) {
      console.error("Error getting CAMLY balance:", error);
      setCamlyBalance("0.00");
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
        .limit(20);

      if (error) throw error;

      const formattedTxs = data?.map(tx => {
        // Check if it's an airdrop by looking at notes
        const isAirdrop = tx.notes?.includes('Airdrop');
        const recipientsMatch = tx.notes?.match(/(\d+) recipients/);
        const recipientsCount = recipientsMatch ? parseInt(recipientsMatch[1]) : undefined;

        return {
          id: tx.id,
          type: isAirdrop ? 'airdrop' : (tx.from_user_id === user.id ? 'send' : 'receive'),
          amount: tx.amount,
          token_type: tx.token_type || "BNB",
          status: tx.status || "completed",
          created_at: tx.created_at || new Date().toISOString(),
          transaction_hash: tx.transaction_hash,
          notes: tx.notes,
          recipients_count: recipientsCount
        };
      }) || [];

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

      let txHash: string;

      // Check if sending ERC-20 token (like CAMLY) or native token (BNB/ETH)
      if (selectedToken.contract) {
        // ERC-20 Token Transfer (CAMLY, USDT, etc.)
        console.log(`Sending ${amount} ${selectedToken.symbol} to ${sendTo}`);
        
        const contract = new ethers.Contract(selectedToken.contract, ERC20_ABI, signer);
        
        // Get decimals
        const decimals = await contract.decimals();
        console.log(`Token decimals: ${decimals}`);
        
        // Check balance
        const balance = await contract.balanceOf(account);
        const balanceFormatted = parseFloat(ethers.formatUnits(balance, decimals));
        console.log(`Current balance: ${balanceFormatted} ${selectedToken.symbol}`);
        
        if (balanceFormatted < amount) {
          toast.error(`Insufficient ${selectedToken.symbol}! You have ${balanceFormatted.toFixed(6)} but trying to send ${amount}`);
          setSending(false);
          return;
        }
        
        // Convert amount to wei with correct decimals
        const amountInWei = ethers.parseUnits(sendAmount, decimals);
        console.log(`Sending ${amountInWei.toString()} wei (${amount} ${selectedToken.symbol})`);
        
        // Execute transfer
        const tx = await contract.transfer(sendTo, amountInWei);
        toast.success(`${selectedToken.symbol} transfer initiated! Waiting for confirmation... ⏳`);
        
        const receipt = await tx.wait();
        txHash = receipt.hash;
        
        toast.success(`${amount} ${selectedToken.symbol} sent successfully! 🎉`);
        
        // Update CAMLY balance if that's what was sent
        if (selectedToken.symbol === "CAMLY") {
          await getCamlyBalance(account);
        }
      } else {
        // Native Token Transfer (BNB, ETH, MATIC)
        console.log(`Sending ${amount} ${selectedToken.symbol} (native) to ${sendTo}`);
        
        const tx = await signer.sendTransaction({
          to: sendTo,
          value: ethers.parseEther(sendAmount),
        });

        toast.success("Transaction sent! Waiting for confirmation... ⏳");
        const receipt = await tx.wait();
        txHash = receipt.hash;
        
        toast.success("Transaction confirmed! 🎉");
      }

      // Record transaction in database
      await supabase.from("wallet_transactions").insert({
        from_user_id: user?.id,
        amount: amount,
        token_type: selectedToken.symbol,
        transaction_hash: txHash,
        status: "completed",
      });

      setSendAmount("");
      setSendTo("");
      await getBalance(account);
      await fetchTransactionHistory();
    } catch (error: any) {
      console.error("Error sending transaction:", error);
      if (error.code === 4001) {
        toast.error("Transaction rejected by user");
      } else if (error.code === -32603 || error.message?.includes("insufficient")) {
        toast.error(`Insufficient funds! Make sure you have enough ${selectedToken.symbol} and BNB for gas fees.`);
      } else {
        toast.error(`Transaction failed: ${error.message || "Unknown error"}`);
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
    setCamlyBalance("0");
    setTransactions([]);
    toast.success("Wallet disconnected! 👋");
  };

  const handleBulkSendClick = () => {
    const addresses = bulkAddresses.split('\n').map(addr => addr.trim()).filter(addr => addr);
    
    if (addresses.length === 0) {
      toast.error("Please enter at least one address!");
      return;
    }

    const amount = parseFloat(bulkAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount!");
      return;
    }

    for (const addr of addresses) {
      if (!ethers.isAddress(addr)) {
        toast.error(`Invalid address: ${addr}`);
        return;
      }
    }

    setShowConfirmModal(true);
  };

  const handleBulkSend = async () => {
    setShowConfirmModal(false);
    
    const addresses = bulkAddresses.split('\n').map(addr => addr.trim()).filter(addr => addr);
    const amount = parseFloat(bulkAmount);
    const totalAmount = amount * addresses.length;

    setBulkSending(true);
    setBulkProgress(0);
    setBulkProgressText("");

    try {
      const camlyToken = tokens.find(t => t.symbol === "CAMLY");
      if (!camlyToken?.contract) {
        toast.error("CAMLY token not configured!");
        setBulkSending(false);
        return;
      }

      console.log("=== CAMLY AIRDROP START ===");
      console.log("Contract:", camlyToken.contract);
      console.log("Recipients:", addresses.length);
      console.log("Amount per address:", amount);
      console.log("Total CAMLY needed:", totalAmount);

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(camlyToken.contract, ERC20_ABI, signer);
      const decimals = await contract.decimals();

      console.log("CAMLY Decimals:", decimals.toString());

      // Check current balance
      const balance = await contract.balanceOf(account);
      const balanceFormatted = parseFloat(ethers.formatUnits(balance, decimals));
      
      console.log("Your CAMLY balance:", balanceFormatted);
      console.log("Total needed:", totalAmount);
      
      if (balanceFormatted < totalAmount) {
        toast.error(`❌ Insufficient CAMLY! You have ${balanceFormatted.toFixed(2)} but need ${totalAmount}`);
        setBulkSending(false);
        return;
      }

      toast.success(`🚀 Starting airdrop of ${amount} CAMLY to ${addresses.length} wallets!`);

      let successCount = 0;
      let failedAddresses: string[] = [];
      
      for (let i = 0; i < addresses.length; i++) {
        try {
          setBulkProgressText(`Airdropping... ${i + 1}/${addresses.length} wallets`);
          
          console.log(`Sending to ${addresses[i]}: ${amount} CAMLY`);
          
          const amountInWei = ethers.parseUnits(bulkAmount, decimals);
          const tx = await contract.transfer(addresses[i], amountInWei);
          
          console.log(`TX sent: ${tx.hash}`);
          
          const receipt = await tx.wait();
          console.log(`TX confirmed: ${receipt.hash}`);
          
          successCount++;
          setBulkProgress(Math.round(((i + 1) / addresses.length) * 100));
          
          toast.success(`✅ ${i + 1}/${addresses.length}: ${amount} CAMLY → ${addresses[i].slice(0, 6)}...${addresses[i].slice(-4)}`);
        } catch (error: any) {
          console.error(`Failed to send to ${addresses[i]}:`, error);
          failedAddresses.push(addresses[i]);
          toast.error(`❌ ${i + 1}/${addresses.length}: Failed ${addresses[i].slice(0, 6)}...${addresses[i].slice(-4)} - ${error.message || 'Unknown error'}`);
        }
      }

      console.log("=== AIRDROP COMPLETE ===");
      console.log("Success:", successCount);
      console.log("Failed:", failedAddresses.length);

      // Record airdrop transaction in database
      const batchId = new Date().getTime();
      const totalSent = successCount * amount;
      
      await supabase.from("wallet_transactions").insert({
        from_user_id: user?.id,
        amount: totalSent,
        token_type: "CAMLY",
        status: successCount === addresses.length ? "completed" : "partial",
        notes: `Airdrop to ${addresses.length} recipients - ${successCount} successful, ${failedAddresses.length} failed - Batch #${batchId}`
      });

      // Trigger 10-second celebration!
      setCelebrationAmount(totalSent);
      setShowCelebration(true);

      if (successCount === addresses.length) {
        toast.success(`🎉 PERFECT! All ${addresses.length} airdrops successful!`);
      } else {
        toast.success(`🎉 Airdrop done! ${successCount}/${addresses.length} successful`);
      }
      
      setBulkAddresses("");
      await getCamlyBalance(account!);
      await fetchTransactionHistory();
    } catch (error: any) {
      console.error("Bulk send error:", error);
      toast.error(`Airdrop failed: ${error.message || "Unknown error"}`);
    } finally {
      setBulkSending(false);
      setBulkProgress(0);
      setBulkProgressText("");
    }
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
          #00D4FF 0%,
          ${selectedNetwork.color}30 20%,
          #7B2CBF 40%,
          #E0AAFF 70%,
          #00D4FF 100%)`
      }}
    >
      {/* Galaxy background with floating particles */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse at top, rgba(0,212,255,0.3) 0%, rgba(123,44,191,0.5) 50%, rgba(0,0,0,0.9) 100%)',
        }} />

        {/* Stardust particles */}
        {[...Array(100)].map((_, i) => (
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
        {[...Array(50)].map((_, i) => (
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

      <div className="container mx-auto px-4 py-8 max-w-4xl relative z-10">
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

                  {/* QR Code Section */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex justify-center mb-6"
                  >
                    <div 
                      className="p-6 rounded-3xl relative"
                      style={{
                        background: 'rgba(255,255,255,0.95)',
                        backdropFilter: 'blur(20px)',
                        boxShadow: '0 0 60px rgba(0,255,255,0.6), 0 0 120px rgba(157,0,255,0.4), inset 0 0 30px rgba(255,255,255,0.8)',
                        border: '3px solid rgba(0,255,255,0.3)'
                      }}
                    >
                      <motion.div
                        animate={{ 
                          boxShadow: [
                            '0 0 40px rgba(0,255,255,0.6)',
                            '0 0 80px rgba(157,0,255,0.8)',
                            '0 0 40px rgba(0,255,255,0.6)'
                          ]
                        }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="absolute inset-0 rounded-3xl pointer-events-none"
                      />
                      <QRCodeSVG
                        value={account}
                        size={180}
                        bgColor="#FFFFFF"
                        fgColor="#1E0033"
                        level="H"
                        includeMargin={false}
                        className="rounded-2xl relative z-10"
                      />
                      <div className="absolute -top-3 -right-3 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-full p-2 shadow-2xl">
                        <QrCode className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </motion.div>

                  <p className="text-center text-sm text-white/60 mb-4 font-bold">
                    📱 Scan QR to receive tokens
                  </p>

                  {/* Balance */}
                  <div className="text-center mb-6">
                    <motion.div
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="text-7xl font-black mb-2"
                      style={{
                        background: 'linear-gradient(135deg, #00FFFF 0%, #9D00FF 50%, #00FFFF 100%)',
                        backgroundSize: '200% auto',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        filter: 'drop-shadow(0 0 30px rgba(0,255,255,0.8))',
                      }}
                    >
                      {balance}
                    </motion.div>
                    <p className="text-2xl font-bold" style={{ color: selectedNetwork.color }}>
                      {selectedNetwork.symbol}
                    </p>
                    
                    {/* CAMLY Balance Highlight */}
                    <motion.div
                      animate={{ scale: [1, 1.03, 1] }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="mt-4 p-4 rounded-2xl"
                      style={{
                        background: 'linear-gradient(135deg, rgba(255,192,203,0.2), rgba(255,215,0,0.2))',
                        backdropFilter: 'blur(10px)',
                        border: '2px solid rgba(255,215,0,0.5)',
                        boxShadow: '0 0 40px rgba(255,215,0,0.4)'
                      }}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-3xl">👑</span>
                        <div>
                          <p className="text-xs text-white/60">CAMLY COIN</p>
                          <p className="text-3xl font-black bg-gradient-to-r from-pink-400 via-yellow-300 to-pink-500 bg-clip-text text-transparent">
                            {camlyBalance}
                          </p>
                        </div>
                        {tokens.find(t => t.symbol === "CAMLY")?.verified && (
                          <Shield className="w-5 h-5 text-green-400" />
                        )}
                      </div>
                      <p className="text-xs text-white/40 mt-2">
                        Contract: {tokens.find(t => t.symbol === "CAMLY")?.contract?.slice(0, 10)}...
                      </p>
                    </motion.div>
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

            {/* Tabs for Normal Send and Bulk Send */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-8"
            >
              <Tabs defaultValue="send" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-6 border-0 p-2" style={{
                  background: 'rgba(30,0,51,0.6)',
                  backdropFilter: 'blur(30px)',
                  boxShadow: '0 0 40px rgba(157,0,255,0.3)'
                }}>
                  <TabsTrigger 
                    value="send"
                    className="font-black text-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-600 data-[state=active]:text-white"
                  >
                    <Send className="w-5 h-5 mr-2" />
                    Normal Send
                  </TabsTrigger>
                  <TabsTrigger 
                    value="bulk"
                    className="font-black text-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-500 data-[state=active]:text-white"
                  >
                    <Zap className="w-5 h-5 mr-2" />
                    Bulk Airdrop
                  </TabsTrigger>
                  <TabsTrigger 
                    value="history"
                    className="font-black text-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-600 data-[state=active]:text-white"
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    History
                  </TabsTrigger>
                </TabsList>

                {/* Normal Send Tab */}
                <TabsContent value="send">
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Send Card */}
                    <Card className="relative overflow-hidden border-0" style={{
                      background: 'rgba(255,20,147,0.15)',
                      backdropFilter: 'blur(30px)',
                      boxShadow: '0 8px 32px 0 rgba(255,20,147,0.4), inset 0 0 0 2px rgba(255,20,147,0.5)'
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
                            background: 'linear-gradient(135deg, #FF1493 0%, #9D00FF 50%, #00FFFF 100%)',
                            backgroundSize: '200% auto',
                            boxShadow: '0 0 40px rgba(255,20,147,0.8)'
                          }}
                        >
                          <motion.div
                            animate={{
                              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                            }}
                            transition={{ duration: 3, repeat: Infinity }}
                            className="absolute inset-0"
                            style={{
                              background: 'linear-gradient(135deg, #FF1493 0%, #9D00FF 50%, #00FFFF 100%)',
                              backgroundSize: '200% auto'
                            }}
                          />
                          <span className="relative z-10">
                            {sending ? "SENDING..." : "SEND NOW ⚡"}
                          </span>
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Receive Card */}
                    <Card className="relative overflow-hidden border-0" style={{
                      background: 'rgba(0,255,255,0.15)',
                      backdropFilter: 'blur(30px)',
                      boxShadow: '0 8px 32px 0 rgba(0,255,255,0.4), inset 0 0 0 2px rgba(0,255,255,0.5)'
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
                              boxShadow: '0 0 40px rgba(0,255,255,0.8)'
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
                  </div>
                </TabsContent>

                {/* Bulk Send/Airdrop Tab */}
                <TabsContent value="bulk">
                  <Card className="border-0 relative overflow-hidden" style={{
                    background: 'rgba(123,44,191,0.2)',
                    backdropFilter: 'blur(40px)',
                    boxShadow: '0 8px 32px 0 rgba(224,170,255,0.5), inset 0 0 0 3px rgba(224,170,255,0.4)'
                  }}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3 text-3xl">
                        <motion.div
                          animate={{ rotate: [0, 360] }}
                          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        >
                          <Zap className="w-8 h-8 text-yellow-400" />
                        </motion.div>
                        <span className="bg-gradient-to-r from-yellow-300 via-pink-400 to-purple-500 bg-clip-text text-transparent font-black">
                          LAUNCH AIRDROP CAMLY 👑
                        </span>
                      </CardTitle>
                      <p className="text-white/60 text-sm mt-2">
                        Send CAMLY tokens to multiple addresses at once! Perfect for rewarding your community ✨
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <label className="text-white font-bold mb-3 block flex items-center gap-2">
                          <span>📝 Wallet Addresses</span>
                          <span className="text-xs text-white/40">(one per line)</span>
                        </label>
                        <Textarea
                          value={bulkAddresses}
                          onChange={(e) => setBulkAddresses(e.target.value)}
                          placeholder="0x1234...
0x5678...
0x9abc..."
                          rows={8}
                          className="border-0 text-white placeholder:text-white/30 font-mono text-sm"
                          style={{
                            background: 'rgba(255,255,255,0.05)',
                            backdropFilter: 'blur(10px)',
                            boxShadow: 'inset 0 0 0 2px rgba(224,170,255,0.3)'
                          }}
                        />
                      </div>

                      <div>
                        <label className="text-white font-bold mb-3 block">
                          💎 Amount of CAMLY per Address
                        </label>
                        <Input
                          type="number"
                          value={bulkAmount}
                          onChange={(e) => setBulkAmount(e.target.value)}
                          placeholder="1000"
                          className="border-0 text-white text-2xl font-black placeholder:text-white/30"
                          style={{
                            background: 'rgba(255,255,255,0.05)',
                            backdropFilter: 'blur(10px)',
                            boxShadow: 'inset 0 0 0 2px rgba(224,170,255,0.3)'
                          }}
                        />
                      </div>

                      {bulkAddresses && bulkAmount && (
                        <motion.div
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="p-6 rounded-2xl"
                          style={{
                            background: 'linear-gradient(135deg, rgba(255,215,0,0.2), rgba(255,105,180,0.2))',
                            backdropFilter: 'blur(10px)',
                            border: '2px solid rgba(255,215,0,0.5)',
                            boxShadow: '0 0 40px rgba(255,215,0,0.3)'
                          }}
                        >
                          <h3 className="text-xl font-black text-yellow-300 mb-3">📊 Airdrop Summary</h3>
                          <div className="space-y-2 text-white">
                            <p>🎯 Recipients: <span className="font-black text-cyan-400">{bulkAddresses.split('\n').filter(a => a.trim()).length}</span></p>
                            <p>💰 Amount per address: <span className="font-black text-pink-400">{bulkAmount} CAMLY</span></p>
                            <p className="text-2xl">🚀 Total needed: <span className="font-black bg-gradient-to-r from-yellow-300 to-pink-400 bg-clip-text text-transparent">{parseFloat(bulkAmount) * bulkAddresses.split('\n').filter(a => a.trim()).length} CAMLY</span></p>
                          </div>
                        </motion.div>
                      )}

                      {bulkSending && bulkProgress > 0 && (
                        <motion.div
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="space-y-3"
                        >
                          <p className="text-white font-black text-xl text-center">
                            ✨ {bulkProgressText || `Airdropping... ${bulkProgress}%`}
                          </p>
                          <Progress value={bulkProgress} className="h-6" style={{
                            background: 'rgba(255,255,255,0.2)',
                          }} />
                          <p className="text-cyan-400 text-center text-2xl font-black animate-pulse">
                            {bulkProgress}% Complete
                          </p>
                        </motion.div>
                      )}

                      <Button
                        onClick={handleBulkSendClick}
                        disabled={bulkSending || !bulkAddresses || !bulkAmount}
                        className="w-full font-black text-2xl py-8 border-0 relative overflow-hidden group"
                        style={{
                          background: 'linear-gradient(135deg, #FFD700 0%, #FF1493 25%, #9D00FF 50%, #00FFFF 75%, #FFD700 100%)',
                          backgroundSize: '300% auto',
                          boxShadow: '0 0 60px rgba(255,215,0,0.8), 0 0 100px rgba(255,20,147,0.5)'
                        }}
                      >
                        <motion.div
                          animate={{
                            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                          }}
                          transition={{ duration: 5, repeat: Infinity }}
                          className="absolute inset-0"
                          style={{
                            background: 'linear-gradient(135deg, #FFD700 0%, #FF1493 25%, #9D00FF 50%, #00FFFF 75%, #FFD700 100%)',
                            backgroundSize: '300% auto'
                          }}
                        />
                        <span className="relative z-10 flex items-center justify-center gap-3">
                          {bulkSending ? (
                            <>
                              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                                🚀
                              </motion.div>
                              SENDING AIRDROP...
                            </>
                          ) : (
                            <>
                              🎁 SEND TO ALL 🎁
                            </>
                          )}
                        </span>
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Transaction History Tab */}
                <TabsContent value="history">
                  <Card className="border-0 relative overflow-hidden" style={{
                    background: 'rgba(0,136,255,0.2)',
                    backdropFilter: 'blur(40px)',
                    boxShadow: '0 8px 32px 0 rgba(0,212,255,0.5), inset 0 0 0 3px rgba(0,212,255,0.4)'
                  }}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3 text-3xl">
                        <motion.div
                          animate={{ rotate: [0, 360] }}
                          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        >
                          <Sparkles className="w-8 h-8 text-cyan-400" />
                        </motion.div>
                        <span className="bg-gradient-to-r from-cyan-300 via-blue-400 to-purple-500 bg-clip-text text-transparent font-black">
                          TRANSACTION HISTORY 📜
                        </span>
                      </CardTitle>
                      <p className="text-white/60 text-sm mt-2">
                        View all your past transactions, airdrops, and token transfers ✨
                      </p>
                    </CardHeader>
                    <CardContent>
                      <TransactionHistory transactions={transactions} />
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </motion.div>
          </>
        )}
      </div>

      <AirdropConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleBulkSend}
        walletCount={bulkAddresses.split('\n').filter(a => a.trim()).length}
        amountPerWallet={bulkAmount}
        totalAmount={parseFloat(bulkAmount) * bulkAddresses.split('\n').filter(a => a.trim()).length}
        estimatedGas="~0.008"
      />

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