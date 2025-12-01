import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";

type MineItem = "gold" | "diamond" | "emerald" | "ruby" | "coin" | "treasure" | "crystal" | "stone" | "hammer" | "bomb";
type PowerUpType = "hammer" | "bomb" | null;

interface GoldMinerProps {
  level: number;
  onLevelComplete: () => void;
  onBack?: () => void;
}

interface MinedItem {
  id: number;
  type: MineItem;
  x: number;
  y: number;
  emoji: string;
  value: number;
}

interface DailyChallenge {
  id: string;
  challenge_id: string;
  combo_challenges: {
    title: string;
    challenge_type: string;
    target_combo: number;
    time_limit_seconds: number | null;
    required_level: number | null;
    prize_amount: number;
  };
}

const itemData: Record<MineItem, { emoji: string; value: number; rarity: number; isPowerUp?: boolean }> = {
  stone: { emoji: "🪨", value: 1, rarity: 45 },
  coin: { emoji: "🪙", value: 5, rarity: 28 },
  gold: { emoji: "💰", value: 10, rarity: 13 },
  emerald: { emoji: "💚", value: 20, rarity: 7 },
  ruby: { emoji: "💎", value: 30, rarity: 4 },
  diamond: { emoji: "💎", value: 50, rarity: 2 },
  crystal: { emoji: "🔮", value: 75, rarity: 1.5 },
  treasure: { emoji: "👑", value: 100, rarity: 0.5 },
  hammer: { emoji: "🔨", value: 0, rarity: 3, isPowerUp: true },
  bomb: { emoji: "💣", value: 0, rarity: 1, isPowerUp: true },
};

export const GoldMiner = ({ level, onLevelComplete, onBack }: GoldMinerProps) => {
  const { user } = useAuth();
  const [minedItems, setMinedItems] = useState<MinedItem[]>([]);
  const [totalValue, setTotalValue] = useState(0);
  const [clicks, setClicks] = useState(0);
  const [nextId, setNextId] = useState(1);
  const [lastItem, setLastItem] = useState<string>("");
  const [powerUps, setPowerUps] = useState<{ hammer: number; bomb: number }>({ hammer: 0, bomb: 0 });
  const [activePowerUp, setActivePowerUp] = useState<PowerUpType>(null);
  const [explosionEffect, setExplosionEffect] = useState<{ x: number; y: number } | null>(null);
  const [combo, setCombo] = useState(0);
  const [comboMultiplier, setComboMultiplier] = useState(1);
  const [lastClickTime, setLastClickTime] = useState<number>(Date.now());
  const [showComboText, setShowComboText] = useState(false);
  const [highestCombo, setHighestCombo] = useState(0);
  const [comboRecordSaved, setComboRecordSaved] = useState(false);
  
  // Challenge tracking
  const [dailyChallenge, setDailyChallenge] = useState<DailyChallenge | null>(null);
  const [challengeProgress, setChallengeProgress] = useState<any>(null);
  const [challengeStartTime, setChallengeStartTime] = useState<number | null>(null);
  const [challengeMissCount, setChallengeMissCount] = useState(0);

  const targetValue = level * 200;
  const maxClicks = level * 30;
  const comboTimeout = 2000; // 2 seconds to maintain combo

  // Fetch daily challenge on mount
  useEffect(() => {
    fetchDailyChallenge();
  }, []);

  const fetchDailyChallenge = async () => {
    if (!user) return;

    try {
      const { data: challengeData } = await supabase
        .from("daily_combo_challenges")
        .select(`
          *,
          combo_challenges (*)
        `)
        .eq("is_active", true)
        .eq("challenge_date", new Date().toISOString().split('T')[0])
        .single();

      if (challengeData) {
        setDailyChallenge(challengeData as any);

        // Check for existing progress
        const { data: progressData } = await supabase
          .from("user_challenge_progress")
          .select("*")
          .eq("user_id", user.id)
          .eq("daily_challenge_id", challengeData.id)
          .maybeSingle();

        setChallengeProgress(progressData);

        // Don't start tracking if already completed
        if (!progressData?.completed_at) {
          setChallengeStartTime(Date.now());
        }
      }
    } catch (error) {
      console.error("Error fetching daily challenge:", error);
    }
  };

  useEffect(() => {
    if (totalValue >= targetValue) {
      onLevelComplete();
    }
  }, [totalValue, targetValue, onLevelComplete]);

  // Combo timer - reset combo if too much time passes
  useEffect(() => {
    const checkComboTimeout = setInterval(() => {
      const timeSinceLastClick = Date.now() - lastClickTime;
      if (timeSinceLastClick > comboTimeout && combo > 0) {
        setCombo(0);
        setComboMultiplier(1);
        toast.info("💔 Combo bị mất!");
      }
    }, 100);

    return () => clearInterval(checkComboTimeout);
  }, [lastClickTime, combo, comboTimeout]);

  // Calculate combo multiplier based on combo count
  useEffect(() => {
    if (combo >= 50) {
      setComboMultiplier(5);
    } else if (combo >= 30) {
      setComboMultiplier(4);
    } else if (combo >= 20) {
      setComboMultiplier(3);
    } else if (combo >= 10) {
      setComboMultiplier(2);
    } else if (combo >= 5) {
      setComboMultiplier(1.5);
    } else {
      setComboMultiplier(1);
    }

    // Track highest combo and save to database
    if (combo > highestCombo) {
      setHighestCombo(combo);
      setComboRecordSaved(false);
    }

    // Save combo record when reaching new milestones
    if (user && combo > highestCombo && combo >= 10 && !comboRecordSaved) {
      saveComboRecord(combo);
      setComboRecordSaved(true);
    }

    // Check and update challenge progress
    if (dailyChallenge && user && !challengeProgress?.completed_at) {
      checkChallengeProgress(combo);
    }
  }, [combo, highestCombo, comboRecordSaved, user, dailyChallenge, challengeProgress]);

  const getRandomItem = (): MineItem => {
    const random = Math.random() * 100;
    let cumulative = 0;

    for (const [item, data] of Object.entries(itemData)) {
      cumulative += data.rarity;
      if (random <= cumulative) {
        return item as MineItem;
      }
    }
    return "stone";
  };

  const saveComboRecord = async (currentCombo: number) => {
    if (!user) return;

    try {
      // Fetch user profile for broadcast
      const { data: profile } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", user.id)
        .single();

      const { data: existingRecord } = await supabase
        .from("gold_miner_combos")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (existingRecord) {
        if (currentCombo > existingRecord.highest_combo) {
          await supabase
            .from("gold_miner_combos")
            .update({
              highest_combo: currentCombo,
              level_achieved: level,
              total_value: totalValue,
            })
            .eq("user_id", user.id);
          
          toast.success(`🏆 Kỷ lục mới: ${currentCombo} combo!`);
          
          // Broadcast milestone to all users for significant combos
          if (currentCombo >= 30) {
            const channel = supabase.channel('combo-milestones');
            await channel.send({
              type: 'broadcast',
              event: 'milestone',
              payload: {
                user_id: user.id,
                username: profile?.username || 'Unknown',
                combo: currentCombo,
                level: level,
              }
            });
          }
        }
      } else {
        await supabase
          .from("gold_miner_combos")
          .insert({
            user_id: user.id,
            highest_combo: currentCombo,
            level_achieved: level,
            total_value: totalValue,
          });
        
        toast.success(`🏆 Lần đầu lên bảng xếp hạng: ${currentCombo} combo!`);
        
        // Broadcast first leaderboard entry
        if (currentCombo >= 30) {
          const channel = supabase.channel('combo-milestones');
          await channel.send({
            type: 'broadcast',
            event: 'milestone',
            payload: {
              user_id: user.id,
              username: profile?.username || 'Unknown',
              combo: currentCombo,
              level: level,
            }
          });
        }
      }
    } catch (error) {
      console.error("Error saving combo record:", error);
    }
  };

  const checkChallengeProgress = async (currentCombo: number) => {
    if (!dailyChallenge || !user || !challengeStartTime) return;

    const challenge = dailyChallenge.combo_challenges;
    const timeTaken = Math.floor((Date.now() - challengeStartTime) / 1000);
    let isCompleted = false;

    // Check challenge conditions
    switch (challenge.challenge_type) {
      case 'time_limit':
        isCompleted = currentCombo >= challenge.target_combo && 
                     (!challenge.time_limit_seconds || timeTaken <= challenge.time_limit_seconds);
        break;
      
      case 'no_miss':
        isCompleted = currentCombo >= challenge.target_combo && challengeMissCount === 0;
        break;
      
      case 'level_specific':
        isCompleted = currentCombo >= challenge.target_combo && 
                     (!challenge.required_level || level === challenge.required_level);
        break;
      
      case 'value_target':
        isCompleted = currentCombo >= challenge.target_combo && totalValue >= (challenge.target_combo * 200);
        break;
      
      default:
        isCompleted = currentCombo >= challenge.target_combo;
    }

    // Update or create progress record
    try {
      const progressData = {
        user_id: user.id,
        daily_challenge_id: dailyChallenge.id,
        current_combo: currentCombo,
        highest_combo: Math.max(currentCombo, challengeProgress?.highest_combo || 0),
        time_taken_seconds: timeTaken,
        missed_count: challengeMissCount,
        started_at: new Date(challengeStartTime).toISOString(),
      };

      if (challengeProgress) {
        await supabase
          .from("user_challenge_progress")
          .update(progressData)
          .eq("id", challengeProgress.id);
      } else {
        const { data } = await supabase
          .from("user_challenge_progress")
          .insert(progressData)
          .select()
          .single();
        
        setChallengeProgress(data);
      }

      // Handle completion
      if (isCompleted && !challengeProgress?.completed_at) {
        await supabase
          .from("user_challenge_progress")
          .update({ 
            completed_at: new Date().toISOString(),
          })
          .eq("user_id", user.id)
          .eq("daily_challenge_id", dailyChallenge.id);

        // Update total completions
        const { data: challengeData } = await supabase
          .from("daily_combo_challenges")
          .select("total_completions")
          .eq("id", dailyChallenge.id)
          .single();
        
        if (challengeData) {
          await supabase
            .from("daily_combo_challenges")
            .update({ total_completions: challengeData.total_completions + 1 })
            .eq("id", dailyChallenge.id);
        }

        toast.success(`🎊 Thử thách hoàn thành! +${challenge.prize_amount} tokens`, {
          duration: 5000,
        });

        setChallengeProgress({ ...challengeProgress, completed_at: new Date().toISOString() });
      }
    } catch (error) {
      console.error("Error updating challenge progress:", error);
    }
  };

  const handleMineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (clicks >= maxClicks && totalValue < targetValue) {
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    // Update combo
    const currentTime = Date.now();
    const timeSinceLastClick = currentTime - lastClickTime;
    
    if (timeSinceLastClick <= comboTimeout) {
      const newCombo = combo + 1;
      setCombo(newCombo);
      setLastClickTime(currentTime);
      
      // Show combo milestone messages
      if (newCombo === 5) {
        toast.success("🔥 Combo x1.5!");
        setShowComboText(true);
        setTimeout(() => setShowComboText(false), 1000);
      } else if (newCombo === 10) {
        toast.success("⚡ Combo x2!");
        setShowComboText(true);
        setTimeout(() => setShowComboText(false), 1000);
      } else if (newCombo === 20) {
        toast.success("💫 Combo x3!");
        setShowComboText(true);
        setTimeout(() => setShowComboText(false), 1000);
      } else if (newCombo === 30) {
        toast.success("🌟 Combo x4!");
        setShowComboText(true);
        setTimeout(() => setShowComboText(false), 1000);
      } else if (newCombo === 50) {
        toast.success("👑 MEGA COMBO x5!");
        setShowComboText(true);
        setTimeout(() => setShowComboText(false), 1000);
      }
    } else {
      setCombo(1);
      setLastClickTime(currentTime);
      
      // Track missed combo for challenge
      if (combo > 0 && dailyChallenge?.combo_challenges.challenge_type === 'no_miss') {
        setChallengeMissCount(prev => prev + 1);
      }
    }

    // Show explosion effect
    if (activePowerUp) {
      setExplosionEffect({ x, y });
      setTimeout(() => setExplosionEffect(null), 1000);
    }

    // Determine mining area based on power-up
    let miningArea = 1;
    if (activePowerUp === "hammer") {
      miningArea = 3; // 3x3 area
      setPowerUps((prev) => ({ ...prev, hammer: prev.hammer - 1 }));
      toast.success("🔨 Búa lớn đào 3x3 khu vực!");
    } else if (activePowerUp === "bomb") {
      miningArea = 5; // 5x5 area
      setPowerUps((prev) => ({ ...prev, bomb: prev.bomb - 1 }));
      toast.success("💣 Bom phát nổ đào 5x5 khu vực!");
    }

    // Mine multiple items based on area
    const newItems: MinedItem[] = [];
    let totalValueGained = 0;
    
    for (let i = 0; i < miningArea; i++) {
      const offsetX = (Math.random() - 0.5) * 10;
      const offsetY = (Math.random() - 0.5) * 10;
      const itemType = getRandomItem();
      const itemInfo = itemData[itemType];

      // Check if it's a power-up
      if (itemInfo.isPowerUp) {
        if (itemType === "hammer") {
          setPowerUps((prev) => ({ ...prev, hammer: prev.hammer + 1 }));
          toast.success("🔨 Nhận được Búa Lớn!");
        } else if (itemType === "bomb") {
          setPowerUps((prev) => ({ ...prev, bomb: prev.bomb + 1 }));
          toast.success("💣 Nhận được Bom!");
        }
      }

      const newItem: MinedItem = {
        id: nextId + i,
        type: itemType,
        x: Math.max(0, Math.min(100, x + offsetX)),
        y: Math.max(0, Math.min(100, y + offsetY)),
        emoji: itemInfo.emoji,
        value: itemInfo.value,
      };

      newItems.push(newItem);
      totalValueGained += itemInfo.value;
    }

    // Apply combo multiplier to value gained
    const multipliedValue = Math.floor(totalValueGained * comboMultiplier);
    const bonusValue = multipliedValue - totalValueGained;

    setMinedItems([...minedItems, ...newItems]);
    setTotalValue(totalValue + multipliedValue);
    setClicks(clicks + 1);
    setNextId(nextId + miningArea);
    
    if (multipliedValue > 0) {
      if (bonusValue > 0) {
        setLastItem(`+${totalValueGained} 💰 (Combo: +${bonusValue})`);
      } else {
        setLastItem(`+${totalValueGained} 💰`);
      }
    } else {
      setLastItem("");
    }
    
    setActivePowerUp(null);

    // Remove items after animation
    setTimeout(() => {
      setMinedItems((prev) => prev.filter((item) => !newItems.find((ni) => ni.id === item.id)));
    }, 2000);
  };

  const usePowerUp = (type: PowerUpType) => {
    if (!type) return;
    
    if (type === "hammer" && powerUps.hammer > 0) {
      setActivePowerUp("hammer");
      toast.info("🔨 Click để đào với Búa Lớn!");
    } else if (type === "bomb" && powerUps.bomb > 0) {
      setActivePowerUp("bomb");
      toast.info("💣 Click để đào với Bom!");
    } else {
      toast.error("Không có power-up này!");
    }
  };

  const resetGame = () => {
    setMinedItems([]);
    setTotalValue(0);
    setClicks(0);
    setNextId(1);
    setLastItem("");
    setPowerUps({ hammer: 0, bomb: 0 });
    setActivePowerUp(null);
    setExplosionEffect(null);
    setCombo(0);
    setComboMultiplier(1);
    setLastClickTime(Date.now());
    setShowComboText(false);
  };

  const progressPercentage = Math.min((totalValue / targetValue) * 100, 100);
  const clicksRemaining = maxClicks - clicks;

  return (
    <Card className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Level {level}</h2>
        <div className="flex items-center gap-3">
          {combo > 0 && (
            <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${
              combo >= 50 ? "bg-purple-500" :
              combo >= 30 ? "bg-red-500" :
              combo >= 20 ? "bg-orange-500" :
              combo >= 10 ? "bg-yellow-500" :
              "bg-blue-500"
            } text-white font-bold animate-pulse`}>
              <span className="text-lg">🔥</span>
              <span>{combo}x</span>
              {comboMultiplier > 1 && (
                <span className="text-sm ml-1">({comboMultiplier}x)</span>
              )}
            </div>
          )}
          <div className="text-lg font-bold text-yellow-500">
            💰 {totalValue} / {targetValue}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Tiến độ:</span>
          <span className="font-bold">{progressPercentage.toFixed(0)}%</span>
        </div>
        <div className="w-full bg-secondary/30 rounded-full h-4 overflow-hidden">
          <div
            className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-full transition-all duration-300 flex items-center justify-center"
            style={{ width: `${progressPercentage}%` }}
          >
            {progressPercentage > 10 && (
              <span className="text-xs font-bold text-white">
                {progressPercentage.toFixed(0)}%
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center text-sm">
        <div>
          ⛏️ Số lần đào: <span className="font-bold text-primary">{clicks}</span>
        </div>
        <div>
          Còn lại: <span className="font-bold text-orange-500">{clicksRemaining}</span>
        </div>
      </div>

      {/* Power-ups */}
      <div className="flex gap-2 justify-center">
        <Button
          onClick={() => usePowerUp("hammer")}
          disabled={powerUps.hammer === 0 || activePowerUp !== null}
          variant={activePowerUp === "hammer" ? "default" : "outline"}
          className={`font-bold text-lg px-4 py-6 ${
            activePowerUp === "hammer" ? "animate-pulse border-4 border-orange-500" : ""
          }`}
        >
          🔨 Búa Lớn
          <span className="ml-2 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
            {powerUps.hammer}
          </span>
        </Button>
        <Button
          onClick={() => usePowerUp("bomb")}
          disabled={powerUps.bomb === 0 || activePowerUp !== null}
          variant={activePowerUp === "bomb" ? "default" : "outline"}
          className={`font-bold text-lg px-4 py-6 ${
            activePowerUp === "bomb" ? "animate-pulse border-4 border-red-500" : ""
          }`}
        >
          💣 Bom
          <span className="ml-2 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
            {powerUps.bomb}
          </span>
        </Button>
      </div>

      {/* Combo Milestone Text */}
      {showComboText && (
        <div className="text-center text-3xl font-bold animate-bounce">
          {combo >= 50 ? "👑 MEGA COMBO!" :
           combo >= 30 ? "🌟 SUPER COMBO!" :
           combo >= 20 ? "💫 GREAT COMBO!" :
           combo >= 10 ? "⚡ COMBO!" :
           "🔥 COMBO START!"}
        </div>
      )}

      {activePowerUp && (
        <div className="text-center text-lg font-bold text-orange-500 animate-pulse">
          {activePowerUp === "hammer" ? "🔨 Click để đào với Búa Lớn!" : "💣 Click để đào với Bom!"}
        </div>
      )}

      {lastItem && (
        <div className="text-center text-2xl font-bold text-yellow-500 animate-bounce">
          {lastItem}
        </div>
      )}

      <div
        onClick={handleMineClick}
        className={`relative h-96 bg-gradient-to-b from-amber-900 via-yellow-800 to-amber-950 rounded-lg border-2 overflow-hidden ${
          clicks >= maxClicks && totalValue < targetValue
            ? "cursor-not-allowed opacity-50 border-gray-600"
            : activePowerUp === "hammer"
            ? "cursor-crosshair border-4 border-orange-500 hover:border-orange-400"
            : activePowerUp === "bomb"
            ? "cursor-crosshair border-4 border-red-500 hover:border-red-400"
            : "cursor-pointer border-yellow-600 hover:border-yellow-400"
        }`}
      >
        {/* Mining Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-yellow-600 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
            />
          ))}
        </div>

        {/* Explosion Effect */}
        {explosionEffect && (
          <div
            className="absolute text-9xl animate-ping"
            style={{
              left: `${explosionEffect.x}%`,
              top: `${explosionEffect.y}%`,
              transform: "translate(-50%, -50%)",
              animationDuration: "0.5s",
            }}
          >
            {activePowerUp === "bomb" ? "💥" : "✨"}
          </div>
        )}

        {/* Center Icon */}
        {clicks < maxClicks && totalValue < targetValue && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className={`text-8xl ${activePowerUp ? "animate-bounce" : "animate-pulse"}`}>
              {activePowerUp === "hammer" ? "🔨" : activePowerUp === "bomb" ? "💣" : "⛏️"}
            </div>
          </div>
        )}

        {/* Mined Items */}
        {minedItems.map((item) => (
          <div
            key={item.id}
            className="absolute text-4xl transform -translate-x-1/2 -translate-y-1/2 animate-in fade-in zoom-in slide-out-to-top-full"
            style={{
              left: `${item.x}%`,
              top: `${item.y}%`,
              animationDuration: "2s",
            }}
          >
            {item.emoji}
          </div>
        ))}

        {/* Game Over Message */}
        {clicks >= maxClicks && totalValue < targetValue && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="text-center text-white">
              <div className="text-4xl mb-4">⛏️</div>
              <p className="text-2xl font-bold mb-2">Hết lượt đào!</p>
              <p className="text-lg">Thiếu {targetValue - totalValue} để hoàn thành</p>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <div className="p-2 bg-secondary/20 rounded">
          <div className="text-2xl">🪙</div>
          <div className="font-bold">+5</div>
        </div>
        <div className="p-2 bg-secondary/20 rounded">
          <div className="font-bold">+10</div>
        </div>
        <div className="p-2 bg-secondary/20 rounded">
          <div className="text-2xl">💎</div>
          <div className="font-bold">+30</div>
        </div>
      </div>

      {/* Power-up Info */}
      <div className="text-center text-xs text-muted-foreground bg-secondary/10 p-3 rounded-lg space-y-1">
        <p className="font-bold mb-1">💡 Hướng dẫn:</p>
        <p>🔨 Búa Lớn: Đào 3x3 khu vực | 💣 Bom: Đào 5x5 khu vực</p>
        <p className="text-orange-500 font-bold">
          🔥 Combo: 5→x1.5 | 10→x2 | 20→x3 | 30→x4 | 50→x5
        </p>
        <p className="text-blue-500">⏱️ Đào liên tục trong 2 giây để giữ combo!</p>
      </div>

      <div className="flex gap-2">
        {onBack && (
          <Button onClick={onBack} variant="outline">
            Quay lại
          </Button>
        )}
        <Link to="/combo-leaderboard">
          <Button variant="default" className="font-bold bg-gradient-to-r from-orange-500 to-red-500">
            🏆 Bảng Xếp Hạng Combo
          </Button>
        </Link>
        <Button onClick={resetGame} variant="outline">
          Làm mới
        </Button>
      </div>
    </Card>
  );
};
