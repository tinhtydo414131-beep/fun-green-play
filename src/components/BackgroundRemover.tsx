import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { removeBackground, loadImage } from "@/utils/removeBackground";
import camlyCoinOriginal from "@/assets/camly-coin.png";

const STORAGE_KEY = "camly-coin-processed";

export const BackgroundRemover = ({ onImageProcessed }: { onImageProcessed?: (imageUrl: string) => void }) => {
  const [processing, setProcessing] = useState(false);
  const [processedImage, setProcessedImage] = useState<string | null>(null);

  // Check if we have a processed image in localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setProcessedImage(stored);
      onImageProcessed?.(stored);
    }
  }, [onImageProcessed]);

  const handleRemoveBackground = async () => {
    setProcessing(true);
    toast.info("Đang xử lý ảnh, vui lòng đợi... Quá trình này có thể mất 30-60 giây.");

    try {
      // Load the original image
      const response = await fetch(camlyCoinOriginal);
      const blob = await response.blob();
      const imageElement = await loadImage(blob);

      // Remove background
      const resultBlob = await removeBackground(imageElement);
      
      // Convert blob to base64 for storage
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result as string;
        
        // Store in localStorage
        localStorage.setItem(STORAGE_KEY, base64data);
        setProcessedImage(base64data);
        
        // Notify parent component
        onImageProcessed?.(base64data);

        // Also download for manual replacement
        const link = document.createElement('a');
        link.href = base64data;
        link.download = 'camly-coin.png';
        link.click();

        toast.success("✅ Đã xóa nền thành công! Ảnh đã được lưu và tải xuống. Tải lại trang để thấy thay đổi.");
      };
      reader.readAsDataURL(resultBlob);

    } catch (error) {
      console.error("Error:", error);
      toast.error("Lỗi khi xử lý ảnh. Vui lòng thử lại.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      <Button
        onClick={handleRemoveBackground}
        disabled={processing}
        size="lg"
        className="font-bold w-full"
      >
        {processing ? "Đang xử lý..." : "🎨 Xóa Nền CAMLY Coin"}
      </Button>
      
      {processedImage && (
        <div className="p-4 bg-card border-2 border-primary rounded-lg shadow-lg">
          <p className="text-sm font-bold mb-2 text-center">✅ Ảnh đã xử lý:</p>
          <img src={processedImage} alt="Processed" className="w-32 h-32 object-contain mx-auto bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg p-2" />
          <Button
            onClick={() => {
              localStorage.removeItem(STORAGE_KEY);
              setProcessedImage(null);
              toast.info("Đã xóa ảnh đã xử lý. Tải lại trang để dùng ảnh gốc.");
            }}
            variant="outline"
            size="sm"
            className="w-full mt-2"
          >
            Dùng lại ảnh gốc
          </Button>
        </div>
      )}
    </div>
  );
};
