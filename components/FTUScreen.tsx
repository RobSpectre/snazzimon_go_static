import React, { useState } from 'react';
import { SnazziBallIcon } from './icons';

interface FTUScreenProps {
  onComplete: () => void;
  requestPermission: () => void;
  permissionState: 'prompt' | 'granted' | 'denied';
}

const FTUScreen: React.FC<FTUScreenProps> = ({ onComplete, requestPermission, permissionState }) => {
  const [step, setStep] = useState(0);

  const handleNext = () => setStep((s) => s + 1);
  const handlePermission = () => {
    requestPermission();
    handleNext();
  };
  
  const screens = [
    // Step 0: Welcome
    <div key={0} className="text-center flex flex-col items-center">
      <h1 className="text-5xl font-bold mb-4 text-yellow-300 [text-shadow:0_4px_8px_rgba(0,0,0,0.5)]">Welcome to Snazzimon Go!</h1>
      <SnazziBallIcon className="w-36 h-36 my-8 drop-shadow-lg transition-transform duration-500 hover:scale-110" />
      <p className="text-xl max-w-md">Get ready for a real-world adventure to find and capture amazing creatures called Snazzimons!</p>
      <button onClick={handleNext} className="mt-12 bg-gradient-to-b from-yellow-400 to-yellow-600 text-gray-900 font-bold py-4 px-10 rounded-full text-2xl shadow-lg border-2 border-yellow-200 hover:from-yellow-300 transition-transform transform hover:scale-105">
        Let's Go!
      </button>
    </div>,

    // Step 1: Permission Request
    <div key={1} className="text-center flex flex-col items-center">
      <h1 className="text-4xl font-bold mb-4 text-blue-300 [text-shadow:0_4px_8px_rgba(0,0,0,0.5)]">Permission Needed</h1>
      <p className="text-xl max-w-md my-8">To find Snazzimons in the world around you, the game needs access to your device's <strong className="text-blue-200">Location</strong>. Please grant access when prompted.</p>
      <button onClick={handlePermission} className="mt-8 bg-gradient-to-b from-blue-400 to-blue-600 text-white font-bold py-4 px-10 rounded-full text-2xl shadow-lg border-2 border-blue-200 hover:from-blue-300 transition-transform transform hover:scale-105">
        Allow Access
      </button>
    </div>,

    // Step 2: Confirmation/Status
    <div key={2} className="text-center flex flex-col items-center">
      {permissionState === 'granted' && (
        <>
          <h1 className="text-4xl font-bold mb-4 text-green-400 [text-shadow:0_4px_8px_rgba(0,0,0,0.5)]">You're All Set!</h1>
          <p className="text-xl max-w-md my-8">Location access granted. Your adventure is about to begin!</p>
          <button onClick={onComplete} className="mt-8 bg-gradient-to-b from-green-500 to-green-700 text-white font-bold py-4 px-10 rounded-full text-2xl shadow-lg border-2 border-green-300 hover:from-green-400 transition-transform transform hover:scale-105">
            Start Hunting
          </button>
        </>
      )}
      {permissionState === 'denied' && (
        <>
          <h1 className="text-4xl font-bold mb-4 text-red-500 [text-shadow:0_4px_8px_rgba(0,0,0,0.5)]">Permission Denied</h1>
          <p className="text-xl max-w-md my-8">Location access is required to play. Please enable it in your browser settings and refresh the page to start your adventure.</p>
        </>
      )}
      {permissionState === 'prompt' && (
        <>
          <h1 className="text-4xl font-bold mb-4 text-yellow-400 [text-shadow:0_4px_8px_rgba(0,0,0,0.5)]">Waiting...</h1>
           <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-yellow-400 my-8"></div>
          <p className="text-xl max-w-md">Please respond to the permission prompt from your browser.</p>
        </>
      )}
    </div>,
  ];

  return (
    <div className="w-full h-full bg-slate-900 text-white flex flex-col items-center justify-center p-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-700 via-gray-900 to-black">
      <div className="bg-slate-800/50 backdrop-blur-md p-8 rounded-2xl shadow-2xl border border-blue-500/50 w-full max-w-lg">
        {screens[step]}
      </div>
    </div>
  );
};

export default FTUScreen;