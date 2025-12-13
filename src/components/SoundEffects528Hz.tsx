import { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

interface SoundEffects528HzProps {
  autoPlay?: boolean;
}

// 528Hz is known as the "Love Frequency" or "Miracle Tone"
export const SoundEffects528Hz = ({ autoPlay = false }: SoundEffects528HzProps) => {
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [volume, setVolume] = useState(30);
  const [isMuted, setIsMuted] = useState(false);

  // Create 528Hz tone using Web Audio API
  const play528HzTone = () => {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;

    const audioContext = new AudioContext();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(528, audioContext.currentTime);
    
    gainNode.gain.setValueAtTime(isMuted ? 0 : volume / 100, audioContext.currentTime);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.start();
    
    // Gentle fade out after 2 seconds
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 2);
    oscillator.stop(audioContext.currentTime + 2);
  };

  const togglePlay = () => {
    if (!isPlaying) {
      play528HzTone();
    }
    setIsPlaying(!isPlaying);
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
    if (value[0] === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 p-3 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl border border-primary/20"
    >
      <motion.div
        animate={{ 
          scale: isPlaying ? [1, 1.1, 1] : 1,
          rotate: isPlaying ? [0, 5, -5, 0] : 0
        }}
        transition={{ duration: 2, repeat: isPlaying ? Infinity : 0 }}
      >
        <Music className="w-5 h-5 text-primary" />
      </motion.div>
      
      <Button
        variant="ghost"
        size="icon"
        onClick={togglePlay}
        className="h-8 w-8"
      >
        {isPlaying ? (
          <Pause className="w-4 h-4" />
        ) : (
          <Play className="w-4 h-4" />
        )}
      </Button>

      <div className="flex-1 max-w-[100px]">
        <Slider
          value={[isMuted ? 0 : volume]}
          onValueChange={handleVolumeChange}
          max={100}
          step={1}
          className="cursor-pointer"
        />
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsMuted(!isMuted)}
        className="h-8 w-8"
      >
        {isMuted ? (
          <VolumeX className="w-4 h-4" />
        ) : (
          <Volume2 className="w-4 h-4" />
        )}
      </Button>

      <span className="text-xs text-muted-foreground whitespace-nowrap">
        528Hz ✨
      </span>
    </motion.div>
  );
};

// Play bling sound effect
export const playBlingSound = () => {
  const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContext) return;

  const audioContext = new AudioContext();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(880, audioContext.currentTime); // A5
  oscillator.frequency.exponentialRampToValueAtTime(1760, audioContext.currentTime + 0.1); // A6
  
  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.start();
  oscillator.stop(audioContext.currentTime + 0.3);
};

// Play reward sound
export const playRewardSound = () => {
  const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContext) return;

  const audioContext = new AudioContext();
  
  // Play a quick ascending melody
  const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
  
  notes.forEach((freq, i) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
    
    gainNode.gain.setValueAtTime(0, audioContext.currentTime + i * 0.1);
    gainNode.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + i * 0.1 + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + i * 0.1 + 0.3);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.start(audioContext.currentTime + i * 0.1);
    oscillator.stop(audioContext.currentTime + i * 0.1 + 0.3);
  });
};

export default SoundEffects528Hz;
