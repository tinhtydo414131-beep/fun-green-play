import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Clock, Trophy, Target, Zap, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Challenge {
  id: string;
  challenge_id: string;
  challenge_date: string;
  expires_at: string;
  combo_challenges: {
    title: string;
    description: string;
    challenge_type: string;
    target_combo: number;
    time_limit_seconds: number | null;
    prize_amount: number;
    difficulty: string;
    icon: string;
  };
}

interface UserProgress {
  highest_combo: number;
  completed_at: string | null;
  prize_claimed: boolean;
  time_taken_seconds: number | null;
  missed_count: number;
}

export const DailyChallengeCard = () => {
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [timeLeft, setTimeLeft] = useState("");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchChallenge();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchChallenge = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Fetch today's challenge
      const { data: challengeData, error: challengeError } = await supabase
        .from("daily_combo_challenges")
        .select(`
          *,
          combo_challenges (*)
        `)
        .eq("is_active", true)
        .eq("challenge_date", new Date().toISOString().split('T')[0])
        .single();

      if (challengeError) throw challengeError;
      setChallenge(challengeData as any);

      // Fetch user progress if logged in
      if (user && challengeData) {
        const { data: progressData } = await supabase
          .from("user_challenge_progress")
          .select("*")
          .eq("user_id", user.id)
          .eq("daily_challenge_id", challengeData.id)
          .maybeSingle();

        setProgress(progressData);
      }
    } catch (error) {
      console.error("Error fetching challenge:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateCountdown = () => {
    if (!challenge) return;
    
    const now = new Date();
    const expires = new Date(challenge.expires_at);
    const diff = expires.getTime() - now.getTime();
    
    if (diff <= 0) {
      setTimeLeft("Đã hết hạn");
      return;
    }
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
  };

  const claimPrize = async () => {
    if (!progress || !challenge) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Update prize claimed status
      const { error: updateError } = await supabase
        .from("user_challenge_progress")
        .update({ prize_claimed: true })
        .eq("user_id", user.id)
        .eq("daily_challenge_id", challenge.id);

      if (updateError) throw updateError;

      // Update user wallet
      const { data: profile } = await supabase
        .from("profiles")
        .select("wallet_balance")
        .eq("id", user.id)
        .single();

      if (profile) {
        await supabase
          .from("profiles")
          .update({ 
            wallet_balance: (profile.wallet_balance || 0) + challenge.combo_challenges.prize_amount 
          })
          .eq("id", user.id);
      }

      toast({
        title: "🎉 Đã nhận thưởng!",
        description: `Bạn đã nhận ${challenge.combo_challenges.prize_amount} tokens!`,
      });

      setProgress({ ...progress, prize_claimed: true });
    } catch (error) {
      console.error("Error claiming prize:", error);
      toast({
        title: "Lỗi",
        description: "Không thể nhận thưởng. Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'hard': return 'bg-orange-500';
      case 'extreme': return 'bg-red-500';
      default: return 'bg-blue-500';
    }
  };

  if (loading) {
    return (
      <Card className="p-6 animate-pulse">
        <div className="h-32 bg-muted rounded" />
      </Card>
    );
  }

  if (!challenge) {
    return (
      <Card className="p-6">
        <p className="text-center text-muted-foreground">Không có thử thách nào hôm nay</p>
      </Card>
    );
  }

  const isCompleted = progress !== null && progress.completed_at !== null;
  const progressPercent = progress ? Math.min((progress.highest_combo / challenge.combo_challenges.target_combo) * 100, 100) : 0;

  return (
    <Card className="p-6 bg-gradient-to-br from-primary/5 to-secondary/5 border-2">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="text-4xl">{challenge.combo_challenges.icon}</div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-xl">{challenge.combo_challenges.title}</h3>
                <Badge className={getDifficultyColor(challenge.combo_challenges.difficulty)}>
                  {challenge.combo_challenges.difficulty}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {challenge.combo_challenges.description}
              </p>
            </div>
          </div>
        </div>

        {/* Challenge Details */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 p-3 bg-background/50 rounded-lg">
            <Target className="w-5 h-5 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Target</p>
              <p className="font-bold">{challenge.combo_challenges.target_combo}x combo</p>
            </div>
          </div>
          
          {challenge.combo_challenges.time_limit_seconds && (
            <div className="flex items-center gap-2 p-3 bg-background/50 rounded-lg">
              <Zap className="w-5 h-5 text-yellow-500" />
              <div>
                <p className="text-xs text-muted-foreground">Time Limit</p>
                <p className="font-bold">{Math.floor(challenge.combo_challenges.time_limit_seconds / 60)} phút</p>
              </div>
            </div>
          )}
          
          <div className="flex items-center gap-2 p-3 bg-background/50 rounded-lg">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <div>
              <p className="text-xs text-muted-foreground">Reward</p>
              <p className="font-bold">{challenge.combo_challenges.prize_amount} tokens</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 p-3 bg-background/50 rounded-lg">
            <Clock className="w-5 h-5 text-orange-500" />
            <div>
              <p className="text-xs text-muted-foreground">Còn lại</p>
              <p className="font-bold text-sm">{timeLeft}</p>
            </div>
          </div>
        </div>

        {/* Progress */}
        {progress && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tiến độ</span>
              <span className="font-bold">
                {progress.highest_combo} / {challenge.combo_challenges.target_combo}
              </span>
            </div>
            <Progress value={progressPercent} className="h-2" />
            
            {challenge.combo_challenges.challenge_type === 'no_miss' && (
              <p className="text-xs text-muted-foreground">
                Bỏ lỡ: {progress.missed_count} lần
              </p>
            )}
          </div>
        )}

        {/* Completion Status */}
        {isCompleted && (
          <div className="flex items-center justify-between p-4 bg-green-500/10 border-2 border-green-500/50 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <div>
                <p className="font-bold text-green-700">Hoàn thành!</p>
                {progress && progress.time_taken_seconds && (
                  <p className="text-xs text-muted-foreground">
                    Thời gian: {Math.floor(progress.time_taken_seconds / 60)}:{(progress.time_taken_seconds % 60).toString().padStart(2, '0')}
                  </p>
                )}
              </div>
            </div>
            
            {progress && !progress.prize_claimed && (
              <Button onClick={claimPrize} size="sm">
                <Trophy className="w-4 h-4 mr-2" />
                Nhận thưởng
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};
