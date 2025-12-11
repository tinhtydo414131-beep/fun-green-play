import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gamepad2, Plus, GripVertical } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useDraggable } from "@/hooks/useDraggable";

export const UploadGameFAB = () => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  
  const { position, isDragging, handleMouseDown, style } = useDraggable({
    storageKey: "upload_fab_position",
    defaultPosition: { x: 0, y: 0 },
  });

  return (
    <div 
      className="fixed bottom-20 md:bottom-6 right-4 z-50 select-none"
      style={style}
    >
      <div className="relative group">
        {/* Drag handle */}
        <div
          onMouseDown={handleMouseDown}
          onTouchStart={handleMouseDown}
          className={`absolute -top-2 -left-2 w-6 h-6 rounded-full bg-orange-600/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 ${isDragging ? 'opacity-100' : ''}`}
          title="Drag to move"
        >
          <GripVertical className="w-3 h-3 text-white" />
        </div>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.button
            onClick={() => navigate("/upload-game")}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="relative w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 via-orange-400 to-yellow-400 shadow-lg shadow-orange-500/50 flex items-center justify-center overflow-hidden group"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            animate={{
              rotate: isHovered ? 0 : [0, -5, 5, -5, 5, 0],
            }}
            transition={{
              rotate: {
                duration: 0.5,
                repeat: isHovered ? 0 : Infinity,
                repeatDelay: 3,
              },
            }}
          >
            {/* Glow effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-orange-300 to-yellow-200 opacity-0 group-hover:opacity-50 transition-opacity"
              animate={{
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
            />
            
            {/* Sparkle particles */}
            <AnimatePresence>
              {isHovered && (
                <>
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-1.5 h-1.5 bg-yellow-200 rounded-full"
                      initial={{ 
                        x: 0, 
                        y: 0, 
                        opacity: 1,
                        scale: 0 
                      }}
                      animate={{ 
                        x: (Math.random() - 0.5) * 60,
                        y: (Math.random() - 0.5) * 60,
                        opacity: 0,
                        scale: 1
                      }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.6, delay: i * 0.1 }}
                    />
                  ))}
                </>
              )}
            </AnimatePresence>

            {/* Icon */}
            <div className="relative flex items-center justify-center">
              <Gamepad2 className="w-7 h-7 text-white drop-shadow-md" />
              <motion.div
                className="absolute -top-1 -right-1"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <Plus className="w-4 h-4 text-white font-bold" strokeWidth={3} />
              </motion.div>
            </div>

            {/* Ring animation */}
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-white/50"
              animate={{
                scale: [1, 1.3],
                opacity: [0.5, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
              }}
            />
          </motion.button>
        </TooltipTrigger>
        <TooltipContent 
          side="left" 
          className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white border-none font-bold px-4 py-2 max-w-[200px] text-center"
        >
          <p className="text-sm">🎮 Create a new game</p>
          <p className="text-xs mt-1">Get 500K CAMLY! 💰</p>
        </TooltipContent>
      </Tooltip>
      </div>
    </div>
  );
};
