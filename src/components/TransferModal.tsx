import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, Send, Copy, Check, Wallet, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface TransferModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipientAddress: string;
  recipientUsername: string;
}

export function TransferModal({ open, onOpenChange, recipientAddress, recipientUsername }: TransferModalProps) {
  const [amount, setAmount] = useState("");
  const [tokenType, setTokenType] = useState("CAMLY");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [camlyBalance, setCamlyBalance] = useState<number>(0);
  const [loadingBalance, setLoadingBalance] = useState(true);
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    const fetchBalance = async () => {
      setLoadingBalance(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("web3_rewards")
          .select("camly_balance")
          .eq("user_id", user.id)
          .maybeSingle();
        setCamlyBalance(data?.camly_balance || 0);
      }
      setLoadingBalance(false);
    };
    if (open) fetchBalance();
  }, [open]);

  const copyAddress = () => {
    navigator.clipboard.writeText(recipientAddress);
    setCopied(true);
    toast.success("Address copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const parsedAmount = parseFloat(amount) || 0;
  const insufficientBalance = tokenType === "CAMLY" && parsedAmount > camlyBalance;

  const handleConfirmTransfer = () => {
    if (!amount || parsedAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    if (insufficientBalance) {
      toast.error("Insufficient CAMLY balance");
      return;
    }
    setShowConfirmation(true);
  };

  const handleTransfer = async () => {
    setShowConfirmation(false);
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in to transfer");
        return;
      }

      // Get recipient user_id from wallet address
      const { data: recipientProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("wallet_address", recipientAddress)
        .single();

      if (!recipientProfile) {
        toast.error("Recipient not found");
        return;
      }

      // Create transaction record
      const { error } = await supabase
        .from("wallet_transactions")
        .insert({
          from_user_id: user.id,
          to_user_id: recipientProfile.id,
          amount: parseFloat(amount),
          token_type: tokenType,
          status: "pending",
          notes: notes || null,
        });

      if (error) throw error;

      toast.success(
        <div className="flex items-center gap-2">
          <Send className="w-4 h-4" />
          <span>Transfer initiated successfully!</span>
        </div>
      );
      
      setAmount("");
      setNotes("");
      onOpenChange(false);
    } catch (error: any) {
      console.error("Transfer error:", error);
      toast.error(error.message || "Failed to process transfer");
    } finally {
      setLoading(false);
    }
  };

  const shortenAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="w-5 h-5 text-primary" />
            Send Tokens
          </DialogTitle>
          <DialogDescription>
            Transfer tokens to {recipientUsername}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Recipient Info */}
          <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
            <Avatar className="w-10 h-10">
              <AvatarFallback className="bg-primary/10 text-primary font-bold">
                {recipientUsername.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-semibold">{recipientUsername}</p>
              <div className="flex items-center gap-1">
                <p className="text-xs text-muted-foreground font-mono">
                  {shortenAddress(recipientAddress)}
                </p>
                <Button
                  size="sm"
                  variant="ghost"
                  className={`h-5 w-5 p-0 transition-colors ${copied ? 'text-green-500' : ''}`}
                  onClick={copyAddress}
                >
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                </Button>
              </div>
            </div>
          </div>

          {/* Your Balance */}
          <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg border border-primary/20">
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Your CAMLY Balance</span>
            </div>
            <span className="font-bold text-primary">
              {loadingBalance ? "..." : camlyBalance.toLocaleString()} 🪙
            </span>
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <div className="flex gap-2">
              <Input
                id="amount"
                type="number"
                step="0.000001"
                min="0"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={loading}
                className={insufficientBalance ? "border-destructive focus-visible:ring-destructive" : ""}
              />
              {tokenType === "CAMLY" && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setAmount(camlyBalance.toString())}
                  disabled={loading || loadingBalance || camlyBalance <= 0}
                  className="shrink-0"
                >
                  Max
                </Button>
              )}
            </div>
            {insufficientBalance && (
              <p className="text-xs text-destructive">
                Insufficient balance. You have {camlyBalance.toLocaleString()} CAMLY
              </p>
            )}
          </div>

          {/* Token Type */}
          <div className="space-y-2">
            <Label htmlFor="token">Token</Label>
            <Select value={tokenType} onValueChange={setTokenType} disabled={loading}>
              <SelectTrigger id="token">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CAMLY">🪙 CAMLY</SelectItem>
                <SelectItem value="ETH">ETH</SelectItem>
                <SelectItem value="USDT">USDT</SelectItem>
                <SelectItem value="BNB">BNB</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Input
              id="notes"
              placeholder="Add a message..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={loading}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmTransfer}
            disabled={loading || !amount || insufficientBalance}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send {amount && `${amount} ${tokenType}`}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Confirm Transfer
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>Are you sure you want to send this transfer?</p>
                <div className="bg-muted p-3 rounded-lg space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount:</span>
                    <span className="font-semibold">{amount} {tokenType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">To:</span>
                    <span className="font-semibold">{recipientUsername}</span>
                  </div>
                  {notes && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Note:</span>
                      <span className="font-semibold truncate max-w-[150px]">{notes}</span>
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  This action cannot be undone.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleTransfer}>
              Confirm Send
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}
