import React from 'react';

interface CompassProps {
  bearing: number | null;
}

const Compass: React.FC<CompassProps> = ({ bearing }) => {
  return (
    <div className="relative w-64 h-64 flex items-center justify-center">
        <style>{`
            @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            @keyframes spin-reverse { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
            .animate-spin-slow { animation: spin 40s linear infinite; }
            .animate-spin-medium { animation: spin-reverse 25s linear infinite; }
            @keyframes pulse-glow { 0%, 100% { box-shadow: 0 0 20px 5px #06b6d4; } 50% { box-shadow: 0 0 30px 10px #06b6d4; } }
        `}</style>
        
      {/* Outer rings */}
      <div className="absolute w-full h-full border-2 border-cyan-500/30 rounded-full animate-spin-slow"></div>
      <div className="absolute w-[85%] h-[85%] border-2 border-cyan-500/40 rounded-full animate-spin-medium"></div>
      <div className="absolute w-[70%] h-[70%] bg-gray-900/50 rounded-full border-2 border-cyan-500/60"></div>
      
      {/* Directional markers */}
      <div className="absolute w-full h-full">
        {['N', 'E', 'S', 'W'].map((dir, i) => (
          <div
            key={dir}
            className="absolute w-full h-full"
            style={{ transform: `rotate(${i * 90}deg)`}}
          >
            <span
              className="absolute top-1 left-1/2 -translate-x-1/2 text-cyan-300 font-bold text-2xl"
            >
              {dir}
            </span>
          </div>
        ))}
      </div>

      {/* Needle */}
      <div
        className="transition-transform duration-500 ease-in-out absolute w-full h-full"
        style={{ transform: `rotate(${bearing ?? 0}deg)` }}
      >
        <svg width="100%" height="100%" viewBox="0 0 256 256" className="drop-shadow-[0_0_10px_#ef4444]">
          <polygon points="128,10 160,128 128,110 96,128" className="fill-red-500" />
        </svg>
      </div>
      <div className="w-4 h-4 rounded-full bg-red-500 absolute animate-pulse-glow"></div>
    </div>
  );
};

export default Compass;