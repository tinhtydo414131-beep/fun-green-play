import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Wallet, Send, Copy, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { ethers } from "ethers";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { CamlyCoinReward } from "./CamlyCoinReward";

declare global {
  interface Window {
    ethereum?: any;
  }
}

export const WalletConnect = () => {
  const { user } = useAuth();
  const [account, setAccount] = useState<string | null>(null);
  const [balance, setBalance] = useState<string>("0");
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [sending, setSending] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showReward, setShowReward] = useState(false);
  const [rewardAmount, setRewardAmount] = useState(0);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          getBalance(accounts[0]);
          updateProfileWallet(accounts[0]);
        }
      } catch (error) {
        console.error("Error checking connection:", error);
      }
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      toast.error("Please install MetaMask to connect your wallet! 🦊");
      return;
    }

    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      setAccount(accounts[0]);
      getBalance(accounts[0]);
      updateProfileWallet(accounts[0]);
      toast.success("Wallet connected! 🎉");
    } catch (error: any) {
      console.error("Error connecting wallet:", error);
      toast.error("Couldn't connect wallet 😢");
    }
  };

  const getBalance = async (address: string) => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const balanceWei = await provider.getBalance(address);
      const balanceEth = ethers.formatEther(balanceWei);
      setBalance(parseFloat(balanceEth).toFixed(4));
    } catch (error) {
      console.error("Error getting balance:", error);
    }
  };

  const updateProfileWallet = async (address: string) => {
    if (!user) return;

    try {
      // Check if this is first time connecting wallet
      const { data: profile } = await supabase
        .from("profiles")
        .select("wallet_address, wallet_balance")
        .eq("id", user.id)
        .single();

      // Check if user already received wallet connection bonus
      const { data: existingBonus } = await supabase
        .from("camly_coin_transactions")
        .select("id")
        .eq("user_id", user.id)
        .eq("transaction_type", "wallet_connection")
        .single();

      const isFirstConnection = !profile?.wallet_address && !existingBonus;

      // Update wallet address and add bonus if first time
      const updates: any = { wallet_address: address };
      
      if (isFirstConnection) {
        updates.wallet_balance = (profile?.wallet_balance || 0) + 50000;
        setRewardAmount(50000);
        setShowReward(true);
        
        // Log transaction
        await supabase.from("camly_coin_transactions").insert({
          user_id: user.id,
          amount: 50000,
          transaction_type: "wallet_connection",
          description: "First wallet connection bonus"
        });
      }

      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id);

      if (error) throw error;
    } catch (error) {
      console.error("Error updating wallet:", error);
    }
  };

  const sendTransaction = async () => {
    if (!account || !recipient || !amount) {
      toast.error("Please fill in all fields!");
      return;
    }

    if (!ethers.isAddress(recipient)) {
      toast.error("Invalid recipient address!");
      return;
    }

    setSending(true);

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const tx = await signer.sendTransaction({
        to: recipient,
        value: ethers.parseEther(amount),
      });

      toast.success("Transaction sent! Waiting for confirmation... ⏳");

      await tx.wait();

      // Record transaction in database
      await supabase.from("wallet_transactions").insert({
        from_user_id: user?.id,
        amount: parseFloat(amount),
        token_type: "ETH",
        transaction_hash: tx.hash,
        status: "completed",
      });

      toast.success("Transaction confirmed! 🎉");
      setRecipient("");
      setAmount("");
      getBalance(account);
    } catch (error: any) {
      console.error("Error sending transaction:", error);
      toast.error("Transaction failed! 😢");
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
    toast.success("Wallet disconnected! 👋");
  };

  return (
    <>
      {showReward && (
        <CamlyCoinReward
          amount={rewardAmount}
          message="Welcome bonus for connecting your wallet!"
          onComplete={() => setShowReward(false)}
        />
      )}
      
      <Card className="border-4 border-accent/30 shadow-xl bg-gradient-to-br from-background to-accent/5">
      <CardHeader>
        <CardTitle className="text-3xl font-fredoka flex items-center gap-3">
          <Wallet className="w-8 h-8 text-accent" />
          Crypto Wallet 💰
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {!account ? (
          <div className="text-center space-y-4 py-8">
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-accent to-secondary rounded-full flex items-center justify-center shadow-lg">
              <Wallet className="w-12 h-12 text-white" />
            </div>
            <p className="font-comic text-lg text-muted-foreground">
              Connect your wallet to start earning and sending crypto! 🚀
            </p>
            <Button
              onClick={connectWallet}
              size="lg"
              className="font-fredoka font-bold text-xl px-12 py-8 bg-gradient-to-r from-accent to-secondary hover:shadow-xl transform hover:scale-110 transition-all"
            >
              Connect MetaMask 🦊
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Wallet Info */}
            <div className="p-6 bg-gradient-to-r from-accent/10 to-secondary/10 rounded-2xl border-2 border-accent/30 space-y-4">
              <div>
                <p className="text-sm font-comic text-muted-foreground mb-2">Your Address</p>
                <div className="flex items-center gap-2">
                  <p className="flex-1 font-mono text-sm bg-background/50 p-3 rounded-lg truncate">
                    {account}
                  </p>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={copyAddress}
                    className="border-2 border-accent/30 hover:border-accent"
                  >
                    {copied ? (
                      <CheckCircle className="w-4 h-4 text-accent" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div>
                <p className="text-sm font-comic text-muted-foreground mb-2">Balance</p>
                <p className="text-4xl font-fredoka font-bold text-accent">
                  {balance} ETH
                </p>
              </div>
            </div>

            {/* Send Transaction */}
            <div className="space-y-4">
              <h4 className="text-xl font-fredoka font-bold text-foreground flex items-center gap-2">
                <Send className="w-5 h-5 text-accent" />
                Send Crypto
              </h4>

              <div className="space-y-3">
                <div>
                  <label className="text-sm font-comic text-muted-foreground mb-2 block">
                    Recipient Address
                  </label>
                  <Input
                    placeholder="0x..."
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    className="font-mono border-2 border-accent/30 focus:border-accent"
                  />
                </div>

                <div>
                  <label className="text-sm font-comic text-muted-foreground mb-2 block">
                    Amount (ETH)
                  </label>
                  <Input
                    type="number"
                    step="0.0001"
                    placeholder="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="border-2 border-accent/30 focus:border-accent"
                  />
                </div>

                <Button
                  onClick={sendTransaction}
                  disabled={sending || !recipient || !amount}
                  className="w-full font-fredoka font-bold bg-gradient-to-r from-accent to-secondary hover:shadow-lg"
                >
                  {sending ? "Sending... ⏳" : "Send Transaction 🚀"}
                </Button>
              </div>
            </div>

            <Button
              onClick={disconnectWallet}
              variant="outline"
              className="w-full font-fredoka font-bold border-2 border-destructive/30 hover:border-destructive hover:bg-destructive/10 text-destructive"
            >
              Disconnect Wallet
            </Button>
          </div>
        )}

        <div className="p-4 bg-muted/30 rounded-xl">
          <p className="text-sm font-comic text-muted-foreground text-center">
            ⚠️ This is a real wallet connection. Only send crypto to trusted addresses!
          </p>
        </div>
      </CardContent>
    </Card>
    </>
  );
};
