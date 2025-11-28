import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useGameLevel } from "@/hooks/useGameLevel";
import { LevelSelector } from "@/components/LevelSelector";
import { FlowerFieldLevelSelector } from "@/components/FlowerFieldLevelSelector";
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
import { HappyKitchenJoy } from "@/components/games/HappyKitchenJoy";
import { CookingMama } from "@/components/games/CookingMama";
import SchoolBuilder from "@/components/games/SchoolBuilder";
import HappyPark from "@/components/games/HappyPark";
import HomeDesigner from "@/components/games/HomeDesigner";
import CommunityHub from "@/components/games/CommunityHub";
import EcoVillage from "@/components/games/EcoVillage";

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
    const levelConfig = getLevelConfig(currentLevel);
    const gameProps = {
      level: currentLevel,
      difficultyMultiplier: levelConfig.difficultyMultiplier,
      onLevelComplete: handleLevelComplete,
      onBack: handleBackToLevelSelect,
    };

    // Support both database games and direct gameId routing
    const componentKey = game?.component_name || gameId;

    // Map component_name from database to actual components
    switch (componentKey) {
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
      case "SchoolBuilder":
      case "school-builder":
        return <SchoolBuilder {...gameProps} />;
      case "HappyPark":
      case "happy-park":
        return <HappyPark {...gameProps} />;
      case "HomeDesigner":
      case "home-designer":
        return <HomeDesigner {...gameProps} />;
      case "CommunityHub":
      case "community-hub":
        return <CommunityHub {...gameProps} />;
      case "EcoVillage":
      case "eco-village":
        return <EcoVillage {...gameProps} />;
      
      // Exploration & Adventure Games
      case "SpaceExplorer": return <SpaceExplorer {...gameProps} />;
      case "OceanExplorer": return <OceanExplorer {...gameProps} />;
      case "MazeRunner": return <MazeRunner {...gameProps} />;
      case "TreasureHunt": return <TreasureHunt {...gameProps} />;
      case "Platformer": return <Platformer {...gameProps} />;
      case "Racing": return <Racing {...gameProps} />;
      case "LilBlockBuddy": return <LilBlockBuddy {...gameProps} />;
      case "Game2048Nexus": 
      case "2048-nexus":
        return <Game2048Nexus {...gameProps} />;
      case "HappyKitchenJoy": 
      case "happy-kitchen-joy":
        return <HappyKitchenJoy onBack={handleBackToLevelSelect} />;
      case "CookingMama":
      case "cooking-mama":
        return <CookingMama />;
      
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

  // Allow playing games that aren't in database yet
  const isDirectGame = gameId === 'cooking-mama' || 
                       gameId === 'happy-kitchen-joy' ||
                       gameId === 'school-builder' ||
                       gameId === 'happy-park' ||
                       gameId === 'home-designer' ||
                       gameId === 'community-hub' ||
                       gameId === 'eco-village';
  
  if (!game && !isDirectGame) {
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
    <div className="min-h-screen bg-white">
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
                {game?.title || (gameId === 'cooking-mama' ? 'Cooking Mama' : 'Game')} 🎮
              </h1>
              <p className="text-lg font-comic text-muted-foreground max-w-2xl mx-auto">
                {game?.description || (gameId === 'cooking-mama' ? 'Master recipes with timing and precision mini-games!' : '')}
              </p>
              {game && (
                <p className="text-sm font-comic text-muted-foreground">
                  🎯 Played {game.total_plays} times! Keep it up! 🌟
                </p>
              )}
            </div>

            <div className="w-full">
              {showLevelSelector && !gameStarted && game?.component_name !== "HappyKitchenJoy" && game?.component_name !== "CookingMama" && !isDirectGame ? (
                game.component_name === "FlowerField" ? (
                  <FlowerFieldLevelSelector
                    highestLevelCompleted={highestLevelCompleted}
                    currentLevel={currentLevel}
                    onLevelSelect={setCurrentLevel}
                    onStartGame={handleStartGame}
                    getCoinReward={getCoinReward}
                  />
                ) : (
                  <LevelSelector
                    highestLevelCompleted={highestLevelCompleted}
                    currentLevel={currentLevel}
                    onLevelSelect={setCurrentLevel}
                    onStartGame={handleStartGame}
                    getCoinReward={getCoinReward}
                  />
                )
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
