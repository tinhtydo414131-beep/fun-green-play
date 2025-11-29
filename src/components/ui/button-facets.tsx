export const ButtonFacets = () => {
  return (
    <>
      {/* Multiple crystalline facet layers */}
      <div className="absolute inset-0 opacity-60 pointer-events-none">
        {/* Top-left facet */}
        <div 
          className="absolute top-0 left-0 w-1/2 h-1/2 bg-gradient-to-br from-cyan-300/40 via-transparent to-transparent"
          style={{ 
            clipPath: "polygon(0 0, 100% 0, 50% 100%, 0 50%)",
            filter: "blur(0.5px)"
          }}
        />
        
        {/* Top-right facet */}
        <div 
          className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-bl from-purple-300/40 via-transparent to-transparent"
          style={{ 
            clipPath: "polygon(0 0, 100% 0, 100% 50%, 50% 100%)",
            filter: "blur(0.5px)"
          }}
        />
        
        {/* Bottom-left facet */}
        <div 
          className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-blue-300/40 via-transparent to-transparent"
          style={{ 
            clipPath: "polygon(0 100%, 50% 0, 0 50%)",
            filter: "blur(0.5px)"
          }}
        />
        
        {/* Bottom-right facet */}
        <div 
          className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-gradient-to-tl from-violet-300/40 via-transparent to-transparent"
          style={{ 
            clipPath: "polygon(100% 100%, 50% 0, 100% 50%)",
            filter: "blur(0.5px)"
          }}
        />
        
        {/* Center diamond facets */}
        <div 
          className="absolute top-1/4 left-1/4 w-1/2 h-1/2 bg-gradient-to-br from-white/30 via-cyan-200/20 to-transparent"
          style={{ 
            clipPath: "polygon(50% 0, 100% 50%, 50% 100%, 0 50%)",
            filter: "blur(1px)",
            animation: "spin 20s linear infinite"
          }}
        />
      </div>
      
      {/* Light refraction lines */}
      <div className="absolute inset-0 opacity-40 pointer-events-none overflow-hidden">
        <div 
          className="absolute top-0 left-1/4 w-0.5 h-full bg-gradient-to-b from-transparent via-cyan-200 to-transparent"
          style={{ transform: "rotate(15deg)", transformOrigin: "top" }}
        />
        <div 
          className="absolute top-0 right-1/4 w-0.5 h-full bg-gradient-to-b from-transparent via-purple-200 to-transparent"
          style={{ transform: "rotate(-15deg)", transformOrigin: "top" }}
        />
        <div 
          className="absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-blue-200 to-transparent"
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
