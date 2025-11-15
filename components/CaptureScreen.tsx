import React, { useState, useEffect, useRef } from 'react';
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
  const [needsUserInteraction, setNeedsUserInteraction] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleVideoEnd = () => {
    if (captureState === 'intro') setCaptureState('reveal');
    else if (captureState === 'reveal') setCaptureState('idle');
    else if (captureState === 'fail') setCaptureState('idle');
    else if (captureState === 'success') setCaptureState('outro');
    else if (captureState === 'outro') onCapture();
  };

  const playVideo = async () => {
    const video = videoRef.current;
    if (video) {
      try {
        video.load();
        await video.play();
        setNeedsUserInteraction(false);
      } catch (error) {
        console.error("Video autoplay failed:", error);
        setNeedsUserInteraction(true);
      }
    }
  };

  useEffect(() => {
    playVideo();
  }, [captureState]);
  
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
  
  // 'throwing' is a visual animation state, not a video state.
  // We keep the 'idle' video playing during the throw.
  const videoState = captureState === 'throwing' ? 'idle' : captureState;
  const currentVideoSrc = snazzimon.video[videoState as keyof typeof snazzimon.video];

  return (
    <div 
        className="w-full h-full bg-black text-white flex flex-col items-center justify-center relative overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
    >
        <style>{`
            @keyframes throw { 
              0% { bottom: 5%; transform: scale(1.2); opacity: 1; }
              100% { bottom: 50%; transform: scale(0.5) rotate(480deg); opacity: 0; } 
            }
            .animate-throw { animation: throw 1.2s cubic-bezier(0.5, 1, 0.89, 1) forwards; }
            @keyframes pulse-up { 0%, 100% { transform: translateY(0); opacity: 0.8; } 50% { transform: translateY(-15px); opacity: 0; } }
            .animate-pulse-up { animation: pulse-up 1.5s ease-in-out infinite; }
        `}</style>
      
        <video
            ref={videoRef}
            key={videoState}
            className="absolute top-0 left-0 w-full h-full object-cover z-0"
            src={currentVideoSrc}
            onEnded={handleVideoEnd}
            playsInline
            webkit-playsinline="true"
            preload="auto"
            autoPlay
            loop={captureState === 'idle' || captureState === 'throwing'}
        >
            Your browser does not support the video tag.
        </video>

      {needsUserInteraction && (
          <div
              className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 cursor-pointer"
              onClick={playVideo}
          >
              <div className="bg-yellow-400 text-black rounded-full p-6 mb-4">
                  <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                  </svg>
              </div>
              <p className="text-2xl font-bold text-yellow-300">Tap to Play</p>
          </div>
      )}

      {captureState === 'idle' && (
          <div className="absolute bottom-10 flex flex-col items-center z-10">
              <ChevronUpIcon className="w-10 h-10 text-yellow-300 animate-pulse-up" />
              <SnazziBallIcon className="w-28 h-28 my-2 drop-shadow-lg"/>
              <p className="text-lg font-semibold text-yellow-300 [text-shadow:0_1px_3px_#000]">Flick up to throw!</p>
          </div>
      )}

      {captureState === 'throwing' && (
        <div className="absolute inset-0 z-10 flex items-center justify-center">
            <SnazziBallIcon className="w-24 h-24 absolute animate-throw" />
        </div>
      )}
    </div>
  );
};

export default CaptureScreen;