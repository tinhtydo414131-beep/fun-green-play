import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  delay: number;
  duration: number;
  type: 'star' | 'sparkle' | 'crown' | 'diamond';
}

interface LegendParticleEffectProps {
  isLegend: boolean;
}

const PARTICLE_COLORS = [
  'rgba(168, 85, 247, 0.9)',   // Purple
  'rgba(236, 72, 153, 0.9)',   // Pink
  'rgba(251, 191, 36, 0.9)',   // Gold
  'rgba(96, 165, 250, 0.9)',   // Blue
  'rgba(52, 211, 153, 0.8)',   // Emerald
];

const PARTICLE_TYPES: Particle['type'][] = ['star', 'sparkle', 'crown', 'diamond'];

const LegendParticleEffect = ({ isLegend }: LegendParticleEffectProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Generate particles on mount
  const particles: Particle[] = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 12 + Math.random() * 18,
    color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
    delay: Math.random() * 3,
    duration: 4 + Math.random() * 4,
    type: PARTICLE_TYPES[Math.floor(Math.random() * PARTICLE_TYPES.length)],
  }));

  const renderParticle = (particle: Particle) => {
    switch (particle.type) {
      case 'crown':
        return '👑';
      case 'diamond':
        return '💎';
      case 'star':
        return '⭐';
      case 'sparkle':
        return '✨';
      default:
        return '✨';
    }
  };

  if (!isLegend) return null;

  return (
    <AnimatePresence>
      <div 
        ref={containerRef}
        className="fixed inset-0 pointer-events-none z-50 overflow-hidden"
        aria-hidden="true"
      >
        {/* Floating particles */}
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              fontSize: particle.size,
            }}
            initial={{ opacity: 0, scale: 0, y: 20 }}
            animate={{
              opacity: [0, 1, 1, 0],
              scale: [0, 1.2, 1, 0.8],
              y: [20, -30, -50, -80],
              x: [0, Math.random() * 40 - 20, Math.random() * 60 - 30],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: particle.duration,
              delay: particle.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {renderParticle(particle)}
          </motion.div>
        ))}

        {/* Corner glow effects */}
        <motion.div
          className="absolute top-0 left-0 w-64 h-64 bg-gradient-radial from-purple-500/30 via-pink-500/20 to-transparent rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-0 right-0 w-64 h-64 bg-gradient-radial from-amber-500/30 via-orange-500/20 to-transparent rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.2, 0.4],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-gradient-radial from-purple-500/20 via-pink-500/10 to-transparent rounded-full blur-3xl"
          animate={{
            scaleX: [1, 1.5, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Legend badge floating indicator */}
        <motion.div
          className="absolute top-20 left-1/2 -translate-x-1/2"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          <motion.div
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-purple-500/90 via-pink-500/90 to-amber-500/90 shadow-2xl backdrop-blur-sm border-2 border-white/30"
            animate={{
              y: [0, -8, 0],
              boxShadow: [
                '0 10px 40px rgba(168, 85, 247, 0.4)',
                '0 20px 60px rgba(236, 72, 153, 0.6)',
                '0 10px 40px rgba(168, 85, 247, 0.4)',
              ],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <span className="text-2xl">👑</span>
            <span className="font-fredoka font-bold text-white text-lg drop-shadow-lg">
              Referral Legend
            </span>
            <span className="text-2xl">👑</span>
          </motion.div>
        </motion.div>

        {/* Shimmer overlay */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
          animate={{
            x: ['-100%', '100%'],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear",
            repeatDelay: 2,
          }}
        />
      </div>
    </AnimatePresence>
  );
};

export default LegendParticleEffect;
