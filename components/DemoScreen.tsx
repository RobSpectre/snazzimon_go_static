import React from 'react';
import type { Checkpoint, SnazzimonData } from '../types';

interface DemoScreenProps {
  checkpoints: Checkpoint[];
  allSnazzimons: SnazzimonData[];
  capturedSnazzimons: SnazzimonData[];
  onCheckpointSelect: (checkpointIndex: number) => void;
}

const DemoScreen: React.FC<DemoScreenProps> = ({
  checkpoints,
  allSnazzimons,
  capturedSnazzimons,
  onCheckpointSelect,
}) => {
  return (
    <div className="w-full h-full bg-slate-900 text-white flex flex-col overflow-hidden">
      <style>{`
        @keyframes pulse-mystery {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.05);
            opacity: 0.8;
          }
        }

        @keyframes shimmer-rainbow {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        .mystery-box {
          animation: pulse-mystery 2s ease-in-out infinite;
        }

        .rainbow-border {
          background: linear-gradient(
            90deg,
            #60a5fa,
            #a78bfa,
            #f472b6,
            #fbbf24,
            #34d399,
            #60a5fa
          );
          background-size: 200% 200%;
          animation: shimmer-rainbow 3s linear infinite;
        }

        @keyframes card-hover-float {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-10px) scale(1.02); }
        }

        @keyframes rotate-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .rotate-animation {
          animation: rotate-slow 20s linear infinite;
        }
      `}</style>

      {/* Header */}
      <div className="relative border-b-4 border-blue-500/30 bg-gradient-to-r from-blue-900/50 to-purple-900/50 p-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(96,165,250,0.2)_0%,_transparent_70%)]"></div>
        <div className="relative">
          <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 [text-shadow:0_2px_8px_rgba(59,130,246,0.5)] text-center">
            Demo Mode
          </h1>
          <p className="text-center text-blue-300 mt-2 text-lg font-semibold">
            Select any checkpoint to capture Snazzimons
          </p>
          <p className="text-center text-gray-400 mt-1 text-sm">
            {capturedSnazzimons.length} of {checkpoints.length} captured
          </p>
        </div>
      </div>

      {/* Checkpoint Grid */}
      <div className="flex-grow overflow-y-auto p-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
            {checkpoints.map((checkpoint, index) => {
              const snazzimon = allSnazzimons.find(s => s.id === checkpoint.snazzimonId);
              const isCaptured = capturedSnazzimons.some(s => s.id === checkpoint.snazzimonId);

              return (
                <div
                  key={checkpoint.id}
                  onClick={() => onCheckpointSelect(index)}
                  className="group relative cursor-pointer"
                  style={{
                    animation: `card-pop-in 0.6s ease-out forwards`,
                    animationDelay: `${index * 0.05}s`,
                    opacity: 0,
                  }}
                >
                  <style>{`
                    @keyframes card-pop-in {
                      0% {
                        opacity: 0;
                        transform: scale(0.5) rotate(-5deg);
                      }
                      60% {
                        transform: scale(1.05) rotate(2deg);
                      }
                      100% {
                        opacity: 1;
                        transform: scale(1) rotate(0deg);
                      }
                    }
                  `}</style>

                  {/* Card Container */}
                  <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 rounded-2xl p-4 border-2 border-slate-600 transition-all duration-300 hover:border-blue-400 hover:scale-110 hover:-translate-y-2 backdrop-blur-sm overflow-hidden shadow-xl">

                    {/* Glow effect on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/20 group-hover:to-purple-500/20 transition-all duration-300 rounded-2xl"></div>

                    {/* Checkpoint Number Badge */}
                    <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs font-black px-2 py-1 rounded-full shadow-lg border border-blue-400 z-10">
                      #{checkpoint.id}
                    </div>

                    {/* Content */}
                    <div className="relative">
                      {isCaptured && snazzimon ? (
                        // Captured State: Show Snazzimon
                        <div className="flex flex-col items-center">
                          <div className="relative w-full aspect-square mb-3 overflow-hidden rounded-xl">
                            {/* Glow background */}
                            <div className="absolute inset-0 bg-gradient-to-br from-green-500/30 via-blue-500/30 to-purple-500/30 rounded-xl blur-lg"></div>

                            {/* Image */}
                            <img
                              src={snazzimon.image}
                              alt={snazzimon.name}
                              className="relative w-full h-full object-cover rounded-xl border-2 border-green-400 transition-all duration-300 group-hover:scale-110"
                            />

                            {/* Success checkmark */}
                            <div className="absolute top-1 right-1 bg-green-500 rounded-full w-6 h-6 flex items-center justify-center border-2 border-white shadow-lg">
                              <span className="text-white text-xs">✓</span>
                            </div>
                          </div>

                          {/* Name */}
                          <p className="font-bold text-white text-sm text-center group-hover:text-green-300 transition-colors duration-300">
                            {snazzimon.name}
                          </p>
                        </div>
                      ) : (
                        // Uncaptured State: Show Mystery Box
                        <div className="flex flex-col items-center">
                          <div className="relative w-full aspect-square mb-3 flex items-center justify-center">
                            {/* Animated border */}
                            <div className="absolute inset-0 rainbow-border rounded-xl blur-sm opacity-70"></div>

                            {/* Mystery box background */}
                            <div className="relative w-full h-full bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl border-2 border-slate-500 flex items-center justify-center mystery-box">
                              {/* Question mark */}
                              <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-blue-300 via-purple-300 to-pink-300 rotate-animation" style={{ textShadow: '0 0 30px rgba(96, 165, 250, 0.8)' }}>
                                ?
                              </div>

                              {/* Sparkles */}
                              <div className="absolute top-2 left-2 text-yellow-300 text-lg animate-pulse">✨</div>
                              <div className="absolute bottom-2 right-2 text-yellow-300 text-lg animate-pulse" style={{ animationDelay: '0.5s' }}>✨</div>
                            </div>
                          </div>

                          {/* Mystery text */}
                          <p className="font-bold text-gray-400 text-sm text-center group-hover:text-blue-300 transition-colors duration-300">
                            ???
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Hover instruction */}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-b-2xl">
                      <p className="text-xs text-center text-white font-semibold">
                        {isCaptured ? 'Replay' : 'Capture'}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer Stats */}
      <div className="border-t-4 border-blue-500/30 bg-gradient-to-r from-slate-900/90 to-slate-800/90 p-4 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto flex justify-around items-center text-center">
          <div className="flex-1">
            <p className="text-2xl font-black text-blue-400">{capturedSnazzimons.length}</p>
            <p className="text-xs text-gray-400 font-semibold">Captured</p>
          </div>
          <div className="w-px h-10 bg-blue-500/30"></div>
          <div className="flex-1">
            <p className="text-2xl font-black text-purple-400">
              {checkpoints.length - capturedSnazzimons.length}
            </p>
            <p className="text-xs text-gray-400 font-semibold">Remaining</p>
          </div>
          <div className="w-px h-10 bg-blue-500/30"></div>
          <div className="flex-1">
            <p className="text-2xl font-black text-yellow-400">
              {Math.round((capturedSnazzimons.length / checkpoints.length) * 100)}%
            </p>
            <p className="text-xs text-gray-400 font-semibold">Complete</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoScreen;
