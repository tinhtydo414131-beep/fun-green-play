import { useState, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { ImageCropDialog } from "./ImageCropDialog";
import { withRetry, formatErrorMessage } from "@/utils/supabaseRetry";
import { uploadToR2 } from "@/utils/r2Upload";

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
  
  // Prevent double submission on mobile
  const isSubmittingRef = useRef(false);
  const lastSubmitTimeRef = useRef(0);

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

  const handleCropComplete = useCallback(async (croppedBlob: Blob) => {
    // Prevent double submission (mobile double-tap issue)
    const now = Date.now();
    if (isSubmittingRef.current || now - lastSubmitTimeRef.current < 1000) {
      console.log('Preventing double submission');
      return;
    }
    
    isSubmittingRef.current = true;
    lastSubmitTimeRef.current = now;

    try {
      setUploading(true);
      setCropDialogOpen(false);

      if (!user) {
        toast.error("Phiên đăng nhập đã hết. Vui lòng đăng nhập lại!");
        return;
      }

      // Create File from Blob for R2 upload
      const file = new File([croppedBlob], `avatar-${Date.now()}.jpg`, { type: 'image/jpeg' });

      // Upload to R2 (new uploads go to R2)
      const r2Result = await uploadToR2(file, 'avatars');
      
      let publicUrl: string;
      
      if (r2Result.success && r2Result.url) {
        publicUrl = r2Result.url;
        console.log('✅ Avatar uploaded to R2:', publicUrl);
      } else {
        // Fallback to Supabase Storage if R2 fails
        console.log('⚠️ R2 upload failed, falling back to Supabase Storage');
        const fileName = `${user.id}/${Date.now()}.jpg`;

        const uploadResult = await withRetry(
          async () => {
            const result = await supabase.storage
              .from('avatars')
              .upload(fileName, croppedBlob, { 
                upsert: true,
                contentType: 'image/jpeg'
              });
            return result;
          },
          { operationName: "Tải ảnh lên", maxRetries: 3 }
        );

        if (uploadResult.error) {
          throw uploadResult.error;
        }

        const { data: { publicUrl: supabaseUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName);
        
        publicUrl = supabaseUrl;
      }

      // Update profile with retry
      const updateResult = await withRetry(
        async () => {
          return supabase
            .from('profiles')
            .update({ avatar_url: publicUrl })
            .eq('id', user.id);
        },
        { operationName: "Cập nhật hồ sơ", maxRetries: 3 }
      );

      if (updateResult.error) {
        throw updateResult.error;
      }

      setAvatarUrl(publicUrl);
      onAvatarUpdate?.(publicUrl);
      toast.success("🎉 Đã cập nhật avatar!");
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(formatErrorMessage(error));
    } finally {
      setUploading(false);
      setSelectedImage(null);
      isSubmittingRef.current = false;
    }
  }, [user, onAvatarUpdate]);

  if (!user) return null;

  return (
    <>
      {/* Container lấp đầy parent hoàn toàn */}
      <div className="relative group w-full h-full">
        {/* Avatar image lấp đầy khung */}
        <div className="w-full h-full rounded-full overflow-hidden">
          {avatarUrl ? (
            <img 
              src={avatarUrl}
              alt="Avatar"
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-3xl font-bold">
              {user.email?.charAt(0).toUpperCase() || '?'}
            </div>
          )}
        </div>
        
        {/* Overlay khi hover */}
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
        
        {/* Text hướng dẫn */}
        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 whitespace-nowrap text-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
          <p className="text-xs text-muted-foreground">
            Click vào avatar để đổi ảnh
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
