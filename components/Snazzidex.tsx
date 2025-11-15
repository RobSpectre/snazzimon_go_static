import React from 'react';
import type { SnazzimonData } from '../types';
import { CloseIcon, SnazziBallIcon } from './icons';

interface SnazzidexProps {
  capturedSnazzimons: SnazzimonData[];
  onClose: () => void;
  onSnazzimonClick: (snazzimon: SnazzimonData) => void;
}

const Snazzidex: React.FC<SnazzidexProps> = ({ capturedSnazzimons, onClose, onSnazzimonClick }) => {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <style>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
      `}</style>
      <div className="bg-slate-800/80 border-2 border-blue-500/50 rounded-2xl shadow-2xl w-full max-w-3xl h-full max-h-[90vh] flex flex-col relative">
        <div className="flex justify-between items-center p-4 border-b-2 border-blue-500/30">
          <h2 className="text-3xl font-bold text-blue-300 [text-shadow:0_2px_4px_#000]">Snazzidex</h2>
          <button onClick={onClose} className="text-white hover:text-blue-300 rounded-full p-2 transition-colors">
            <CloseIcon className="w-8 h-8" />
          </button>
        </div>
        <div className="overflow-y-auto p-6 flex-grow">
          {capturedSnazzimons.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <SnazziBallIcon className="w-24 h-24 opacity-20 mb-4" />
              <p className="text-2xl font-semibold">No Snazzimons Captured Yet!</p>
              <p className="mt-2 text-lg">Get out there and find some.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {capturedSnazzimons.map((snazzimon) => (
                <div
                  key={snazzimon.id}
                  onClick={() => {
                    onClose();
                    onSnazzimonClick(snazzimon);
                  }}
                  className="bg-slate-700/50 p-3 rounded-lg flex flex-col items-center text-center shadow-md border border-slate-600 transition-all duration-300 hover:border-blue-400 hover:scale-105 hover:bg-slate-700 cursor-pointer"
                >
                  <div className="relative w-24 h-24 mb-3">
                    <div className="absolute inset-0 bg-blue-400/20 rounded-full blur-md"></div>
                    <img src={snazzimon.image} alt={snazzimon.name} className="relative w-full h-full rounded-full border-2 border-blue-400" />
                  </div>
                  <p className="font-semibold text-white text-lg">{snazzimon.name}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Snazzidex;