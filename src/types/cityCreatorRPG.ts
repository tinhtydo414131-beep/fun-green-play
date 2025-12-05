// City Creator RPG Types

export type ResourceType = 'wood' | 'stone' | 'gold' | 'food';

export type BuildingType = 
  | 'house' | 'farm' | 'mine' | 'shop' | 'tower' | 'wall' 
  | 'castle' | 'warehouse' | 'market' | 'tavern' | 'library'
  | 'barracks' | 'hospital' | 'park' | 'fountain' | 'statue'
  | 'windmill' | 'bakery' | 'blacksmith' | 'temple' | 'school';

export type HeroSkin = 
  | 'wizard_kid' | 'robot_builder' | 'animal_hero' | 'ninja_star'
  | 'fairy_builder' | 'dragon_tamer' | 'space_explorer' | 'pirate_captain'
  | 'knight_builder' | 'nature_spirit';

export type HeroSkill = 'build_speed' | 'gather_boost' | 'defense_power';

export type QuestType = 'build' | 'gather' | 'defend' | 'explore';

export type MonsterType = 'slime' | 'goblin' | 'shadow' | 'dragon_baby' | 'rock_golem';

export type CityTier = 'village' | 'town' | 'city' | 'mega_city';

export interface Position {
  x: number;
  y: number;
}

export interface Building {
  id: string;
  type: BuildingType;
  position: Position;
  level: number;
  health: number;
  maxHealth: number;
  productionRate: number;
  lastCollected: number;
}

export interface BuildingConfig {
  type: BuildingType;
  name: string;
  emoji: string;
  cost: Partial<Record<ResourceType, number>>;
  produces?: { resource: ResourceType; rate: number };
  defense?: number;
  population?: number;
  unlockLevel: number;
  description: string;
}

export interface Hero {
  name: string;
  skin: HeroSkin;
  level: number;
  xp: number;
  xpToNext: number;
  skills: Record<HeroSkill, number>;
  unlockedSkins: HeroSkin[];
}

export interface Resources {
  wood: number;
  stone: number;
  gold: number;
  food: number;
}

export interface Quest {
  id: string;
  type: QuestType;
  title: string;
  description: string;
  target: number;
  progress: number;
  reward: {
    xp: number;
    coins: number;
    resources?: Partial<Resources>;
  };
  npc: string;
  completed: boolean;
  claimed: boolean;
}

export interface Monster {
  id: string;
  type: MonsterType;
  name: string;
  emoji: string;
  health: number;
  maxHealth: number;
  attack: number;
  xpReward: number;
  loot: Partial<Resources>;
}

export interface BattleState {
  active: boolean;
  monsters: Monster[];
  currentTurn: number;
  playerHealth: number;
  maxPlayerHealth: number;
  selectedSkill: string | null;
  log: string[];
}

export interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  target: number;
  progress: number;
  reward: number;
  completed: boolean;
}

export interface GameState {
  // Hero
  hero: Hero;
  
  // City
  cityName: string;
  cityTier: CityTier;
  cityScore: number;
  mapSize: number;
  buildings: Building[];
  population: number;
  
  // Resources
  resources: Resources;
  
  // Quests
  quests: Quest[];
  completedQuests: number;
  
  // Battle
  battle: BattleState;
  monstersDefeated: number;
  
  // Daily
  dailyChallenges: DailyChallenge[];
  lastLoginDate: string;
  loginStreak: number;
  
  // Camly Coins
  totalCoinsEarned: number;
  
  // Settings
  musicEnabled: boolean;
  sfxEnabled: boolean;
  
  // Meta
  lastSaved: number;
  playTime: number;
}

export interface LeaderboardEntry {
  id: string;
  username: string;
  avatarUrl?: string;
  cityScore: number;
  heroLevel: number;
  cityTier: CityTier;
  questsCompleted: number;
}
