import { useParams, Link } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Zap, RotateCcw, Maximize, Minimize } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useGameLevel } from "@/hooks/useGameLevel";
import { useWeb3Rewards } from "@/hooks/useWeb3Rewards";
import { useIsLandscape } from "@/hooks/use-mobile";
import { useFullscreen } from "@/hooks/useFullscreen";
import { LevelSelector } from "@/components/LevelSelector";
import { FlowerFieldLevelSelector } from "@/components/FlowerFieldLevelSelector";
import { DailyChallengeCard } from "@/components/DailyChallengeCard";
import { LiveComboNotifications } from "@/components/LiveComboNotifications";
import { LandscapePrompt } from "@/components/LandscapePrompt";
import { Web3RewardNotification } from "@/components/Web3RewardNotification";
import { haptics } from "@/utils/haptics";
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
import { TreasureHunt3D } from "@/components/games/TreasureHunt3D";
import { Platformer } from "@/components/games/Platformer";
import { Platformer3D } from "@/components/games/Platformer3D";
import { Racing3D } from "@/components/games/Racing3D";
import { BalloonPop3D } from "@/components/games/BalloonPop3D";
import { ColorMatch3D } from "@/components/games/ColorMatch3D";
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
import { GoldMiner3D } from "@/components/games/GoldMiner3D";
import { GoldHookMaster } from "@/components/games/GoldHookMaster";
import { Snake } from "@/components/games/Snake";
import { Snake3D } from "@/components/games/Snake3D";
import { TicTacToe } from "@/components/games/TicTacToe";
import { RockPaperScissors } from "@/components/games/RockPaperScissors";
import { WhackAMole } from "@/components/games/WhackAMole";
import { Sudoku } from "@/components/games/Sudoku";
import { FlappyBird } from "@/components/games/FlappyBird";
import { MazeRunner3D } from "@/components/games/MazeRunner3D";
import { MemoryCards3D } from "@/components/games/MemoryCards3D";
import { SimonSays3D } from "@/components/games/SimonSays3D";
import { GuessNumber3D } from "@/components/games/GuessNumber3D";
import { WordScramble3D } from "@/components/games/WordScramble3D";
import { TriviaQuiz3D } from "@/components/games/TriviaQuiz3D";

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
  const { claimFirstGameReward, pendingReward, clearPendingReward } = useWeb3Rewards();
  const isLandscape = useIsLandscape();
  const { isFullscreen, toggleFullscreen } = useFullscreen();
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

        // Claim first game reward (10,000 CAMLY bonus) - only triggers once
        await claimFirstGameReward();
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
    
    // Haptic feedback for success
    haptics.success();
    
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
      case "MemoryCards": return <MemoryCards3D {...gameProps} />;
      case "MemoryCards2D": return <MemoryCards {...gameProps} />;
      case "ColorMatch": return <ColorMatch3D {...gameProps} />;
      case "ColorMatch2D": return <ColorMatch {...gameProps} />;
      case "BalloonPop": return <BalloonPop3D {...gameProps} />;
      case "BalloonPop2D": return <BalloonPop {...gameProps} />;
      case "StarCollector": return <StarCollector {...gameProps} />;
      case "HappinessGarden": return <HappinessGarden {...gameProps} />;
      case "FlowerField": return <FlowerField {...gameProps} />;
      case "PetParadise": return <PetParadise {...gameProps} />;
      case "MusicCreator": return <MusicCreator {...gameProps} />;
      
      // Brain & Educational Games
      case "GuessNumber": return <GuessNumber3D {...gameProps} />;
      case "GuessNumber2D": return <GuessNumber {...gameProps} />;
      case "WordScramble": return <WordScramble3D {...gameProps} />;
      case "WordScramble2D": return <WordScramble {...gameProps} />;
      case "MathQuiz": return <MathQuiz {...gameProps} />;
      case "SimonSays": return <SimonSays3D {...gameProps} />;
      case "SimonSays2D": return <SimonSays {...gameProps} />;
      case "TriviaQuiz": return <TriviaQuiz3D {...gameProps} />;
      case "TriviaQuiz2D": return <TriviaQuiz {...gameProps} />;
      
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
        return <GoldMiner3D {...gameProps} />;
      case "GoldMiner2D":
        return <GoldMiner {...gameProps} />;
      case "GoldHookMaster":
      case "gold-hook-master":
        return <GoldHookMaster onBack={handleBackToLevelSelect} />;
      
      // Exploration & Adventure Games
      case "SpaceExplorer": return <SpaceExplorer {...gameProps} />;
      case "OceanExplorer": return <OceanExplorer {...gameProps} />;
      case "MazeRunner": return <MazeRunner3D {...gameProps} />;
      case "MazeRunner2D": return <MazeRunner {...gameProps} />;
      case "TreasureHunt": return <TreasureHunt3D {...gameProps} />;
      case "TreasureHunt2D": return <TreasureHunt {...gameProps} />;
      case "Platformer": return <Platformer3D {...gameProps} />;
      case "Platformer2D": return <Platformer {...gameProps} />;
      case "Racing": return <Racing3D {...gameProps} />;
      case "Racing2D": return <Racing {...gameProps} />;
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
      
      // Classic & Arcade Games
      case "Snake":
      case "snake":
        return <Snake3D {...gameProps} />;
      case "Snake2D":
        return <Snake {...gameProps} />;
      case "TicTacToe":
      case "tic-tac-toe":
        return <TicTacToe {...gameProps} />;
      case "RockPaperScissors":
      case "rock-paper-scissors":
        return <RockPaperScissors {...gameProps} />;
      case "WhackAMole":
      case "whack-a-mole":
        return <WhackAMole {...gameProps} />;
      case "Sudoku":
      case "sudoku":
        return <Sudoku {...gameProps} />;
      case "FlappyBird":
      case "flappy-bird":
        return <FlappyBird {...gameProps} />;
      
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
    <div className={isLandscape ? "min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 overflow-hidden" : "min-h-screen bg-white"}>
      {!isLandscape && <Navigation />}
      <LiveComboNotifications />
      <LandscapePrompt />
      <Web3RewardNotification 
        isOpen={!!pendingReward}
        amount={pendingReward?.amount || 0}
        description={pendingReward?.description || ''}
        onClose={clearPendingReward} 
      />
      
      {isLandscape && gameStarted && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-primary/95 to-secondary/95 backdrop-blur-md px-3 py-1.5 flex items-center justify-between border-b-2 border-white/20 shadow-xl">
          <Link to="/games">
            <Button 
              variant="ghost" 
              size="sm"
              className="text-white hover:bg-white/20 font-fredoka font-bold h-8 px-3 active:scale-95 transition-transform"
              onClick={() => haptics.light()}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-xs font-fredoka font-bold text-white/90 truncate max-w-[200px]">
              {game?.title || 'Game'}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              haptics.light();
              toggleFullscreen();
            }}
            className="text-white hover:bg-white/20 font-fredoka font-bold h-8 px-3 active:scale-95 transition-transform"
            title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          </Button>
        </div>
      )}
      
      {!isLandscape && gameStarted && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            haptics.light();
            toggleFullscreen();
          }}
          className="md:hidden fixed bottom-20 right-4 z-40 bg-primary/90 hover:bg-primary text-white shadow-lg rounded-full w-12 h-12 animate-scale-in active:scale-95 transition-transform"
          title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
        >
          {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
        </Button>
      )}
      
      <section className={isLandscape ? "pt-10 pb-0 px-2 h-screen" : "pt-20 pb-28 md:pb-12 px-2 md:px-4"}>
        <div className={isLandscape ? "h-[calc(100vh-2.5rem)] flex items-center justify-center" : "container mx-auto max-w-6xl"}>
          {!isLandscape && (
            <div className="mb-4 md:mb-8 flex items-center justify-between animate-fade-in">
              <Link to="/games">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="font-fredoka font-bold border-2 md:border-4 border-primary/30 hover:border-primary hover:bg-primary/10 transform hover:scale-105 transition-all touch-manipulation"
                >
                  <ArrowLeft className="mr-1 md:mr-2 h-4 w-4" />
                  <span className="hidden md:inline">Back to Games</span>
                  <span className="md:hidden">Back</span>
                </Button>
              </Link>
              
              <div className="flex items-center gap-2 bg-gradient-to-r from-primary/10 to-secondary/10 px-3 py-2 md:px-4 md:py-3 rounded-xl md:rounded-2xl border-2 border-primary/30">
                <Zap className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                <Label htmlFor="auto-level" className="font-fredoka font-bold text-xs md:text-base text-foreground cursor-pointer">
                  Auto
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
            ? "w-full h-full bg-gradient-to-br from-background/98 to-background/95 backdrop-blur-xl rounded-2xl border border-primary/20 shadow-2xl p-2 overflow-hidden flex items-center justify-center" 
            : "bg-background/80 backdrop-blur-lg rounded-2xl md:rounded-3xl border-2 md:border-4 border-primary/30 shadow-2xl p-4 md:p-8 space-y-4 md:space-y-6 animate-scale-in"
          }>
            {(!isLandscape || !gameStarted) && (
              <div className="text-center space-y-1 md:space-y-2">
                <h1 className="text-2xl md:text-4xl lg:text-5xl font-fredoka font-bold text-primary">
                  {game?.title || (gameId === 'cooking-mama' ? 'Cooking Mama' : 'Game')} 🎮
                </h1>
                <p className="text-sm md:text-lg font-comic text-muted-foreground max-w-2xl mx-auto line-clamp-2">
                  {game?.description || (gameId === 'cooking-mama' ? 'Master recipes!' : '')}
                </p>
                {game && (
                  <p className="text-xs md:text-sm font-comic text-muted-foreground">
                    🎯 {game.total_plays} lượt chơi
                  </p>
                )}
              </div>
            )}

            <div className={isLandscape && gameStarted ? "w-full h-full flex items-center justify-center" : "w-full"}>
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
