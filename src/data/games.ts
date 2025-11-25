import ticTacToeImg from '@/assets/games/tic-tac-toe.jpg';
import memoryCardsImg from '@/assets/games/memory-cards.jpg';
import rockPaperScissorsImg from '@/assets/games/rock-paper-scissors.jpg';
import colorMatchImg from '@/assets/games/color-match.jpg';
import whackAMoleImg from '@/assets/games/whack-a-mole.jpg';
import balloonPopImg from '@/assets/games/balloon-pop.jpg';
import flappyBirdImg from '@/assets/games/flappy-bird.jpg';
import game2048Img from '@/assets/games/2048.jpg';
import sudokuImg from '@/assets/games/sudoku.jpg';
import guessNumberImg from '@/assets/games/guess-number.jpg';
import wordScrambleImg from '@/assets/games/word-scramble.jpg';
import mathQuizImg from '@/assets/games/math-quiz.jpg';
import simonSaysImg from '@/assets/games/simon-says.jpg';
import triviaQuizImg from '@/assets/games/trivia-quiz.jpg';
import snakeImg from '@/assets/games/snake.jpg';
import mazeRunnerImg from '@/assets/games/maze-runner.jpg';
import treasureHuntImg from '@/assets/games/treasure-hunt.jpg';
import platformerImg from '@/assets/games/platformer.jpg';
import racingImg from '@/assets/games/racing.jpg';
import planetBuilderImg from '@/assets/games/planet-builder.jpg';
import happinessGardenImg from '@/assets/games/happiness-garden.jpg';
import spaceExplorerImg from '@/assets/games/space-explorer.jpg';
import cityCreatorImg from '@/assets/games/city-creator.jpg';
import starCollectorImg from '@/assets/games/star-collector.jpg';
import dreamWorldImg from '@/assets/games/dream-world.jpg';

export interface Game {
  id: string;
  title: string;
  description: string;
  category: 'casual' | 'brain' | 'adventure';
  difficulty: 'easy' | 'medium' | 'hard';
  image: string;
  playable: boolean;
}

export const games: Game[] = [
  // Casual Games
  {
    id: 'tic-tac-toe',
    title: 'Tic Tac Toe',
    description: 'Trò chơi cờ ca-rô cổ điển 3x3',
    category: 'casual',
    difficulty: 'easy',
    image: ticTacToeImg,
    playable: true,
  },
  {
    id: 'memory-cards',
    title: 'Memory Cards',
    description: 'Lật thẻ và tìm các cặp giống nhau',
    category: 'casual',
    difficulty: 'easy',
    image: memoryCardsImg,
    playable: true,
  },
  {
    id: 'rock-paper-scissors',
    title: 'Kéo Búa Bao',
    description: 'Chơi kéo búa bao với máy tính',
    category: 'casual',
    difficulty: 'easy',
    image: rockPaperScissorsImg,
    playable: true,
  },
  {
    id: 'color-match',
    title: 'Color Match',
    description: 'Khớp màu sắc nhanh nhất có thể',
    category: 'casual',
    difficulty: 'easy',
    image: colorMatchImg,
    playable: true,
  },
  {
    id: 'whack-a-mole',
    title: 'Whack A Mole',
    description: 'Đập chuột chũi nhanh tay',
    category: 'casual',
    difficulty: 'medium',
    image: whackAMoleImg,
    playable: true,
  },
  {
    id: 'balloon-pop',
    title: 'Balloon Pop',
    description: 'Bắn vỡ bóng bay',
    category: 'casual',
    difficulty: 'easy',
    image: balloonPopImg,
    playable: true,
  },
  {
    id: 'flappy-bird',
    title: 'Flappy Bird',
    description: 'Bay qua các ống nước',
    category: 'casual',
    difficulty: 'hard',
    image: flappyBirdImg,
    playable: true,
  },
  
  // Brain Games
  {
    id: '2048',
    title: '2048',
    description: 'Trò chơi xếp số huyền thoại',
    category: 'brain',
    difficulty: 'medium',
    image: game2048Img,
    playable: true,
  },
  {
    id: 'sudoku',
    title: 'Sudoku',
    description: 'Giải câu đố số Sudoku',
    category: 'brain',
    difficulty: 'hard',
    image: sudokuImg,
    playable: true,
  },
  {
    id: 'guess-number',
    title: 'Guess The Number',
    description: 'Đoán số bí mật',
    category: 'brain',
    difficulty: 'easy',
    image: guessNumberImg,
    playable: true,
  },
  {
    id: 'word-scramble',
    title: 'Word Scramble',
    description: 'Sắp xếp các chữ cái thành từ',
    category: 'brain',
    difficulty: 'medium',
    image: wordScrambleImg,
    playable: true,
  },
  {
    id: 'math-quiz',
    title: 'Math Quiz',
    description: 'Trắc nghiệm toán học nhanh',
    category: 'brain',
    difficulty: 'medium',
    image: mathQuizImg,
    playable: true,
  },
  {
    id: 'simon-says',
    title: 'Simon Says',
    description: 'Ghi nhớ trình tự màu sắc',
    category: 'brain',
    difficulty: 'medium',
    image: simonSaysImg,
    playable: true,
  },
  {
    id: 'trivia-quiz',
    title: 'Trivia Quiz',
    description: 'Câu hỏi kiến thức tổng hợp',
    category: 'brain',
    difficulty: 'easy',
    image: triviaQuizImg,
    playable: true,
  },
  
  // Adventure Games
  {
    id: 'snake',
    title: 'Snake',
    description: 'Rắn săn mồi cổ điển',
    category: 'adventure',
    difficulty: 'medium',
    image: snakeImg,
    playable: true,
  },
  {
    id: 'maze-runner',
    title: 'Maze Runner',
    description: 'Tìm đường thoát khỏi mê cung',
    category: 'adventure',
    difficulty: 'hard',
    image: mazeRunnerImg,
    playable: true,
  },
  {
    id: 'treasure-hunt',
    title: 'Treasure Hunt',
    description: 'Tìm kho báu ẩn giấu',
    category: 'adventure',
    difficulty: 'medium',
    image: treasureHuntImg,
    playable: true,
  },
  {
    id: 'platformer',
    title: 'Platform Jump',
    description: 'Nhảy qua các nền tảng',
    category: 'adventure',
    difficulty: 'medium',
    image: platformerImg,
    playable: true,
  },
  {
    id: 'racing',
    title: 'Racing Game',
    description: 'Đua xe tốc độ cao',
    category: 'adventure',
    difficulty: 'medium',
    image: racingImg,
    playable: true,
  },
  {
    id: 'planet-builder',
    title: 'Planet Builder',
    description: 'Xây dựng và phát triển hành tinh của bạn',
    category: 'adventure',
    difficulty: 'medium',
    image: planetBuilderImg,
    playable: true,
  },
  {
    id: 'happiness-garden',
    title: 'Happiness Garden',
    description: 'Trồng vườn hạnh phúc với hoa và bướm',
    category: 'casual',
    difficulty: 'easy',
    image: happinessGardenImg,
    playable: true,
  },
  {
    id: 'space-explorer',
    title: 'Space Explorer',
    description: 'Khám phá vũ trụ bình yên với tàu vũ trụ',
    category: 'adventure',
    difficulty: 'medium',
    image: spaceExplorerImg,
    playable: true,
  },
  {
    id: 'city-creator',
    title: 'City Creator',
    description: 'Xây dựng thành phố xinh đẹp của bạn',
    category: 'adventure',
    difficulty: 'medium',
    image: cityCreatorImg,
    playable: true,
  },
  {
    id: 'star-collector',
    title: 'Star Collector',
    description: 'Thu thập những ngôi sao lấp lánh',
    category: 'casual',
    difficulty: 'easy',
    image: starCollectorImg,
    playable: true,
  },
  {
    id: 'dream-world',
    title: 'Dream World',
    description: 'Tạo thế giới mơ ước của bạn',
    category: 'adventure',
    difficulty: 'medium',
    image: dreamWorldImg,
    playable: true,
  },
];
