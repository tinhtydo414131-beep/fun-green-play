import { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Video, Image as ImageIcon, Smile, X, Loader2,
  Globe, Lock, Users as UsersIcon
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CreatePostCardProps {
  profile: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
  onPostCreated: (post: any) => void;
}

export function CreatePostCard({ profile, onPostCreated }: CreatePostCardProps) {
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [privacy, setPrivacy] = useState('public');
  const [feeling, setFeeling] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [posting, setPosting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const feelings = ['😊 happy', '😢 sad', '😍 loved', '🎉 excited', '😤 angry', '🤔 thoughtful'];

  const handleImageSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image must be less than 10MB');
      return;
    }

    setImageFile(file);
    setImageUrl(URL.createObjectURL(file));
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return null;

    setUploading(true);
    try {
      const fileExt = imageFile.name.split('.').pop();
      const filePath = `${profile.id}/posts/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, imageFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!content.trim() && !imageFile) {
      toast.error('Please write something or add a photo');
      return;
    }

    setPosting(true);
    try {
      let uploadedImageUrl = null;
      if (imageFile) {
        uploadedImageUrl = await uploadImage();
      }

      const { data, error } = await supabase
        .from('posts')
        .insert({
          user_id: profile.id,
          content: content.trim(),
          image_url: uploadedImageUrl,
          privacy,
          feeling: feeling || null,
        })
        .select()
        .single();

      if (error) throw error;

      // Add user info to the post
      const postWithUser = {
        ...data,
        user: {
          username: profile.username,
          avatar_url: profile.avatar_url,
        }
      };

      onPostCreated(postWithUser);
      
      // Reset form
      setContent('');
      setImageUrl(null);
      setImageFile(null);
      setFeeling('');
      setIsExpanded(false);
      
      toast.success('Post created!');
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Failed to create post');
    } finally {
      setPosting(false);
    }
  };

  const removeImage = () => {
    setImageUrl(null);
    setImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card className="shadow-sm">
      <CardContent className="p-4">
        <div className="flex gap-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={profile.avatar_url || ''} />
            <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white">
              {profile.username?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          {isExpanded ? (
            <div className="flex-1 space-y-3">
              <Textarea
                placeholder={`What's on your mind, ${profile.username?.split(' ')[0]}?`}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[100px] resize-none"
                autoFocus
              />

              {/* Image Preview */}
              <AnimatePresence>
                {imageUrl && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="relative"
                  >
                    <img 
                      src={imageUrl} 
                      alt="Preview" 
                      className="w-full max-h-60 object-cover rounded-lg"
                    />
                    <Button
                      variant="secondary"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={removeImage}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Feeling Selector */}
              {feeling && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Feeling</span>
                  <span className="font-medium">{feeling}</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 px-2"
                    onClick={() => setFeeling('')}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              )}

              {/* Privacy & Post Button */}
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <Select value={privacy} onValueChange={setPrivacy}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        <span>Public</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="friends">
                      <div className="flex items-center gap-2">
                        <UsersIcon className="w-4 h-4" />
                        <span>Friends</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="private">
                      <div className="flex items-center gap-2">
                        <Lock className="w-4 h-4" />
                        <span>Only me</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    onClick={() => setIsExpanded(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSubmit}
                    disabled={posting || uploading || (!content.trim() && !imageFile)}
                  >
                    {posting || uploading ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : null}
                    Post
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <Input
              placeholder={`What's on your mind, ${profile.username?.split(' ')[0]}?`}
              className="flex-1 rounded-full bg-muted border-0 cursor-pointer"
              onClick={() => setIsExpanded(true)}
              readOnly
            />
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-around mt-3 pt-3 border-t border-border">
          <Button 
            variant="ghost" 
            className="flex-1 gap-2 text-red-500 hover:bg-red-500/10"
            onClick={() => toast.info('Video feature coming soon!')}
          >
            <Video className="w-5 h-5" />
            <span className="hidden sm:inline">Live Video</span>
          </Button>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />
          <Button 
            variant="ghost" 
            className="flex-1 gap-2 text-green-500 hover:bg-green-500/10"
            onClick={() => {
              setIsExpanded(true);
              fileInputRef.current?.click();
            }}
          >
            <ImageIcon className="w-5 h-5" />
            <span className="hidden sm:inline">Photo</span>
          </Button>
          
          <Button 
            variant="ghost" 
            className="flex-1 gap-2 text-yellow-500 hover:bg-yellow-500/10"
            onClick={() => {
              setIsExpanded(true);
              const randomFeeling = feelings[Math.floor(Math.random() * feelings.length)];
              setFeeling(randomFeeling);
            }}
          >
            <Smile className="w-5 h-5" />
            <span className="hidden sm:inline">Feeling</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
