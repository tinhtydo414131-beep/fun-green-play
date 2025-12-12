import React from 'react';
import { motion } from 'framer-motion';
import { X, Gift, CheckCircle, Circle } from 'lucide-react';
import { useHarvestHavenStore } from '@/stores/harvestHavenStore';
import { DAILY_QUESTS, ACHIEVEMENTS } from '@/data/harvestHavenData';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

interface DailyQuestsPanelProps {
  onClose: () => void;
}

export const DailyQuestsPanel: React.FC<DailyQuestsPanelProps> = ({ onClose }) => {
  const { 
    totalHarvested, 
    totalProduced, 
    completedOrders, 
    totalEarned,
    placedBuildings,
    addCoins,
    addGems,
    addXP,
    dailyQuests,
  } = useHarvestHavenStore();
  
  // Calculate quest progress
  const getQuestProgress = (questId: string) => {
    switch (questId) {
      case 'harvest_10':
        return { current: totalHarvested % 10, target: 10 };
      case 'collect_5_eggs':
        return { current: totalProduced % 5, target: 5 };
      case 'complete_3_orders':
        return { current: completedOrders % 3, target: 3 };
      case 'build_2_buildings':
        return { current: placedBuildings.length % 2, target: 2 };
      case 'earn_500_coins':
        return { current: Math.min(totalEarned % 500, 500), target: 500 };
      default:
        return { current: 0, target: 1 };
    }
  };
  
  const handleClaimQuest = (questId: string) => {
    const quest = DAILY_QUESTS.find((q) => q.id === questId);
    if (!quest) return;
    
    const progress = getQuestProgress(questId);
    if (progress.current < progress.target) {
      toast.error('Quest not completed yet!');
      return;
    }
    
    // Award rewards
    addCoins(quest.reward.coins);
    addXP(quest.reward.xp);
    if ('gems' in quest.reward && quest.reward.gems) {
      addGems(quest.reward.gems);
    }
    
    toast.success(`Quest completed! +${quest.reward.coins} coins, +${quest.reward.xp} XP!`);
  };
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 50 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-4 text-white">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <span className="text-2xl">📋</span>
              Daily Quests
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-sm opacity-80 mt-1">Complete quests to earn rewards!</p>
        </div>
        
        {/* Quests List */}
        <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
          {DAILY_QUESTS.map((quest, index) => {
            const progress = getQuestProgress(quest.id);
            const isComplete = progress.current >= progress.target;
            
            return (
              <motion.div
                key={quest.id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-xl border-2 ${
                  isComplete 
                    ? 'border-green-400 bg-green-50' 
                    : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-full ${isComplete ? 'bg-green-400' : 'bg-gray-200'}`}>
                    {isComplete ? (
                      <CheckCircle className="w-5 h-5 text-white" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800">{quest.description}</h3>
                    
                    {/* Progress Bar */}
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Progress</span>
                        <span>{progress.current}/{progress.target}</span>
                      </div>
                      <Progress 
                        value={(progress.current / progress.target) * 100} 
                        className="h-2"
                      />
                    </div>
                    
                    {/* Rewards */}
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs font-medium text-amber-600 bg-amber-100 px-2 py-0.5 rounded">
                        💰 {quest.reward.coins}
                      </span>
                      <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-0.5 rounded">
                        ⭐ {quest.reward.xp} XP
                      </span>
                      {'gems' in quest.reward && quest.reward.gems && (
                        <span className="text-xs font-medium text-purple-600 bg-purple-100 px-2 py-0.5 rounded">
                          💎 {quest.reward.gems}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Claim Button */}
                  {isComplete && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleClaimQuest(quest.id)}
                      className="px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full text-sm font-bold shadow-lg"
                    >
                      <Gift className="w-4 h-4 inline mr-1" />
                      Claim
                    </motion.button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
        
        {/* Achievements Preview */}
        <div className="border-t p-4 bg-gray-50">
          <h3 className="font-bold text-gray-700 mb-2">🏆 Achievements</h3>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {ACHIEVEMENTS.slice(0, 4).map((achievement) => (
              <div
                key={achievement.id}
                className="flex-shrink-0 bg-white p-2 rounded-xl border text-center min-w-[80px]"
              >
                <div className="text-2xl mb-1">
                  {achievement.id === 'first_harvest' ? '🌾' :
                   achievement.id === 'animal_lover' ? '🐮' :
                   achievement.id === 'master_chef' ? '👨‍🍳' :
                   achievement.id === 'tycoon' ? '💰' : '🏆'}
                </div>
                <div className="text-xs font-medium text-gray-600 truncate">
                  {achievement.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
