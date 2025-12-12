import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CROPS, ANIMALS, BUILDINGS, generateOrder, LEVEL_THRESHOLDS, Order, Crop, Animal, Building } from '@/data/harvestHavenData';

export interface PlacedBuilding {
  id: string;
  buildingId: string;
  x: number;
  y: number;
  builtAt: number;
  lastCollected?: number;
}

export interface PlantedCrop {
  id: string;
  cropId: string;
  fieldId: string;
  plantedAt: number;
  harvested: boolean;
}

export interface OwnedAnimal {
  id: string;
  animalId: string;
  penId: string;
  lastProduced: number;
}

export interface InventoryItem {
  itemId: string;
  amount: number;
}

export interface DailyQuestProgress {
  questId: string;
  progress: number;
  completed: boolean;
}

export interface HarvestHavenState {
  // Resources
  coins: number;
  gems: number;
  xp: number;
  level: number;
  energy: number;
  maxEnergy: number;
  lastEnergyUpdate: number;
  
  // Inventory
  inventory: InventoryItem[];
  
  // Buildings & Farming
  placedBuildings: PlacedBuilding[];
  plantedCrops: PlantedCrop[];
  ownedAnimals: OwnedAnimal[];
  
  // Orders
  activeOrders: Order[];
  completedOrders: number;
  
  // Progress
  dailyQuests: DailyQuestProgress[];
  lastDailyReset: number;
  achievements: string[];
  totalHarvested: number;
  totalProduced: number;
  totalEarned: number;
  
  // UI State
  selectedTool: 'select' | 'build' | 'harvest' | 'move' | 'demolish';
  selectedBuildingId: string | null;
  showTutorial: boolean;
  tutorialStep: number;
  
  // Time
  lastSaveTime: number;
  totalPlayTime: number;
  
  // Actions
  addCoins: (amount: number) => void;
  spendCoins: (amount: number) => boolean;
  addGems: (amount: number) => void;
  spendGems: (amount: number) => boolean;
  addXP: (amount: number) => void;
  useEnergy: (amount: number) => boolean;
  regenerateEnergy: () => void;
  
  addToInventory: (itemId: string, amount: number) => void;
  removeFromInventory: (itemId: string, amount: number) => boolean;
  getInventoryAmount: (itemId: string) => number;
  
  placeBuilding: (buildingId: string, x: number, y: number) => boolean;
  removeBuilding: (id: string) => void;
  
  plantCrop: (cropId: string, fieldId: string) => boolean;
  harvestCrop: (plantedCropId: string) => boolean;
  
  addAnimal: (animalId: string, penId: string) => boolean;
  collectAnimalProduct: (ownedAnimalId: string) => boolean;
  
  generateNewOrder: () => void;
  completeOrder: (orderId: string) => boolean;
  removeOrder: (orderId: string) => void;
  
  setSelectedTool: (tool: 'select' | 'build' | 'harvest' | 'move' | 'demolish') => void;
  setSelectedBuildingId: (id: string | null) => void;
  
  completeTutorialStep: () => void;
  dismissTutorial: () => void;
  
  resetGame: () => void;
  calculateOfflineProgress: () => { coins: number; items: InventoryItem[] };
}

const initialState = {
  coins: 500,
  gems: 10,
  xp: 0,
  level: 1,
  energy: 100,
  maxEnergy: 100,
  lastEnergyUpdate: Date.now(),
  inventory: [],
  placedBuildings: [],
  plantedCrops: [],
  ownedAnimals: [],
  activeOrders: [],
  completedOrders: 0,
  dailyQuests: [],
  lastDailyReset: Date.now(),
  achievements: [],
  totalHarvested: 0,
  totalProduced: 0,
  totalEarned: 0,
  selectedTool: 'select' as const,
  selectedBuildingId: null,
  showTutorial: true,
  tutorialStep: 0,
  lastSaveTime: Date.now(),
  totalPlayTime: 0,
};

export const useHarvestHavenStore = create<HarvestHavenState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      addCoins: (amount) => {
        set((state) => ({
          coins: state.coins + amount,
          totalEarned: state.totalEarned + amount,
        }));
      },
      
      spendCoins: (amount) => {
        const state = get();
        if (state.coins >= amount) {
          set({ coins: state.coins - amount });
          return true;
        }
        return false;
      },
      
      addGems: (amount) => {
        set((state) => ({ gems: state.gems + amount }));
      },
      
      spendGems: (amount) => {
        const state = get();
        if (state.gems >= amount) {
          set({ gems: state.gems - amount });
          return true;
        }
        return false;
      },
      
      addXP: (amount) => {
        set((state) => {
          const newXP = state.xp + amount;
          let newLevel = state.level;
          
          // Check for level up
          while (newLevel < LEVEL_THRESHOLDS.length && newXP >= LEVEL_THRESHOLDS[newLevel]) {
            newLevel++;
          }
          
          return {
            xp: newXP,
            level: newLevel,
            maxEnergy: 100 + (newLevel - 1) * 10,
          };
        });
      },
      
      useEnergy: (amount) => {
        const state = get();
        if (state.energy >= amount) {
          set({ energy: state.energy - amount });
          return true;
        }
        return false;
      },
      
      regenerateEnergy: () => {
        const state = get();
        const now = Date.now();
        const timePassed = (now - state.lastEnergyUpdate) / 1000;
        const energyGained = Math.floor(timePassed / 60); // 1 energy per minute
        
        if (energyGained > 0) {
          set({
            energy: Math.min(state.maxEnergy, state.energy + energyGained),
            lastEnergyUpdate: now,
          });
        }
      },
      
      addToInventory: (itemId, amount) => {
        set((state) => {
          const existing = state.inventory.find((i) => i.itemId === itemId);
          if (existing) {
            return {
              inventory: state.inventory.map((i) =>
                i.itemId === itemId ? { ...i, amount: i.amount + amount } : i
              ),
            };
          }
          return {
            inventory: [...state.inventory, { itemId, amount }],
          };
        });
      },
      
      removeFromInventory: (itemId, amount) => {
        const state = get();
        const existing = state.inventory.find((i) => i.itemId === itemId);
        if (existing && existing.amount >= amount) {
          set({
            inventory: state.inventory.map((i) =>
              i.itemId === itemId ? { ...i, amount: i.amount - amount } : i
            ).filter((i) => i.amount > 0),
          });
          return true;
        }
        return false;
      },
      
      getInventoryAmount: (itemId) => {
        const state = get();
        return state.inventory.find((i) => i.itemId === itemId)?.amount || 0;
      },
      
      placeBuilding: (buildingId, x, y) => {
        const state = get();
        const building = BUILDINGS.find((b) => b.id === buildingId);
        if (!building) return false;
        
        if (state.coins < building.cost) return false;
        if (state.level < building.unlockLevel) return false;
        
        const id = `building_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        set({
          coins: state.coins - building.cost,
          placedBuildings: [
            ...state.placedBuildings,
            { id, buildingId, x, y, builtAt: Date.now() },
          ],
        });
        
        return true;
      },
      
      removeBuilding: (id) => {
        set((state) => ({
          placedBuildings: state.placedBuildings.filter((b) => b.id !== id),
        }));
      },
      
      plantCrop: (cropId, fieldId) => {
        const state = get();
        const crop = CROPS.find((c) => c.id === cropId);
        if (!crop) return false;
        if (state.level < crop.unlockLevel) return false;
        
        // Check if field already has a crop
        if (state.plantedCrops.some((p) => p.fieldId === fieldId && !p.harvested)) {
          return false;
        }
        
        const id = `crop_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        set({
          plantedCrops: [
            ...state.plantedCrops,
            { id, cropId, fieldId, plantedAt: Date.now(), harvested: false },
          ],
        });
        
        return true;
      },
      
      harvestCrop: (plantedCropId) => {
        const state = get();
        const planted = state.plantedCrops.find((p) => p.id === plantedCropId);
        if (!planted || planted.harvested) return false;
        
        const crop = CROPS.find((c) => c.id === planted.cropId);
        if (!crop) return false;
        
        const growTime = crop.growTime * 1000;
        if (Date.now() - planted.plantedAt < growTime) return false;
        
        get().addToInventory(crop.id, 1);
        get().addXP(crop.xpReward);
        
        set((state) => ({
          plantedCrops: state.plantedCrops.filter((p) => p.id !== plantedCropId),
          totalHarvested: state.totalHarvested + 1,
        }));
        
        return true;
      },
      
      addAnimal: (animalId, penId) => {
        const state = get();
        const animal = ANIMALS.find((a) => a.id === animalId);
        if (!animal) return false;
        if (state.level < animal.unlockLevel) return false;
        
        const id = `animal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        set({
          ownedAnimals: [
            ...state.ownedAnimals,
            { id, animalId, penId, lastProduced: Date.now() },
          ],
        });
        
        return true;
      },
      
      collectAnimalProduct: (ownedAnimalId) => {
        const state = get();
        const owned = state.ownedAnimals.find((a) => a.id === ownedAnimalId);
        if (!owned) return false;
        
        const animal = ANIMALS.find((a) => a.id === owned.animalId);
        if (!animal) return false;
        
        const produceTime = animal.produceTime * 1000;
        if (Date.now() - owned.lastProduced < produceTime) return false;
        
        get().addToInventory(animal.product.toLowerCase().replace(' ', '_'), 1);
        get().addXP(5);
        
        set((state) => ({
          ownedAnimals: state.ownedAnimals.map((a) =>
            a.id === ownedAnimalId ? { ...a, lastProduced: Date.now() } : a
          ),
          totalProduced: state.totalProduced + 1,
        }));
        
        return true;
      },
      
      generateNewOrder: () => {
        const state = get();
        if (state.activeOrders.length >= 5) return;
        
        const order = generateOrder(state.level);
        set({ activeOrders: [...state.activeOrders, order] });
      },
      
      completeOrder: (orderId) => {
        const state = get();
        const order = state.activeOrders.find((o) => o.id === orderId);
        if (!order) return false;
        
        // Check if player has all items
        for (const item of order.items) {
          if (get().getInventoryAmount(item.item) < item.amount) {
            return false;
          }
        }
        
        // Remove items from inventory
        for (const item of order.items) {
          get().removeFromInventory(item.item, item.amount);
        }
        
        // Give rewards
        get().addCoins(order.reward.coins);
        get().addXP(order.reward.xp);
        if (order.reward.gems) {
          get().addGems(order.reward.gems);
        }
        
        set((state) => ({
          activeOrders: state.activeOrders.filter((o) => o.id !== orderId),
          completedOrders: state.completedOrders + 1,
        }));
        
        return true;
      },
      
      removeOrder: (orderId) => {
        set((state) => ({
          activeOrders: state.activeOrders.filter((o) => o.id !== orderId),
        }));
      },
      
      setSelectedTool: (tool) => {
        set({ selectedTool: tool, selectedBuildingId: null });
      },
      
      setSelectedBuildingId: (id) => {
        set({ selectedBuildingId: id });
      },
      
      completeTutorialStep: () => {
        set((state) => ({ tutorialStep: state.tutorialStep + 1 }));
      },
      
      dismissTutorial: () => {
        set({ showTutorial: false });
      },
      
      resetGame: () => {
        set({ ...initialState, lastSaveTime: Date.now() });
      },
      
      calculateOfflineProgress: () => {
        const state = get();
        const now = Date.now();
        let totalCoins = 0;
        const items: InventoryItem[] = [];
        
        // Calculate income from buildings
        for (const placed of state.placedBuildings) {
          const building = BUILDINGS.find((b) => b.id === placed.buildingId);
          if (building?.income && building.incomeInterval) {
            const lastCollected = placed.lastCollected || placed.builtAt;
            const intervals = Math.floor((now - lastCollected) / (building.incomeInterval * 1000));
            totalCoins += building.income * intervals;
          }
        }
        
        // Calculate harvested crops
        for (const planted of state.plantedCrops) {
          if (!planted.harvested) {
            const crop = CROPS.find((c) => c.id === planted.cropId);
            if (crop) {
              const growTime = crop.growTime * 1000;
              if (now - planted.plantedAt >= growTime) {
                const existing = items.find((i) => i.itemId === crop.id);
                if (existing) {
                  existing.amount++;
                } else {
                  items.push({ itemId: crop.id, amount: 1 });
                }
              }
            }
          }
        }
        
        return { coins: totalCoins, items };
      },
    }),
    {
      name: 'harvest-haven-save',
    }
  )
);
