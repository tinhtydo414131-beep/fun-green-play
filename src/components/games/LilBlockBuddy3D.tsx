import React, { useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, Environment, OrbitControls, useProgress, Html, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RotateCcw } from 'lucide-react';

interface LilBlockBuddy3DProps {
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
          <div className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
        <p className="text-white text-sm">Loading... {progress.toFixed(0)}%</p>
      </div>
    </Html>
  );
}

interface Block {
  id: string;
  color: string;
  position: [number, number, number];
  shape: 'cube' | 'cylinder' | 'cone' | 'sphere';
}

const COLORS = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899'];
const SHAPES: Block['shape'][] = ['cube', 'cylinder', 'cone', 'sphere'];

function BlockModel({ shape, color, isSelected }: { shape: string; color: string; isSelected: boolean }) {
  const ref = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (ref.current && isSelected) {
      ref.current.rotation.y = state.clock.elapsedTime * 2;
      ref.current.position.y = 0.5 + Math.sin(state.clock.elapsedTime * 3) * 0.1;
    }
  });

  const renderShape = () => {
    switch (shape) {
      case 'cube':
        return <boxGeometry args={[1, 1, 1]} />;
      case 'cylinder':
        return <cylinderGeometry args={[0.5, 0.5, 1, 16]} />;
      case 'cone':
        return <coneGeometry args={[0.5, 1, 16]} />;
      case 'sphere':
        return <sphereGeometry args={[0.5, 16, 16]} />;
      default:
        return <boxGeometry args={[1, 1, 1]} />;
    }
  };

  return (
    <mesh ref={ref} position={[0, 0.5, 0]} castShadow>
      {renderShape()}
      <meshStandardMaterial color={color} metalness={0.3} roughness={0.4} />
    </mesh>
  );
}

function Buddy({ happiness }: { happiness: number }) {
  const ref = useRef<THREE.Group>(null);
  const eyeRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (ref.current) {
      ref.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.1;
      if (happiness > 70) {
        ref.current.rotation.y = Math.sin(state.clock.elapsedTime) * 0.2;
      }
    }
    if (eyeRef.current) {
      eyeRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.3;
    }
  });

  const mouthCurve = happiness > 50 ? 0.3 : happiness > 30 ? 0 : -0.2;

  return (
    <group ref={ref} position={[0, 0, 4]}>
      {/* Body */}
      <mesh position={[0, 1, 0]}>
        <capsuleGeometry args={[0.6, 0.8, 8, 16]} />
        <meshStandardMaterial color="#60a5fa" />
      </mesh>
      {/* Face */}
      <group ref={eyeRef} position={[0, 1.3, 0.5]}>
        {/* Eyes */}
        <mesh position={[-0.2, 0.1, 0]}>
          <sphereGeometry args={[0.12, 8, 8]} />
          <meshStandardMaterial color="white" />
        </mesh>
        <mesh position={[-0.2, 0.1, 0.08]}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshStandardMaterial color="#1f2937" />
        </mesh>
        <mesh position={[0.2, 0.1, 0]}>
          <sphereGeometry args={[0.12, 8, 8]} />
          <meshStandardMaterial color="white" />
        </mesh>
        <mesh position={[0.2, 0.1, 0.08]}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshStandardMaterial color="#1f2937" />
        </mesh>
      </group>
      {/* Mouth */}
      <mesh position={[0, 1.0, 0.55]} rotation={[mouthCurve, 0, 0]}>
        <torusGeometry args={[0.15, 0.03, 8, 16, Math.PI]} />
        <meshStandardMaterial color="#1f2937" />
      </mesh>
      {/* Arms */}
      <mesh position={[-0.7, 1, 0]} rotation={[0, 0, -0.3]}>
        <capsuleGeometry args={[0.12, 0.4, 4, 8]} />
        <meshStandardMaterial color="#60a5fa" />
      </mesh>
      <mesh position={[0.7, 1, 0]} rotation={[0, 0, 0.3]}>
        <capsuleGeometry args={[0.12, 0.4, 4, 8]} />
        <meshStandardMaterial color="#60a5fa" />
      </mesh>
    </group>
  );
}

function BuildingArea({ blocks }: { blocks: Block[] }) {
  return (
    <group position={[0, 0, 0]}>
      {/* Building platform */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <boxGeometry args={[8, 8, 0.2]} />
        <meshStandardMaterial color="#e0f2fe" />
      </mesh>
      {/* Grid lines */}
      {[-3, -2, -1, 0, 1, 2, 3].map(i => (
        <React.Fragment key={i}>
          <mesh position={[i, 0.01, 0]}>
            <boxGeometry args={[0.02, 0.01, 8]} />
            <meshStandardMaterial color="#94a3b8" />
          </mesh>
          <mesh position={[0, 0.01, i]}>
            <boxGeometry args={[8, 0.01, 0.02]} />
            <meshStandardMaterial color="#94a3b8" />
          </mesh>
        </React.Fragment>
      ))}
      {/* Placed blocks */}
      {blocks.map(block => (
        <group key={block.id} position={block.position}>
          <BlockModel shape={block.shape} color={block.color} isSelected={false} />
        </group>
      ))}
    </group>
  );
}

function GameScene({ blocks, happiness, score }: { blocks: Block[]; happiness: number; score: number }) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 10, 5]} intensity={0.8} castShadow />
      <pointLight position={[-5, 5, 5]} intensity={0.3} color="#60a5fa" />
      <BuildingArea blocks={blocks} />
      <Buddy happiness={happiness} />
      <Text position={[0, 5, 0]} fontSize={0.5} color="#3b82f6">🧱 Blocks: {blocks.length} | Score: {score}</Text>
      <OrbitControls enablePan={false} minDistance={8} maxDistance={18} maxPolarAngle={Math.PI / 2.2} />
      <Environment preset="apartment" />
    </>
  );
}

export default function LilBlockBuddy3D({ level = 1, onLevelComplete, onBack }: LilBlockBuddy3DProps) {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [selectedShape, setSelectedShape] = useState<Block['shape']>('cube');
  const [happiness, setHappiness] = useState(50);
  const [score, setScore] = useState(0);
  const targetScore = 300 + level * 100;
  const nextId = useRef(0);

  const getNextPosition = (): [number, number, number] => {
    // Stack blocks in a tower pattern or grid
    const layer = Math.floor(blocks.length / 9);
    const posInLayer = blocks.length % 9;
    const row = Math.floor(posInLayer / 3) - 1;
    const col = (posInLayer % 3) - 1;
    return [col * 1.2, layer * 1.1, row * 1.2];
  };

  const handlePlace = () => {
    const newBlock: Block = {
      id: `block-${nextId.current++}`,
      color: selectedColor,
      position: getNextPosition(),
      shape: selectedShape
    };
    setBlocks(prev => [...prev, newBlock]);
    setScore(prev => prev + 25);
    setHappiness(prev => Math.min(100, prev + 5));
  };

  const handleUndo = () => {
    if (blocks.length > 0) {
      setBlocks(prev => prev.slice(0, -1));
      setScore(prev => Math.max(0, prev - 10));
      setHappiness(prev => Math.max(20, prev - 3));
    }
  };

  React.useEffect(() => {
    if (score >= targetScore && onLevelComplete) {
      onLevelComplete(score, Math.floor(score / 30));
    }
  }, [score, targetScore, onLevelComplete]);

  const resetGame = () => {
    setBlocks([]);
    setScore(0);
    setHappiness(50);
    nextId.current = 0;
  };

  return (
    <div className="relative w-full h-screen bg-gradient-to-b from-cyan-200 to-blue-300">
      <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center">
        <Button variant="outline" size="sm" onClick={onBack} className="bg-white/80"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
        <div className="flex gap-2">
          <span className="bg-blue-500/80 text-white rounded-full px-4 py-2 font-bold">Level {level}</span>
          <span className="bg-cyan-500/80 text-white rounded-full px-4 py-2 font-bold">{score}/{targetScore}</span>
          <span className="bg-pink-500/80 text-white rounded-full px-4 py-2 font-bold">😊 {happiness}%</span>
        </div>
        <Button variant="outline" size="sm" onClick={resetGame} className="bg-white/80"><RotateCcw className="w-4 h-4" /></Button>
      </div>
      <Canvas camera={{ position: [6, 8, 10], fov: 50 }} shadows>
        <React.Suspense fallback={<Loader />}>
          <GameScene blocks={blocks} happiness={happiness} score={score} />
        </React.Suspense>
      </Canvas>
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-3">
        {/* Color selector */}
        <div className="flex gap-2">
          {COLORS.map(color => (
            <button key={color} onClick={() => setSelectedColor(color)}
              className={`w-10 h-10 rounded-full ${selectedColor === color ? 'ring-4 ring-white scale-110' : ''}`}
              style={{ backgroundColor: color }} />
          ))}
        </div>
        {/* Shape selector */}
        <div className="flex gap-2">
          {SHAPES.map(shape => (
            <Button key={shape} size="sm" onClick={() => setSelectedShape(shape)}
              className={`${selectedShape === shape ? 'bg-blue-600 scale-110' : 'bg-white/80 text-gray-700'}`}>
              {shape === 'cube' ? '⬛' : shape === 'cylinder' ? '🔷' : shape === 'cone' ? '🔺' : '⚪'}
            </Button>
          ))}
        </div>
        <div className="flex gap-3">
          <Button size="lg" onClick={handlePlace} className="bg-blue-600 hover:bg-blue-700 text-white px-8">
            Place Block (+25)
          </Button>
          <Button size="lg" onClick={handleUndo} variant="outline" className="bg-white/80">
            Undo
          </Button>
        </div>
      </div>
      {score >= targetScore && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20">
          <div className="bg-white rounded-2xl p-8 text-center">
            <h2 className="text-3xl font-bold text-blue-600 mb-4">🧱 Amazing Build!</h2>
            <p className="text-gray-600 mb-2">Your buddy is so happy!</p>
            <p className="text-yellow-500 font-bold mb-4">+{Math.floor(score / 30)} coins</p>
            <Button onClick={onBack} className="bg-blue-600">Continue</Button>
          </div>
        </div>
      )}
    </div>
  );
}
