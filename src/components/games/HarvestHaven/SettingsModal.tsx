import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Volume2, VolumeX, RotateCcw, Download, Upload, Trash2, Info } from 'lucide-react';
import { useHarvestHavenStore } from '@/stores/harvestHavenStore';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

interface SettingsModalProps {
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const { level, coins, gems, totalHarvested, totalProduced, completedOrders, resetGame } = useHarvestHavenStore();
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  
  const handleExportSave = () => {
    const saveData = localStorage.getItem('harvest-haven-save');
    if (saveData) {
      const blob = new Blob([saveData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `harvest-haven-save-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Save exported successfully!');
    }
  };
  
  const handleImportSave = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const saveData = e.target?.result as string;
            localStorage.setItem('harvest-haven-save', saveData);
            window.location.reload();
          } catch {
            toast.error('Invalid save file!');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };
  
  const handleResetGame = () => {
    resetGame();
    localStorage.removeItem('harvest-haven-save');
    window.location.reload();
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
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-700 to-gray-900 p-4 text-white">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              ⚙️ Settings
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
        
        <div className="p-4 space-y-4">
          {/* Stats Section */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4">
            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
              <Info className="w-5 h-5 text-blue-500" />
              Your Progress
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-white rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-blue-600">{level}</div>
                <div className="text-gray-500">Level</div>
              </div>
              <div className="bg-white rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-yellow-600">{coins.toLocaleString()}</div>
                <div className="text-gray-500">Coins</div>
              </div>
              <div className="bg-white rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-green-600">{totalHarvested}</div>
                <div className="text-gray-500">Harvested</div>
              </div>
              <div className="bg-white rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-purple-600">{completedOrders}</div>
                <div className="text-gray-500">Orders</div>
              </div>
            </div>
          </div>
          
          {/* Sound Settings */}
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                {soundEnabled ? <Volume2 className="w-5 h-5 text-gray-600" /> : <VolumeX className="w-5 h-5 text-gray-400" />}
                <span className="font-medium">Sound Effects</span>
              </div>
              <Switch checked={soundEnabled} onCheckedChange={setSoundEnabled} />
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <span className="text-xl">🎵</span>
                <span className="font-medium">Background Music</span>
              </div>
              <Switch checked={musicEnabled} onCheckedChange={setMusicEnabled} />
            </div>
          </div>
          
          {/* Save Management */}
          <div className="space-y-2">
            <button
              onClick={handleExportSave}
              className="w-full flex items-center justify-center gap-2 p-3 bg-blue-50 text-blue-600 rounded-xl font-medium hover:bg-blue-100 transition-colors"
            >
              <Download className="w-5 h-5" />
              Export Save
            </button>
            
            <button
              onClick={handleImportSave}
              className="w-full flex items-center justify-center gap-2 p-3 bg-green-50 text-green-600 rounded-xl font-medium hover:bg-green-100 transition-colors"
            >
              <Upload className="w-5 h-5" />
              Import Save
            </button>
            
            {!showResetConfirm ? (
              <button
                onClick={() => setShowResetConfirm(true)}
                className="w-full flex items-center justify-center gap-2 p-3 bg-red-50 text-red-600 rounded-xl font-medium hover:bg-red-100 transition-colors"
              >
                <RotateCcw className="w-5 h-5" />
                Reset Game
              </button>
            ) : (
              <div className="p-3 bg-red-100 rounded-xl">
                <p className="text-red-800 text-sm mb-2 text-center">
                  Are you sure? This will delete ALL your progress!
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowResetConfirm(false)}
                    className="flex-1 p-2 bg-gray-200 rounded-lg font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleResetGame}
                    className="flex-1 p-2 bg-red-500 text-white rounded-lg font-medium flex items-center justify-center gap-1"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
