import { Navigation } from "@/components/Navigation";
import { useParams, Link } from "react-router-dom";
import { games } from "@/data/games";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
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

const GamePlay = () => {
  const { gameId } = useParams();
  const game = games.find(g => g.id === gameId);

  if (!game) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground">Game không tồn tại</h1>
          <Link to="/games">
            <Button>
              <ArrowLeft className="mr-2 w-4 h-4" />
              Quay lại
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const renderGame = () => {
    switch(gameId) {
      case 'tic-tac-toe': return <TicTacToe />;
      case 'memory-cards': return <MemoryCards />;
      case 'snake': return <Snake />;
      case '2048': return <Game2048 />;
      case 'guess-number': return <GuessNumber />;
      case 'rock-paper-scissors': return <RockPaperScissors />;
      case 'color-match': return <ColorMatch />;
      case 'whack-a-mole': return <WhackAMole />;
      case 'balloon-pop': return <BalloonPop />;
      case 'flappy-bird': return <FlappyBird />;
      case 'sudoku': return <Sudoku />;
      case 'word-scramble': return <WordScramble />;
      case 'math-quiz': return <MathQuiz />;
      case 'simon-says': return <SimonSays />;
      case 'trivia-quiz': return <TriviaQuiz />;
      case 'maze-runner': return <MazeRunner />;
      case 'treasure-hunt': return <TreasureHunt />;
      case 'space-shooter': return <SpaceShooter />;
      case 'platformer': return <Platformer />;
      case 'dungeon-crawler': return <DungeonCrawler />;
      case 'racing': return <Racing />;
      case 'tower-defense': return <TowerDefense />;
      default: 
        return (
          <div className="text-center space-y-4 py-12">
            <h2 className="text-2xl font-bold text-foreground">Game đang được phát triển</h2>
            <p className="text-muted-foreground">Game này sẽ sớm có sẵn!</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <Link to="/games">
            <Button variant="ghost" className="mb-8">
              <ArrowLeft className="mr-2 w-4 h-4" />
              Quay lại danh sách game
            </Button>
          </Link>

          <div className="text-center mb-12 space-y-4 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">
              {game.title}
            </h1>
            <p className="text-xl text-muted-foreground">
              {game.description}
            </p>
          </div>

          <div className="bg-card border-2 border-border rounded-2xl p-8 animate-scale-in">
            {renderGame()}
          </div>
        </div>
      </section>
    </div>
  );
};

export default GamePlay;
