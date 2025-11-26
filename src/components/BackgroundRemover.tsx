import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { removeBackground, loadImage } from "@/utils/removeBackground";
import camlyCoinOriginal from "@/assets/camly-coin.png";

export const BackgroundRemover = () => {
  const [processing, setProcessing] = useState(false);
  const [processedImage, setProcessedImage] = useState<string | null>(null);

  const handleRemoveBackground = async () => {
    setProcessing(true);
    toast.info("Đang xử lý ảnh, vui lòng đợi...");

    try {
      // Load the original image
      const response = await fetch(camlyCoinOriginal);
      const blob = await response.blob();
      const imageElement = await loadImage(blob);

      // Remove background
      const resultBlob = await removeBackground(imageElement);
      
      // Create URL for the processed image
      const url = URL.createObjectURL(resultBlob);
      setProcessedImage(url);

      // Download the processed image
      const link = document.createElement('a');
      link.href = url;
      link.download = 'camly-coin-no-bg.png';
      link.click();

      toast.success("✅ Đã xóa nền thành công! Ảnh đã được tải xuống.");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Lỗi khi xử lý ảnh. Vui lòng thử lại.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button
        onClick={handleRemoveBackground}
        disabled={processing}
        size="lg"
        className="font-bold"
      >
        {processing ? "Đang xử lý..." : "🎨 Xóa Nền CAMLY Coin"}
      </Button>
      
      {processedImage && (
        <div className="mt-4 p-4 bg-card border border-border rounded-lg">
          <p className="text-sm font-bold mb-2">Ảnh đã xử lý:</p>
          <img src={processedImage} alt="Processed" className="w-32 h-32 object-contain" />
        </div>
      )}
    </div>
  );
};
