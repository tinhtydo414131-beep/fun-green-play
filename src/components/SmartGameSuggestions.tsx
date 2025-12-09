import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { games, Game } from "@/data/games";
import { Sparkles, Gamepad2, RefreshCw, Brain, Rocket, Star, Zap, ChevronRight, Heart, Smile, Meh, PartyPopper } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

interface PlayHistory {
  game_id: string;
  play_count: number;
  duration_seconds: number;
}

interface MoodAnalysis {
  mood: 'happy' | 'calm' | 'energetic' | 'neutral';
  score: number;
  reason: string;
}

const GENRE_ICONS: Record<string, React.ElementType> = { puzzle: Brain, brain: Brain, adventure: Rocket, casual: Star, educational: Zap };
const GENRE_COLORS: Record<string, string> = { puzzle: "from-blue-500 to-cyan-500", brain: "from-purple-500 to-indigo-500", adventure: "from-orange-500 to-red-500", casual: "from-green-500 to-emerald-500", educational: "from-pink-500 to-rose-500" };
const MOOD_ICONS: Record<string, React.ElementType> = { happy: PartyPopper, calm: Meh, energetic: Zap, neutral: Smile };
const MOOD_COLORS: Record<string, string> = { happy: "text-yellow-500", calm: "text-blue-500", energetic: "text-orange-500", neutral: "text-gray-500" };

function detectMood(playHistory: PlayHistory[]): MoodAnalysis {
  if (playHistory.length === 0) return { mood: 'neutral', score: 0.5, reason: 'Chưa có dữ liệu chơi' };
  const totalPlays = playHistory.reduce((sum, p) => sum + p.play_count, 0);
  const avgDuration = playHistory.reduce((sum, p) => sum + p.duration_seconds, 0) / playHistory.length;
  if (totalPlays > 5 && avgDuration > 300) return { mood: 'energetic', score: 0.85, reason: 'Bạn đang chơi hăng hái!' };
  if (avgDuration > 600) return { mood: 'calm', score: 0.7, reason: 'Bạn thích chơi tập trung' };
  if (totalPlays > 3) return { mood: 'happy', score: 0.75, reason: 'Bạn đang vui vẻ khám phá!' };
  return { mood: 'neutral', score: 0.5, reason: 'Tiếp tục khám phá nhé!' };
}

function getSuggestions(allGames: Game[], playHistory: PlayHistory[], mood: MoodAnalysis): Game[] {
  const playedIds = new Set(playHistory.map(p => p.game_id));
  let unplayed = allGames.filter(g => !playedIds.has(g.id) && g.playable);
  
  // Mood-based filtering with category matching
  if (mood.mood === 'energetic') unplayed = unplayed.filter(g => g.category === 'adventure' || g.difficulty !== 'easy');
  else if (mood.mood === 'calm') unplayed = unplayed.filter(g => g.category === 'brain' || g.difficulty === 'easy');
  
  if (unplayed.length < 3) unplayed = allGames.filter(g => !playedIds.has(g.id) && g.playable);
  
  const shuffled = [...unplayed].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3);
}

interface SmartGameSuggestionsProps {
  variant?: "compact" | "full";
}

export function SmartGameSuggestions({ variant = "full" }: SmartGameSuggestionsProps) {
  const { user } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);
  
  const { data: playHistory, isLoading } = useQuery({
    queryKey: ['play-history', user?.id, refreshKey],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase.from('game_sessions').select('game_id, duration_seconds').eq('user_id', user.id).limit(50);
      const counts: Record<string, PlayHistory> = {};
      (data || []).forEach(s => {
        if (!counts[s.game_id]) counts[s.game_id] = { game_id: s.game_id, play_count: 0, duration_seconds: 0 };
        counts[s.game_id].play_count++;
        counts[s.game_id].duration_seconds += s.duration_seconds || 0;
      });
      return Object.values(counts);
    },
    enabled: !!user,
    staleTime: 60000,
  });
  
  const mood = useMemo(() => detectMood(playHistory || []), [playHistory]);
  const suggestions = useMemo(() => getSuggestions(games, playHistory || [], mood), [playHistory, mood, refreshKey]);
  
  const MoodIcon = MOOD_ICONS[mood.mood];
  
  if (!user) {
    return (
      <Card className="border-2 border-primary/30 bg-gradient-to-br from-card to-primary/5">
        <CardContent className="p-6 text-center">
          <Heart className="w-10 h-10 mx-auto mb-3 text-primary/50" />
          <p className="text-muted-foreground">Đăng nhập để nhận gợi ý!</p>
          <Link to="/auth"><Button size="sm" className="mt-3">Đăng nhập</Button></Link>
        </CardContent>
      </Card>
    );
  }
  
  if (variant === "compact") {
    return (
      <Card className="border-2 border-purple-500/30 bg-gradient-to-br from-card to-purple-500/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />Gợi ý cho bạn
            <MoodIcon className={`w-4 h-4 ml-auto ${MOOD_COLORS[mood.mood]}`} />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? <><Skeleton className="h-12 w-full" /><Skeleton className="h-12 w-full" /></> : (
            <AnimatePresence mode="popLayout">
              {suggestions.map((game, i) => {
                const Icon = GENRE_ICONS[game.category] || Gamepad2;
                const gradient = GENRE_COLORS[game.category] || "from-gray-500 to-gray-600";
                return (
                  <motion.div key={game.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}>
                    <Link to={`/games/${game.id}`}>
                      <div className="p-2 rounded-lg border border-muted/50 hover:border-primary/50 bg-muted/20 hover:bg-primary/5 transition-all flex items-center gap-2 group cursor-pointer">
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center shrink-0`}><Icon className="w-4 h-4 text-white" /></div>
                        <p className="font-semibold text-sm truncate flex-1">{game.title}</p>
                        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary shrink-0" />
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
          <Button variant="ghost" size="sm" onClick={() => setRefreshKey(k => k + 1)} className="w-full mt-2 text-xs"><RefreshCw className="w-3 h-3 mr-1" />Gợi ý khác</Button>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="border-2 border-purple-500/30 bg-gradient-to-br from-card via-purple-500/5 to-pink-500/5">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Sparkles className="w-6 h-6 text-purple-500" />Gợi ý game cho bạn
          <Badge className="ml-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs">Mood AI</Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground">Dựa trên cảm xúc và lịch sử chơi</p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="p-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-500/20">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full bg-white/50 ${MOOD_COLORS[mood.mood]}`}><MoodIcon className="w-5 h-5" /></div>
            <div className="flex-1">
              <p className="font-semibold text-sm">Mood: {mood.mood.charAt(0).toUpperCase() + mood.mood.slice(1)}</p>
              <p className="text-xs text-muted-foreground">{mood.reason}</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-purple-500">{Math.round(mood.score * 100)}%</p>
              <p className="text-xs text-muted-foreground">Confidence</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="p-2 bg-muted/30 rounded-lg text-center"><p className="text-lg font-bold text-primary">{playHistory?.length || 0}</p><p className="text-xs text-muted-foreground">Game đã chơi</p></div>
          <div className="p-2 bg-muted/30 rounded-lg text-center"><p className="text-lg font-bold text-purple-500">{suggestions.length}</p><p className="text-xs text-muted-foreground">Gợi ý mới</p></div>
          <div className="p-2 bg-muted/30 rounded-lg text-center"><p className="text-lg font-bold text-pink-500">{games.length}</p><p className="text-xs text-muted-foreground">Tổng game</p></div>
        </div>

        {isLoading ? <><Skeleton className="h-20 w-full" /><Skeleton className="h-20 w-full" /></> : (
          <div className="space-y-2">
            <h4 className="font-semibold text-sm text-muted-foreground">Thử ngay:</h4>
            <AnimatePresence mode="popLayout">
              {suggestions.map((game, i) => {
                const Icon = GENRE_ICONS[game.category] || Gamepad2;
                const gradient = GENRE_COLORS[game.category] || "from-gray-500 to-gray-600";
                return (
                  <motion.div key={game.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                    <Link to={`/games/${game.id}`}>
                      <div className="p-3 rounded-xl border border-muted/50 hover:border-primary/50 bg-muted/20 hover:bg-primary/5 transition-all flex items-center gap-3 group cursor-pointer">
                        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center shrink-0`}><Icon className="w-6 h-6 text-white" /></div>
                        <div className="flex-1 min-w-0">
                          <h5 className="font-bold truncate">{game.title}</h5>
                          <p className="text-sm text-muted-foreground truncate">{game.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs capitalize">{game.category}</Badge>
                            <Badge variant="outline" className="text-xs">{game.difficulty === 'easy' ? 'Dễ' : game.difficulty === 'medium' ? 'TB' : 'Khó'}</Badge>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary shrink-0" />
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        <Button variant="outline" onClick={() => setRefreshKey(k => k + 1)} className="w-full gap-2"><RefreshCw className="w-4 h-4" />Gợi ý game khác</Button>
      </CardContent>
    </Card>
  );
}