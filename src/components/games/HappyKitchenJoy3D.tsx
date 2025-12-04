import React, { useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Environment, Html, Float } from '@react-three/drei';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import * as THREE from 'three';

interface HappyKitchenJoy3DProps {
  level?: number;
  onLevelComplete?: (score: number, coins: number) => void;
  onBack?: () => void;
}

const Loader = () => (
  <Html center>
    <div className="text-primary font-fredoka text-xl">Loading Kitchen...</div>
  </Html>
);

interface Ingredient {
  id: string;
  type: 'tomato' | 'lettuce' | 'cheese' | 'bread' | 'meat' | 'egg';
  position: [number, number, number];
}

interface Order {
  id: string;
  items: string[];
  timeLeft: number;
  points: number;
}

const Ingredient3D = ({ type, position, onClick, isSelected }: { 
  type: string; 
  position: [number, number, number]; 
  onClick: () => void;
  isSelected: boolean;
}) => {
  const meshRef = React.useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current && isSelected) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 2;
    }
  });

  const getColor = () => {
    switch (type) {
      case 'tomato': return '#ff6347';
      case 'lettuce': return '#90ee90';
      case 'cheese': return '#ffd700';
      case 'bread': return '#deb887';
      case 'meat': return '#8b4513';
      case 'egg': return '#fffacd';
      default: return '#ffffff';
    }
  };

  const getGeometry = () => {
    switch (type) {
      case 'tomato': return <sphereGeometry args={[0.3, 16, 16]} />;
      case 'lettuce': return <torusGeometry args={[0.25, 0.1, 8, 16]} />;
      case 'cheese': return <boxGeometry args={[0.4, 0.1, 0.4]} />;
      case 'bread': return <cylinderGeometry args={[0.3, 0.35, 0.2, 16]} />;
      case 'meat': return <cylinderGeometry args={[0.35, 0.35, 0.15, 16]} />;
      case 'egg': return <sphereGeometry args={[0.25, 16, 16]} />;
      default: return <boxGeometry args={[0.3, 0.3, 0.3]} />;
    }
  };

  return (
    <Float speed={isSelected ? 5 : 2} floatIntensity={isSelected ? 0.5 : 0.2}>
      <mesh
        ref={meshRef}
        position={position}
        onClick={onClick}
        scale={isSelected ? 1.3 : 1}
      >
        {getGeometry()}
        <meshStandardMaterial 
          color={getColor()} 
          metalness={0.3} 
          roughness={0.6}
          emissive={isSelected ? getColor() : '#000000'}
          emissiveIntensity={isSelected ? 0.3 : 0}
        />
      </mesh>
    </Float>
  );
};

const KitchenCounter = () => (
  <mesh position={[0, -0.5, 0]} receiveShadow>
    <boxGeometry args={[6, 0.3, 3]} />
    <meshStandardMaterial color="#8b7355" metalness={0.2} roughness={0.8} />
  </mesh>
);

const ServingPlate = ({ items }: { items: string[] }) => (
  <group position={[2.5, 0, 0]}>
    <mesh receiveShadow>
      <cylinderGeometry args={[0.6, 0.65, 0.1, 32]} />
      <meshStandardMaterial color="#ffffff" metalness={0.5} roughness={0.3} />
    </mesh>
    {items.map((item, index) => (
      <mesh key={index} position={[0, 0.1 + index * 0.15, 0]}>
        <boxGeometry args={[0.3, 0.1, 0.3]} />
        <meshStandardMaterial 
          color={
            item === 'tomato' ? '#ff6347' :
            item === 'lettuce' ? '#90ee90' :
            item === 'cheese' ? '#ffd700' :
            item === 'bread' ? '#deb887' :
            item === 'meat' ? '#8b4513' : '#fffacd'
          } 
        />
      </mesh>
    ))}
  </group>
);

const GameScene = ({ 
  ingredients, 
  selectedItems, 
  onIngredientClick, 
  score 
}: { 
  ingredients: Ingredient[];
  selectedItems: string[];
  onIngredientClick: (type: string) => void;
  score: number;
}) => {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 10, 5]} intensity={1} castShadow />
      <pointLight position={[-3, 3, 2]} intensity={0.5} color="#ffa500" />
      
      <KitchenCounter />
      
      {ingredients.map((ing) => (
        <Ingredient3D
          key={ing.id}
          type={ing.type}
          position={ing.position}
          onClick={() => onIngredientClick(ing.type)}
          isSelected={selectedItems.includes(ing.type)}
        />
      ))}
      
      <ServingPlate items={selectedItems} />
      
      <Text
        position={[0, 2.5, 0]}
        fontSize={0.4}
        color="#ff6b6b"
        anchorX="center"
      >
        {`Score: ${score}`}
      </Text>
      
      <OrbitControls
        enablePan={false}
        enableZoom={true}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 2.5}
        minDistance={4}
        maxDistance={10}
      />
      <Environment preset="apartment" />
    </>
  );
};

export const HappyKitchenJoy3D: React.FC<HappyKitchenJoy3DProps> = ({
  level = 1,
  onLevelComplete,
  onBack
}) => {
  const [score, setScore] = useState(0);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [ordersCompleted, setOrdersCompleted] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const targetOrders = 3 + level;

  const ingredients: Ingredient[] = [
    { id: '1', type: 'bread', position: [-2, 0, -0.5] },
    { id: '2', type: 'tomato', position: [-1, 0, -0.5] },
    { id: '3', type: 'lettuce', position: [0, 0, -0.5] },
    { id: '4', type: 'cheese', position: [-2, 0, 0.5] },
    { id: '5', type: 'meat', position: [-1, 0, 0.5] },
    { id: '6', type: 'egg', position: [0, 0, 0.5] },
  ];

  const generateOrder = (): Order => {
    const allTypes = ['bread', 'tomato', 'lettuce', 'cheese', 'meat', 'egg'];
    const numItems = Math.min(2 + Math.floor(level / 2), 4);
    const items: string[] = [];
    
    for (let i = 0; i < numItems; i++) {
      const randomItem = allTypes[Math.floor(Math.random() * allTypes.length)];
      items.push(randomItem);
    }
    
    return {
      id: Date.now().toString(),
      items,
      timeLeft: 30 - level * 2,
      points: numItems * 50
    };
  };

  useEffect(() => {
    if (!currentOrder && !gameOver) {
      setCurrentOrder(generateOrder());
    }
  }, [currentOrder, gameOver]);

  useEffect(() => {
    if (!currentOrder || gameOver) return;
    
    const timer = setInterval(() => {
      setCurrentOrder(prev => {
        if (!prev) return null;
        if (prev.timeLeft <= 1) {
          setGameOver(true);
          return null;
        }
        return { ...prev, timeLeft: prev.timeLeft - 1 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentOrder, gameOver]);

  const handleIngredientClick = (type: string) => {
    if (gameOver || !currentOrder) return;
    
    if (selectedItems.includes(type)) {
      setSelectedItems(prev => prev.filter(item => item !== type));
    } else {
      setSelectedItems(prev => [...prev, type]);
    }
  };

  const handleServe = () => {
    if (!currentOrder || gameOver) return;
    
    const sortedSelected = [...selectedItems].sort();
    const sortedOrder = [...currentOrder.items].sort();
    
    if (JSON.stringify(sortedSelected) === JSON.stringify(sortedOrder)) {
      const bonus = currentOrder.timeLeft * 5;
      setScore(prev => prev + currentOrder.points + bonus);
      setOrdersCompleted(prev => prev + 1);
      
      if (ordersCompleted + 1 >= targetOrders) {
        onLevelComplete?.(score + currentOrder.points + bonus, Math.floor((score + currentOrder.points + bonus) / 100));
      }
      
      setSelectedItems([]);
      setCurrentOrder(generateOrder());
    } else {
      setSelectedItems([]);
    }
  };

  const resetGame = () => {
    setScore(0);
    setSelectedItems([]);
    setOrdersCompleted(0);
    setGameOver(false);
    setCurrentOrder(generateOrder());
  };

  const getItemEmoji = (type: string) => {
    switch (type) {
      case 'tomato': return '🍅';
      case 'lettuce': return '🥬';
      case 'cheese': return '🧀';
      case 'bread': return '🍞';
      case 'meat': return '🥩';
      case 'egg': return '🥚';
      default: return '🍽️';
    }
  };

  return (
    <div className="w-full h-[500px] md:h-[600px] relative">
      <div className="absolute top-2 left-2 right-2 z-10 flex justify-between items-center">
        <Button variant="outline" size="sm" onClick={onBack} className="font-fredoka">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        <div className="flex items-center gap-2">
          <span className="font-fredoka text-sm bg-primary/20 px-2 py-1 rounded-lg">
            Orders: {ordersCompleted}/{targetOrders}
          </span>
          <span className="font-fredoka text-lg bg-secondary/20 px-3 py-1 rounded-lg">
            Score: {score}
          </span>
        </div>
        <Button variant="outline" size="sm" onClick={resetGame} className="font-fredoka">
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>

      {/* Order display */}
      {currentOrder && !gameOver && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-10 bg-background/90 px-4 py-2 rounded-xl border-2 border-primary/30">
          <div className="flex items-center gap-2">
            <span className="font-fredoka text-sm">Order:</span>
            <div className="flex gap-1">
              {currentOrder.items.map((item, i) => (
                <span key={i} className="text-xl">{getItemEmoji(item)}</span>
              ))}
            </div>
            <span className="font-fredoka text-sm text-orange-500">
              ⏱️ {currentOrder.timeLeft}s
            </span>
          </div>
        </div>
      )}

      {gameOver && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/50 rounded-xl">
          <div className="bg-background p-6 rounded-xl text-center space-y-4">
            <h2 className="text-2xl font-fredoka font-bold text-primary">
              {ordersCompleted >= targetOrders ? '🎉 Kitchen Master!' : '⏰ Time\'s Up!'}
            </h2>
            <p className="font-comic text-muted-foreground">
              Orders: {ordersCompleted} | Score: {score}
            </p>
            <Button onClick={resetGame} className="font-fredoka">
              Cook Again
            </Button>
          </div>
        </div>
      )}

      <Canvas shadows camera={{ position: [0, 5, 6], fov: 50 }}>
        <Suspense fallback={<Loader />}>
          <GameScene 
            ingredients={ingredients}
            selectedItems={selectedItems}
            onIngredientClick={handleIngredientClick}
            score={score}
          />
        </Suspense>
      </Canvas>

      {/* Serve button */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2">
        <Button 
          onClick={handleServe} 
          disabled={selectedItems.length === 0 || gameOver}
          className="font-fredoka bg-green-500 hover:bg-green-600"
        >
          🍽️ Serve Order
        </Button>
        <Button 
          variant="outline"
          onClick={() => setSelectedItems([])}
          disabled={selectedItems.length === 0 || gameOver}
          className="font-fredoka"
        >
          Clear
        </Button>
      </div>
    </div>
  );
};

export default HappyKitchenJoy3D;
