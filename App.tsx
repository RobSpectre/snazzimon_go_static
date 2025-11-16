import React, { useState, useEffect } from 'react';
import FTUScreen from './components/FTUScreen';
import FindScreen from './components/FindScreen';
import CaptureScreen from './components/CaptureScreen';
import ReplayScreen from './components/ReplayScreen';
import Snazzidex from './components/Snazzidex';
import { useGeolocation } from './hooks/useGeolocation';
import { useHaversine } from './hooks/useHaversine';
import { GameState } from './types';
import type { SnazzimonData, Checkpoint } from './types';
import { SnazziBallIcon } from './components/icons';

interface GameData {
  snazzimons: SnazzimonData[];
  checkpoints: Checkpoint[];
}

interface SavedProgress {
  gameState: GameState;
  currentCheckpointIndex: number;
  capturedSnazzimons: SnazzimonData[];
}

// Helper function to load progress from localStorage
const loadProgress = (): SavedProgress => {
  try {
    const savedData = localStorage.getItem('snazzimon-go-progress');
    if (savedData) {
      const parsed = JSON.parse(savedData);
      // If we have progress, the user has completed FTU, so start at FIND state
      // unless they've finished the game
      const isGameOver = parsed.currentCheckpointIndex && parsed.checkpoints && parsed.currentCheckpointIndex >= parsed.checkpoints.length;
      
      return {
        gameState: isGameOver ? GameState.GAME_OVER : GameState.FIND,
        currentCheckpointIndex: parsed.currentCheckpointIndex || 0,
        capturedSnazzimons: parsed.capturedSnazzimons || [],
      };
    }
  } catch (error) {
    console.error("Failed to load progress from localStorage:", error);
  }
  // Default state for first-time players
  return {
    gameState: GameState.FTU,
    currentCheckpointIndex: 0,
    capturedSnazzimons: [],
  };
};


const App: React.FC = () => {
  const [initialState, setInitialState] = useState(loadProgress);
  const [gameState, setGameState] = useState<GameState>(initialState.gameState);
  const [capturedSnazzimons, setCapturedSnazzimons] = useState<SnazzimonData[]>(initialState.capturedSnazzimons);
  const [currentCheckpointIndex, setCurrentCheckpointIndex] = useState<number>(initialState.currentCheckpointIndex);

  const [gameData, setGameData] = useState<GameData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isCapturePossible, setIsCapturePossible] = useState(false);
  const [isEncounterTriggered, setIsEncounterTriggered] = useState(false);
  const [replaySnazzimon, setReplaySnazzimon] = useState<SnazzimonData | null>(null);

  const { location, error: geoError, permissionState, requestPermission } = useGeolocation();

  // Parse URL for checkpoint ID (e.g., /#/id/1 or /id/1 or /id/1/capture)
  useEffect(() => {
    const parseCheckpointFromURL = () => {
      // Try hash-based routing first
      let path = window.location.hash.slice(1); // Remove #

      // Fallback to pathname if no hash
      if (!path || path === '/') {
        path = window.location.pathname;
      }

      // Match /id/NUMBER or /id/NUMBER/capture pattern
      const match = path.match(/\/id\/(\d+)(\/capture)?/);
      if (match && gameData) {
        const checkpointId = parseInt(match[1], 10);
        const checkpointIndex = checkpointId - 1; // Convert ID to 0-based index
        const isCapture = match[2] === '/capture'; // Check if /capture is in the URL

        // Validate checkpoint exists
        if (checkpointIndex >= 0 && checkpointIndex < gameData.checkpoints.length) {
          setCurrentCheckpointIndex(checkpointIndex);

          if (isCapture) {
            // Go directly to capture screen
            setGameState(GameState.CAPTURE);
          } else {
            // Go to find screen
            setGameState(GameState.FIND);
          }

          setIsEncounterTriggered(false);
          setIsCapturePossible(false);

          // Clear the URL hash to prevent re-triggering
          window.history.replaceState(null, '', window.location.pathname);
        }
      }
    };

    parseCheckpointFromURL();

    // Listen for hash changes
    window.addEventListener('hashchange', parseCheckpointFromURL);
    return () => window.removeEventListener('hashchange', parseCheckpointFromURL);
  }, [gameData]);
  
  // Fetch game configuration data on mount
  useEffect(() => {
    const fetchGameData = async () => {
      try {
        const response = await fetch('/data/game-data.json');
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data: GameData = await response.json();
        setGameData(data);

        // Re-evaluate game over state after fetching game data
        if (initialState.gameState !== GameState.FTU && initialState.currentCheckpointIndex >= data.checkpoints.length) {
            setGameState(GameState.GAME_OVER);
        }

      } catch (e: any) {
        console.error("Failed to load game data:", e);
        setError(e.message || "Could not load game data. Please try refreshing the page.");
      } finally {
        setTimeout(() => setIsLoading(false), 1500); // Simulate loading time for aesthetics
      }
    };
    fetchGameData();
  }, [initialState]);
  
  // Save progress to localStorage whenever it changes
  useEffect(() => {
    // Don't save initial FTU state until the user has passed it.
    if (gameState === GameState.FTU) return;
    
    try {
        const progress = {
            currentCheckpointIndex,
            capturedSnazzimons,
            checkpoints: gameData?.checkpoints, // Save checkpoints to check for game over on load
        };
        localStorage.setItem('snazzimon-go-progress', JSON.stringify(progress));
    } catch (error) {
        console.error("Failed to save progress:", error);
    }
  }, [currentCheckpointIndex, capturedSnazzimons, gameState, gameData]);

  // Check for game over state once game data is loaded
  useEffect(() => {
    if (gameData && gameState !== GameState.FTU) {
        if (currentCheckpointIndex >= gameData.checkpoints.length) {
            setGameState(GameState.GAME_OVER);
        }
    }
  }, [gameData, currentCheckpointIndex, gameState]);

  const currentCheckpoint = gameData?.checkpoints[currentCheckpointIndex];
  const { distance } = useHaversine(location, currentCheckpoint?.coordinates ?? null);

  // Handle encounter trigger logic
  useEffect(() => {
    if (gameState === GameState.FIND && distance !== null && currentCheckpoint) {
      if (distance < currentCheckpoint.captureThreshold && !isEncounterTriggered) {
        setIsEncounterTriggered(true);
        setIsCapturePossible(true);

        // Vibrate to signal an encounter
        if (navigator.vibrate) {
          navigator.vibrate([200, 100, 200]);
        }
        
        // Automatically transition to capture screen after a delay
        setTimeout(() => {
          setGameState(GameState.CAPTURE);
        }, 2500); // 2.5s for the alert animation
      }
    }
  }, [distance, gameState, currentCheckpoint, isEncounterTriggered]);

  const handleFTUComplete = () => {
    setGameState(GameState.FIND);
  };

  const handleCapture = () => {
    if (!gameData || !currentCheckpoint) return;

    const snazzimon = gameData.snazzimons.find(s => s.id === currentCheckpoint.snazzimonId);
    if (snazzimon && !capturedSnazzimons.some(s => s.id === snazzimon.id)) {
      setCapturedSnazzimons(prev => [...prev, snazzimon]);
    }

    const nextIndex = currentCheckpointIndex + 1;
    if (nextIndex < gameData.checkpoints.length) {
      setCurrentCheckpointIndex(nextIndex);
      setGameState(GameState.FIND);
      // Reset encounter states for the next checkpoint
      setIsCapturePossible(false);
      setIsEncounterTriggered(false);
    } else {
      // Set index past the end to signify completion
      setCurrentCheckpointIndex(nextIndex);
      setGameState(GameState.GAME_OVER);
    }
  };

  const handleStartReplay = (snazzimon: SnazzimonData) => {
    setReplaySnazzimon(snazzimon);
    setGameState(GameState.REPLAY);
  };

  const handleEndReplay = () => {
    setReplaySnazzimon(null);
    setGameState(GameState.FIND);
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
        return <FTUScreen onComplete={handleFTUComplete} requestPermission={requestPermission} permissionState={permissionState} geoError={geoError} />;
      
      case GameState.FIND:
        if (!currentCheckpoint) return (
             <div className="w-full h-full bg-slate-900 text-white flex flex-col items-center justify-center p-4 text-center">
                 <h1 className="text-3xl font-bold text-yellow-300">Something's not right...</h1>
                 <p className="text-lg mt-2">Could not find the next checkpoint.</p>
             </div>
        );
        return (
          <FindScreen
            playerLocation={location}
            checkpoint={currentCheckpoint}
            capturedSnazzimons={capturedSnazzimons}
            isCapturePossible={isCapturePossible}
            onSnazzimonClick={handleStartReplay}
          />
        );

      case GameState.CAPTURE:
        // Add robust guards to prevent crashes from race conditions or bad data
        if (!currentCheckpoint) {
            return (
                <div className="w-full h-full bg-slate-900 text-white flex flex-col items-center justify-center p-4 text-center">
                    <h1 className="text-3xl font-bold text-red-500">Encounter Error!</h1>
                    <p className="text-lg mt-2">Could not find the encounter data.</p>
                    <button onClick={() => setGameState(GameState.FIND)} className="mt-8 bg-gradient-to-b from-blue-400 to-blue-600 text-white font-bold py-3 px-8 rounded-full text-lg shadow-lg border-2 border-blue-200 hover:from-blue-300 transition-transform transform hover:scale-105">
                        Return to Map
                    </button>
                </div>
           );
        }
        const snazzimon = gameData.snazzimons.find(s => s.id === currentCheckpoint.snazzimonId);
        if (!snazzimon || !snazzimon.video) {
            return (
                <div className="w-full h-full bg-slate-900 text-white flex flex-col items-center justify-center p-4 text-center">
                    <h1 className="text-3xl font-bold text-red-500">Snazzimon Data Error!</h1>
                    <p className="text-lg mt-2">Could not load video data for this Snazzimon.</p>
                    <button onClick={() => setGameState(GameState.FIND)} className="mt-8 bg-gradient-to-b from-blue-400 to-blue-600 text-white font-bold py-3 px-8 rounded-full text-lg shadow-lg border-2 border-blue-200 hover:from-blue-300 transition-transform transform hover:scale-105">
                        Return to Map
                    </button>
                </div>
            );
        }
        return (
          <CaptureScreen
            snazzimon={snazzimon}
            successProbability={currentCheckpoint.successProbability}
            onCapture={handleCapture}
          />
        );

      case GameState.REPLAY:
        if (!replaySnazzimon) {
          return (
            <div className="w-full h-full bg-slate-900 text-white flex flex-col items-center justify-center p-4 text-center">
              <h1 className="text-3xl font-bold text-red-500">Replay Error!</h1>
              <p className="text-lg mt-2">Could not find the Snazzimon to replay.</p>
              <button onClick={() => setGameState(GameState.FIND)} className="mt-8 bg-gradient-to-b from-blue-400 to-blue-600 text-white font-bold py-3 px-8 rounded-full text-lg shadow-lg border-2 border-blue-200 hover:from-blue-300 transition-transform transform hover:scale-105">
                Return to Map
              </button>
            </div>
          );
        }
        // Find the checkpoint that corresponds to this Snazzimon to get the success probability
        const replayCheckpoint = gameData.checkpoints.find(cp => cp.snazzimonId === replaySnazzimon.id);
        const replaySuccessProbability = replayCheckpoint?.successProbability ?? 0.5;

        return (
          <ReplayScreen
            snazzimon={replaySnazzimon}
            successProbability={replaySuccessProbability}
            onBack={handleEndReplay}
          />
        );

      case GameState.GAME_OVER:
        return (
            <div className="w-full h-full bg-slate-900 text-white flex flex-col items-center justify-center p-4 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-yellow-500/20 via-slate-900 to-slate-900">
                <Snazzidex
                  capturedSnazzimons={capturedSnazzimons}
                  onClose={() => {}}
                  onSnazzimonClick={handleStartReplay}
                  isGameComplete={true}
                />
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
