import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowUpRight, ArrowDownLeft, Wallet, Sparkles, Copy, CheckCircle, ChevronDown, ExternalLink, Home, Send, Zap, Shield, QrCode, ArrowLeft, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CelebrationNotification } from "@/components/CelebrationNotification";
import { RichNotification } from "@/components/RichNotification";
import { AirdropConfirmModal } from "@/components/AirdropConfirmModal";
import { TransactionHistory } from "@/components/TransactionHistory";

import { toast } from "sonner";
import { ethers } from "ethers";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { QRCodeSVG } from "qrcode.react";
import camlyCoinPro from "@/assets/camly-coin-pro.png";
import bnbLogo from "@/assets/tokens/bnb-logo.png";
import ethLogo from "@/assets/tokens/eth-logo.png";
import usdtLogo from "@/assets/tokens/usdt-logo.png";
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
  { 
    symbol: "BNB", 
    name: "BNB", 
    gradient: "from-yellow-400 to-yellow-600", 
    emoji: "◆", 
    image: bnbLogo,
    contract: null 
  },
  { 
    symbol: "CAMLY", 
    name: "CAMLY COIN", 
    gradient: "from-pink-400 via-yellow-300 to-pink-500", 
    emoji: "👑",
    image: camlyCoinPro,
    special: true,
    contract: "0x0910320181889fefde0bb1ca63962b0a8882e413",
    verified: true
  },
  { 
    symbol: "ETH", 
    name: "Ethereum", 
    gradient: "from-blue-400 to-purple-600", 
    emoji: "⟠", 
    image: ethLogo,
    contract: null 
  },
  { 
    symbol: "USDT", 
    name: "Tether", 
    gradient: "from-green-400 to-green-600", 
    emoji: "💵", 
    image: usdtLogo,
    contract: "0x55d398326f99059fF775485246999027B3197955" // USDT on BSC
  },
  { 
    symbol: "FUN", 
    name: "FUN TOKEN", 
    gradient: "from-cyan-400 to-purple-600", 
    emoji: "🎯", 
    contract: null 
  }
];

// Verified BSC Multi-Send Contract from ethereumico.io
const MULTISEND_CONTRACT = "0xe5c6BABcB9209994a989C0339d90fa4a120F0CB6";
const MULTISEND_ABI = [
  {
    "inputs": [
      {"internalType": "address[]", "name": "_contributions", "type": "address[]"},
      {"internalType": "uint256[]", "name": "_values", "type": "uint256[]"}
    ],
    "name": "multiSendEth",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "token", "type": "address"},
      {"internalType": "address[]", "name": "_contributions", "type": "address[]"},
      {"internalType": "uint256[]", "name": "_values", "type": "uint256[]"}
    ],
    "name": "multiSendToken",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

// CAMLY uses 3 decimals (confirmed from BscScan: 0x0910320181889fefde0bb1ca63962b0a8882e413)
const CAMLY_DECIMALS = 3;

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
  const [celebrationToken, setCelebrationToken] = useState("CAMLY");
  const [showRichNotification, setShowRichNotification] = useState(false);
  const [richAmount, setRichAmount] = useState(0);
  const [richToken, setRichToken] = useState("BNB");
  const [richTokenImage, setRichTokenImage] = useState<string | undefined>();
  const [processedCoinImage, setProcessedCoinImage] = useState<string | null>(null);
  const [selectedChartCoin, setSelectedChartCoin] = useState<string | null>(null);
  const [chartTimeframe, setChartTimeframe] = useState<'1H' | '4H' | '1D' | '1W' | '1M'>('1D');

  // Check for processed coin image on mount
  useEffect(() => {
    const stored = localStorage.getItem("camly-coin-processed");
    if (stored) {
      setProcessedCoinImage(stored);
    }
  }, []);
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
  const [estimatedGas, setEstimatedGas] = useState("0.000");
  const [currentGasPrice, setCurrentGasPrice] = useState("0");
  const [validAddresses, setValidAddresses] = useState<string[]>([]);
  const [invalidAddresses, setInvalidAddresses] = useState<string[]>([]);
  const [showValidation, setShowValidation] = useState(false);
  const [needsApproval, setNeedsApproval] = useState(false);
  const [approving, setApproving] = useState(false);
  const [approvalComplete, setApprovalComplete] = useState(false);
  
  // Token balances and prices
  const [tokenBalances, setTokenBalances] = useState<{[key: string]: string}>({
    BNB: "0",
    CAMLY: "0",
    ETH: "0",
    USDT: "0",
    FUN: "0"
  });
  const [tokenPrices, setTokenPrices] = useState<{[key: string]: number}>({
    BNB: 0,
    CAMLY: 0,
    ETH: 0,
    USDT: 0,
    FUN: 0
  });
  const [priceChanges, setPriceChanges] = useState<{[key: string]: number}>({});
  const [chartData, setChartData] = useState<any[]>([]);

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
      
      // Subscribe to realtime wallet transactions for receiving money
      const channel = supabase
        .channel('wallet_transactions_realtime')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'wallet_transactions',
            filter: `to_user_id=eq.${user?.id}`
          },
          (payload) => {
            console.log('New transaction received:', payload);
            const newTx = payload.new as any;
            
            // Trigger RICH notification for received money
            if (newTx.to_user_id === user?.id && newTx.status === 'completed') {
              const token = tokens.find(t => t.symbol === newTx.token_type);
              setRichAmount(newTx.amount);
              setRichToken(newTx.token_type || 'BNB');
              setRichTokenImage(token?.image);
              setShowRichNotification(true);
              
              // Refresh balances and transaction history
              getBalance(account);
              fetchTransactionHistory();
            }
          }
        )
        .subscribe();
        
      return () => {
        supabase.removeChannel(channel);
      };
    }
    
    fetchTokenPrices();
    // Refresh prices every 5 minutes
    const priceInterval = setInterval(fetchTokenPrices, 5 * 60 * 1000);
    return () => clearInterval(priceInterval);
  }, [account, user?.id]);

  useEffect(() => {
    if (selectedChartCoin) {
      fetchChartData(selectedChartCoin, chartTimeframe);
    }
  }, [selectedChartCoin, chartTimeframe]);

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
      const formattedBalance = parseFloat(balanceEth).toFixed(6);
      setBalance(formattedBalance);
      
      // Update BNB balance in tokenBalances
      setTokenBalances(prev => ({ ...prev, BNB: formattedBalance }));
      
      await getCamlyBalance(address);
      await getUSDTBalance(address);
      await fetchTokenPrices();
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
      setTokenBalances(prev => ({ ...prev, CAMLY: parseFloat(formatted).toFixed(2) }));
    } catch (error) {
      console.error("Error getting CAMLY balance:", error);
      setCamlyBalance("0.00");
      setTokenBalances(prev => ({ ...prev, CAMLY: "0.00" }));
    }
  };

  const getUSDTBalance = async (address: string) => {
    try {
      const usdtToken = tokens.find(t => t.symbol === "USDT");
      if (!usdtToken?.contract) return;

      console.log("Fetching USDT balance for:", address);
      console.log("USDT Contract:", usdtToken.contract);

      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(usdtToken.contract, ERC20_ABI, provider);
      
      const balance = await contract.balanceOf(address);
      const decimals = await contract.decimals();
      
      console.log("USDT Balance (raw):", balance.toString());
      console.log("USDT Decimals:", decimals.toString());
      
      const formatted = ethers.formatUnits(balance, decimals);
      console.log("USDT Balance (formatted):", formatted);
      
      setTokenBalances(prev => ({ ...prev, USDT: parseFloat(formatted).toFixed(2) }));
    } catch (error) {
      console.error("Error getting USDT balance:", error);
      setTokenBalances(prev => ({ ...prev, USDT: "0.00" }));
    }
  };

  const fetchTokenPrices = async () => {
    const fallbackPrices = {
      BNB: 855,
      CAMLY: 0.000004,
      ETH: 2910,
      USDT: 1,
      FUN: 0.002
    };

    try {
      // Fetch main tokens (BNB, ETH, USDT, FUN)
      const mainResponse = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=binancecoin,ethereum,tether,funtoken&vs_currencies=usd&include_24hr_change=true'
      );
      
      // Fetch CAMLY separately
      const camlyResponse = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=camly-coin&vs_currencies=usd&include_24hr_change=true'
      );

      if (mainResponse.ok && camlyResponse.ok) {
        const mainData = await mainResponse.json();
        const camlyData = await camlyResponse.json();

        const newPrices = {
          BNB: mainData.binancecoin?.usd || fallbackPrices.BNB,
          CAMLY: camlyData['camly-coin']?.usd || fallbackPrices.CAMLY,
          ETH: mainData.ethereum?.usd || fallbackPrices.ETH,
          USDT: mainData.tether?.usd || fallbackPrices.USDT,
          FUN: mainData.funtoken?.usd || fallbackPrices.FUN
        };

        const changes = {
          BNB: mainData.binancecoin?.usd_24h_change || 0,
          CAMLY: camlyData['camly-coin']?.usd_24h_change || 0,
          ETH: mainData.ethereum?.usd_24h_change || 0,
          USDT: mainData.tether?.usd_24h_change || 0,
          FUN: mainData.funtoken?.usd_24h_change || 0
        };

        setTokenPrices(newPrices);
        setPriceChanges(changes);
      } else {
        throw new Error('API response not ok');
      }
    } catch (error) {
      console.error('Error fetching token prices:', error);
      setTokenPrices(fallbackPrices);
      // Retry after 10 seconds
      setTimeout(fetchTokenPrices, 10000);
    }
  };

  const fetchChartData = async (tokenSymbol: string, timeframe: string) => {
    const coinIds: {[key: string]: string} = {
      BNB: 'binancecoin',
      CAMLY: 'camly-coin',
      ETH: 'ethereum',
      USDT: 'tether',
      FUN: 'funtoken'
    };

    const daysMap: {[key: string]: string} = {
      '1H': '1',
      '4H': '1',
      '1D': '1',
      '1W': '7',
      '1M': '30'
    };

    try {
      const coinId = coinIds[tokenSymbol];
      const days = daysMap[timeframe];
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`
      );

      if (response.ok) {
        const data = await response.json();
        let formattedData = data.prices.map((item: any) => ({
          time: new Date(item[0]).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: timeframe === '1H' || timeframe === '4H' ? '2-digit' : undefined }),
          price: item[1]
        }));
        
        // Sample data based on timeframe
        if (timeframe === '1H') {
          formattedData = formattedData.slice(-12); // Last 12 points for 1H
        } else if (timeframe === '4H') {
          formattedData = formattedData.slice(-24); // Last 24 points for 4H
        }
        
        setChartData(formattedData);
      }
    } catch (error) {
      console.error('Error fetching chart data:', error);
      setChartData([]);
    }
  };

  const handleCoinChartToggle = (tokenSymbol: string) => {
    if (selectedChartCoin === tokenSymbol) {
      setSelectedChartCoin(null);
    } else {
      setSelectedChartCoin(tokenSymbol);
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
        
        // Trigger celebration for normal send
        setCelebrationAmount(amount);
        setCelebrationToken(selectedToken.symbol);
        setShowCelebration(true);
        
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
        
        // Trigger celebration for native token send
        setCelebrationAmount(amount);
        setCelebrationToken(selectedToken.symbol);
        setShowCelebration(true);
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

  const validateAddresses = () => {
    const ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;
    const MAX_ADDRESSES = 1000;
    
    // Split by newline and trim each address
    const rawAddresses = bulkAddresses
      .split('\n')
      .map(addr => addr.trim())
      .filter(addr => addr.length > 0); // Remove empty lines
    
    if (rawAddresses.length === 0) {
      toast.error("⚠️ Please enter at least one address!");
      return false;
    }
    
    if (rawAddresses.length > MAX_ADDRESSES) {
      toast.error(`⚠️ Maximum ${MAX_ADDRESSES} addresses allowed! You entered ${rawAddresses.length}`);
      return false;
    }
    
    const valid: string[] = [];
    const invalid: string[] = [];
    
    // Validate each address
    rawAddresses.forEach(addr => {
      if (ADDRESS_REGEX.test(addr)) {
        valid.push(addr);
      } else {
        invalid.push(addr);
      }
    });
    
    setValidAddresses(valid);
    setInvalidAddresses(invalid);
    setShowValidation(true);
    
    if (invalid.length > 0) {
      toast.error(`❌ Found ${invalid.length} invalid address(es)! Check the list below.`);
      return false;
    }
    
    if (valid.length === 0) {
      toast.error("❌ No valid wallets found! Add 0x... addresses");
      return false;
    }
    
    toast.success(`✅ All ${valid.length} addresses are valid!`);
    
    // Auto-check allowance after validation
    checkAllowance(valid.length);
    
    return true;
  };

  const checkAllowance = async (recipientCount: number) => {
    if (!account || !bulkAmount) return;
    
    try {
      const camlyToken = tokens.find(t => t.symbol === "CAMLY");
      if (!camlyToken?.contract) return;

      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(camlyToken.contract, ERC20_ABI, provider);
      
      const amount = parseFloat(bulkAmount);
      const amountPerWalletWei = ethers.parseUnits(bulkAmount, CAMLY_DECIMALS);
      const totalAmountWei = amountPerWalletWei * BigInt(recipientCount);
      
      const currentAllowance = await contract.allowance(account, MULTISEND_CONTRACT);
      
      console.log("🔍 Checking allowance:");
      console.log("- Current:", ethers.formatUnits(currentAllowance, CAMLY_DECIMALS), "CAMLY");
      console.log("- Needed:", ethers.formatUnits(totalAmountWei, CAMLY_DECIMALS), "CAMLY");
      
      if (currentAllowance < totalAmountWei) {
        setNeedsApproval(true);
        setApprovalComplete(false);
        toast.warning("⚠️ Approval needed! Click APPROVE button to continue.");
      } else {
        setNeedsApproval(false);
        setApprovalComplete(true);
        toast.success("✅ Approval sufficient! Ready to airdrop!");
      }
    } catch (error) {
      console.error("Error checking allowance:", error);
    }
  };

  const handleApprove = async () => {
    if (!account || validAddresses.length === 0 || !bulkAmount) {
      toast.error("Please validate addresses first!");
      return;
    }

    setApproving(true);

    try {
      const camlyToken = tokens.find(t => t.symbol === "CAMLY");
      if (!camlyToken?.contract) {
        toast.error("CAMLY token not configured!");
        setApproving(false);
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const camlyContract = new ethers.Contract(camlyToken.contract, ERC20_ABI, signer);
      
      const amountPerWalletWei = ethers.parseUnits(bulkAmount, CAMLY_DECIMALS);
      const totalAmountWei = amountPerWalletWei * BigInt(validAddresses.length);
      
      console.log("🔓 Approving CAMLY for multi-send:");
      console.log("- Token:", camlyToken.contract);
      console.log("- Spender:", MULTISEND_CONTRACT);
      console.log("- Amount:", ethers.formatUnits(totalAmountWei, CAMLY_DECIMALS), "CAMLY");
      
      toast.info("Please approve CAMLY spending in MetaMask... 🦊");
      
      const approveTx = await camlyContract.approve(MULTISEND_CONTRACT, totalAmountWei);
      console.log("✅ Approval TX sent:", approveTx.hash);
      
      toast.success("Approval sent! Waiting for confirmation... ⏳");
      await approveTx.wait();
      
      console.log("✅ Approval confirmed!");
      toast.success("🎉 APPROVED! Ready to FUN AND RICH! 💰");
      
      setNeedsApproval(false);
      setApprovalComplete(true);
      
      // Trigger mini celebration
      setCelebrationAmount(parseFloat(bulkAmount) * validAddresses.length);
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 3000); // Short 3s celebration
      
    } catch (error: any) {
      console.error("Approval error:", error);
      if (error.code === 4001) {
        toast.error("❌ Approval rejected by user");
      } else {
        toast.error(`❌ Approval failed: ${error.message || "Unknown error"}`);
      }
    } finally {
      setApproving(false);
    }
  };

  const handleBulkSendClick = () => {
    // Validate addresses first
    if (!validateAddresses()) {
      return;
    }
    
    const amount = parseFloat(bulkAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount!");
      return;
    }

    // Calculate gas estimate for ultra-low-gas contract
    calculateGasEstimate(validAddresses.length);
    setShowConfirmModal(true);
  };

  const calculateGasEstimate = async (recipientCount: number) => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const feeData = await provider.getFeeData();
      const gasPriceInGwei = parseFloat(ethers.formatUnits(feeData.gasPrice || 0n, "gwei"));
      
      console.log("Current gas price:", gasPriceInGwei, "Gwei");
      setCurrentGasPrice(gasPriceInGwei.toFixed(2));

      // Ultra-low-gas multi-send contract calculation
      const BASE_GAS = 65000;
      const GAS_PER_RECIPIENT = 45000;
      const totalGas = BASE_GAS + (GAS_PER_RECIPIENT * recipientCount);
      
      // Calculate cost in BNB
      const gasCostBnb = (totalGas * gasPriceInGwei) / 1e9;
      
      console.log("Gas calculation:");
      console.log("- Recipients:", recipientCount);
      console.log("- Total gas:", totalGas);
      console.log("- Cost:", gasCostBnb, "BNB");
      
      setEstimatedGas(gasCostBnb.toFixed(6));
    } catch (error) {
      console.error("Error calculating gas:", error);
      // Fallback estimate
      const fallbackGas = (65000 + (45000 * recipientCount)) * 0.05 / 1e9;
      setEstimatedGas(fallbackGas.toFixed(6));
      setCurrentGasPrice("0.05");
    }
  };

  const handleBulkSend = async () => {
    setShowConfirmModal(false);
    
    // Use validated addresses
    const addresses = validAddresses;
    const amount = parseFloat(bulkAmount);
    const totalAmount = amount * addresses.length;

    setBulkSending(true);
    setBulkProgress(0);
    setBulkProgressText("Initializing ultra-low-gas airdrop... 🚀");

    try {
      const camlyToken = tokens.find(t => t.symbol === "CAMLY");
      if (!camlyToken?.contract) {
        toast.error("CAMLY token not configured!");
        setBulkSending(false);
        return;
      }

      console.log("=== ULTRA-LOW-GAS CAMLY AIRDROP (70% CHEAPER!) ===");
      console.log("CAMLY Token:", camlyToken.contract);
      console.log("Multi-Send Contract:", MULTISEND_CONTRACT);
      console.log("Recipients:", addresses.length);
      console.log("Amount per address:", amount);
      console.log("Total CAMLY needed:", totalAmount);

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const camlyContract = new ethers.Contract(camlyToken.contract, ERC20_ABI, signer);
      const CAMLY_DECIMALS_ONCHAIN = CAMLY_DECIMALS;

      // Convert human-readable amount to smallest units (BigInt)
      const amountPerWalletWei = ethers.parseUnits(bulkAmount, CAMLY_DECIMALS_ONCHAIN);
      const totalAmountWei = amountPerWalletWei * BigInt(addresses.length);

      console.log("Using CAMLY decimals for airdrop:", CAMLY_DECIMALS_ONCHAIN);
      console.log("Amount per wallet (wei):", amountPerWalletWei.toString());
      console.log("Total amount (wei):", totalAmountWei.toString());

      // Check current balance
      const balance = await camlyContract.balanceOf(account);
      const balanceFormatted = parseFloat(ethers.formatUnits(balance, CAMLY_DECIMALS_ONCHAIN));
      const totalNeededFormatted = parseFloat(ethers.formatUnits(totalAmountWei, CAMLY_DECIMALS_ONCHAIN));
      
      console.log("Your CAMLY balance:", balanceFormatted);
      console.log("Total needed (formatted):", totalNeededFormatted);
      
      if (balance < totalAmountWei) {
        toast.error(`❌ Insufficient CAMLY! You have ${balanceFormatted.toFixed(2)} but need ${totalNeededFormatted.toFixed(2)}`);
        setBulkSending(false);
        return;
      }

      // Step 1: Check allowance
      setBulkProgressText("Checking allowance... 🔍");
      setBulkProgress(10);
      
      const currentAllowance = await camlyContract.allowance(account, MULTISEND_CONTRACT);
      
      console.log("Current allowance (wei):", currentAllowance.toString());
      console.log("Needed allowance (wei):", totalAmountWei.toString());

      // Step 2: Approve if needed
      if (currentAllowance < totalAmountWei) {
        setBulkProgressText("Approving CAMLY for multi-send contract... ✍️");
        setBulkProgress(20);
        toast.info("Please approve CAMLY spending in MetaMask... 🦊");
        
        const approveTx = await camlyContract.approve(MULTISEND_CONTRACT, totalAmountWei);
        console.log("Approval TX sent:", approveTx.hash);
        
        toast.success("Approval sent! Waiting for confirmation... ⏳");
        await approveTx.wait();
        console.log("Approval confirmed!");
        toast.success("✅ CAMLY approved for ultra-low-gas airdrop!");
        setBulkProgress(40);
      } else {
        console.log("✅ Allowance already sufficient!");
        setBulkProgress(40);
      }

      // Step 3: Prepare arrays for scatterToken
      setBulkProgressText("Preparing batch transaction... 📦");
      const amounts = Array(addresses.length).fill(amountPerWalletWei);
      
      console.log("Recipients array:", addresses);
      console.log("Amounts array:", amounts.map(a => a.toString()));

      // Step 4: Execute multiSendToken (ONE transaction for ALL recipients!)
      setBulkProgressText(`Executing ultra-low-gas airdrop to ${addresses.length} wallets... 💎`);
      setBulkProgress(50);
      toast.info("Please confirm the batch airdrop in MetaMask... 🦊");

      const multisendContract = new ethers.Contract(MULTISEND_CONTRACT, MULTISEND_ABI, signer);
      
      console.log("🔍 DEBUG - Calling multiSendToken with:");
      console.log("- Token:", camlyToken.contract);
      console.log("- Recipients:", addresses);
      console.log("- Amounts:", amounts.map(a => a.toString()));
      
      toast.info("MetaMask tip: Set Gas Limit to 1M+ in popup for success! 💜");
      let txHash = "";
      try {
        const gasLimit = 1200000n;
        const multiSendTx = await multisendContract.multiSendToken(
          camlyToken.contract,
          addresses,
          amounts,
          { gasLimit }
        );
        
        console.log("✅ MultiSendToken TX sent:", multiSendTx.hash);
        txHash = multiSendTx.hash;
        toast.success("🚀 Airdrop transaction sent! Waiting for confirmation...");
        
        setBulkProgress(70);
        const receipt = await multiSendTx.wait();
        
        console.log("✅ MultiSendToken TX confirmed:", receipt.hash);
      } catch (contractError: any) {
        console.error("❌ Contract call error:", contractError);
        console.log("Error details:", {
          code: contractError.code,
          message: contractError.message,
          data: contractError.data
        });
        
        // Handle specific contract errors with detailed guidance
        if (contractError.code === "BUFFER_OVERRUN") {
          throw new Error("Contract call failed - invalid data format. Check console for debug info.");
        } else if (contractError.message?.includes("execution reverted")) {
          throw new Error("Transaction reverted! Edit gas in MetaMask >1M limit. ✓ Balance OK? ✓ Allowance set?");
        } else if (contractError.message?.includes("invalid address")) {
          throw new Error("Invalid wallet address detected. Please validate addresses first.");
        } else if (contractError.message?.includes("insufficient allowance")) {
          throw new Error("Insufficient allowance! Click APPROVE button first.");
        } else {
          throw contractError;
        }
      }
      setBulkProgress(100);

      // Record airdrop transaction in database
      const batchId = new Date().getTime();
      
      await supabase.from("wallet_transactions").insert({
        from_user_id: user?.id,
        amount: totalAmount,
        token_type: "CAMLY",
        status: "completed",
        transaction_hash: txHash || "completed",
        notes: `Ultra-Low-Gas Airdrop to ${addresses.length} recipients - ${amount} CAMLY each - Batch #${batchId}`
      });

      // Trigger 10-second celebration!
      setCelebrationAmount(totalAmount);
      setShowCelebration(true);

      toast.success(`🎉 FUN AND RICH!!! All ${addresses.length} airdrops successful in ONE transaction! 💰✨`);
      
      setBulkAddresses("");
      setValidAddresses([]);
      setInvalidAddresses([]);
      setShowValidation(false);
      setNeedsApproval(false);
      setApprovalComplete(false);
      await getCamlyBalance(account!);
      await fetchTransactionHistory();
    } catch (error: any) {
      console.error("Bulk send error:", error);
      
      if (error.code === 4001) {
        toast.error("❌ Transaction rejected by user");
      } else if (error.code === "BUFFER_OVERRUN") {
        toast.error("❌ Airdrop failed: Invalid contract data. Please verify addresses and try again!");
      } else if (error.message?.includes("insufficient allowance")) {
        toast.error("❌ Insufficient allowance! Please try again.");
      } else if (error.message?.includes("insufficient funds")) {
        toast.error("❌ Insufficient CAMLY balance!");
      } else {
        toast.error(`❌ Airdrop failed: ${error.message || "Invalid data. Please check addresses!"}`);
      }
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
    <div className="min-h-screen bg-white relative overflow-hidden pb-20">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-4xl relative z-10">
        {/* User Info & Navigation */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-6 space-y-4"
        >
          {/* User Profile Bar */}
          {user && (
            <div className="flex items-center justify-between bg-white/10 backdrop-blur-xl rounded-2xl p-3 border border-white/20">
              <div className="flex items-center gap-3">
                {user.user_metadata?.avatar_url ? (
                  <img 
                    src={user.user_metadata.avatar_url} 
                    alt="Profile" 
                    className="w-10 h-10 rounded-full border-2 border-white/30"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold">
                    {user.email?.[0].toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="text-foreground font-black text-sm">
                    Hi {user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0]} 👋
                  </p>
                  <p className="text-foreground/90 text-xs font-bold">{user.email}</p>
                </div>
              </div>
              <Button
                onClick={async () => {
                  await supabase.auth.signOut();
                  toast.success("Đã đăng xuất!");
                  navigate("/auth");
                }}
                variant="ghost"
                size="sm"
                className="text-foreground hover:text-foreground hover:bg-muted"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-center gap-3">
            {/* Back Button */}
            <motion.button
              onClick={() => navigate(-1)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-14 h-14 rounded-full font-bold flex items-center justify-center transition-all duration-300 shadow-2xl border-0"
              style={{
                background: 'linear-gradient(135deg, #8B46FF 0%, #00F2FF 100%)',
                boxShadow: '0 8px 32px rgba(0, 245, 255, 0.4), 0 4px 16px rgba(139, 70, 255, 0.3)',
              }}
            >
              <ArrowLeft className="w-6 h-6 text-white" />
            </motion.button>

            {/* Home Button */}
            <motion.button
              onClick={() => navigate("/")}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              className="flex-1 max-w-md h-14 rounded-[28px] font-bold flex items-center justify-center gap-3 transition-all duration-300 shadow-2xl border-0 text-white text-lg"
              style={{
                background: 'linear-gradient(135deg, #8B46FF 0%, #00F2FF 100%)',
                boxShadow: '0 8px 32px rgba(0, 245, 255, 0.4), 0 4px 16px rgba(139, 70, 255, 0.3)',
              }}
            >
              <Home className="w-7 h-7 text-white" />
              <span>Về Trang Chủ</span>
            </motion.button>
          </div>

          {/* Google Sign In Button (if not logged in) */}
          {!user && (
            <motion.button
              onClick={async () => {
                try {
                  const { error } = await supabase.auth.signInWithOAuth({
                    provider: "google",
                    options: {
                      redirectTo: `${window.location.origin}/wallet`,
                    },
                  });
                  if (error) throw error;
                } catch (error: any) {
                  console.error("Google auth error:", error);
                  toast.error("Không thể kết nối với Google. Vui lòng thử lại!");
                }
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              className="w-full max-w-md mx-auto h-14 rounded-xl font-bold flex items-center justify-center gap-3 transition-all duration-300 shadow-2xl border-0 gradient-animated text-white text-lg"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path
                  fill="#FFFFFF"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#FFFFFF"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FFFFFF"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#FFFFFF"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span>Sign in with Google</span>
            </motion.button>
          )}
        </motion.div>

        {!account ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12 sm:py-20 px-4"
          >
            <motion.div
              animate={{
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-32 h-32 sm:w-40 sm:h-40 mx-auto mb-6 sm:mb-8 rounded-full flex items-center justify-center shadow-2xl relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #9D00FF, #00FFFF, #0088FF)',
                boxShadow: '0 0 80px rgba(157,0,255,0.8)'
              }}
            >
              <Wallet className="w-16 h-16 sm:w-20 sm:h-20 text-white" />
            </motion.div>
            
            <h1 className="text-4xl sm:text-6xl font-black mb-3 sm:mb-4 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-400 bg-clip-text text-transparent leading-tight">
              FUN WALLET
            </h1>
            
            <p className="text-lg sm:text-2xl text-foreground mb-6 sm:mb-8 font-black px-2">
              Connect your MetaMask to start having FUN! 🚀
            </p>
            
            <Button
              onClick={connectWallet}
              className="text-xl sm:text-2xl font-black px-8 sm:px-12 py-6 sm:py-8 h-auto relative overflow-hidden group border-0 w-full sm:w-auto"
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
              className="mb-6 sm:mb-8"
            >
              <Card className="gradient-border rounded-2xl overflow-hidden relative bg-white backdrop-blur-sm shadow-2xl">
                <CardContent className="p-4 sm:p-6 md:p-8">
                  {/* Header with Network Selector */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                      >
                        <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-secondary" />
                      </motion.div>
                      <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-primary">
                        FUN WALLET
                      </h1>
                    </div>

                    {/* Network Selector */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="outline" 
                          className="font-bold text-base sm:text-lg px-4 sm:px-6 py-4 sm:py-6 h-auto w-full sm:w-auto"
                        >
                          <span className="text-xl sm:text-2xl mr-2">{selectedNetwork.icon}</span>
                          <span className="hidden sm:inline">{selectedNetwork.name}</span>
                          <span className="sm:hidden">{selectedNetwork.symbol}</span>
                          <ChevronDown className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent 
                        className="border border-border bg-card/95 backdrop-blur-lg z-[100] w-48 sm:w-auto"
                      >
                        {networks.map((network) => (
                          <DropdownMenuItem
                            key={network.id}
                            onClick={() => switchNetwork(network)}
                            className="px-3 sm:px-4 py-2 sm:py-3 cursor-pointer"
                          >
                            <span className="text-xl sm:text-2xl mr-2 sm:mr-3">{network.icon}</span>
                            <span className="font-bold text-base sm:text-lg">{network.name}</span>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Address */}
                  <div className="flex items-center justify-center gap-2 mb-3 sm:mb-4">
                    <p className="text-xs sm:text-sm text-muted-foreground font-mono">
                      {account.slice(0, 6)}...{account.slice(-4)}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={copyAddress}
                      className="h-7 w-7 sm:h-6 sm:w-6 p-0"
                    >
                      {copied ? (
                        <CheckCircle className="w-4 h-4 sm:w-4 sm:h-4 text-success" />
                      ) : (
                        <Copy className="w-4 h-4 sm:w-4 sm:h-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>

                  {/* QR Code Section */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex justify-center mb-4 sm:mb-6"
                  >
                    <div 
                      className="p-4 sm:p-6 rounded-2xl relative bg-white border-2 border-primary-light"
                    >
                      <QRCodeSVG
                        value={account}
                        size={window.innerWidth < 640 ? 140 : 180}
                        bgColor="#FFFFFF"
                        fgColor="#8B46FF"
                        level="H"
                        includeMargin={false}
                        className="rounded-xl relative z-10"
                      />
                      <div className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3 bg-gradient-to-br from-primary to-secondary rounded-full p-1.5 sm:p-2 shadow-lg">
                        <QrCode className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                    </div>
                  </motion.div>

                  <p className="text-center text-xs sm:text-sm text-foreground mb-3 sm:mb-4 font-black">
                    📱 Scan QR to receive tokens
                  </p>

                  {/* Balance */}
                  <div className="text-center mb-4 sm:mb-6">
                    <motion.div
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="text-5xl sm:text-6xl md:text-7xl font-black mb-2 text-foreground"
                    >
                      {balance}
                    </motion.div>
                    <p className="text-xl sm:text-2xl font-black text-foreground">
                      {selectedNetwork.symbol}
                    </p>
                    
                    {/* CAMLY Balance Highlight */}
                    <motion.div
                      animate={{ scale: [1, 1.03, 1] }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="mt-3 sm:mt-4 p-3 sm:p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 border-2 border-primary-light"
                    >
                      <div className="flex items-center justify-center gap-2 sm:gap-2">
                        <img 
                          src={processedCoinImage || camlyCoinPro} 
                          alt="CAMLY Coin" 
                          className="w-10 h-10 sm:w-12 sm:h-12 object-contain" 
                          style={{ 
                            filter: 'drop-shadow(0 0 20px rgba(255,215,0,0.9)) drop-shadow(0 0 40px rgba(255,165,0,0.6))',
                            animation: 'pulse 2s ease-in-out infinite'
                          }} 
                        />
                        <div>
                          <p className="text-[10px] sm:text-xs text-foreground font-black">CAMLY COIN</p>
                          <p className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                            {camlyBalance}
                          </p>
                        </div>
                        {tokens.find(t => t.symbol === "CAMLY")?.verified && (
                          <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-success" />
                        )}
                      </div>
                      <p className="text-[10px] sm:text-xs text-foreground font-bold mt-1 sm:mt-2">
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
              className="mb-4 sm:mb-6"
            >
              <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-3 sm:pb-4 px-1 sm:px-2 scrollbar-hide snap-x snap-mandatory">
                {tokens.map((token) => (
                  <motion.button
                    key={token.symbol}
                    onClick={() => {
                      setSelectedToken(token);
                      handleCoinChartToggle(token.symbol);
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`flex-shrink-0 px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl border-2 font-bold transition-all duration-300 snap-center min-w-[100px] sm:min-w-[120px] relative ${
                      selectedChartCoin === token.symbol
                        ? 'border-primary bg-gradient-to-br from-primary to-secondary text-white scale-105 shadow-[var(--shadow-button)] ring-4 ring-primary/30' 
                        : selectedToken.symbol === token.symbol 
                        ? 'border-primary/50 bg-gradient-to-br from-primary/20 to-secondary/20 text-foreground' 
                        : 'border-border bg-card/80 text-foreground opacity-70'
                    }`}
                  >
                    {selectedChartCoin === token.symbol && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"
                      />
                    )}
                    <motion.div
                      animate={selectedChartCoin === token.symbol ? { rotate: 360 } : {}}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="text-2xl sm:text-3xl mb-1 flex items-center justify-center"
                    >
                      {token.image ? (
                        <img 
                          src={token.symbol === "CAMLY" && processedCoinImage ? processedCoinImage : token.image} 
                          alt={token.symbol} 
                          className="w-10 h-10 sm:w-12 sm:h-12 object-contain" 
                          style={{ 
                            filter: 'drop-shadow(0 0 15px rgba(255,215,0,0.8)) drop-shadow(0 0 30px rgba(255,165,0,0.5))',
                            animation: selectedToken.symbol === token.symbol ? 'pulse 2s ease-in-out infinite' : 'none'
                          }} 
                        />
                      ) : (
                        token.emoji
                      )}
                    </motion.div>
                    <div className="font-black text-xs sm:text-sm">{token.symbol}</div>
                    <div className="text-[10px] sm:text-xs font-bold mt-0.5 opacity-90">
                      ${tokenPrices[token.symbol]?.toFixed(token.symbol === 'CAMLY' ? 6 : 2) || '0.00'}
                    </div>
                    {priceChanges[token.symbol] && Math.abs(priceChanges[token.symbol]) > 2 && (
                      <span className={`text-[9px] sm:text-[10px] font-bold mt-0.5 ${priceChanges[token.symbol] > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {priceChanges[token.symbol] > 0 ? '↑' : '↓'}
                        {Math.abs(priceChanges[token.symbol]).toFixed(1)}%
                      </span>
                    )}
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Price Chart Section */}
            <AnimatePresence>
              {selectedChartCoin && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="mb-4 sm:mb-6 overflow-hidden"
                >
                  <Card className="gradient-border rounded-2xl bg-white backdrop-blur-sm overflow-hidden shadow-2xl">
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                            className="w-10 h-10 sm:w-12 sm:h-12"
                          >
                            {tokens.find(t => t.symbol === selectedChartCoin)?.image ? (
                              <img 
                                src={selectedChartCoin === "CAMLY" && processedCoinImage ? processedCoinImage : tokens.find(t => t.symbol === selectedChartCoin)?.image} 
                                alt={selectedChartCoin} 
                                className="w-full h-full object-contain" 
                                style={{ 
                                  filter: 'drop-shadow(0 0 20px rgba(139, 70, 255, 0.8))',
                                  animation: 'pulse 2s ease-in-out infinite'
                                }} 
                              />
                            ) : (
                              <span className="text-3xl sm:text-4xl">{tokens.find(t => t.symbol === selectedChartCoin)?.emoji}</span>
                            )}
                          </motion.div>
                          <div>
                            <h3 className="text-lg sm:text-xl font-black text-foreground">
                              {tokens.find(t => t.symbol === selectedChartCoin)?.name} Chart
                            </h3>
                            <p className="text-xs sm:text-sm text-foreground font-black">
                              Price: ${tokenPrices[selectedChartCoin]?.toFixed(selectedChartCoin === 'CAMLY' ? 6 : 2) || "0.00"}
                            </p>
                          </div>
                        </div>
                        
                        {/* Timeframe Selector */}
                        <div className="flex gap-1 sm:gap-2 bg-background/50 rounded-lg p-1">
                          {(['1H', '4H', '1D', '1W', '1M'] as const).map((tf) => (
                            <motion.button
                              key={tf}
                              onClick={() => setChartTimeframe(tf)}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded text-[10px] sm:text-xs font-bold transition-all ${
                                chartTimeframe === tf
                                  ? 'bg-primary text-white shadow-md'
                                  : 'text-muted-foreground hover:text-foreground'
                              }`}
                            >
                              {tf}
                            </motion.button>
                          ))}
                        </div>
                      </div>

                      {/* Chart */}
                      {chartData.length > 0 ? (
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.2 }}
                          className="h-48 sm:h-64 w-full"
                        >
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                              <defs>
                                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                              <XAxis 
                                dataKey="time" 
                                stroke="hsl(var(--muted-foreground))" 
                                fontSize={10}
                                tickMargin={8}
                              />
                              <YAxis 
                                stroke="hsl(var(--muted-foreground))" 
                                fontSize={10}
                                tickFormatter={(value) => `$${value.toFixed(selectedChartCoin === 'CAMLY' ? 6 : 2)}`}
                                width={60}
                              />
                              <Tooltip 
                                contentStyle={{ 
                                  background: 'hsl(var(--card))', 
                                  border: '2px solid hsl(var(--primary))',
                                  borderRadius: '12px',
                                  padding: '12px',
                                  boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
                                }}
                                labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 'bold' }}
                                itemStyle={{ color: 'hsl(var(--primary))' }}
                                formatter={(value: any) => [`$${parseFloat(value).toFixed(selectedChartCoin === 'CAMLY' ? 6 : 2)}`, 'Price']}
                              />
                              <Line 
                                type="monotone" 
                                dataKey="price" 
                                stroke="hsl(var(--primary))" 
                                strokeWidth={3}
                                fill="url(#chartGradient)"
                                dot={false}
                                activeDot={{ r: 6, fill: 'hsl(var(--primary))', strokeWidth: 2, stroke: '#fff' }}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </motion.div>
                      ) : (
                        <div className="h-48 sm:h-64 flex items-center justify-center">
                          <p className="text-muted-foreground">Loading chart data...</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Selected Token Info Card */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="mb-4 sm:mb-6"
            >
              <Card className="gradient-border rounded-2xl bg-white backdrop-blur-sm overflow-hidden shadow-2xl">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center"
                      >
                        {selectedToken.image ? (
                          <img 
                            src={selectedToken.symbol === "CAMLY" && processedCoinImage ? processedCoinImage : selectedToken.image} 
                            alt={selectedToken.symbol} 
                            className="w-full h-full object-contain" 
                            style={{ 
                              filter: 'drop-shadow(0 0 25px rgba(255,215,0,0.9)) drop-shadow(0 0 50px rgba(255,165,0,0.6))',
                              animation: 'pulse 2s ease-in-out infinite'
                            }} 
                          />
                        ) : (
                          <span className="text-4xl sm:text-5xl">{selectedToken.emoji}</span>
                        )}
                      </motion.div>
                      <div>
                        <h3 className="text-xl sm:text-2xl font-black text-foreground mb-1">
                          {selectedToken.name}
                        </h3>
                        <p className="text-xs sm:text-sm text-foreground font-black">
                          {selectedToken.symbol}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <motion.div
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
                      >
                        {tokenBalances[selectedToken.symbol] || "0.00"}
                      </motion.div>
                      <p className="text-xs sm:text-sm font-black text-foreground mt-1">
                        ≈ ${(parseFloat(tokenBalances[selectedToken.symbol] || "0") * tokenPrices[selectedToken.symbol]).toFixed(2)} USD
                      </p>
                      <div className="flex items-center justify-end gap-2 mt-1">
                        <span className="text-xs sm:text-sm font-bold text-primary">
                          ${tokenPrices[selectedToken.symbol]?.toFixed(selectedToken.symbol === 'CAMLY' ? 6 : 2) || "0.00"}
                        </span>
                        {priceChanges[selectedToken.symbol] && Math.abs(priceChanges[selectedToken.symbol]) > 2 && (
                          <span className={`text-xs font-bold flex items-center gap-0.5 ${priceChanges[selectedToken.symbol] > 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {priceChanges[selectedToken.symbol] > 0 ? '↑' : '↓'}
                            {Math.abs(priceChanges[selectedToken.symbol]).toFixed(2)}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            
            {/* Tabs for Normal Send and Bulk Send */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-6 sm:mb-8"
            >
              <Tabs defaultValue="send" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-4 sm:mb-6 p-1.5 sm:p-2 bg-muted rounded-xl sm:rounded-2xl">
                  <TabsTrigger 
                    value="send"
                    className="font-black text-[11px] sm:text-base md:text-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-white rounded-lg sm:rounded-xl py-2.5 sm:py-2"
                  >
                    <Send className="w-3.5 h-3.5 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Normal Send</span>
                    <span className="sm:hidden">Send</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="bulk"
                    className="font-black text-[11px] sm:text-base md:text-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-white rounded-lg sm:rounded-xl py-2.5 sm:py-2"
                  >
                    <Zap className="w-3.5 h-3.5 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Bulk Airdrop</span>
                    <span className="sm:hidden">Bulk</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="history"
                    className="font-black text-[11px] sm:text-base md:text-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-white rounded-lg sm:rounded-xl py-2.5 sm:py-2"
                  >
                    <Sparkles className="w-3.5 h-3.5 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">History</span>
                    <span className="sm:hidden">History</span>
                  </TabsTrigger>
                </TabsList>

                {/* Normal Send Tab */}
                <TabsContent value="send">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    {/* Send Card */}
                    <Card className="gradient-border rounded-2xl bg-white backdrop-blur-sm shadow-2xl">
                      <CardHeader className="pb-3 sm:pb-6">
                        <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl text-primary">
                          <Send className="w-5 h-5 sm:w-6 sm:h-6" />
                          Send FUN
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3 sm:space-y-4">
                        <div>
                          <label className="text-xs sm:text-sm text-foreground mb-2 block font-black">Recipient Address</label>
                          <Input
                            type="text"
                            inputMode="text"
                            autoComplete="off"
                            autoCorrect="off"
                            spellCheck={false}
                            autoCapitalize="off"
                            value={sendTo}
                            onChange={(e) => setSendTo(e.target.value)}
                            onFocus={() => console.log("🔵 Focus recipient input")}
                            placeholder="0x..."
                            className="bg-background/50 border-input h-12 sm:h-10 text-base sm:text-sm px-4 sm:px-3 touch-manipulation"
                          />
                        </div>
                        <div>
                          <label className="text-base sm:text-lg text-primary mb-2 sm:mb-3 block font-black">
                            Amount ({selectedToken.symbol})
                          </label>
                          <Input
                            type="number"
                            value={sendAmount}
                            onChange={(e) => setSendAmount(e.target.value)}
                            placeholder="0.00"
                            className="border-2 border-primary/30 text-foreground placeholder:text-muted-foreground h-14 sm:h-12 text-xl sm:text-lg px-4 font-bold"
                            style={{
                              background: 'rgba(255,255,255,0.1)',
                              backdropFilter: 'blur(10px)',
                              boxShadow: `0 0 20px ${selectedNetwork.color}30, inset 0 0 0 1px ${selectedNetwork.color}40`
                            }}
                          />
                          {sendAmount && parseFloat(sendAmount) > 0 && (
                            <p className="text-xs sm:text-sm text-foreground mt-2 font-black">
                              ≈ ${(parseFloat(sendAmount) * (tokenPrices[selectedToken.symbol] || 0)).toFixed(2)} USD
                              <span className="ml-2 text-primary font-black">
                                @ ${tokenPrices[selectedToken.symbol]?.toFixed(selectedToken.symbol === 'CAMLY' ? 6 : 2)}
                              </span>
                            </p>
                          )}
                        </div>
                        <Button
                          onClick={handleSend}
                          disabled={sending}
                          className="w-full font-black text-lg sm:text-xl py-6 sm:py-6 h-auto border-0 relative overflow-hidden group"
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
                    <Card className="gradient-border rounded-2xl bg-white backdrop-blur-sm shadow-2xl relative overflow-hidden">
                      <CardHeader className="pb-3 sm:pb-6">
                        <CardTitle className="flex items-center gap-2 text-2xl sm:text-3xl">
                          <motion.div
                            animate={{ rotate: -360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                          >
                            <ArrowDownLeft className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                          </motion.div>
                          <span className="text-foreground font-black">
                            Receive
                          </span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4 sm:space-y-5">
                        <div className="p-5 sm:p-8 rounded-2xl text-center border-2 border-primary/40 bg-white/95" style={{
                          backdropFilter: 'blur(20px)',
                          boxShadow: '0 4px 20px rgba(139,70,255,0.3)'
                        }}>
                          <p className="text-xs sm:text-sm text-foreground mb-3 sm:mb-4 font-black uppercase tracking-wider">
                            💎 Your Wallet Address
                          </p>
                          <motion.p 
                            className="font-mono text-base sm:text-lg md:text-xl text-foreground break-all mb-5 sm:mb-6 leading-relaxed font-black"
                            animate={{ opacity: [0.8, 1, 0.8] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            style={{
                              letterSpacing: '0.5px'
                            }}
                          >
                            {account}
                          </motion.p>
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Button
                              onClick={copyAddress}
                              className="w-full font-black text-xl sm:text-2xl py-7 sm:py-8 h-auto border-0 relative overflow-hidden group"
                              style={{
                                background: 'linear-gradient(135deg, #00FFFF 0%, #0099FF 50%, #00FFFF 100%)',
                                backgroundSize: '200% auto',
                                boxShadow: '0 0 50px rgba(0,255,255,0.9), 0 0 30px rgba(0,153,255,0.6)'
                              }}
                            >
                              <motion.div
                                animate={{
                                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                                }}
                                transition={{ duration: 3, repeat: Infinity }}
                                className="absolute inset-0"
                                style={{
                                  background: 'linear-gradient(135deg, #00FFFF 0%, #0099FF 50%, #00FFFF 100%)',
                                  backgroundSize: '200% auto'
                                }}
                              />
                              <span className="relative z-10 flex items-center justify-center gap-3">
                                <Copy className="w-6 h-6 sm:w-7 sm:h-7" />
                                {copied ? "✨ COPIED! ✨" : "📋 COPY ADDRESS 🔥"}
                              </span>
                            </Button>
                          </motion.div>
                        </div>

                        <div className="text-center">
                          <Button
                            onClick={() => {
                              setCelebrationAmount(0.042);
                              setShowCelebration(true);
                            }}
                            variant="outline"
                            className="text-sm sm:text-base border-2 border-primary/50 text-foreground hover:bg-primary/20 h-10 sm:h-12 font-black px-6"
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
                  <Card className="gradient-border rounded-2xl bg-white backdrop-blur-sm shadow-2xl relative overflow-hidden">
                    <CardHeader className="pb-3 sm:pb-6">
                      <CardTitle className="flex items-center gap-2 sm:gap-3 text-xl sm:text-2xl md:text-3xl">
                        <motion.div
                          animate={{ rotate: [0, 360] }}
                          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        >
                          <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-400" />
                        </motion.div>
                        <span className="text-foreground font-black leading-tight">
                          LAUNCH AIRDROP CAMLY 👑
                        </span>
                      </CardTitle>
                      <p className="text-foreground text-xs sm:text-sm mt-2 font-black">
                        Send CAMLY tokens to multiple addresses at once! Perfect for rewarding your community ✨
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-4 sm:space-y-6">
                      <div>
                        <label className="text-foreground font-black mb-2 sm:mb-3 block flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-sm sm:text-base">
                          <span>📝 Wallet Addresses</span>
                          <span className="text-[10px] sm:text-xs text-foreground/60">(one per line, max 1000)</span>
                        </label>
                        <Textarea
                          value={bulkAddresses}
                          onChange={(e) => {
                            setBulkAddresses(e.target.value);
                            setShowValidation(false); // Reset validation on change
                            setNeedsApproval(false);
                            setApprovalComplete(false);
                          }}
                          onFocus={() => console.log("🔵 Focus bulk addresses textarea")}
                          placeholder={`0x1234...\n0x5678...\n0x9abc...`}
                          rows={6}
                          className="border-0 text-foreground placeholder:text-foreground/30 font-mono text-xs sm:text-sm px-4 sm:px-3 py-3 sm:py-2 touch-manipulation bg-white"
                          style={{
                            backdropFilter: 'blur(10px)',
                            boxShadow: 'inset 0 0 0 2px rgba(224,170,255,0.3)'
                          }}
                        />
                        
                        {/* Validate Button */}
                        <Button
                          onClick={validateAddresses}
                          disabled={!bulkAddresses.trim()}
                          className="mt-3 font-bold border-0 w-full sm:w-auto py-5 sm:py-2 h-auto sm:h-10 text-base sm:text-sm"
                          style={{
                            background: 'linear-gradient(135deg, #00FFFF 0%, #0088FF 100%)',
                            boxShadow: '0 0 20px rgba(0,255,255,0.5)'
                          }}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          VALIDATE ADDRESSES
                        </Button>
                        
                        {/* Validation Results */}
                        {showValidation && (
                          <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="mt-4 p-4 rounded-xl"
                            style={{
                              background: validAddresses.length > 0 && invalidAddresses.length === 0
                                ? 'rgba(0,255,0,0.1)'
                                : 'rgba(255,0,0,0.1)',
                              border: validAddresses.length > 0 && invalidAddresses.length === 0
                                ? '2px solid rgba(0,255,0,0.5)'
                                : '2px solid rgba(255,0,0,0.5)',
                            }}
                          >
                            <div className="space-y-2">
                              {validAddresses.length > 0 && (
                                <p className="text-green-400 font-bold">
                                  ✅ Valid: {validAddresses.length} address(es)
                                </p>
                              )}
                              {invalidAddresses.length > 0 && (
                                <div>
                                  <p className="text-red-400 font-bold mb-2">
                                    ❌ Invalid: {invalidAddresses.length} address(es)
                                  </p>
                                  <div className="text-xs text-red-300 max-h-32 overflow-y-auto space-y-1">
                                    {invalidAddresses.map((addr, idx) => (
                                      <div key={idx} className="font-mono bg-red-900/20 p-1 rounded">
                                        {addr || "(empty line)"}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </div>

                      <div>
                        <label className="text-foreground font-black mb-2 sm:mb-3 block text-sm sm:text-base">
                          💎 Amount of CAMLY per Address
                        </label>
                        <Input
                          type="number"
                          value={bulkAmount}
                          onChange={(e) => {
                            setBulkAmount(e.target.value);
                            setNeedsApproval(false);
                            setApprovalComplete(false);
                          }}
                          placeholder="1000"
                          className="border-0 text-foreground text-xl sm:text-2xl font-black placeholder:text-foreground/30 h-14 sm:h-12 px-4 sm:px-3 bg-white"
                          style={{
                            backdropFilter: 'blur(10px)',
                            boxShadow: 'inset 0 0 0 2px rgba(224,170,255,0.3)'
                          }}
                        />
                      </div>

                      {bulkAddresses && bulkAmount && (
                        <motion.div
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="p-4 sm:p-6 rounded-xl sm:rounded-2xl"
                          style={{
                            background: 'linear-gradient(135deg, rgba(255,215,0,0.2), rgba(255,105,180,0.2))',
                            backdropFilter: 'blur(10px)',
                            border: '2px solid rgba(255,215,0,0.5)',
                            boxShadow: '0 0 40px rgba(255,215,0,0.3)'
                          }}
                        >
                          <h3 className="text-lg sm:text-xl font-black text-foreground mb-2 sm:mb-3">📊 Airdrop Summary</h3>
                          <div className="space-y-1.5 sm:space-y-2 text-foreground text-sm sm:text-base">
                            <p>🎯 Recipients: <span className="font-black text-foreground">
                              {showValidation && validAddresses.length > 0 
                                ? `${validAddresses.length} (validated)` 
                                : bulkAddresses.split('\n').filter(a => a.trim()).length}
                            </span></p>
                            <p>💰 Amount per address: <span className="font-black text-foreground">{bulkAmount} CAMLY</span></p>
                            <p className="text-xl sm:text-2xl">🚀 Total needed: <span className="font-black text-foreground">
                              {showValidation && validAddresses.length > 0 
                                ? `${validAddresses.length} × ${bulkAmount} CAMLY`
                                : `${bulkAddresses.split('\n').filter(a => a.trim()).length} × ${bulkAmount} CAMLY`}
                            </span></p>
                          </div>
                        </motion.div>
                      )}

                      {bulkSending && bulkProgress > 0 && (
                        <motion.div
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="space-y-2 sm:space-y-3"
                        >
                          <p className="text-foreground font-black text-lg sm:text-xl text-center">
                            ✨ {bulkProgressText || `Airdropping... ${bulkProgress}%`}
                          </p>
                          <Progress value={bulkProgress} className="h-5 sm:h-6" style={{
                            background: 'rgba(255,255,255,0.2)',
                          }} />
                          <p className="text-foreground text-center text-xl sm:text-2xl font-black animate-pulse">
                            {bulkProgress}% Complete
                          </p>
                        </motion.div>
                      )}

                      {/* Approve Button */}
                      {showValidation && validAddresses.length > 0 && needsApproval && (
                        <motion.div
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                        >
                          <Button
                            onClick={handleApprove}
                            disabled={approving}
                            className="w-full font-black text-lg sm:text-xl md:text-2xl py-6 sm:py-7 md:py-8 mb-4 border-0 relative overflow-hidden h-auto"
                            style={{
                              background: 'linear-gradient(135deg, #9D00FF 0%, #FF1493 50%, #00FFFF 100%)',
                              backgroundSize: '200% auto',
                              boxShadow: '0 0 60px rgba(157,0,255,0.8), 0 0 100px rgba(255,20,147,0.5)'
                            }}
                          >
                            <motion.div
                              animate={{
                                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                              }}
                              transition={{ duration: 3, repeat: Infinity }}
                              className="absolute inset-0"
                              style={{
                                background: 'linear-gradient(135deg, #9D00FF 0%, #FF1493 50%, #00FFFF 100%)',
                                backgroundSize: '200% auto'
                              }}
                            />
                            <span className="relative z-10 flex items-center justify-center gap-2 sm:gap-3">
                              {approving ? (
                                <>
                                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                                    🔓
                                  </motion.div>
                                  <span>APPROVING...</span>
                                </>
                              ) : (
                                <>
                                  <span>🔓 APPROVE CAMLY FOR AIRDROP 🔓</span>
                                </>
                              )}
                            </span>
                          </Button>
                        </motion.div>
                      )}

                      {/* Success Message after Approval */}
                      {showValidation && approvalComplete && !needsApproval && (
                        <motion.div
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="p-3 sm:p-4 rounded-xl mb-3 sm:mb-4"
                          style={{
                            background: 'rgba(0,255,0,0.2)',
                            border: '2px solid rgba(0,255,0,0.6)',
                            boxShadow: '0 0 30px rgba(0,255,0,0.4)'
                          }}
                        >
                          <p className="text-green-400 font-black text-lg sm:text-xl text-center">
                            ✅ Approved! Ready to FUN AND RICH! 💰✨
                          </p>
                        </motion.div>
                      )}

                      <Button
                        onClick={handleBulkSendClick}
                        disabled={bulkSending || !bulkAddresses || !bulkAmount || (showValidation && validAddresses.length === 0) || (showValidation && needsApproval)}
                        className="w-full font-black text-lg sm:text-xl md:text-2xl py-6 sm:py-7 md:py-8 border-0 relative overflow-hidden group h-auto"
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
                        <span className="relative z-10 flex items-center justify-center gap-2 sm:gap-3">
                          {bulkSending ? (
                            <>
                              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                                🚀
                              </motion.div>
                              <span className="text-base sm:text-xl md:text-2xl">SENDING AIRDROP...</span>
                            </>
                          ) : (showValidation && needsApproval) ? (
                            <>
                              <span className="text-base sm:text-xl md:text-2xl">🔒 APPROVE FIRST TO UNLOCK 🔒</span>
                            </>
                          ) : (
                            <>
                              <span className="text-base sm:text-xl md:text-2xl">🎁 SEND TO ALL 🎁</span>
                            </>
                          )}
                        </span>
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Transaction History Tab */}
                <TabsContent value="history">
                  <Card className="gradient-border rounded-2xl bg-white backdrop-blur-sm shadow-2xl relative overflow-hidden">
                    <CardHeader className="pb-3 sm:pb-6">
                      <CardTitle className="flex items-center gap-2 sm:gap-3 text-xl sm:text-2xl md:text-3xl">
                        <motion.div
                          animate={{ rotate: [0, 360] }}
                          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        >
                          <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-cyan-400" />
                        </motion.div>
                        <span className="text-foreground font-black leading-tight">
                          TRANSACTION HISTORY 📜
                        </span>
                      </CardTitle>
                      <p className="text-foreground text-xs sm:text-sm mt-2 font-bold">
                        View all your past transactions, airdrops, and token transfers ✨
                      </p>
                    </CardHeader>
                    <CardContent className="px-3 sm:px-6">
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
        estimatedGas={estimatedGas}
        gasPrice={currentGasPrice}
      />

      <AnimatePresence>
        {showCelebration && (
          <CelebrationNotification
            amount={celebrationAmount}
            token={celebrationToken}
            tokenImage={
              celebrationToken === "CAMLY" 
                ? (processedCoinImage || camlyCoinPro)
                : tokens.find(t => t.symbol === celebrationToken)?.image
            }
            onComplete={() => setShowCelebration(false)}
            duration={celebrationToken === "CAMLY" && celebrationAmount > 1000 ? 25000 : 15000}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showRichNotification && (
          <RichNotification
            amount={richAmount}
            token={richToken}
            tokenImage={richTokenImage}
            onComplete={() => setShowRichNotification(false)}
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