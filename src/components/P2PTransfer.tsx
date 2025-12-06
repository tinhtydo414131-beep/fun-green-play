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
    recipientUserId?: string;
  } | null>(null);

  const validateRecipient = async () => {
    if (!recipientInput.trim()) {
      toast.error("Vui lòng nhập địa chỉ ví hoặc username");
      return;
    }

    setValidatingRecipient(true);
    try {
      const isAddress = /^0x[a-fA-F0-9]{40}$/.test(recipientInput.trim());
      
      // Sử dụng security definer function để tìm user
      const { data: userResult, error } = await supabase
        .rpc('find_user_for_transfer', { p_search_input: recipientInput.trim() });

      if (error) {
        console.error("Error finding user:", error);
        
        // Nếu là địa chỉ ví hợp lệ, vẫn cho phép gửi
        if (isAddress) {
          setRecipientInfo({
            address: recipientInput.trim().toLowerCase()
          });
          toast.success("✓ Địa chỉ ví hợp lệ (external wallet)");
        } else {
          toast.error("Không tìm thấy user. Thử dùng địa chỉ ví.");
          setRecipientInfo(null);
        }
        return;
      }

      const foundUser = userResult?.[0];

      if (foundUser && foundUser.wallet_address) {
        // Tìm thấy user có ví
        setRecipientInfo({
          address: foundUser.wallet_address.toLowerCase(),
          username: foundUser.username,
          recipientUserId: foundUser.user_id
        });
        toast.success(`✓ Đã tìm thấy: ${foundUser.username}`);
      } else if (foundUser && !foundUser.wallet_address) {
        // User chưa kết nối ví
        toast.error("User này chưa kết nối ví!");
        setRecipientInfo(null);
      } else if (isAddress) {
        // Không tìm thấy user nhưng là địa chỉ hợp lệ
        setRecipientInfo({
          address: recipientInput.trim().toLowerCase()
        });
        toast.success("✓ Địa chỉ ví hợp lệ (external wallet)");
      } else {
        toast.error("Không tìm thấy username. Thử dùng địa chỉ ví.");
        setRecipientInfo(null);
      }
    } catch (error) {
      console.error("Error validating recipient:", error);
      toast.error("Lỗi khi xác thực người nhận");
      setRecipientInfo(null);
    } finally {
      setValidatingRecipient(false);
    }
  };

  const handleSend = async () => {
    if (!recipientInfo) {
      toast.error("Vui lòng xác thực người nhận trước");
      return;
    }

    const sendAmount = parseFloat(amount);
    if (isNaN(sendAmount) || sendAmount <= 0) {
      toast.error("Vui lòng nhập số tiền hợp lệ");
      return;
    }

    const currentBalance = parseFloat(camlyBalance);
    if (sendAmount > currentBalance) {
      toast.error(`Số dư không đủ! Bạn có ${camlyBalance} CAMLY`);
      return;
    }

    // Không cho gửi cho chính mình
    if (recipientInfo.address.toLowerCase() === account.toLowerCase()) {
      toast.error("Không thể gửi cho chính mình!");
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

      toast.info("Vui lòng xác nhận giao dịch trong MetaMask... 🦊");
      
      const tx = await contract.transfer(recipientInfo.address, amountWei);
      console.log("✅ Transaction sent:", tx.hash);
      
      toast.success("Giao dịch đã gửi! Đang chờ xác nhận... ⏳");
      
      const receipt = await tx.wait();
      console.log("✅ Transaction confirmed:", receipt.hash);

      // Ghi lại giao dịch vào database
      try {
        const { error: insertError } = await supabase.from("wallet_transactions").insert({
          from_user_id: userId,
          to_user_id: recipientInfo.recipientUserId || null,
          amount: sendAmount,
          token_type: "CAMLY",
          transaction_type: "transfer",
          status: "completed",
          transaction_hash: tx.hash,
          notes: notes || `Gửi đến ${recipientInfo.username || recipientInfo.address.slice(0, 10)}...`
        });

        if (insertError) {
          console.error("Error recording transaction:", insertError);
          // Không throw error vì giao dịch blockchain đã thành công
        }
      } catch (dbError) {
        console.error("Database error:", dbError);
      }

      // Celebration
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#22c55e', '#4ade80', '#86efac']
      });

      toast.success(`🎉 Đã gửi thành công ${amount} CAMLY!`);
      
      // Reset form
      setRecipientInput("");
      setAmount("");
      setNotes("");
      setRecipientInfo(null);
      
      // Refresh balances
      onTransferComplete();
      
    } catch (error: any) {
      console.error("Transfer error:", error);
      
      if (error.code === 4001 || error.code === "ACTION_REJECTED") {
        toast.error("❌ Giao dịch bị từ chối");
      } else if (error.message?.includes("insufficient funds")) {
        toast.error("❌ Số dư CAMLY không đủ!");
      } else if (error.message?.includes("gas")) {
        toast.error("❌ Không đủ BNB để trả phí gas!");
      } else {
        toast.error(`❌ Gửi thất bại: ${error.shortMessage || error.message || "Lỗi không xác định"}`);
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
                    Gửi đến <strong>{recipientInfo.username}</strong>
                  </span>
                </>
              ) : (
                <>
                  <Wallet className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-700 dark:text-green-300">
                    Ví ngoài đã xác thực ✓
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
            maxLength={200}
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
              Đang gửi...
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
