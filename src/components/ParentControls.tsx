import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Clock, Shield, Ban, Users, Plus, Trash2, 
  Search, AlertTriangle, Check, Moon, Sun
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface LinkedChild {
  id: string;
  child_id: string;
  status: string;
  child_profile?: {
    username: string;
    avatar_url: string | null;
  };
  time_limits?: {
    daily_limit_minutes: number;
    weekend_limit_minutes: number;
    bedtime_start: string;
    bedtime_end: string;
    is_active: boolean;
  };
  today_usage?: number;
}

interface BlockedGame {
  id: string;
  game_id: string;
  reason: string | null;
  game_title?: string;
}

export function ParentControls() {
  const { user } = useAuth();
  const [linkedChildren, setLinkedChildren] = useState<LinkedChild[]>([]);
  const [blockedGames, setBlockedGames] = useState<BlockedGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddChild, setShowAddChild] = useState(false);
  const [childEmail, setChildEmail] = useState("");
  const [selectedChild, setSelectedChild] = useState<LinkedChild | null>(null);
  const [games, setGames] = useState<any[]>([]);
  const [searchGame, setSearchGame] = useState("");

  useEffect(() => {
    if (user) {
      fetchLinkedChildren();
      fetchGames();
    }
  }, [user]);

  useEffect(() => {
    if (selectedChild) {
      fetchBlockedGames(selectedChild.child_id);
    }
  }, [selectedChild]);

  const fetchLinkedChildren = async () => {
    try {
      const { data: links, error } = await supabase
        .from('parent_child_links')
        .select('*')
        .eq('parent_id', user?.id);

      if (error) throw error;

      if (links && links.length > 0) {
        // Fetch profiles for each child
        const childIds = links.map(l => l.child_id);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, username, avatar_url')
          .in('id', childIds);

        // Fetch time limits
        const { data: timeLimits } = await supabase
          .from('child_time_limits')
          .select('*')
          .eq('parent_id', user?.id);

        // Fetch today's play sessions
        const today = new Date().toISOString().split('T')[0];
        const { data: sessions } = await supabase
          .from('child_play_sessions')
          .select('child_id, duration_minutes')
          .in('child_id', childIds)
          .eq('session_date', today);

        const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
        const timeLimitsMap = new Map(timeLimits?.map(t => [t.child_id, t]) || []);
        
        // Calculate total usage per child
        const usageMap = new Map<string, number>();
        sessions?.forEach(s => {
          const current = usageMap.get(s.child_id) || 0;
          usageMap.set(s.child_id, current + s.duration_minutes);
        });

        const enrichedLinks = links.map(link => ({
          ...link,
          child_profile: profileMap.get(link.child_id),
          time_limits: timeLimitsMap.get(link.child_id),
          today_usage: usageMap.get(link.child_id) || 0,
        }));

        setLinkedChildren(enrichedLinks);
        if (enrichedLinks.length > 0 && !selectedChild) {
          setSelectedChild(enrichedLinks[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching children:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGames = async () => {
    const { data } = await supabase
      .from('games')
      .select('id, title, thumbnail_url')
      .eq('is_active', true);
    setGames(data || []);
  };

  const fetchBlockedGames = async (childId: string) => {
    const { data } = await supabase
      .from('blocked_games')
      .select('*')
      .eq('parent_id', user?.id)
      .eq('child_id', childId);
    
    if (data) {
      // Get game titles
      const gameIds = data.map(b => b.game_id);
      const { data: gameData } = await supabase
        .from('games')
        .select('id, title')
        .in('id', gameIds);
      
      const gameMap = new Map(gameData?.map(g => [g.id, g.title]) || []);
      setBlockedGames(data.map(b => ({
        ...b,
        game_title: gameMap.get(b.game_id) || 'Unknown Game'
      })));
    }
  };

  const handleLinkChild = async () => {
    if (!childEmail.trim()) return;

    try {
      // Find child by email
      const { data: childProfile, error: findError } = await supabase
        .from('profiles')
        .select('id, username')
        .eq('email', childEmail.toLowerCase())
        .single();

      if (findError || !childProfile) {
        toast.error("Không tìm thấy tài khoản với email này");
        return;
      }

      // Create link
      const { error } = await supabase
        .from('parent_child_links')
        .insert({
          parent_id: user?.id,
          child_id: childProfile.id,
          status: 'pending'
        });

      if (error) {
        if (error.code === '23505') {
          toast.error("Đã liên kết với tài khoản này rồi");
        } else {
          throw error;
        }
        return;
      }

      // Create default time limits
      await supabase
        .from('child_time_limits')
        .insert({
          parent_id: user?.id,
          child_id: childProfile.id,
          daily_limit_minutes: 60,
          weekend_limit_minutes: 120,
        });

      toast.success(`Đã gửi yêu cầu liên kết đến ${childProfile.username}`);
      setChildEmail("");
      setShowAddChild(false);
      fetchLinkedChildren();
    } catch (error) {
      console.error('Error linking child:', error);
      toast.error("Không thể liên kết");
    }
  };

  const handleUpdateTimeLimit = async (field: string, value: number | boolean) => {
    if (!selectedChild) return;

    try {
      const { error } = await supabase
        .from('child_time_limits')
        .update({ [field]: value })
        .eq('parent_id', user?.id)
        .eq('child_id', selectedChild.child_id);

      if (error) throw error;
      
      toast.success("Đã cập nhật giới hạn");
      fetchLinkedChildren();
    } catch (error) {
      console.error('Error updating limit:', error);
      toast.error("Không thể cập nhật");
    }
  };

  const handleBlockGame = async (gameId: string) => {
    if (!selectedChild) return;

    try {
      const { error } = await supabase
        .from('blocked_games')
        .insert({
          parent_id: user?.id,
          child_id: selectedChild.child_id,
          game_id: gameId,
        });

      if (error) {
        if (error.code === '23505') {
          toast.error("Game này đã bị chặn");
        } else {
          throw error;
        }
        return;
      }

      toast.success("Đã chặn game");
      fetchBlockedGames(selectedChild.child_id);
    } catch (error) {
      console.error('Error blocking game:', error);
    }
  };

  const handleUnblockGame = async (blockedId: string) => {
    try {
      await supabase
        .from('blocked_games')
        .delete()
        .eq('id', blockedId);

      toast.success("Đã bỏ chặn game");
      if (selectedChild) {
        fetchBlockedGames(selectedChild.child_id);
      }
    } catch (error) {
      console.error('Error unblocking:', error);
    }
  };

  const handleRemoveChild = async (linkId: string) => {
    try {
      await supabase
        .from('parent_child_links')
        .delete()
        .eq('id', linkId);

      toast.success("Đã hủy liên kết");
      fetchLinkedChildren();
      setSelectedChild(null);
    } catch (error) {
      console.error('Error removing link:', error);
    }
  };

  const filteredGames = games.filter(g => 
    g.title.toLowerCase().includes(searchGame.toLowerCase()) &&
    !blockedGames.some(b => b.game_id === g.id)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            Quản lý Phụ huynh
          </h2>
          <p className="text-muted-foreground">Thiết lập giới hạn thời gian và nội dung cho con em</p>
        </div>
        <Dialog open={showAddChild} onOpenChange={setShowAddChild}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" /> Thêm con
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Liên kết tài khoản con</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label>Email tài khoản của con</Label>
                <Input
                  type="email"
                  placeholder="email@example.com"
                  value={childEmail}
                  onChange={(e) => setChildEmail(e.target.value)}
                />
              </div>
              <Button onClick={handleLinkChild} className="w-full">
                Gửi yêu cầu liên kết
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {linkedChildren.length === 0 ? (
        <Card className="p-8 text-center">
          <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">Chưa có tài khoản con nào</h3>
          <p className="text-muted-foreground mb-4">
            Liên kết tài khoản của con để quản lý thời gian chơi game
          </p>
          <Button onClick={() => setShowAddChild(true)}>
            <Plus className="w-4 h-4 mr-2" /> Thêm tài khoản con
          </Button>
        </Card>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {/* Children List */}
          <Card className="p-4">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" /> Danh sách con
            </h3>
            <div className="space-y-2">
              {linkedChildren.map((child) => (
                <motion.div
                  key={child.id}
                  whileHover={{ scale: 1.02 }}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedChild?.id === child.id 
                      ? 'bg-primary/20 border border-primary' 
                      : 'bg-muted/50 hover:bg-muted'
                  }`}
                  onClick={() => setSelectedChild(child)}
                >
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={child.child_profile?.avatar_url || undefined} />
                      <AvatarFallback>
                        {child.child_profile?.username?.charAt(0).toUpperCase() || "C"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{child.child_profile?.username || "Đang chờ"}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant={child.status === 'approved' ? 'default' : 'secondary'}>
                          {child.status === 'approved' ? 'Đã xác nhận' : 'Chờ duyệt'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  {child.time_limits && (
                    <div className="mt-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {child.today_usage}/{child.time_limits.daily_limit_minutes} phút hôm nay
                      </div>
                      <div className="w-full h-2 bg-muted rounded-full mt-1 overflow-hidden">
                        <div 
                          className={`h-full transition-all ${
                            (child.today_usage || 0) >= child.time_limits.daily_limit_minutes 
                              ? 'bg-red-500' 
                              : 'bg-primary'
                          }`}
                          style={{ 
                            width: `${Math.min(100, ((child.today_usage || 0) / child.time_limits.daily_limit_minutes) * 100)}%` 
                          }}
                        />
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </Card>

          {/* Settings Panel */}
          {selectedChild && (
            <Card className="md:col-span-2 p-4">
              <Tabs defaultValue="time">
                <TabsList className="w-full grid grid-cols-2">
                  <TabsTrigger value="time" className="gap-2">
                    <Clock className="w-4 h-4" /> Thời gian
                  </TabsTrigger>
                  <TabsTrigger value="games" className="gap-2">
                    <Ban className="w-4 h-4" /> Chặn game
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="time" className="space-y-6 mt-4">
                  {selectedChild.time_limits ? (
                    <>
                      {/* Active Toggle */}
                      <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                        <div>
                          <p className="font-medium">Kích hoạt giới hạn</p>
                          <p className="text-sm text-muted-foreground">Bật/tắt tất cả giới hạn</p>
                        </div>
                        <Switch
                          checked={selectedChild.time_limits.is_active}
                          onCheckedChange={(checked) => handleUpdateTimeLimit('is_active', checked)}
                        />
                      </div>

                      {/* Daily Limit */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label>Giới hạn ngày thường</Label>
                          <Badge variant="outline">{selectedChild.time_limits.daily_limit_minutes} phút</Badge>
                        </div>
                        <Slider
                          value={[selectedChild.time_limits.daily_limit_minutes]}
                          min={15}
                          max={240}
                          step={15}
                          onValueCommit={(value) => handleUpdateTimeLimit('daily_limit_minutes', value[0])}
                        />
                        <p className="text-sm text-muted-foreground">
                          {Math.floor(selectedChild.time_limits.daily_limit_minutes / 60)}h {selectedChild.time_limits.daily_limit_minutes % 60}m mỗi ngày
                        </p>
                      </div>

                      {/* Weekend Limit */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label>Giới hạn cuối tuần</Label>
                          <Badge variant="outline">{selectedChild.time_limits.weekend_limit_minutes} phút</Badge>
                        </div>
                        <Slider
                          value={[selectedChild.time_limits.weekend_limit_minutes]}
                          min={15}
                          max={360}
                          step={15}
                          onValueCommit={(value) => handleUpdateTimeLimit('weekend_limit_minutes', value[0])}
                        />
                        <p className="text-sm text-muted-foreground">
                          {Math.floor(selectedChild.time_limits.weekend_limit_minutes / 60)}h {selectedChild.time_limits.weekend_limit_minutes % 60}m vào T7 & CN
                        </p>
                      </div>

                      {/* Bedtime */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="flex items-center gap-2">
                            <Moon className="w-4 h-4" /> Giờ đi ngủ
                          </Label>
                          <Input
                            type="time"
                            value={selectedChild.time_limits.bedtime_start}
                            onChange={(e) => handleUpdateTimeLimit('bedtime_start', e.target.value as any)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="flex items-center gap-2">
                            <Sun className="w-4 h-4" /> Giờ thức dậy
                          </Label>
                          <Input
                            type="time"
                            value={selectedChild.time_limits.bedtime_end}
                            onChange={(e) => handleUpdateTimeLimit('bedtime_end', e.target.value as any)}
                          />
                        </div>
                      </div>

                      <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-medium text-yellow-600">Lưu ý</p>
                            <p className="text-sm text-muted-foreground">
                              Trong giờ đi ngủ ({selectedChild.time_limits.bedtime_start} - {selectedChild.time_limits.bedtime_end}), 
                              con sẽ không thể chơi game.
                            </p>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">Đang tải cài đặt...</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="games" className="space-y-4 mt-4">
                  {/* Search & Add */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Tìm game để chặn..."
                      className="pl-10"
                      value={searchGame}
                      onChange={(e) => setSearchGame(e.target.value)}
                    />
                  </div>

                  {searchGame && (
                    <div className="max-h-48 overflow-y-auto space-y-2">
                      {filteredGames.slice(0, 5).map((game) => (
                        <div 
                          key={game.id}
                          className="flex items-center justify-between p-2 bg-muted/50 rounded-lg"
                        >
                          <span>{game.title}</span>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleBlockGame(game.id)}
                          >
                            <Ban className="w-4 h-4 mr-1" /> Chặn
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Blocked Games List */}
                  <div>
                    <h4 className="font-medium mb-3">Games đã chặn ({blockedGames.length})</h4>
                    {blockedGames.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">
                        Chưa chặn game nào
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {blockedGames.map((blocked) => (
                          <div 
                            key={blocked.id}
                            className="flex items-center justify-between p-3 bg-red-500/10 border border-red-500/30 rounded-lg"
                          >
                            <div className="flex items-center gap-2">
                              <Ban className="w-4 h-4 text-red-500" />
                              <span>{blocked.game_title}</span>
                            </div>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => handleUnblockGame(blocked.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>

              {/* Remove Link */}
              <div className="mt-6 pt-4 border-t">
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => handleRemoveChild(selectedChild.id)}
                >
                  <Trash2 className="w-4 h-4 mr-2" /> Hủy liên kết
                </Button>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
