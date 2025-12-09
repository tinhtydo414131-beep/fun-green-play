import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend 
} from 'recharts';
import { 
  Coins, Users, Heart, Code, ExternalLink, Info, 
  Shield, TrendingUp, Sparkles 
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';

const REVENUE_SPLIT = [
  { name: 'Developers', value: 70, color: '#8B5CF6', icon: Code, desc: 'Game creators earn 70%' },
  { name: 'Community', value: 19, color: '#3B82F6', icon: Users, desc: 'Players & contributors' },
  { name: 'Charity', value: 11, color: '#EC4899', icon: Heart, desc: 'For children in need' },
];

const CONTRACT_ADDRESS = '0x0910320181889FeFdE0bB1Ca63962b0A8882E413';
const BSCSCAN_URL = `https://bscscan.com/token/${CONTRACT_ADDRESS}`;

interface RevenueSplitInfoProps {
  compact?: boolean;
}

export const RevenueSplitInfo = ({ compact = false }: RevenueSplitInfoProps) => {
  const [charityTotal, setCharityTotal] = useState(0);
  const [totalDistributed, setTotalDistributed] = useState(0);
  
  useEffect(() => {
    const fetchStats = async () => {
      const { data } = await supabase
        .from('charity_wallet_stats')
        .select('total_donated')
        .single();
      
      if (data) {
        setCharityTotal(data.total_donated);
        // Estimate total based on 11% charity split
        setTotalDistributed(Math.round(data.total_donated / 0.11));
      }
    };
    
    fetchStats();
  }, []);

  if (compact) {
    return (
      <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-full bg-primary/10">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-bold text-sm">Transparent Revenue Split</h4>
              <p className="text-xs text-muted-foreground">On-chain BSC Smart Contract</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            {REVENUE_SPLIT.map((item) => (
              <div 
                key={item.name}
                className="flex-1 text-center p-2 rounded-lg"
                style={{ backgroundColor: `${item.color}15` }}
              >
                <div className="text-lg font-bold" style={{ color: item.color }}>
                  {item.value}%
                </div>
                <div className="text-[10px] text-muted-foreground">{item.name}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10">
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          Transparent Revenue Split
          <Badge variant="outline" className="ml-auto">
            BSC Smart Contract
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Pie Chart */}
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={REVENUE_SPLIT}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                  animationDuration={1000}
                >
                  {REVENUE_SPLIT.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [`${value}%`, 'Share']}
                  contentStyle={{
                    background: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          {/* Details */}
          <div className="space-y-4">
            {REVENUE_SPLIT.map((item, index) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-3 p-3 rounded-xl"
                style={{ backgroundColor: `${item.color}10` }}
              >
                <div 
                  className="p-2 rounded-full"
                  style={{ backgroundColor: `${item.color}20` }}
                >
                  <item.icon className="w-5 h-5" style={{ color: item.color }} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{item.name}</span>
                    <Badge 
                      className="text-white"
                      style={{ backgroundColor: item.color }}
                    >
                      {item.value}%
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t">
          <div className="text-center p-4 rounded-xl bg-muted/50">
            <TrendingUp className="w-6 h-6 mx-auto mb-2 text-green-500" />
            <div className="text-2xl font-bold text-green-500">
              {totalDistributed.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">Total CAMLY Distributed</div>
          </div>
          
          <div className="text-center p-4 rounded-xl bg-muted/50">
            <Heart className="w-6 h-6 mx-auto mb-2 text-pink-500" />
            <div className="text-2xl font-bold text-pink-500">
              {charityTotal.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">CAMLY to Charity</div>
          </div>
        </div>
        
        {/* Contract Info */}
        <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-purple-500 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-bold text-sm mb-1">Smart Contract (CAMLY Token)</h4>
              <p className="text-xs text-muted-foreground mb-2">
                All transactions are recorded on BSC blockchain for full transparency
              </p>
              <code className="text-[10px] bg-background/50 px-2 py-1 rounded break-all">
                {CONTRACT_ADDRESS}
              </code>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="shrink-0"
              onClick={() => window.open(BSCSCAN_URL, '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-1" />
              View
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RevenueSplitInfo;
