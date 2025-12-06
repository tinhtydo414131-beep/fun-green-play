import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Gamepad2, Edit2, Settings, Wallet, LogOut, Share2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

// New modular components
import { ProfileCover } from "@/components/profile/ProfileCover";
import { ProfileTabs } from "@/components/profile/ProfileTabs";
import { ProfileSidebar } from "@/components/profile/ProfileSidebar";
import { CreatePostCard } from "@/components/profile/CreatePostCard";
import { PostCard } from "@/components/profile/PostCard";
import { AboutSection } from "@/components/profile/AboutSection";
import { FriendsSection } from "@/components/profile/FriendsSection";
import { PhotosSection } from "@/components/profile/PhotosSection";
import { HonorBoard } from "@/components/profile/HonorBoard";
import { WalletConnectModal } from "@/components/WalletConnectModal";
import { ClaimRewardsModal } from "@/components/ClaimRewardsModal";
import { Web3RewardNotification } from "@/components/Web3RewardNotification";
import { useWeb3Rewards } from "@/hooks/useWeb3Rewards";
import { Skeleton } from "@/components/ui/skeleton";

interface Profile {
  id: string;
  username: string;
  email: string;
  avatar_url: string | null;
  cover_url?: string | null;
  bio: string | null;
  bio_full?: string | null;
  workplace?: string | null;
  education?: string | null;
  location?: string | null;
  relationship_status?: string | null;
  wallet_address: string | null;
  wallet_balance: number;
  total_plays: number;
  total_likes: number;
  total_friends: number;
  total_messages: number;
  leaderboard_score: number;
}

interface Transaction {
  id: string;
  transaction_type: string;
  amount: number;
  description: string | null;
  created_at: string;
}

export default function Profile() {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRank, setUserRank] = useState<number>(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [friends, setFriends] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("posts");
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [showClaimModal, setShowClaimModal] = useState(false);

  const {
    camlyBalance,
    walletAddress,
    isConnected,
    pendingReward,
    connectWallet,
    claimToWallet,
    clearPendingReward,
    CAMLY_CONTRACT_ADDRESS,
  } = useWeb3Rewards();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchUserRank();
      fetchTransactions();
      fetchFriends();
      fetchPosts();
      
      // Real-time subscription for posts
      const channel = supabase
        .channel('posts-changes')
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'posts',
          filter: `user_id=eq.${user.id}`
        }, () => {
          fetchPosts();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user?.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error: any) {
      console.error("Error fetching profile:", error);
      toast.error("Couldn't load your profile");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserRank = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, wallet_balance")
        .order("wallet_balance", { ascending: false });

      if (error) throw error;
      const rank = data?.findIndex(p => p.id === user?.id) ?? -1;
      setUserRank(rank + 1);
    } catch (error) {
      console.error("Error fetching rank:", error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from("camly_coin_transactions")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  const fetchFriends = async () => {
    try {
      const { data } = await supabase
        .from("friends")
        .select(`friend:profiles!friends_friend_id_fkey(id, username, avatar_url)`)
        .eq("user_id", user?.id)
        .limit(9);

      if (data) {
        setFriends(data.map((f: any) => f.friend));
      }
    } catch (error) {
      console.error("Error fetching friends:", error);
    }
  };

  const fetchPosts = async () => {
    try {
      const { data } = await supabase
        .from("posts")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false })
        .limit(20);

      if (data) {
        const postsWithUser = data.map(post => ({
          ...post,
          user: { username: profile?.username, avatar_url: profile?.avatar_url }
        }));
        setPosts(postsWithUser);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const handleProfileUpdate = (updates: Partial<Profile>) => {
    setProfile(prev => prev ? { ...prev, ...updates } : null);
  };

  const handlePostCreated = (newPost: any) => {
    setPosts(prev => [newPost, ...prev]);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Gamepad2 className="w-16 h-16 text-primary animate-bounce mx-auto" />
          <p className="text-2xl font-fredoka text-primary">Loading...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto py-32 px-4 text-center">
          <p className="text-2xl font-fredoka text-muted-foreground">Profile not found</p>
        </div>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "posts":
        return (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-5 space-y-4">
              <ProfileSidebar
                profile={profile}
                friends={friends}
                transactions={transactions}
                camlyBalance={camlyBalance}
                userRank={userRank}
                walletAddress={walletAddress}
                isConnected={isConnected}
                onConnectWallet={() => setShowConnectModal(true)}
              />
            </div>
            <div className="lg:col-span-7 space-y-4">
              <CreatePostCard profile={profile} onPostCreated={handlePostCreated} />
              {posts.map(post => (
                <PostCard key={post.id} post={post} currentUserId={user?.id || ''} />
              ))}
              {posts.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  No posts yet. Share your first post!
                </div>
              )}
            </div>
          </div>
        );
      case "about":
        return (
          <AboutSection
            profile={profile}
            camlyBalance={camlyBalance}
            userRank={userRank}
            onProfileUpdate={handleProfileUpdate}
          />
        );
      case "friends":
        return <FriendsSection userId={profile.id} totalFriends={profile.total_friends} />;
      case "photos":
        return <PhotosSection userId={profile.id} />;
      case "games":
        return (
          <div className="space-y-4">
            <HonorBoard profile={profile} userRank={userRank} />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 pb-24">
      <Navigation />
      
      {/* Cover Photo & Avatar */}
      <ProfileCover 
        profile={profile} 
        userRank={userRank} 
        onProfileUpdate={handleProfileUpdate}
      />

      {/* Action Buttons */}
      <div className="max-w-6xl mx-auto px-4 py-4 flex flex-wrap gap-2 justify-end border-b border-border">
        <Button onClick={() => navigate('/settings')} variant="outline" className="gap-2">
          <Edit2 className="w-4 h-4" />
          Edit Profile
        </Button>
        <Button variant="outline" onClick={() => navigate('/wallet')} className="gap-2">
          <Wallet className="w-4 h-4" />
        </Button>
        <Button variant="outline" onClick={() => navigate('/settings')}>
          <Settings className="w-4 h-4" />
        </Button>
        <Button variant="ghost" onClick={() => {
          navigator.clipboard.writeText(`${window.location.origin}/profile/${profile.id}`);
          toast.success("Profile link copied!");
        }}>
          <Share2 className="w-4 h-4" />
        </Button>
        <Button variant="ghost" onClick={handleLogout} className="text-red-500 hover:text-red-600">
          <LogOut className="w-4 h-4" />
        </Button>
      </div>

      {/* Tabs Navigation & Content */}
      <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab}>
        {renderTabContent()}
      </ProfileTabs>

      {/* Modals */}
      <WalletConnectModal
        isOpen={showConnectModal}
        onClose={() => setShowConnectModal(false)}
        onConnect={connectWallet}
        isConnected={isConnected}
        walletAddress={walletAddress}
      />

      <ClaimRewardsModal
        isOpen={showClaimModal}
        onClose={() => setShowClaimModal(false)}
        camlyBalance={camlyBalance}
        walletAddress={walletAddress}
        onClaim={claimToWallet}
        contractAddress={CAMLY_CONTRACT_ADDRESS}
      />

      <Web3RewardNotification
        isOpen={!!pendingReward}
        amount={pendingReward?.amount || 0}
        description={pendingReward?.description || ''}
        onClose={clearPendingReward}
      />
    </div>
  );
}
