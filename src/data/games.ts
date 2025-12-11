import memoryCardsImg from '@/assets/games/memory-cards.jpg';
import colorMatchImg from '@/assets/games/color-match.jpg';
import balloonPopImg from '@/assets/games/balloon-pop.jpg';
import guessNumberImg from '@/assets/games/guess-number.jpg';
import wordScrambleImg from '@/assets/games/word-scramble.jpg';
import mathQuizImg from '@/assets/games/math-quiz.jpg';
import simonSaysImg from '@/assets/games/simon-says.jpg';
import triviaQuizImg from '@/assets/games/trivia-quiz.jpg';
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
import gardenBuilderImg from '@/assets/games/garden-builder.jpg';
import oceanExplorerImg from '@/assets/games/ocean-explorer.jpg';
import skyCastleImg from '@/assets/games/sky-castle.jpg';
import petParadiseImg from '@/assets/games/pet-paradise.jpg';
import musicCreatorImg from '@/assets/games/music-creator.jpg';
import flowerFieldImg from '@/assets/games/flower-field.jpg';

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
    id: 'happiness-garden',
    title: 'Happiness Garden',
    description: 'Trồng vườn hạnh phúc với hoa và bướm',
    category: 'casual',
    difficulty: 'easy',
    image: happinessGardenImg,
    playable: true,
  },
  {
    id: 'flower-field',
    title: 'Flower Field',
    description: 'Tạo cánh đồng hoa rực rỡ',
    category: 'casual',
    difficulty: 'easy',
    image: flowerFieldImg,
    playable: true,
  },
  {
    id: 'pet-paradise',
    title: 'Pet Paradise',
    description: 'Chăm sóc và làm vui thú cưng đáng yêu',
    category: 'casual',
    difficulty: 'easy',
    image: petParadiseImg,
    playable: true,
  },
  {
    id: 'music-creator',
    title: 'Music Creator',
    description: 'Sáng tạo giai điệu âm nhạc vui nhộn',
    category: 'casual',
    difficulty: 'easy',
    image: musicCreatorImg,
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
    description: 'Trắc nghiệm toán học vui vẻ',
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
  
  // Building & Creation Games
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
    id: 'city-creator',
    title: 'City Creator',
    description: 'Xây dựng thành phố xinh đẹp của bạn',
    category: 'adventure',
    difficulty: 'medium',
    image: cityCreatorImg,
    playable: true,
  },
  {
    id: 'garden-builder',
    title: 'Garden Builder',
    description: 'Thiết kế khu vườn mơ ước',
    category: 'adventure',
    difficulty: 'medium',
    image: gardenBuilderImg,
    playable: true,
  },
  {
    id: 'sky-castle',
    title: 'Sky Castle',
    description: 'Xây lâu đài trên mây xanh',
    category: 'adventure',
    difficulty: 'medium',
    image: skyCastleImg,
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
  {
    id: 'school-builder',
    title: 'School Builder',
    description: 'Xây dựng trường học với lớp học và thư viện',
    category: 'adventure',
    difficulty: 'medium',
    image: 'https://media.funplanet.life/images/games/city-creator.jpg',
    playable: true,
  },
  {
    id: 'happy-park',
    title: 'Happy Park',
    description: 'Tạo công viên vui vẻ với cây xanh và đài phun nước',
    category: 'adventure',
    difficulty: 'medium',
    image: gardenBuilderImg,
    playable: true,
  },
  {
    id: 'home-designer',
    title: 'Home Designer',
    description: 'Thiết kế ngôi nhà ấm cúng đầy yêu thương',
    category: 'adventure',
    difficulty: 'medium',
    image: cityCreatorImg,
    playable: true,
  },
  {
    id: 'community-hub',
    title: 'Community Hub',
    description: 'Xây dựng trung tâm cộng đồng sôi động',
    category: 'adventure',
    difficulty: 'medium',
    image: cityCreatorImg,
    playable: true,
  },
  {
    id: 'eco-village',
    title: 'Eco Village',
    description: 'Tạo làng xanh thân thiện với môi trường',
    category: 'adventure',
    difficulty: 'medium',
    image: gardenBuilderImg,
    playable: true,
  },
  
  // Exploration & Adventure Games
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
    id: 'ocean-explorer',
    title: 'Ocean Explorer',
    description: 'Phiêu lưu dưới đại dương thần tiên',
    category: 'adventure',
    difficulty: 'medium',
    image: oceanExplorerImg,
    playable: true,
  },
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
    description: 'Nhảy qua các nền tảng vui nhộn',
    category: 'adventure',
    difficulty: 'medium',
    image: platformerImg,
    playable: true,
  },
  {
    id: "happy-kitchen-joy",
    title: "Happy Kitchen Joy",
    description: "Cook delicious meals and serve adorable animal friends!",
    category: "casual",
    difficulty: "medium",
    image: "https://media.funplanet.life/images/games/happy-kitchen-joy.jpg",
    playable: true,
  },
  {
    id: "cooking-mama",
    title: "Cooking Mama",
    description: "Master recipes with timing and precision mini-games!",
    category: "casual",
    difficulty: "medium",
    image: "https://media.funplanet.life/images/games/happy-kitchen-joy.jpg",
    playable: true,
  },
  {
    id: "gratitude-journal",
    title: "Gratitude Journal",
    description: "Ghi lại những điều biết ơn mỗi ngày 🙏",
    category: "casual",
    difficulty: "easy",
    image: happinessGardenImg,
    playable: true,
  },
  {
    id: "star-explorer-3d",
    title: "Star Explorer 3D",
    description: "Khám phá vũ trụ và thu thập các ngôi sao! 🚀⭐",
    category: "adventure",
    difficulty: "medium",
    image: spaceExplorerImg,
    playable: true,
  },
];
