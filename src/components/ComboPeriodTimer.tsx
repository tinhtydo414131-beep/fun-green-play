import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Clock, Trophy, Gift } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface PeriodData {
  period_type: string;
  period_end: string;
  top_combo: number;
  top_user_id: string | null;
}

interface Winner {
  user_id: string;
  highest_combo: number;
  prize_amount: number;
  claimed: boolean;
  profiles: {
    username: string;
    avatar_url: string | null;
  };
}

export const ComboPeriodTimer = () => {
  const [dailyEnd, setDailyEnd] = useState<Date | null>(null);
  const [weeklyEnd, setWeeklyEnd] = useState<Date | null>(null);
  const [dailyWinner, setDailyWinner] = useState<Winner | null>(null);
  const [weeklyWinner, setWeeklyWinner] = useState<Winner | null>(null);
  const [timeLeft, setTimeLeft] = useState({ daily: "", weekly: "" });

  useEffect(() => {
    fetchPeriodData();
    const interval = setInterval(updateCountdowns, 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchPeriodData = async () => {
    try {
      // Fetch active periods
      const { data: periods } = await supabase
        .from("combo_active_periods")
        .select("*")
        .eq("is_active", true);

      if (periods) {
        const daily = periods.find((p) => p.period_type === "daily");
        const weekly = periods.find((p) => p.period_type === "weekly");
        
        if (daily) setDailyEnd(new Date(daily.period_end));
        if (weekly) setWeeklyEnd(new Date(weekly.period_end));
      }

      // Fetch latest winners
      const { data: winners } = await supabase
        .from("combo_period_winners")
        .select(`
          *,
          profiles:user_id (username, avatar_url)
        `)
        .order("created_at", { ascending: false })
        .limit(2);

      if (winners) {
        const dailyWin = winners.find((w) => w.period_type === "daily");
        const weeklyWin = winners.find((w) => w.period_type === "weekly");
        
        if (dailyWin) setDailyWinner(dailyWin as any);
        if (weeklyWin) setWeeklyWinner(weeklyWin as any);
      }
    } catch (error) {
      console.error("Error fetching period data:", error);
    }
  };

  const updateCountdowns = () => {
    const now = new Date();
    
    const calculateTimeLeft = (endDate: Date | null) => {
      if (!endDate) return "Đang tải...";
      
      const diff = endDate.getTime() - now.getTime();
      if (diff <= 0) return "Đã kết thúc";
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      return `${hours}h ${minutes}m ${seconds}s`;
    };

    setTimeLeft({
      daily: calculateTimeLeft(dailyEnd),
      weekly: calculateTimeLeft(weeklyEnd),
    });
  };

  const PeriodCard = ({ 
    title, 
    timeRemaining, 
    winner, 
    prizeAmount 
  }: { 
    title: string; 
    timeRemaining: string; 
    winner: Winner | null; 
    prizeAmount: number;
  }) => (
    <Card className="p-4 bg-gradient-to-br from-primary/5 to-secondary/5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          <span className="font-bold text-lg">{title}</span>
        </div>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Gift className="w-4 h-4" />
          {prizeAmount} tokens
        </div>
      </div>
      
      <div className="text-2xl font-bold text-primary mb-3">
        {timeRemaining}
      </div>
      
      {winner && (
        <div className="flex items-center gap-2 pt-3 border-t border-border">
          <Trophy className="w-4 h-4 text-yellow-500" />
          <span className="text-sm text-muted-foreground">
            Winner trước: <span className="font-bold text-foreground">{winner.profiles.username}</span> - {winner.highest_combo}x combo
          </span>
        </div>
      )}
    </Card>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <PeriodCard
        title="Daily Reset"
        timeRemaining={timeLeft.daily}
        winner={dailyWinner}
        prizeAmount={100}
      />
      <PeriodCard
        title="Weekly Reset"
        timeRemaining={timeLeft.weekly}
        winner={weeklyWinner}
        prizeAmount={500}
      />
    </div>
  );
};
