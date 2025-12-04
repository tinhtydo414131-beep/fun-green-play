import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { Users, Check } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface Friend {
  id: string;
  username: string;
  avatar_url: string | null;
}

interface CreateGroupChatModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  onGroupCreated: (roomId: string) => void;
}

export function CreateGroupChatModal({
  open,
  onOpenChange,
  userId,
  onGroupCreated,
}: CreateGroupChatModalProps) {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [groupName, setGroupName] = useState("");
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (open) {
      fetchFriends();
      setSelectedFriends([]);
      setGroupName("");
    }
  }, [open]);

  const fetchFriends = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("friends")
        .select("friend_id, profiles!friends_friend_id_fkey(id, username, avatar_url)")
        .eq("user_id", userId);

      if (error) throw error;

      const friendsList = data?.map((f: any) => ({
        id: f.profiles.id,
        username: f.profiles.username,
        avatar_url: f.profiles.avatar_url,
      })) || [];

      setFriends(friendsList);
    } catch (error) {
      console.error("Error fetching friends:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFriend = (friendId: string) => {
    setSelectedFriends(prev =>
      prev.includes(friendId)
        ? prev.filter(id => id !== friendId)
        : [...prev, friendId]
    );
  };

  const createGroupChat = async () => {
    if (selectedFriends.length < 2) {
      toast.error("Select at least 2 friends for a group chat");
      return;
    }

    if (!groupName.trim()) {
      toast.error("Please enter a group name");
      return;
    }

    setCreating(true);
    try {
      // Create the group chat room
      const { data: room, error: roomError } = await supabase
        .from("chat_rooms")
        .insert({
          room_type: "group",
          name: groupName.trim(),
          created_by: userId,
          is_group: true,
        })
        .select("id")
        .single();

      if (roomError) throw roomError;

      // Add all members including the creator
      const members = [userId, ...selectedFriends].map(memberId => ({
        room_id: room.id,
        user_id: memberId,
      }));

      const { error: membersError } = await supabase
        .from("chat_room_members")
        .insert(members);

      if (membersError) throw membersError;

      toast.success(`Group "${groupName}" created! 🎉`);
      onGroupCreated(room.id);
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error creating group:", error);
      toast.error("Failed to create group chat");
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-fredoka">
            <Users className="w-5 h-5 text-primary" />
            Create Group Chat
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Group Name</label>
            <Input
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Enter group name..."
              className="border-primary/20"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Select Friends ({selectedFriends.length} selected)
            </label>
            <ScrollArea className="h-[200px] border rounded-lg p-2">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">Loading friends...</p>
                </div>
              ) : friends.length > 0 ? (
                <div className="space-y-2">
                  {friends.map((friend) => (
                    <motion.button
                      key={friend.id}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => toggleFriend(friend.id)}
                      className={`w-full p-3 rounded-lg flex items-center gap-3 transition-all ${
                        selectedFriends.includes(friend.id)
                          ? "bg-primary/10 border-2 border-primary/30"
                          : "hover:bg-muted border-2 border-transparent"
                      }`}
                    >
                      <Avatar className="w-10 h-10 border-2 border-primary/20">
                        <AvatarImage src={friend.avatar_url || undefined} />
                        <AvatarFallback className="bg-primary/20 text-primary font-bold">
                          {friend.username[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium flex-1 text-left">
                        {friend.username}
                      </span>
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                          selectedFriends.includes(friend.id)
                            ? "bg-primary border-primary"
                            : "border-muted-foreground/30"
                        }`}
                      >
                        {selectedFriends.includes(friend.id) && (
                          <Check className="w-3 h-3 text-white" />
                        )}
                      </div>
                    </motion.button>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">No friends to add</p>
                </div>
              )}
            </ScrollArea>
          </div>

          <Button
            onClick={createGroupChat}
            disabled={creating || selectedFriends.length < 2 || !groupName.trim()}
            className="w-full bg-gradient-to-r from-primary to-secondary"
          >
            {creating ? "Creating..." : `Create Group (${selectedFriends.length + 1} members)`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
