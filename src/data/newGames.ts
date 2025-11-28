// New games to reach 30+ total games
import { Game } from './games';

// Import new game images
import kitchenArImg from '@/assets/games/kitchen-ar.jpg';
import minecraftMergeImg from '@/assets/games/minecraft-merge.jpg';
import terraNilImg from '@/assets/games/terra-nil.jpg';
import kerbalSpaceImg from '@/assets/games/kerbal-space.jpg';
import unpackingImg from '@/assets/games/unpacking.jpg';
import sandboxImg from '@/assets/games/sandbox.jpg';

export const newGames: Game[] = [
  {
    id: 'kitchen-ar',
    title: 'Kitchen Creator AR',
    description: 'Nấu ăn sáng tạo với công nghệ AR thực tế ảo',
    category: 'casual',
    difficulty: 'easy',
    image: kitchenArImg,
    playable: true,
  },
  {
    id: 'minecraft-merge',
    title: 'Block Merge World',
    description: 'Ghép khối xây dựng thế giới Minecraft',
    category: 'adventure',
    difficulty: 'medium',
    image: minecraftMergeImg,
    playable: true,
  },
  {
    id: 'terra-nil-restore',
    title: 'Terra Nil Restore',
    description: 'Khôi phục thiên nhiên và môi trường xanh',
    category: 'adventure',
    difficulty: 'medium',
    image: terraNilImg,
    playable: true,
  },
  {
    id: 'kerbal-space',
    title: 'Kerbal Space Program',
    description: 'Khám phá vũ trụ với tàu vũ trụ Kerbal',
    category: 'adventure',
    difficulty: 'hard',
    image: kerbalSpaceImg,
    playable: true,
  },
  {
    id: 'unpacking-mindful',
    title: 'Unpacking Mindful',
    description: 'Trò chơi thiền định với việc sắp xếp đồ',
    category: 'casual',
    difficulty: 'easy',
    image: unpackingImg,
    playable: true,
  },
  {
    id: 'sandbox-creator',
    title: 'Sandbox Creator',
    description: 'Tạo thế giới cát với vô số khả năng',
    category: 'adventure',
    difficulty: 'medium',
    image: sandboxImg,
    playable: true,
  },
];
