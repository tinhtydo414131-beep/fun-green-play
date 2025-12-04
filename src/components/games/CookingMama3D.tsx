import React, { useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, Environment, OrbitControls, useProgress, Html, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RotateCcw } from 'lucide-react';

interface CookingMama3DProps {
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
          <div className="h-full bg-gradient-to-r from-orange-400 to-red-500 transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
        <p className="text-white text-sm">Loading... {progress.toFixed(0)}%</p>
      </div>
    </Html>
  );
}

interface Ingredient {
  id: string;
  type: 'tomato' | 'cheese' | 'lettuce' | 'meat' | 'bread' | 'egg';
  position: [number, number, number];
  added: boolean;
}

const INGREDIENT_COLORS: Record<string, string> = {
  tomato: '#ef4444', cheese: '#fbbf24', lettuce: '#22c55e', meat: '#92400e', bread: '#f59e0b', egg: '#fef3c7'
};

function Ingredient3D({ type, position, onClick, isAdded }: { type: string; position: [number, number, number]; onClick: () => void; isAdded: boolean }) {
  const ref = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  
  useFrame((state) => {
    if (ref.current && !isAdded) {
      ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2 + position[0]) * 0.1;
      if (hovered) {
        ref.current.scale.setScalar(1.2);
      } else {
        ref.current.scale.setScalar(1);
      }
    }
  });

  if (isAdded) return null;

  const renderIngredient = () => {
    switch (type) {
      case 'tomato':
        return <sphereGeometry args={[0.3, 16, 16]} />;
      case 'cheese':
        return <boxGeometry args={[0.5, 0.1, 0.5]} />;
      case 'lettuce':
        return <cylinderGeometry args={[0.4, 0.3, 0.1, 8]} />;
      case 'meat':
        return <cylinderGeometry args={[0.35, 0.35, 0.15, 16]} />;
      case 'bread':
        return <capsuleGeometry args={[0.3, 0.2, 8, 16]} />;
      case 'egg':
        return <sphereGeometry args={[0.25, 16, 16]} />;
      default:
        return <sphereGeometry args={[0.3, 16, 16]} />;
    }
  };

  return (
    <group ref={ref} position={position} onClick={onClick}
      onPointerEnter={() => setHovered(true)} onPointerLeave={() => setHovered(false)}>
      <mesh castShadow>
        {renderIngredient()}
        <meshStandardMaterial color={INGREDIENT_COLORS[type]} />
      </mesh>
    </group>
  );
}

function CookingPot({ ingredients }: { ingredients: Ingredient[] }) {
  const steamRef = useRef<THREE.Group>(null);
  const addedCount = ingredients.filter(i => i.added).length;
  
  useFrame((state) => {
    if (steamRef.current && addedCount > 0) {
      steamRef.current.children.forEach((steam, i) => {
        steam.position.y = 1.5 + Math.sin(state.clock.elapsedTime * 2 + i) * 0.3;
        steam.rotation.y = state.clock.elapsedTime + i;
      });
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Pot */}
      <mesh position={[0, 0.4, 0]}>
        <cylinderGeometry args={[1.2, 1, 0.8, 32]} />
        <meshStandardMaterial color="#374151" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Pot rim */}
      <mesh position={[0, 0.85, 0]}>
        <torusGeometry args={[1.2, 0.1, 8, 32]} />
        <meshStandardMaterial color="#4b5563" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Soup/content */}
      <mesh position={[0, 0.7, 0]}>
        <cylinderGeometry args={[1.1, 1.1, 0.3, 32]} />
        <meshStandardMaterial color="#fbbf24" />
      </mesh>
      {/* Added ingredients in pot */}
      {ingredients.filter(i => i.added).map((ing, index) => (
        <mesh key={ing.id} position={[
          Math.cos(index * 1.5) * 0.5,
          0.85,
          Math.sin(index * 1.5) * 0.5
        ]}>
          <sphereGeometry args={[0.15, 8, 8]} />
          <meshStandardMaterial color={INGREDIENT_COLORS[ing.type]} />
        </mesh>
      ))}
      {/* Steam */}
      {addedCount > 0 && (
        <group ref={steamRef}>
          {[...Array(3)].map((_, i) => (
            <mesh key={i} position={[Math.cos(i * 2) * 0.3, 1.5, Math.sin(i * 2) * 0.3]}>
              <sphereGeometry args={[0.15, 8, 8]} />
              <meshStandardMaterial color="#f1f5f9" transparent opacity={0.5} />
            </mesh>
          ))}
        </group>
      )}
      {/* Handles */}
      {[-1, 1].map(side => (
        <mesh key={side} position={[side * 1.4, 0.5, 0]} rotation={[0, 0, side * 0.3]}>
          <torusGeometry args={[0.2, 0.05, 8, 16, Math.PI]} />
          <meshStandardMaterial color="#1f2937" metalness={0.8} />
        </mesh>
      ))}
    </group>
  );
}

function Stove() {
  return (
    <group position={[0, -0.5, 0]}>
      <RoundedBox args={[4, 0.5, 3]} radius={0.1} position={[0, 0, 0]}>
        <meshStandardMaterial color="#1f2937" />
      </RoundedBox>
      {/* Burner */}
      <mesh position={[0, 0.26, 0]}>
        <cylinderGeometry args={[0.8, 0.8, 0.05, 32]} />
        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.5} />
      </mesh>
      {/* Knobs */}
      {[-1.5, -1, -0.5].map((x, i) => (
        <mesh key={i} position={[x, 0, 1.3]}>
          <cylinderGeometry args={[0.1, 0.1, 0.15, 16]} />
          <meshStandardMaterial color="#f8fafc" />
        </mesh>
      ))}
    </group>
  );
}

function Mama({ happiness }: { happiness: number }) {
  const ref = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <group ref={ref} position={[3, 0, 0]}>
      {/* Body */}
      <mesh position={[0, 0.8, 0]}>
        <capsuleGeometry args={[0.4, 0.6, 8, 16]} />
        <meshStandardMaterial color="#ec4899" />
      </mesh>
      {/* Head */}
      <mesh position={[0, 1.6, 0]}>
        <sphereGeometry args={[0.35, 16, 16]} />
        <meshStandardMaterial color="#fcd34d" />
      </mesh>
      {/* Chef hat */}
      <mesh position={[0, 2, 0]}>
        <cylinderGeometry args={[0.25, 0.35, 0.4, 16]} />
        <meshStandardMaterial color="#f8fafc" />
      </mesh>
      {/* Eyes */}
      {[-0.12, 0.12].map((x, i) => (
        <mesh key={i} position={[x, 1.65, 0.3]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial color="#1f2937" />
        </mesh>
      ))}
      {/* Smile */}
      <mesh position={[0, 1.5, 0.32]} rotation={[happiness > 50 ? 0.3 : -0.2, 0, 0]}>
        <torusGeometry args={[0.1, 0.02, 8, 16, Math.PI]} />
        <meshStandardMaterial color="#ef4444" />
      </mesh>
      {/* Speech bubble */}
      {happiness > 70 && (
        <group position={[0.8, 2.2, 0]}>
          <mesh>
            <sphereGeometry args={[0.3, 16, 16]} />
            <meshStandardMaterial color="#f8fafc" />
          </mesh>
          <Text position={[0, 0, 0.2]} fontSize={0.15} color="#ef4444">❤️</Text>
        </group>
      )}
    </group>
  );
}

function GameScene({ ingredients, onAddIngredient, score, happiness }: {
  ingredients: Ingredient[];
  onAddIngredient: (id: string) => void;
  score: number;
  happiness: number;
}) {
  const ingredientPositions: [number, number, number][] = [
    [-3, 0.5, -1], [-2.5, 0.5, 1], [-3.5, 0.5, 0],
    [3, 0.5, -1], [2.5, 0.5, 1], [3.5, 0.5, 0]
  ];

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 10, 5]} intensity={0.8} castShadow />
      <pointLight position={[0, 3, 0]} intensity={0.3} color="#fbbf24" />
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
        <planeGeometry args={[12, 10]} />
        <meshStandardMaterial color="#fef3c7" />
      </mesh>
      {/* Wall */}
      <mesh position={[0, 2, -4]}>
        <boxGeometry args={[12, 5, 0.2]} />
        <meshStandardMaterial color="#fde68a" />
      </mesh>
      <Stove />
      <CookingPot ingredients={ingredients} />
      <Mama happiness={happiness} />
      {/* Ingredients */}
      {ingredients.map((ing, i) => (
        <Ingredient3D
          key={ing.id}
          type={ing.type}
          position={ingredientPositions[i % ingredientPositions.length]}
          onClick={() => onAddIngredient(ing.id)}
          isAdded={ing.added}
        />
      ))}
      <Text position={[0, 4, 0]} fontSize={0.5} color="#dc2626">👩‍🍳 Score: {score}</Text>
      <OrbitControls enablePan={false} minDistance={6} maxDistance={14} maxPolarAngle={Math.PI / 2.2} />
      <Environment preset="apartment" />
    </>
  );
}

const INGREDIENT_TYPES: Ingredient['type'][] = ['tomato', 'cheese', 'lettuce', 'meat', 'bread', 'egg'];

export default function CookingMama3D({ level = 1, onLevelComplete, onBack }: CookingMama3DProps) {
  const [ingredients, setIngredients] = useState<Ingredient[]>(() =>
    INGREDIENT_TYPES.map((type, i) => ({
      id: `ing-${i}`,
      type,
      position: [0, 0, 0],
      added: false
    }))
  );
  const [score, setScore] = useState(0);
  const [happiness, setHappiness] = useState(50);
  const targetScore = 400 + level * 100;

  const handleAddIngredient = (id: string) => {
    setIngredients(prev => prev.map(ing =>
      ing.id === id ? { ...ing, added: true } : ing
    ));
    setScore(prev => prev + 75);
    setHappiness(prev => Math.min(100, prev + 10));
  };

  React.useEffect(() => {
    if (score >= targetScore && onLevelComplete) {
      onLevelComplete(score, Math.floor(score / 40));
    }
  }, [score, targetScore, onLevelComplete]);

  const resetGame = () => {
    setIngredients(INGREDIENT_TYPES.map((type, i) => ({
      id: `ing-${i}`,
      type,
      position: [0, 0, 0],
      added: false
    })));
    setScore(0);
    setHappiness(50);
  };

  const addedCount = ingredients.filter(i => i.added).length;

  return (
    <div className="relative w-full h-screen bg-gradient-to-b from-orange-200 to-yellow-200">
      <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center">
        <Button variant="outline" size="sm" onClick={onBack} className="bg-white/80"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
        <div className="flex gap-2">
          <span className="bg-orange-500/80 text-white rounded-full px-4 py-2 font-bold">Level {level}</span>
          <span className="bg-red-500/80 text-white rounded-full px-4 py-2 font-bold">{score}/{targetScore}</span>
          <span className="bg-pink-500/80 text-white rounded-full px-4 py-2 font-bold">😊 {happiness}%</span>
        </div>
        <Button variant="outline" size="sm" onClick={resetGame} className="bg-white/80"><RotateCcw className="w-4 h-4" /></Button>
      </div>
      <Canvas camera={{ position: [0, 4, 8], fov: 50 }} shadows>
        <React.Suspense fallback={<Loader />}>
          <GameScene ingredients={ingredients} onAddIngredient={handleAddIngredient} score={score} happiness={happiness} />
        </React.Suspense>
      </Canvas>
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 bg-white/80 rounded-xl px-6 py-3 text-center">
        <p className="font-bold text-orange-600">Click ingredients to add to the pot!</p>
        <p className="text-sm text-gray-600">Added: {addedCount}/{ingredients.length}</p>
      </div>
      {score >= targetScore && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20">
          <div className="bg-white rounded-2xl p-8 text-center">
            <h2 className="text-3xl font-bold text-orange-600 mb-4">👩‍🍳 Delicious!</h2>
            <p className="text-gray-600 mb-2">Mama is so proud!</p>
            <p className="text-yellow-500 font-bold mb-4">+{Math.floor(score / 40)} coins</p>
            <Button onClick={onBack} className="bg-orange-600">Continue</Button>
          </div>
        </div>
      )}
    </div>
  );
}
