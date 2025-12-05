import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCityCreatorStore } from '@/stores/cityCreatorStore';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

interface QuestBoardProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuestBoard: React.FC<QuestBoardProps> = ({ isOpen, onClose }) => {
  const { quests, dailyChallenges, refreshQuests, claimQuestReward, completedQuests } = useCityCreatorStore();

  const handleClaimReward = (questId: string) => {
    claimQuestReward(questId);
    toast.success('🎉 Quest reward claimed!');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-gradient-to-b from-amber-100 to-amber-200 rounded-3xl p-6 max-w-lg w-full max-h-[80vh] shadow-2xl border-4 border-amber-400"
            initial={{ scale: 0.8, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 50 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-amber-800 flex items-center gap-2">
                📜 Quest Board
              </h2>
              <div className="flex items-center gap-2">
                <span className="bg-amber-400 px-3 py-1 rounded-full text-sm font-bold">
                  ✅ {completedQuests} completed
                </span>
                <button
                  onClick={onClose}
                  className="text-2xl hover:scale-110 transition-transform"
                >
                  ✖️
                </button>
              </div>
            </div>

            <ScrollArea className="h-[50vh]">
              {/* Daily Challenges */}
              <div className="mb-6">
                <h3 className="font-bold text-amber-700 mb-3 flex items-center gap-2">
                  🌟 Daily Challenges
                </h3>
                <div className="space-y-3">
                  {dailyChallenges.map((challenge, index) => (
                    <motion.div
                      key={challenge.id}
                      className={`
                        bg-gradient-to-r from-yellow-200 to-orange-200 rounded-xl p-4 shadow
                        ${challenge.completed ? 'ring-2 ring-green-400' : ''}
                      `}
                      initial={{ x: -50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-bold">{challenge.title}</p>
                          <p className="text-sm text-amber-700">{challenge.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-amber-600">Reward</p>
                          <p className="font-bold text-amber-800">🪙 {challenge.reward.toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={(challenge.progress / challenge.target) * 100} className="flex-1" />
                        <span className="text-sm font-bold">
                          {challenge.progress}/{challenge.target}
                        </span>
                        {challenge.completed && (
                          <span className="text-green-500 text-xl">✅</span>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Main Quests */}
              <div>
                <h3 className="font-bold text-amber-700 mb-3 flex items-center gap-2">
                  ⚔️ Quests
                </h3>
                <div className="space-y-3">
                  {quests.map((quest, index) => (
                    <motion.div
                      key={quest.id}
                      className={`
                        bg-white rounded-xl p-4 shadow
                        ${quest.completed && !quest.claimed ? 'ring-2 ring-yellow-400 animate-pulse' : ''}
                        ${quest.claimed ? 'opacity-60' : ''}
                      `}
                      initial={{ x: -50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-3xl">{quest.npc.split(' ')[0]}</div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="font-bold">{quest.title}</p>
                            {quest.claimed && <span className="text-green-500">✅ Claimed</span>}
                          </div>
                          <p className="text-sm text-gray-600">{quest.description}</p>
                          <p className="text-xs text-gray-500 mt-1">From: {quest.npc}</p>
                          
                          <div className="mt-2">
                            <Progress value={(quest.progress / quest.target) * 100} className="mb-1" />
                            <div className="flex items-center justify-between text-xs">
                              <span>{quest.progress}/{quest.target}</span>
                              <span className="text-amber-600">
                                +{quest.reward.xp} XP • 🪙{quest.reward.coins}
                              </span>
                            </div>
                          </div>

                          {quest.completed && !quest.claimed && (
                            <motion.button
                              onClick={() => handleClaimReward(quest.id)}
                              className="mt-2 w-full py-2 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-lg font-bold text-sm shadow hover:brightness-110 transition-all"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              🎁 Claim Reward!
                            </motion.button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </ScrollArea>

            <button
              onClick={() => {
                refreshQuests();
                toast.info('📜 New quests available!');
              }}
              className="mt-4 w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-bold text-white shadow-lg hover:brightness-110 transition-all"
            >
              🔄 Refresh Quests
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
