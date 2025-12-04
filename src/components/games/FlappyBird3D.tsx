import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, Environment, useProgress, Html } from '@react-three/drei';
import * as THREE from 'three';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Play, RotateCcw } from 'lucide-react';

interface FlappyBird3DProps {
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
          <div 
            className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-white text-sm">Loading... {progress.toFixed(0)}%</p>
      </div>
    </Html>
  );
}

interface PipeProps {
  position: [number, number, number];
  gapY: number;
  gapSize: number;
}

function Pipe({ position, gapY, gapSize }: PipeProps) {
  const pipeWidth = 1.5;
  const pipeDepth = 1;
  const worldHeight = 12;
  
  const topPipeHeight = (worldHeight / 2) - gapY - (gapSize / 2);
  const bottomPipeHeight = (worldHeight / 2) + gapY - (gapSize / 2);
  
  return (
    <group position={position}>
      {/* Top pipe */}
      <mesh position={[0, worldHeight / 2 - topPipeHeight / 2, 0]}>
        <boxGeometry args={[pipeWidth, topPipeHeight, pipeDepth]} />
        <meshStandardMaterial color="#22c55e" />
      </mesh>
      <mesh position={[0, worldHeight / 2 - topPipeHeight - 0.3, 0]}>
        <boxGeometry args={[pipeWidth + 0.3, 0.6, pipeDepth + 0.2]} />
        <meshStandardMaterial color="#16a34a" />
      </mesh>
      
      {/* Bottom pipe */}
      <mesh position={[0, -worldHeight / 2 + bottomPipeHeight / 2, 0]}>
        <boxGeometry args={[pipeWidth, bottomPipeHeight, pipeDepth]} />
        <meshStandardMaterial color="#22c55e" />
      </mesh>
      <mesh position={[0, -worldHeight / 2 + bottomPipeHeight + 0.3, 0]}>
        <boxGeometry args={[pipeWidth + 0.3, 0.6, pipeDepth + 0.2]} />
        <meshStandardMaterial color="#16a34a" />
      </mesh>
    </group>
  );
}

interface BirdProps {
  position: [number, number, number];
  velocity: number;
}

function Bird({ position, velocity }: BirdProps) {
  const birdRef = useRef<THREE.Group>(null);
  const wingRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (birdRef.current) {
      // Rotate based on velocity
      birdRef.current.rotation.z = Math.max(-0.5, Math.min(0.5, velocity * 0.1));
    }
    if (wingRef.current) {
      wingRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 15) * 0.3;
    }
  });
  
  return (
    <group ref={birdRef} position={position}>
      {/* Body */}
      <mesh>
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshStandardMaterial color="#fbbf24" />
      </mesh>
      
      {/* Eye */}
      <mesh position={[0.25, 0.1, 0.2]}>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshStandardMaterial color="white" />
      </mesh>
      <mesh position={[0.32, 0.1, 0.25]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshStandardMaterial color="black" />
      </mesh>
      
      {/* Beak */}
      <mesh position={[0.45, -0.05, 0]} rotation={[0, 0, -0.2]}>
        <coneGeometry args={[0.15, 0.3, 8]} />
        <meshStandardMaterial color="#f97316" />
      </mesh>
      
      {/* Wing */}
      <mesh ref={wingRef} position={[-0.1, 0, 0.35]}>
        <boxGeometry args={[0.3, 0.1, 0.4]} />
        <meshStandardMaterial color="#fcd34d" />
      </mesh>
    </group>
  );
}

function Cloud({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.8, 8, 8]} />
        <meshStandardMaterial color="white" opacity={0.8} transparent />
      </mesh>
      <mesh position={[0.6, 0.2, 0]}>
        <sphereGeometry args={[0.6, 8, 8]} />
        <meshStandardMaterial color="white" opacity={0.8} transparent />
      </mesh>
      <mesh position={[-0.5, 0.1, 0]}>
        <sphereGeometry args={[0.5, 8, 8]} />
        <meshStandardMaterial color="white" opacity={0.8} transparent />
      </mesh>
    </group>
  );
}

interface GameSceneProps {
  birdY: number;
  birdVelocity: number;
  pipes: Array<{ x: number; gapY: number }>;
  score: number;
  gameSpeed: number;
}

function GameScene({ birdY, birdVelocity, pipes, score, gameSpeed }: GameSceneProps) {
  const cloudsRef = useRef<THREE.Group>(null);
  
  useFrame(() => {
    if (cloudsRef.current) {
      cloudsRef.current.children.forEach((cloud) => {
        cloud.position.x -= gameSpeed * 0.3;
        if (cloud.position.x < -15) {
          cloud.position.x = 15;
        }
      });
    }
  });
  
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 10, 5]} intensity={1} />
      
      {/* Sky gradient background */}
      <mesh position={[0, 0, -10]}>
        <planeGeometry args={[50, 30]} />
        <meshBasicMaterial color="#87ceeb" />
      </mesh>
      
      {/* Clouds */}
      <group ref={cloudsRef}>
        <Cloud position={[-8, 4, -5]} />
        <Cloud position={[0, 3, -5]} />
        <Cloud position={[8, 5, -5]} />
        <Cloud position={[-4, 2, -5]} />
        <Cloud position={[12, 4, -5]} />
      </group>
      
      {/* Ground */}
      <mesh position={[0, -6.5, 0]}>
        <boxGeometry args={[30, 1, 5]} />
        <meshStandardMaterial color="#84cc16" />
      </mesh>
      
      {/* Bird */}
      <Bird position={[-3, birdY, 0]} velocity={birdVelocity} />
      
      {/* Pipes */}
      {pipes.map((pipe, index) => (
        <Pipe
          key={index}
          position={[pipe.x, 0, 0]}
          gapY={pipe.gapY}
          gapSize={3.5}
        />
      ))}
      
      {/* Score display */}
      <Text
        position={[0, 5, 1]}
        fontSize={1}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.05}
        outlineColor="#000000"
      >
        {score}
      </Text>
      
      <Environment preset="sunset" />
    </>
  );
}

export default function FlappyBird3D({ level = 1, onLevelComplete, onBack }: FlappyBird3DProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [birdY, setBirdY] = useState(0);
  const [birdVelocity, setBirdVelocity] = useState(0);
  const [pipes, setPipes] = useState<Array<{ x: number; gapY: number }>>([]);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  
  const gameSpeed = 0.08 + (level * 0.01);
  const gravity = 0.015;
  const jumpForce = 0.4;
  const gapSize = Math.max(2.5, 3.5 - (level * 0.1));
  
  const startGame = useCallback(() => {
    setBirdY(0);
    setBirdVelocity(0);
    setPipes([
      { x: 8, gapY: (Math.random() - 0.5) * 4 },
      { x: 14, gapY: (Math.random() - 0.5) * 4 },
      { x: 20, gapY: (Math.random() - 0.5) * 4 },
    ]);
    setScore(0);
    setGameOver(false);
    setIsPlaying(true);
  }, []);
  
  const jump = useCallback(() => {
    if (!isPlaying || gameOver) return;
    setBirdVelocity(jumpForce);
  }, [isPlaying, gameOver, jumpForce]);
  
  // Game loop
  useEffect(() => {
    if (!isPlaying || gameOver) return;
    
    const gameLoop = setInterval(() => {
      setBirdY(prev => {
        const newY = prev + birdVelocity;
        // Check ground/ceiling collision
        if (newY < -5.5 || newY > 5.5) {
          setGameOver(true);
          setIsPlaying(false);
          if (score > highScore) setHighScore(score);
          return prev;
        }
        return newY;
      });
      
      setBirdVelocity(prev => prev - gravity);
      
      setPipes(prev => {
        const newPipes = prev.map(pipe => ({
          ...pipe,
          x: pipe.x - gameSpeed
        }));
        
        // Check for scoring
        newPipes.forEach(pipe => {
          if (pipe.x < -3 && pipe.x > -3 - gameSpeed) {
            setScore(s => s + 1);
          }
        });
        
        // Check collision with pipes
        const birdX = -3;
        const birdRadius = 0.4;
        
        for (const pipe of newPipes) {
          if (Math.abs(pipe.x - birdX) < 0.75 + birdRadius) {
            const gapTop = pipe.gapY + gapSize / 2;
            const gapBottom = pipe.gapY - gapSize / 2;
            
            if (birdY > gapTop - birdRadius || birdY < gapBottom + birdRadius) {
              setGameOver(true);
              setIsPlaying(false);
              if (score > highScore) setHighScore(score);
              return prev;
            }
          }
        }
        
        // Recycle pipes
        if (newPipes[0].x < -10) {
          newPipes.shift();
          const lastPipe = newPipes[newPipes.length - 1];
          newPipes.push({
            x: lastPipe.x + 6,
            gapY: (Math.random() - 0.5) * 4
          });
        }
        
        return newPipes;
      });
    }, 16);
    
    return () => clearInterval(gameLoop);
  }, [isPlaying, gameOver, birdVelocity, gravity, gameSpeed, gapSize, score, highScore]);
  
  // Input handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (!isPlaying && !gameOver) {
          startGame();
        } else {
          jump();
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, gameOver, startGame, jump]);
  
  const handleCanvasClick = () => {
    if (!isPlaying && !gameOver) {
      startGame();
    } else if (isPlaying) {
      jump();
    }
  };
  
  return (
    <div className="relative w-full h-screen bg-gradient-to-b from-sky-400 to-sky-600">
      {/* Header */}
      <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center">
        <Button
          variant="outline"
          size="sm"
          onClick={onBack}
          className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        
        <div className="flex gap-4 text-white font-bold">
          <span className="bg-black/30 px-3 py-1 rounded-full">Score: {score}</span>
          <span className="bg-black/30 px-3 py-1 rounded-full">Best: {highScore}</span>
        </div>
      </div>
      
      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 0, 12], fov: 60 }}
        onClick={handleCanvasClick}
        style={{ cursor: 'pointer' }}
      >
        <React.Suspense fallback={<Loader />}>
          <GameScene
            birdY={birdY}
            birdVelocity={birdVelocity}
            pipes={pipes}
            score={score}
            gameSpeed={gameSpeed}
          />
        </React.Suspense>
      </Canvas>
      
      {/* Start Screen */}
      {!isPlaying && !gameOver && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-20">
          <div className="text-center text-white">
            <h1 className="text-4xl font-bold mb-4">Flappy Bird 3D</h1>
            <p className="text-xl mb-6">Level {level}</p>
            <Button
              size="lg"
              onClick={startGame}
              className="bg-yellow-500 hover:bg-yellow-600 text-white"
            >
              <Play className="w-5 h-5 mr-2" />
              Start Game
            </Button>
            <p className="mt-4 text-sm opacity-75">Click or press Space to flap</p>
          </div>
        </div>
      )}
      
      {/* Game Over Screen */}
      {gameOver && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 text-center max-w-sm">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Game Over!</h2>
            <p className="text-5xl font-bold text-yellow-500 mb-2">{score}</p>
            <p className="text-gray-600 mb-4">Best: {highScore}</p>
            
            {score >= 10 && (
              <p className="text-green-600 font-semibold mb-4">
                🎉 Great job! +{Math.floor(score / 2)} coins earned!
              </p>
            )}
            
            <div className="flex gap-3 justify-center">
              <Button onClick={startGame} className="bg-yellow-500 hover:bg-yellow-600">
                <RotateCcw className="w-4 h-4 mr-2" />
                Play Again
              </Button>
              <Button variant="outline" onClick={onBack}>
                Exit
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Mobile tap area indicator */}
      {isPlaying && (
        <div className="absolute bottom-4 left-0 right-0 text-center text-white/50 text-sm z-10">
          Tap anywhere to flap!
        </div>
      )}
    </div>
  );
}
