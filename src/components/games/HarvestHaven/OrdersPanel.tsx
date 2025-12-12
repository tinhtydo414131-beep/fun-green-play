import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Check, Plus, Coins, Star, Gem } from 'lucide-react';
import { useHarvestHavenStore } from '@/stores/harvestHavenStore';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';

interface OrdersPanelProps {
  onClose: () => void;
}

export const OrdersPanel: React.FC<OrdersPanelProps> = ({ onClose }) => {
  const { 
    activeOrders, 
    completedOrders,
    generateNewOrder, 
    completeOrder, 
    removeOrder,
    getInventoryAmount,
    level
  } = useHarvestHavenStore();
  
  // Generate orders if needed
  useEffect(() => {
    if (activeOrders.length < 3) {
      generateNewOrder();
    }
  }, [activeOrders.length, generateNewOrder]);
  
  const canFulfillOrder = (order: typeof activeOrders[0]) => {
    return order.items.every((item) => getInventoryAmount(item.item) >= item.amount);
  };
  
  const getTimeRemaining = (order: typeof activeOrders[0]) => {
    // For now, orders don't expire - just show infinite
    return '∞';
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
        <div className="bg-gradient-to-r from-cyan-500 to-blue-600 p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                📦 Orders Board
              </h2>
              <p className="text-sm opacity-80">
                Completed: {completedOrders} orders
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
        
        {/* Orders List */}
        <ScrollArea className="h-[60vh]">
          <div className="p-4 space-y-4">
            {activeOrders.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <span className="text-4xl">📭</span>
                <p className="mt-2">No orders right now!</p>
                <p className="text-sm">Check back soon</p>
              </div>
            ) : (
              activeOrders.map((order, index) => {
                const canFulfill = canFulfillOrder(order);
                
                return (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-4 rounded-2xl border-2 ${
                      canFulfill 
                        ? 'border-green-400 bg-green-50' 
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    {/* Customer Info */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-3xl">{order.customerEmoji}</span>
                        <div>
                          <h3 className="font-bold text-gray-800">{order.customer}</h3>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Clock className="w-3 h-3" />
                            {getTimeRemaining(order)}
                          </div>
                        </div>
                      </div>
                      
                      {/* Delete Order */}
                      <button
                        onClick={() => removeOrder(order.id)}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    
                    {/* Required Items */}
                    <div className="space-y-2 mb-3">
                      {order.items.map((item, idx) => {
                        const owned = getInventoryAmount(item.item);
                        const hasEnough = owned >= item.amount;
                        
                        return (
                          <div key={idx} className="flex items-center gap-2">
                            <span className="text-2xl">{item.emoji}</span>
                            <div className="flex-1">
                              <div className="flex justify-between text-sm">
                                <span className="capitalize">{item.item.replace('_', ' ')}</span>
                                <span className={hasEnough ? 'text-green-600' : 'text-red-500'}>
                                  {owned}/{item.amount}
                                </span>
                              </div>
                              <Progress 
                                value={Math.min(100, (owned / item.amount) * 100)} 
                                className="h-1.5"
                              />
                            </div>
                            {hasEnough && <Check className="w-5 h-5 text-green-500" />}
                          </div>
                        );
                      })}
                    </div>
                    
                    {/* Rewards */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-sm">
                        <span className="flex items-center gap-1 text-yellow-600">
                          <Coins className="w-4 h-4" />
                          {order.reward.coins}
                        </span>
                        <span className="flex items-center gap-1 text-blue-600">
                          <Star className="w-4 h-4" />
                          {order.reward.xp} XP
                        </span>
                        {order.reward.gems && (
                          <span className="flex items-center gap-1 text-purple-600">
                            <Gem className="w-4 h-4" />
                            {order.reward.gems}
                          </span>
                        )}
                      </div>
                      
                      {/* Complete Button */}
                      <button
                        onClick={() => completeOrder(order.id)}
                        disabled={!canFulfill}
                        className={`px-4 py-2 rounded-full font-bold text-white transition-all ${
                          canFulfill
                            ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:scale-105 shadow-lg'
                            : 'bg-gray-300 cursor-not-allowed'
                        }`}
                      >
                        {canFulfill ? 'Deliver!' : 'Need Items'}
                      </button>
                    </div>
                  </motion.div>
                );
              })
            )}
            
            {/* Add Order Button */}
            {activeOrders.length < 5 && (
              <button
                onClick={() => generateNewOrder()}
                className="w-full p-4 rounded-2xl border-2 border-dashed border-gray-300 text-gray-500 hover:border-cyan-400 hover:text-cyan-600 transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Get New Order
              </button>
            )}
          </div>
        </ScrollArea>
      </motion.div>
    </motion.div>
  );
};
