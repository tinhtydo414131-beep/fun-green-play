// Harvest Haven: Village to Metropolis - Game Data

export interface Crop {
  id: string;
  name: string;
  emoji: string;
  growTime: number; // seconds
  sellPrice: number;
  xpReward: number;
  unlockLevel: number;
}

export interface Animal {
  id: string;
  name: string;
  emoji: string;
  produceTime: number;
  product: string;
  productEmoji: string;
  sellPrice: number;
  unlockLevel: number;
}

export interface Building {
  id: string;
  name: string;
  emoji: string;
  category: 'farm' | 'production' | 'residential' | 'commercial' | 'decoration' | 'landmark';
  cost: number;
  unlockLevel: number;
  width: number;
  height: number;
  produces?: string;
  productionTime?: number;
  requires?: { item: string; amount: number }[];
  income?: number;
  incomeInterval?: number;
}

export interface Order {
  id: string;
  customer: string;
  customerEmoji: string;
  items: { item: string; amount: number; emoji: string }[];
  reward: { coins: number; xp: number; gems?: number };
  timeLimit: number;
}

export const CROPS: Crop[] = [
  { id: 'wheat', name: 'Wheat', emoji: '🌾', growTime: 60, sellPrice: 5, xpReward: 2, unlockLevel: 1 },
  { id: 'corn', name: 'Corn', emoji: '🌽', growTime: 120, sellPrice: 10, xpReward: 4, unlockLevel: 1 },
  { id: 'carrot', name: 'Carrot', emoji: '🥕', growTime: 90, sellPrice: 8, xpReward: 3, unlockLevel: 2 },
  { id: 'tomato', name: 'Tomato', emoji: '🍅', growTime: 180, sellPrice: 15, xpReward: 6, unlockLevel: 3 },
  { id: 'strawberry', name: 'Strawberry', emoji: '🍓', growTime: 240, sellPrice: 20, xpReward: 8, unlockLevel: 4 },
  { id: 'apple', name: 'Apple', emoji: '🍎', growTime: 300, sellPrice: 25, xpReward: 10, unlockLevel: 5 },
  { id: 'grapes', name: 'Grapes', emoji: '🍇', growTime: 360, sellPrice: 30, xpReward: 12, unlockLevel: 6 },
  { id: 'pumpkin', name: 'Pumpkin', emoji: '🎃', growTime: 420, sellPrice: 35, xpReward: 14, unlockLevel: 7 },
  { id: 'watermelon', name: 'Watermelon', emoji: '🍉', growTime: 480, sellPrice: 40, xpReward: 16, unlockLevel: 8 },
  { id: 'pineapple', name: 'Pineapple', emoji: '🍍', growTime: 540, sellPrice: 50, xpReward: 20, unlockLevel: 9 },
  { id: 'potato', name: 'Potato', emoji: '🥔', growTime: 150, sellPrice: 12, xpReward: 5, unlockLevel: 2 },
  { id: 'lettuce', name: 'Lettuce', emoji: '🥬', growTime: 100, sellPrice: 7, xpReward: 3, unlockLevel: 3 },
  { id: 'pepper', name: 'Pepper', emoji: '🌶️', growTime: 200, sellPrice: 18, xpReward: 7, unlockLevel: 4 },
  { id: 'eggplant', name: 'Eggplant', emoji: '🍆', growTime: 250, sellPrice: 22, xpReward: 9, unlockLevel: 5 },
  { id: 'broccoli', name: 'Broccoli', emoji: '🥦', growTime: 280, sellPrice: 28, xpReward: 11, unlockLevel: 6 },
  { id: 'cherry', name: 'Cherry', emoji: '🍒', growTime: 320, sellPrice: 32, xpReward: 13, unlockLevel: 7 },
  { id: 'peach', name: 'Peach', emoji: '🍑', growTime: 380, sellPrice: 38, xpReward: 15, unlockLevel: 8 },
  { id: 'lemon', name: 'Lemon', emoji: '🍋', growTime: 440, sellPrice: 45, xpReward: 18, unlockLevel: 9 },
  { id: 'coconut', name: 'Coconut', emoji: '🥥', growTime: 600, sellPrice: 60, xpReward: 25, unlockLevel: 10 },
  { id: 'sunflower', name: 'Sunflower', emoji: '🌻', growTime: 500, sellPrice: 55, xpReward: 22, unlockLevel: 10 },
];

export const ANIMALS: Animal[] = [
  { id: 'chicken', name: 'Chicken', emoji: '🐔', produceTime: 120, product: 'Egg', productEmoji: '🥚', sellPrice: 15, unlockLevel: 2 },
  { id: 'cow', name: 'Cow', emoji: '🐄', produceTime: 180, product: 'Milk', productEmoji: '🥛', sellPrice: 25, unlockLevel: 3 },
  { id: 'sheep', name: 'Sheep', emoji: '🐑', produceTime: 240, product: 'Wool', productEmoji: '🧶', sellPrice: 30, unlockLevel: 4 },
  { id: 'pig', name: 'Pig', emoji: '🐷', produceTime: 300, product: 'Truffle', productEmoji: '🍄', sellPrice: 40, unlockLevel: 5 },
  { id: 'goat', name: 'Goat', emoji: '🐐', produceTime: 200, product: 'Cheese', productEmoji: '🧀', sellPrice: 35, unlockLevel: 6 },
  { id: 'duck', name: 'Duck', emoji: '🦆', produceTime: 150, product: 'Feather', productEmoji: '🪶', sellPrice: 20, unlockLevel: 4 },
  { id: 'rabbit', name: 'Rabbit', emoji: '🐰', produceTime: 100, product: 'Fluff', productEmoji: '☁️', sellPrice: 12, unlockLevel: 3 },
  { id: 'bee', name: 'Bee', emoji: '🐝', produceTime: 180, product: 'Honey', productEmoji: '🍯', sellPrice: 45, unlockLevel: 7 },
  { id: 'horse', name: 'Horse', emoji: '🐴', produceTime: 360, product: 'Horseshoe', productEmoji: '🧲', sellPrice: 60, unlockLevel: 8 },
  { id: 'turkey', name: 'Turkey', emoji: '🦃', produceTime: 280, product: 'Feather', productEmoji: '🪶', sellPrice: 35, unlockLevel: 9 },
];

export const BUILDINGS: Building[] = [
  // Farm Buildings
  { id: 'field', name: 'Crop Field', emoji: '🌱', category: 'farm', cost: 50, unlockLevel: 1, width: 2, height: 2 },
  { id: 'barn', name: 'Barn', emoji: '🏠', category: 'farm', cost: 200, unlockLevel: 2, width: 3, height: 3 },
  { id: 'chicken_coop', name: 'Chicken Coop', emoji: '🐔', category: 'farm', cost: 150, unlockLevel: 2, width: 2, height: 2 },
  { id: 'cow_pasture', name: 'Cow Pasture', emoji: '🐄', category: 'farm', cost: 300, unlockLevel: 3, width: 3, height: 3 },
  { id: 'sheep_pen', name: 'Sheep Pen', emoji: '🐑', category: 'farm', cost: 350, unlockLevel: 4, width: 3, height: 2 },
  { id: 'greenhouse', name: 'Greenhouse', emoji: '🏡', category: 'farm', cost: 500, unlockLevel: 5, width: 3, height: 3 },
  { id: 'orchard', name: 'Orchard', emoji: '🌳', category: 'farm', cost: 400, unlockLevel: 4, width: 4, height: 3 },
  { id: 'beehive', name: 'Beehive', emoji: '🐝', category: 'farm', cost: 250, unlockLevel: 7, width: 1, height: 1 },
  
  // Production Buildings
  { id: 'flour_mill', name: 'Flour Mill', emoji: '🏭', category: 'production', cost: 400, unlockLevel: 3, width: 2, height: 2, produces: 'flour', productionTime: 60, requires: [{ item: 'wheat', amount: 3 }] },
  { id: 'bakery', name: 'Bakery', emoji: '🥖', category: 'production', cost: 600, unlockLevel: 4, width: 2, height: 2, produces: 'bread', productionTime: 120, requires: [{ item: 'flour', amount: 2 }] },
  { id: 'dairy', name: 'Dairy', emoji: '🧈', category: 'production', cost: 500, unlockLevel: 4, width: 2, height: 2, produces: 'butter', productionTime: 90, requires: [{ item: 'milk', amount: 2 }] },
  { id: 'juice_press', name: 'Juice Press', emoji: '🧃', category: 'production', cost: 550, unlockLevel: 5, width: 2, height: 2, produces: 'juice', productionTime: 80, requires: [{ item: 'apple', amount: 3 }] },
  { id: 'candy_shop', name: 'Candy Shop', emoji: '🍬', category: 'production', cost: 800, unlockLevel: 6, width: 2, height: 2, produces: 'candy', productionTime: 150, requires: [{ item: 'sugar', amount: 2 }, { item: 'fruit', amount: 1 }] },
  { id: 'textile_mill', name: 'Textile Mill', emoji: '🧵', category: 'production', cost: 700, unlockLevel: 6, width: 3, height: 2, produces: 'fabric', productionTime: 180, requires: [{ item: 'wool', amount: 3 }] },
  { id: 'ice_cream_shop', name: 'Ice Cream Shop', emoji: '🍦', category: 'production', cost: 900, unlockLevel: 7, width: 2, height: 2, produces: 'ice_cream', productionTime: 200, requires: [{ item: 'milk', amount: 2 }, { item: 'strawberry', amount: 2 }] },
  { id: 'pizza_shop', name: 'Pizza Shop', emoji: '🍕', category: 'production', cost: 1000, unlockLevel: 8, width: 3, height: 2, produces: 'pizza', productionTime: 240, requires: [{ item: 'flour', amount: 2 }, { item: 'tomato', amount: 3 }, { item: 'cheese', amount: 1 }] },
  
  // Residential Buildings
  { id: 'cottage', name: 'Cottage', emoji: '🏘️', category: 'residential', cost: 300, unlockLevel: 2, width: 2, height: 2, income: 10, incomeInterval: 60 },
  { id: 'house', name: 'House', emoji: '🏠', category: 'residential', cost: 500, unlockLevel: 4, width: 2, height: 2, income: 20, incomeInterval: 60 },
  { id: 'apartment', name: 'Apartment', emoji: '🏢', category: 'residential', cost: 1000, unlockLevel: 6, width: 2, height: 3, income: 50, incomeInterval: 60 },
  { id: 'mansion', name: 'Mansion', emoji: '🏰', category: 'residential', cost: 2000, unlockLevel: 8, width: 3, height: 3, income: 100, incomeInterval: 60 },
  { id: 'skyscraper', name: 'Skyscraper', emoji: '🏙️', category: 'residential', cost: 5000, unlockLevel: 10, width: 2, height: 4, income: 200, incomeInterval: 60 },
  
  // Commercial Buildings
  { id: 'market', name: 'Market', emoji: '🏪', category: 'commercial', cost: 400, unlockLevel: 3, width: 2, height: 2, income: 15, incomeInterval: 45 },
  { id: 'restaurant', name: 'Restaurant', emoji: '🍽️', category: 'commercial', cost: 800, unlockLevel: 5, width: 2, height: 2, income: 35, incomeInterval: 45 },
  { id: 'cafe', name: 'Café', emoji: '☕', category: 'commercial', cost: 600, unlockLevel: 4, width: 2, height: 2, income: 25, incomeInterval: 45 },
  { id: 'bank', name: 'Bank', emoji: '🏦', category: 'commercial', cost: 1500, unlockLevel: 7, width: 3, height: 2, income: 75, incomeInterval: 45 },
  { id: 'mall', name: 'Shopping Mall', emoji: '🛍️', category: 'commercial', cost: 3000, unlockLevel: 9, width: 4, height: 3, income: 150, incomeInterval: 45 },
  
  // Decorations
  { id: 'tree', name: 'Tree', emoji: '🌲', category: 'decoration', cost: 25, unlockLevel: 1, width: 1, height: 1 },
  { id: 'flower_bed', name: 'Flower Bed', emoji: '🌷', category: 'decoration', cost: 30, unlockLevel: 1, width: 1, height: 1 },
  { id: 'fountain', name: 'Fountain', emoji: '⛲', category: 'decoration', cost: 200, unlockLevel: 3, width: 2, height: 2 },
  { id: 'park', name: 'Park', emoji: '🌳', category: 'decoration', cost: 500, unlockLevel: 5, width: 3, height: 3 },
  { id: 'pond', name: 'Pond', emoji: '🌊', category: 'decoration', cost: 300, unlockLevel: 4, width: 2, height: 2 },
  { id: 'playground', name: 'Playground', emoji: '🎠', category: 'decoration', cost: 400, unlockLevel: 5, width: 2, height: 2 },
  { id: 'garden', name: 'Garden', emoji: '🌸', category: 'decoration', cost: 350, unlockLevel: 4, width: 2, height: 2 },
  
  // Landmarks
  { id: 'windmill', name: 'Windmill', emoji: '🌬️', category: 'landmark', cost: 1000, unlockLevel: 5, width: 2, height: 2 },
  { id: 'lighthouse', name: 'Lighthouse', emoji: '🗼', category: 'landmark', cost: 1500, unlockLevel: 7, width: 2, height: 2 },
  { id: 'clock_tower', name: 'Clock Tower', emoji: '🕰️', category: 'landmark', cost: 2000, unlockLevel: 8, width: 2, height: 3 },
  { id: 'statue', name: 'Grand Statue', emoji: '🗽', category: 'landmark', cost: 3000, unlockLevel: 9, width: 2, height: 2 },
  { id: 'castle', name: 'Castle', emoji: '🏰', category: 'landmark', cost: 10000, unlockLevel: 10, width: 4, height: 4 },
];

export const CUSTOMER_NAMES = [
  { name: 'Emma', emoji: '👩' },
  { name: 'James', emoji: '👨' },
  { name: 'Sophia', emoji: '👧' },
  { name: 'Oliver', emoji: '👦' },
  { name: 'Ava', emoji: '👩‍🦰' },
  { name: 'William', emoji: '👨‍🦱' },
  { name: 'Isabella', emoji: '👩‍🦳' },
  { name: 'Benjamin', emoji: '👴' },
  { name: 'Mia', emoji: '👵' },
  { name: 'Lucas', emoji: '🧔' },
];

export const LEVEL_THRESHOLDS = [
  0, 100, 250, 500, 800, 1200, 1700, 2300, 3000, 3800,
  4700, 5700, 6800, 8000, 9300, 10700, 12200, 13800, 15500, 17300,
  19200, 21200, 23300, 25500, 27800, 30200, 32700, 35300, 38000, 40800,
  43700, 46700, 49800, 53000, 56300, 59700, 63200, 66800, 70500, 74300,
  78200, 82200, 86300, 90500, 94800, 99200, 103700, 108300, 113000, 117800,
];

export const ZONE_UNLOCKS = [
  { level: 1, zone: 'starter_farm', name: 'Starter Farm', tiles: 64 },
  { level: 3, zone: 'east_field', name: 'East Field', tiles: 48 },
  { level: 5, zone: 'village_center', name: 'Village Center', tiles: 64 },
  { level: 7, zone: 'riverside', name: 'Riverside', tiles: 48 },
  { level: 10, zone: 'town_square', name: 'Town Square', tiles: 80 },
  { level: 15, zone: 'industrial', name: 'Industrial District', tiles: 64 },
  { level: 20, zone: 'suburbs', name: 'Suburbs', tiles: 96 },
  { level: 30, zone: 'downtown', name: 'Downtown', tiles: 100 },
  { level: 40, zone: 'metropolis', name: 'Metropolis Center', tiles: 120 },
  { level: 50, zone: 'skyline', name: 'Skyline District', tiles: 150 },
];

export const DAILY_QUESTS = [
  { id: 'harvest_10', description: 'Harvest 10 crops', target: 10, reward: { coins: 50, xp: 20 } },
  { id: 'collect_5_eggs', description: 'Collect 5 eggs', target: 5, reward: { coins: 30, xp: 15 } },
  { id: 'complete_3_orders', description: 'Complete 3 orders', target: 3, reward: { coins: 100, xp: 50 } },
  { id: 'build_2_buildings', description: 'Build 2 buildings', target: 2, reward: { coins: 75, xp: 30 } },
  { id: 'earn_500_coins', description: 'Earn 500 coins', target: 500, reward: { coins: 100, xp: 40, gems: 5 } },
];

export const ACHIEVEMENTS = [
  { id: 'first_harvest', name: 'First Harvest', description: 'Harvest your first crop', reward: { coins: 50, gems: 5 } },
  { id: 'animal_lover', name: 'Animal Lover', description: 'Own 5 different animals', reward: { coins: 200, gems: 10 } },
  { id: 'master_chef', name: 'Master Chef', description: 'Produce 100 goods', reward: { coins: 500, gems: 25 } },
  { id: 'tycoon', name: 'Business Tycoon', description: 'Earn 10,000 coins', reward: { coins: 1000, gems: 50 } },
  { id: 'metropolis', name: 'Metropolis Mayor', description: 'Reach level 50', reward: { coins: 5000, gems: 100 } },
];

export function generateOrder(playerLevel: number): Order {
  const customer = CUSTOMER_NAMES[Math.floor(Math.random() * CUSTOMER_NAMES.length)];
  const availableCrops = CROPS.filter(c => c.unlockLevel <= playerLevel);
  const numItems = Math.min(1 + Math.floor(playerLevel / 3), 3);
  
  const items: { item: string; amount: number; emoji: string }[] = [];
  for (let i = 0; i < numItems; i++) {
    const crop = availableCrops[Math.floor(Math.random() * availableCrops.length)];
    const amount = Math.floor(Math.random() * 5) + 1 + Math.floor(playerLevel / 2);
    items.push({ item: crop.id, amount, emoji: crop.emoji });
  }
  
  const baseReward = items.reduce((sum, item) => {
    const crop = CROPS.find(c => c.id === item.item);
    return sum + (crop?.sellPrice || 10) * item.amount;
  }, 0);
  
  return {
    id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    customer: customer.name,
    customerEmoji: customer.emoji,
    items,
    reward: {
      coins: Math.floor(baseReward * 1.5),
      xp: Math.floor(baseReward / 2),
      gems: Math.random() > 0.8 ? Math.floor(playerLevel / 2) : undefined,
    },
    timeLimit: 300 + playerLevel * 30, // 5-15 minutes based on level
  };
}
