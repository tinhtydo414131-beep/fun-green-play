import memoryCardsImg from '@/assets/games/memory-cards.jpg';
import colorMatchImg from '@/assets/games/color-match.jpg';
import balloonPopImg from '@/assets/games/balloon-pop.jpg';
import guessNumberImg from '@/assets/games/guess-number.jpg';
import mathQuizImg from '@/assets/games/math-quiz.jpg';
import triviaQuizImg from '@/assets/games/trivia-quiz.jpg';
import mazeRunnerImg from '@/assets/games/maze-runner.jpg';
import platformerImg from '@/assets/games/platformer.jpg';
import racingImg from '@/assets/games/racing.jpg';

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
  // Featured - New Games
  {
    id: 'harvest-haven',
    title: 'Harvest Haven',
    description: 'Build your farm empire from village to metropolis!',
    category: 'casual',
    difficulty: 'easy',
    image: '/images/games/farm-builder.jpg',
    playable: true,
  },
  
  // Casual & Happy Games
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
    id: 'color-match',
    title: 'Color Match',
    description: 'Khớp màu sắc nhanh nhất có thể',
    category: 'casual',
    difficulty: 'easy',
    image: colorMatchImg,
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
  
  // Brain & Educational Games
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
    id: 'math-quiz',
    title: 'Math Quiz',
    description: 'Trắc nghiệm toán học vui vẻ',
    category: 'brain',
    difficulty: 'medium',
    image: mathQuizImg,
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
    id: 'maze-runner',
    title: 'Maze Runner',
    description: 'Tìm đường thoát khỏi mê cung',
    category: 'adventure',
    difficulty: 'medium',
    image: mazeRunnerImg,
    playable: true,
  },
  {
    id: 'platformer',
    title: 'Platform Jump',
    description: 'Nhảy qua các nền tảng vui nhộn',
    category: 'adventure',
    difficulty: 'medium',
    image: platformerImg,
    playable: true,
  },
];
