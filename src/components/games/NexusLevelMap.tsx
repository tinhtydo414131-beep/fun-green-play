import React from 'react';
import { Lock, Star, Trophy, Gamepad2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface NexusLevelMapProps {
  highestUnlocked: number;
  totalScore: number;
  onSelectLevel: (level: number) => void;
  onBack?: () => void;
}

const MAX_LEVEL = 100;
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
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            onClick={onBack}
            variant="outline"
            className="bg-gradient-to-r from-purple-400 to-pink-400 text-white border-0 hover:from-purple-500 hover:to-pink-500"
          >
            ← Back to Games
          </Button>
          
          <div className="flex items-center gap-2 bg-muted/50 px-4 py-2 rounded-full">
            <span className="text-sm text-muted-foreground">Auto</span>
            <div className="w-12 h-6 bg-muted rounded-full" />
          </div>
        </div>

        {/* Game Title */}
        <div className="text-center mb-8 p-6 bg-gradient-to-r from-orange-100/50 to-purple-100/50 dark:from-orange-900/20 dark:to-purple-900/20 rounded-2xl border-2 border-primary/20">
          <div className="flex items-center justify-center gap-3 mb-2">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-500 via-red-500 to-purple-600 bg-clip-text text-transparent">
              2048 Nexus
            </h1>
            <Gamepad2 className="w-10 h-10 text-gray-800 dark:text-gray-200" />
          </div>
          <p className="text-muted-foreground mb-2">Trò chơi 2048 với Web3 và Camly coin</p>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <span className="w-5 h-5 rounded-full bg-gradient-to-r from-orange-400 to-red-500" />
            <span>{totalScore} lượt chơi</span>
          </div>
        </div>

        {/* Back Button */}
        <Button
          onClick={onBack}
          variant="outline"
          size="sm"
          className="mb-4 bg-gradient-to-r from-purple-300 to-purple-400 text-white border-0 hover:from-purple-400 hover:to-purple-500"
        >
          ← Back
        </Button>

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
