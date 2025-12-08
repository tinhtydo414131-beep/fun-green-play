import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Eraser, Paintbrush, Download, Trash2, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

interface MiniDrawingGameProps {
  onComplete?: (score: number) => void;
  onBack?: () => void;
}

const COLORS = [
  '#FF6B00', '#0066FF', '#00CC66', '#FF3366', '#9933FF',
  '#FFD700', '#00CCCC', '#FF6699', '#333333', '#FFFFFF',
];

export function MiniDrawingGame({ onComplete, onBack }: MiniDrawingGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#FF6B00');
  const [brushSize, setBrushSize] = useState(5);
  const [isEraser, setIsEraser] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set white background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    if ('touches' in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = brushSize;
    ctx.strokeStyle = isEraser ? '#FFFFFF' : color;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;
    
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const downloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const link = document.createElement('a');
    link.download = 'my-artwork.png';
    link.href = canvas.toDataURL();
    link.click();
    
    onComplete?.(100); // Award points for completing artwork
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4 max-w-lg mx-auto">
      {/* Header */}
      <div className="w-full flex items-center justify-between">
        <div className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          🎨 Art Studio
        </div>
        {onBack && (
          <Button variant="outline" size="sm" onClick={onBack}>
            Back
          </Button>
        )}
      </div>

      {/* Canvas */}
      <div className="w-full aspect-[4/3] rounded-xl overflow-hidden border-4 border-primary/30 shadow-lg bg-white">
        <canvas
          ref={canvasRef}
          width={400}
          height={300}
          className="w-full h-full touch-none cursor-crosshair"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </div>

      {/* Color Palette */}
      <motion.div 
        className="flex flex-wrap justify-center gap-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {COLORS.map((c) => (
          <motion.button
            key={c}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => { setColor(c); setIsEraser(false); }}
            className={`w-8 h-8 rounded-full border-2 ${
              color === c && !isEraser ? 'border-foreground ring-2 ring-primary' : 'border-muted'
            }`}
            style={{ backgroundColor: c }}
          />
        ))}
      </motion.div>

      {/* Brush Size */}
      <div className="w-full max-w-xs flex items-center gap-4">
        <Paintbrush className="w-5 h-5 text-muted-foreground" />
        <Slider
          value={[brushSize]}
          onValueChange={(v) => setBrushSize(v[0])}
          min={1}
          max={30}
          step={1}
          className="flex-1"
        />
        <span className="text-sm font-mono w-8">{brushSize}px</span>
      </div>

      {/* Tools */}
      <div className="flex gap-2 flex-wrap justify-center">
        <Button
          variant={isEraser ? 'default' : 'outline'}
          onClick={() => setIsEraser(!isEraser)}
          className="gap-2"
        >
          <Eraser className="w-4 h-4" />
          Eraser
        </Button>
        <Button variant="outline" onClick={clearCanvas} className="gap-2">
          <Trash2 className="w-4 h-4" />
          Clear
        </Button>
        <Button onClick={downloadImage} className="gap-2 bg-gradient-to-r from-primary to-secondary">
          <Download className="w-4 h-4" />
          Save Art
        </Button>
      </div>
    </div>
  );
}
