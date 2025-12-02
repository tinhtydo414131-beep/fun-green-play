import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Clock, ArrowUpRight, ArrowDownLeft, Copy, ExternalLink, Check, Users, Zap } from "lucide-react";
import { formatDistanceToNow, format, isToday, isYesterday } from "date-fns";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface OnChainTransaction {
  id: string;
  transaction_hash: string;
  amount: number;
  token_type: string;
  status: 'completed' | 'pending' | 'failed';
  created_at: string;
  transaction_type: 'transfer' | 'airdrop';
  notes?: string;
  recipients_count?: number;
  gas_fee?: number;
  from_user_id?: string;
  to_user_id?: string;
}

interface OnChainTransactionHistoryProps {
  transactions: OnChainTransaction[];
  currentUserId?: string;
}

export const OnChainTransactionHistory = ({ transactions, currentUserId }: OnChainTransactionHistoryProps) => {
  const [displayCount, setDisplayCount] = useState(10);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  // Calculate transaction stats
  const receivedTxs = transactions.filter(tx => currentUserId && tx.to_user_id === currentUserId);
  const sentTxs = transactions.filter(tx => currentUserId && tx.from_user_id === currentUserId);
  const airdropTxs = transactions.filter(tx => tx.transaction_type === 'airdrop');

  // Format time intelligently
  const formatTime = (date: Date) => {
    if (isToday(date)) {
      return `Today at ${format(date, 'HH:mm')}`;
    } else if (isYesterday(date)) {
      return `Yesterday at ${format(date, 'HH:mm')}`;
    } else {
      const timeAgo = formatDistanceToNow(date, { addSuffix: true });
      if (timeAgo.includes('hour') || timeAgo.includes('minute')) {
        return timeAgo;
      }
      return format(date, 'MMM dd, yyyy');
    }
  };

  // Copy hash to clipboard
  const copyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    toast.success("Transaction hash copied!");
    setTimeout(() => setCopiedHash(null), 2000);
  };

  // Load more transactions
  const loadMore = () => {
    setDisplayCount(prev => Math.min(prev + 10, transactions.length));
  };

  // Infinite scroll handler
  useEffect(() => {
    const handleScroll = (e: any) => {
      const bottom = e.target.scrollHeight - e.target.scrollTop === e.target.clientHeight;
      if (bottom && displayCount < transactions.length) {
        loadMore();
      }
    };

    const scrollArea = document.querySelector('[data-radix-scroll-area-viewport]');
    scrollArea?.addEventListener('scroll', handleScroll);
    return () => scrollArea?.removeEventListener('scroll', handleScroll);
  }, [displayCount, transactions.length]);

  if (transactions.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-16"
      >
        <motion.div
          animate={{ 
            rotate: [0, 10, -10, 10, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className="inline-block mb-6"
        >
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center backdrop-blur-sm border-2 border-purple-500/30">
            <ExternalLink className="w-12 h-12 text-purple-400" />
          </div>
        </motion.div>
        <h3 className="text-white text-xl font-bold mb-2">No on-chain transactions yet</h3>
        <p className="text-white/60 text-sm mb-4">Your blockchain transaction history will appear here</p>
        <div className="max-w-md mx-auto space-y-2 text-left bg-white/5 rounded-lg p-4 mt-4">
          <p className="text-white/70 text-sm">📥 <strong>Received transactions</strong> will automatically appear here when:</p>
          <ul className="text-white/60 text-xs space-y-1 ml-6 list-disc">
            <li>You've connected your wallet at least once</li>
            <li>Someone sends tokens to your wallet address</li>
          </ul>
        </div>
        <p className="text-white/40 text-xs mt-4">Make a transfer or airdrop to see it in action! 🚀</p>
      </motion.div>
    );
  }

  const displayedTransactions = transactions.slice(0, displayCount);

  return (
    <div className="space-y-4">
      {/* Transaction Stats Summary */}
      {transactions.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-green-500/10 rounded-lg p-3 border-2 border-green-600/40 shadow-lg shadow-green-500/20">
            <div className="flex items-center gap-2 mb-1">
              <ArrowDownLeft className="w-4 h-4 text-green-400" />
              <span className="text-black text-xs font-medium">Received</span>
            </div>
            <p className="text-black font-bold text-lg">{receivedTxs.length}</p>
          </div>
          <div className="bg-red-500/10 rounded-lg p-3 border-2 border-red-600/40 shadow-lg shadow-red-500/20">
            <div className="flex items-center gap-2 mb-1">
              <ArrowUpRight className="w-4 h-4 text-red-400" />
              <span className="text-black text-xs font-medium">Sent</span>
            </div>
            <p className="text-black font-bold text-lg">{sentTxs.length}</p>
          </div>
          <div className="bg-orange-500/10 rounded-lg p-3 border-2 border-orange-600/40 shadow-lg shadow-orange-500/20">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-orange-400" />
              <span className="text-black text-xs font-medium">Airdrops</span>
            </div>
            <p className="text-black font-bold text-lg">{airdropTxs.length}</p>
          </div>
        </div>
      )}

      <ScrollArea className="h-[600px] pr-2">
        <div className="space-y-1">
        {displayedTransactions.map((tx, index) => {
          const isSend = currentUserId && tx.from_user_id === currentUserId;
          const isReceive = currentUserId && tx.to_user_id === currentUserId;
          const txDate = new Date(tx.created_at);
          
          return (
            <motion.div
              key={tx.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
            >
              <Card className="border-0 bg-white/[0.03] hover:bg-white/[0.06] transition-colors duration-200">
                <div className="p-4">
                  <div className="flex items-center gap-3">
                    {/* Icon - MetaMask Style */}
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                      tx.transaction_type === 'airdrop' 
                        ? 'bg-orange-500/10'
                        : isReceive
                        ? 'bg-green-500/10'
                        : 'bg-red-500/10'
                    }`}>
                      {tx.transaction_type === 'airdrop' ? (
                        <Users className="w-6 h-6 text-orange-400" />
                      ) : isReceive ? (
                        <ArrowDownLeft className="w-6 h-6 text-green-400" />
                      ) : (
                        <ArrowUpRight className="w-6 h-6 text-red-400" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-lg text-white">
                          {tx.transaction_type === 'airdrop' ? 'Airdrop' : isReceive ? 'Receive' : 'Send'}
                        </h4>
                        <div className={`font-bold text-lg ${
                          isReceive ? 'text-green-400' : 'text-white'
                        }`}>
                          {isReceive ? '+' : '-'}{Number(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 })} {tx.token_type}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-base text-white/80">
                          <span>{formatTime(txDate)}</span>
                          {tx.status === 'completed' ? (
                            <span className="flex items-center gap-1 text-green-400 font-medium">
                              <CheckCircle className="w-4 h-4" />
                              Confirmed
                            </span>
                          ) : tx.status === 'failed' ? (
                            <span className="flex items-center gap-1 text-red-400 font-medium">
                              <XCircle className="w-4 h-4" />
                              Failed
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-yellow-400 font-medium">
                              <Clock className="w-4 h-4" />
                              Pending
                            </span>
                          )}
                        </div>

                        {/* BSCScan Button */}
                        {tx.transaction_hash && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(`https://bscscan.com/tx/${tx.transaction_hash}`, '_blank')}
                            className="h-7 px-2 text-xs gap-1.5 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            BSCScan
                          </Button>
                        )}
                      </div>

                      {/* Gas Fee */}
                      {tx.gas_fee && Number(tx.gas_fee) > 0 && (
                        <div className="mt-2 text-base text-white/70">
                          Gas: {Number(tx.gas_fee).toFixed(6)} BNB
                        </div>
                      )}

                      {/* Notes */}
                      {tx.notes && (
                        <div className="mt-2 text-base text-white/80 italic">
                          {tx.notes}
                        </div>
                      )}

                      {/* Transaction Hash */}
                      {tx.transaction_hash && (
                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-base text-white/70 font-mono truncate flex-1">
                            {tx.transaction_hash.slice(0, 10)}...{tx.transaction_hash.slice(-8)}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyHash(tx.transaction_hash)}
                            className="h-8 w-8 p-0 hover:bg-white/10"
                          >
                            {copiedHash === tx.transaction_hash ? (
                              <Check className="w-4 h-4 text-green-400" />
                            ) : (
                              <Copy className="w-4 h-4 text-white/50" />
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}

        {/* Load More Button */}
        {displayCount < transactions.length && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center pt-3"
          >
            <Button
              onClick={loadMore}
              variant="ghost"
              className="text-white/50 hover:text-white hover:bg-white/5 text-xs"
            >
              Load More ({transactions.length - displayCount} remaining)
            </Button>
          </motion.div>
        )}
      </div>
    </ScrollArea>
    </div>
  );
};
