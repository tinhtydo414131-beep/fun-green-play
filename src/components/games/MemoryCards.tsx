import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { useGameAudio } from "@/hooks/useGameAudio";
import { AudioControls } from "@/components/AudioControls";

interface CardType {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export const MemoryCards = () => {
  const emojis = ['🍎', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🥝'];
  const [cards, setCards] = useState<CardType[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const { playClick, playSuccess, playError, startBackgroundMusic, toggleMusic, toggleSound, isMusicEnabled, isSoundEnabled } = useGameAudio();

  useEffect(() => {
    initializeGame();
    startBackgroundMusic();
  }, []);

  const initializeGame = () => {
    const shuffledCards = [...emojis, ...emojis]
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({
        id: index,
        emoji,
        isFlipped: false,
        isMatched: false,
      }));
    setCards(shuffledCards);
    setFlippedCards([]);
    setMoves(0);
  };

  const handleCardClick = (id: number) => {
    if (flippedCards.length === 2 || cards[id].isFlipped || cards[id].isMatched) return;

    const newFlippedCards = [...flippedCards, id];
    setFlippedCards(newFlippedCards);
    playClick();
    
    const newCards = [...cards];
    newCards[id].isFlipped = true;
    setCards(newCards);

    if (newFlippedCards.length === 2) {
      setMoves(moves + 1);
      const [first, second] = newFlippedCards;
      
      if (cards[first].emoji === cards[second].emoji) {
        newCards[first].isMatched = true;
        newCards[second].isMatched = true;
        setCards(newCards);
        setFlippedCards([]);
        playSuccess();
        
        if (newCards.every(card => card.isMatched)) {
          toast.success(`🎉 Chúc mừng! Hoàn thành với ${moves + 1} nước đi!`);
        }
      } else {
        playError();
        setTimeout(() => {
          newCards[first].isFlipped = false;
          newCards[second].isFlipped = false;
          setCards(newCards);
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  return (
    <div className="flex flex-col items-center gap-8 p-6 animate-fade-in">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-fredoka font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
          🧠 Trí Nhớ Siêu Đẳng
        </h2>
        <p className="text-2xl font-comic text-primary">
          Số nước đi: {moves} 🎯
        </p>
        <AudioControls 
          isMusicEnabled={isMusicEnabled}
          isSoundEnabled={isSoundEnabled}
          onToggleMusic={toggleMusic}
          onToggleSound={toggleSound}
        />
      </div>
      
      <div className="grid grid-cols-4 gap-4 w-full max-w-2xl p-6 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-3xl shadow-2xl border-4 border-primary/30">
        {cards.map((card) => (
          <Card
            key={card.id}
            onClick={() => handleCardClick(card.id)}
            className={`aspect-square flex items-center justify-center text-5xl cursor-pointer transition-all duration-300 border-4 transform hover:scale-110 shadow-lg hover:shadow-2xl ${
              card.isFlipped || card.isMatched
                ? 'bg-gradient-to-br from-primary/30 to-secondary/30 border-primary rotate-y-180'
                : 'bg-gradient-to-br from-background to-muted border-primary/30 hover:border-primary'
            }`}
          >
            {card.isFlipped || card.isMatched ? card.emoji : '❓'}
          </Card>
        ))}
      </div>
      
      <Button 
        onClick={initializeGame} 
        size="lg"
        className="font-fredoka font-bold text-xl px-12 py-8 bg-gradient-to-r from-primary via-secondary to-accent hover:shadow-2xl transform hover:scale-110 transition-all"
      >
        Chơi Lại 🔄
      </Button>
    </div>
  );
};
