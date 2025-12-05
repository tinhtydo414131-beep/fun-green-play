import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCityCreatorStore } from '@/stores/cityCreatorStore';
import { CityMap } from './CityMap';
import { BuildingToolbar } from './BuildingToolbar';
import { GameHUD } from './GameHUD';
import { QuestBoard } from './QuestBoard';
import { BattleScreen } from './BattleScreen';
import { HeroCustomizer } from './HeroCustomizer';
import { SettingsModal } from './SettingsModal';
import type { BuildingType } from '@/types/cityCreatorRPG';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

interface CityCreatorRPGProps {
  level?: number;
  onLevelComplete?: (score: number, coins: number) => void;
  onBack?: () => void;
}

export const CityCreatorRPG: React.FC<CityCreatorRPGProps> = ({ 
  level = 1, 
  onLevelComplete, 
  onBack 
}) => {
  const { user } = useAuth();
  const store = useCityCreatorStore();
  const { 
    hero, 
    totalCoinsEarned, 
    checkDailyLogin, 
    refreshQuests, 
    refreshDailyChallenges,
    collectResources,
    saveGame,
    updatePlayTime,
    calculateCityScore,
  } = store;

  const [selectedBuilding, setSelectedBuilding] = useState<BuildingType | null>(null);
  const [activeTab, setActiveTab] = useState<'build' | 'fight' | 'quest' | 'social'>('build');
  const [showQuestBoard, setShowQuestBoard] = useState(false);
  const [showBattleScreen, setShowBattleScreen] = useState(false);
  const [showHeroCustomizer, setShowHeroCustomizer] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize game
  useEffect(() => {
    const init = async () => {
      // Check daily login
      const bonus = checkDailyLogin();
      if (bonus > 0) {
        toast.success(`🌟 Daily Login! +${bonus.toLocaleString()} Camly Coins!`);
        confetti({ particleCount: 50, spread: 60 });
      }

      // Initialize quests if empty
      if (store.quests.length === 0) {
        refreshQuests();
      }
      if (store.dailyChallenges.length === 0) {
        refreshDailyChallenges();
      }

      setIsLoading(false);
    };

    init();
  }, []);

  // Auto-save every 30 seconds
  useEffect(() => {
    const saveInterval = setInterval(() => {
      saveGame();
    }, 30000);

    return () => clearInterval(saveInterval);
  }, [saveGame]);

  // Update play time
  useEffect(() => {
    const playTimeInterval = setInterval(() => {
      updatePlayTime(1);
    }, 1000);

    return () => clearInterval(playTimeInterval);
  }, [updatePlayTime]);

  // Collect resources every minute
  useEffect(() => {
    const collectInterval = setInterval(() => {
      collectResources();
    }, 60000);

    // Collect on mount
    collectResources();

    return () => clearInterval(collectInterval);
  }, [collectResources]);

  // Calculate city score periodically
  useEffect(() => {
    calculateCityScore();
  }, [store.buildings, calculateCityScore]);

  const handleBuildingPlaced = useCallback(() => {
    setSelectedBuilding(null);
    toast.success('🏗️ Building placed!');
  }, []);

  const tabs = [
    { id: 'build', emoji: '🏗️', label: 'Build' },
    { id: 'fight', emoji: '⚔️', label: 'Fight' },
    { id: 'quest', emoji: '📜', label: 'Quests' },
    { id: 'social', emoji: '👥', label: 'Social' },
  ] as const;

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-gradient-to-b from-sky-400 to-green-400 flex items-center justify-center">
        <motion.div
          className="text-center"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 1 }}
        >
          <span className="text-8xl">🏰</span>
          <p className="text-white text-2xl font-bold mt-4">Loading City...</p>
          <motion.div
            className="flex justify-center gap-2 mt-4"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            {['⭐', '⭐', '⭐'].map((star, i) => (
              <motion.span
                key={i}
                className="text-3xl"
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.15 }}
              >
                {star}
              </motion.span>
            ))}
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-sky-300 to-sky-400 overflow-hidden">
      {/* HUD */}
      <GameHUD 
        totalCoins={totalCoinsEarned} 
        onSettingsClick={() => setShowSettings(true)} 
      />

      {/* Main Game Area */}
      <div className="absolute inset-0 pt-32 pb-24 px-4 flex gap-4">
        {/* Building Toolbar (Desktop) */}
        <div className="hidden lg:block w-64">
          <BuildingToolbar
            selectedBuilding={selectedBuilding}
            onSelectBuilding={setSelectedBuilding}
          />
        </div>

        {/* City Map */}
        <div className="flex-1 relative">
          <CityMap
            selectedBuilding={selectedBuilding}
            onBuildingPlaced={handleBuildingPlaced}
          />
        </div>

        {/* Side Panel (Desktop) */}
        <div className="hidden lg:flex flex-col gap-4 w-64">
          {/* Quick Actions */}
          <div className="bg-white/90 rounded-2xl p-4 shadow-xl">
            <h3 className="font-bold text-center mb-3">🎮 Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              <motion.button
                onClick={() => setShowHeroCustomizer(true)}
                className="p-3 bg-purple-500 rounded-xl text-white font-bold text-sm"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                🧙 Hero
              </motion.button>
              <motion.button
                onClick={() => setShowQuestBoard(true)}
                className="p-3 bg-amber-500 rounded-xl text-white font-bold text-sm"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                📜 Quests
              </motion.button>
              <motion.button
                onClick={() => setShowBattleScreen(true)}
                className="p-3 bg-red-500 rounded-xl text-white font-bold text-sm"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                ⚔️ Battle
              </motion.button>
              <motion.button
                onClick={() => {
                  collectResources();
                  toast.success('📦 Resources collected!');
                }}
                className="p-3 bg-green-500 rounded-xl text-white font-bold text-sm"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                📦 Collect
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="absolute bottom-0 left-0 right-0 lg:hidden">
        <div className="bg-white/95 backdrop-blur rounded-t-3xl shadow-xl p-4">
          <div className="grid grid-cols-4 gap-2">
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  if (tab.id === 'quest') setShowQuestBoard(true);
                  if (tab.id === 'fight') setShowBattleScreen(true);
                }}
                className={`
                  p-3 rounded-xl text-center transition-all
                  ${activeTab === tab.id 
                    ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg' 
                    : 'bg-gray-100 hover:bg-gray-200'
                  }
                `}
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-2xl block">{tab.emoji}</span>
                <span className="text-xs font-bold">{tab.label}</span>
              </motion.button>
            ))}
          </div>

          {/* Mobile Building Toolbar (collapsed) */}
          {activeTab === 'build' && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="mt-4 overflow-hidden"
            >
              <BuildingToolbar
                selectedBuilding={selectedBuilding}
                onSelectBuilding={setSelectedBuilding}
              />
            </motion.div>
          )}
        </div>
      </div>

      {/* Back Button */}
      {onBack && (
        <motion.button
          onClick={onBack}
          className="absolute top-4 left-4 z-40 bg-white/90 rounded-full p-3 shadow-xl"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <span className="text-2xl">⬅️</span>
        </motion.button>
      )}

      {/* Modals */}
      <QuestBoard isOpen={showQuestBoard} onClose={() => setShowQuestBoard(false)} />
      <BattleScreen isOpen={showBattleScreen} onClose={() => setShowBattleScreen(false)} />
      <HeroCustomizer isOpen={showHeroCustomizer} onClose={() => setShowHeroCustomizer(false)} />
      <SettingsModal 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
        onSave={saveGame}
      />
    </div>
  );
};

export default CityCreatorRPG;
