import React, { useState, useEffect } from 'react';
import type { Coordinates, Checkpoint, SnazzimonData } from '../types';
import { useHaversine } from '../hooks/useHaversine';
import { useDeviceOrientation } from '../hooks/useDeviceOrientation';
import Compass from './Compass';
import Snazzidex from './Snazzidex';
import { SnazziBallIcon } from './icons';

interface FindScreenProps {
  playerLocation: Coordinates | null;
  checkpoint: Checkpoint;
  capturedSnazzimons: SnazzimonData[];
  isCapturePossible: boolean;
  onSnazzimonClick: (snazzimon: SnazzimonData) => void;
}

const FindScreen: React.FC<FindScreenProps> = ({ playerLocation, checkpoint, capturedSnazzimons, isCapturePossible, onSnazzimonClick }) => {
  const { distance, bearing } = useHaversine(playerLocation, checkpoint.coordinates);
  const { heading, permissionState, isSupported, requestPermission } = useDeviceOrientation();
  const [isSnazzidexOpen, setIsSnazzidexOpen] = useState(false);
  const [revealedHints, setRevealedHints] = useState<string[]>([]);
  const [lastHintTime, setLastHintTime] = useState<number | null>(null);
  const [canShowHint, setCanShowHint] = useState(true);
  const [showOrientationPrompt, setShowOrientationPrompt] = useState(false);

  const cooldownMillis = checkpoint.hintCooldown * 60 * 1000;

  // Request device orientation permission on mount (for iOS)
  useEffect(() => {
    if (isSupported && permissionState === 'prompt') {
      // Show prompt after a short delay for better UX
      const timer = setTimeout(() => {
        setShowOrientationPrompt(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isSupported, permissionState]);

  useEffect(() => {
    if (lastHintTime === null) {
      setCanShowHint(true);
      return;
    }

    const timer = setInterval(() => {
      const timePassed = Date.now() - lastHintTime;
      if (timePassed >= cooldownMillis) {
        setCanShowHint(true);
        clearInterval(timer);
      } else {
        setCanShowHint(false);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [lastHintTime, cooldownMillis]);

  const handleShowHint = () => {
    if (canShowHint && revealedHints.length < checkpoint.hints.length) {
      setRevealedHints(prev => [...prev, checkpoint.hints[prev.length]]);
      setLastHintTime(Date.now());
    }
  };
  
  return (
    <div className="w-full h-full bg-slate-900 text-white flex flex-col items-center justify-between p-4 overflow-hidden relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent to-black/80"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/clean-gray-paper.png')] opacity-5"></div>
      
      <div className={`w-full h-full flex flex-col items-center justify-between transition-all duration-500 ${isCapturePossible ? 'blur-md scale-105 opacity-50' : ''}`}>
        {/* Top Section: Distance and Compass */}
        <div className="z-10 flex flex-col items-center text-center pt-8 w-full">
          <div className="bg-black/40 backdrop-blur-sm p-2 px-6 rounded-xl border border-blue-500/30">
              <h2 className="text-sm font-semibold text-blue-300 tracking-widest">DISTANCE</h2>
              <div className="text-5xl font-bold">
              {distance !== null ? `${distance.toFixed(0)}m` : '---'}
              </div>
          </div>
          <Compass bearing={bearing} deviceHeading={heading} />
        </div>
        
        {/* Middle Section: Hints */}
        <div className="z-10 w-full max-w-md px-4">
          <div className="bg-slate-800/50 backdrop-blur-md p-4 rounded-lg border border-blue-500/30">
              <h3 className="text-lg font-bold text-yellow-300 text-center mb-2">HINTS</h3>
              <div className="text-left text-sm h-16 overflow-y-auto">
                  {revealedHints.length > 0 ? (
                      <ul className="list-disc list-inside space-y-1">
                          {revealedHints.map((hint, index) => <li key={index}>{hint}</li>)}
                      </ul>
                  ) : <p className="text-gray-400 text-center pt-4">Reveal a hint to get started!</p>}
              </div>
              {revealedHints.length < checkpoint.hints.length && (
                  <button 
                      onClick={handleShowHint}
                      disabled={!canShowHint}
                      className="mt-3 w-full bg-gradient-to-b from-yellow-400 to-yellow-600 text-black font-bold py-2 px-4 rounded-md disabled:from-gray-600 disabled:to-gray-800 disabled:text-gray-400 disabled:cursor-not-allowed border-2 border-yellow-200 disabled:border-gray-500 transition-opacity hover:opacity-90"
                  >
                      {canShowHint ? 'Reveal Hint' : 'Hint on Cooldown'}
                  </button>
              )}
          </div>
        </div>
        
        {/* Bottom Nav */}
        <div className="h-28 z-20 flex items-center justify-center">
          <button 
            onClick={() => setIsSnazzidexOpen(true)}
            className="relative w-24 h-24 rounded-full flex items-center justify-center group"
          >
            <div className="absolute inset-0 bg-blue-500 rounded-full transition-all duration-300 group-hover:inset-[-4px] group-hover:blur-sm animate-pulse group-hover:animate-none"></div>
            <div className="absolute inset-0 bg-slate-800 rounded-full border-4 border-slate-600"></div>
            <SnazziBallIcon className="relative w-20 h-20 transition-transform duration-300 group-hover:scale-110" />
            <span className="absolute -top-2 -right-2 bg-yellow-400 text-black text-sm font-bold w-7 h-7 rounded-full flex items-center justify-center border-2 border-black">
              {capturedSnazzimons.length}
            </span>
          </button>
        </div>
      </div>

      {isCapturePossible && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/50 text-center p-4 animate-fade-in">
           <style>{`
            @keyframes fade-in { from { opacity: 0; transform: scale(0.5); } to { opacity: 1; transform: scale(1); } }
            .animate-fade-in { animation: fade-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
            @keyframes pulse-light { 
              0% { text-shadow: 0 0 10px #fde047, 0 0 20px #fde047; } 
              50% { text-shadow: 0 0 20px #facc15, 0 0 40px #facc15, 0 0 60px #facc15; }
              100% { text-shadow: 0 0 10px #fde047, 0 0 20px #fde047; }
            }
            .animate-pulse-light { animation: pulse-light 2s ease-in-out infinite; }
          `}</style>
          
          <h2 className="text-8xl font-black mt-8 text-yellow-300 animate-pulse-light tracking-tighter">ENCOUNTER!</h2>
          <p className="text-2xl mt-2 text-white">A wild Snazzimon appears!</p>
        </div>
      )}

      {isSnazzidexOpen && <Snazzidex capturedSnazzimons={capturedSnazzimons} onClose={() => setIsSnazzidexOpen(false)} onSnazzimonClick={onSnazzimonClick} />}

      {/* Device Orientation Permission Prompt */}
      {showOrientationPrompt && permissionState === 'prompt' && (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/80 text-center p-6">
          <div className="bg-slate-800/90 backdrop-blur-md p-8 rounded-2xl shadow-2xl border border-cyan-500/50 max-w-sm">
            <div className="text-6xl mb-4">🧭</div>
            <h2 className="text-2xl font-bold text-cyan-300 mb-4">Enable AR Compass</h2>
            <p className="text-lg mb-6 text-gray-300">
              Point your phone to see the direction to the Snazzimon in real-time!
            </p>
            <button
              onClick={() => {
                requestPermission();
                setShowOrientationPrompt(false);
              }}
              className="w-full bg-gradient-to-b from-cyan-400 to-cyan-600 text-white font-bold py-3 px-8 rounded-full text-lg shadow-lg border-2 border-cyan-200 hover:from-cyan-300 transition-transform transform hover:scale-105 mb-3"
            >
              Enable Compass
            </button>
            <button
              onClick={() => setShowOrientationPrompt(false)}
              className="text-gray-400 hover:text-gray-200 transition-colors"
            >
              Maybe Later
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FindScreen;