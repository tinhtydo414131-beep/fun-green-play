import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Gift, Sparkles, Users, Globe, Rocket, Heart, 
  Trophy, Star, ChevronRight, ArrowRight, CheckCircle2,
  Baby, Clock, Coins, TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AirdropButton } from "@/components/AirdropButton";
import { Navigation } from "@/components/Navigation";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, 
  PieChart, Pie, Cell
} from "recharts";

const TOTAL_AIRDROP = 1_000_000_000; // 1 Billion CAMLY
const AIRDROP_PER_CHILD = 10_000;
const MAX_CHILDREN = TOTAL_AIRDROP / AIRDROP_PER_CHILD; // 100,000 children

interface AirdropRecipient {
  id: string;
  user_id: string;
  amount: number;
  created_at: string;
  profile?: {
    username: string;
    avatar_url: string | null;
  };
}

interface DailyStats {
  date: string;
  claims: number;
  amount: number;
}

const GlobalAirdrop = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const isVN = i18n.language === 'vi';
  
  const [totalClaimed, setTotalClaimed] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [recentRecipients, setRecentRecipients] = useState<AirdropRecipient[]>([]);
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [userClaimed, setUserClaimed] = useState(false);

  useEffect(() => {
    fetchAirdropData();
    if (user) checkUserClaim();
  }, [user]);

  const fetchAirdropData = async () => {
    try {
      // Get total claims
      const { count, data: transactions } = await supabase
        .from('web3_reward_transactions')
        .select('id, user_id, amount, created_at', { count: 'exact' })
        .eq('reward_type', 'global_airdrop')
        .order('created_at', { ascending: false })
        .limit(10);

      setTotalClaimed(count || 0);
      setTotalAmount((count || 0) * AIRDROP_PER_CHILD);

      // Fetch profiles for recipients
      if (transactions && transactions.length > 0) {
        const userIds = transactions.map(tx => tx.user_id);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, username, avatar_url')
          .in('id', userIds);

        const recipientsWithProfiles = transactions.map(tx => ({
          ...tx,
          profile: profiles?.find(p => p.id === tx.user_id)
        }));
        
        setRecentRecipients(recipientsWithProfiles);
      }

      // Generate mock daily stats for chart (last 7 days)
      const mockStats: DailyStats[] = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        mockStats.push({
          date: date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
          claims: Math.floor(Math.random() * 50) + 10,
          amount: Math.floor(Math.random() * 500000) + 100000
        });
      }
      setDailyStats(mockStats);

    } catch (error) {
      console.error('Error fetching airdrop data:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkUserClaim = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('web3_reward_transactions')
      .select('id')
      .eq('user_id', user.id)
      .eq('reward_type', 'global_airdrop')
      .maybeSingle();
    setUserClaimed(!!data);
  };

  const progressPercent = (totalClaimed / MAX_CHILDREN) * 100;
  const remainingSlots = MAX_CHILDREN - totalClaimed;

  const distributionData = [
    { name: isVN ? 'Đã phát' : 'Distributed', value: totalAmount, color: '#4ECDC4' },
    { name: isVN ? 'Còn lại' : 'Remaining', value: TOTAL_AIRDROP - totalAmount, color: '#2D3748' }
  ];

  const milestones = [
    { target: 1000, label: '1K', reward: 'Early Adopter Badge' },
    { target: 10000, label: '10K', reward: 'Community Pioneer NFT' },
    { target: 50000, label: '50K', reward: 'Global Champion Status' },
    { target: 100000, label: '100K', reward: '🎉 Mission Complete!' }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-16">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 via-orange-500/5 to-purple-500/10" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-pink-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-4xl mx-auto"
          >
            <Badge variant="secondary" className="mb-4 px-4 py-2 text-sm gap-2">
              <Globe className="w-4 h-4" />
              {isVN ? 'Chương trình toàn cầu' : 'Global Program'}
            </Badge>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-pink-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent">
                1 Billion CAMLY Airdrop
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8">
              {isVN 
                ? '🎁 Món quà đặc biệt dành cho 100,000 trẻ em dưới 18 tuổi trên toàn thế giới'
                : '🎁 A special gift for 100,000 children under 18 worldwide'}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <AirdropButton variant="default" className="text-lg px-8 py-4" />
              {user && userClaimed && (
                <Badge variant="outline" className="gap-2 px-4 py-2 border-green-500 text-green-500">
                  <CheckCircle2 className="w-4 h-4" />
                  {isVN ? 'Bạn đã nhận!' : 'You claimed!'}
                </Badge>
              )}
            </div>

            {/* Live Stats */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto"
            >
              <Card className="bg-card/50 backdrop-blur border-pink-500/20">
                <CardContent className="p-4 text-center">
                  <Baby className="w-6 h-6 mx-auto mb-2 text-pink-500" />
                  <div className="text-2xl font-bold">{totalClaimed.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">
                    {isVN ? 'Trẻ em đã nhận' : 'Children Claimed'}
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-card/50 backdrop-blur border-orange-500/20">
                <CardContent className="p-4 text-center">
                  <Coins className="w-6 h-6 mx-auto mb-2 text-orange-500" />
                  <div className="text-2xl font-bold">{(totalAmount / 1000000).toFixed(1)}M</div>
                  <div className="text-xs text-muted-foreground">
                    {isVN ? 'CAMLY đã phát' : 'CAMLY Distributed'}
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-card/50 backdrop-blur border-green-500/20">
                <CardContent className="p-4 text-center">
                  <TrendingUp className="w-6 h-6 mx-auto mb-2 text-green-500" />
                  <div className="text-2xl font-bold">{remainingSlots.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">
                    {isVN ? 'Suất còn lại' : 'Slots Remaining'}
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-card/50 backdrop-blur border-purple-500/20">
                <CardContent className="p-4 text-center">
                  <Gift className="w-6 h-6 mx-auto mb-2 text-purple-500" />
                  <div className="text-2xl font-bold">{AIRDROP_PER_CHILD.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">
                    {isVN ? 'CAMLY/trẻ em' : 'CAMLY/Child'}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Progress Section */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Rocket className="w-5 h-5 text-primary" />
                {isVN ? 'Tiến độ phân phối' : 'Distribution Progress'}
              </CardTitle>
              <CardDescription>
                {isVN 
                  ? `${progressPercent.toFixed(2)}% mục tiêu - ${totalClaimed.toLocaleString()} / ${MAX_CHILDREN.toLocaleString()} trẻ em`
                  : `${progressPercent.toFixed(2)}% complete - ${totalClaimed.toLocaleString()} / ${MAX_CHILDREN.toLocaleString()} children`}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Progress value={progressPercent} className="h-4" />
              
              {/* Milestones */}
              <div className="flex justify-between">
                {milestones.map((milestone, index) => {
                  const achieved = totalClaimed >= milestone.target;
                  return (
                    <div key={index} className="text-center">
                      <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center mb-2 ${
                        achieved 
                          ? 'bg-green-500 text-white' 
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {achieved ? <CheckCircle2 className="w-5 h-5" /> : <Star className="w-5 h-5" />}
                      </div>
                      <div className="text-sm font-semibold">{milestone.label}</div>
                      <div className="text-xs text-muted-foreground hidden sm:block">{milestone.reward}</div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Charts & Recipients */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <Tabs defaultValue="chart" className="max-w-5xl mx-auto">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="chart" className="gap-2">
                <TrendingUp className="w-4 h-4" />
                {isVN ? 'Thống kê' : 'Statistics'}
              </TabsTrigger>
              <TabsTrigger value="recipients" className="gap-2">
                <Users className="w-4 h-4" />
                {isVN ? 'Người nhận' : 'Recipients'}
              </TabsTrigger>
              <TabsTrigger value="distribution" className="gap-2">
                <Coins className="w-4 h-4" />
                {isVN ? 'Phân bổ' : 'Distribution'}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="chart">
              <Card>
                <CardHeader>
                  <CardTitle>{isVN ? 'Số lượt nhận theo ngày' : 'Daily Claims'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={dailyStats}>
                      <defs>
                        <linearGradient id="claimsGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#FF6B35" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#FF6B35" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="claims" 
                        stroke="#FF6B35" 
                        strokeWidth={2}
                        fill="url(#claimsGradient)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="recipients">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{isVN ? 'Người nhận gần đây' : 'Recent Recipients'}</span>
                    <Badge variant="outline">{recentRecipients.length} {isVN ? 'mới nhất' : 'latest'}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {recentRecipients.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      {isVN ? 'Chưa có ai nhận airdrop. Hãy là người đầu tiên!' : 'No claims yet. Be the first!'}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {recentRecipients.map((recipient, index) => (
                        <motion.div
                          key={recipient.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                        >
                          <Avatar>
                            <AvatarImage src={recipient.profile?.avatar_url || ''} />
                            <AvatarFallback className="bg-gradient-to-br from-pink-500 to-orange-500 text-white">
                              {recipient.profile?.username?.charAt(0).toUpperCase() || '?'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="font-semibold">{recipient.profile?.username || 'Anonymous'}</div>
                            <div className="text-sm text-muted-foreground">
                              {new Date(recipient.created_at).toLocaleDateString()}
                            </div>
                          </div>
                          <Badge className="bg-gradient-to-r from-pink-500 to-orange-500 text-white">
                            +{recipient.amount.toLocaleString()} CAMLY
                          </Badge>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="distribution">
              <Card>
                <CardHeader>
                  <CardTitle>{isVN ? 'Phân bổ CAMLY' : 'CAMLY Distribution'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row items-center gap-8">
                    <ResponsiveContainer width={250} height={250}>
                      <PieChart>
                        <Pie
                          data={distributionData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {distributionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value: number) => value.toLocaleString() + ' CAMLY'}
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full bg-[#4ECDC4]" />
                        <span className="flex-1">{isVN ? 'Đã phát' : 'Distributed'}</span>
                        <span className="font-bold">{totalAmount.toLocaleString()} CAMLY</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full bg-[#2D3748]" />
                        <span className="flex-1">{isVN ? 'Còn lại' : 'Remaining'}</span>
                        <span className="font-bold">{(TOTAL_AIRDROP - totalAmount).toLocaleString()} CAMLY</span>
                      </div>
                      <div className="pt-4 border-t">
                        <div className="text-lg font-bold">
                          {isVN ? 'Tổng quỹ: ' : 'Total Pool: '} 
                          <span className="text-primary">1,000,000,000 CAMLY</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            {isVN ? 'Cách nhận Airdrop' : 'How to Claim'}
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              {
                icon: Users,
                title: isVN ? 'Bước 1: Đăng ký' : 'Step 1: Sign Up',
                description: isVN 
                  ? 'Tạo tài khoản FUN Planet miễn phí dành cho trẻ em dưới 18 tuổi'
                  : 'Create a free FUN Planet account for children under 18'
              },
              {
                icon: Gift,
                title: isVN ? 'Bước 2: Nhận thưởng' : 'Step 2: Claim',
                description: isVN
                  ? 'Nhấn nút "Nhận Airdrop" và xác nhận để nhận 10,000 CAMLY'
                  : 'Click "Claim Airdrop" button and confirm to receive 10,000 CAMLY'
              },
              {
                icon: Rocket,
                title: isVN ? 'Bước 3: Sử dụng' : 'Step 3: Use',
                description: isVN
                  ? 'Dùng CAMLY để chơi game, mua vật phẩm hoặc tặng bạn bè'
                  : 'Use CAMLY to play games, buy items, or gift friends'
              }
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <Card className="h-full text-center hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-pink-500 to-orange-500 flex items-center justify-center">
                      <step.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                    <p className="text-muted-foreground text-sm">{step.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto"
          >
            <Heart className="w-16 h-16 mx-auto mb-6 text-pink-500" />
            <h2 className="text-3xl font-bold mb-4">
              {isVN ? 'Cùng tạo nên tương lai tốt đẹp hơn' : 'Together for a brighter future'}
            </h2>
            <p className="text-muted-foreground mb-8">
              {isVN 
                ? 'FUN Planet cam kết dành 1 tỷ CAMLY để hỗ trợ trẻ em trên toàn thế giới tiếp cận công nghệ Web3 một cách an toàn và vui vẻ.'
                : 'FUN Planet commits 1 billion CAMLY to help children worldwide access Web3 technology safely and joyfully.'}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <AirdropButton variant="default" />
              <Link to="/about">
                <Button variant="outline" className="gap-2">
                  {isVN ? 'Tìm hiểu thêm' : 'Learn More'}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default GlobalAirdrop;
