import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { 
  ArrowLeft, Heart, Globe, Shield, Users, Sparkles, 
  Gift, Rocket, Target, Check, ExternalLink, Coins
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";

const About = () => {
  const { t, i18n } = useTranslation();
  const [charityTotal, setCharityTotal] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch charity stats
      const { data: charityData } = await supabase
        .from('charity_wallet_stats')
        .select('total_donated')
        .single();
      
      if (charityData) {
        setCharityTotal(charityData.total_donated);
      }

      // Fetch total users
      const { count } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true });
      
      if (count) {
        setTotalUsers(count);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const isVN = i18n.language === 'vi';

  // Revenue split data for pie chart
  const revenueSplitData = [
    { name: isVN ? 'Phát triển & Vận hành' : 'Development & Operations', value: 50, color: '#FF6B35' },
    { name: isVN ? 'Cộng đồng & Phần thưởng' : 'Community & Rewards', value: 28, color: '#4ECDC4' },
    { name: isVN ? 'Từ thiện (Trẻ em)' : 'Charity (Children)', value: 11, color: '#FF69B4' },
    { name: isVN ? 'Marketing' : 'Marketing', value: 6, color: '#9B59B6' },
    { name: isVN ? 'Dự phòng' : 'Reserve', value: 5, color: '#3498DB' },
  ];

  const blueprintChecklist = [
    { 
      key: 'games', 
      done: true, 
      label: isVN ? 'Thư viện game lành mạnh 50+' : '50+ wholesome games library' 
    },
    { 
      key: 'rewards', 
      done: true, 
      label: isVN ? 'Hệ thống CAMLY coin rewards' : 'CAMLY coin rewards system' 
    },
    { 
      key: 'wallet', 
      done: true, 
      label: isVN ? 'Ví Web3 tích hợp' : 'Integrated Web3 wallet' 
    },
    { 
      key: 'social', 
      done: true, 
      label: isVN ? 'Chat & bạn bè realtime' : 'Realtime chat & friends' 
    },
    { 
      key: 'charity', 
      done: true, 
      label: isVN ? 'Quỹ từ thiện minh bạch' : 'Transparent charity fund' 
    },
    { 
      key: 'nft', 
      done: true, 
      label: isVN ? 'NFT thành tựu soulbound' : 'Soulbound achievement NFTs' 
    },
    { 
      key: 'multilang', 
      done: true, 
      label: isVN ? 'Đa ngôn ngữ VN/EN' : 'Multilingual VN/EN' 
    },
    { 
      key: 'pwa', 
      done: true, 
      label: isVN ? 'Ứng dụng PWA mobile' : 'PWA mobile app' 
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="container mx-auto px-4 py-3 flex items-center gap-4">
          <Link to="/">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {isVN ? 'Về FUN Planet' : 'About FUN Planet'}
          </h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center">
            <Rocket className="w-12 h-12 text-primary" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold">
            {isVN ? 'Xây Dựng Hành Tinh Của Bạn' : 'Build Your Planet'}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {isVN 
              ? 'FUN Planet là nền tảng Web3 gaming lành mạnh, nơi trẻ em vừa chơi vừa học, kiếm phần thưởng và đóng góp cho cộng đồng.' 
              : 'FUN Planet is a wholesome Web3 gaming platform where children play, learn, earn rewards, and contribute to the community.'}
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Users, value: totalUsers.toLocaleString(), label: isVN ? 'Người chơi' : 'Players', color: 'text-blue-500' },
            { icon: Heart, value: `$${(charityTotal / 1000).toFixed(1)}K`, label: isVN ? 'Từ thiện' : 'Charity', color: 'text-pink-500' },
            { icon: Sparkles, value: '50+', label: isVN ? 'Trò chơi' : 'Games', color: 'text-yellow-500' },
            { icon: Shield, value: '100%', label: isVN ? 'An toàn' : 'Safe', color: 'text-green-500' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="text-center p-4">
                <stat.icon className={`w-8 h-8 mx-auto mb-2 ${stat.color}`} />
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  {isVN ? 'Sứ Mệnh' : 'Mission'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-muted-foreground">
                <p>
                  {isVN 
                    ? '🎮 Tạo ra một thế giới game lành mạnh, nơi mỗi trò chơi đều nuôi dưỡng tâm hồn trẻ thơ.'
                    : '🎮 Create a wholesome gaming world where every game nurtures young minds.'}
                </p>
                <p>
                  {isVN 
                    ? '💝 Kết nối trẻ em toàn cầu thông qua niềm vui và sự sáng tạo.'
                    : '💝 Connect children globally through joy and creativity.'}
                </p>
                <p>
                  {isVN 
                    ? '🌍 Đóng góp 11% doanh thu cho trẻ em có hoàn cảnh khó khăn.'
                    : '🌍 Contribute 11% of revenue to children in need.'}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-secondary" />
                  {isVN ? 'Tầm Nhìn' : 'Vision'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-muted-foreground">
                <p>
                  {isVN 
                    ? '🚀 Trở thành nền tảng Web3 gaming hàng đầu cho gia đình và trẻ em.'
                    : '🚀 Become the leading Web3 gaming platform for families and children.'}
                </p>
                <p>
                  {isVN 
                    ? '⭐ Mỗi game là một bài học, mỗi phần thưởng là một động lực.'
                    : '⭐ Every game is a lesson, every reward is motivation.'}
                </p>
                <p>
                  {isVN 
                    ? '💫 Xây dựng thế hệ công dân số tích cực và hướng thượng.'
                    : '💫 Build a positive and uplifting generation of digital citizens.'}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Web3 Transparency - Revenue Split */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-yellow-500" />
              {isVN ? 'Phân Chia Doanh Thu Minh Bạch' : 'Transparent Revenue Split'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="w-full md:w-1/2 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={revenueSplitData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                      label={({ name, value }) => `${value}%`}
                    >
                      {revenueSplitData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-full md:w-1/2 space-y-3">
                {revenueSplitData.map((item) => (
                  <div key={item.name} className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="flex-1 text-sm">{item.name}</span>
                    <span className="font-bold">{item.value}%</span>
                  </div>
                ))}
                <p className="text-sm text-muted-foreground pt-4 border-t">
                  {isVN 
                    ? '💡 Tất cả giao dịch đều được ghi nhận on-chain trên BNB Chain để đảm bảo minh bạch 100%.'
                    : '💡 All transactions are recorded on-chain on BNB Chain for 100% transparency.'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Blueprint Checklist */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-500" />
              {isVN ? 'Checklist Blueprint' : 'Blueprint Checklist'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-3">
              {blueprintChecklist.map((item, i) => (
                <motion.div
                  key={item.key}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`flex items-center gap-3 p-3 rounded-lg ${
                    item.done 
                      ? 'bg-green-500/10 border border-green-500/20' 
                      : 'bg-muted/50 border border-border'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    item.done ? 'bg-green-500 text-white' : 'bg-muted-foreground/20'
                  }`}>
                    {item.done && <Check className="w-4 h-4" />}
                  </div>
                  <span className={item.done ? 'text-foreground' : 'text-muted-foreground'}>
                    {item.label}
                  </span>
                </motion.div>
              ))}
            </div>
            <div className="mt-6">
              <div className="flex justify-between text-sm mb-2">
                <span>{isVN ? 'Tiến độ' : 'Progress'}</span>
                <span className="font-bold text-green-500">100%</span>
              </div>
              <Progress value={100} className="h-3" />
            </div>
          </CardContent>
        </Card>

        {/* For Who */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-500" />
              {isVN ? 'Dành Cho Ai?' : 'Who Is This For?'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { 
                  emoji: '👧👦', 
                  title: isVN ? 'Trẻ em 6-16 tuổi' : 'Children 6-16', 
                  desc: isVN ? 'Học và chơi cùng nhau' : 'Learn and play together' 
                },
                { 
                  emoji: '👨‍👩‍👧', 
                  title: isVN ? 'Phụ huynh' : 'Parents', 
                  desc: isVN ? 'Quản lý và đồng hành' : 'Manage and guide' 
                },
                { 
                  emoji: '💻', 
                  title: isVN ? 'Nhà phát triển' : 'Developers', 
                  desc: isVN ? 'Tạo game và kiếm thưởng' : 'Create games and earn' 
                },
              ].map((item) => (
                <Card key={item.title} className="text-center p-4 bg-muted/50">
                  <div className="text-4xl mb-2">{item.emoji}</div>
                  <h3 className="font-bold">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <h3 className="text-2xl font-bold">
            {isVN ? 'Sẵn sàng bắt đầu?' : 'Ready to start?'}
          </h3>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/games">
              <Button size="lg" className="gap-2">
                <Sparkles className="w-5 h-5" />
                {isVN ? 'Khám phá Games' : 'Explore Games'}
              </Button>
            </Link>
            <Link to="/wallet">
              <Button size="lg" variant="outline" className="gap-2">
                <Gift className="w-5 h-5" />
                {isVN ? 'Ví CAMLY' : 'CAMLY Wallet'}
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default About;
