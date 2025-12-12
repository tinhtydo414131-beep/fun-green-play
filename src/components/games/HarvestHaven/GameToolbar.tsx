import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Hand, Hammer, Scissors, Move, Trash2, Wheat, 
  Factory, Home, Store, TreePine, Landmark, X,
  ChevronUp, ChevronDown
} from 'lucide-react';
import { useHarvestHavenStore } from '@/stores/harvestHavenStore';
import { BUILDINGS } from '@/data/harvestHavenData';

interface GameToolbarProps {
  onOpenBuildMenu: (category: string) => void;
  onOpenOrders: () => void;
  onOpenInventory: () => void;
}

export const GameToolbar: React.FC<GameToolbarProps> = ({ 
  onOpenBuildMenu, 
  onOpenOrders,
  onOpenInventory 
}) => {
  const { selectedTool, setSelectedTool, setSelectedBuildingId, activeOrders, inventory, level } = useHarvestHavenStore();
  const [showBuildCategories, setShowBuildCategories] = useState(false);
  
  const tools = [
    { id: 'select', icon: Hand, label: 'Select', color: 'from-blue-400 to-blue-600' },
    { id: 'build', icon: Hammer, label: 'Build', color: 'from-amber-400 to-amber-600' },
    { id: 'harvest', icon: Scissors, label: 'Harvest', color: 'from-green-400 to-green-600' },
    { id: 'move', icon: Move, label: 'Move', color: 'from-purple-400 to-purple-600' },
    { id: 'demolish', icon: Trash2, label: 'Remove', color: 'from-red-400 to-red-600' },
  ] as const;
  
  const buildCategories = [
    { id: 'farm', icon: Wheat, label: 'Farm', color: 'from-green-400 to-green-600' },
    { id: 'production', icon: Factory, label: 'Factory', color: 'from-orange-400 to-orange-600' },
    { id: 'residential', icon: Home, label: 'Housing', color: 'from-blue-400 to-blue-600' },
    { id: 'commercial', icon: Store, label: 'Shops', color: 'from-pink-400 to-pink-600' },
    { id: 'decoration', icon: TreePine, label: 'Decor', color: 'from-emerald-400 to-emerald-600' },
    { id: 'landmark', icon: Landmark, label: 'Landmark', color: 'from-yellow-400 to-yellow-600' },
  ];
  
  const handleToolClick = (toolId: string) => {
    if (toolId === 'build') {
      setShowBuildCategories(!showBuildCategories);
      setSelectedTool('build');
    } else {
      setShowBuildCategories(false);
      setSelectedTool(toolId as any);
      setSelectedBuildingId(null);
    }
  };
  
  const totalInventoryItems = inventory.reduce((sum, item) => sum + item.amount, 0);
  
  return (
    <div className="absolute bottom-0 left-0 right-0 z-20 p-2 sm:p-4">
      {/* Build Categories Popup */}
      <AnimatePresence>
        {showBuildCategories && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="mb-2 bg-white/95 backdrop-blur-md rounded-2xl p-3 shadow-xl"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-gray-700">Choose Category</h3>
              <button
                onClick={() => setShowBuildCategories(false)}
                className="p-1 hover:bg-gray-200 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {buildCategories.map((category) => {
                const unlockedCount = BUILDINGS.filter(
                  b => b.category === category.id && b.unlockLevel <= level
                ).length;
                const totalCount = BUILDINGS.filter(b => b.category === category.id).length;
                
                return (
                  <button
                    key={category.id}
                    onClick={() => {
                      onOpenBuildMenu(category.id);
                      setShowBuildCategories(false);
                    }}
                    className={`flex flex-col items-center p-2 rounded-xl bg-gradient-to-br ${category.color} text-white shadow-lg hover:scale-105 transition-transform`}
                  >
                    <category.icon className="w-6 h-6 mb-1" />
                    <span className="text-xs font-medium">{category.label}</span>
                    <span className="text-[10px] opacity-80">{unlockedCount}/{totalCount}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Main Toolbar */}
      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white/95 backdrop-blur-md rounded-2xl p-2 shadow-xl flex items-center justify-between gap-2"
      >
        {/* Tools */}
        <div className="flex items-center gap-1 sm:gap-2">
          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => handleToolClick(tool.id)}
              className={`relative flex flex-col items-center p-2 sm:p-3 rounded-xl transition-all ${
                selectedTool === tool.id
                  ? `bg-gradient-to-br ${tool.color} text-white shadow-lg scale-105`
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <tool.icon className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="text-[10px] sm:text-xs font-medium mt-0.5">{tool.label}</span>
              {tool.id === 'build' && (
                <motion.div
                  animate={{ rotate: showBuildCategories ? 180 : 0 }}
                  className="absolute -top-1 -right-1"
                >
                  <ChevronUp className="w-4 h-4" />
                </motion.div>
              )}
            </button>
          ))}
        </div>
        
        {/* Divider */}
        <div className="w-px h-12 bg-gray-300" />
        
        {/* Quick Actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Orders */}
          <button
            onClick={onOpenOrders}
            className="relative flex flex-col items-center p-2 sm:p-3 rounded-xl bg-gradient-to-br from-cyan-400 to-cyan-600 text-white shadow-lg hover:scale-105 transition-transform"
          >
            <span className="text-xl">📦</span>
            <span className="text-[10px] sm:text-xs font-medium">Orders</span>
            {activeOrders.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-[10px] font-bold flex items-center justify-center">
                {activeOrders.length}
              </span>
            )}
          </button>
          
          {/* Inventory */}
          <button
            onClick={onOpenInventory}
            className="relative flex flex-col items-center p-2 sm:p-3 rounded-xl bg-gradient-to-br from-indigo-400 to-indigo-600 text-white shadow-lg hover:scale-105 transition-transform"
          >
            <span className="text-xl">🎒</span>
            <span className="text-[10px] sm:text-xs font-medium">Items</span>
            {totalInventoryItems > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 rounded-full text-[10px] font-bold flex items-center justify-center text-black">
                {totalInventoryItems > 99 ? '99+' : totalInventoryItems}
              </span>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
