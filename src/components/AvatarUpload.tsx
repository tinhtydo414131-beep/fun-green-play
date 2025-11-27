import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

interface AvatarUploadProps {
  currentAvatarUrl?: string | null;
  onAvatarUpdate?: (url: string) => void;
}

export const AvatarUpload = ({ currentAvatarUrl, onAvatarUpdate }: AvatarUploadProps) => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(currentAvatarUrl);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!user) {
        toast.error("Bạn cần đăng nhập để đổi avatar!");
        return;
      }

      if (!event.target.files || event.target.files.length === 0) {
        return;
      }

      const file = event.target.files[0];

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error("Vui lòng chọn file ảnh!");
        return;
      }

      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Ảnh không được vượt quá 2MB!");
        return;
      }

      setUploading(true);

      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      // Upload to storage
      const { error: uploadError, data } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) {
        throw updateError;
      }

      setAvatarUrl(publicUrl);
      onAvatarUpdate?.(publicUrl);
      toast.success("🎉 Đã cập nhật avatar!");
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || "Không thể upload avatar!");
    } finally {
      setUploading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative group">
        <Avatar className="w-24 h-24 border-4 border-primary/20">
          <AvatarImage src={avatarUrl || undefined} />
          <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white text-2xl">
            {user.email?.charAt(0).toUpperCase() || '?'}
          </AvatarFallback>
        </Avatar>
        
        <label
          htmlFor="avatar-upload"
          className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
        >
          {uploading ? (
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          ) : (
            <Camera className="w-8 h-8 text-white" />
          )}
        </label>
        
        <input
          id="avatar-upload"
          type="file"
          accept="image/*"
          onChange={handleUpload}
          disabled={uploading}
          className="hidden"
        />
      </div>

      <div className="text-center">
        <p className="text-sm font-comic text-muted-foreground">
          Click vào avatar để đổi ảnh
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          JPG, PNG hoặc GIF (tối đa 2MB)
        </p>
      </div>
    </div>
  );
};
