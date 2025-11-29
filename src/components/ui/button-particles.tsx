import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  size: number;
  color: string;
}

export const ButtonParticles = ({ isHovered }: { isHovered: boolean }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const colors = [
      "rgba(180, 130, 255, 0.8)", // Purple
      "rgba(100, 200, 255, 0.8)", // Cyan
      "rgba(255, 255, 255, 0.9)", // White
      "rgba(150, 100, 255, 0.7)", // Deep purple
      "rgba(0, 255, 255, 0.6)",   // Bright cyan
    ];

    const createParticle = () => {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.5 + Math.random() * 1.5;
      
      particlesRef.current.push({
        x: canvas.width / 2,
        y: canvas.height / 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1, // Slight upward bias
        life: 1,
        size: 2 + Math.random() * 3,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    };

    let lastTime = Date.now();
    let particleTimer = 0;

    const animate = () => {
      const now = Date.now();
      const deltaTime = now - lastTime;
      lastTime = now;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Create particles when hovering
      if (isHovered) {
        particleTimer += deltaTime;
        if (particleTimer > 50) { // Create particles every 50ms
          createParticle();
          particleTimer = 0;
        }
      }

      // Update and draw particles
      particlesRef.current = particlesRef.current.filter((particle) => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.life -= 0.01;

        if (particle.life <= 0) return false;

        ctx.save();
        ctx.globalAlpha = particle.life;
        ctx.fillStyle = particle.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = particle.color;
        
        // Draw diamond shape
        ctx.beginPath();
        const halfSize = particle.size / 2;
        ctx.moveTo(particle.x, particle.y - halfSize);
        ctx.lineTo(particle.x + halfSize, particle.y);
        ctx.lineTo(particle.x, particle.y + halfSize);
        ctx.lineTo(particle.x - halfSize, particle.y);
        ctx.closePath();
        ctx.fill();
        
        ctx.restore();

        return true;
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isHovered]);

  return (
    <canvas
      ref={canvasRef}
      width={200}
      height={100}
      className="absolute inset-0 pointer-events-none"
      style={{ width: "100%", height: "100%" }}
    />
  );
};
