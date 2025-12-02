import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2, User, Wallet } from "lucide-react";
import { toast } from "sonner";
import { ethers } from "ethers";
import { supabase } from "@/integrations/supabase/client";
import confetti from "canvas-confetti";

interface P2PTransferProps {
  account: string;
  userId: string;
  camlyBalance: string;
  onTransferComplete: () => void;
}

const CAMLY_CONTRACT = "0x0910320181889fefde0bb1ca63962b0a8882e413";
const CAMLY_DECIMALS = 3;

const ERC20_ABI = [
  "function transfer(address to, uint256 amount) returns (bool)",
  "function balanceOf(address account) view returns (uint256)",
  "function decimals() view returns (uint8)"
];

export function P2PTransfer({ account, userId, camlyBalance, onTransferComplete }: P2PTransferProps) {
  const [recipientInput, setRecipientInput] = useState("");
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [sending, setSending] = useState(false);
  const [validatingRecipient, setValidatingRecipient] = useState(false);
  const [recipientInfo, setRecipientInfo] = useState<{
    address: string;
    username?: string;
    userId?: string;
  } | null>(null);

  const validateRecipient = async () => {
    if (!recipientInput.trim()) {
      toast.error("Please enter a wallet address or username");
      return;
    }

    setValidatingRecipient(true);
    try {
      // Check if input is a valid Ethereum address
      const isAddress = /^0x[a-fA-F0-9]{40}$/.test(recipientInput);
      
      if (isAddress) {
        // Look up profile by wallet address
        const { data: profile } = await supabase
          .from("profiles")
          .select("id, username, wallet_address")
          .eq("wallet_address", recipientInput.toLowerCase())
          .maybeSingle();

        if (profile) {
          setRecipientInfo({
            address: recipientInput.toLowerCase(),
            username: profile.username,
            userId: profile.id
          });
          toast.success(`✓ Found user: ${profile.username}`);
        } else {
          setRecipientInfo({
            address: recipientInput.toLowerCase()
          });
          toast.success("✓ Valid wallet address (external user)");
        }
      } else {
        // Look up profile by username
        const { data: profile } = await supabase
          .from("profiles")
          .select("id, username, wallet_address")
          .ilike("username", recipientInput.trim())
          .maybeSingle();

        if (profile && profile.wallet_address) {
          setRecipientInfo({
            address: profile.wallet_address,
            username: profile.username,
            userId: profile.id
          });
          toast.success(`✓ Found user: ${profile.username}`);
        } else if (profile && !profile.wallet_address) {
          toast.error("This user hasn't connected their wallet yet");
          setRecipientInfo(null);
        } else {
          toast.error("Username not found. Try using wallet address instead.");
          setRecipientInfo(null);
        }
      }
    } catch (error) {
      console.error("Error validating recipient:", error);
      toast.error("Failed to validate recipient");
      setRecipientInfo(null);
    } finally {
      setValidatingRecipient(false);
    }
  };

  const handleSend = async () => {
    if (!recipientInfo) {
      toast.error("Please validate recipient first");
      return;
    }

    const sendAmount = parseFloat(amount);
    if (isNaN(sendAmount) || sendAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    const currentBalance = parseFloat(camlyBalance);
    if (sendAmount > currentBalance) {
      toast.error(`Insufficient balance! You have ${camlyBalance} CAMLY`);
      return;
    }

    setSending(true);

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CAMLY_CONTRACT, ERC20_ABI, signer);

      const amountWei = ethers.parseUnits(amount, CAMLY_DECIMALS);
      
      console.log("🚀 Sending CAMLY:", {
        to: recipientInfo.address,
        amount: amount,
        amountWei: amountWei.toString()
      });

      toast.info("Please confirm transaction in MetaMask... 🦊");
      
      const tx = await contract.transfer(recipientInfo.address, amountWei);
      console.log("✅ Transaction sent:", tx.hash);
      
      toast.success("Transaction sent! Waiting for confirmation... ⏳");
      
      const receipt = await tx.wait();
      console.log("✅ Transaction confirmed:", receipt.hash);

      // Record transaction in database
      const { error: insertError } = await supabase.from("wallet_transactions").insert({
        from_user_id: userId,
        to_user_id: recipientInfo.userId || null,
        amount: sendAmount,
        token_type: "CAMLY",
        transaction_type: "transfer",
        status: "completed",
        transaction_hash: tx.hash,
        notes: notes || `Transfer to ${recipientInfo.username || recipientInfo.address}`
      });

      if (insertError) {
        console.error("Error recording transaction:", insertError);
      }

      // Success celebration
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#22c55e', '#4ade80', '#86efac']
      });

      toast.success(`🎉 Successfully sent ${amount} CAMLY!`);
      
      // Reset form
      setRecipientInput("");
      setAmount("");
      setNotes("");
      setRecipientInfo(null);
      
      // Refresh balances
      onTransferComplete();
      
    } catch (error: any) {
      console.error("Transfer error:", error);
      
      if (error.code === 4001) {
        toast.error("❌ Transaction rejected by user");
      } else if (error.message?.includes("insufficient funds")) {
        toast.error("❌ Insufficient CAMLY balance!");
      } else {
        toast.error(`❌ Transfer failed: ${error.message || "Unknown error"}`);
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="w-5 h-5" />
          Send CAMLY to Friend
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Recipient Input */}
        <div className="space-y-2">
          <Label>Recipient (Wallet Address or Username)</Label>
          <div className="flex gap-2">
            <Input
              value={recipientInput}
              onChange={(e) => {
                setRecipientInput(e.target.value);
                setRecipientInfo(null);
              }}
              placeholder="0x... or @username"
              disabled={sending}
            />
            <Button
              onClick={validateRecipient}
              disabled={!recipientInput.trim() || validatingRecipient || sending}
              variant="outline"
            >
              {validatingRecipient ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Validate"
              )}
            </Button>
          </div>
          {recipientInfo && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800"
            >
              {recipientInfo.username ? (
                <>
                  <User className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-700 dark:text-green-300">
                    Sending to <strong>{recipientInfo.username}</strong>
                  </span>
                </>
              ) : (
                <>
                  <Wallet className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-700 dark:text-green-300">
                    External wallet validated ✓
                  </span>
                </>
              )}
            </motion.div>
          )}
        </div>

        {/* Amount Input */}
        <div className="space-y-2">
          <Label>Amount (CAMLY)</Label>
          <div className="space-y-1">
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              disabled={!recipientInfo || sending}
              step="0.001"
              min="0"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Balance: {camlyBalance} CAMLY</span>
              <Button
                variant="link"
                size="sm"
                className="h-auto p-0 text-xs"
                onClick={() => setAmount(camlyBalance)}
                disabled={!recipientInfo || sending}
              >
                Max
              </Button>
            </div>
          </div>
        </div>

        {/* Notes (Optional) */}
        <div className="space-y-2">
          <Label>Notes (Optional)</Label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add a message..."
            disabled={!recipientInfo || sending}
            rows={2}
          />
        </div>

        {/* Send Button */}
        <Button
          onClick={handleSend}
          disabled={!recipientInfo || !amount || sending || parseFloat(amount) <= 0}
          className="w-full"
          size="lg"
        >
          {sending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Send CAMLY
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
