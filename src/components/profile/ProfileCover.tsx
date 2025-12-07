import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Camera, Crown, Loader2 } from 'lucide-react';
import { AvatarUpload } from '@/components/AvatarUpload';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

interface ProfileCoverProps {
  profile: {
    id: string;
    username: string;
    avatar_url: string | null;
    cover_url?: string | null;
    total_friends: number;
  };
  userRank: number;
  isOwnProfile?: boolean;
  onProfileUpdate: (updates: Partial<ProfileCoverProps['profile']>) => void;
}

export function ProfileCover({ profile, userRank, isOwnProfile = true, onProfileUpdate }: ProfileCoverProps) {
  const [uploading, setUploading] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const handleCoverUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${profile.id}/cover-${Date.now()}.${fileExt}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ cover_url: publicUrl })
        .eq('id', profile.id);

      if (updateError) throw updateError;

      onProfileUpdate({ cover_url: publicUrl } as any);
      toast.success('Cover photo updated!');
    } catch (error: any) {
      console.error('Error uploading cover:', error);
      toast.error('Failed to upload cover photo');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="pt-16">
      {/* Cover Photo - Facebook style 820x312 aspect ratio */}
      <div className="relative h-48 md:h-72 lg:h-80 overflow-hidden">
        {profile.cover_url ? (
          <img 
            src={profile.cover_url} 
            alt="Cover" 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-primary via-secondary to-accent" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        
        {isOwnProfile && (
          <>
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              onChange={handleCoverUpload}
              className="hidden"
            />
            <Button 
              variant="secondary" 
              size="sm" 
              className="absolute bottom-4 right-4 gap-2 bg-background/90 hover:bg-background"
              onClick={() => coverInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Camera className="w-4 h-4" />
              )}
              Edit Cover
            </Button>
          </>
        )}
      </div>

      {/* Profile Info Bar */}
      <div className="max-w-6xl mx-auto px-4">
        <div className="relative flex flex-col md:flex-row items-center md:items-end gap-4 -mt-16 md:-mt-20 pb-4 border-b border-border">
          {/* Avatar */}
          <motion.div 
            className="relative"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-background shadow-xl overflow-hidden bg-gradient-to-br from-primary to-secondary">
              {isOwnProfile ? (
                <div className="w-full h-full">
                  <AvatarUpload 
                    currentAvatarUrl={profile.avatar_url}
                    onAvatarUpdate={(url) => onProfileUpdate({ avatar_url: url })}
                  />
                </div>
              ) : profile.avatar_url ? (
                <img 
                  src={profile.avatar_url} 
                  alt={profile.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-white">
                  {profile.username?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            {userRank <= 3 && userRank > 0 && (
              <motion.div 
                className="absolute -bottom-1 -right-1 w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg border-2 border-background"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: 'spring' }}
              >
                <Crown className="w-5 h-5 text-white" />
              </motion.div>
            )}
          </motion.div>

          {/* Name & Stats */}
          <div className="flex-1 text-center md:text-left md:pb-4">
            <motion.h1 
              className="text-2xl md:text-3xl font-bold text-foreground"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              {profile.username}
            </motion.h1>
            <motion.p 
              className="text-muted-foreground"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {profile.total_friends} friends · Rank #{userRank}
            </motion.p>
          </div>
        </div>
      </div>
    </div>
  );
}
