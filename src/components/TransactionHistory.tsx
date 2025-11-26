import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle, XCircle, Clock, Users, Coins, Calendar, ArrowUpRight, Zap } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Transaction {
  id: string;
  amount: number;
  token_type: string;
  status: string;
  created_at: string;
  transaction_hash?: string;
  notes?: string;
  type: 'send' | 'receive' | 'airdrop';
  recipients_count?: number;
}

interface TransactionHistoryProps {
  transactions: Transaction[];
}

export const TransactionHistory = ({ transactions }: TransactionHistoryProps) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-400" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-400" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'airdrop':
        return <Zap className="w-6 h-6 text-yellow-400" />;
      case 'send':
        return <ArrowUpRight className="w-6 h-6 text-cyan-400" />;
      default:
        return <Coins className="w-6 h-6 text-green-400" />;
    }
  };

  const getTypeGradient = (type: string) => {
    switch (type) {
      case 'airdrop':
        return 'linear-gradient(135deg, rgba(255,215,0,0.2), rgba(255,20,147,0.2))';
      case 'send':
        return 'linear-gradient(135deg, rgba(0,255,255,0.2), rgba(0,136,255,0.2))';
      default:
        return 'linear-gradient(135deg, rgba(0,255,0,0.2), rgba(0,200,0,0.2))';
    }
  };

  const getTypeBorder = (type: string) => {
    switch (type) {
      case 'airdrop':
        return '2px solid rgba(255,215,0,0.5)';
      case 'send':
        return '2px solid rgba(0,255,255,0.5)';
      default:
        return '2px solid rgba(0,255,0,0.5)';
    }
  };

  if (transactions.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12"
      >
        <motion.div
          animate={{ 
            rotate: [0, 10, -10, 10, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className="inline-block mb-4"
        >
          <Coins className="w-16 h-16 text-yellow-400" />
        </motion.div>
        <p className="text-white/60 text-lg font-bold">No transactions yet</p>
        <p className="text-white/40 text-sm">Your transaction history will appear here</p>
      </motion.div>
    );
  }

  return (
    <ScrollArea className="h-[600px] pr-4">
      <div className="space-y-4">
        {transactions.map((tx, index) => (
          <motion.div
            key={tx.id}
            initial={{ opacity: 0, x: -50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
          >
            <Card 
              className="border-0 relative overflow-hidden cursor-pointer"
              style={{
                background: getTypeGradient(tx.type),
                backdropFilter: 'blur(20px)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                border: getTypeBorder(tx.type)
              }}
            >
              {/* Animated gradient overlay */}
              <motion.div
                animate={{
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                }}
                transition={{ duration: 5, repeat: Infinity }}
                className="absolute inset-0 opacity-30 pointer-events-none"
                style={{
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                  backgroundSize: '200% 100%'
                }}
              />

              {/* Content */}
              <div className="relative z-10 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {/* Type icon with animation */}
                    <motion.div
                      animate={{ 
                        rotate: tx.type === 'airdrop' ? [0, 360] : 0,
                        scale: [1, 1.1, 1]
                      }}
                      transition={{ 
                        rotate: { duration: 3, repeat: Infinity, ease: "linear" },
                        scale: { duration: 2, repeat: Infinity }
                      }}
                      className="p-3 rounded-full"
                      style={{
                        background: tx.type === 'airdrop' 
                          ? 'linear-gradient(135deg, #FFD700, #FFA500)'
                          : tx.type === 'send'
                          ? 'linear-gradient(135deg, #00FFFF, #0088FF)'
                          : 'linear-gradient(135deg, #00FF00, #00AA00)',
                        boxShadow: '0 0 20px rgba(255,215,0,0.5)'
                      }}
                    >
                      {getTypeIcon(tx.type)}
                    </motion.div>

                    <div>
                      <h3 className="text-xl font-black text-white mb-1">
                        {tx.type === 'airdrop' ? '🎁 AIRDROP SENT' : 
                         tx.type === 'send' ? '📤 Token Sent' : 
                         '📥 Token Received'}
                      </h3>
                      <div className="flex items-center gap-2 text-white/60 text-sm">
                        <Calendar className="w-4 h-4" />
                        <span className="font-bold">
                          {formatDistanceToNow(new Date(tx.created_at), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status badge */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-center gap-2 px-3 py-1 rounded-full"
                    style={{
                      background: tx.status === 'completed' 
                        ? 'rgba(0,255,0,0.2)' 
                        : tx.status === 'failed'
                        ? 'rgba(255,0,0,0.2)'
                        : 'rgba(255,255,0,0.2)'
                    }}
                  >
                    {getStatusIcon(tx.status)}
                    <span className="text-xs font-black text-white uppercase">
                      {tx.status}
                    </span>
                  </motion.div>
                </div>

                {/* Transaction details */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div 
                    className="p-3 rounded-xl"
                    style={{
                      background: 'rgba(255,255,255,0.1)',
                      backdropFilter: 'blur(10px)'
                    }}
                  >
                    <p className="text-xs text-white/60 mb-1 font-bold">Amount</p>
                    <p className="text-lg font-black text-white">
                      {tx.amount.toLocaleString()} {tx.token_type}
                    </p>
                  </div>

                  {tx.type === 'airdrop' && tx.recipients_count && (
                    <div 
                      className="p-3 rounded-xl"
                      style={{
                        background: 'rgba(255,255,255,0.1)',
                        backdropFilter: 'blur(10px)'
                      }}
                    >
                      <p className="text-xs text-white/60 mb-1 font-bold flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        Recipients
                      </p>
                      <p className="text-lg font-black text-white">
                        {tx.recipients_count} wallets
                      </p>
                    </div>
                  )}
                </div>

                {/* Transaction hash */}
                {tx.transaction_hash && (
                  <div 
                    className="p-3 rounded-xl"
                    style={{
                      background: 'rgba(0,0,0,0.2)',
                      backdropFilter: 'blur(10px)'
                    }}
                  >
                    <p className="text-xs text-white/60 mb-1 font-bold">Transaction Hash</p>
                    <p className="text-xs font-mono text-white/80 break-all">
                      {tx.transaction_hash}
                    </p>
                  </div>
                )}

                {/* Notes for airdrop */}
                {tx.notes && (
                  <div 
                    className="mt-3 p-3 rounded-xl"
                    style={{
                      background: 'rgba(255,215,0,0.1)',
                      border: '1px solid rgba(255,215,0,0.3)'
                    }}
                  >
                    <p className="text-xs text-yellow-300 font-bold">
                      ✨ {tx.notes}
                    </p>
                  </div>
                )}
              </div>

              {/* Sparkle effects for airdrops */}
              {tx.type === 'airdrop' && (
                <>
                  {[...Array(8)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-1 h-1 rounded-full bg-yellow-400"
                      style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                      }}
                      animate={{
                        opacity: [0, 1, 0],
                        scale: [0, 2, 0]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.3
                      }}
                    />
                  ))}
                </>
              )}
            </Card>
          </motion.div>
        ))}
      </div>
    </ScrollArea>
  );
};