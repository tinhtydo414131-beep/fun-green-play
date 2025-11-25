import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useGameLevel } from "@/hooks/useGameLevel";
import { LevelSelector } from "@/components/LevelSelector";
import confetti from "canvas-confetti";

// Import all game components
import { TicTacToe } from "@/components/games/TicTacToe";
import { MemoryCards } from "@/components/games/MemoryCards";
import { Snake } from "@/components/games/Snake";
import { Game2048 } from "@/components/games/Game2048";
import { GuessNumber } from "@/components/games/GuessNumber";
import { RockPaperScissors } from "@/components/games/RockPaperScissors";
import { ColorMatch } from "@/components/games/ColorMatch";
import { WhackAMole } from "@/components/games/WhackAMole";
import { BalloonPop } from "@/components/games/BalloonPop";
import { FlappyBird } from "@/components/games/FlappyBird";
import { Sudoku } from "@/components/games/Sudoku";
import { WordScramble } from "@/components/games/WordScramble";
import { MathQuiz } from "@/components/games/MathQuiz";
import { SimonSays } from "@/components/games/SimonSays";
import { TriviaQuiz } from "@/components/games/TriviaQuiz";
import { MazeRunner } from "@/components/games/MazeRunner";
import { TreasureHunt } from "@/components/games/TreasureHunt";
import { SpaceShooter } from "@/components/games/SpaceShooter";
import { Platformer } from "@/components/games/Platformer";
import { DungeonCrawler } from "@/components/games/DungeonCrawler";
import { Racing } from "@/components/games/Racing";
import { TowerDefense } from "@/components/games/TowerDefense";

interface Game {
  id: string;
  title: string;
  description: string;
  component_name: string;
  total_plays: number;
}

const GamePlay = () => {
  const { gameId } = useParams();
  const { user } = useAuth();
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLevelSelector, setShowLevelSelector] = useState(true);
  const [gameStarted, setGameStarted] = useState(false);
  
  const {
    currentLevel,
    setCurrentLevel,
    highestLevelCompleted,
    loading: levelLoading,
    completeLevel,
    getLevelConfig,
    getCoinReward,
  } = useGameLevel(gameId || "");

  useEffect(() => {
    if (gameId) {
      fetchGame();
    }
  }, [gameId]);

  useEffect(() => {
    if (game && user) {
      trackGamePlay();
    }
  }, [game, user]);

  const fetchGame = async () => {
    try {
      const { data, error } = await supabase
        .from("games")
        .select("*")
        .eq("id", gameId)
        .single();

      if (error) throw error;
      setGame(data);
    } catch (error) {
      console.error("Error fetching game:", error);
    } finally {
      setLoading(false);
    }
  };

  const trackGamePlay = async () => {
    if (!game || !user) return;

    try {
      // Update game plays
      await supabase
        .from("games")
        .update({ total_plays: game.total_plays + 1 })
        .eq("id", game.id);

      // Update user profile plays
      const { data: profile } = await supabase
        .from("profiles")
        .select("total_plays")
        .eq("id", user.id)
        .single();

      if (profile) {
        await supabase
          .from("profiles")
          .update({ total_plays: (profile.total_plays || 0) + 1 })
          .eq("id", user.id);
      }
    } catch (error) {
      console.error("Error tracking play:", error);
    }
  };

  const handleStartGame = () => {
    setShowLevelSelector(false);
    setGameStarted(true);
  };

  const handleBackToLevelSelect = () => {
    setShowLevelSelector(true);
    setGameStarted(false);
  };

  const handleLevelComplete = async () => {
    completeLevel(currentLevel);
    
    // Fire confetti 5 times
    const fireConfetti = () => {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181']
      });
    };

    // Fire confetti 5 times with delay
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        fireConfetti();
      }, i * 300);
    }

    // Auto-advance to next level after confetti
    setTimeout(() => {
      if (currentLevel < 10) {
        setCurrentLevel(currentLevel + 1);
        setShowLevelSelector(false);
        setGameStarted(true);
      } else {
        // If completed all levels, show level selector
        setShowLevelSelector(true);
        setGameStarted(false);
      }
    }, 2000);
  };

  const renderGame = () => {
    if (!game) return null;

    const levelConfig = getLevelConfig(currentLevel);
    const gameProps = {
      level: currentLevel,
      difficultyMultiplier: levelConfig.difficultyMultiplier,
      onLevelComplete: handleLevelComplete,
      onBack: handleBackToLevelSelect,
    };

    // Map component_name from database to actual components
    switch (game.component_name) {
      case "TicTacToe": return <TicTacToe {...gameProps} />;
      case "MemoryCards": return <MemoryCards {...gameProps} />;
      case "Snake": return <Snake {...gameProps} />;
      case "Game2048": return <Game2048 {...gameProps} />;
      case "FlappyBird": return <FlappyBird {...gameProps} />;
      case "SpaceShooter": return <SpaceShooter {...gameProps} />;
      case "MazeRunner": return <MazeRunner {...gameProps} />;
      case "ColorMatch": return <ColorMatch {...gameProps} />;
      case "MathQuiz": return <MathQuiz {...gameProps} />;
      case "RockPaperScissors": return <RockPaperScissors {...gameProps} />;
      case "Platformer": return <Platformer {...gameProps} />;
      case "Racing": return <Racing {...gameProps} />;
      case "TowerDefense": return <TowerDefense {...gameProps} />;
      case "DungeonCrawler": return <DungeonCrawler {...gameProps} />;
      
      // Old games still available
      case "GuessNumber": return <GuessNumber {...gameProps} />;
      case "WhackAMole": return <WhackAMole {...gameProps} />;
      case "BalloonPop": return <BalloonPop {...gameProps} />;
      case "Sudoku": return <Sudoku {...gameProps} />;
      case "WordScramble": return <WordScramble {...gameProps} />;
      case "SimonSays": return <SimonSays {...gameProps} />;
      case "TriviaQuiz": return <TriviaQuiz {...gameProps} />;
      case "TreasureHunt": return <TreasureHunt {...gameProps} />;
      
      default:
        return (
          <div className="text-center py-20">
            <p className="text-2xl font-fredoka text-muted-foreground">
              Game not available yet! 🎮
            </p>
          </div>
        );
    }
  };

  if (loading || levelLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto py-32 px-4 text-center">
          <div className="animate-bounce text-6xl mb-4">🎮</div>
          <p className="text-2xl font-fredoka text-primary">Loading game... ⏳</p>
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto py-32 px-4 text-center space-y-4">
          <div className="text-6xl mb-4">😢</div>
          <p className="text-3xl font-fredoka text-primary">Game not found!</p>
          <Link to="/games">
            <Button className="font-fredoka font-bold text-lg px-8 py-6 bg-gradient-to-r from-primary to-secondary">
              <ArrowLeft className="mr-2" />
              Back to Games
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10">
      <Navigation />
      
      <section className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-8 flex items-center justify-between animate-fade-in">
            <Link to="/games">
              <Button 
                variant="outline" 
                className="font-fredoka font-bold border-4 border-primary/30 hover:border-primary hover:bg-primary/10 transform hover:scale-105 transition-all"
              >
                <ArrowLeft className="mr-2 h-5 w-5" />
                Back to Games
              </Button>
            </Link>
          </div>

          <div className="bg-background/80 backdrop-blur-lg rounded-3xl border-4 border-primary/30 shadow-2xl p-8 space-y-6 animate-scale-in">
            <div className="text-center space-y-2">
              <h1 className="text-4xl md:text-5xl font-fredoka font-bold text-primary">
                {game.title} 🎮
              </h1>
              <p className="text-lg font-comic text-muted-foreground max-w-2xl mx-auto">
                {game.description}
              </p>
              <p className="text-sm font-comic text-muted-foreground">
                🎯 Played {game.total_plays} times! Keep it up! 🌟
              </p>
            </div>

            <div className="w-full">
              {showLevelSelector && !gameStarted ? (
                <LevelSelector
                  highestLevelCompleted={highestLevelCompleted}
                  currentLevel={currentLevel}
                  onLevelSelect={setCurrentLevel}
                  onStartGame={handleStartGame}
                  getCoinReward={getCoinReward}
                />
              ) : (
                renderGame()
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default GamePlay;
