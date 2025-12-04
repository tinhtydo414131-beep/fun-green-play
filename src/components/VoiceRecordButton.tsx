import { useState } from 'react';
import { Mic, Square, X, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useVoiceRecorder } from '@/hooks/useVoiceRecorder';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface VoiceRecordButtonProps {
  onSendVoice: (audioUrl: string, duration: number) => void;
  disabled?: boolean;
}

export const VoiceRecordButton = ({ onSendVoice, disabled }: VoiceRecordButtonProps) => {
  const [pendingAudio, setPendingAudio] = useState<{ url: string; duration: number } | null>(null);
  
  const { 
    isRecording, 
    isUploading, 
    formattedDuration, 
    startRecording, 
    stopRecording, 
    cancelRecording 
  } = useVoiceRecorder({
    maxDuration: 60,
    onRecordingComplete: (url, duration) => {
      setPendingAudio({ url, duration });
    }
  });

  const handleSend = () => {
    if (pendingAudio) {
      onSendVoice(pendingAudio.url, pendingAudio.duration);
      setPendingAudio(null);
    }
  };

  const handleCancel = () => {
    setPendingAudio(null);
  };

  if (isUploading) {
    return (
      <Button variant="ghost" size="icon" disabled className="h-10 w-10">
        <Loader2 className="h-5 w-5 animate-spin" />
      </Button>
    );
  }

  if (pendingAudio) {
    return (
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-10 w-10 text-destructive"
          onClick={handleCancel}
        >
          <X className="h-5 w-5" />
        </Button>
        <Button 
          variant="default" 
          size="icon" 
          className="h-10 w-10"
          onClick={handleSend}
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    );
  }

  if (isRecording) {
    return (
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-10 w-10 text-destructive"
          onClick={cancelRecording}
        >
          <X className="h-5 w-5" />
        </Button>
        
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 px-3 py-1 bg-destructive/10 rounded-full"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="w-2 h-2 bg-destructive rounded-full"
            />
            <span className="text-sm font-medium text-destructive">
              {formattedDuration}
            </span>
          </motion.div>
        </AnimatePresence>
        
        <Button 
          variant="default" 
          size="icon" 
          className="h-10 w-10 bg-destructive hover:bg-destructive/80"
          onClick={stopRecording}
        >
          <Square className="h-4 w-4 fill-current" />
        </Button>
      </div>
    );
  }

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      className={cn(
        "h-10 w-10 transition-colors",
        disabled && "opacity-50"
      )}
      onClick={startRecording}
      disabled={disabled}
    >
      <Mic className="h-5 w-5" />
    </Button>
  );
};
