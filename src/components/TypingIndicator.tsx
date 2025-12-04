import { motion } from "framer-motion";
import { usePerformanceMode } from "@/hooks/usePerformanceMode";

interface TypingIndicatorProps {
  typingUsers: { id: string; username: string }[];
}

export function TypingIndicator({ typingUsers }: TypingIndicatorProps) {
  const { shouldReduceAnimations } = usePerformanceMode();
  
  if (typingUsers.length === 0) return null;

  const text = typingUsers.length === 1
    ? `${typingUsers[0].username} is typing`
    : typingUsers.length === 2
    ? `${typingUsers[0].username} and ${typingUsers[1].username} are typing`
    : `${typingUsers.length} people are typing`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: shouldReduceAnimations ? 0.1 : 0.2 }}
      className="flex items-center gap-2 px-3 sm:px-4 py-2"
    >
      <div className="flex items-center gap-1 typing-indicator">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary rounded-full"
            style={{
              animation: shouldReduceAnimations 
                ? 'none' 
                : `typing-bounce 1.4s ease-in-out ${i * 0.2}s infinite`,
              opacity: shouldReduceAnimations ? 0.6 : 1,
            }}
          />
        ))}
      </div>
      <span className="text-xs text-muted-foreground italic">{text}...</span>
    </motion.div>
  );
}

