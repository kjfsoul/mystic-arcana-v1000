'use client';

import React from 'react';

interface TarotZonePreviewProps {
  onSelectReading?: (type: string) => void;
}

export const TarotZonePreview: React.FC<TarotZonePreviewProps> = ({
  onSelectReading
}) => {

  const readings = [
    { id: 'single', name: 'Single Card', description: 'Quick insight' },
    { id: 'three-card', name: 'Three Card', description: 'Past, Present, Future' },
    { id: 'celtic-cross', name: 'Celtic Cross', description: 'Deep exploration' }
  ];

  return (
    <div className="h-full p-6 lg:p-8 flex flex-col text-white/90 overflow-y-auto">
      <h2 className="text-2xl lg:text-3xl font-light text-center mb-6 lg:mb-8 tracking-wider drop-shadow-[0_2px_10px_rgba(138,43,226,0.5)]">
        🔮 Tarot Portal
      </h2>
      
      <div className="bg-purple-500/5 border border-purple-500/20 rounded-xl p-4 lg:p-6 mb-6 lg:mb-8 text-center">
        <h3 className="text-lg lg:text-xl font-medium text-white/90 mb-2">
          🌙 Rider-Waite Deck
        </h3>
        <p className="text-sm lg:text-base text-white/60 italic">
          The classic tarot deck for timeless wisdom
        </p>
      </div>

      <div className="mb-6 lg:mb-8 flex-1">
        <h3 className="text-sm lg:text-base font-normal mb-4 text-white/70 uppercase tracking-wider">
          Select Reading Type
        </h3>
        <div className="flex flex-col gap-3">
          {readings.map(reading => (
            <button
              key={reading.id}
              className="bg-indigo-900/10 border border-indigo-700/30 rounded-lg p-4 lg:p-5 text-left transition-all duration-300 hover:bg-indigo-900/20 hover:border-indigo-700/50 hover:translate-x-1 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-white/80 focus:ring-offset-2 focus:ring-offset-transparent"
              onClick={() => onSelectReading?.(reading.id)}
              aria-label={`Select ${reading.name} reading`}
            >
              <span className="block text-base lg:text-lg font-medium text-white/90 mb-1">
                {reading.name}
              </span>
              <span className="block text-sm lg:text-base text-white/60">
                {reading.description}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-auto text-center text-sm lg:text-base text-white/50 italic">
        Click to enter the Tarot Realm
      </div>
    </div>
  );
};