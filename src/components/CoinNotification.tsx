import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { Coins, Sparkles } from "lucide-react";
import confetti from "canvas-confetti";
import { useNotificationPreferences } from "@/hooks/useNotificationPreferences";

interface CoinNotification {
  id: string;
  type: "camly_coin" | "wallet";
  amount: number;
  tokenType?: string;
  description?: string;
  timestamp: number;
}

export function CoinNotification() {
  const [notifications, setNotifications] = useState<CoinNotification[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const shownNotificationsRef = useRef<Set<string>>(new Set());
  const { preferences } = useNotificationPreferences();

  useEffect(() => {
    // Initialize audio
    audioRef.current = new Audio("/audio/coin-reward.mp3");
    audioRef.current.volume = 0.5;
    
    // Test audio loading
    audioRef.current.addEventListener('canplaythrough', () => {
      console.log('✅ Coin notification audio loaded successfully');
    });
    audioRef.current.addEventListener('error', (e) => {
      console.error('❌ Failed to load coin notification audio:', e);
    });

    const setupSubscriptions = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('❌ No user found for coin notifications');
        return;
      }

      console.log('🔔 Setting up coin notification subscriptions for user:', user.id);

      // Subscribe to Camly Coin transactions
      const camlyCoinChannel = supabase
        .channel("camly_coin_notifications")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "camly_coin_transactions",
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            console.log('💰 Camly coin transaction received:', payload);
            const transaction = payload.new;
            if (transaction.amount > 0) {
              showNotification({
                id: transaction.id,
                type: "camly_coin",
                amount: transaction.amount,
                description: transaction.description,
                timestamp: Date.now(),
              });
            }
          }
        )
        .subscribe((status) => {
          console.log('📡 Camly coin channel status:', status);
        });

      // Subscribe to wallet transactions (receiving)
      const walletChannel = supabase
        .channel("wallet_notifications")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "wallet_transactions",
            filter: `to_user_id=eq.${user.id}`,
          },
          (payload) => {
            console.log('💸 Wallet transaction received:', payload);
            const transaction = payload.new;
            if (transaction.status === "completed" || transaction.status === "pending") {
              showNotification({
                id: transaction.id,
                type: "wallet",
                amount: transaction.amount,
                tokenType: transaction.token_type,
                description: `🎉 Congratulations! You received ${transaction.amount} ${transaction.token_type}${transaction.notes ? ` - ${transaction.notes}` : ''}`,
                timestamp: Date.now(),
              });
            }
          }
        )
        .subscribe((status) => {
          console.log('📡 Wallet channel status:', status);
        });

      return () => {
        console.log('🔌 Cleaning up coin notification subscriptions');
        supabase.removeChannel(camlyCoinChannel);
        supabase.removeChannel(walletChannel);
      };
    };

    const cleanup = setupSubscriptions();

    return () => {
      cleanup.then((cleanupFn) => cleanupFn?.());
    };
  }, []);

  const showNotification = (notification: CoinNotification) => {
    console.log('🎉 Showing notification:', notification);
    console.log('📋 Preferences:', preferences);
    
    // Check if we've already shown this notification
    if (shownNotificationsRef.current.has(notification.id)) {
      console.log('⚠️ Duplicate notification blocked:', notification.id);
      return;
    }
    
    // Check if notifications are enabled
    if (!preferences.enabled) {
      console.log('❌ Notifications disabled in preferences');
      return;
    }

    // Mark this notification as shown
    shownNotificationsRef.current.add(notification.id);

    // Play sound if enabled
    if (preferences.soundEnabled && audioRef.current) {
      console.log('🔊 Playing notification sound at volume:', preferences.volume);
      audioRef.current.volume = preferences.volume / 100;
      audioRef.current.currentTime = 0;
      audioRef.current.play()
        .then(() => console.log('✅ Audio played successfully'))
        .catch((error) => console.error('❌ Audio play failed:', error));
    }

    // Trigger confetti if enabled
    if (preferences.confettiEnabled) {
      console.log('🎊 Triggering confetti');
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#FFD700", "#FFA500", "#FF6347"],
      });
    }

    // Add notification
    setNotifications((prev) => [...prev, notification]);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
      // Clean up from tracking set after a delay to prevent rapid re-additions
      setTimeout(() => {
        shownNotificationsRef.current.delete(notification.id);
      }, 1000);
    }, 5000);
  };

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2 pointer-events-none">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={preferences.animationsEnabled ? { opacity: 0, x: 100, scale: 0.8 } : { opacity: 1, x: 0, scale: 1 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={preferences.animationsEnabled ? { opacity: 0, x: 100, scale: 0.8 } : { opacity: 0 }}
            className="pointer-events-auto"
          >
            <div className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 rounded-2xl shadow-2xl p-4 min-w-[280px] border-4 border-white">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <motion.div
                    animate={{
                      rotate: [0, 10, -10, 10, 0],
                      scale: [1, 1.2, 1, 1.2, 1],
                    }}
                    transition={{
                      duration: 0.5,
                      repeat: Infinity,
                      repeatDelay: 1,
                    }}
                  >
                    <Coins className="w-10 h-10 text-white drop-shadow-lg" />
                  </motion.div>
                  <motion.div
                    className="absolute -top-1 -right-1"
                    animate={{
                      scale: [1, 1.5, 1],
                      rotate: [0, 180, 360],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                    }}
                  >
                    <Sparkles className="w-4 h-4 text-yellow-200" />
                  </motion.div>
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <motion.p
                      className="text-2xl font-fredoka font-bold text-white drop-shadow-md"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 15 }}
                    >
                      +{notification.amount.toLocaleString()}
                    </motion.p>
                    <span className="text-lg font-bold text-white/90">
                      {notification.type === "camly_coin"
                        ? "Camly Coins"
                        : notification.tokenType || "Tokens"}
                    </span>
                  </div>
                  {notification.description && (
                    <p className="text-sm text-white/80 font-comic mt-1">
                      {notification.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Animated shine effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-2xl"
                initial={{ x: "-100%" }}
                animate={{ x: "200%" }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  repeatDelay: 2,
                }}
              />
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
