import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Brain, RefreshCw, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from 'react-i18next';

interface SuggestedGame {
  id: string;
  title: string;
  thumbnail_url: string | null;
  genre: string;
  reason: string;
}

export const GameAISuggestions = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const isVN = i18n.language === 'vi';
  
  const [suggestions, setSuggestions] = useState<SuggestedGame[]>([]);
  const [loading, setLoading] = useState(false);
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    if (user) {
      generateSuggestions();
      generateGreeting();
    }
  }, [user]);

  const generateGreeting = () => {
    const hour = new Date().getHours();
    let timeGreeting = '';
    
    if (hour < 12) {
      timeGreeting = isVN ? 'Chào buổi sáng' : 'Good morning';
    } else if (hour < 18) {
      timeGreeting = isVN ? 'Chào buổi chiều' : 'Good afternoon';
    } else {
      timeGreeting = isVN ? 'Chào buổi tối' : 'Good evening';
    }
    
    setGreeting(timeGreeting);
  };

  const generateSuggestions = async () => {
    setLoading(true);
    try {
      // Fetch user's play history
      const { data: playHistory } = await supabase
        .from('game_plays')
        .select('game_id')
        .eq('user_id', user?.id)
        .order('played_at', { ascending: false })
        .limit(10);

      const playedGameIds = playHistory?.map(p => p.game_id) || [];

      // Fetch all games
      const { data: allGames } = await supabase
        .from('games')
        .select('*')
        .eq('is_active', true)
        .order('total_plays', { ascending: false });

      if (!allGames) return;

      // AI-like logic: suggest games based on patterns
      const recentGenres = new Set<string>();
      if (playedGameIds.length > 0) {
        const { data: playedGames } = await supabase
          .from('games')
          .select('genre')
          .in('id', playedGameIds);
        
        playedGames?.forEach(g => recentGenres.add(g.genre));
      }

      // Generate 3 diverse suggestions
      const suggestedGames: SuggestedGame[] = [];
      const reasons = {
        similar: isVN ? 'Dựa trên game bạn thích' : 'Based on your favorites',
        popular: isVN ? 'Đang hot trong cộng đồng' : 'Trending in community',
        new: isVN ? 'Game mới cho bạn thử' : 'New game for you to try',
        brain: isVN ? 'Rèn luyện trí não' : 'Brain training'
      };

      // 1. Similar genre game
      const similarGame = allGames.find(g => 
        recentGenres.has(g.genre) && !playedGameIds.includes(g.id)
      );
      if (similarGame) {
        suggestedGames.push({ ...similarGame, reason: reasons.similar });
      }

      // 2. Popular game they haven't played
      const popularGame = allGames.find(g => 
        !playedGameIds.includes(g.id) && !suggestedGames.find(s => s.id === g.id)
      );
      if (popularGame) {
        suggestedGames.push({ ...popularGame, reason: reasons.popular });
      }

      // 3. Educational/brain game
      const brainGame = allGames.find(g => 
        (g.genre === 'brain' || g.genre === 'educational') && 
        !playedGameIds.includes(g.id) && 
        !suggestedGames.find(s => s.id === g.id)
      );
      if (brainGame) {
        suggestedGames.push({ ...brainGame, reason: reasons.brain });
      }

      // Fill remaining slots with random unplayed games
      while (suggestedGames.length < 3) {
        const randomGame = allGames.find(g => 
          !playedGameIds.includes(g.id) && !suggestedGames.find(s => s.id === g.id)
        );
        if (randomGame) {
          suggestedGames.push({ ...randomGame, reason: reasons.new });
        } else {
          break;
        }
      }

      setSuggestions(suggestedGames);
    } catch (error) {
      console.error('Error generating suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5 overflow-hidden">
      <CardContent className="p-4">
        {/* Header with greeting */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Sparkles className="w-5 h-5 text-primary" />
            </motion.div>
            <div>
              <p className="font-bold text-sm">{greeting}! 👋</p>
              <p className="text-xs text-muted-foreground">
                {isVN ? 'Game Angel AI gợi ý cho bạn' : 'Angel AI suggests for you'}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={generateSuggestions}
            disabled={loading}
            className="h-8 w-8"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {/* Suggestions */}
        <div className="space-y-2">
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <Brain className="w-6 h-6 text-primary animate-pulse" />
              <span className="ml-2 text-sm text-muted-foreground">
                {isVN ? 'AI đang suy nghĩ...' : 'AI is thinking...'}
              </span>
            </div>
          ) : suggestions.length > 0 ? (
            suggestions.map((game, index) => (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Button
                  variant="ghost"
                  onClick={() => navigate(`/game/${game.id}`)}
                  className="w-full justify-between h-auto py-2 px-3 hover:bg-primary/10"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-lg overflow-hidden">
                      {game.thumbnail_url ? (
                        <img 
                          src={game.thumbnail_url} 
                          alt={game.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        '🎮'
                      )}
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-sm">{game.title}</p>
                      <p className="text-xs text-muted-foreground">{game.reason}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </Button>
              </motion.div>
            ))
          ) : (
            <p className="text-center text-sm text-muted-foreground py-4">
              {isVN ? 'Chơi thêm game để AI gợi ý tốt hơn!' : 'Play more games for better AI suggestions!'}
            </p>
          )}
        </div>

        {/* Footer */}
        <Button
          variant="link"
          onClick={() => navigate('/games')}
          className="w-full mt-3 text-primary"
        >
          {isVN ? 'Xem tất cả game →' : 'See all games →'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default GameAISuggestions;
