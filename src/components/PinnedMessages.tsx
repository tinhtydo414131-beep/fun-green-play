import { Pin, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PinnedMessage {
  id: string;
  message: string;
  senderName?: string;
  pinnedAt?: string;
}

interface PinnedMessagesBarProps {
  messages: PinnedMessage[];
  onUnpin: (messageId: string) => void;
  onScrollTo: (messageId: string) => void;
  canUnpin: boolean;
}

export function PinnedMessagesBar({ messages, onUnpin, onScrollTo, canUnpin }: PinnedMessagesBarProps) {
  if (messages.length === 0) return null;

  return (
    <div className="border-b bg-primary/5 p-2">
      <div className="flex items-center gap-2 mb-1">
        <Pin className="w-4 h-4 text-primary" />
        <span className="text-xs font-semibold text-primary">
          {messages.length} Pinned Message{messages.length > 1 ? "s" : ""}
        </span>
      </div>
      <ScrollArea className="max-h-24">
        <div className="space-y-1">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className="flex items-center gap-2 p-2 bg-background/50 rounded-lg cursor-pointer hover:bg-background/80 transition-colors group"
              onClick={() => onScrollTo(msg.id)}
            >
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-semibold text-muted-foreground">
                  {msg.senderName || "Message"}
                </p>
                <p className="text-xs truncate">
                  {msg.message.length > 50 ? msg.message.slice(0, 50) + "..." : msg.message}
                </p>
              </div>
              {canUnpin && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    onUnpin(msg.id);
                  }}
                >
                  <X className="w-3 h-3" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}