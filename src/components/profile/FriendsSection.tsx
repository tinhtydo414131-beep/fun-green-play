import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, UserPlus, MoreHorizontal } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';

interface Friend {
  id: string;
  username: string;
  avatar_url: string | null;
  total_friends?: number;
}

interface FriendsSectionProps {
  userId: string;
  totalFriends: number;
}

export function FriendsSection({ userId, totalFriends }: FriendsSectionProps) {
  const navigate = useNavigate();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const pageSize = 12;

  useEffect(() => {
    fetchFriends();
  }, [userId, page]);

  const fetchFriends = async () => {
    try {
      const { data, error } = await supabase
        .from('friends')
        .select(`
          friend:profiles!friends_friend_id_fkey(id, username, avatar_url, total_friends)
        `)
        .eq('user_id', userId)
        .range(page * pageSize, (page + 1) * pageSize - 1);

      if (error) throw error;

      const friendsList = data?.map((f: any) => f.friend) || [];
      
      if (page === 0) {
        setFriends(friendsList);
      } else {
        setFriends(prev => [...prev, ...friendsList]);
      }
      
      setHasMore(friendsList.length === pageSize);
    } catch (error) {
      console.error('Error fetching friends:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredFriends = friends.filter(friend =>
    friend.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const LoadingSkeleton = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-card rounded-lg p-4 border border-border">
          <Skeleton className="w-20 h-20 rounded-full mx-auto mb-3" />
          <Skeleton className="h-4 w-24 mx-auto mb-2" />
          <Skeleton className="h-3 w-16 mx-auto" />
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold">
              Friends
              <span className="text-muted-foreground font-normal ml-2">
                ({totalFriends})
              </span>
            </CardTitle>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/find-friends')}
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Find Friends
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search friends..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Friends Grid */}
      {loading ? (
        <LoadingSkeleton />
      ) : filteredFriends.length === 0 ? (
        <Card className="shadow-sm">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              {searchQuery ? 'No friends found matching your search' : 'No friends yet'}
            </p>
            <Button 
              variant="link" 
              onClick={() => navigate('/find-friends')}
              className="mt-2"
            >
              Find friends to connect
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {filteredFriends.map((friend, index) => (
            <motion.div
              key={friend.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card 
                className="shadow-sm hover:shadow-md transition cursor-pointer group"
                onClick={() => navigate(`/profile/${friend.id}`)}
              >
                <CardContent className="p-4">
                  <div className="relative">
                    <Avatar className="w-20 h-20 mx-auto rounded-full overflow-hidden">
                      <AvatarImage src={friend.avatar_url || ''} className="rounded-full object-cover" />
                      <AvatarFallback className="rounded-full bg-gradient-to-br from-primary to-secondary text-white text-2xl">
                        {friend.username?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <Button 
                      variant="secondary" 
                      size="icon" 
                      className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition h-7 w-7"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Show options menu
                      }}
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="text-center mt-3">
                    <p className="font-semibold truncate">{friend.username}</p>
                    {friend.total_friends !== undefined && (
                      <p className="text-xs text-muted-foreground">
                        {friend.total_friends} friends
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Load More */}
      {hasMore && !loading && !searchQuery && (
        <div className="text-center">
          <Button 
            variant="outline" 
            onClick={() => setPage(prev => prev + 1)}
          >
            Load More
          </Button>
        </div>
      )}
    </div>
  );
}
