import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  GameState, Building, BuildingType, HeroSkin, Quest, Monster,
  Resources, Position, DailyChallenge, CityTier, MonsterType
} from '@/types/cityCreatorRPG';
import { BUILDING_CONFIGS, MONSTER_CONFIGS, generateQuests, generateDailyChallenges } from '@/utils/cityCreatorConfig';

const initialState: GameState = {
  hero: {
    name: 'Hero',
    skin: 'wizard_kid',
    level: 1,
    xp: 0,
    xpToNext: 100,
    skills: { build_speed: 1, gather_boost: 1, defense_power: 1 },
    unlockedSkins: ['wizard_kid', 'robot_builder', 'animal_hero'],
  },
  cityName: 'My City',
  cityTier: 'village',
  cityScore: 0,
  mapSize: 20,
  buildings: [],
  population: 0,
  resources: { wood: 100, stone: 50, gold: 50, food: 100 },
  quests: [],
  completedQuests: 0,
  battle: {
    active: false,
    monsters: [],
    currentTurn: 0,
    playerHealth: 100,
    maxPlayerHealth: 100,
    selectedSkill: null,
    log: [],
  },
  monstersDefeated: 0,
  dailyChallenges: [],
  lastLoginDate: '',
  loginStreak: 0,
  totalCoinsEarned: 0,
  musicEnabled: true,
  sfxEnabled: true,
  lastSaved: Date.now(),
  playTime: 0,
};

interface CityCreatorStore extends GameState {
  // Hero Actions
  setHeroName: (name: string) => void;
  setHeroSkin: (skin: HeroSkin) => void;
  addXP: (amount: number) => void;
  upgradeSkill: (skill: keyof GameState['hero']['skills']) => void;
  unlockSkin: (skin: HeroSkin) => void;
  
  // City Actions
  setCityName: (name: string) => void;
  placeBuilding: (type: BuildingType, position: Position) => boolean;
  removeBuilding: (id: string) => void;
  upgradeBuilding: (id: string) => void;
  collectResources: () => void;
  
  // Resource Actions
  addResources: (resources: Partial<Resources>) => void;
  spendResources: (resources: Partial<Resources>) => boolean;
  
  // Quest Actions
  refreshQuests: () => void;
  updateQuestProgress: (type: string, amount: number) => void;
  claimQuestReward: (questId: string) => void;
  
  // Battle Actions
  startBattle: () => void;
  useSkill: (skillId: string) => void;
  endBattle: (victory: boolean) => void;
  
  // Daily Actions
  checkDailyLogin: () => number;
  refreshDailyChallenges: () => void;
  updateChallengeProgress: (challengeId: string, amount: number) => void;
  
  // Settings
  toggleMusic: () => void;
  toggleSfx: () => void;
  
  // Game Actions
  saveGame: () => void;
  resetGame: () => void;
  updatePlayTime: (seconds: number) => void;
  
  // Computed
  calculateCityScore: () => number;
  getCityTier: () => CityTier;
}

export const useCityCreatorStore = create<CityCreatorStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setHeroName: (name) => set({ hero: { ...get().hero, name } }),
      
      setHeroSkin: (skin) => set({ hero: { ...get().hero, skin } }),
      
      addXP: (amount) => {
        const { hero } = get();
        let newXP = hero.xp + amount;
        let newLevel = hero.level;
        let newXPToNext = hero.xpToNext;
        
        while (newXP >= newXPToNext && newLevel < 50) {
          newXP -= newXPToNext;
          newLevel++;
          newXPToNext = Math.floor(newXPToNext * 1.2);
        }
        
        const mapSize = newLevel >= 30 ? 50 : newLevel >= 15 ? 35 : 20;
        
        set({
          hero: { ...hero, xp: newXP, level: newLevel, xpToNext: newXPToNext },
          mapSize,
        });
      },
      
      upgradeSkill: (skill) => {
        const { hero } = get();
        if (hero.skills[skill] < 10) {
          set({
            hero: {
              ...hero,
              skills: { ...hero.skills, [skill]: hero.skills[skill] + 1 },
            },
          });
        }
      },
      
      unlockSkin: (skin) => {
        const { hero } = get();
        if (!hero.unlockedSkins.includes(skin)) {
          set({
            hero: { ...hero, unlockedSkins: [...hero.unlockedSkins, skin] },
          });
        }
      },
      
      setCityName: (cityName) => set({ cityName }),
      
      placeBuilding: (type, position) => {
        const { buildings, resources, hero } = get();
        const config = BUILDING_CONFIGS[type];
        
        // Check if position is occupied
        if (buildings.some(b => b.position.x === position.x && b.position.y === position.y)) {
          return false;
        }
        
        // Check if unlocked
        if (config.unlockLevel > hero.level) return false;
        
        // Check resources
        const canAfford = Object.entries(config.cost).every(
          ([res, amount]) => resources[res as keyof Resources] >= (amount || 0)
        );
        if (!canAfford) return false;
        
        // Spend resources
        const newResources = { ...resources };
        Object.entries(config.cost).forEach(([res, amount]) => {
          newResources[res as keyof Resources] -= amount || 0;
        });
        
        const newBuilding: Building = {
          id: `${type}-${Date.now()}`,
          type,
          position,
          level: 1,
          health: 100,
          maxHealth: 100,
          productionRate: config.produces?.rate || 0,
          lastCollected: Date.now(),
        };
        
        const newBuildings = [...buildings, newBuilding];
        const newPopulation = newBuildings.reduce((sum, b) => {
          return sum + (BUILDING_CONFIGS[b.type].population || 0) * b.level;
        }, 0);
        
        set({
          buildings: newBuildings,
          resources: newResources,
          population: newPopulation,
        });
        
        get().updateQuestProgress('build', 1);
        get().calculateCityScore();
        
        return true;
      },
      
      removeBuilding: (id) => {
        const { buildings } = get();
        const newBuildings = buildings.filter(b => b.id !== id);
        set({ buildings: newBuildings });
        get().calculateCityScore();
      },
      
      upgradeBuilding: (id) => {
        const { buildings, resources } = get();
        const building = buildings.find(b => b.id === id);
        if (!building || building.level >= 5) return;
        
        const upgradeCost = {
          wood: 50 * building.level,
          stone: 30 * building.level,
          gold: 20 * building.level,
        };
        
        const canAfford = Object.entries(upgradeCost).every(
          ([res, amount]) => resources[res as keyof Resources] >= amount
        );
        if (!canAfford) return;
        
        const newResources = { ...resources };
        Object.entries(upgradeCost).forEach(([res, amount]) => {
          newResources[res as keyof Resources] -= amount;
        });
        
        const newBuildings = buildings.map(b =>
          b.id === id
            ? { ...b, level: b.level + 1, maxHealth: b.maxHealth + 20, productionRate: b.productionRate * 1.2 }
            : b
        );
        
        set({ buildings: newBuildings, resources: newResources });
        get().calculateCityScore();
      },
      
      collectResources: () => {
        const { buildings, resources, hero } = get();
        const now = Date.now();
        const gatherBoost = 1 + (hero.skills.gather_boost - 1) * 0.1;
        
        let newResources = { ...resources };
        const newBuildings = buildings.map(b => {
          const config = BUILDING_CONFIGS[b.type];
          if (config.produces) {
            const timePassed = (now - b.lastCollected) / 1000 / 60; // minutes
            const produced = Math.floor(b.productionRate * b.level * timePassed * gatherBoost);
            newResources[config.produces.resource] += produced;
            return { ...b, lastCollected: now };
          }
          return b;
        });
        
        set({ buildings: newBuildings, resources: newResources });
        get().updateQuestProgress('gather', Object.values(newResources).reduce((a, b) => a + b, 0));
      },
      
      addResources: (toAdd) => {
        const { resources } = get();
        const newResources = { ...resources };
        Object.entries(toAdd).forEach(([res, amount]) => {
          if (amount) newResources[res as keyof Resources] += amount;
        });
        set({ resources: newResources });
      },
      
      spendResources: (toSpend) => {
        const { resources } = get();
        const canAfford = Object.entries(toSpend).every(
          ([res, amount]) => resources[res as keyof Resources] >= (amount || 0)
        );
        if (!canAfford) return false;
        
        const newResources = { ...resources };
        Object.entries(toSpend).forEach(([res, amount]) => {
          if (amount) newResources[res as keyof Resources] -= amount;
        });
        set({ resources: newResources });
        return true;
      },
      
      refreshQuests: () => {
        const { hero } = get();
        set({ quests: generateQuests(hero.level) });
      },
      
      updateQuestProgress: (type, amount) => {
        const { quests } = get();
        const newQuests = quests.map(q => {
          if (q.type === type && !q.completed) {
            const newProgress = Math.min(q.progress + amount, q.target);
            return { ...q, progress: newProgress, completed: newProgress >= q.target };
          }
          return q;
        });
        set({ quests: newQuests });
      },
      
      claimQuestReward: (questId) => {
        const { quests, completedQuests } = get();
        const quest = quests.find(q => q.id === questId);
        if (!quest || !quest.completed || quest.claimed) return;
        
        get().addXP(quest.reward.xp);
        if (quest.reward.resources) {
          get().addResources(quest.reward.resources);
        }
        
        const newQuests = quests.map(q =>
          q.id === questId ? { ...q, claimed: true } : q
        );
        
        set({
          quests: newQuests,
          completedQuests: completedQuests + 1,
          totalCoinsEarned: get().totalCoinsEarned + quest.reward.coins,
        });
      },
      
      startBattle: () => {
        const { hero, battle } = get();
        const monsterCount = Math.min(3, 1 + Math.floor(hero.level / 10));
        const monsters: Monster[] = [];
        
        const monsterTypes: MonsterType[] = ['slime', 'goblin', 'shadow', 'dragon_baby', 'rock_golem'];
        
        for (let i = 0; i < monsterCount; i++) {
          const type = monsterTypes[Math.floor(Math.random() * Math.min(monsterTypes.length, 1 + Math.floor(hero.level / 5)))];
          const config = MONSTER_CONFIGS[type];
          const levelMod = 1 + hero.level * 0.1;
          
          monsters.push({
            id: `monster-${i}`,
            type,
            name: config.name,
            emoji: config.emoji,
            health: Math.floor(config.health * levelMod),
            maxHealth: Math.floor(config.health * levelMod),
            attack: Math.floor(config.attack * levelMod),
            xpReward: Math.floor(config.xpReward * levelMod),
            loot: config.loot,
          });
        }
        
        set({
          battle: {
            ...battle,
            active: true,
            monsters,
            currentTurn: 0,
            playerHealth: 100 + hero.skills.defense_power * 10,
            maxPlayerHealth: 100 + hero.skills.defense_power * 10,
            selectedSkill: null,
            log: ['⚔️ Battle started!'],
          },
        });
      },
      
      useSkill: (skillId) => {
        const { battle, hero, buildings } = get();
        if (!battle.active) return;
        
        let damage = 0;
        let logMessage = '';
        
        const defensePower = hero.skills.defense_power;
        const towerBonus = buildings.filter(b => b.type === 'tower').reduce((sum, b) => sum + b.level * 5, 0);
        
        switch (skillId) {
          case 'fireball':
            damage = 20 + hero.level * 2 + towerBonus;
            logMessage = `🔥 Fireball deals ${damage} damage!`;
            break;
          case 'shield':
            const heal = 10 + defensePower * 3;
            set({
              battle: {
                ...battle,
                playerHealth: Math.min(battle.maxPlayerHealth, battle.playerHealth + heal),
                log: [...battle.log, `🛡️ Shield heals ${heal} HP!`],
              },
            });
            return;
          case 'lightning':
            damage = 15 + hero.level;
            logMessage = `⚡ Lightning strikes all enemies for ${damage}!`;
            break;
          default:
            damage = 10 + hero.level;
            logMessage = `👊 Attack deals ${damage} damage!`;
        }
        
        // Apply damage to first alive monster (or all for lightning)
        const newMonsters = battle.monsters.map((m, i) => {
          if (skillId === 'lightning' || (i === 0 && m.health > 0)) {
            return { ...m, health: Math.max(0, m.health - damage) };
          }
          return m;
        });
        
        // Monster counter-attack
        let monsterDamage = 0;
        newMonsters.forEach(m => {
          if (m.health > 0) {
            monsterDamage += Math.max(1, m.attack - defensePower);
          }
        });
        
        const newPlayerHealth = battle.playerHealth - monsterDamage;
        const monstersAlive = newMonsters.some(m => m.health > 0);
        
        set({
          battle: {
            ...battle,
            monsters: newMonsters,
            playerHealth: newPlayerHealth,
            currentTurn: battle.currentTurn + 1,
            log: [
              ...battle.log,
              logMessage,
              monsterDamage > 0 ? `👹 Monsters deal ${monsterDamage} damage!` : '',
            ].filter(Boolean),
          },
        });
        
        // Check battle end
        if (!monstersAlive) {
          get().endBattle(true);
        } else if (newPlayerHealth <= 0) {
          get().endBattle(false);
        }
      },
      
      endBattle: (victory) => {
        const { battle, monstersDefeated } = get();
        
        if (victory) {
          let totalXP = 0;
          let totalLoot: Partial<Resources> = {};
          
          battle.monsters.forEach(m => {
            totalXP += m.xpReward;
            Object.entries(m.loot).forEach(([res, amount]) => {
              totalLoot[res as keyof Resources] = (totalLoot[res as keyof Resources] || 0) + (amount || 0);
            });
          });
          
          get().addXP(totalXP);
          get().addResources(totalLoot);
          get().updateQuestProgress('defend', battle.monsters.length);
          
          set({
            battle: { ...battle, active: false, log: [...battle.log, `🎉 Victory! +${totalXP} XP`] },
            monstersDefeated: monstersDefeated + battle.monsters.length,
          });
        } else {
          set({
            battle: { ...battle, active: false, log: [...battle.log, '💔 Defeated... Try again!'] },
          });
        }
      },
      
      checkDailyLogin: () => {
        const today = new Date().toDateString();
        const { lastLoginDate, loginStreak, totalCoinsEarned } = get();
        
        if (lastLoginDate === today) return 0;
        
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        const newStreak = lastLoginDate === yesterday ? loginStreak + 1 : 1;
        const bonus = 10000 + Math.min(newStreak * 1000, 5000);
        
        set({
          lastLoginDate: today,
          loginStreak: newStreak,
          totalCoinsEarned: totalCoinsEarned + bonus,
        });
        
        return bonus;
      },
      
      refreshDailyChallenges: () => {
        set({ dailyChallenges: generateDailyChallenges() });
      },
      
      updateChallengeProgress: (challengeId, amount) => {
        const { dailyChallenges, totalCoinsEarned } = get();
        const newChallenges = dailyChallenges.map(c => {
          if (c.id === challengeId && !c.completed) {
            const newProgress = Math.min(c.progress + amount, c.target);
            const completed = newProgress >= c.target;
            if (completed) {
              set({ totalCoinsEarned: totalCoinsEarned + c.reward });
            }
            return { ...c, progress: newProgress, completed };
          }
          return c;
        });
        set({ dailyChallenges: newChallenges });
      },
      
      toggleMusic: () => set({ musicEnabled: !get().musicEnabled }),
      toggleSfx: () => set({ sfxEnabled: !get().sfxEnabled }),
      
      saveGame: () => set({ lastSaved: Date.now() }),
      
      resetGame: () => set({ ...initialState, quests: generateQuests(1), dailyChallenges: generateDailyChallenges() }),
      
      updatePlayTime: (seconds) => set({ playTime: get().playTime + seconds }),
      
      calculateCityScore: () => {
        const { buildings, population } = get();
        const buildingScore = buildings.reduce((sum, b) => sum + b.level * 10, 0);
        const defenseScore = buildings.filter(b => ['tower', 'wall', 'barracks'].includes(b.type)).length * 25;
        const score = buildingScore + population * 5 + defenseScore;
        
        const tier: CityTier = 
          score >= 5000 ? 'mega_city' :
          score >= 2000 ? 'city' :
          score >= 500 ? 'town' : 'village';
        
        set({ cityScore: score, cityTier: tier });
        return score;
      },
      
      getCityTier: () => get().cityTier,
    }),
    {
      name: 'city-creator-rpg-save',
    }
  )
);
