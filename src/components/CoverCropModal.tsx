import { useState, useCallback } from 'react';
import Cropper, { Area, Point } from 'react-easy-crop';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { 
  ZoomIn, 
  ZoomOut, 
  X, 
  Upload, 
  Loader2,
  Move,
  ImagePlus
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface CoverCropModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCoverUrl: string | null;
  userId: string;
  onCoverUpdate: (url: string) => void;
}

// Facebook cover aspect ratio: 820:312 ≈ 2.628
const COVER_ASPECT = 820 / 312;
const OUTPUT_WIDTH = 1640; // 2x for retina
const OUTPUT_HEIGHT = 624;

export function CoverCropModal({
  isOpen,
  onClose,
  currentCoverUrl,
  userId,
  onCoverUpdate
}: CoverCropModalProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(currentCoverUrl);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Chỉ chấp nhận file JPG, PNG hoặc WebP');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Ảnh phải nhỏ hơn 10MB');
      return;
    }

    // Read file as data URL
    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result as string);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
    };
    reader.readAsDataURL(file);
  };

  const createCroppedImage = async (): Promise<Blob | null> => {
    if (!imageSrc || !croppedAreaPixels) return null;

    const image = new Image();
    image.src = imageSrc;
    
    await new Promise((resolve) => {
      image.onload = resolve;
    });

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    canvas.width = OUTPUT_WIDTH;
    canvas.height = OUTPUT_HEIGHT;

    ctx.drawImage(
      image,
      croppedAreaPixels.x,
      croppedAreaPixels.y,
      croppedAreaPixels.width,
      croppedAreaPixels.height,
      0,
      0,
      OUTPUT_WIDTH,
      OUTPUT_HEIGHT
    );

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => resolve(blob),
        'image/jpeg',
        0.9
      );
    });
  };

  const handleSave = async () => {
    if (!imageSrc || !croppedAreaPixels) {
      toast.error('Vui lòng chọn ảnh trước');
      return;
    }

    setUploading(true);
    try {
      const croppedBlob = await createCroppedImage();
      if (!croppedBlob) throw new Error('Failed to crop image');

      const filePath = `${userId}/cover-${Date.now()}.jpg`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, croppedBlob, { 
          upsert: true,
          contentType: 'image/jpeg'
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ cover_url: publicUrl })
        .eq('id', userId);

      if (updateError) throw updateError;

      onCoverUpdate(publicUrl);
      toast.success('Đã cập nhật ảnh bìa!');
      onClose();
    } catch (error: any) {
      console.error('Error saving cover:', error);
      toast.error('Không thể lưu ảnh bìa. Vui lòng thử lại.');
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setImageSrc(currentCoverUrl);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-4xl w-[95vw] h-[90vh] p-0 bg-background/95 backdrop-blur-xl border-border overflow-hidden">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card/50">
            <h2 className="text-lg font-semibold text-foreground">Chỉnh sửa ảnh bìa</h2>
            <Button variant="ghost" size="icon" onClick={handleClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Main Content */}
          <div className="flex-1 relative overflow-hidden bg-black/90">
            <AnimatePresence mode="wait">
              {imageSrc ? (
                <motion.div
                  key="cropper"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0"
                >
                  <Cropper
                    image={imageSrc}
                    crop={crop}
                    zoom={zoom}
                    aspect={COVER_ASPECT}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={onCropComplete}
                    onInteractionStart={() => setIsDragging(true)}
                    onInteractionEnd={() => setIsDragging(false)}
                    showGrid
                    classes={{
                      containerClassName: 'rounded-none',
                      cropAreaClassName: 'border-2 border-primary/50'
                    }}
                    style={{
                      cropAreaStyle: {
                        boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.7)'
                      }
                    }}
                  />
                  
                  {/* Drag indicator */}
                  <AnimatePresence>
                    {isDragging && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full flex items-center gap-2 pointer-events-none"
                      >
                        <Move className="w-4 h-4" />
                        <span className="text-sm">Kéo để di chuyển</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ) : (
                <motion.div
                  key="upload"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="absolute inset-0 flex flex-col items-center justify-center"
                >
                  <label 
                    htmlFor="cover-upload"
                    className="cursor-pointer group"
                  >
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mb-4 group-hover:from-primary/30 group-hover:to-secondary/30 transition-colors">
                      <ImagePlus className="w-16 h-16 text-primary/70 group-hover:text-primary transition-colors" />
                    </div>
                    <p className="text-lg font-medium text-foreground mb-2 text-center">
                      Chọn ảnh bìa
                    </p>
                    <p className="text-sm text-muted-foreground text-center">
                      JPG, PNG hoặc WebP (tối đa 10MB)
                    </p>
                  </label>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Controls */}
          <div className="px-4 py-4 border-t border-border bg-card/50 space-y-4">
            {/* Zoom Control */}
            {imageSrc && (
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setZoom(Math.max(1, zoom - 0.1))}
                  disabled={zoom <= 1}
                >
                  <ZoomOut className="w-4 h-4" />
                </Button>
                
                <div className="flex-1">
                  <Slider
                    value={[zoom]}
                    min={1}
                    max={3}
                    step={0.01}
                    onValueChange={([value]) => setZoom(value)}
                    className="w-full"
                  />
                </div>
                
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setZoom(Math.min(3, zoom + 0.1))}
                  disabled={zoom >= 3}
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
                
                <span className="text-sm text-muted-foreground w-14 text-center">
                  {Math.round(zoom * 100)}%
                </span>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between gap-3">
              <div>
                <input
                  id="cover-upload"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  onClick={() => document.getElementById('cover-upload')?.click()}
                  className="gap-2"
                >
                  <Upload className="w-4 h-4" />
                  {imageSrc ? 'Chọn ảnh khác' : 'Tải ảnh lên'}
                </Button>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={handleClose}>
                  Hủy
                </Button>
                <Button 
                  onClick={handleSave}
                  disabled={!imageSrc || uploading}
                  className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 gap-2 min-w-[120px]"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Đang lưu...
                    </>
                  ) : (
                    'Lưu ảnh bìa'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
