import { motion } from 'framer-motion';

interface LoadingSpinner3DProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const LoadingSpinner3D = ({ message = 'Đang tải...', size = 'md' }: LoadingSpinner3DProps) => {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-20 h-20',
    lg: 'w-32 h-32'
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-xl'
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      {/* 3D Planet Spinner */}
      <div className={`relative ${sizeClasses[size]}`}>
        {/* Outer ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary border-r-secondary"
          style={{ 
            background: 'conic-gradient(from 0deg, transparent, hsl(var(--primary)), transparent)',
            WebkitMaskImage: 'radial-gradient(circle, transparent 55%, black 56%)',
            maskImage: 'radial-gradient(circle, transparent 55%, black 56%)'
          }}
        />
        
        {/* Planet core */}
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            rotateY: [0, 180, 360]
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity, 
            ease: 'easeInOut'
          }}
          className="absolute inset-[15%] rounded-full bg-gradient-to-br from-primary via-secondary to-accent shadow-lg"
          style={{
            transformStyle: 'preserve-3d'
          }}
        >
          {/* Planet surface details */}
          <div className="absolute inset-0 rounded-full overflow-hidden opacity-50">
            <div className="absolute top-1/4 left-1/4 w-1/4 h-1/4 bg-white/30 rounded-full blur-sm" />
            <div className="absolute bottom-1/3 right-1/4 w-1/5 h-1/5 bg-white/20 rounded-full blur-sm" />
          </div>
        </motion.div>

        {/* Orbiting moons */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-[-20%]"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-accent rounded-full shadow-lg shadow-accent/50" />
        </motion.div>
        
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-[-30%]"
        >
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-secondary rounded-full shadow-lg shadow-secondary/50" />
        </motion.div>
      </div>

      {/* Loading text */}
      <motion.p
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className={`font-bold text-primary ${textSizes[size]}`}
      >
        {message}
      </motion.p>

      {/* Sparkle dots */}
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            animate={{ 
              scale: [1, 1.5, 1],
              opacity: [0.3, 1, 0.3]
            }}
            transition={{ 
              duration: 0.8, 
              repeat: Infinity, 
              delay: i * 0.2 
            }}
            className="w-2 h-2 bg-primary rounded-full"
          />
        ))}
      </div>
    </div>
  );
};

export default LoadingSpinner3D;
