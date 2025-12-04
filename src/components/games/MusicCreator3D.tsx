import { useState, useRef, useEffect, useCallback } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Text, OrbitControls, Environment, Float } from "@react-three/drei";
import * as THREE from "three";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RotateCcw, Play, Square, Music } from "lucide-react";

interface MusicCreator3DProps {
  level?: number;
  difficultyMultiplier?: number;
  onLevelComplete?: (score: number, stars: number) => void;
  onBack?: () => void;
}

interface Note {
  id: number;
  instrument: 'piano' | 'drum' | 'bell' | 'xylophone' | 'guitar';
  pitch: number;
  time: number;
  color: string;
}

interface Instrument3DProps {
  position: [number, number, number];
  type: string;
  color: string;
  isPlaying: boolean;
  onClick: () => void;
}

function PianoKey3D({ position, color, isPlaying, onClick }: Instrument3DProps) {
  const ref = useRef<THREE.Mesh>(null);
  
  useFrame(() => {
    if (ref.current) {
      ref.current.position.y = isPlaying ? position[1] - 0.1 : position[1];
      ref.current.scale.y = isPlaying ? 0.8 : 1;
    }
  });

  return (
    <mesh ref={ref} position={position} onClick={onClick}>
      <boxGeometry args={[0.4, 0.8, 0.3]} />
      <meshStandardMaterial color={isPlaying ? '#FFD700' : color} emissive={isPlaying ? color : '#000'} emissiveIntensity={isPlaying ? 0.5 : 0} />
    </mesh>
  );
}

function Drum3D({ position, color, isPlaying, onClick }: Instrument3DProps) {
  const ref = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (ref.current) {
      ref.current.scale.y = isPlaying ? 0.9 + Math.sin(state.clock.elapsedTime * 20) * 0.1 : 1;
    }
  });

  return (
    <group ref={ref} position={position} onClick={onClick}>
      {/* Drum body */}
      <mesh>
        <cylinderGeometry args={[0.5, 0.5, 0.6, 16]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Drum top */}
      <mesh position={[0, 0.31, 0]}>
        <cylinderGeometry args={[0.48, 0.48, 0.02, 16]} />
        <meshStandardMaterial color={isPlaying ? '#FFD700' : '#FFF8DC'} emissive={isPlaying ? '#FFD700' : '#000'} emissiveIntensity={isPlaying ? 0.8 : 0} />
      </mesh>
      {/* Rim */}
      <mesh position={[0, 0.3, 0]}>
        <torusGeometry args={[0.5, 0.03, 8, 32]} />
        <meshStandardMaterial color="#C0C0C0" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  );
}

function Bell3D({ position, color, isPlaying, onClick }: Instrument3DProps) {
  const ref = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (ref.current && isPlaying) {
      ref.current.rotation.z = Math.sin(state.clock.elapsedTime * 15) * 0.2;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.1} floatIntensity={0.3}>
      <group ref={ref} position={position} onClick={onClick}>
        {/* Bell body */}
        <mesh>
          <coneGeometry args={[0.4, 0.6, 16, 1, true]} />
          <meshStandardMaterial color={color} metalness={0.7} roughness={0.3} side={THREE.DoubleSide} emissive={isPlaying ? '#FFD700' : '#000'} emissiveIntensity={isPlaying ? 0.5 : 0} />
        </mesh>
        {/* Bell rim */}
        <mesh position={[0, -0.3, 0]}>
          <torusGeometry args={[0.4, 0.05, 8, 32]} />
          <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Clapper */}
        <mesh position={[0, -0.15, 0]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshStandardMaterial color="#4A4A4A" metalness={0.9} roughness={0.1} />
        </mesh>
      </group>
    </Float>
  );
}

function Xylophone3D({ position, color, isPlaying, onClick, pitch }: Instrument3DProps & { pitch: number }) {
  const ref = useRef<THREE.Mesh>(null);
  const width = 0.3 + pitch * 0.15;
  
  useFrame(() => {
    if (ref.current) {
      ref.current.position.y = isPlaying ? position[1] + 0.05 : position[1];
    }
  });

  return (
    <group position={position} onClick={onClick}>
      {/* Bar */}
      <mesh ref={ref}>
        <boxGeometry args={[width, 0.1, 0.4]} />
        <meshStandardMaterial color={color} emissive={isPlaying ? color : '#000'} emissiveIntensity={isPlaying ? 0.6 : 0} />
      </mesh>
      {/* Supports */}
      <mesh position={[-width / 3, -0.15, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.2, 8]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      <mesh position={[width / 3, -0.15, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.2, 8]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
    </group>
  );
}

function Guitar3D({ position, color, isPlaying, onClick }: Instrument3DProps) {
  const ref = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (ref.current && isPlaying) {
      ref.current.children.forEach((child, i) => {
        if (i > 1) {
          (child as THREE.Mesh).position.x = Math.sin(state.clock.elapsedTime * 30 + i) * 0.02;
        }
      });
    }
  });

  return (
    <group ref={ref} position={position} onClick={onClick} rotation={[0, 0, 0.3]}>
      {/* Body */}
      <mesh>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Neck */}
      <mesh position={[0, 0.8, 0]}>
        <boxGeometry args={[0.15, 1.2, 0.08]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      {/* Strings */}
      {[-0.04, -0.02, 0, 0.02, 0.04].map((x, i) => (
        <mesh key={i} position={[x, 0.4, 0.05]}>
          <cylinderGeometry args={[0.005, 0.005, 1.4, 8]} />
          <meshStandardMaterial color={isPlaying ? '#FFD700' : '#C0C0C0'} emissive={isPlaying ? '#FFD700' : '#000'} emissiveIntensity={isPlaying ? 0.8 : 0} />
        </mesh>
      ))}
      {/* Sound hole */}
      <mesh position={[0, 0, 0.26]}>
        <circleGeometry args={[0.15, 16]} />
        <meshStandardMaterial color="#2C1810" />
      </mesh>
    </group>
  );
}

function NoteParticle({ note, onComplete }: { note: Note; onComplete: () => void }) {
  const ref = useRef<THREE.Mesh>(null);
  const startTime = useRef(Date.now());
  
  useFrame(() => {
    if (ref.current) {
      const elapsed = (Date.now() - startTime.current) / 1000;
      ref.current.position.y += 0.03;
      ref.current.scale.setScalar(Math.max(0, 1 - elapsed));
      ref.current.rotation.z += 0.1;
      
      if (elapsed > 1) {
        onComplete();
      }
    }
  });

  const shapes: Record<string, JSX.Element> = {
    piano: <boxGeometry args={[0.2, 0.2, 0.2]} />,
    drum: <cylinderGeometry args={[0.15, 0.15, 0.1, 8]} />,
    bell: <coneGeometry args={[0.15, 0.25, 8]} />,
    xylophone: <boxGeometry args={[0.25, 0.08, 0.15]} />,
    guitar: <sphereGeometry args={[0.12, 8, 8]} />,
  };

  return (
    <mesh ref={ref} position={[note.pitch * 0.8 - 2, 2, 0]}>
      {shapes[note.instrument]}
      <meshStandardMaterial color={note.color} emissive={note.color} emissiveIntensity={0.5} />
    </mesh>
  );
}

function Stage() {
  return (
    <group>
      {/* Stage floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
        <planeGeometry args={[12, 8]} />
        <meshStandardMaterial color="#4A3728" />
      </mesh>
      {/* Stage back */}
      <mesh position={[0, 2, -3]}>
        <planeGeometry args={[12, 6]} />
        <meshStandardMaterial color="#2C1810" />
      </mesh>
      {/* Spotlights */}
      {[-3, 0, 3].map((x, i) => (
        <pointLight key={i} position={[x, 4, 2]} intensity={0.5} color={['#FF6B6B', '#FFD700', '#4ECDC4'][i]} />
      ))}
    </group>
  );
}

function GameScene({ 
  instruments, 
  playingNotes, 
  onPlayInstrument, 
  notes,
  onNoteComplete,
  score 
}: { 
  instruments: Array<{ type: string; position: [number, number, number]; color: string; pitch: number }>;
  playingNotes: Set<string>;
  onPlayInstrument: (type: string, pitch: number) => void;
  notes: Note[];
  onNoteComplete: (id: number) => void;
  score: number;
}) {
  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 10, 5]} intensity={0.8} />
      
      <Stage />
      
      {instruments.map((inst, i) => {
        const isPlaying = playingNotes.has(`${inst.type}-${inst.pitch}`);
        const props = {
          position: inst.position,
          color: inst.color,
          isPlaying,
          onClick: () => onPlayInstrument(inst.type, inst.pitch),
          type: inst.type,
        };
        
        switch (inst.type) {
          case 'piano': return <PianoKey3D key={i} {...props} />;
          case 'drum': return <Drum3D key={i} {...props} />;
          case 'bell': return <Bell3D key={i} {...props} />;
          case 'xylophone': return <Xylophone3D key={i} {...props} pitch={inst.pitch} />;
          case 'guitar': return <Guitar3D key={i} {...props} />;
          default: return null;
        }
      })}
      
      {notes.map((note) => (
        <NoteParticle key={note.id} note={note} onComplete={() => onNoteComplete(note.id)} />
      ))}
      
      <Text position={[0, 4, 0]} fontSize={0.5} color="#FFD700" anchorX="center">
        {`🎵 Score: ${score}`}
      </Text>
      
      <OrbitControls enablePan={false} minDistance={6} maxDistance={15} maxPolarAngle={Math.PI / 2} />
      <Environment preset="night" />
    </>
  );
}

const instrumentColors: Record<string, string[]> = {
  piano: ['#FFFFFF', '#1a1a1a', '#FFFFFF', '#1a1a1a', '#FFFFFF'],
  drum: ['#DC143C', '#4169E1', '#228B22', '#FFD700'],
  bell: ['#FFD700', '#C0C0C0', '#CD7F32'],
  xylophone: ['#FF6B6B', '#FF8C00', '#FFD700', '#32CD32', '#4169E1', '#9370DB'],
  guitar: ['#8B4513', '#D2691E', '#CD853F'],
};

export function MusicCreator3D({ level = 1, difficultyMultiplier = 1, onLevelComplete, onBack }: MusicCreator3DProps) {
  const [instruments, setInstruments] = useState<Array<{ type: string; position: [number, number, number]; color: string; pitch: number }>>([]);
  const [playingNotes, setPlayingNotes] = useState<Set<string>>(new Set());
  const [notes, setNotes] = useState<Note[]>([]);
  const [score, setScore] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedNotes, setRecordedNotes] = useState<Note[]>([]);
  const noteIdRef = useRef(0);

  const targetScore = Math.floor(200 * level * difficultyMultiplier);

  useEffect(() => {
    // Setup instruments based on level
    const newInstruments: Array<{ type: string; position: [number, number, number]; color: string; pitch: number }> = [];
    
    // Piano keys
    for (let i = 0; i < 5; i++) {
      newInstruments.push({
        type: 'piano',
        position: [-2.5 + i * 0.5, 0, 2],
        color: i % 2 === 0 ? '#FFFFFF' : '#1a1a1a',
        pitch: i,
      });
    }
    
    // Drums
    for (let i = 0; i < 3; i++) {
      const colors = instrumentColors.drum;
      newInstruments.push({
        type: 'drum',
        position: [-1.5 + i * 1.5, -0.2, 0],
        color: colors[i % colors.length],
        pitch: i,
      });
    }
    
    // Xylophone
    for (let i = 0; i < 6; i++) {
      const colors = instrumentColors.xylophone;
      newInstruments.push({
        type: 'xylophone',
        position: [-2.5 + i * 0.9, 0.5, -1.5],
        color: colors[i],
        pitch: i,
      });
    }
    
    // Bells
    for (let i = 0; i < 3; i++) {
      const colors = instrumentColors.bell;
      newInstruments.push({
        type: 'bell',
        position: [3 + i * 0.8, 1.5, 0],
        color: colors[i],
        pitch: i,
      });
    }
    
    // Guitar
    newInstruments.push({
      type: 'guitar',
      position: [-4, 0.5, 0],
      color: '#8B4513',
      pitch: 0,
    });
    
    setInstruments(newInstruments);
  }, [level]);

  const playSound = useCallback((type: string, pitch: number) => {
    // Create audio context and play note
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      const frequencies: Record<string, number[]> = {
        piano: [261.63, 293.66, 329.63, 349.23, 392.00],
        drum: [100, 150, 80],
        bell: [523.25, 659.25, 783.99],
        xylophone: [523.25, 587.33, 659.25, 698.46, 783.99, 880.00],
        guitar: [196.00],
      };
      
      const waveforms: Record<string, OscillatorType> = {
        piano: 'triangle',
        drum: 'square',
        bell: 'sine',
        xylophone: 'triangle',
        guitar: 'sawtooth',
      };
      
      oscillator.type = waveforms[type] || 'sine';
      oscillator.frequency.value = frequencies[type]?.[pitch] || 440;
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (e) {
      console.log('Audio not supported');
    }
  }, []);

  const handlePlayInstrument = useCallback((type: string, pitch: number) => {
    const key = `${type}-${pitch}`;
    
    // Visual feedback
    setPlayingNotes((prev) => new Set([...prev, key]));
    setTimeout(() => {
      setPlayingNotes((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    }, 200);
    
    // Play sound
    playSound(type, pitch);
    
    // Add note particle
    const instrument = instruments.find((i) => i.type === type && i.pitch === pitch);
    if (instrument) {
      const newNote: Note = {
        id: noteIdRef.current++,
        instrument: type as Note['instrument'],
        pitch,
        time: Date.now(),
        color: instrument.color,
      };
      setNotes((prev) => [...prev, newNote]);
      
      // Record if recording
      if (isRecording) {
        setRecordedNotes((prev) => [...prev, newNote]);
      }
    }
    
    // Add score
    const points = type === 'piano' ? 10 : type === 'xylophone' ? 15 : 8;
    const newScore = score + points;
    setScore(newScore);
    
    if (newScore >= targetScore) {
      const stars = newScore >= targetScore * 1.5 ? 3 : newScore >= targetScore * 1.2 ? 2 : 1;
      onLevelComplete?.(newScore, stars);
    }
  }, [instruments, isRecording, score, targetScore, onLevelComplete, playSound]);

  const handleNoteComplete = useCallback((id: number) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const handleReset = () => {
    setScore(0);
    setNotes([]);
    setRecordedNotes([]);
    setIsRecording(false);
  };

  return (
    <div className="relative w-full h-full min-h-[500px] bg-gradient-to-b from-indigo-900 via-purple-900 to-black rounded-xl overflow-hidden">
      {/* Header */}
      <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center">
        <Button variant="outline" size="sm" onClick={onBack} className="bg-white/20 backdrop-blur-sm text-white border-white/30">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        <div className="flex gap-3">
          <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full font-bold text-yellow-300">
            🎵 {score}/{targetScore}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsRecording(!isRecording)}
            className={`backdrop-blur-sm border-white/30 ${isRecording ? 'bg-red-500 text-white' : 'bg-white/20 text-white'}`}
          >
            {isRecording ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
        </div>
        <Button variant="outline" size="sm" onClick={handleReset} className="bg-white/20 backdrop-blur-sm text-white border-white/30">
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm">
        🎹 Click instruments to play music and earn points!
      </div>

      {/* 3D Canvas */}
      <Canvas camera={{ position: [0, 4, 8], fov: 50 }}>
        <GameScene
          instruments={instruments}
          playingNotes={playingNotes}
          onPlayInstrument={handlePlayInstrument}
          notes={notes}
          onNoteComplete={handleNoteComplete}
          score={score}
        />
      </Canvas>
    </div>
  );
}
