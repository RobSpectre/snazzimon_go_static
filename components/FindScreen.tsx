import React, { useState, useEffect } from 'react';
import type { Coordinates, Checkpoint, SnazzimonData } from '../types';
import { useHaversine } from '../hooks/useHaversine';
import Compass from './Compass';
import Snazzidex from './Snazzidex';
import { SnazziBallIcon } from './icons';

interface FindScreenProps {
  playerLocation: Coordinates | null;
  checkpoint: Checkpoint;
  capturedSnazzimons: SnazzimonData[];
}

const FindScreen: React.FC<FindScreenProps> = ({ playerLocation, checkpoint, capturedSnazzimons }) => {
  const { distance, bearing } = useHaversine(playerLocation, checkpoint.coordinates);
  const [isSnazzidexOpen, setIsSnazzidexOpen] = useState(false);
  const [revealedHints, setRevealedHints] = useState<string[]>([]);
  const [lastHintTime, setLastHintTime] = useState<number | null>(null);
  const [canShowHint, setCanShowHint] = useState(true);

  const cooldownMillis = checkpoint.hintCooldown * 60 * 1000;

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

      {/* Top Section: Distance and Compass */}
      <div className="z-10 flex flex-col items-center text-center pt-8 w-full">
        <div className="bg-black/40 backdrop-blur-sm p-2 px-6 rounded-xl border border-blue-500/30">
            <h2 className="text-sm font-semibold text-blue-300 tracking-widest">DISTANCE</h2>
            <div className="text-5xl font-bold">
            {distance !== null ? `${distance.toFixed(0)}m` : '---'}
            </div>
        </div>
        <Compass bearing={bearing} />
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

      {isSnazzidexOpen && <Snazzidex capturedSnazzimons={capturedSnazzimons} onClose={() => setIsSnazzidexOpen(false)} />}
    </div>
  );
};

export default FindScreen;