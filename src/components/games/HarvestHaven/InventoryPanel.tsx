import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Coins, Search } from 'lucide-react';
import { useHarvestHavenStore } from '@/stores/harvestHavenStore';
import { CROPS, ANIMALS } from '@/data/harvestHavenData';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';

interface InventoryPanelProps {
  onClose: () => void;
}

export const InventoryPanel: React.FC<InventoryPanelProps> = ({ onClose }) => {
  const { inventory, addCoins } = useHarvestHavenStore();
  const [search, setSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  
  const getItemInfo = (itemId: string) => {
    const crop = CROPS.find((c) => c.id === itemId);
    if (crop) {
      return { name: crop.name, emoji: crop.emoji, price: crop.sellPrice, type: 'crop' };
    }
    
    const animal = ANIMALS.find((a) => a.product.toLowerCase().replace(' ', '_') === itemId);
    if (animal) {
      return { name: animal.product, emoji: animal.productEmoji, price: animal.sellPrice, type: 'product' };
    }
    
    // Factory products
    const products: Record<string, { name: string; emoji: string; price: number }> = {
      flour: { name: 'Flour', emoji: '🌾', price: 15 },
      bread: { name: 'Bread', emoji: '🍞', price: 30 },
      butter: { name: 'Butter', emoji: '🧈', price: 35 },
      juice: { name: 'Juice', emoji: '🧃', price: 40 },
      candy: { name: 'Candy', emoji: '🍬', price: 50 },
      fabric: { name: 'Fabric', emoji: '🧵', price: 45 },
      ice_cream: { name: 'Ice Cream', emoji: '🍦', price: 55 },
      pizza: { name: 'Pizza', emoji: '🍕', price: 70 },
    };
    
    return products[itemId] || { name: itemId, emoji: '📦', price: 10 };
  };
  
  const filteredInventory = inventory.filter((item) => {
    const info = getItemInfo(item.itemId);
    return info.name.toLowerCase().includes(search.toLowerCase());
  });
  
  const totalValue = inventory.reduce((sum, item) => {
    const info = getItemInfo(item.itemId);
    return sum + info.price * item.amount;
  }, 0);
  
  const handleSellItem = (itemId: string, amount: number) => {
    const { removeFromInventory } = useHarvestHavenStore.getState();
    const info = getItemInfo(itemId);
    if (removeFromInventory(itemId, amount)) {
      addCoins(info.price * amount);
    }
    setSelectedItem(null);
  };
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 50 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                🎒 Inventory
              </h2>
              <p className="text-sm opacity-80">
                Total value: {totalValue.toLocaleString()} coins
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          {/* Search */}
          <div className="mt-3 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-200" />
            <Input
              placeholder="Search items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-white/20 border-white/30 text-white placeholder:text-white/60"
            />
          </div>
        </div>
        
        {/* Inventory Grid */}
        <ScrollArea className="h-[50vh]">
          <div className="p-4">
            {filteredInventory.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <span className="text-4xl">🎒</span>
                <p className="mt-2">
                  {inventory.length === 0 ? 'Your inventory is empty!' : 'No items match your search'}
                </p>
                <p className="text-sm">Harvest crops to fill it up</p>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-3">
                {filteredInventory.map((item) => {
                  const info = getItemInfo(item.itemId);
                  const isSelected = selectedItem === item.itemId;
                  
                  return (
                    <motion.button
                      key={item.itemId}
                      onClick={() => setSelectedItem(isSelected ? null : item.itemId)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`relative p-3 rounded-xl border-2 transition-all ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500/50'
                          : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-3xl mb-1">{info.emoji}</div>
                      <div className="text-xs font-medium text-gray-600 truncate">
                        {info.name}
                      </div>
                      
                      {/* Amount Badge */}
                      <div className="absolute -top-1 -right-1 bg-indigo-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        {item.amount}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            )}
          </div>
        </ScrollArea>
        
        {/* Sell Panel */}
        {selectedItem && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="border-t-2 border-gray-100 p-4 bg-gray-50"
          >
            {(() => {
              const item = inventory.find((i) => i.itemId === selectedItem);
              if (!item) return null;
              
              const info = getItemInfo(selectedItem);
              
              return (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{info.emoji}</span>
                    <div>
                      <h4 className="font-bold text-gray-800">{info.name}</h4>
                      <div className="flex items-center gap-1 text-sm text-yellow-600">
                        <Coins className="w-4 h-4" />
                        {info.price} each
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleSellItem(selectedItem, 1)}
                      className="px-3 py-2 bg-yellow-500 text-white rounded-lg font-bold hover:bg-yellow-600 transition-colors"
                    >
                      Sell 1
                    </button>
                    {item.amount > 1 && (
                      <button
                        onClick={() => handleSellItem(selectedItem, item.amount)}
                        className="px-3 py-2 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600 transition-colors"
                      >
                        Sell All ({item.amount})
                      </button>
                    )}
                  </div>
                </div>
              );
            })()}
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};
