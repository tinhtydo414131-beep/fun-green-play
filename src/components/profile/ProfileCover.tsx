import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, Crown, ImagePlus } from 'lucide-react';
import { AvatarUpload } from '@/components/AvatarUpload';
import { CoverCropModal } from '@/components/CoverCropModal';
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
  const [showCropModal, setShowCropModal] = useState(false);

  return (
    <>
      <div className="pt-16">
        {/* Cover Photo - Facebook style 820x312 aspect ratio */}
        <div className="relative h-48 md:h-72 lg:h-80 overflow-hidden group">
          {profile.cover_url ? (
            <img 
              src={profile.cover_url} 
              alt="Cover" 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-primary via-secondary to-accent flex items-center justify-center">
              {isOwnProfile && (
                <div className="flex flex-col items-center gap-2 text-white/80">
                  <ImagePlus className="w-12 h-12" />
                  <span className="text-sm font-medium">Thêm ảnh bìa</span>
                </div>
              )}
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          
          {isOwnProfile && (
            <Button 
              variant="secondary" 
              size="sm" 
              className="absolute bottom-4 right-4 gap-2 bg-background/90 hover:bg-background opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => setShowCropModal(true)}
            >
              <Camera className="w-4 h-4" />
              Chỉnh sửa ảnh bìa
            </Button>
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

      {/* Cover Crop Modal */}
      <CoverCropModal
        isOpen={showCropModal}
        onClose={() => setShowCropModal(false)}
        currentCoverUrl={profile.cover_url || null}
        userId={profile.id}
        onCoverUpdate={(url) => onProfileUpdate({ cover_url: url } as any)}
      />
    </>
  );
}
