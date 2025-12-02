import { useParams, Link } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Zap, RotateCcw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useGameLevel } from "@/hooks/useGameLevel";
import { useIsLandscape } from "@/hooks/use-mobile";
import { LevelSelector } from "@/components/LevelSelector";
import { FlowerFieldLevelSelector } from "@/components/FlowerFieldLevelSelector";
import { DailyChallengeCard } from "@/components/DailyChallengeCard";
import { LiveComboNotifications } from "@/components/LiveComboNotifications";
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
import { ArtStudio } from "@/components/games/ArtStudio";
import { PetCare } from "@/components/games/PetCare";
import { FarmBuilder } from "@/components/games/FarmBuilder";
import { SpaceStation } from "@/components/games/SpaceStation";
import { ZooKeeper } from "@/components/games/ZooKeeper";
import { HospitalManager } from "@/components/games/HospitalManager";
import { CinemaBoss } from "@/components/games/CinemaBoss";
import { LibraryKeeper } from "@/components/games/LibraryKeeper";
import { RestaurantChef } from "@/components/games/RestaurantChef";
import { ThemeParkBuilder } from "@/components/games/ThemeParkBuilder";
import { GoldMiner } from "@/components/games/GoldMiner";
import { GoldHookMaster } from "@/components/games/GoldHookMaster";

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
  const isLandscape = useIsLandscape();
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLevelSelector, setShowLevelSelector] = useState(true);
  const [gameStarted, setGameStarted] = useState(false);
  const hasTrackedPlayRef = useRef(false);
  const [autoLevel, setAutoLevel] = useState(() => {
    const saved = localStorage.getItem("autoLevel");
    return saved !== null ? JSON.parse(saved) : true;
  });
  
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
      hasTrackedPlayRef.current = false; // Reset tracking when game changes
      fetchGame();
    }
  }, [gameId]);

  useEffect(() => {
    if (game && user && !hasTrackedPlayRef.current) {
      hasTrackedPlayRef.current = true;
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

      // Update user profile plays and award Camly Coins
      const { data: profile } = await supabase
        .from("profiles")
        .select("total_plays, wallet_balance")
        .eq("id", user.id)
        .single();

      if (profile) {
        await supabase
          .from("profiles")
          .update({ 
            total_plays: (profile.total_plays || 0) + 1,
            wallet_balance: (profile.wallet_balance || 0) + 10000
          })
          .eq("id", user.id);
        
        // Log transaction (CoinNotification component will handle the notification via realtime)
        await supabase.from("camly_coin_transactions").insert({
          user_id: user.id,
          amount: 10000,
          transaction_type: "game_play",
          description: `Played ${game.title}`
        });
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

  const handleAutoLevelToggle = (checked: boolean) => {
    setAutoLevel(checked);
    localStorage.setItem("autoLevel", JSON.stringify(checked));
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

    // Auto-advance to next level after confetti if enabled
    setTimeout(() => {
      if (autoLevel && currentLevel < 10) {
        setCurrentLevel(currentLevel + 1);
        setShowLevelSelector(false);
        setGameStarted(true);
      } else {
        // Show level selector if auto-level is off or all levels completed
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
      case "ArtStudio":
      case "art-studio":
        return <ArtStudio {...gameProps} />;
      case "PetCare":
      case "pet-care":
        return <PetCare {...gameProps} />;
      case "FarmBuilder":
      case "farm-builder":
        return <FarmBuilder {...gameProps} />;
      case "SpaceStation":
      case "space-station":
        return <SpaceStation {...gameProps} />;
      case "ZooKeeper":
      case "zoo-keeper":
        return <ZooKeeper {...gameProps} />;
      case "HospitalManager":
      case "hospital-manager":
        return <HospitalManager {...gameProps} />;
      case "CinemaBoss":
      case "cinema-boss":
        return <CinemaBoss {...gameProps} />;
      case "LibraryKeeper":
      case "library-keeper":
        return <LibraryKeeper {...gameProps} />;
      case "RestaurantChef":
      case "restaurant-chef":
        return <RestaurantChef {...gameProps} />;
      case "ThemeParkBuilder":
      case "theme-park-builder":
        return <ThemeParkBuilder {...gameProps} />;
      case "GoldMiner":
      case "gold-miner":
        return <GoldMiner {...gameProps} />;
      case "GoldHookMaster":
      case "gold-hook-master":
        return <GoldHookMaster onBack={handleBackToLevelSelect} />;
      
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
                       gameId === 'eco-village' ||
                       gameId === 'art-studio' ||
                       gameId === 'pet-care' ||
                       gameId === 'farm-builder' ||
                       gameId === 'space-station' ||
                       gameId === 'zoo-keeper' ||
                       gameId === 'hospital-manager' ||
                       gameId === 'cinema-boss' ||
                       gameId === 'library-keeper' ||
                       gameId === 'restaurant-chef' ||
                        gameId === 'theme-park-builder' ||
                        gameId === 'gold-miner' ||
                        gameId === 'gold-hook-master';
  
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
      {!isLandscape && <Navigation />}
      <LiveComboNotifications />
      
      {isLandscape && gameStarted && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-primary/90 to-secondary/90 backdrop-blur-md px-3 py-2 flex items-center justify-between border-b-2 border-white/20 animate-slide-in-right">
          <Link to="/games">
            <Button 
              variant="ghost" 
              size="sm"
              className="text-white hover:bg-white/20 font-fredoka font-bold h-8 px-3"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <RotateCcw className="h-4 w-4 text-white" />
            <span className="text-sm font-fredoka font-bold text-white">
              {game?.title || 'Game'}
            </span>
          </div>
          <div className="w-8" />
        </div>
      )}
      
      <section className={isLandscape ? "pt-12 pb-2 px-2" : "pt-24 pb-24 md:pb-12 px-4"}>
        <div className={isLandscape ? "h-[calc(100vh-3.5rem)]" : "container mx-auto max-w-6xl"}>
          {!isLandscape && (
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
              
              <div className="flex items-center gap-3 bg-gradient-to-r from-primary/10 to-secondary/10 px-4 py-3 rounded-2xl border-2 border-primary/30">
                <Zap className="h-5 w-5 text-primary" />
                <Label htmlFor="auto-level" className="font-fredoka font-bold text-foreground cursor-pointer">
                  Auto Level
                </Label>
                <Switch
                  id="auto-level"
                  checked={autoLevel}
                  onCheckedChange={handleAutoLevelToggle}
                  className="data-[state=checked]:bg-primary"
                />
              </div>
            </div>
          )}

          <div className={isLandscape && gameStarted 
            ? "h-full bg-background/95 backdrop-blur-lg rounded-2xl border-2 border-primary/30 shadow-xl p-3 animate-scale-in overflow-hidden" 
            : "bg-background/80 backdrop-blur-lg rounded-3xl border-4 border-primary/30 shadow-2xl p-8 space-y-6 animate-scale-in"
          }>
            {(!isLandscape || !gameStarted) && (
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
            )}

            <div className={isLandscape && gameStarted ? "h-full" : "w-full"}>
              {/* Show Daily Challenge Card for Gold Miner game */}
              {!isLandscape && (gameId === 'gold-miner' || game?.component_name === 'GoldMiner') && gameStarted && (
                <div className="mb-6">
                  <DailyChallengeCard />
                </div>
              )}
              
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
