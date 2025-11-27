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
import { MemoryCards } from "@/components/games/MemoryCards";
import { GuessNumber } from "@/components/games/GuessNumber";
import { ColorMatch } from "@/components/games/ColorMatch";
import { BalloonPop } from "@/components/games/BalloonPop";
import { WordScramble } from "@/components/games/WordScramble";
import { MathQuiz } from "@/components/games/MathQuiz";
import { SimonSays } from "@/components/games/SimonSays";
import { TriviaQuiz } from "@/components/games/TriviaQuiz";
import { MazeRunner } from "@/components/games/MazeRunner";
import { TreasureHunt } from "@/components/games/TreasureHunt";
import { Platformer } from "@/components/games/Platformer";
import { Racing } from "@/components/games/Racing";
import PlanetBuilder from "@/components/games/PlanetBuilder";
import HappinessGarden from "@/components/games/HappinessGarden";
import SpaceExplorer from "@/components/games/SpaceExplorer";
import CityCreator from "@/components/games/CityCreator";
import StarCollector from "@/components/games/StarCollector";
import DreamWorld from "@/components/games/DreamWorld";
import GardenBuilder from "@/components/games/GardenBuilder";
import OceanExplorer from "@/components/games/OceanExplorer";
import SkyCastle from "@/components/games/SkyCastle";
import PetParadise from "@/components/games/PetParadise";
import MusicCreator from "@/components/games/MusicCreator";
import FlowerField from "@/components/games/FlowerField";
import LilBlockBuddy from "@/components/games/LilBlockBuddy";
import { Game2048Nexus } from "@/components/games/Game2048Nexus";

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
      // Casual & Happy Games
      case "MemoryCards": return <MemoryCards {...gameProps} />;
      case "ColorMatch": return <ColorMatch {...gameProps} />;
      case "BalloonPop": return <BalloonPop {...gameProps} />;
      case "StarCollector": return <StarCollector {...gameProps} />;
      case "HappinessGarden": return <HappinessGarden {...gameProps} />;
      case "FlowerField": return <FlowerField {...gameProps} />;
      case "PetParadise": return <PetParadise {...gameProps} />;
      case "MusicCreator": return <MusicCreator {...gameProps} />;
      
      // Brain & Educational Games
      case "GuessNumber": return <GuessNumber {...gameProps} />;
      case "WordScramble": return <WordScramble {...gameProps} />;
      case "MathQuiz": return <MathQuiz {...gameProps} />;
      case "SimonSays": return <SimonSays {...gameProps} />;
      case "TriviaQuiz": return <TriviaQuiz {...gameProps} />;
      
      // Building & Creation Games
      case "PlanetBuilder": return <PlanetBuilder {...gameProps} />;
      case "CityCreator": return <CityCreator {...gameProps} />;
      case "GardenBuilder": return <GardenBuilder {...gameProps} />;
      case "SkyCastle": return <SkyCastle {...gameProps} />;
      case "DreamWorld": return <DreamWorld {...gameProps} />;
      
      // Exploration & Adventure Games
      case "SpaceExplorer": return <SpaceExplorer {...gameProps} />;
      case "OceanExplorer": return <OceanExplorer {...gameProps} />;
      case "MazeRunner": return <MazeRunner {...gameProps} />;
      case "TreasureHunt": return <TreasureHunt {...gameProps} />;
      case "Platformer": return <Platformer {...gameProps} />;
      case "Racing": return <Racing {...gameProps} />;
      case "LilBlockBuddy": return <LilBlockBuddy {...gameProps} />;
      case "Game2048Nexus": return <Game2048Nexus {...gameProps} />;
      
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
    <div className="min-h-screen bg-gradient-to-br from-[#E0F2FF] via-[#F0E7FF] to-[#FAF5FF]">
      <Navigation />
      
      <section className="pt-20 pb-8 px-[2%]">
        <div className="w-[96vw] max-w-[380px] mx-auto">
          <div className="game-card bg-gradient-to-br from-white to-[#F8F9FF] backdrop-blur-lg rounded-[36px] border-0 shadow-[0_16px_40px_rgba(139,70,255,0.2)] p-[24px_20px] space-y-4 animate-scale-in relative">
            {/* Back button inside card - top left */}
            <div className="absolute top-5 left-5 z-10">
              <Link to="/games">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="font-fredoka font-bold border-2 border-primary/30 hover:border-primary hover:bg-primary/10 transform hover:scale-105 transition-all rounded-[20px]"
                >
                  <ArrowLeft className="mr-1 h-4 w-4" />
                  Back
                </Button>
              </Link>
            </div>

            {/* Game title section */}
            <div className="text-center space-y-2 pt-12">
              <h1 className="text-[32px] sm:text-4xl font-fredoka font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                {game.title}
              </h1>
              <div className="text-3xl">🎮</div>
              <p className="text-[15px] font-comic text-muted-foreground max-w-sm mx-auto px-2">
                {game.description}
              </p>
              <p className="text-[13px] font-comic text-muted-foreground">
                🎯 Played {game.total_plays} times! 🌟
              </p>
            </div>

            {/* Game content */}
            <div className="w-full pt-2">
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
