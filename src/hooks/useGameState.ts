import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { haptics } from "@/utils/haptics";

interface PowerUp {
  icon: string;
  name: string;
  active: boolean;
  count: number;
  duration?: number;
}

interface GameStateConfig {
  gameId: string;
  initialLives?: number;
  initialPowerUps?: PowerUp[];
  pointsPerAction?: number;
  comboMultiplier?: number;
  targetScore?: number;
}

export const useGameState = ({
  gameId,
  initialLives = 3,
  initialPowerUps = [],
  pointsPerAction = 10,
  comboMultiplier = 1.5,
  targetScore = 100,
}: GameStateConfig) => {
  const { user } = useAuth();
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(initialLives);
  const [combo, setCombo] = useState(0);
  const [coins, setCoins] = useState(0);
  const [powerUps, setPowerUps] = useState<PowerUp[]>(initialPowerUps);
  const [isPaused, setIsPaused] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isWin, setIsWin] = useState(false);
  const [showTutorial, setShowTutorial] = useState(true);
  const [highScore, setHighScore] = useState(0);

  // Check if tutorial was shown before
  useEffect(() => {
    const tutorialKey = `tutorial_shown_${gameId}`;
    const shown = localStorage.getItem(tutorialKey);
    if (shown) {
      setShowTutorial(false);
    }
  }, [gameId]);

  const dismissTutorial = useCallback(() => {
    const tutorialKey = `tutorial_shown_${gameId}`;
    localStorage.setItem(tutorialKey, "true");
    setShowTutorial(false);
  }, [gameId]);

  const addScore = useCallback((points: number, triggerCombo = true) => {
    const comboBonus = triggerCombo && combo > 0 ? Math.floor(points * (combo * 0.1)) : 0;
    const totalPoints = points + comboBonus;
    
    setScore((prev) => prev + totalPoints);
    setCoins((prev) => prev + Math.floor(totalPoints * 10)); // 1 point = 10 coins
    
    if (triggerCombo) {
      setCombo((prev) => prev + 1);
    }
    
    haptics.light();
    return totalPoints;
  }, [combo]);

  const resetCombo = useCallback(() => {
    setCombo(0);
  }, []);

  const loseLife = useCallback(() => {
    haptics.error();
    resetCombo();
    setLives((prev) => {
      const newLives = prev - 1;
      if (newLives <= 0) {
        setIsGameOver(true);
        setIsWin(false);
      }
      return newLives;
    });
  }, [resetCombo]);

  const activatePowerUp = useCallback((index: number) => {
    setPowerUps((prev) => {
      const newPowerUps = [...prev];
      if (newPowerUps[index] && newPowerUps[index].count > 0) {
        newPowerUps[index] = {
          ...newPowerUps[index],
          active: true,
          count: newPowerUps[index].count - 1,
        };
        haptics.success();
        
        // Auto-deactivate after duration
        if (newPowerUps[index].duration) {
          setTimeout(() => {
            setPowerUps((current) => {
              const updated = [...current];
              updated[index] = { ...updated[index], active: false };
              return updated;
            });
          }, newPowerUps[index].duration);
        }
      }
      return newPowerUps;
    });
  }, []);

  const winGame = useCallback(async () => {
    setIsGameOver(true);
    setIsWin(true);
    haptics.success();
    
    // Save score to database
    if (user) {
      try {
        await supabase.from("camly_coin_transactions").insert({
          user_id: user.id,
          amount: coins,
          transaction_type: "game_win",
          description: `Won ${gameId} with score ${score}`,
        });

        // Update wallet balance
        const { data: profile } = await supabase
          .from("profiles")
          .select("wallet_balance")
          .eq("id", user.id)
          .single();

        if (profile) {
          await supabase
            .from("profiles")
            .update({ wallet_balance: (profile.wallet_balance || 0) + coins })
            .eq("id", user.id);
        }
      } catch (error) {
        console.error("Error saving game results:", error);
      }
    }
  }, [user, coins, score, gameId]);

  const loseGame = useCallback(() => {
    setIsGameOver(true);
    setIsWin(false);
    haptics.error();
  }, []);

  const resetGame = useCallback(() => {
    setScore(0);
    setLives(initialLives);
    setCombo(0);
    setCoins(0);
    setPowerUps(initialPowerUps);
    setIsPaused(false);
    setIsGameOver(false);
    setIsWin(false);
  }, [initialLives, initialPowerUps]);

  const togglePause = useCallback(() => {
    setIsPaused((prev) => !prev);
    haptics.light();
  }, []);

  return {
    // State
    score,
    lives,
    combo,
    coins,
    powerUps,
    isPaused,
    isGameOver,
    isWin,
    showTutorial,
    highScore,
    targetScore,
    
    // Actions
    addScore,
    resetCombo,
    loseLife,
    activatePowerUp,
    winGame,
    loseGame,
    resetGame,
    togglePause,
    dismissTutorial,
    setScore,
    setLives,
    setCombo,
  };
};
