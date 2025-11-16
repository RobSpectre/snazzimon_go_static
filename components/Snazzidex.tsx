import React, { useEffect, useState } from 'react';
import type { SnazzimonData } from '../types';
import { CloseIcon, SnazziBallIcon } from './icons';

interface SnazzidexProps {
  capturedSnazzimons: SnazzimonData[];
  onClose: () => void;
  onSnazzimonClick: (snazzimon: SnazzimonData) => void;
  isGameComplete?: boolean;
}

const Snazzidex: React.FC<SnazzidexProps> = ({ capturedSnazzimons, onClose, onSnazzimonClick, isGameComplete = false }) => {
  const [showConfetti, setShowConfetti] = useState(isGameComplete);

  useEffect(() => {
    if (isGameComplete) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isGameComplete]);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.4s ease-out forwards;
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.5s ease-out forwards;
        }

        @keyframes card-pop-in {
          0% {
            opacity: 0;
            transform: scale(0.3) rotate(-10deg);
          }
          60% {
            transform: scale(1.1) rotate(5deg);
          }
          100% {
            opacity: 1;
            transform: scale(1) rotate(0deg);
          }
        }

        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }

        .shimmer-effect {
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255, 255, 255, 0.3) 50%,
            transparent 100%
          );
          background-size: 200% 100%;
          animation: shimmer 2s infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        @keyframes glow-pulse {
          0%, 100% {
            box-shadow: 0 0 20px rgba(96, 165, 250, 0.5),
                        0 0 40px rgba(96, 165, 250, 0.3),
                        inset 0 0 20px rgba(96, 165, 250, 0.1);
          }
          50% {
            box-shadow: 0 0 30px rgba(96, 165, 250, 0.8),
                        0 0 60px rgba(96, 165, 250, 0.5),
                        inset 0 0 30px rgba(96, 165, 250, 0.2);
          }
        }

        .card-glow {
          animation: glow-pulse 2s ease-in-out infinite;
        }

        @keyframes confetti-fall {
          0% {
            transform: translateY(-100vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }

        .confetti {
          position: absolute;
          width: 10px;
          height: 10px;
          animation: confetti-fall 3s linear forwards;
        }

        @keyframes trophy-bounce {
          0%, 100% { transform: translateY(0) scale(1); }
          25% { transform: translateY(-20px) scale(1.1); }
          50% { transform: translateY(0) scale(1); }
          75% { transform: translateY(-10px) scale(1.05); }
        }

        .trophy-bounce {
          animation: trophy-bounce 2s ease-in-out infinite;
        }
      `}</style>

      {/* Confetti Effect */}
      {showConfetti && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-50">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="confetti"
              style={{
                left: `${Math.random() * 100}%`,
                backgroundColor: ['#fbbf24', '#60a5fa', '#f472b6', '#a78bfa', '#34d399'][Math.floor(Math.random() * 5)],
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      )}

      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-4 border-blue-500/70 rounded-3xl shadow-2xl w-full max-w-4xl h-full max-h-[95vh] flex flex-col relative overflow-hidden animate-slide-up">

        {/* Animated background effect */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(96,165,250,0.3)_0%,_transparent_50%)]"></div>
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
        </div>

        {/* Header */}
        <div className="relative flex justify-between items-center p-6 border-b-4 border-blue-500/30 bg-gradient-to-r from-blue-900/50 to-purple-900/50">
          <div className="flex items-center gap-4">
            <div className="relative">
              <SnazziBallIcon className="w-12 h-12 drop-shadow-lg" />
              <div className="absolute inset-0 bg-blue-400/30 rounded-full blur-xl animate-pulse"></div>
            </div>
            <div>
              <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-cyan-300 to-blue-400 [text-shadow:0_2px_8px_rgba(59,130,246,0.5)]">
                Snazzidex
              </h2>
              <p className="text-sm text-blue-300 font-semibold mt-1">
                {capturedSnazzimons.length} {isGameComplete ? 'Complete!' : 'Captured'}
              </p>
            </div>
          </div>

          {!isGameComplete && (
            <button
              onClick={onClose}
              className="text-white hover:text-blue-300 rounded-full p-2 transition-all hover:bg-white/10 hover:scale-110 active:scale-95"
            >
              <CloseIcon className="w-8 h-8" />
            </button>
          )}
        </div>

        {/* Game Complete Banner */}
        {isGameComplete && (
          <div className="relative bg-gradient-to-r from-yellow-500/20 via-yellow-400/30 to-yellow-500/20 border-y-2 border-yellow-400/50 py-4 px-6">
            <div className="flex items-center justify-center gap-4">
              <span className="text-5xl trophy-bounce">🏆</span>
              <div className="text-center">
                <h3 className="text-3xl font-black text-yellow-300 [text-shadow:0_2px_8px_rgba(234,179,8,0.8)]">
                  MASTER COLLECTOR!
                </h3>
                <p className="text-lg text-yellow-200 mt-1">
                  You've captured all the Snazzimons!
                </p>
              </div>
              <span className="text-5xl trophy-bounce" style={{ animationDelay: '0.2s' }}>🎉</span>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="relative overflow-y-auto p-8 flex-grow">
          {capturedSnazzimons.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 animate-fade-in">
              <div className="relative mb-6">
                <SnazziBallIcon className="w-32 h-32 opacity-20" />
                <div className="absolute inset-0 bg-blue-400/10 rounded-full blur-2xl"></div>
              </div>
              <p className="text-3xl font-bold text-gray-300">No Snazzimons Yet!</p>
              <p className="mt-3 text-xl text-gray-400">Start your adventure and capture them all.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {capturedSnazzimons.map((snazzimon, index) => (
                <div
                  key={snazzimon.id}
                  onClick={() => {
                    if (!isGameComplete) onClose();
                    onSnazzimonClick(snazzimon);
                  }}
                  className="group relative cursor-pointer"
                  style={{
                    animation: `card-pop-in 0.6s ease-out forwards`,
                    animationDelay: `${index * 0.1}s`,
                    opacity: 0,
                  }}
                >
                  {/* Card */}
                  <div className="relative bg-gradient-to-br from-slate-700/80 to-slate-800/80 p-4 rounded-2xl shadow-xl border-2 border-slate-600 transition-all duration-300 hover:border-blue-400 hover:scale-110 hover:-translate-y-2 backdrop-blur-sm overflow-hidden card-glow">

                    {/* Shimmer effect on hover */}
                    <div className="absolute inset-0 shimmer-effect opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                    {/* Image container */}
                    <div className="relative w-full aspect-square mb-4 overflow-hidden rounded-xl">
                      {/* Glow background */}
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/30 via-purple-500/30 to-pink-500/30 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>

                      {/* Image */}
                      <img
                        src={snazzimon.image}
                        alt={snazzimon.name}
                        className="relative w-full h-full object-cover rounded-xl border-3 border-blue-400/50 group-hover:border-blue-300 transition-all duration-300 group-hover:scale-110"
                      />

                      {/* Sparkle effect on hover */}
                      <div className="absolute top-2 right-2 text-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse">
                        ✨
                      </div>
                    </div>

                    {/* Name */}
                    <div className="relative">
                      <p className="font-bold text-white text-lg text-center group-hover:text-blue-300 transition-colors duration-300 [text-shadow:0_2px_4px_rgba(0,0,0,0.8)]">
                        {snazzimon.name}
                      </p>
                      <p className="text-xs text-blue-400 text-center mt-1 font-semibold">
                        #{snazzimon.id.toString().padStart(3, '0')}
                      </p>
                    </div>

                    {/* Corner badge */}
                    <div className="absolute top-2 left-2 bg-gradient-to-br from-yellow-400 to-yellow-600 text-black text-xs font-black px-2 py-1 rounded-full shadow-lg border border-yellow-300">
                      NEW
                    </div>
                  </div>

                  {/* Floating animation on hover */}
                  <div className="absolute inset-0 -z-10 bg-blue-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer stats */}
        {capturedSnazzimons.length > 0 && (
          <div className="relative border-t-4 border-blue-500/30 bg-gradient-to-r from-slate-900/90 to-slate-800/90 p-4 backdrop-blur-sm">
            <div className="flex justify-around items-center text-center">
              <div className="flex-1">
                <p className="text-3xl font-black text-blue-400">{capturedSnazzimons.length}</p>
                <p className="text-sm text-gray-400 font-semibold">Captured</p>
              </div>
              <div className="w-px h-12 bg-blue-500/30"></div>
              <div className="flex-1">
                <p className="text-3xl font-black text-purple-400">{isGameComplete ? '100%' : `${Math.round((capturedSnazzimons.length / 6) * 100)}%`}</p>
                <p className="text-sm text-gray-400 font-semibold">Complete</p>
              </div>
              <div className="w-px h-12 bg-blue-500/30"></div>
              <div className="flex-1">
                <p className="text-3xl font-black text-yellow-400">{isGameComplete ? '⭐' : '...'}</p>
                <p className="text-sm text-gray-400 font-semibold">{isGameComplete ? 'Master' : 'Rank'}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Snazzidex;
