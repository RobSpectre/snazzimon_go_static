import React, { useState, useEffect } from 'react';
import FTUScreen from './components/FTUScreen';
import FindScreen from './components/FindScreen';
import CaptureScreen from './components/CaptureScreen';
import { useGeolocation } from './hooks/useGeolocation';
import { useHaversine } from './hooks/useHaversine';
import { GameState } from './types';
import type { SnazzimonData, Checkpoint } from './types';
import { SnazziBallIcon } from './components/icons';

interface GameData {
  snazzimons: SnazzimonData[];
  checkpoints: Checkpoint[];
}

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.FTU);
  const [capturedSnazzimons, setCapturedSnazzimons] = useState<SnazzimonData[]>([]);
  const [currentCheckpointIndex, setCurrentCheckpointIndex] = useState(0);
  
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { location, permissionState, requestPermission } = useGeolocation();
  
  useEffect(() => {
    const fetchGameData = async () => {
      try {
        const response = await fetch('/game-data.json');
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data: GameData = await response.json();
        setGameData(data);
      } catch (e: any) {
        console.error("Failed to load game data:", e);
        setError(e.message || "Could not load game data. Please try refreshing the page.");
      } finally {
        setTimeout(() => setIsLoading(false), 1500); // Simulate loading time for aesthetics
      }
    };
    fetchGameData();
  }, []);

  const currentCheckpoint = gameData?.checkpoints[currentCheckpointIndex];
  const { distance } = useHaversine(location, currentCheckpoint?.coordinates);

  useEffect(() => {
    if (gameState === GameState.FIND && distance !== null && currentCheckpoint && distance < currentCheckpoint.captureThreshold) {
      setGameState(GameState.CAPTURE);
    }
  }, [distance, gameState, currentCheckpoint]);

  const handleFTUComplete = () => {
    setGameState(GameState.FIND);
  };

  const handleCapture = () => {
    if (!gameData || !currentCheckpoint) return;
    
    const snazzimon = gameData.snazzimons.find(s => s.id === currentCheckpoint.snazzimonId);
    if (snazzimon) {
      setCapturedSnazzimons(prev => [...prev, snazzimon]);
    }
    
    const nextIndex = currentCheckpointIndex + 1;
    if (nextIndex < gameData.checkpoints.length) {
      setCurrentCheckpointIndex(nextIndex);
      setGameState(GameState.FIND);
    } else {
      setGameState(GameState.GAME_OVER);
    }
  };
  
  if (isLoading) {
    return (
        <div className="w-full h-full bg-slate-900 text-white flex flex-col items-center justify-center p-4">
            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .animate-spin-slow { animation: spin 2s linear infinite; }
            `}</style>
            <SnazziBallIcon className="w-36 h-36 my-8 animate-spin-slow drop-shadow-lg" />
            <h1 className="text-4xl font-bold text-yellow-300 [text-shadow:0_2px_4px_#000]">Loading Adventure...</h1>
        </div>
    );
  }
  
  if (error || !gameData) {
    return (
        <div className="w-full h-full bg-slate-900 text-white flex flex-col items-center justify-center p-4 text-center">
             <div className="bg-slate-800/50 backdrop-blur-md p-8 rounded-2xl shadow-2xl border border-red-500/50 max-w-sm">
                <h1 className="text-4xl font-bold text-red-500 [text-shadow:0_2px_4px_#000]">Oh No!</h1>
                <p className="text-xl mt-4">Could not load the game data. The Snazzimons might be hiding!</p>
                <p className="text-md mt-2 text-gray-400">{error}</p>
                <button onClick={() => window.location.reload()} className="mt-8 bg-gradient-to-b from-blue-400 to-blue-600 text-white font-bold py-3 px-8 rounded-full text-lg shadow-lg border-2 border-blue-200 hover:from-blue-300 transition-transform transform hover:scale-105">
                    Try Again
                </button>
            </div>
        </div>
    );
  }

  const renderGameState = () => {
    switch (gameState) {
      case GameState.FTU:
        return <FTUScreen onComplete={handleFTUComplete} requestPermission={requestPermission} permissionState={permissionState} />;
      
      case GameState.FIND:
        if (!currentCheckpoint) return (
            <div className="w-full h-full bg-gray-900 text-white flex items-center justify-center">
                Loading checkpoint...
            </div>
        );
        return (
          <FindScreen
            playerLocation={location}
            checkpoint={currentCheckpoint}
            capturedSnazzimons={capturedSnazzimons}
          />
        );

      case GameState.CAPTURE:
        const snazzimon = gameData.snazzimons.find(s => s.id === currentCheckpoint.snazzimonId);
        if (!snazzimon) return <div>Error: Snazzimon not found!</div>;
        return (
          <CaptureScreen 
            snazzimon={snazzimon} 
            successProbability={currentCheckpoint.successProbability} 
            onCapture={handleCapture}
          />
        );

      case GameState.GAME_OVER:
        return (
            <div className="w-full h-full bg-slate-900 text-white flex flex-col items-center justify-center p-4 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-yellow-500/20 via-slate-900 to-slate-900">
                <h1 className="text-5xl font-bold text-yellow-300 [text-shadow:0_4px_8px_rgba(0,0,0,0.5)]">Congratulations!</h1>
                <p className="text-2xl mt-4">You've captured all the Snazzimons!</p>
            </div>
        );

      default:
        return <div>Unknown game state</div>;
    }
  };

  return (
    <div className="w-screen h-screen bg-slate-900 overflow-hidden">
      {renderGameState()}
    </div>
  );
};

export default App;