import React, { useState, useEffect } from 'react';
import type { SnazzimonData } from '../types';
import { SnazziBallIcon, ChevronUpIcon } from './icons';

interface CaptureScreenProps {
  snazzimon: SnazzimonData;
  successProbability: number;
  onCapture: () => void;
}

type CaptureState = 'intro' | 'reveal' | 'idle' | 'throwing' | 'fail' | 'success' | 'outro';

const CaptureScreen: React.FC<CaptureScreenProps> = ({ snazzimon, successProbability, onCapture }) => {
  const [captureState, setCaptureState] = useState<CaptureState>('intro');
  const [touchStart, setTouchStart] = useState<number | null>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (captureState === 'intro') {
      timer = setTimeout(() => setCaptureState('reveal'), 1500); // 1.5s intro
    } else if (captureState === 'reveal') {
      timer = setTimeout(() => setCaptureState('idle'), 1500); // 1.5s reveal
    } else if (captureState === 'fail') {
      timer = setTimeout(() => setCaptureState('idle'), 2000); // 2s fail animation
    } else if (captureState === 'success') {
      timer = setTimeout(() => setCaptureState('outro'), 2500); // 2.5s success animation
    } else if (captureState === 'outro') {
      timer = setTimeout(onCapture, 1500); // 1.5s outro, then back to find screen
    }
    return () => clearTimeout(timer);
  }, [captureState, onCapture]);
  
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (captureState === 'idle') {
      setTouchStart(e.touches[0].clientY);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (touchStart !== null) {
      const touchEnd = e.changedTouches[0].clientY;
      const swipeDistance = touchStart - touchEnd;
      if (swipeDistance > 50) { // Threshold for a "flick"
        handleThrow();
      }
      setTouchStart(null);
    }
  };

  const handleThrow = () => {
    setCaptureState('throwing');
    setTimeout(() => {
      if (Math.random() < successProbability) {
        setCaptureState('success');
      } else {
        setCaptureState('fail');
      }
    }, 1200); // 1.2s for the ball throw animation
  };

  const renderFeedbackText = (text: string, color: string, animation: string) => (
    <div className="absolute inset-0 flex items-center justify-center">
        <h1 className={`text-6xl font-bold ${color} [text-shadow:0_4px_8px_rgba(0,0,0,0.7)] ${animation}`}>
            {text}
        </h1>
    </div>
  );

  const renderContent = () => {
    switch (captureState) {
      case 'intro':
        return renderFeedbackText('A wild Snazzimon appears!', 'text-yellow-300', 'animate-zoom-in-out');
      case 'reveal':
        return <img src={snazzimon.image} alt={snazzimon.name} className="w-64 h-64 rounded-full animate-zoomIn" />;
      case 'idle':
        return (
          <>
            <img src={snazzimon.image} alt={snazzimon.name} className="w-64 h-64 rounded-full animate-float drop-shadow-2xl" />
            <p className="mt-4 text-3xl font-bold bg-black/30 px-4 py-1 rounded-lg">{snazzimon.name}!</p>
          </>
        );
      case 'throwing':
          return (
            <>
                <img src={snazzimon.image} alt={snazzimon.name} className="w-64 h-64 rounded-full" />
                <SnazziBallIcon className="w-24 h-24 absolute animate-throw" />
            </>
          )
      case 'fail':
        return renderFeedbackText('Broke Free!', 'text-red-500', 'animate-shake');
      case 'success':
        return renderFeedbackText('Gotcha!', 'text-green-400', 'animate-pop');
      case 'outro':
        return renderFeedbackText(`Captured ${snazzimon.name}!`, 'text-blue-300', 'animate-fade-out');
      default:
        return null;
    }
  };

  return (
    <div 
        className="w-full h-full bg-slate-900 text-white flex flex-col items-center justify-center relative overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
    >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-500/20 via-slate-900 to-slate-900"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/az-subtle.png')] opacity-10 animate-pan"></div>
        <style>{`
            @keyframes pan { from { background-position: 0% 0%; } to { background-position: 100% 100%; } }
            .animate-pan { animation: pan 60s linear infinite; }
            @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-20px); } }
            .animate-float { animation: float 3s ease-in-out infinite; }
            @keyframes zoomIn { from { transform: scale(0); opacity: 0; } to { transform: scale(1); opacity: 1; } }
            .animate-zoomIn { animation: zoomIn 0.5s ease-out forwards; }
            @keyframes throw { 
              0% { bottom: 5%; transform: scale(1.2); opacity: 1; }
              100% { bottom: 50%; transform: scale(0.5) rotate(480deg); opacity: 0; } 
            }
            .animate-throw { animation: throw 1.2s cubic-bezier(0.5, 1, 0.89, 1) forwards; }
            @keyframes zoom-in-out { 0%, 100% { transform: scale(0.8); opacity: 0; } 50% { transform: scale(1.1); opacity: 1; } 90% { transform: scale(1); opacity: 1; } }
            .animate-zoom-in-out { animation: zoom-in-out 1.5s ease-in-out forwards; }
            @keyframes shake { 0%, 100% { transform: translateX(0); } 10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); } 20%, 40%, 60%, 80% { transform: translateX(10px); } }
            .animate-shake { animation: shake 0.5s ease-in-out forwards; }
            @keyframes pop { 0% { transform: scale(0.5); } 80% { transform: scale(1.2); } 100% { transform: scale(1); } }
            .animate-pop { animation: pop 0.5s ease-out forwards; }
            @keyframes fade-out { from { opacity: 1; } to { opacity: 0; } }
            .animate-fade-out { animation: fade-out 1.5s ease-in forwards; }
            @keyframes pulse-up { 0%, 100% { transform: translateY(0); opacity: 0.8; } 50% { transform: translateY(-15px); opacity: 0; } }
            .animate-pulse-up { animation: pulse-up 1.5s ease-in-out infinite; }
        `}</style>
      
        <div className="flex flex-col items-center justify-center text-center">
            {renderContent()}
        </div>

      {captureState === 'idle' && (
          <div className="absolute bottom-10 flex flex-col items-center">
              <ChevronUpIcon className="w-10 h-10 text-yellow-300 animate-pulse-up" />
              <SnazziBallIcon className="w-28 h-28 my-2 drop-shadow-lg"/>
              <p className="text-lg font-semibold text-yellow-300">Flick up to throw!</p>
          </div>
      )}
    </div>
  );
};

export default CaptureScreen;