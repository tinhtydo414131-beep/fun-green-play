import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { ImageCropDialog } from "./ImageCropDialog";

interface AvatarUploadProps {
  currentAvatarUrl?: string | null;
  onAvatarUpdate?: (url: string) => void;
}

export const AvatarUpload = ({ currentAvatarUrl, onAvatarUpdate }: AvatarUploadProps) => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(currentAvatarUrl);
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
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

    // Validate file size (max 5MB before crop)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ảnh không được vượt quá 5MB!");
      return;
    }

    // Create preview URL
    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
      setCropDialogOpen(true);
    };
    reader.readAsDataURL(file);

    // Reset input
    event.target.value = '';
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    try {
      setUploading(true);
      setCropDialogOpen(false);

      if (!user) return;

      // Create unique filename
      const fileName = `${user.id}/${Date.now()}.jpg`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, croppedBlob, { 
          upsert: true,
          contentType: 'image/jpeg'
        });

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
      setSelectedImage(null);
    }
  };

  if (!user) return null;

  return (
    <>
      <div className="flex flex-col items-center gap-4">
      <div className="relative group">
          <Avatar className="w-32 h-32 border-[3px] border-orange-400 ring-2 ring-orange-200 shadow-lg">
            <AvatarImage 
              src={avatarUrl || undefined}
              loading="lazy"
              decoding="async"
              className="object-cover"
            />
            <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white text-3xl font-bold">
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
            onChange={handleFileSelect}
            disabled={uploading}
            className="hidden"
          />
        </div>

        <div className="text-center">
          <p className="text-sm font-comic text-muted-foreground">
            Click vào avatar để đổi ảnh
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            JPG, PNG hoặc GIF (tối đa 5MB)
          </p>
        </div>
      </div>

      {selectedImage && (
        <ImageCropDialog
          open={cropDialogOpen}
          imageUrl={selectedImage}
          onCropComplete={handleCropComplete}
          onClose={() => {
            setCropDialogOpen(false);
            setSelectedImage(null);
          }}
        />
      )}
    </>
  );
};
