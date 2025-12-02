import { useEffect, useState } from "react";
import { useIsMobile, useIsLandscape } from "@/hooks/use-mobile";
import { Card } from "@/components/ui/card";
import { RotateCcw } from "lucide-react";

/**
 * Shows a prompt to rotate device to landscape for better gaming experience
 */
export const LandscapePrompt = () => {
  const isMobile = useIsMobile();
  const isLandscape = useIsLandscape();
  const [showPrompt, setShowPrompt] = useState(false);
  const [hasSeenPrompt, setHasSeenPrompt] = useState(false);

  useEffect(() => {
    // Only show prompt once per session
    const hasSeenKey = "landscape-prompt-seen";
    const seen = sessionStorage.getItem(hasSeenKey);
    
    if (!seen && isMobile && !isLandscape) {
      setShowPrompt(true);
      setHasSeenPrompt(true);
      sessionStorage.setItem(hasSeenKey, "true");
      
      // Auto-hide after 5 seconds
      const timer = setTimeout(() => {
        setShowPrompt(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [isMobile, isLandscape]);

  // Once user rotates to landscape, don't show again
  useEffect(() => {
    if (isLandscape && hasSeenPrompt) {
      setShowPrompt(false);
    }
  }, [isLandscape, hasSeenPrompt]);

  if (!showPrompt) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <Card className="mx-4 p-6 max-w-sm text-center space-y-4 bg-gradient-to-br from-primary/95 to-secondary/95 text-white border-0 shadow-2xl">
        <div className="flex justify-center">
          <RotateCcw className="h-16 w-16 animate-spin" style={{ animationDuration: "3s" }} />
        </div>
        <h3 className="text-xl font-fredoka font-bold">
          Rotate Your Device
        </h3>
        <p className="text-sm font-comic">
          For the best gaming experience, rotate your device to landscape mode! 🎮
        </p>
      </Card>
    </div>
  );
};
