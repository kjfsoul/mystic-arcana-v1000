'use client';
import React from 'react';
interface AstrologyZonePreviewProps {
  // eslint-disable-next-line no-unused-vars
  onSelectFeature?: (feature: string) => void;
}
export const AstrologyZonePreview: React.FC<AstrologyZonePreviewProps> = ({
  onSelectFeature: _onSelectFeature
}) => {
  const features = [
    {
      id: 'birth-chart',
      name: 'Birth Chart',
      icon: '🌟',
      description: 'Your cosmic blueprint'
    },
    {
      id: 'horoscope',
      name: 'Daily Horoscope',
      icon: '☀️',
      description: 'Today\'s guidance'
    },
    {
      id: 'moon-cycle',
      name: 'Moon Cycle',
      icon: '🌙',
      description: 'Lunar influences'
    },
    {
      id: 'transits',
      name: 'Current Transits',
      icon: '🪐',
      description: 'Planetary movements'
    }
  ];
  return (
    <div className="h-full p-6 lg:p-8 flex flex-col text-white/90 overflow-y-auto">
      <h2 className="text-2xl lg:text-3xl font-light text-center mb-6 lg:mb-8 tracking-wider drop-shadow-[0_2px_10px_rgba(255,215,0,0.5)]">
        ✨ Astrology Portal
      </h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4 mb-6 lg:mb-8">
        {features.map(feature => (
          <button
            key={feature.id}
            className="bg-amber-900/10 border border-amber-600/30 rounded-lg p-4 lg:p-5 transition-all duration-300 hover:bg-amber-900/20 hover:border-amber-600/50 hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-white/80 focus:ring-offset-2 focus:ring-offset-transparent flex items-center gap-3 lg:gap-4"
            onClick={() => _onSelectFeature?.(feature.id)}
            aria-label={`Select ${feature.name}`}
          >
            <span className="text-2xl lg:text-3xl flex-shrink-0">{feature.icon}</span>
            <div className="text-left flex-1 min-w-0">
              <span className="block text-sm lg:text-base font-medium text-white/90 truncate">
                {feature.name}
              </span>
              <span className="block text-xs lg:text-sm text-white/60 truncate">
                {feature.description}
              </span>
            </div>
          </button>
        ))}
      </div>
      <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 lg:p-6 mb-6 lg:mb-8 flex-1">
        <h3 className="text-base lg:text-lg font-medium text-amber-400 mb-2">
          Today&apos;s Cosmic Weather
        </h3>
        <p className="text-sm lg:text-base text-white/70 leading-relaxed">
          Mercury in Capricorn brings clarity to communication. 
          The waxing moon invites new beginnings.
        </p>
      </div>
      <div className="mt-auto text-center text-sm lg:text-base text-white/50 italic">
        Click to explore the cosmos
      </div>
    </div>
  );
};
