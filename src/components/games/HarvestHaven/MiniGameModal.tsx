import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Gift, Pickaxe, Star } from 'lucide-react';
import { useHarvestHavenStore } from '@/stores/harvestHavenStore';
import { toast } from 'sonner';

interface MiniGameModalProps {
  type: 'mining' | 'fishing' | 'balloon';
  onClose: () => void;
}

export const MiniGameModal: React.FC<MiniGameModalProps> = ({ type, onClose }) => {
  const { addCoins, addGems, addXP, useEnergy, energy } = useHarvestHavenStore();
  
  // Mining game state
  const [miningGrid, setMiningGrid] = useState<Array<{ revealed: boolean; content: 'empty' | 'coin' | 'gem' | 'rock' }>>([]);
  const [miningMoves, setMiningMoves] = useState(5);
  const [miningRewards, setMiningRewards] = useState({ coins: 0, gems: 0 });
  
  // Balloon pop game state
  const [balloons, setBalloons] = useState<Array<{ id: number; x: number; y: number; color: string; popped: boolean }>>([]);
  const [balloonScore, setBalloonScore] = useState(0);
  const [balloonTimeLeft, setBalloonTimeLeft] = useState(15);
  const [gameActive, setGameActive] = useState(false);
  
  // Initialize mining game
  useEffect(() => {
    if (type === 'mining') {
      const grid = Array(16).fill(null).map(() => {
        const rand = Math.random();
        if (rand < 0.1) return { revealed: false, content: 'gem' as const };
        if (rand < 0.35) return { revealed: false, content: 'coin' as const };
        if (rand < 0.5) return { revealed: false, content: 'rock' as const };
        return { revealed: false, content: 'empty' as const };
      });
      setMiningGrid(grid);
    }
  }, [type]);
  
  // Balloon game timer
  useEffect(() => {
    if (type === 'balloon' && gameActive && balloonTimeLeft > 0) {
      const timer = setInterval(() => {
        setBalloonTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (balloonTimeLeft === 0 && gameActive) {
      setGameActive(false);
      // Award rewards
      const coins = balloonScore * 5;
      const gems = Math.floor(balloonScore / 10);
      addCoins(coins);
      if (gems > 0) addGems(gems);
      addXP(balloonScore * 2);
      toast.success(`Mini-game complete! +${coins} coins${gems > 0 ? `, +${gems} gems` : ''}!`);
    }
  }, [type, gameActive, balloonTimeLeft, balloonScore, addCoins, addGems, addXP]);
  
  // Spawn balloons
  useEffect(() => {
    if (type === 'balloon' && gameActive) {
      const interval = setInterval(() => {
        const colors = ['🎈', '🎈', '🎈', '🎈', '💎', '⭐'];
        setBalloons((prev) => [
          ...prev.filter((b) => !b.popped && b.y > -50),
          {
            id: Date.now(),
            x: Math.random() * 80 + 10,
            y: 110,
            color: colors[Math.floor(Math.random() * colors.length)],
            popped: false,
          },
        ]);
      }, 400);
      return () => clearInterval(interval);
    }
  }, [type, gameActive]);
  
  // Move balloons up
  useEffect(() => {
    if (type === 'balloon' && gameActive) {
      const interval = setInterval(() => {
        setBalloons((prev) =>
          prev.map((b) => ({ ...b, y: b.y - 2 })).filter((b) => b.y > -50)
        );
      }, 50);
      return () => clearInterval(interval);
    }
  }, [type, gameActive]);
  
  const handleMiningClick = (index: number) => {
    if (miningMoves <= 0 || miningGrid[index].revealed) return;
    
    const newGrid = [...miningGrid];
    newGrid[index] = { ...newGrid[index], revealed: true };
    setMiningGrid(newGrid);
    setMiningMoves((prev) => prev - 1);
    
    const content = newGrid[index].content;
    if (content === 'coin') {
      setMiningRewards((prev) => ({ ...prev, coins: prev.coins + 25 }));
    } else if (content === 'gem') {
      setMiningRewards((prev) => ({ ...prev, gems: prev.gems + 1 }));
    }
    
    if (miningMoves === 1) {
      // Game over - award rewards
      setTimeout(() => {
        const finalCoins = miningRewards.coins + (content === 'coin' ? 25 : 0);
        const finalGems = miningRewards.gems + (content === 'gem' ? 1 : 0);
        addCoins(finalCoins);
        addGems(finalGems);
        addXP(20);
        toast.success(`Mining complete! +${finalCoins} coins, +${finalGems} gems!`);
      }, 500);
    }
  };
  
  const handleBalloonClick = (id: number, color: string) => {
    setBalloons((prev) =>
      prev.map((b) => (b.id === id ? { ...b, popped: true } : b))
    );
    
    if (color === '💎') {
      setBalloonScore((prev) => prev + 5);
    } else if (color === '⭐') {
      setBalloonScore((prev) => prev + 3);
    } else {
      setBalloonScore((prev) => prev + 1);
    }
  };
  
  const startBalloonGame = () => {
    if (energy < 10) {
      toast.error('Not enough energy! Need 10 energy to play.');
      return;
    }
    useEnergy(10);
    setGameActive(true);
    setBalloonTimeLeft(15);
    setBalloonScore(0);
    setBalloons([]);
  };
  
  const getTitle = () => {
    switch (type) {
      case 'mining': return '⛏️ Crystal Mine';
      case 'fishing': return '🎣 Fishing Pond';
      case 'balloon': return '🎈 Balloon Pop';
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 50 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 text-white border-b border-white/20">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">{getTitle()}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
        
        {/* Game Content */}
        <div className="p-4">
          {type === 'mining' && (
            <div>
              <div className="flex items-center justify-between mb-4 text-white">
                <div className="flex items-center gap-2">
                  <Pickaxe className="w-5 h-5" />
                  <span>Moves: {miningMoves}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span>💰 {miningRewards.coins}</span>
                  <span>💎 {miningRewards.gems}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-4 gap-2">
                {miningGrid.map((cell, index) => (
                  <motion.button
                    key={index}
                    onClick={() => handleMiningClick(index)}
                    disabled={cell.revealed || miningMoves <= 0}
                    whileHover={!cell.revealed ? { scale: 1.05 } : {}}
                    whileTap={!cell.revealed ? { scale: 0.95 } : {}}
                    className={`aspect-square rounded-xl flex items-center justify-center text-3xl transition-all ${
                      cell.revealed
                        ? 'bg-stone-700'
                        : 'bg-stone-500 hover:bg-stone-400 cursor-pointer'
                    }`}
                  >
                    {cell.revealed ? (
                      cell.content === 'coin' ? '💰' :
                      cell.content === 'gem' ? '💎' :
                      cell.content === 'rock' ? '🪨' : ''
                    ) : (
                      <span className="opacity-50">❓</span>
                    )}
                  </motion.button>
                ))}
              </div>
              
              {miningMoves <= 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 text-center"
                >
                  <p className="text-white text-lg mb-2">Mining Complete!</p>
                  <button
                    onClick={onClose}
                    className="px-6 py-2 bg-green-500 text-white rounded-full font-bold hover:bg-green-400"
                  >
                    Collect Rewards
                  </button>
                </motion.div>
              )}
            </div>
          )}
          
          {type === 'balloon' && (
            <div>
              {!gameActive && balloonTimeLeft === 15 ? (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">🎈</div>
                  <h3 className="text-xl font-bold text-white mb-2">Balloon Pop Challenge!</h3>
                  <p className="text-white/80 mb-4">
                    Pop as many balloons as you can in 15 seconds!
                    <br />
                    💎 = 5 points, ⭐ = 3 points, 🎈 = 1 point
                  </p>
                  <p className="text-yellow-300 mb-4">Cost: 10 ⚡ Energy</p>
                  <button
                    onClick={startBalloonGame}
                    className="px-8 py-3 bg-gradient-to-r from-pink-500 to-red-500 text-white rounded-full font-bold text-lg hover:from-pink-400 hover:to-red-400 transition-colors"
                  >
                    Start Game!
                  </button>
                </div>
              ) : gameActive ? (
                <div className="relative h-80 bg-gradient-to-b from-sky-400 to-sky-200 rounded-2xl overflow-hidden">
                  {/* Timer and Score */}
                  <div className="absolute top-2 left-2 right-2 flex justify-between z-10">
                    <div className="bg-black/50 text-white px-3 py-1 rounded-full font-bold">
                      ⏱️ {balloonTimeLeft}s
                    </div>
                    <div className="bg-black/50 text-white px-3 py-1 rounded-full font-bold">
                      ⭐ {balloonScore}
                    </div>
                  </div>
                  
                  {/* Balloons */}
                  {balloons.map((balloon) => (
                    <motion.button
                      key={balloon.id}
                      onClick={() => !balloon.popped && handleBalloonClick(balloon.id, balloon.color)}
                      className="absolute text-4xl cursor-pointer"
                      style={{
                        left: `${balloon.x}%`,
                        top: `${balloon.y}%`,
                        transform: 'translate(-50%, -50%)',
                      }}
                      animate={balloon.popped ? { scale: 0, opacity: 0 } : { scale: [1, 1.1, 1] }}
                      transition={balloon.popped ? { duration: 0.2 } : { duration: 0.5, repeat: Infinity }}
                    >
                      {balloon.popped ? '💥' : balloon.color}
                    </motion.button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">🎉</div>
                  <h3 className="text-xl font-bold text-white mb-2">Time's Up!</h3>
                  <p className="text-3xl font-bold text-yellow-300 mb-4">
                    Score: {balloonScore}
                  </p>
                  <p className="text-white/80 mb-4">
                    +{balloonScore * 5} coins, +{Math.floor(balloonScore / 10)} gems
                  </p>
                  <button
                    onClick={onClose}
                    className="px-6 py-2 bg-green-500 text-white rounded-full font-bold hover:bg-green-400"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};
