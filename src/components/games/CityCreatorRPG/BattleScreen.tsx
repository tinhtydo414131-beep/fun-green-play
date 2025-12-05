import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCityCreatorStore } from '@/stores/cityCreatorStore';
import { BATTLE_SKILLS } from '@/utils/cityCreatorConfig';
import { Progress } from '@/components/ui/progress';
import confetti from 'canvas-confetti';

interface BattleScreenProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BattleScreen: React.FC<BattleScreenProps> = ({ isOpen, onClose }) => {
  const { battle, hero, startBattle, useSkill, endBattle } = useCityCreatorStore();
  const [attacking, setAttacking] = useState(false);
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null);

  const handleSkillUse = (skillId: string) => {
    if (attacking || !battle.active) return;
    
    setAttacking(true);
    setSelectedSkillId(skillId);
    
    // Play attack animation
    setTimeout(() => {
      useSkill(skillId);
      setAttacking(false);
      setSelectedSkillId(null);
      
      // Check for victory
      if (!battle.monsters.some(m => m.health > 0)) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    }, 500);
  };

  const handleStartBattle = () => {
    startBattle();
  };

  const monstersAlive = battle.monsters.some(m => m.health > 0);
  const battleEnded = battle.active && (!monstersAlive || battle.playerHealth <= 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-3xl p-6 max-w-2xl w-full shadow-2xl border-4 border-purple-500"
            initial={{ scale: 0.8, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 50 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                ⚔️ Battle Arena
              </h2>
              <button
                onClick={onClose}
                className="text-2xl text-white hover:scale-110 transition-transform"
              >
                ✖️
              </button>
            </div>

            {!battle.active ? (
              /* Start Battle Screen */
              <div className="text-center py-10">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  <span className="text-8xl">⚔️</span>
                </motion.div>
                <h3 className="text-3xl font-bold text-white mt-4">Ready for Battle?</h3>
                <p className="text-gray-400 mt-2">Defend your city from monsters!</p>
                <motion.button
                  onClick={handleStartBattle}
                  className="mt-6 px-8 py-4 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl font-bold text-xl text-white shadow-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  🎮 Start Battle!
                </motion.button>
              </div>
            ) : (
              /* Battle Screen */
              <div className="space-y-4">
                {/* Player Health */}
                <div className="bg-green-900/50 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-bold">🧙 {hero.name} (Lv.{hero.level})</span>
                    <span className="text-green-400">{battle.playerHealth}/{battle.maxPlayerHealth} HP</span>
                  </div>
                  <Progress 
                    value={(battle.playerHealth / battle.maxPlayerHealth) * 100} 
                    className="h-4 bg-green-950"
                  />
                </div>

                {/* Monsters */}
                <div className="grid grid-cols-3 gap-4 py-4">
                  {battle.monsters.map((monster, index) => (
                    <motion.div
                      key={monster.id}
                      className={`
                        bg-red-900/30 rounded-xl p-4 text-center
                        ${monster.health <= 0 ? 'opacity-30' : ''}
                      `}
                      initial={{ y: -20, opacity: 0 }}
                      animate={{ 
                        y: 0, 
                        opacity: 1,
                        x: attacking && selectedSkillId && monster.health > 0 ? [0, -10, 10, 0] : 0
                      }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <motion.span 
                        className="text-5xl block"
                        animate={monster.health <= 0 ? { rotate: 90, opacity: 0.5 } : {}}
                      >
                        {monster.emoji}
                      </motion.span>
                      <p className="text-white font-bold mt-2">{monster.name}</p>
                      <div className="mt-2">
                        <Progress 
                          value={(monster.health / monster.maxHealth) * 100} 
                          className="h-2 bg-red-950"
                        />
                        <span className="text-xs text-red-400">
                          {Math.max(0, monster.health)}/{monster.maxHealth}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Battle Log */}
                <div className="bg-black/50 rounded-xl p-3 h-24 overflow-y-auto">
                  {battle.log.slice(-4).map((log, i) => (
                    <motion.p
                      key={i}
                      className="text-gray-300 text-sm"
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                    >
                      {log}
                    </motion.p>
                  ))}
                </div>

                {/* Skills */}
                {!battleEnded && (
                  <div className="grid grid-cols-4 gap-3">
                    {BATTLE_SKILLS.map((skill) => (
                      <motion.button
                        key={skill.id}
                        onClick={() => handleSkillUse(skill.id)}
                        disabled={attacking}
                        className={`
                          p-3 rounded-xl text-center transition-all
                          ${attacking ? 'opacity-50' : 'hover:brightness-110'}
                          ${skill.id === 'attack' ? 'bg-gray-600' : ''}
                          ${skill.id === 'fireball' ? 'bg-orange-600' : ''}
                          ${skill.id === 'lightning' ? 'bg-yellow-600' : ''}
                          ${skill.id === 'shield' ? 'bg-blue-600' : ''}
                        `}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <span className="text-3xl block">{skill.emoji}</span>
                        <span className="text-white text-xs font-bold">{skill.name}</span>
                      </motion.button>
                    ))}
                  </div>
                )}

                {/* Battle End */}
                {battleEnded && (
                  <motion.div
                    className="text-center py-6"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                  >
                    {battle.playerHealth > 0 ? (
                      <>
                        <span className="text-6xl">🎉</span>
                        <h3 className="text-3xl font-bold text-yellow-400 mt-2">Victory!</h3>
                        <p className="text-gray-300">You defended your city!</p>
                      </>
                    ) : (
                      <>
                        <span className="text-6xl">💔</span>
                        <h3 className="text-3xl font-bold text-red-400 mt-2">Defeated</h3>
                        <p className="text-gray-300">Try again, hero!</p>
                      </>
                    )}
                    <motion.button
                      onClick={onClose}
                      className="mt-4 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-bold text-white"
                      whileHover={{ scale: 1.05 }}
                    >
                      Continue
                    </motion.button>
                  </motion.div>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
