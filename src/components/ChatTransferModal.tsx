import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Send, Coins, AlertCircle, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useWeb3Rewards } from "@/hooks/useWeb3Rewards";
import { useAuth } from "@/hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

interface ChatTransferModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipientId: string;
  recipientUsername: string;
  recipientAvatar: string | null;
  onTransferComplete?: (amount: number) => void;
}

export function ChatTransferModal({
  open,
  onOpenChange,
  recipientId,
  recipientUsername,
  recipientAvatar,
  onTransferComplete,
}: ChatTransferModalProps) {
  const { user } = useAuth();
  const { camlyBalance } = useWeb3Rewards();
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"input" | "confirm" | "success">("input");

  const handleSubmit = () => {
    const amountNum = parseFloat(amount);
    if (!amountNum || amountNum <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    if (amountNum > camlyBalance) {
      toast.error("Insufficient balance");
      return;
    }
    setStep("confirm");
  };

  const handleConfirmTransfer = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const amountNum = parseFloat(amount);

      // Get current balances
      const { data: senderRewards } = await supabase
        .from("web3_rewards")
        .select("camly_balance")
        .eq("user_id", user.id)
        .single();

      const { data: recipientRewards } = await supabase
        .from("web3_rewards")
        .select("camly_balance")
        .eq("user_id", recipientId)
        .maybeSingle();

      if ((senderRewards?.camly_balance || 0) < amountNum) {
        toast.error("Insufficient balance");
        return;
      }

      // Update sender balance
      await supabase
        .from("web3_rewards")
        .update({
          camly_balance: (senderRewards?.camly_balance || 0) - amountNum,
        })
        .eq("user_id", user.id);

      // Update recipient balance (upsert in case they don't have a record)
      if (recipientRewards) {
        await supabase
          .from("web3_rewards")
          .update({
            camly_balance: (recipientRewards.camly_balance || 0) + amountNum,
          })
          .eq("user_id", recipientId);
      } else {
        await supabase.from("web3_rewards").insert({
          user_id: recipientId,
          camly_balance: amountNum,
        });
      }

      // Record transactions for both users
      await supabase.from("web3_reward_transactions").insert([
        {
          user_id: user.id,
          amount: -amountNum,
          reward_type: "p2p_transfer_out",
          description: `Sent ${amountNum.toLocaleString()} CAMLY to ${recipientUsername}`,
        },
        {
          user_id: recipientId,
          amount: amountNum,
          reward_type: "p2p_transfer_in",
          description: `Received ${amountNum.toLocaleString()} CAMLY from friend`,
        },
      ]);

      // Create wallet transaction record
      await supabase.from("wallet_transactions").insert({
        from_user_id: user.id,
        to_user_id: recipientId,
        amount: amountNum,
        token_type: "CAMLY",
        transaction_type: "p2p_transfer",
        status: "completed",
        notes: notes || null,
      });

      // Trigger confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });

      // Play success sound
      const audio = new Audio("/audio/coin-reward.mp3");
      audio.volume = 0.4;
      audio.play().catch(() => {});

      setStep("success");
      onTransferComplete?.(amountNum);
    } catch (error: any) {
      console.error("Transfer error:", error);
      toast.error(error.message || "Failed to process transfer");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep("input");
    setAmount("");
    setNotes("");
    onOpenChange(false);
  };

  const quickAmounts = [1000, 5000, 10000, 50000];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <AnimatePresence mode="wait">
          {step === "input" && (
            <motion.div
              key="input"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Coins className="w-5 h-5 text-yellow-500" />
                  Send CAMLY
                </DialogTitle>
                <DialogDescription>
                  Transfer CAMLY coins to {recipientUsername}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                {/* Recipient Info */}
                <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg border border-primary/20">
                  <Avatar className="w-12 h-12 border-2 border-primary/30">
                    <AvatarImage src={recipientAvatar || undefined} />
                    <AvatarFallback className="bg-primary/20 text-primary font-bold">
                      {recipientUsername[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-fredoka font-bold">{recipientUsername}</p>
                    <p className="text-xs text-muted-foreground">Recipient</p>
                  </div>
                </div>

                {/* Your balance */}
                <div className="text-sm text-muted-foreground flex items-center justify-between p-2 bg-muted rounded-lg">
                  <span>Your Balance:</span>
                  <span className="font-bold text-yellow-500">
                    {camlyBalance.toLocaleString()} CAMLY
                  </span>
                </div>

                {/* Quick amounts */}
                <div className="space-y-2">
                  <Label>Quick Select</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {quickAmounts.map((amt) => (
                      <Button
                        key={amt}
                        variant={amount === String(amt) ? "default" : "outline"}
                        size="sm"
                        onClick={() => setAmount(String(amt))}
                        disabled={amt > camlyBalance}
                        className="text-xs"
                      >
                        {amt >= 1000 ? `${amt / 1000}K` : amt}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Amount Input */}
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <div className="relative">
                    <Coins className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-yellow-500" />
                    <Input
                      id="amount"
                      type="number"
                      min="1"
                      max={camlyBalance}
                      placeholder="Enter amount"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes">Message (Optional)</Label>
                  <Input
                    id="notes"
                    placeholder="Add a note..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    maxLength={100}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!amount || parseFloat(amount) <= 0}
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
                >
                  Continue
                </Button>
              </DialogFooter>
            </motion.div>
          )}

          {step === "confirm" && (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-yellow-500">
                  <AlertCircle className="w-5 h-5" />
                  Confirm Transfer
                </DialogTitle>
              </DialogHeader>

              <div className="py-6 text-center space-y-4">
                <div className="p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-xl border border-yellow-500/30">
                  <p className="text-4xl font-fredoka font-bold text-yellow-500">
                    {parseFloat(amount).toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">CAMLY Coins</p>
                </div>

                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <span>to</span>
                  <Avatar className="w-8 h-8 border-2 border-primary/30">
                    <AvatarImage src={recipientAvatar || undefined} />
                    <AvatarFallback className="bg-primary/20 text-primary font-bold text-sm">
                      {recipientUsername[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-bold">{recipientUsername}</span>
                </div>

                {notes && (
                  <p className="text-sm italic text-muted-foreground">"{notes}"</p>
                )}
              </div>

              <DialogFooter className="gap-2">
                <Button
                  variant="outline"
                  onClick={() => setStep("input")}
                  disabled={loading}
                >
                  Back
                </Button>
                <Button
                  onClick={handleConfirmTransfer}
                  disabled={loading}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Confirm & Send
                    </>
                  )}
                </Button>
              </DialogFooter>
            </motion.div>
          )}

          {step === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="py-8 text-center space-y-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", damping: 10 }}
                  className="w-20 h-20 mx-auto bg-green-500/20 rounded-full flex items-center justify-center"
                >
                  <CheckCircle className="w-12 h-12 text-green-500" />
                </motion.div>

                <h3 className="text-2xl font-fredoka font-bold text-green-500">
                  Transfer Successful! 🎉
                </h3>

                <p className="text-muted-foreground">
                  You sent <span className="font-bold text-yellow-500">{parseFloat(amount).toLocaleString()} CAMLY</span> to {recipientUsername}
                </p>

                <Button onClick={handleClose} className="mt-4">
                  Done
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
