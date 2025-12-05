import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCityCreatorStore } from '@/stores/cityCreatorStore';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onSave }) => {
  const { 
    musicEnabled, 
    sfxEnabled, 
    toggleMusic, 
    toggleSfx, 
    cityName, 
    setCityName,
    resetGame,
    playTime,
    lastSaved
  } = useCityCreatorStore();

  const [cityNameInput, setCityNameInput] = React.useState(cityName);

  const handleSaveCityName = () => {
    if (cityNameInput.trim()) {
      setCityName(cityNameInput.trim());
      toast.success('City name updated!');
    }
  };

  const handleResetGame = () => {
    if (window.confirm('🚨 Are you sure? This will delete ALL your progress!')) {
      resetGame();
      toast.success('Game reset. Start fresh! 🌱');
      onClose();
    }
  };

  const formatPlayTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const formatLastSaved = (timestamp: number) => {
    if (!timestamp) return 'Never';
    return new Date(timestamp).toLocaleString();
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
            className="bg-gradient-to-b from-slate-100 to-slate-200 rounded-3xl p-6 max-w-md w-full shadow-2xl border-4 border-slate-300"
            initial={{ scale: 0.8, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 50 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                ⚙️ Settings
              </h2>
              <button
                onClick={onClose}
                className="text-2xl hover:scale-110 transition-transform"
              >
                ✖️
              </button>
            </div>

            {/* City Name */}
            <div className="bg-white rounded-xl p-4 mb-4 shadow">
              <h3 className="font-bold text-slate-700 mb-2">🏰 City Name</h3>
              <div className="flex gap-2">
                <Input
                  value={cityNameInput}
                  onChange={(e) => setCityNameInput(e.target.value)}
                  placeholder="Enter city name"
                  className="flex-1"
                />
                <button
                  onClick={handleSaveCityName}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Save
                </button>
              </div>
            </div>

            {/* Audio Settings */}
            <div className="bg-white rounded-xl p-4 mb-4 shadow">
              <h3 className="font-bold text-slate-700 mb-3">🔊 Audio</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🎵</span>
                    <span>Background Music</span>
                  </div>
                  <Switch checked={musicEnabled} onCheckedChange={toggleMusic} />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🔔</span>
                    <span>Sound Effects</span>
                  </div>
                  <Switch checked={sfxEnabled} onCheckedChange={toggleSfx} />
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="bg-white rounded-xl p-4 mb-4 shadow">
              <h3 className="font-bold text-slate-700 mb-3">📊 Stats</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-slate-500">Play Time</p>
                  <p className="font-bold">{formatPlayTime(playTime)}</p>
                </div>
                <div>
                  <p className="text-slate-500">Last Saved</p>
                  <p className="font-bold text-xs">{formatLastSaved(lastSaved)}</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <motion.button
                onClick={() => {
                  onSave();
                  toast.success('💾 Game saved!');
                }}
                className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl font-bold text-white shadow-lg"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                💾 Save Game
              </motion.button>
              
              <motion.button
                onClick={handleResetGame}
                className="w-full py-3 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl font-bold text-white shadow-lg"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                🗑️ Reset Progress
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
