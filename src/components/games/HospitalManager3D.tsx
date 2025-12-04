import React, { useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, Environment, OrbitControls, useProgress, Html, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RotateCcw } from 'lucide-react';

interface HospitalManager3DProps {
  level?: number;
  onLevelComplete?: (score: number, coins: number) => void;
  onBack?: () => void;
}

function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="flex flex-col items-center gap-2">
        <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-red-400 to-pink-500 transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
        <p className="text-white text-sm">Loading... {progress.toFixed(0)}%</p>
      </div>
    </Html>
  );
}

interface Patient {
  id: string;
  condition: 'checkup' | 'cold' | 'injury' | 'fever';
  position: number;
  progress: number;
  treated: boolean;
}

function PatientModel({ condition, progress }: { condition: string; progress: number }) {
  const ref = useRef<THREE.Group>(null);
  const color = condition === 'fever' ? '#ef4444' : condition === 'injury' ? '#f59e0b' : condition === 'cold' ? '#3b82f6' : '#22c55e';
  
  useFrame((state) => {
    if (ref.current && progress < 100) {
      ref.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.05;
    }
  });
  
  return (
    <group ref={ref}>
      {/* Body */}
      <mesh position={[0, 0.4, 0]}>
        <capsuleGeometry args={[0.2, 0.4, 8, 16]} />
        <meshStandardMaterial color="#60a5fa" />
      </mesh>
      {/* Head */}
      <mesh position={[0, 0.9, 0]}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial color="#fcd34d" />
      </mesh>
      {/* Condition indicator */}
      <mesh position={[0, 1.3, 0]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
      </mesh>
      {/* Progress bar */}
      <mesh position={[0, 1.5, 0]}>
        <boxGeometry args={[0.8, 0.1, 0.05]} />
        <meshStandardMaterial color="#374151" />
      </mesh>
      <mesh position={[-0.4 + (progress / 100) * 0.4, 1.5, 0.03]}>
        <boxGeometry args={[(progress / 100) * 0.8, 0.08, 0.05]} />
        <meshStandardMaterial color="#22c55e" />
      </mesh>
    </group>
  );
}

function Bed({ position, patient, onTreat }: { position: [number, number, number]; patient: Patient | null; onTreat: () => void }) {
  return (
    <group position={position} onClick={patient && !patient.treated ? onTreat : undefined}>
      {/* Bed frame */}
      <RoundedBox args={[1.5, 0.3, 0.8]} radius={0.05} position={[0, 0.15, 0]}>
        <meshStandardMaterial color="#f8fafc" />
      </RoundedBox>
      {/* Headboard */}
      <mesh position={[-0.7, 0.4, 0]}>
        <boxGeometry args={[0.1, 0.5, 0.8]} />
        <meshStandardMaterial color="#94a3b8" />
      </mesh>
      {/* Patient */}
      {patient && <group position={[0, 0.3, 0]}><PatientModel condition={patient.condition} progress={patient.progress} /></group>}
      {/* Empty indicator */}
      {!patient && <Text position={[0, 0.5, 0]} fontSize={0.15} color="#94a3b8">Empty</Text>}
    </group>
  );
}

function Room({ position, type, patients, onTreat }: { position: [number, number, number]; type: string; patients: Patient[]; onTreat: (id: string) => void }) {
  const bedPositions: [number, number, number][] = [[-1, 0, 0], [1, 0, 0]];
  
  return (
    <group position={position}>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[4, 3]} />
        <meshStandardMaterial color="#e0f2fe" />
      </mesh>
      {/* Walls */}
      <mesh position={[0, 1, -1.5]}>
        <boxGeometry args={[4, 2, 0.1]} />
        <meshStandardMaterial color="#f1f5f9" />
      </mesh>
      {/* Room label */}
      <Text position={[0, 1.8, -1.4]} fontSize={0.25} color="#1e40af">{type}</Text>
      {/* Beds */}
      {bedPositions.map((pos, i) => (
        <Bed key={i} position={pos} patient={patients[i] || null} onTreat={() => patients[i] && onTreat(patients[i].id)} />
      ))}
    </group>
  );
}

function GameScene({ rooms, onTreat, score }: { rooms: { type: string; patients: Patient[] }[]; onTreat: (id: string) => void; score: number }) {
  const roomPositions: [number, number, number][] = [[-5, 0, 0], [0, 0, 0], [5, 0, 0]];
  
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 15, 10]} intensity={0.8} castShadow />
      {/* Hospital floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[20, 10]} />
        <meshStandardMaterial color="#cbd5e1" />
      </mesh>
      {rooms.map((room, i) => (
        <Room key={i} position={roomPositions[i]} type={room.type} patients={room.patients} onTreat={onTreat} />
      ))}
      <Text position={[0, 4, 0]} fontSize={0.5} color="#1e40af">🏥 Hospital Score: {score}</Text>
      <OrbitControls enablePan={false} minDistance={8} maxDistance={18} maxPolarAngle={Math.PI / 2.2} />
      <Environment preset="city" />
    </>
  );
}

const ROOM_TYPES = ['Emergency', 'General', 'Pediatrics'];
const CONDITIONS: Patient['condition'][] = ['checkup', 'cold', 'injury', 'fever'];

export default function HospitalManager3D({ level = 1, onLevelComplete, onBack }: HospitalManager3DProps) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [score, setScore] = useState(0);
  const [treatedCount, setTreatedCount] = useState(0);
  const targetTreated = 10 + level * 5;
  const nextPatientId = useRef(0);

  // Spawn patients
  React.useEffect(() => {
    const interval = setInterval(() => {
      if (patients.filter(p => !p.treated).length < 6) {
        const condition = CONDITIONS[Math.floor(Math.random() * CONDITIONS.length)];
        setPatients(prev => [...prev, {
          id: `patient-${nextPatientId.current++}`,
          condition,
          position: Math.floor(Math.random() * 6),
          progress: 0,
          treated: false
        }]);
      }
    }, 3000 - level * 200);
    return () => clearInterval(interval);
  }, [level, patients]);

  // Progress treatment
  React.useEffect(() => {
    const interval = setInterval(() => {
      setPatients(prev => prev.map(p => {
        if (p.progress > 0 && p.progress < 100 && !p.treated) {
          const newProgress = Math.min(100, p.progress + 5);
          if (newProgress >= 100) {
            setScore(s => s + 50);
            setTreatedCount(c => c + 1);
            return { ...p, progress: 100, treated: true };
          }
          return { ...p, progress: newProgress };
        }
        return p;
      }).filter(p => !p.treated || p.progress < 100));
    }, 200);
    return () => clearInterval(interval);
  }, []);

  React.useEffect(() => {
    if (treatedCount >= targetTreated && onLevelComplete) {
      onLevelComplete(score, Math.floor(score / 20));
    }
  }, [treatedCount, targetTreated, score, onLevelComplete]);

  const handleTreat = (id: string) => {
    setPatients(prev => prev.map(p => p.id === id && p.progress === 0 ? { ...p, progress: 1 } : p));
  };

  const rooms = ROOM_TYPES.map((type, i) => ({
    type,
    patients: patients.filter(p => !p.treated && Math.floor(p.position / 2) === i).slice(0, 2)
  }));

  const resetGame = () => {
    setPatients([]);
    setScore(0);
    setTreatedCount(0);
    nextPatientId.current = 0;
  };

  return (
    <div className="relative w-full h-screen bg-gradient-to-b from-blue-200 to-blue-400">
      <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center">
        <Button variant="outline" size="sm" onClick={onBack} className="bg-white/80"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
        <div className="flex gap-2">
          <span className="bg-white/80 rounded-full px-4 py-2 font-bold">Level {level}</span>
          <span className="bg-green-500/80 text-white rounded-full px-4 py-2 font-bold">Treated: {treatedCount}/{targetTreated}</span>
          <span className="bg-yellow-500/80 text-white rounded-full px-4 py-2 font-bold">Score: {score}</span>
        </div>
        <Button variant="outline" size="sm" onClick={resetGame} className="bg-white/80"><RotateCcw className="w-4 h-4" /></Button>
      </div>
      <Canvas camera={{ position: [0, 8, 12], fov: 50 }} shadows>
        <React.Suspense fallback={<Loader />}>
          <GameScene rooms={rooms} onTreat={handleTreat} score={score} />
        </React.Suspense>
      </Canvas>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 bg-white/80 rounded-xl px-4 py-2 text-sm">
        Click on patients to start treatment!
      </div>
      {treatedCount >= targetTreated && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20">
          <div className="bg-white rounded-2xl p-8 text-center">
            <h2 className="text-3xl font-bold text-green-600 mb-4">🎉 Level Complete!</h2>
            <p className="text-gray-600 mb-2">Patients treated: {treatedCount}</p>
            <p className="text-yellow-500 font-bold mb-4">+{Math.floor(score / 20)} coins</p>
            <Button onClick={onBack}>Continue</Button>
          </div>
        </div>
      )}
    </div>
  );
}
