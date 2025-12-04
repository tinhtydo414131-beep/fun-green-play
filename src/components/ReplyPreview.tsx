import { X, Reply } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ReplyPreviewProps {
  message: {
    id: string;
    message: string;
    senderName?: string;
  };
  onCancel: () => void;
}

export function ReplyPreview({ message, onCancel }: ReplyPreviewProps) {
  const truncatedMessage = message.message.length > 60 
    ? message.message.slice(0, 60) + "..." 
    : message.message;

  return (
    <div className="flex items-center gap-2 p-2 bg-primary/10 rounded-lg border-l-4 border-primary">
      <Reply className="w-4 h-4 text-primary flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-primary">
          Replying to {message.senderName || "message"}
        </p>
        <p className="text-xs text-muted-foreground truncate">
          {truncatedMessage}
        </p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 flex-shrink-0"
        onClick={onCancel}
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
  );
}

interface QuotedMessageProps {
  message: string;
  senderName?: string;
  isOwn?: boolean;
  onClick?: () => void;
}

export function QuotedMessage({ message, senderName, isOwn, onClick }: QuotedMessageProps) {
  const truncatedMessage = message.length > 80 
    ? message.slice(0, 80) + "..." 
    : message;

  return (
    <div 
      className={`mb-2 p-2 rounded-lg cursor-pointer border-l-2 ${
        isOwn 
          ? "bg-white/10 border-white/50" 
          : "bg-primary/10 border-primary"
      }`}
      onClick={onClick}
    >
      <p className={`text-[10px] font-semibold ${isOwn ? "text-white/80" : "text-primary"}`}>
        {senderName || "Message"}
      </p>
      <p className={`text-xs ${isOwn ? "text-white/70" : "text-muted-foreground"}`}>
        {truncatedMessage}
      </p>
    </div>
  );
}