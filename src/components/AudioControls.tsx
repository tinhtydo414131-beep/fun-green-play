import { Button } from "@/components/ui/button";
import { Volume2, VolumeX, Music } from "lucide-react";

interface AudioControlsProps {
  isMusicEnabled: boolean;
  isSoundEnabled: boolean;
  onToggleMusic: () => void;
  onToggleSound: () => void;
}

export const AudioControls = ({ 
  isMusicEnabled, 
  isSoundEnabled, 
  onToggleMusic, 
  onToggleSound 
}: AudioControlsProps) => {
  return (
    <div className="flex gap-2 items-center justify-center">
      <Button
        variant="outline"
        size="icon"
        onClick={onToggleMusic}
        className="relative"
        title={isMusicEnabled ? "Tắt nhạc nền" : "Bật nhạc nền"}
      >
        {isMusicEnabled ? (
          <Music className="h-5 w-5 text-white" />
        ) : (
          <Music className="h-5 w-5 text-white opacity-50" />
        )}
      </Button>
      
      <Button
        variant="outline"
        size="icon"
        onClick={onToggleSound}
        className="relative"
        title={isSoundEnabled ? "Tắt hiệu ứng âm thanh" : "Bật hiệu ứng âm thanh"}
      >
        {isSoundEnabled ? (
          <Volume2 className="h-5 w-5 text-white" />
        ) : (
          <VolumeX className="h-5 w-5 text-white opacity-50" />
        )}
      </Button>
    </div>
  );
};
