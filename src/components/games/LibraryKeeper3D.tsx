import React, { useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, Environment, OrbitControls, useProgress, Html, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RotateCcw } from 'lucide-react';

interface LibraryKeeper3DProps {
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
          <div className="h-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
        <p className="text-white text-sm">Loading... {progress.toFixed(0)}%</p>
      </div>
    </Html>
  );
}

interface Book {
  id: string;
  color: string;
  category: 'fiction' | 'science' | 'history' | 'art';
  position: [number, number, number];
  sorted: boolean;
}

const CATEGORY_COLORS: Record<string, string> = {
  fiction: '#ef4444',
  science: '#3b82f6',
  history: '#eab308',
  art: '#a855f7'
};

function BookModel({ color, isSelected }: { color: string; isSelected: boolean }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (ref.current && isSelected) {
      ref.current.position.y = 0.1 + Math.sin(state.clock.elapsedTime * 5) * 0.05;
      ref.current.rotation.y = state.clock.elapsedTime * 2;
    }
  });
  
  return (
    <mesh ref={ref}>
      <boxGeometry args={[0.3, 0.5, 0.1]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

function Bookshelf({ position, category, books, onDropBook }: { 
  position: [number, number, number]; 
  category: string; 
  books: Book[];
  onDropBook: () => void;
}) {
  const shelfColor = CATEGORY_COLORS[category];
  
  return (
    <group position={position} onClick={onDropBook}>
      {/* Shelf frame */}
      <RoundedBox args={[2, 3, 0.8]} radius={0.05} position={[0, 1.5, 0]}>
        <meshStandardMaterial color="#92400e" />
      </RoundedBox>
      {/* Shelves */}
      {[0.5, 1.5, 2.5].map((y, i) => (
        <mesh key={i} position={[0, y, 0.1]}>
          <boxGeometry args={[1.8, 0.1, 0.6]} />
          <meshStandardMaterial color="#b45309" />
        </mesh>
      ))}
      {/* Category label */}
      <mesh position={[0, 3.2, 0]}>
        <boxGeometry args={[1.5, 0.4, 0.1]} />
        <meshStandardMaterial color={shelfColor} />
      </mesh>
      <Text position={[0, 3.2, 0.1]} fontSize={0.2} color="#fff" anchorX="center">
        {category.charAt(0).toUpperCase() + category.slice(1)}
      </Text>
      {/* Books on shelf */}
      {books.filter(b => b.sorted).slice(0, 8).map((book, i) => (
        <group key={book.id} position={[-0.7 + i * 0.2, 0.8 + Math.floor(i / 4) * 0.6, 0.1]}>
          <BookModel color={book.color} isSelected={false} />
        </group>
      ))}
    </group>
  );
}

function UnsortedTable({ position, books, selectedBook, onSelectBook }: { 
  position: [number, number, number]; 
  books: Book[];
  selectedBook: string | null;
  onSelectBook: (id: string) => void;
}) {
  return (
    <group position={position}>
      {/* Table */}
      <mesh position={[0, 0.4, 0]}>
        <boxGeometry args={[4, 0.1, 1.5]} />
        <meshStandardMaterial color="#78350f" />
      </mesh>
      {/* Table legs */}
      {[[-1.8, -0.6], [1.8, -0.6], [-1.8, 0.6], [1.8, 0.6]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.2, z]}>
          <cylinderGeometry args={[0.08, 0.08, 0.4, 8]} />
          <meshStandardMaterial color="#78350f" />
        </mesh>
      ))}
      {/* Books on table */}
      {books.filter(b => !b.sorted).slice(0, 6).map((book, i) => (
        <group key={book.id} position={[-1.5 + i * 0.6, 0.7, 0]} onClick={() => onSelectBook(book.id)}>
          <BookModel color={book.color} isSelected={selectedBook === book.id} />
        </group>
      ))}
      <Text position={[0, 1.2, 0]} fontSize={0.2} color="#78350f">📚 Unsorted Books</Text>
    </group>
  );
}

function GameScene({ books, selectedBook, onSelectBook, onDropBook, score }: { 
  books: Book[];
  selectedBook: string | null;
  onSelectBook: (id: string) => void;
  onDropBook: (category: string) => void;
  score: number;
}) {
  const categories = ['fiction', 'science', 'history', 'art'];
  const shelfPositions: [number, number, number][] = [[-4.5, 0, -3], [-1.5, 0, -3], [1.5, 0, -3], [4.5, 0, -3]];
  
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 10, 5]} intensity={0.7} />
      <pointLight position={[0, 5, 0]} intensity={0.3} color="#fbbf24" />
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[15, 12]} />
        <meshStandardMaterial color="#fef3c7" />
      </mesh>
      {/* Bookshelves */}
      {categories.map((cat, i) => (
        <Bookshelf key={cat} position={shelfPositions[i]} category={cat} 
          books={books.filter(b => b.category === cat)} onDropBook={() => onDropBook(cat)} />
      ))}
      {/* Unsorted table */}
      <UnsortedTable position={[0, 0, 3]} books={books} selectedBook={selectedBook} onSelectBook={onSelectBook} />
      <Text position={[0, 5, 0]} fontSize={0.5} color="#78350f">📖 Library Score: {score}</Text>
      <OrbitControls enablePan={false} minDistance={8} maxDistance={18} maxPolarAngle={Math.PI / 2.2} />
      <Environment preset="apartment" />
    </>
  );
}

const CATEGORIES: Book['category'][] = ['fiction', 'science', 'history', 'art'];

export default function LibraryKeeper3D({ level = 1, onLevelComplete, onBack }: LibraryKeeper3DProps) {
  const [books, setBooks] = useState<Book[]>(() => {
    const initialBooks: Book[] = [];
    for (let i = 0; i < 12; i++) {
      const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
      initialBooks.push({
        id: `book-${i}`,
        color: CATEGORY_COLORS[category],
        category,
        position: [0, 0, 0],
        sorted: false
      });
    }
    return initialBooks;
  });
  const [selectedBook, setSelectedBook] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [sortedCount, setSortedCount] = useState(0);
  const targetSorted = 10 + level * 5;

  // Spawn new books periodically
  React.useEffect(() => {
    const interval = setInterval(() => {
      if (books.filter(b => !b.sorted).length < 6) {
        const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
        setBooks(prev => [...prev, {
          id: `book-${Date.now()}`,
          color: CATEGORY_COLORS[category],
          category,
          position: [0, 0, 0],
          sorted: false
        }]);
      }
    }, 4000 - level * 300);
    return () => clearInterval(interval);
  }, [level, books]);

  React.useEffect(() => {
    if (sortedCount >= targetSorted && onLevelComplete) {
      onLevelComplete(score, Math.floor(score / 20));
    }
  }, [sortedCount, targetSorted, score, onLevelComplete]);

  const handleSelectBook = (id: string) => {
    setSelectedBook(selectedBook === id ? null : id);
  };

  const handleDropBook = (category: string) => {
    if (!selectedBook) return;
    const book = books.find(b => b.id === selectedBook);
    if (!book) return;
    
    if (book.category === category) {
      setBooks(prev => prev.map(b => b.id === selectedBook ? { ...b, sorted: true } : b));
      setScore(prev => prev + 100);
      setSortedCount(prev => prev + 1);
    } else {
      setScore(prev => Math.max(0, prev - 20));
    }
    setSelectedBook(null);
  };

  const resetGame = () => {
    const newBooks: Book[] = [];
    for (let i = 0; i < 12; i++) {
      const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
      newBooks.push({ id: `book-${i}`, color: CATEGORY_COLORS[category], category, position: [0, 0, 0], sorted: false });
    }
    setBooks(newBooks);
    setSelectedBook(null);
    setScore(0);
    setSortedCount(0);
  };

  return (
    <div className="relative w-full h-screen bg-gradient-to-b from-amber-100 to-orange-200">
      <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center">
        <Button variant="outline" size="sm" onClick={onBack} className="bg-white/80"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
        <div className="flex gap-2">
          <span className="bg-amber-600/80 text-white rounded-full px-4 py-2 font-bold">Level {level}</span>
          <span className="bg-green-500/80 text-white rounded-full px-4 py-2 font-bold">Sorted: {sortedCount}/{targetSorted}</span>
          <span className="bg-yellow-500/80 text-white rounded-full px-4 py-2 font-bold">Score: {score}</span>
        </div>
        <Button variant="outline" size="sm" onClick={resetGame} className="bg-white/80"><RotateCcw className="w-4 h-4" /></Button>
      </div>
      <Canvas camera={{ position: [0, 6, 10], fov: 50 }} shadows>
        <React.Suspense fallback={<Loader />}>
          <GameScene books={books} selectedBook={selectedBook} onSelectBook={handleSelectBook} onDropBook={handleDropBook} score={score} />
        </React.Suspense>
      </Canvas>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 bg-white/80 rounded-xl px-4 py-2 text-sm">
        Select a book, then click the correct shelf to sort it!
      </div>
      {sortedCount >= targetSorted && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20">
          <div className="bg-white rounded-2xl p-8 text-center">
            <h2 className="text-3xl font-bold text-amber-600 mb-4">📚 Level Complete!</h2>
            <p className="text-gray-600 mb-2">Books sorted: {sortedCount}</p>
            <p className="text-yellow-500 font-bold mb-4">+{Math.floor(score / 20)} coins</p>
            <Button onClick={onBack} className="bg-amber-600">Continue</Button>
          </div>
        </div>
      )}
    </div>
  );
}
