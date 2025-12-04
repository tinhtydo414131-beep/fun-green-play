import { Check, CheckCheck } from "lucide-react";
import { motion } from "framer-motion";

interface ReadReceiptProps {
  isRead: boolean;
  isSent: boolean;
}

export function ReadReceipt({ isRead, isSent }: ReadReceiptProps) {
  if (!isSent) return null;

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      className="inline-flex items-center ml-1"
    >
      {isRead ? (
        <CheckCheck className="w-3.5 h-3.5 text-blue-400" />
      ) : (
        <Check className="w-3.5 h-3.5 text-muted-foreground" />
      )}
    </motion.span>
  );
}
