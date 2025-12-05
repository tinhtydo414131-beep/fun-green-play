import type { BuildingConfig, BuildingType, Quest, DailyChallenge, MonsterType } from '@/types/cityCreatorRPG';

export const BUILDING_CONFIGS: Record<BuildingType, BuildingConfig> = {
  house: {
    type: 'house',
    name: 'House',
    emoji: '🏠',
    cost: { wood: 30, stone: 10 },
    population: 5,
    unlockLevel: 1,
    description: 'Home for citizens',
  },
  farm: {
    type: 'farm',
    name: 'Farm',
    emoji: '🌾',
    cost: { wood: 20, gold: 10 },
    produces: { resource: 'food', rate: 2 },
    unlockLevel: 1,
    description: 'Produces food over time',
  },
  mine: {
    type: 'mine',
    name: 'Mine',
    emoji: '⛏️',
    cost: { wood: 40, food: 20 },
    produces: { resource: 'stone', rate: 1 },
    unlockLevel: 2,
    description: 'Produces stone over time',
  },
  shop: {
    type: 'shop',
    name: 'Shop',
    emoji: '🏪',
    cost: { wood: 50, stone: 30 },
    produces: { resource: 'gold', rate: 3 },
    unlockLevel: 3,
    description: 'Generates gold from trade',
  },
  tower: {
    type: 'tower',
    name: 'Defense Tower',
    emoji: '🗼',
    cost: { stone: 60, gold: 40 },
    defense: 20,
    unlockLevel: 4,
    description: 'Defends city from monsters',
  },
  wall: {
    type: 'wall',
    name: 'Wall',
    emoji: '🧱',
    cost: { stone: 20 },
    defense: 5,
    unlockLevel: 2,
    description: 'Basic defense structure',
  },
  castle: {
    type: 'castle',
    name: 'Castle',
    emoji: '🏰',
    cost: { wood: 200, stone: 300, gold: 150 },
    population: 20,
    defense: 50,
    unlockLevel: 15,
    description: 'Majestic castle for your city',
  },
  warehouse: {
    type: 'warehouse',
    name: 'Warehouse',
    emoji: '🏭',
    cost: { wood: 60, stone: 40 },
    produces: { resource: 'wood', rate: 2 },
    unlockLevel: 5,
    description: 'Stores and produces wood',
  },
  market: {
    type: 'market',
    name: 'Market',
    emoji: '🏬',
    cost: { wood: 80, gold: 60 },
    produces: { resource: 'gold', rate: 5 },
    population: 3,
    unlockLevel: 7,
    description: 'Busy market for trading',
  },
  tavern: {
    type: 'tavern',
    name: 'Tavern',
    emoji: '🍺',
    cost: { wood: 40, food: 30 },
    population: 8,
    unlockLevel: 6,
    description: 'Rest place for adventurers',
  },
  library: {
    type: 'library',
    name: 'Library',
    emoji: '📚',
    cost: { wood: 70, gold: 50 },
    population: 2,
    unlockLevel: 8,
    description: 'Knowledge hub, bonus XP',
  },
  barracks: {
    type: 'barracks',
    name: 'Barracks',
    emoji: '⚔️',
    cost: { wood: 80, stone: 60, gold: 40 },
    defense: 30,
    population: 5,
    unlockLevel: 10,
    description: 'Train soldiers for defense',
  },
  hospital: {
    type: 'hospital',
    name: 'Hospital',
    emoji: '🏥',
    cost: { wood: 100, stone: 80, gold: 60 },
    population: 4,
    unlockLevel: 12,
    description: 'Heals citizens faster',
  },
  park: {
    type: 'park',
    name: 'Park',
    emoji: '🌳',
    cost: { wood: 30, gold: 20 },
    population: 3,
    unlockLevel: 3,
    description: 'Green space for happiness',
  },
  fountain: {
    type: 'fountain',
    name: 'Fountain',
    emoji: '⛲',
    cost: { stone: 40, gold: 30 },
    population: 2,
    unlockLevel: 5,
    description: 'Beautiful water feature',
  },
  statue: {
    type: 'statue',
    name: 'Statue',
    emoji: '🗽',
    cost: { stone: 100, gold: 80 },
    population: 1,
    unlockLevel: 20,
    description: 'Monument to greatness',
  },
  windmill: {
    type: 'windmill',
    name: 'Windmill',
    emoji: '🌀',
    cost: { wood: 50, stone: 20 },
    produces: { resource: 'food', rate: 4 },
    unlockLevel: 8,
    description: 'Advanced food production',
  },
  bakery: {
    type: 'bakery',
    name: 'Bakery',
    emoji: '🥖',
    cost: { wood: 45, food: 20, gold: 25 },
    produces: { resource: 'gold', rate: 2 },
    population: 3,
    unlockLevel: 6,
    description: 'Delicious treats for gold',
  },
  blacksmith: {
    type: 'blacksmith',
    name: 'Blacksmith',
    emoji: '🔨',
    cost: { wood: 60, stone: 50, gold: 30 },
    defense: 10,
    population: 2,
    unlockLevel: 9,
    description: 'Forge weapons and tools',
  },
  temple: {
    type: 'temple',
    name: 'Temple',
    emoji: '⛩️',
    cost: { stone: 120, gold: 100 },
    population: 5,
    unlockLevel: 18,
    description: 'Sacred place of worship',
  },
  school: {
    type: 'school',
    name: 'School',
    emoji: '🏫',
    cost: { wood: 80, stone: 60, gold: 40 },
    population: 10,
    unlockLevel: 11,
    description: 'Educate young citizens',
  },
};

export const MONSTER_CONFIGS: Record<MonsterType, {
  name: string;
  emoji: string;
  health: number;
  attack: number;
  xpReward: number;
  loot: { wood?: number; stone?: number; gold?: number; food?: number };
}> = {
  slime: {
    name: 'Friendly Slime',
    emoji: '🟢',
    health: 30,
    attack: 5,
    xpReward: 15,
    loot: { gold: 10 },
  },
  goblin: {
    name: 'Silly Goblin',
    emoji: '👺',
    health: 50,
    attack: 8,
    xpReward: 25,
    loot: { gold: 20, wood: 10 },
  },
  shadow: {
    name: 'Shadow Puff',
    emoji: '👻',
    health: 40,
    attack: 12,
    xpReward: 30,
    loot: { stone: 15, gold: 15 },
  },
  dragon_baby: {
    name: 'Baby Dragon',
    emoji: '🐉',
    health: 80,
    attack: 15,
    xpReward: 50,
    loot: { gold: 50, food: 20 },
  },
  rock_golem: {
    name: 'Rock Golem',
    emoji: '🪨',
    health: 100,
    attack: 10,
    xpReward: 40,
    loot: { stone: 40, gold: 20 },
  },
};

export const HERO_SKINS: Record<string, { name: string; emoji: string; unlockLevel: number; color: string }> = {
  wizard_kid: { name: 'Wizard Kid', emoji: '🧙', unlockLevel: 1, color: '#9B59B6' },
  robot_builder: { name: 'Robot Builder', emoji: '🤖', unlockLevel: 1, color: '#3498DB' },
  animal_hero: { name: 'Animal Hero', emoji: '🦁', unlockLevel: 1, color: '#F39C12' },
  ninja_star: { name: 'Ninja Star', emoji: '🥷', unlockLevel: 5, color: '#2C3E50' },
  fairy_builder: { name: 'Fairy Builder', emoji: '🧚', unlockLevel: 8, color: '#E91E63' },
  dragon_tamer: { name: 'Dragon Tamer', emoji: '🐲', unlockLevel: 12, color: '#E74C3C' },
  space_explorer: { name: 'Space Explorer', emoji: '🚀', unlockLevel: 15, color: '#1ABC9C' },
  pirate_captain: { name: 'Pirate Captain', emoji: '🏴‍☠️', unlockLevel: 20, color: '#8B4513' },
  knight_builder: { name: 'Knight Builder', emoji: '⚔️', unlockLevel: 25, color: '#7F8C8D' },
  nature_spirit: { name: 'Nature Spirit', emoji: '🌿', unlockLevel: 30, color: '#27AE60' },
};

const QUEST_NPCS = ['👨‍🌾 Farmer Joe', '👑 Mayor Belle', '🧙‍♂️ Wizard Zap', '🛡️ Guard Rex', '📦 Trader Max'];

export function generateQuests(heroLevel: number): Quest[] {
  const quests: Quest[] = [
    {
      id: 'quest-build-1',
      type: 'build',
      title: 'Build 3 Buildings',
      description: 'Place any 3 buildings in your city',
      target: 3,
      progress: 0,
      reward: { xp: 100, coins: 5000, resources: { wood: 50 } },
      npc: QUEST_NPCS[0],
      completed: false,
      claimed: false,
    },
    {
      id: 'quest-gather-1',
      type: 'gather',
      title: 'Gather Resources',
      description: 'Collect 500 total resources',
      target: 500,
      progress: 0,
      reward: { xp: 150, coins: 5000, resources: { gold: 30 } },
      npc: QUEST_NPCS[4],
      completed: false,
      claimed: false,
    },
    {
      id: 'quest-defend-1',
      type: 'defend',
      title: 'Defeat Monsters',
      description: 'Defeat 5 monsters in battle',
      target: 5,
      progress: 0,
      reward: { xp: 200, coins: 5000, resources: { stone: 40 } },
      npc: QUEST_NPCS[3],
      completed: false,
      claimed: false,
    },
  ];

  // Add harder quests for higher levels
  if (heroLevel >= 5) {
    quests.push({
      id: 'quest-build-2',
      type: 'build',
      title: 'Build 5 Houses',
      description: 'Create homes for more citizens',
      target: 5,
      progress: 0,
      reward: { xp: 300, coins: 10000, resources: { food: 100 } },
      npc: QUEST_NPCS[1],
      completed: false,
      claimed: false,
    });
  }

  if (heroLevel >= 10) {
    quests.push({
      id: 'quest-defend-2',
      type: 'defend',
      title: 'Monster Slayer',
      description: 'Defeat 15 monsters',
      target: 15,
      progress: 0,
      reward: { xp: 500, coins: 20000, resources: { gold: 100 } },
      npc: QUEST_NPCS[2],
      completed: false,
      claimed: false,
    });
  }

  return quests;
}

export function generateDailyChallenges(): DailyChallenge[] {
  const challenges = [
    { id: 'daily-1', title: '🏗️ Builder', description: 'Build 5 buildings today', target: 5, reward: 15000 },
    { id: 'daily-2', title: '⚔️ Defender', description: 'Win 3 battles', target: 3, reward: 15000 },
    { id: 'daily-3', title: '💰 Collector', description: 'Gather 1000 resources', target: 1000, reward: 15000 },
  ];

  return challenges.map(c => ({ ...c, progress: 0, completed: false }));
}

export const BATTLE_SKILLS = [
  { id: 'attack', name: 'Attack', emoji: '👊', description: 'Basic attack' },
  { id: 'fireball', name: 'Fireball', emoji: '🔥', description: 'Fire magic attack' },
  { id: 'lightning', name: 'Lightning', emoji: '⚡', description: 'Hit all enemies' },
  { id: 'shield', name: 'Shield', emoji: '🛡️', description: 'Heal yourself' },
];
