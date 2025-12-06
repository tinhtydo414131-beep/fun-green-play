import React from 'react';
import { Lock, Star, Trophy } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface NexusLevelMapProps {
  highestUnlocked: number;
  totalScore: number;
  onSelectLevel: (level: number) => void;
  onBack?: () => void;
}

const MAX_LEVEL = 10;
const POINTS_PER_LEVEL = 600;

export const NexusLevelMap: React.FC<NexusLevelMapProps> = ({
  highestUnlocked,
  totalScore,
  onSelectLevel,
  onBack
}) => {
  const getTargetScore = (lvl: number) => lvl * POINTS_PER_LEVEL;
  
  const levels = Array.from({ length: MAX_LEVEL }, (_, i) => i + 1);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 p-4">
      <div className="max-w-5xl mx-auto">
        {/* Level Grid */}
        <div className="bg-gradient-to-br from-orange-100/80 to-white dark:from-gray-800 dark:to-gray-900 rounded-2xl border-2 border-orange-200 dark:border-orange-800 p-4 md:p-6">
          <ScrollArea className="h-[500px] md:h-[550px]">
            <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2 md:gap-3 p-2">
              {levels.map((level) => {
                const isUnlocked = level <= highestUnlocked;
                const isCompleted = level < highestUnlocked;
                const targetScore = getTargetScore(level);
                
                return (
                  <button
                    key={level}
                    onClick={() => isUnlocked && onSelectLevel(level)}
                    disabled={!isUnlocked}
                    className={cn(
                      "relative aspect-square rounded-xl font-inter transition-all duration-200 flex flex-col items-center justify-center gap-0.5",
                      "border-2 shadow-md hover:shadow-lg",
                      isUnlocked ? "cursor-pointer hover:scale-105 active:scale-95" : "cursor-not-allowed",
                      isCompleted 
                        ? "bg-gradient-to-br from-green-400 to-emerald-500 border-green-300 text-white" 
                        : isUnlocked 
                          ? "bg-gradient-to-br from-orange-400 via-orange-500 to-blue-500 border-blue-400 text-white shadow-lg ring-2 ring-blue-400/50"
                          : "bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-400"
                    )}
                  >
                    {isCompleted && (
                      <Star className="absolute -top-1 -right-1 w-4 h-4 text-yellow-300 fill-yellow-300" />
                    )}
                    
                    {!isUnlocked ? (
                      <Lock className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                    ) : (
                      <>
                        <span className="text-sm md:text-lg font-bold">{level}</span>
                        <span className="text-[8px] md:text-[10px] opacity-80">{targetScore}pts</span>
                      </>
                    )}
                    
                    {level === MAX_LEVEL && isUnlocked && (
                      <Trophy className="absolute -top-1 -right-1 w-4 h-4 text-yellow-400" />
                    )}
                  </button>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};

export default NexusLevelMap;
