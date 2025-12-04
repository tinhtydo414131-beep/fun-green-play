import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Smile, X } from "lucide-react";

const POPULAR_EMOJIS = [
  "😀", "😂", "🥰", "😍", "🤩", "😎", "🥳", "😇",
  "🤗", "🤔", "😮", "😢", "😭", "😤", "🤯", "🥺",
  "👍", "👎", "👏", "🙌", "🤝", "💪", "🎉", "🎊",
  "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "💗",
  "🔥", "⭐", "✨", "💫", "🌟", "💯", "🎮", "🎯",
  "🏆", "🥇", "🎁", "💰", "💎", "🚀", "🌈", "☀️"
];

const REACTION_EMOJIS = ["❤️", "😂", "😮", "😢", "👍", "🔥"];

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  variant?: "full" | "reactions";
}

export function EmojiPicker({ 
  onEmojiSelect, 
  isOpen, 
  onOpenChange,
  variant = "full" 
}: EmojiPickerProps) {
  const emojis = variant === "reactions" ? REACTION_EMOJIS : POPULAR_EMOJIS;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 10 }}
          className={`absolute ${variant === "reactions" ? "bottom-full mb-2" : "bottom-full mb-2 left-0"} z-50`}
        >
          <div className={`bg-background border-2 border-primary/20 rounded-xl shadow-xl p-3 ${
            variant === "reactions" ? "w-auto" : "w-72"
          }`}>
            {variant === "full" && (
              <div className="flex items-center justify-between mb-2 pb-2 border-b border-primary/10">
                <span className="text-sm font-fredoka font-bold text-muted-foreground">
                  Pick an emoji 😊
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => onOpenChange(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
            <div className={`grid ${variant === "reactions" ? "grid-cols-6" : "grid-cols-8"} gap-1`}>
              {emojis.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => {
                    onEmojiSelect(emoji);
                    if (variant === "full") onOpenChange(false);
                  }}
                  className="w-8 h-8 flex items-center justify-center text-lg hover:bg-primary/10 rounded-lg transition-all hover:scale-110 active:scale-95"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface MessageReactionsProps {
  reactions: { emoji: string; count: number; hasReacted: boolean }[];
  onReact: (emoji: string) => void;
}

export function MessageReactions({ reactions, onReact }: MessageReactionsProps) {
  if (reactions.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {reactions.map((reaction) => (
        <button
          key={reaction.emoji}
          onClick={() => onReact(reaction.emoji)}
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-all ${
            reaction.hasReacted
              ? "bg-primary/20 border border-primary/40"
              : "bg-muted hover:bg-muted/80 border border-transparent"
          }`}
        >
          <span>{reaction.emoji}</span>
          <span className="font-medium">{reaction.count}</span>
        </button>
      ))}
    </div>
  );
}

interface AddReactionButtonProps {
  onReact: (emoji: string) => void;
}

export function AddReactionButton({ onReact }: AddReactionButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="opacity-0 group-hover:opacity-100 p-1 rounded-full hover:bg-muted transition-all"
      >
        <Smile className="w-4 h-4 text-muted-foreground" />
      </button>
      <EmojiPicker
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        onEmojiSelect={(emoji) => {
          onReact(emoji);
          setIsOpen(false);
        }}
        variant="reactions"
      />
    </div>
  );
}
