export const ButtonFacets = () => {
  return (
    <>
      {/* Ambient diamond glow halo - Reduced intensity */}
      <div className="absolute inset-[-6px] rounded-2xl bg-gradient-radial from-cyan-400/15 via-purple-400/10 to-transparent blur-xl opacity-50 pointer-events-none" />
      
      {/* Multiple crystalline facet layers with prismatic colors */}
      <div className="absolute inset-0 opacity-70 pointer-events-none">
        {/* Top-left facet - Cyan to Magenta */}
        <div 
          className="absolute top-0 left-0 w-1/2 h-1/2 bg-gradient-to-br from-cyan-300/50 via-blue-300/30 to-transparent"
          style={{ 
            clipPath: "polygon(0 0, 100% 0, 50% 100%, 0 50%)",
            filter: "blur(0.3px)"
          }}
        />
        
        {/* Top-right facet - Purple to Cyan */}
        <div 
          className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-bl from-purple-300/50 via-violet-300/30 to-transparent"
          style={{ 
            clipPath: "polygon(0 0, 100% 0, 100% 50%, 50% 100%)",
            filter: "blur(0.3px)"
          }}
        />
        
        {/* Bottom-left facet - Blue to Violet */}
        <div 
          className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-blue-400/50 via-indigo-300/30 to-transparent"
          style={{ 
            clipPath: "polygon(0 100%, 50% 0, 0 50%)",
            filter: "blur(0.3px)"
          }}
        />
        
        {/* Bottom-right facet - Violet to Cyan */}
        <div 
          className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-gradient-to-tl from-violet-400/50 via-purple-300/30 to-transparent"
          style={{ 
            clipPath: "polygon(100% 100%, 50% 0, 100% 50%)",
            filter: "blur(0.3px)"
          }}
        />
        
        {/* Center diamond facets with prismatic effect */}
        <div 
          className="absolute top-1/4 left-1/4 w-1/2 h-1/2 bg-gradient-to-br from-white/40 via-cyan-200/30 to-purple-200/20"
          style={{ 
            clipPath: "polygon(50% 0, 100% 50%, 50% 100%, 0 50%)",
            filter: "blur(0.8px)",
            animation: "spin 20s linear infinite"
          }}
        />
        
        {/* Additional prismatic layers */}
        <div 
          className="absolute top-[15%] left-[15%] w-[70%] h-[70%] bg-gradient-to-br from-pink-300/20 via-transparent to-cyan-300/20"
          style={{ 
            clipPath: "polygon(30% 0, 70% 0, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0 70%, 0 30%)",
            filter: "blur(1px)"
          }}
        />
      </div>
      
      {/* Enhanced prismatic light refraction lines */}
      <div className="absolute inset-0 opacity-50 pointer-events-none overflow-hidden">
        <div 
          className="absolute top-0 left-1/4 w-1 h-full bg-gradient-to-b from-transparent via-cyan-300 to-transparent"
          style={{ transform: "rotate(15deg)", transformOrigin: "top", filter: "blur(1px)" }}
        />
        <div 
          className="absolute top-0 right-1/4 w-1 h-full bg-gradient-to-b from-transparent via-purple-300 to-transparent"
          style={{ transform: "rotate(-15deg)", transformOrigin: "top", filter: "blur(1px)" }}
        />
        <div 
          className="absolute top-1/2 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-300 to-transparent"
          style={{ filter: "blur(1px)" }}
        />
        <div 
          className="absolute top-0 left-1/3 w-0.5 h-full bg-gradient-to-b from-transparent via-pink-300 to-transparent"
          style={{ transform: "rotate(25deg)", transformOrigin: "top", filter: "blur(0.5px)" }}
        />
        <div 
          className="absolute top-0 right-1/3 w-0.5 h-full bg-gradient-to-b from-transparent via-violet-300 to-transparent"
          style={{ transform: "rotate(-25deg)", transformOrigin: "top", filter: "blur(0.5px)" }}
        />
      </div>
      
      {/* Sparkling highlights */}
      <div className="absolute inset-0 pointer-events-none">
        <div 
          className="absolute top-[15%] left-[20%] w-2 h-2 bg-white rounded-full blur-sm opacity-80 animate-[sparkle_2s_ease-in-out_infinite]"
          style={{ animationDelay: "0s" }}
        />
        <div 
          className="absolute top-[25%] right-[25%] w-1.5 h-1.5 bg-cyan-200 rounded-full blur-sm opacity-70 animate-[sparkle_2s_ease-in-out_infinite]"
          style={{ animationDelay: "0.5s" }}
        />
        <div 
          className="absolute bottom-[30%] left-[30%] w-1 h-1 bg-purple-200 rounded-full blur-sm opacity-60 animate-[sparkle_2s_ease-in-out_infinite]"
          style={{ animationDelay: "1s" }}
        />
        <div 
          className="absolute bottom-[20%] right-[20%] w-1.5 h-1.5 bg-white rounded-full blur-sm opacity-75 animate-[sparkle_2s_ease-in-out_infinite]"
          style={{ animationDelay: "1.5s" }}
        />
      </div>
    </>
  );
};
