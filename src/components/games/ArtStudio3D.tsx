import React, { useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Environment, RoundedBox } from '@react-three/drei';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RotateCcw, Palette } from 'lucide-react';
import * as THREE from 'three';

interface ArtStudio3DProps {
  level?: number;
  onLevelComplete?: (score: number, coins: number) => void;
  onBack?: () => void;
}

interface PaintStroke {
  id: string;
  position: [number, number, number];
  color: string;
  scale: number;
  shape: 'sphere' | 'cube' | 'cylinder' | 'cone';
}

// 3D Paint Stroke
const PaintStroke3D = ({ stroke }: { stroke: PaintStroke }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime + stroke.position[0]) * 0.1;
    }
  });

  const renderShape = () => {
    switch (stroke.shape) {
      case 'sphere':
        return <sphereGeometry args={[stroke.scale * 0.3, 16, 16]} />;
      case 'cube':
        return <boxGeometry args={[stroke.scale * 0.5, stroke.scale * 0.5, stroke.scale * 0.5]} />;
      case 'cylinder':
        return <cylinderGeometry args={[stroke.scale * 0.2, stroke.scale * 0.2, stroke.scale * 0.6, 16]} />;
      case 'cone':
        return <coneGeometry args={[stroke.scale * 0.3, stroke.scale * 0.6, 16]} />;
      default:
        return <sphereGeometry args={[stroke.scale * 0.3, 16, 16]} />;
    }
  };

  return (
    <mesh ref={meshRef} position={stroke.position}>
      {renderShape()}
      <meshStandardMaterial color={stroke.color} metalness={0.3} roughness={0.4} />
    </mesh>
  );
};

// 3D Canvas/Easel
const Easel3D = () => {
  return (
    <group position={[0, -2, -3]}>
      {/* Easel legs */}
      <mesh position={[-1.5, 1.5, 0]} rotation={[0, 0, 0.2]}>
        <cylinderGeometry args={[0.05, 0.05, 4, 8]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      <mesh position={[1.5, 1.5, 0]} rotation={[0, 0, -0.2]}>
        <cylinderGeometry args={[0.05, 0.05, 4, 8]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      <mesh position={[0, 1.5, 0.5]} rotation={[0.3, 0, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 4, 8]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      {/* Canvas board */}
      <mesh position={[0, 2.5, 0]}>
        <boxGeometry args={[4, 3, 0.1]} />
        <meshStandardMaterial color="#F5F5DC" />
      </mesh>
    </group>
  );
};

// Floating palette
const FloatingPalette = ({ colors, selectedColor, onSelect }: { 
  colors: string[], 
  selectedColor: string, 
  onSelect: (color: string) => void 
}) => {
  return (
    <group position={[-4, 0, 0]}>
      {colors.map((color, index) => (
        <mesh 
          key={color}
          position={[0, 2 - index * 0.8, 0]}
          onClick={() => onSelect(color)}
        >
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshStandardMaterial 
            color={color} 
            emissive={selectedColor === color ? color : '#000000'}
            emissiveIntensity={selectedColor === color ? 0.5 : 0}
          />
        </mesh>
      ))}
    </group>
  );
};

// Game Scene
const GameScene = ({ 
  strokes, 
  colors, 
  selectedColor, 
  onColorSelect,
  onCanvasClick 
}: { 
  strokes: PaintStroke[];
  colors: string[];
  selectedColor: string;
  onColorSelect: (color: string) => void;
  onCanvasClick: (point: THREE.Vector3) => void;
}) => {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 10, 5]} intensity={1} castShadow />
      <pointLight position={[-5, 5, 5]} intensity={0.5} color="#FFD700" />
      
      <Easel3D />
      <FloatingPalette colors={colors} selectedColor={selectedColor} onSelect={onColorSelect} />
      
      {/* Interactive canvas area */}
      <mesh 
        position={[0, 0.5, -2.9]} 
        onClick={(e) => {
          e.stopPropagation();
          onCanvasClick(e.point);
        }}
      >
        <planeGeometry args={[3.8, 2.8]} />
        <meshStandardMaterial color="#FFFEF0" transparent opacity={0.9} />
      </mesh>
      
      {/* Paint strokes */}
      {strokes.map((stroke) => (
        <PaintStroke3D key={stroke.id} stroke={stroke} />
      ))}
      
      {/* Score display */}
      <Text
        position={[0, 4, 0]}
        fontSize={0.5}
        color="#FF6B6B"
        anchorX="center"
      >
        🎨 3D Art Studio
      </Text>
      
      <OrbitControls 
        enablePan={false} 
        minDistance={5} 
        maxDistance={15}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 2}
      />
      <Environment preset="studio" />
    </>
  );
};

const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'];
const SHAPES: ('sphere' | 'cube' | 'cylinder' | 'cone')[] = ['sphere', 'cube', 'cylinder', 'cone'];

const ArtStudio3D: React.FC<ArtStudio3DProps> = ({
  level = 1,
  onLevelComplete,
  onBack
}) => {
  const [strokes, setStrokes] = useState<PaintStroke[]>([]);
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [selectedShape, setSelectedShape] = useState<'sphere' | 'cube' | 'cylinder' | 'cone'>('sphere');
  const [score, setScore] = useState(0);
  const strokeIdRef = useRef(0);

  const handleCanvasClick = (point: THREE.Vector3) => {
    const newStroke: PaintStroke = {
      id: `stroke-${strokeIdRef.current++}`,
      position: [point.x, point.y, point.z + 0.1],
      color: selectedColor,
      scale: 0.5 + Math.random() * 0.5,
      shape: selectedShape
    };
    
    setStrokes(prev => [...prev, newStroke]);
    setScore(prev => prev + 10);
  };

  const handleReset = () => {
    setStrokes([]);
    setScore(0);
  };

  const handleComplete = () => {
    const finalScore = score + strokes.length * 5;
    const coins = Math.floor(finalScore / 20);
    onLevelComplete?.(finalScore, coins);
  };

  return (
    <div className="relative w-full h-screen bg-gradient-to-b from-purple-900 via-pink-800 to-orange-700">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4 flex justify-between items-center">
        <Button 
          variant="ghost" 
          onClick={onBack}
          className="text-white hover:bg-white/20"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </Button>
        
        <div className="flex items-center gap-4">
          <div className="bg-black/30 backdrop-blur-sm rounded-full px-4 py-2 text-white">
            <Palette className="w-5 h-5 inline mr-2" />
            Score: {score}
          </div>
          <div className="bg-black/30 backdrop-blur-sm rounded-full px-4 py-2 text-white">
            Strokes: {strokes.length}
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            onClick={handleReset}
            className="text-white hover:bg-white/20"
          >
            <RotateCcw className="w-5 h-5" />
          </Button>
          <Button 
            onClick={handleComplete}
            className="bg-green-500 hover:bg-green-600 text-white"
          >
            Complete Art
          </Button>
        </div>
      </div>

      {/* Tool Palette */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2 bg-black/30 backdrop-blur-sm rounded-full p-2">
        {/* Colors */}
        {COLORS.map((color) => (
          <button
            key={color}
            onClick={() => setSelectedColor(color)}
            className={`w-10 h-10 rounded-full transition-transform ${
              selectedColor === color ? 'scale-125 ring-2 ring-white' : ''
            }`}
            style={{ backgroundColor: color }}
          />
        ))}
        
        <div className="w-px bg-white/30 mx-2" />
        
        {/* Shapes */}
        {SHAPES.map((shape) => (
          <button
            key={shape}
            onClick={() => setSelectedShape(shape)}
            className={`w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center text-white transition-transform ${
              selectedShape === shape ? 'scale-125 ring-2 ring-white' : ''
            }`}
          >
            {shape === 'sphere' && '●'}
            {shape === 'cube' && '■'}
            {shape === 'cylinder' && '▬'}
            {shape === 'cone' && '▲'}
          </button>
        ))}
      </div>

      {/* 3D Canvas */}
      <Canvas camera={{ position: [0, 2, 8], fov: 50 }}>
        <GameScene 
          strokes={strokes}
          colors={COLORS}
          selectedColor={selectedColor}
          onColorSelect={setSelectedColor}
          onCanvasClick={handleCanvasClick}
        />
      </Canvas>
    </div>
  );
};

export default ArtStudio3D;
