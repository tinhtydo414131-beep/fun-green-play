export const ButtonLightRays = ({ isHovered }: { isHovered: boolean }) => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-visible">
      {isHovered && (
        <>
          {/* Top rays */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full w-[2px] h-24 bg-gradient-to-t from-cyan-400/60 via-purple-400/40 to-transparent animate-[fade-in_0.3s_ease-out] origin-bottom" 
               style={{ transform: 'translateX(-50%) translateY(-100%) rotate(-15deg)' }} />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full w-[2px] h-28 bg-gradient-to-t from-purple-400/50 via-pink-400/30 to-transparent animate-[fade-in_0.35s_ease-out] origin-bottom" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full w-[2px] h-24 bg-gradient-to-t from-pink-400/60 via-cyan-400/40 to-transparent animate-[fade-in_0.4s_ease-out] origin-bottom" 
               style={{ transform: 'translateX(-50%) translateY(-100%) rotate(15deg)' }} />
          
          {/* Right rays */}
          <div className="absolute top-1/2 right-0 translate-x-full -translate-y-1/2 w-24 h-[2px] bg-gradient-to-r from-cyan-400/60 via-purple-400/40 to-transparent animate-[fade-in_0.3s_ease-out] origin-left" 
               style={{ transform: 'translateX(100%) translateY(-50%) rotate(-15deg)' }} />
          <div className="absolute top-1/2 right-0 translate-x-full -translate-y-1/2 w-28 h-[2px] bg-gradient-to-r from-purple-400/50 via-pink-400/30 to-transparent animate-[fade-in_0.35s_ease-out] origin-left" />
          <div className="absolute top-1/2 right-0 translate-x-full -translate-y-1/2 w-24 h-[2px] bg-gradient-to-r from-pink-400/60 via-cyan-400/40 to-transparent animate-[fade-in_0.4s_ease-out] origin-left" 
               style={{ transform: 'translateX(100%) translateY(-50%) rotate(15deg)' }} />
          
          {/* Bottom rays */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-[2px] h-24 bg-gradient-to-b from-cyan-400/60 via-purple-400/40 to-transparent animate-[fade-in_0.3s_ease-out] origin-top" 
               style={{ transform: 'translateX(-50%) translateY(100%) rotate(-15deg)' }} />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-[2px] h-28 bg-gradient-to-b from-purple-400/50 via-pink-400/30 to-transparent animate-[fade-in_0.35s_ease-out] origin-top" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-[2px] h-24 bg-gradient-to-b from-pink-400/60 via-cyan-400/40 to-transparent animate-[fade-in_0.4s_ease-out] origin-top" 
               style={{ transform: 'translateX(-50%) translateY(100%) rotate(15deg)' }} />
          
          {/* Left rays */}
          <div className="absolute top-1/2 left-0 -translate-x-full -translate-y-1/2 w-24 h-[2px] bg-gradient-to-l from-cyan-400/60 via-purple-400/40 to-transparent animate-[fade-in_0.3s_ease-out] origin-right" 
               style={{ transform: 'translateX(-100%) translateY(-50%) rotate(-15deg)' }} />
          <div className="absolute top-1/2 left-0 -translate-x-full -translate-y-1/2 w-28 h-[2px] bg-gradient-to-l from-purple-400/50 via-pink-400/30 to-transparent animate-[fade-in_0.35s_ease-out] origin-right" />
          <div className="absolute top-1/2 left-0 -translate-x-full -translate-y-1/2 w-24 h-[2px] bg-gradient-to-l from-pink-400/60 via-cyan-400/40 to-transparent animate-[fade-in_0.4s_ease-out] origin-right" 
               style={{ transform: 'translateX(-100%) translateY(-50%) rotate(15deg)' }} />
          
          {/* Diagonal rays - top left to bottom right */}
          <div className="absolute top-0 left-0 w-32 h-[1.5px] bg-gradient-to-br from-cyan-300/40 via-purple-300/25 to-transparent animate-[fade-in_0.4s_ease-out] origin-top-left rotate-45" 
               style={{ transform: 'rotate(45deg) translateX(-50%) translateY(-50%)' }} />
          
          {/* Diagonal rays - top right to bottom left */}
          <div className="absolute top-0 right-0 w-32 h-[1.5px] bg-gradient-to-bl from-pink-300/40 via-purple-300/25 to-transparent animate-[fade-in_0.4s_ease-out] origin-top-right -rotate-45" 
               style={{ transform: 'rotate(-45deg) translateX(50%) translateY(-50%)' }} />
          
          {/* Pulsing core light */}
          <div className="absolute inset-0 bg-gradient-radial from-white/10 via-transparent to-transparent animate-[pulse_2s_ease-in-out_infinite]" />
        </>
      )}
    </div>
  );
};
