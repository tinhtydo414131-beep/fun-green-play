import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useLocation } from 'react-router-dom';

interface TipConfig {
  message: string;
  emoji: string;
  route?: string;
  priority?: number;
}

export const useJoyBotTips = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [personalizedTips, setPersonalizedTips] = useState<TipConfig[]>([]);

  useEffect(() => {
    if (!user) return;

    const loadPersonalizedTips = async () => {
      try {
        // Fetch user profile data
        const { data: profile } = await supabase
          .from('profiles')
          .select('wallet_balance, total_plays, total_friends')
          .eq('id', user.id)
          .single();

        const tips: TipConfig[] = [];

        // Contextual tips based on user stats
        if (profile) {
          if (profile.wallet_balance === 0) {
            tips.push({
              message: "Bắt đầu chơi game để kiếm CAMLY đầu tiên của bạn! 🎮",
              emoji: "🎮",
              priority: 10
            });
          }

          if (profile.total_plays < 5) {
            tips.push({
              message: "Thử nhiều game khác nhau để tìm game yêu thích nhất! 🎯",
              emoji: "🎯",
              route: "/games",
              priority: 8
            });
          }

          if (profile.total_friends === 0) {
            tips.push({
              message: "Kết bạn để cùng nhau chinh phục bảng xếp hạng! 👥",
              emoji: "👥",
              route: "/friends",
              priority: 7
            });
          }

          if (profile.wallet_balance > 100000) {
            tips.push({
              message: "Bạn đã kiếm được nhiều CAMLY! Hãy chia sẻ với bạn bè nhé! 💰",
              emoji: "💰",
              route: "/friends",
              priority: 6
            });
          }
        }

        // Route-specific tips
        if (location.pathname === '/games') {
          tips.push({
            message: "Mỗi game có độ khó và phần thưởng khác nhau. Chọn game phù hợp với bạn! 🎮",
            emoji: "🎮",
            priority: 5
          });
        }

        if (location.pathname === '/public-music') {
          tips.push({
            message: "Nhạc 432Hz giúp thư giãn và tập trung tốt hơn khi chơi game! 🎵",
            emoji: "🎵",
            priority: 5
          });
        }

        if (location.pathname === '/dashboard') {
          tips.push({
            message: "Kiểm tra thành tích và đặt mục tiêu mới mỗi ngày! 📊",
            emoji: "📊",
            priority: 5
          });
        }

        // Sort by priority
        tips.sort((a, b) => (b.priority || 0) - (a.priority || 0));
        setPersonalizedTips(tips);
      } catch (error) {
        console.error('Error loading personalized tips:', error);
      }
    };

    loadPersonalizedTips();
  }, [user, location.pathname]);

  return { personalizedTips };
};
