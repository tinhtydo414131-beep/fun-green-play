import React, { useState, useEffect, useCallback, Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Environment, Html, Float, Line } from '@react-three/drei';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RotateCcw, Play, ShoppingCart } from 'lucide-react';
import * as THREE from 'three';
import { toast } from 'sonner';

interface GoldHookMaster3DProps {
  level?: number;
  onLevelComplete?: (score: number, coins: number) => void;
  onBack?: () => void;
}

const Loader = () => (
  <Html center>
    <div className="text-primary font-fredoka text-xl">Loading Gold Mine...</div>
  </Html>
);

interface Item3D {
  id: string;
  type: 'gold' | 'diamond' | 'coin' | 'rock' | 'bomb';
  position: [number, number, number];
  value: number;
  collected: boolean;
}

interface HookState {
  angle: number;
  length: number;
  extending: boolean;
  retracting: boolean;
  grabbedItem: Item3D | null;
}

const Item3DComponent = ({ item, onCollect }: { item: Item3D; onCollect: (item: Item3D) => void }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current && !item.collected) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5;
      meshRef.current.position.y = item.position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.05;
    }
  });

  if (item.collected) return null;

  const getColor = () => {
    switch (item.type) {
      case 'gold': return '#ffd700';
      case 'diamond': return '#00ffff';
      case 'coin': return '#f0c040';
      case 'rock': return '#808080';
      case 'bomb': return '#ff0000';
      default: return '#ffffff';
    }
  };

  const getGeometry = () => {
    switch (item.type) {
      case 'gold': return <dodecahedronGeometry args={[0.3, 0]} />;
      case 'diamond': return <octahedronGeometry args={[0.25]} />;
      case 'coin': return <cylinderGeometry args={[0.2, 0.2, 0.05, 16]} />;
      case 'rock': return <dodecahedronGeometry args={[0.35, 0]} />;
      case 'bomb': return <sphereGeometry args={[0.25, 16, 16]} />;
      default: return <boxGeometry args={[0.3, 0.3, 0.3]} />;
    }
  };

  return (
    <Float speed={1} floatIntensity={0.1}>
      <mesh
        ref={meshRef}
        position={item.position}
        onClick={() => onCollect(item)}
      >
        {getGeometry()}
        <meshStandardMaterial 
          color={getColor()} 
          metalness={item.type === 'diamond' ? 0.9 : 0.5} 
          roughness={item.type === 'rock' ? 0.9 : 0.3}
          emissive={item.type === 'bomb' ? '#ff0000' : '#000000'}
          emissiveIntensity={item.type === 'bomb' ? 0.3 : 0}
        />
      </mesh>
    </Float>
  );
};

const Hook3D = ({ hook, position }: { hook: HookState; position: [number, number, number] }) => {
  const endX = position[0] + Math.sin(hook.angle) * hook.length;
  const endY = position[1] - Math.cos(hook.angle) * hook.length;
  
  const points: [number, number, number][] = [
    [position[0], position[1], position[2]],
    [endX, endY, position[2]]
  ];

  return (
    <group>
      {/* Hook line */}
      <Line points={points} color="#ffd700" lineWidth={3} />
      
      {/* Hook tip */}
      <mesh position={[endX, endY, position[2]]}>
        <coneGeometry args={[0.1, 0.2, 8]} />
        <meshStandardMaterial color="#ff6b6b" metalness={0.7} roughness={0.3} />
      </mesh>
      
      {/* Grabbed item indicator */}
      {hook.grabbedItem && hook.retracting && (
        <mesh position={[endX, endY - 0.3, position[2]]}>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshStandardMaterial 
            color={hook.grabbedItem.type === 'gold' ? '#ffd700' : 
                   hook.grabbedItem.type === 'diamond' ? '#00ffff' : '#f0c040'} 
          />
        </mesh>
      )}
    </group>
  );
};

const Ground3D = () => (
  <mesh position={[0, -1.5, 0]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
    <planeGeometry args={[10, 8]} />
    <meshStandardMaterial color="#3d2817" metalness={0.1} roughness={0.9} />
  </mesh>
);

const MiningPlatform = () => (
  <group position={[0, 1.5, 0]}>
    <mesh>
      <boxGeometry args={[2, 0.2, 1]} />
      <meshStandardMaterial color="#8b4513" metalness={0.2} roughness={0.8} />
    </mesh>
    {/* Miner character */}
    <mesh position={[0, 0.4, 0]}>
      <capsuleGeometry args={[0.15, 0.3, 8, 16]} />
      <meshStandardMaterial color="#f5deb3" />
    </mesh>
    {/* Hard hat */}
    <mesh position={[0, 0.7, 0]}>
      <sphereGeometry args={[0.12, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
      <meshStandardMaterial color="#ffd700" />
    </mesh>
  </group>
);

const GameScene = ({ 
  items, 
  hook, 
  score,
  timeLeft,
  onItemClick 
}: { 
  items: Item3D[];
  hook: HookState;
  score: number;
  timeLeft: number;
  onItemClick: (item: Item3D) => void;
}) => {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 10, 5]} intensity={1} castShadow />
      <pointLight position={[-3, 2, 2]} intensity={0.5} color="#ffa500" />
      <pointLight position={[3, -2, 2]} intensity={0.3} color="#4169e1" />
      
      <Ground3D />
      <MiningPlatform />
      <Hook3D hook={hook} position={[0, 1.3, 0]} />
      
      {items.map((item) => (
        <Item3DComponent
          key={item.id}
          item={item}
          onCollect={onItemClick}
        />
      ))}
      
      <Text
        position={[0, 2.5, 0]}
        fontSize={0.3}
        color="#ffd700"
        anchorX="center"
      >
        {`Score: ${score} | Time: ${timeLeft}s`}
      </Text>
      
      <OrbitControls
        enablePan={false}
        enableZoom={true}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 2.2}
        minDistance={4}
        maxDistance={10}
      />
      <Environment preset="night" />
    </>
  );
};

export const GoldHookMaster3D: React.FC<GoldHookMaster3DProps> = ({
  level = 1,
  onLevelComplete,
  onBack
}) => {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'victory' | 'gameover'>('menu');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [combo, setCombo] = useState(0);
  const [items, setItems] = useState<Item3D[]>([]);
  const [hook, setHook] = useState<HookState>({
    angle: 0,
    length: 0.5,
    extending: false,
    retracting: false,
    grabbedItem: null
  });
  
  const targetScore = 500 + level * 200;
  const swingDirection = useRef(1);

  const generateItems = useCallback(() => {
    const newItems: Item3D[] = [];
    const count = 12 + level * 2;
    
    for (let i = 0; i < count; i++) {
      const rand = Math.random();
      let type: Item3D['type'] = 'coin';
      let value = 30;
      
      if (rand < 0.1) { type = 'diamond'; value = 200; }
      else if (rand < 0.2) { type = 'bomb'; value = -100; }
      else if (rand < 0.35) { type = 'rock'; value = 10; }
      else if (rand < 0.6) { type = 'gold'; value = 80; }
      else { type = 'coin'; value = 30; }
      
      newItems.push({
        id: `item-${i}`,
        type,
        position: [
          (Math.random() - 0.5) * 6,
          -0.5 - Math.random() * 2.5,
          (Math.random() - 0.5) * 2
        ],
        value,
        collected: false
      });
    }
    
    return newItems;
  }, [level]);

  const startGame = () => {
    setItems(generateItems());
    setScore(0);
    setTimeLeft(60 - Math.min(level * 2, 20));
    setCombo(0);
    setHook({
      angle: 0,
      length: 0.5,
      extending: false,
      retracting: false,
      grabbedItem: null
    });
    setGameState('playing');
  };

  // Timer
  useEffect(() => {
    if (gameState !== 'playing') return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setGameState('gameover');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [gameState]);

  // Hook swing animation
  useEffect(() => {
    if (gameState !== 'playing' || hook.extending || hook.retracting) return;
    
    const interval = setInterval(() => {
      setHook(prev => {
        let newAngle = prev.angle + 0.03 * swingDirection.current;
        if (newAngle > 1.2) {
          swingDirection.current = -1;
          newAngle = 1.2;
        } else if (newAngle < -1.2) {
          swingDirection.current = 1;
          newAngle = -1.2;
        }
        return { ...prev, angle: newAngle };
      });
    }, 30);
    
    return () => clearInterval(interval);
  }, [gameState, hook.extending, hook.retracting]);

  // Hook extend/retract
  useEffect(() => {
    if (gameState !== 'playing') return;
    
    const interval = setInterval(() => {
      setHook(prev => {
        if (prev.extending) {
          const newLength = prev.length + 0.08;
          
          // Check collision
          const hookX = Math.sin(prev.angle) * newLength;
          const hookY = 1.3 - Math.cos(prev.angle) * newLength;
          
          for (const item of items) {
            if (item.collected) continue;
            const dx = hookX - item.position[0];
            const dy = hookY - item.position[1];
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < 0.4) {
              return { ...prev, extending: false, retracting: true, length: newLength, grabbedItem: item };
            }
          }
          
          if (newLength > 3.5) {
            return { ...prev, extending: false, retracting: true, length: newLength };
          }
          return { ...prev, length: newLength };
        }
        
        if (prev.retracting) {
          const newLength = prev.length - 0.1;
          if (newLength <= 0.5) {
            if (prev.grabbedItem) {
              const item = prev.grabbedItem;
              setItems(items => items.map(i => 
                i.id === item.id ? { ...i, collected: true } : i
              ));
              
              if (item.type === 'bomb') {
                setScore(s => Math.max(0, s + item.value));
                setCombo(0);
                toast.error("💣 Boom! -100");
              } else {
                const newCombo = combo + 1;
                const multiplier = newCombo >= 5 ? 2 : 1;
                const earned = item.value * multiplier;
                setScore(s => {
                  const newScore = s + earned;
                  if (newScore >= targetScore) {
                    setGameState('victory');
                    onLevelComplete?.(newScore, Math.floor(newScore / 50));
                  }
                  return newScore;
                });
                setCombo(newCombo);
                if (item.type === 'diamond') toast.success("💎 Diamond! +200");
                else if (item.type === 'gold') toast.success("💰 Gold! +80");
              }
            }
            return { ...prev, retracting: false, length: 0.5, grabbedItem: null };
          }
          return { ...prev, length: newLength };
        }
        
        return prev;
      });
    }, 30);
    
    return () => clearInterval(interval);
  }, [gameState, items, combo, targetScore, onLevelComplete]);

  const launchHook = () => {
    if (hook.extending || hook.retracting || gameState !== 'playing') return;
    setHook(prev => ({ ...prev, extending: true }));
  };

  return (
    <div className="w-full h-[500px] md:h-[600px] relative">
      <div className="absolute top-2 left-2 right-2 z-10 flex justify-between items-center">
        <Button variant="outline" size="sm" onClick={onBack} className="font-fredoka">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        <div className="flex items-center gap-2">
          <span className="font-fredoka text-sm bg-yellow-500/20 px-2 py-1 rounded-lg">
            🎯 {score}/{targetScore}
          </span>
          <span className="font-fredoka text-sm bg-primary/20 px-2 py-1 rounded-lg">
            ⏱️ {timeLeft}s
          </span>
          {combo >= 3 && (
            <span className="font-fredoka text-sm bg-orange-500/20 px-2 py-1 rounded-lg animate-pulse">
              🔥 x{combo}
            </span>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={startGame} className="font-fredoka">
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>

      {gameState === 'menu' && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/70 rounded-xl">
          <div className="bg-background p-6 rounded-xl text-center space-y-4">
            <div className="text-5xl">⛏️💎</div>
            <h2 className="text-2xl font-fredoka font-bold text-primary">Gold Hook Master 3D</h2>
            <p className="font-comic text-muted-foreground">Level {level} | Target: {targetScore}</p>
            <Button onClick={startGame} className="font-fredoka gap-2">
              <Play className="w-4 h-4" /> Start Mining
            </Button>
          </div>
        </div>
      )}

      {(gameState === 'victory' || gameState === 'gameover') && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/70 rounded-xl">
          <div className="bg-background p-6 rounded-xl text-center space-y-4">
            <h2 className="text-2xl font-fredoka font-bold text-primary">
              {gameState === 'victory' ? '🎉 Level Complete!' : '⏰ Time Up!'}
            </h2>
            <p className="font-comic text-muted-foreground">Score: {score}</p>
            <Button onClick={startGame} className="font-fredoka">
              {gameState === 'victory' ? 'Next Level' : 'Try Again'}
            </Button>
          </div>
        </div>
      )}

      <Canvas shadows camera={{ position: [0, 2, 6], fov: 50 }} onClick={launchHook}>
        <Suspense fallback={<Loader />}>
          <GameScene 
            items={items}
            hook={hook}
            score={score}
            timeLeft={timeLeft}
            onItemClick={() => {}}
          />
        </Suspense>
      </Canvas>

      {/* Launch button for mobile */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 md:hidden">
        <Button 
          onClick={launchHook}
          disabled={hook.extending || hook.retracting || gameState !== 'playing'}
          className="font-fredoka bg-yellow-500 hover:bg-yellow-600 px-8"
        >
          ⛏️ Drop Hook!
        </Button>
      </div>
    </div>
  );
};

export default GoldHookMaster3D;
