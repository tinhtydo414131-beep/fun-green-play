import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Gem, Trash2, Loader2, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface GameDeleteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason: string, detail: string) => void;
  isDeleting: boolean;
  gameTitle: string;
}

const DELETE_REASONS = [
  { id: "outdated", label: "🕹️ Game đã cũ, muốn tạo phiên bản mới", emoji: "🕹️" },
  { id: "bugs", label: "🐛 Game có nhiều lỗi chưa sửa được", emoji: "🐛" },
  { id: "boring", label: "😴 Game không còn thú vị nữa", emoji: "😴" },
  { id: "new_idea", label: "💡 Có ý tưởng mới hay hơn", emoji: "💡" },
  { id: "cleanup", label: "🧹 Dọn dẹp kho game cho gọn", emoji: "🧹" },
];

export default function GameDeleteModal({
  open,
  onOpenChange,
  onConfirm,
  isDeleting,
  gameTitle,
}: GameDeleteModalProps) {
  const [selectedReason, setSelectedReason] = useState("");
  const [additionalDetail, setAdditionalDetail] = useState("");

  const handleConfirm = () => {
    if (!selectedReason) return;
    onConfirm(selectedReason, additionalDetail);
  };

  const handleClose = () => {
    if (!isDeleting) {
      setSelectedReason("");
      setAdditionalDetail("");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md border-2 border-amber-400/30 bg-gradient-to-br from-background via-amber-950/10 to-background">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Gem className="w-6 h-6 text-amber-400" />
            Quản lý Kho Báu
          </DialogTitle>
          <DialogDescription className="text-base">
            Bạn muốn đưa <span className="font-semibold text-foreground">"{gameTitle}"</span> vào thùng rác?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Vì sao bạn muốn xóa game này?
            </Label>
            <RadioGroup value={selectedReason} onValueChange={setSelectedReason} className="space-y-2">
              {DELETE_REASONS.map((reason) => (
                <motion.div
                  key={reason.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Label
                    htmlFor={reason.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedReason === reason.id
                        ? "border-amber-400 bg-amber-400/10"
                        : "border-border hover:border-amber-400/50"
                    }`}
                  >
                    <RadioGroupItem value={reason.id} id={reason.id} className="sr-only" />
                    <span className="text-xl">{reason.emoji}</span>
                    <span className="text-sm">{reason.label.slice(3)}</span>
                  </Label>
                </motion.div>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Thêm ghi chú (tùy chọn)</Label>
            <Textarea
              placeholder="Viết thêm điều gì đó nếu bạn muốn..."
              value={additionalDetail}
              onChange={(e) => setAdditionalDetail(e.target.value)}
              className="resize-none h-20 border-amber-400/30 focus:border-amber-400"
            />
          </div>

          <div className="p-3 rounded-lg bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-400/30">
            <p className="text-sm text-center">
              📦 Game sẽ được lưu trong <span className="font-bold text-amber-400">Thùng rác 30 ngày</span>
              <br />
              <span className="text-muted-foreground">Bạn có thể khôi phục bất cứ lúc nào!</span>
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleClose}
            className="flex-1"
            disabled={isDeleting}
          >
            Hủy
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedReason || isDeleting}
            className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Đang xóa...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Đưa vào Thùng rác
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
