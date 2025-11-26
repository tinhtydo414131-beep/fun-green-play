import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowUpRight, ArrowDownLeft, Wallet, Sparkles } from "lucide-react";
import { CelebrationNotification } from "@/components/CelebrationNotification";
import { toast } from "sonner";

export default function FunWallet() {
  const [balance] = useState(1.234);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationAmount, setCelebrationAmount] = useState(0);
  const [sendAmount, setSendAmount] = useState("");
  const [receiveAmount, setReceiveAmount] = useState("");
  const [transactions] = useState([
    { type: "receive", amount: 0.5, token: "BNB", time: "2 mins ago", from: "0x1234...5678" },
    { type: "send", amount: 0.2, token: "BNB", time: "1 hour ago", to: "0xabcd...efgh" },
    { type: "receive", amount: 1.0, token: "BNB", time: "3 hours ago", from: "0x9876...5432" },
  ]);

  const handleReceive = () => {
    const amount = parseFloat(receiveAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    setCelebrationAmount(amount);
    setShowCelebration(true);
    setReceiveAmount("");
  };

  const handleSend = () => {
    const amount = parseFloat(sendAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    toast.success(`Sent ${amount} BNB successfully!`);
    setSendAmount("");
  };

  return (
    <div className="min-h-screen relative overflow-hidden pb-20">
      {/* Animated space background */}
      <div className="fixed inset-0 -z-10" style={{
        background: 'radial-gradient(ellipse at top, rgba(138,43,226,0.4) 0%, rgba(25,0,51,1) 50%, rgba(0,0,0,1) 100%)',
      }}>
        {/* Floating planets */}
        <motion.div
          animate={{
            y: [0, -30, 0],
            rotate: [0, 360]
          }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute top-20 left-10 w-32 h-32 rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle at 30% 30%, #FFD700, #FF1493)',
            filter: 'blur(2px)'
          }}
        />
        <motion.div
          animate={{
            y: [0, 40, 0],
            rotate: [360, 0]
          }}
          transition={{ duration: 25, repeat: Infinity }}
          className="absolute top-40 right-20 w-40 h-40 rounded-full opacity-15"
          style={{
            background: 'radial-gradient(circle at 30% 30%, #00FFFF, #8A2BE2)',
            filter: 'blur(3px)'
          }}
        />
        <motion.div
          animate={{
            y: [0, -20, 0],
            x: [0, 30, 0],
            rotate: [0, 180, 360]
          }}
          transition={{ duration: 30, repeat: Infinity }}
          className="absolute bottom-32 left-1/3 w-24 h-24 rounded-full opacity-25"
          style={{
            background: 'radial-gradient(circle at 30% 30%, #FFA500, #FF69B4)',
            filter: 'blur(2px)'
          }}
        />

        {/* Twinkling stars */}
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1.5, 0]
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 2
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Balance display */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Wallet className="w-12 h-12 text-yellow-400" />
            <h1 className="text-5xl font-black bg-gradient-to-r from-yellow-400 via-pink-500 to-cyan-400 bg-clip-text text-transparent">
              FUN WALLET
            </h1>
            <Sparkles className="w-12 h-12 text-cyan-400 animate-pulse" />
          </div>
          
          <motion.div
            animate={{
              scale: [1, 1.05, 1]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-8xl font-black mb-2"
            style={{
              background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FFD700 100%)',
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter: 'drop-shadow(0 0 30px rgba(255,215,0,0.6))',
              animation: 'gradient-x 3s linear infinite'
            }}
          >
            {balance.toFixed(3)}
          </motion.div>
          <p className="text-3xl font-bold text-yellow-400">BNB</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Send Card */}
          <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="relative overflow-hidden border-0" style={{
              background: 'rgba(255,255,255,0.05)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 8px 32px 0 rgba(255,20,147,0.2), inset 0 0 0 2px rgba(255,20,147,0.3)'
            }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <ArrowUpRight className="w-6 h-6 text-pink-500" />
                  <span className="bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent font-black">
                    Send FUN
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  type="number"
                  placeholder="Amount"
                  value={sendAmount}
                  onChange={(e) => setSendAmount(e.target.value)}
                  className="bg-black/40 border-pink-500/50 text-white text-lg h-12"
                />
                <Button
                  onClick={handleSend}
                  className="w-full h-12 text-lg font-black relative overflow-hidden group"
                  style={{
                    background: 'linear-gradient(135deg, #FF1493 0%, #8A2BE2 100%)',
                  }}
                >
                  <span className="relative z-10">SEND NOW</span>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600"
                    initial={{ x: '-100%' }}
                    whileHover={{ x: '100%' }}
                    transition={{ duration: 0.5 }}
                  />
                </Button>
              </CardContent>
              
              {/* Animated border effect */}
              <motion.div
                className="absolute inset-0 pointer-events-none"
                animate={{
                  background: [
                    'linear-gradient(0deg, transparent 50%, rgba(255,20,147,0.3) 50%)',
                    'linear-gradient(360deg, transparent 50%, rgba(255,20,147,0.3) 50%)'
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{ backgroundSize: '200% 200%' }}
              />
            </Card>
          </motion.div>

          {/* Receive Card */}
          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="relative overflow-hidden border-0" style={{
              background: 'rgba(255,255,255,0.05)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 8px 32px 0 rgba(0,255,255,0.2), inset 0 0 0 2px rgba(0,255,255,0.3)'
            }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <ArrowDownLeft className="w-6 h-6 text-cyan-400" />
                  <span className="bg-gradient-to-r from-cyan-400 to-green-400 bg-clip-text text-transparent font-black">
                    Receive
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  type="number"
                  placeholder="Amount"
                  value={receiveAmount}
                  onChange={(e) => setReceiveAmount(e.target.value)}
                  className="bg-black/40 border-cyan-400/50 text-white text-lg h-12"
                />
                <Button
                  onClick={handleReceive}
                  className="w-full h-12 text-lg font-black relative overflow-hidden group"
                  style={{
                    background: 'linear-gradient(135deg, #00FFFF 0%, #00FF00 100%)',
                  }}
                >
                  <span className="relative z-10 text-black">RECEIVE NOW</span>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-green-400 to-cyan-400"
                    initial={{ x: '-100%' }}
                    whileHover={{ x: '100%' }}
                    transition={{ duration: 0.5 }}
                  />
                </Button>
              </CardContent>

              {/* Animated border effect */}
              <motion.div
                className="absolute inset-0 pointer-events-none"
                animate={{
                  background: [
                    'linear-gradient(0deg, transparent 50%, rgba(0,255,255,0.3) 50%)',
                    'linear-gradient(360deg, transparent 50%, rgba(0,255,255,0.3) 50%)'
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                style={{ backgroundSize: '200% 200%' }}
              />
            </Card>
          </motion.div>
        </div>

        {/* Transaction History */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-0" style={{
            background: 'rgba(255,255,255,0.05)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 8px 32px 0 rgba(255,215,0,0.2), inset 0 0 0 2px rgba(255,215,0,0.3)'
          }}>
            <CardHeader>
              <CardTitle className="text-3xl font-black bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                Transaction History
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {transactions.map((tx, i) => (
                <motion.div
                  key={i}
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="flex items-center justify-between p-4 rounded-xl relative overflow-hidden group cursor-pointer"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,215,0,0.2)'
                  }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      tx.type === 'receive' ? 'bg-green-500/20' : 'bg-pink-500/20'
                    }`}>
                      {tx.type === 'receive' ? (
                        <ArrowDownLeft className="w-6 h-6 text-green-400" />
                      ) : (
                        <ArrowUpRight className="w-6 h-6 text-pink-400" />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-white text-lg">
                        {tx.type === 'receive' ? 'Received' : 'Sent'}
                      </p>
                      <p className="text-sm text-gray-400">
                        {tx.type === 'receive' ? `From ${tx.from}` : `To ${tx.to}`}
                      </p>
                      <p className="text-xs text-gray-500">{tx.time}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-2xl font-black ${
                      tx.type === 'receive' ? 'text-green-400' : 'text-pink-400'
                    }`}>
                      {tx.type === 'receive' ? '+' : '-'}{tx.amount}
                    </p>
                    <p className="text-sm text-yellow-400 font-bold">{tx.token}</p>
                  </div>

                  {/* Sparkle effect on hover */}
                  <motion.div
                    className="absolute inset-0 pointer-events-none"
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                  >
                    {[...Array(5)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                        style={{
                          left: `${Math.random() * 100}%`,
                          top: `${Math.random() * 100}%`,
                        }}
                        animate={{
                          scale: [0, 1, 0],
                          opacity: [0, 1, 0]
                        }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          delay: i * 0.2
                        }}
                      />
                    ))}
                  </motion.div>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Celebration notification */}
      {showCelebration && (
        <CelebrationNotification
          amount={celebrationAmount}
          token="BNB"
          onComplete={() => setShowCelebration(false)}
        />
      )}

      <style>{`
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
    </div>
  );
}
