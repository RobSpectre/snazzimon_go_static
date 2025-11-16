import React, { useState, useEffect, useRef } from 'react';
import type { SnazzimonData } from '../types';
import { SnazziBallIcon, ChevronUpIcon } from './icons';

interface ReplayScreenProps {
  snazzimon: SnazzimonData;
  successProbability: number;
  onBack: () => void;
}

type CaptureState = 'intro' | 'reveal' | 'idle' | 'throwing' | 'fail' | 'success' | 'outro';

const ReplayScreen: React.FC<ReplayScreenProps> = ({ snazzimon, successProbability, onBack }) => {
  const [captureState, setCaptureState] = useState<CaptureState>('intro');
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [needsUserInteraction, setNeedsUserInteraction] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [activeVideo, setActiveVideo] = useState<0 | 1>(0); // Toggle between two videos
  const [nextVideoPreloaded, setNextVideoPreloaded] = useState(false);

  const video0Ref = useRef<HTMLVideoElement>(null);
  const video1Ref = useRef<HTMLVideoElement>(null);

  const handleVideoEnd = () => {
    if (captureState === 'intro') setCaptureState('reveal');
    else if (captureState === 'reveal') setCaptureState('idle');
    else if (captureState === 'fail') setCaptureState('idle');
    else if (captureState === 'success') setCaptureState('outro');
    else if (captureState === 'outro') onBack();
  };

  const getVideoState = (state: CaptureState): keyof SnazzimonData['video'] => {
    return state === 'throwing' ? 'idle' : state;
  };

  // Preload next video
  useEffect(() => {
    const nextState = captureState === 'intro' ? 'reveal' : captureState === 'reveal' ? 'idle' : null;
    if (nextState) {
      const inactiveVideoRef = activeVideo === 0 ? video1Ref : video0Ref;
      const inactiveVideo = inactiveVideoRef.current;
      if (inactiveVideo) {
        const nextVideoSrc = snazzimon.video[getVideoState(nextState)];
        inactiveVideo.src = nextVideoSrc;
        inactiveVideo.load();
        setNextVideoPreloaded(true);
      }
    }
  }, [captureState, snazzimon, activeVideo]);

  const playVideo = async (videoRef: React.RefObject<HTMLVideoElement>, loadFirst: boolean = false) => {
    const video = videoRef.current;
    if (video) {
      try {
        if (loadFirst) {
          video.load();
        }
        await video.play();
        setNeedsUserInteraction(false);
      } catch (error) {
        console.error("Video autoplay failed:", error);
        setNeedsUserInteraction(true);
      }
    }
  };

  // Handle video transitions
  useEffect(() => {
    const currentVideoRef = activeVideo === 0 ? video0Ref : video1Ref;
    const currentVideo = currentVideoRef.current;

    if (currentVideo) {
      const videoState = getVideoState(captureState);
      const currentSrc = snazzimon.video[videoState];

      // Check if we need to change the video source
      if (!currentVideo.src.endsWith(currentSrc)) {
        // If the next video was preloaded in the inactive video element, swap to it
        const inactiveVideoRef = activeVideo === 0 ? video1Ref : video0Ref;
        const inactiveVideo = inactiveVideoRef.current;

        if (inactiveVideo && inactiveVideo.src.endsWith(currentSrc) && nextVideoPreloaded) {
          // Swap to the preloaded video
          setActiveVideo(activeVideo === 0 ? 1 : 0);
          playVideo(inactiveVideoRef, false);
          setNextVideoPreloaded(false);
        } else {
          // Load and play the new video in the current element
          currentVideo.src = currentSrc;
          playVideo(currentVideoRef, true);
        }
      }
    }
  }, [captureState, snazzimon, activeVideo, nextVideoPreloaded]);

  // Initial video load
  useEffect(() => {
    const initialVideoRef = video0Ref;
    const initialVideo = initialVideoRef.current;
    if (initialVideo) {
      const initialSrc = snazzimon.video.intro;
      initialVideo.src = initialSrc;
      playVideo(initialVideoRef, true);
    }
  }, [snazzimon]);

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

        {/* Video 0 */}
        <video
            ref={video0Ref}
            className="absolute top-0 left-0 w-full h-full object-cover z-0 transition-opacity duration-300"
            style={{ opacity: activeVideo === 0 ? 1 : 0 }}
            onEnded={handleVideoEnd}
            playsInline
            webkit-playsinline="true"
            preload="auto"
            muted={isMuted}
            loop={captureState === 'idle' || captureState === 'throwing'}
        >
            Your browser does not support the video tag.
        </video>

        {/* Video 1 */}
        <video
            ref={video1Ref}
            className="absolute top-0 left-0 w-full h-full object-cover z-0 transition-opacity duration-300"
            style={{ opacity: activeVideo === 1 ? 1 : 0 }}
            onEnded={handleVideoEnd}
            playsInline
            webkit-playsinline="true"
            preload="auto"
            muted={isMuted}
            loop={captureState === 'idle' || captureState === 'throwing'}
        >
            Your browser does not support the video tag.
        </video>

      {/* Back Button */}
      <button
        onClick={onBack}
        className="absolute top-4 left-4 z-20 bg-black/50 hover:bg-black/70 rounded-full p-3 transition-colors"
        aria-label="Back to Snazzidex"
      >
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Mute/Unmute Button */}
      <button
        onClick={() => setIsMuted(!isMuted)}
        className="absolute top-4 right-4 z-20 bg-black/50 hover:bg-black/70 rounded-full p-3 transition-colors"
        aria-label={isMuted ? "Unmute" : "Mute"}
      >
        {isMuted ? (
          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
          </svg>
        ) : (
          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
          </svg>
        )}
      </button>

      {needsUserInteraction && (
          <div
              className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 cursor-pointer"
              onClick={() => playVideo(activeVideo === 0 ? video0Ref : video1Ref, false)}
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

export default ReplayScreen;
