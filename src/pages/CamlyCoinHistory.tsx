import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Coins, Wallet, Gamepad2, Gift, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import camlyCoin from "@/assets/camly-coin.png";

interface Transaction {
  id: string;
  amount: number;
  transaction_type: string;
  description: string;
  created_at: string;
}

export default function CamlyCoinHistory() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCoins, setTotalCoins] = useState(0);

  useEffect(() => {
    if (user) {
      fetchTransactions();
      fetchTotalCoins();
    }
  }, [user]);

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from("camly_coin_transactions")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTotalCoins = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("wallet_balance")
        .eq("id", user?.id)
        .single();

      if (error) throw error;
      setTotalCoins(data?.wallet_balance || 0);
    } catch (error) {
      console.error("Error fetching balance:", error);
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "wallet_connection":
        return <Wallet className="w-5 h-5 text-accent" />;
      case "game_play":
        return <Gamepad2 className="w-5 h-5 text-secondary" />;
      case "bonus":
        return <Gift className="w-5 h-5 text-primary" />;
      default:
        return <Coins className="w-5 h-5 text-accent" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case "wallet_connection":
        return "bg-accent/10 border-accent/30";
      case "game_play":
        return "bg-secondary/10 border-secondary/30";
      case "bonus":
        return "bg-primary/10 border-primary/30";
      default:
        return "bg-muted/10 border-muted/30";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <Navigation />
      
      <section className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-8 flex items-center justify-between animate-fade-in">
            <Link to="/dashboard">
              <Button 
                variant="outline" 
                className="font-fredoka font-bold border-4 border-accent/30 hover:border-accent hover:bg-accent/10"
              >
                <ArrowLeft className="mr-2 h-5 w-5" />
                Back
              </Button>
            </Link>
          </div>

          {/* Balance Card */}
          <Card className="mb-8 border-4 border-accent/30 shadow-xl bg-gradient-to-br from-accent/10 via-secondary/5 to-primary/10 animate-scale-in">
            <CardHeader>
              <CardTitle className="text-4xl font-fredoka flex items-center gap-3">
                <img src={camlyCoin} alt="Camly Coin" className="w-12 h-12" />
                Camly Coins Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <p className="text-6xl font-fredoka font-bold text-accent">
                    {totalCoins.toLocaleString()}
                  </p>
                  <p className="text-lg font-comic text-muted-foreground mt-2">
                    Total Camly Coins Earned
                  </p>
                </div>
                <div className="bg-accent/20 p-6 rounded-full">
                  <TrendingUp className="w-16 h-16 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transaction History */}
          <Card className="border-4 border-accent/30 shadow-xl animate-fade-in">
            <CardHeader>
              <CardTitle className="text-3xl font-fredoka flex items-center gap-3">
                <Coins className="w-8 h-8 text-accent" />
                Transaction History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="font-comic text-muted-foreground">Loading transactions...</p>
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-12 space-y-4">
                  <div className="text-6xl mb-4">💰</div>
                  <p className="text-2xl font-fredoka text-muted-foreground">
                    No transactions yet
                  </p>
                  <p className="font-comic text-muted-foreground">
                    Start playing games or connect your wallet to earn Camly Coins!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className={`p-4 rounded-xl border-2 ${getTransactionColor(transaction.transaction_type)} hover:shadow-lg transition-all`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="bg-background/50 p-3 rounded-full">
                            {getTransactionIcon(transaction.transaction_type)}
                          </div>
                          <div>
                            <p className="font-fredoka font-bold text-foreground text-lg">
                              {transaction.description}
                            </p>
                            <p className="text-sm font-comic text-muted-foreground">
                              {format(new Date(transaction.created_at), "PPp")}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-fredoka font-bold text-accent">
                            +{transaction.amount.toLocaleString()}
                          </p>
                          <p className="text-sm font-comic text-muted-foreground">
                            Coins
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card className="mt-6 border-2 border-muted/30 bg-muted/20">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="text-3xl">💡</div>
                <div className="flex-1">
                  <p className="font-fredoka font-bold text-foreground mb-2">
                    How to earn more Camly Coins?
                  </p>
                  <ul className="space-y-2 font-comic text-muted-foreground">
                    <li>🎮 Play games to earn 10,000 coins per play</li>
                    <li>🔗 Connect your wallet for a one-time 50,000 coins bonus</li>
                    <li>🎁 Complete daily challenges for bonus rewards</li>
                    <li>⭐ Level up in games for extra coin multipliers</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
