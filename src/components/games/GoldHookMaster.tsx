import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Play, Pause, RotateCcw, ShoppingCart, Trophy, Heart, Clock, Zap, Shield, Magnet } from "lucide-react";
import { useGameAudio } from "@/hooks/useGameAudio";
import { AudioControls } from "@/components/AudioControls";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface GoldHookMasterProps {
  onBack: () => void;
}

interface Item {
  id: string;
  type: 'gold' | 'diamond' | 'coin' | 'rock' | 'bomb' | 'powerup';
  x: number;
  y: number;
  value: number;
  emoji: string;
  radius: number;
  collected: boolean;
}

interface Hook {
  x: number;
  y: number;
  angle: number;
  length: number;
  extending: boolean;
  retracting: boolean;
  speed: number;
  item: Item | null;
}

interface PowerUp {
  type: 'magnet' | 'speed' | 'shield';
  duration: number;
  active: boolean;
}

interface GameStats {
  gold: number;
  hp: number;
  score: number;
  combo: number;
  time: number;
}

interface Upgrade {
  id: string;
  name: string;
  description: string;
  cost: number;
  level: number;
  maxLevel: number;
  icon: any;
}

const ITEMS_CONFIG = {
  gold: { value: 100, emoji: '💰', rarity: 0.3, radius: 15 },
  coin: { value: 50, emoji: '🪙', rarity: 0.35, radius: 12 },
  diamond: { value: 500, emoji: '💎', rarity: 0.1, radius: 18 },
  rock: { value: 0, emoji: '🪨', rarity: 0.15, radius: 20 },
  bomb: { value: -200, emoji: '💣', rarity: 0.1, radius: 16 }
};

export const GoldHookMaster = ({ onBack }: GoldHookMasterProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const { user } = useAuth();
  const audio = useGameAudio();

  const [currentLevel, setCurrentLevel] = useState(1);
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'paused' | 'gameover' | 'victory' | 'shop'>('menu');
  const [stats, setStats] = useState<GameStats>({ gold: 0, hp: 100, score: 0, combo: 0, time: 60 });
  const [hook, setHook] = useState<Hook>({ x: 400, y: 100, angle: 0, length: 50, extending: false, retracting: false, speed: 5, item: null });
  const [items, setItems] = useState<Item[]>([]);
  const [powerUps, setPowerUps] = useState<PowerUp[]>([
    { type: 'magnet', duration: 0, active: false },
    { type: 'speed', duration: 0, active: false },
    { type: 'shield', duration: 0, active: false }
  ]);
  
  const [totalGold, setTotalGold] = useState(0);
  const [upgrades, setUpgrades] = useState<Upgrade[]>([
    { id: 'hook_strength', name: 'Móc mạnh hơn', description: 'Tăng tốc độ móc 20%', cost: 500, level: 0, maxLevel: 5, icon: Zap },
    { id: 'extra_time', name: 'Thêm thời gian', description: '+10 giây mỗi level', cost: 1000, level: 0, maxLevel: 3, icon: Clock },
    { id: 'bomb_shield', name: 'Khiên chống bom', description: 'Miễn nhiễm 3 bom/level', cost: 2000, level: 0, maxLevel: 3, icon: Shield },
    { id: 'permanent_magnet', name: 'Nam châm vĩnh viễn', description: 'Hút vật gần hơn', cost: 5000, level: 0, maxLevel: 1, icon: Magnet }
  ]);

  const getLevelConfig = useCallback((level: number) => {
    const baseTime = 60 - Math.floor(level / 10) * 5;
    const depth = 300 + level * 50;
    const itemCount = 15 + Math.floor(level / 5) * 2;
    return {
      time: Math.max(30, baseTime + (upgrades.find(u => u.id === 'extra_time')?.level || 0) * 10),
      depth,
      itemCount,
      targetScore: 1000 + level * 500
    };
  }, [upgrades]);

  // Generate items for level
  const generateItems = useCallback((depth: number, count: number) => {
    const newItems: Item[] = [];
    const canvasWidth = 800;
    
    for (let i = 0; i < count; i++) {
      const rand = Math.random();
      let type: Item['type'] = 'coin';
      
      if (rand < 0.1) type = 'diamond';
      else if (rand < 0.2) type = 'bomb';
      else if (rand < 0.35) type = 'rock';
      else if (rand < 0.65) type = 'gold';
      else type = 'coin';
      
      const config = ITEMS_CONFIG[type as keyof typeof ITEMS_CONFIG];
      
      newItems.push({
        id: `item-${i}-${Date.now()}`,
        type,
        x: Math.random() * (canvasWidth - 100) + 50,
        y: 150 + Math.random() * (depth - 150),
        value: config.value,
        emoji: config.emoji,
        radius: config.radius,
        collected: false
      });
    }
    
    return newItems;
  }, []);

  // Start new level
  const startLevel = useCallback(() => {
    const config = getLevelConfig(currentLevel);
    setStats({ gold: 0, hp: 100, score: 0, combo: 0, time: config.time });
    setItems(generateItems(config.depth, config.itemCount));
    setHook({ x: 400, y: 100, angle: 0, length: 50, extending: false, retracting: false, speed: 5 + (upgrades.find(u => u.id === 'hook_strength')?.level || 0) * 1, item: null });
    setPowerUps(prev => prev.map(p => ({ ...p, active: false, duration: 0 })));
    setGameState('playing');
    audio.startBackgroundMusic();
  }, [currentLevel, getLevelConfig, generateItems, upgrades, audio]);

  // Load saved progress
  useEffect(() => {
    const saved = localStorage.getItem('goldHookMasterProgress');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setTotalGold(data.totalGold || 0);
        setCurrentLevel(data.currentLevel || 1);
        setUpgrades(data.upgrades || upgrades);
      } catch (e) {
        console.error('Failed to load progress:', e);
      }
    }
  }, []);

  // Save progress
  useEffect(() => {
    if (totalGold > 0) {
      localStorage.setItem('goldHookMasterProgress', JSON.stringify({
        totalGold,
        currentLevel,
        upgrades
      }));
    }
  }, [totalGold, currentLevel, upgrades]);

  // Game timer
  useEffect(() => {
    if (gameState !== 'playing') return;
    
    const timer = setInterval(() => {
      setStats(prev => {
        const newTime = prev.time - 1;
        if (newTime <= 0) {
          setGameState('gameover');
          audio.stopBackgroundMusic();
          audio.playError();
          return { ...prev, time: 0 };
        }
        return { ...prev, time: newTime };
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [gameState, audio]);

  // Power-up timer
  useEffect(() => {
    if (gameState !== 'playing') return;
    
    const timer = setInterval(() => {
      setPowerUps(prev => prev.map(p => {
        if (p.active && p.duration > 0) {
          const newDuration = p.duration - 1;
          if (newDuration <= 0) return { ...p, active: false, duration: 0 };
          return { ...p, duration: newDuration };
        }
        return p;
      }));
    }, 1000);
    
    return () => clearInterval(timer);
  }, [gameState]);

  // Handle mouse move for hook angle
  const handleCanvasMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (gameState !== 'playing' || hook.extending || hook.retracting) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const angle = Math.atan2(mouseY - hook.y, mouseX - hook.x);
    setHook(prev => ({ ...prev, angle }));
  }, [gameState, hook.extending, hook.retracting, hook.y]);

  // Launch hook
  const launchHook = useCallback(() => {
    if (hook.extending || hook.retracting) return;
    setHook(prev => ({ ...prev, extending: true }));
    audio.playClick();
  }, [hook.extending, hook.retracting, audio]);

  // Check collision
  const checkCollision = useCallback((hookX: number, hookY: number): Item | null => {
    for (const item of items) {
      if (item.collected) continue;
      const dx = hookX - item.x;
      const dy = hookY - item.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      const magnetBonus = powerUps.find(p => p.type === 'magnet' && p.active) ? 20 : 0;
      const permanentMagnet = upgrades.find(u => u.id === 'permanent_magnet')?.level || 0;
      
      if (distance < item.radius + 5 + magnetBonus + permanentMagnet * 10) {
        return item;
      }
    }
    return null;
  }, [items, powerUps, upgrades]);

  // Collect item
  const collectItem = useCallback((item: Item) => {
    const shieldActive = powerUps.find(p => p.type === 'shield' && p.active);
    const bombShield = upgrades.find(u => u.id === 'bomb_shield')?.level || 0;
    
    if (item.type === 'bomb' && !shieldActive && bombShield === 0) {
      audio.playError();
      setStats(prev => {
        const newHp = Math.max(0, prev.hp - 20);
        if (newHp === 0) {
          setGameState('gameover');
          audio.stopBackgroundMusic();
        }
        return { ...prev, hp: newHp, combo: 0 };
      });
      toast.error("💥 Bom nổ! -20 HP");
    } else if (item.type === 'bomb' && (shieldActive || bombShield > 0)) {
      audio.playClick();
      toast.success("🛡️ Khiên chống bom!");
    } else if (item.value > 0) {
      audio.playSuccess();
      setStats(prev => {
        const newCombo = prev.combo + 1;
        const comboMultiplier = newCombo >= 5 ? 2 : 1;
        const earnedScore = item.value * comboMultiplier;
        const newScore = prev.score + earnedScore;
        
        const config = getLevelConfig(currentLevel);
        if (newScore >= config.targetScore && gameState === 'playing') {
          setGameState('victory');
          audio.stopBackgroundMusic();
          audio.playSuccess();
          const goldEarned = currentLevel * 100;
          setTotalGold(t => t + goldEarned);
          toast.success(`🎉 Level ${currentLevel} hoàn thành! +${goldEarned} vàng`);
        }
        
        return { ...prev, score: newScore, combo: newCombo };
      });
      
      if (item.type === 'diamond') {
        toast.success("💎 Kim cương! +" + item.value);
      }
    }
    
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, collected: true } : i));
  }, [powerUps, upgrades, audio, getLevelConfig, currentLevel, gameState]);

  // Game loop
  useEffect(() => {
    if (gameState !== 'playing') return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const animate = () => {
      // Clear canvas
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw ground
      ctx.fillStyle = '#2d4a3e';
      ctx.fillRect(0, 120, canvas.width, canvas.height - 120);
      
      // Draw items
      items.forEach(item => {
        if (item.collected) return;
        
        ctx.font = `${item.radius * 2}px Arial`;
        ctx.fillText(item.emoji, item.x - item.radius, item.y + item.radius / 2);
      });
      
      // Update and draw hook
      if (hook.extending) {
        const newLength = hook.length + hook.speed;
        const hookX = hook.x + Math.cos(hook.angle) * newLength;
        const hookY = hook.y + Math.sin(hook.angle) * newLength;
        
        const collectedItem = checkCollision(hookX, hookY);
        
        if (collectedItem) {
          setHook(prev => ({ ...prev, extending: false, retracting: true, item: collectedItem, length: newLength }));
          collectItem(collectedItem);
        } else if (newLength > 600 || hookY > canvas.height) {
          setHook(prev => ({ ...prev, extending: false, retracting: true, length: newLength }));
        } else {
          setHook(prev => ({ ...prev, length: newLength }));
        }
      } else if (hook.retracting) {
        const newLength = Math.max(50, hook.length - hook.speed * 1.5);
        
        if (newLength === 50) {
          setHook(prev => ({ ...prev, retracting: false, length: 50, item: null }));
        } else {
          setHook(prev => ({ ...prev, length: newLength }));
        }
      }
      
      // Draw hook line
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(hook.x, hook.y);
      const endX = hook.x + Math.cos(hook.angle) * hook.length;
      const endY = hook.y + Math.sin(hook.angle) * hook.length;
      ctx.lineTo(endX, endY);
      ctx.stroke();
      
      // Draw hook tip
      ctx.fillStyle = '#ff6b6b';
      ctx.beginPath();
      ctx.arc(endX, endY, 8, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw attached item
      if (hook.item && hook.retracting) {
        ctx.font = '30px Arial';
        ctx.fillText(hook.item.emoji, endX - 15, endY + 10);
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameState, hook, items, checkCollision, collectItem]);

  // Activate power-up
  const activatePowerUp = (type: PowerUp['type']) => {
    setPowerUps(prev => prev.map(p => 
      p.type === type ? { ...p, active: true, duration: type === 'magnet' ? 5 : type === 'speed' ? 10 : 3 } : p
    ));
    audio.playSuccess();
    toast.success(`⚡ ${type === 'magnet' ? 'Nam châm' : type === 'speed' ? 'Siêu tốc' : 'Khiên'} kích hoạt!`);
  };

  // Buy upgrade
  const buyUpgrade = (upgradeId: string) => {
    const upgrade = upgrades.find(u => u.id === upgradeId);
    if (!upgrade || upgrade.level >= upgrade.maxLevel) return;
    
    const cost = upgrade.cost * Math.pow(2, upgrade.level);
    if (totalGold < cost) {
      toast.error("Không đủ vàng!");
      return;
    }
    
    setTotalGold(prev => prev - cost);
    setUpgrades(prev => prev.map(u => 
      u.id === upgradeId ? { ...u, level: u.level + 1 } : u
    ));
    audio.playSuccess();
    toast.success(`✨ Nâng cấp ${upgrade.name}!`);
  };

  // Next level
  const nextLevel = () => {
    if (currentLevel < 100) {
      setCurrentLevel(prev => prev + 1);
      startLevel();
    } else {
      toast.success("🎊 Bạn đã hoàn thành tất cả 100 levels!");
      setGameState('menu');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 p-4">
      <Card className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <Button variant="outline" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
            ⛏️ Móc Vàng Siêu Phẩm
          </h1>
          <AudioControls 
            isMusicEnabled={audio.isMusicEnabled}
            isSoundEnabled={audio.isSoundEnabled}
            onToggleMusic={audio.toggleMusic}
            onToggleSound={audio.toggleSound}
          />
        </div>

        {gameState === 'menu' && (
          <div className="text-center space-y-6 py-8">
            <div className="text-6xl">⛏️💎</div>
            <h2 className="text-2xl font-bold">Móc Vàng Siêu Phẩm</h2>
            <div className="flex items-center justify-center gap-4 text-xl">
              <div>🏆 Level: {currentLevel}/100</div>
              <div>💰 Vàng: {totalGold}</div>
            </div>
            <div className="flex gap-4 justify-center">
              <Button onClick={startLevel} size="lg" className="gap-2">
                <Play className="w-5 h-5" />
                Chơi Level {currentLevel}
              </Button>
              <Button onClick={() => setGameState('shop')} variant="outline" size="lg" className="gap-2">
                <ShoppingCart className="w-5 h-5" />
                Cửa Hàng
              </Button>
            </div>
            <div className="text-sm text-muted-foreground max-w-md mx-auto">
              🎯 Di chuyển chuột để điều khiển móc<br/>
              🖱️ Click để thả móc<br/>
              💎 Móc vàng, kim cương để kiếm điểm<br/>
              💣 Tránh bom và đá nặng
            </div>
          </div>
        )}

        {gameState === 'shop' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">🛒 Cửa Hàng</h2>
              <div className="text-xl">💰 {totalGold} vàng</div>
            </div>
            <div className="grid gap-4">
              {upgrades.map(upgrade => {
                const Icon = upgrade.icon;
                const cost = upgrade.cost * Math.pow(2, upgrade.level);
                const canBuy = totalGold >= cost && upgrade.level < upgrade.maxLevel;
                
                return (
                  <Card key={upgrade.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Icon className="w-8 h-8 text-primary" />
                        <div>
                          <div className="font-bold">{upgrade.name}</div>
                          <div className="text-sm text-muted-foreground">{upgrade.description}</div>
                          <div className="text-sm">Level: {upgrade.level}/{upgrade.maxLevel}</div>
                        </div>
                      </div>
                      <Button 
                        onClick={() => buyUpgrade(upgrade.id)}
                        disabled={!canBuy}
                        variant={canBuy ? "default" : "secondary"}
                      >
                        {upgrade.level >= upgrade.maxLevel ? 'Max' : `${cost} 💰`}
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
            <Button onClick={() => setGameState('menu')} variant="outline" className="w-full">
              Quay lại
            </Button>
          </div>
        )}

        {(gameState === 'playing' || gameState === 'paused') && (
          <div className="space-y-4">
            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
              <Card className="p-3 text-center">
                <div className="text-sm text-muted-foreground">Level</div>
                <div className="text-2xl font-bold">{currentLevel}</div>
              </Card>
              <Card className="p-3 text-center">
                <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                  <Heart className="w-4 h-4 text-red-500" /> HP
                </div>
                <div className="text-2xl font-bold">{stats.hp}%</div>
                <Progress value={stats.hp} className="mt-1" />
              </Card>
              <Card className="p-3 text-center">
                <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                  <Clock className="w-4 h-4 text-blue-500" /> Time
                </div>
                <div className="text-2xl font-bold">{stats.time}s</div>
              </Card>
              <Card className="p-3 text-center">
                <div className="text-sm text-muted-foreground">Combo</div>
                <div className="text-2xl font-bold">{stats.combo >= 5 ? '🔥' : ''} x{stats.combo >= 5 ? 2 : 1}</div>
              </Card>
            </div>

            {/* Score */}
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm">Điểm: {stats.score}</div>
                <div className="text-sm">Mục tiêu: {getLevelConfig(currentLevel).targetScore}</div>
              </div>
              <Progress value={(stats.score / getLevelConfig(currentLevel).targetScore) * 100} />
            </Card>

            {/* Power-ups */}
            <div className="flex gap-2">
              {powerUps.map(powerUp => (
                <Button
                  key={powerUp.type}
                  onClick={() => activatePowerUp(powerUp.type)}
                  disabled={powerUp.active}
                  variant={powerUp.active ? "secondary" : "default"}
                  size="sm"
                  className="flex-1"
                >
                  {powerUp.type === 'magnet' && <Magnet className="w-4 h-4 mr-1" />}
                  {powerUp.type === 'speed' && <Zap className="w-4 h-4 mr-1" />}
                  {powerUp.type === 'shield' && <Shield className="w-4 h-4 mr-1" />}
                  {powerUp.active && `${powerUp.duration}s`}
                </Button>
              ))}
            </div>

            {/* Canvas */}
            <canvas
              ref={canvasRef}
              width={800}
              height={600}
              className="w-full border-4 border-primary rounded-lg cursor-crosshair"
              onMouseMove={handleCanvasMouseMove}
              onClick={launchHook}
            />

            {/* Controls */}
            <div className="flex gap-2">
              <Button onClick={() => setGameState('paused')} variant="outline" className="flex-1">
                <Pause className="w-4 h-4 mr-2" />
                Tạm dừng
              </Button>
              <Button onClick={() => { setGameState('menu'); audio.stopBackgroundMusic(); }} variant="outline" className="flex-1">
                Về Menu
              </Button>
            </div>
          </div>
        )}

        {gameState === 'victory' && (
          <div className="text-center space-y-6 py-8">
            <div className="text-6xl">🎉</div>
            <h2 className="text-3xl font-bold text-green-500">Chiến thắng!</h2>
            <div className="text-xl space-y-2">
              <div>Level {currentLevel} hoàn thành</div>
              <div>Điểm: {stats.score}</div>
              <div>Combo cao nhất: {stats.combo}</div>
              <div className="text-yellow-500 font-bold">+{currentLevel * 100} 💰</div>
            </div>
            <div className="flex gap-4 justify-center">
              <Button onClick={nextLevel} size="lg">
                {currentLevel < 100 ? `Level ${currentLevel + 1}` : 'Hoàn thành!'}
              </Button>
              <Button onClick={() => setGameState('shop')} variant="outline" size="lg">
                <ShoppingCart className="w-5 h-5 mr-2" />
                Cửa Hàng
              </Button>
              <Button onClick={() => setGameState('menu')} variant="outline" size="lg">
                Menu
              </Button>
            </div>
          </div>
        )}

        {gameState === 'gameover' && (
          <div className="text-center space-y-6 py-8">
            <div className="text-6xl">😢</div>
            <h2 className="text-3xl font-bold text-red-500">Game Over</h2>
            <div className="text-xl space-y-2">
              <div>Level {currentLevel}</div>
              <div>Điểm: {stats.score}</div>
              <div>Vàng còn: {totalGold} 💰</div>
            </div>
            <div className="flex gap-4 justify-center">
              <Button onClick={startLevel} size="lg" className="gap-2">
                <RotateCcw className="w-5 h-5" />
                Thử lại
              </Button>
              <Button onClick={() => setGameState('shop')} variant="outline" size="lg">
                <ShoppingCart className="w-5 h-5 mr-2" />
                Cửa Hàng
              </Button>
              <Button onClick={() => setGameState('menu')} variant="outline" size="lg">
                Menu
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};