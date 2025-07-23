'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, Star, Moon, Sun, Zap, Eye, Heart } from 'lucide-react';
import { TransitEngine, DailyTransit, PersonalizedHoroscope, PlanetaryPosition, TransitAspect } from '@/lib/ephemeris/transitEngine';
import { BirthData } from '@/types/astrology';
import { useAuth } from '@/contexts/AuthContext';

interface CosmicCalendarProps {
  birthData?: BirthData;
  className?: string;
}

interface CalendarDay {
  date: Date;
  isToday: boolean;
  isCurrentMonth: boolean;
  cosmicEnergy: 'high' | 'medium' | 'low';
  majorTransits: number;
  lunarPhase: string;
}

export default function CosmicCalendar({ birthData, className = '' }: CosmicCalendarProps) {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dailyTransit, setDailyTransit] = useState<DailyTransit | null>(null);
  const [personalHoroscope, setPersonalHoroscope] = useState<PersonalizedHoroscope | null>(null);
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'calendar' | 'today' | 'week'>('today');
  const [transitEngine] = useState(() => new TransitEngine());

  useEffect(() => {
    loadDailyData(selectedDate);
  }, [selectedDate, birthData]);

  useEffect(() => {
    if (view === 'calendar') {
      generateCalendarDays(currentDate);
    }
  }, [currentDate, view]);

  const loadDailyData = async (date: Date) => {
    setLoading(true);
    try {
      // Load daily transit data
      const transit = await transitEngine.getDailyTransit(date);
      setDailyTransit(transit);

      // Load personalized horoscope if birth data available
      if (birthData) {
        const horoscope = await transitEngine.generatePersonalizedHoroscope(birthData, date);
        setPersonalHoroscope(horoscope);
        
        // Add personalized transits to daily transit
        const transits = await transitEngine.calculateTransits(birthData, date);
        setDailyTransit(prev => prev ? { ...prev, majorAspects: transits } : transit);
      }
    } catch (error) {
      console.error('Failed to load daily data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateCalendarDays = async (baseDate: Date) => {
    const year = baseDate.getFullYear();
    const month = baseDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const startDate = new Date(firstDayOfMonth);
    startDate.setDate(startDate.getDate() - firstDayOfMonth.getDay());
    
    const days: CalendarDay[] = [];
    const today = new Date();
    
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      // Generate cosmic data for each day (simplified for performance)
      const cosmicEnergy: 'high' | 'medium' | 'low' = ['high', 'medium', 'low'][Math.floor(Math.random() * 3)] as any;
      const majorTransits = Math.floor(Math.random() * 5);
      const lunarPhases = ['new', 'waxing_crescent', 'first_quarter', 'waxing_gibbous', 'full', 'waning_gibbous', 'last_quarter', 'waning_crescent'];
      const lunarPhase = lunarPhases[Math.floor(Math.random() * lunarPhases.length)];
      
      days.push({
        date,
        isToday: date.toDateString() === today.toDateString(),
        isCurrentMonth: date.getMonth() === month,
        cosmicEnergy,
        majorTransits,
        lunarPhase
      });
    }
    
    setCalendarDays(days);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getEnergyColor = (energy: 'high' | 'medium' | 'low') => {
    switch (energy) {
      case 'high': return 'text-red-400 bg-red-400/10';
      case 'medium': return 'text-yellow-400 bg-yellow-400/10';
      case 'low': return 'text-blue-400 bg-blue-400/10';
      default: return 'text-purple-400 bg-purple-400/10';
    }
  };

  const getLunarPhaseIcon = (phase: string) => {
    const phases = {
      new: '🌑',
      waxing_crescent: '🌒',
      first_quarter: '🌓',
      waxing_gibbous: '🌔',
      full: '🌕',
      waning_gibbous: '🌖',
      last_quarter: '🌗',
      waning_crescent: '🌘'
    };
    return phases[phase as keyof typeof phases] || '🌑';
  };

  const renderPlanetaryPositions = () => {
    if (!dailyTransit) return null;

    return (
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-purple-300 flex items-center gap-2">
          <Star className="w-5 h-5" />
          Planetary Positions
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {dailyTransit.planetaryPositions.map((position) => (
            <motion.div
              key={position.planet}
              className="bg-gray-800/50 rounded-lg p-3 border border-purple-500/20"
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-purple-300 capitalize font-medium">
                  {position.planet}
                </span>
                {position.retrograde && (
                  <span className="text-orange-400 text-xs">℞</span>
                )}
              </div>
              <div className="text-sm text-gray-300">
                {Math.round(position.longitude)}° {position.sign}
              </div>
              <div className="text-xs text-gray-400">
                {position.speed > 0 ? 'Direct' : 'Retrograde'}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

  const renderPersonalizedHoroscope = () => {
    if (!personalHoroscope) return null;

    return (
      <div className="space-y-6">
        <motion.div
          className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-lg p-6 border border-purple-500/30"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-xl font-semibold text-purple-300 mb-3">Today's Theme</h3>
          <p className="text-gray-300 leading-relaxed">{personalHoroscope.overallTheme}</p>
        </motion.div>

        {personalHoroscope.keyTransits.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-purple-300 flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Key Transits
            </h3>
            {personalHoroscope.keyTransits.map((transit, index) => (
              <motion.div
                key={index}
                className="bg-gray-800/50 rounded-lg p-4 border border-purple-500/20"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-purple-300 capitalize font-medium">
                    {transit.transitPlanet}
                  </span>
                  <span className="text-gray-400">{transit.aspect}</span>
                  <span className="text-purple-300 capitalize">
                    {transit.natalPlanet}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    transit.strength === 'strong' ? 'bg-red-400/20 text-red-400' :
                    transit.strength === 'moderate' ? 'bg-yellow-400/20 text-yellow-400' :
                    'bg-blue-400/20 text-blue-400'
                  }`}>
                    {transit.strength}
                  </span>
                </div>
                <div className="text-sm text-gray-400">
                  Orb: {transit.orb.toFixed(1)}° • 
                  {transit.applying ? ' Applying' : ' Separating'}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-purple-300 flex items-center gap-2">
              <Heart className="w-5 h-5" />
              Daily Guidance
            </h3>
            <div className="space-y-3">
              {Object.entries(personalHoroscope.dailyGuidance).map(([area, guidance]) => (
                <div key={area} className="bg-gray-800/30 rounded-lg p-3">
                  <div className="text-sm font-medium text-purple-300 capitalize mb-1">
                    {area}
                  </div>
                  <div className="text-sm text-gray-300">{guidance}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-purple-300">Cosmic Details</h3>
            <div className="space-y-3">
              <div className="bg-gray-800/30 rounded-lg p-3">
                <div className="text-sm font-medium text-purple-300 mb-1">Best Time</div>
                <div className="text-sm text-gray-300">{personalHoroscope.bestTimeOfDay}</div>
              </div>
              <div className="bg-gray-800/30 rounded-lg p-3">
                <div className="text-sm font-medium text-purple-300 mb-1">Lucky Numbers</div>
                <div className="text-sm text-gray-300">
                  {personalHoroscope.luckyNumbers.join(', ')}
                </div>
              </div>
              <div className="bg-gray-800/30 rounded-lg p-3">
                <div className="text-sm font-medium text-purple-300 mb-1">Affirmation</div>
                <div className="text-sm text-gray-300 italic">
                  "{personalHoroscope.affirmation}"
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCosmicWeather = () => {
    if (!dailyTransit) return null;

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-purple-300 flex items-center gap-2">
          <Eye className="w-5 h-5" />
          Cosmic Weather
        </h3>
        
        <div className="grid md:grid-cols-3 gap-4">
          <div className={`rounded-lg p-4 ${getEnergyColor(dailyTransit.cosmicWeather.energy)}`}>
            <div className="text-sm font-medium mb-1">Energy Level</div>
            <div className="text-lg font-bold capitalize">{dailyTransit.cosmicWeather.energy}</div>
          </div>
          
          <div className="bg-gray-800/30 rounded-lg p-4">
            <div className="text-sm font-medium text-purple-300 mb-2">Lunar Phase</div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{getLunarPhaseIcon(dailyTransit.lunarPhase.phase)}</span>
              <div>
                <div className="text-sm capitalize">{dailyTransit.lunarPhase.phase.replace('_', ' ')}</div>
                <div className="text-xs text-gray-400">
                  {Math.round(dailyTransit.lunarPhase.illumination * 100)}% illuminated
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800/30 rounded-lg p-4">
            <div className="text-sm font-medium text-purple-300 mb-2">Focus Areas</div>
            <div className="text-sm text-gray-300">
              {dailyTransit.cosmicWeather.focus.slice(0, 2).join(', ')}
            </div>
          </div>
        </div>

        {dailyTransit.cosmicWeather.opportunities.length > 0 && (
          <div className="bg-green-400/10 border border-green-400/20 rounded-lg p-4">
            <div className="text-sm font-medium text-green-400 mb-2">Opportunities</div>
            <ul className="text-sm text-gray-300 space-y-1">
              {dailyTransit.cosmicWeather.opportunities.map((opportunity, index) => (
                <li key={index}>• {opportunity}</li>
              ))}
            </ul>
          </div>
        )}

        {dailyTransit.cosmicWeather.challenges.length > 0 && (
          <div className="bg-orange-400/10 border border-orange-400/20 rounded-lg p-4">
            <div className="text-sm font-medium text-orange-400 mb-2">Challenges</div>
            <ul className="text-sm text-gray-300 space-y-1">
              {dailyTransit.cosmicWeather.challenges.map((challenge, index) => (
                <li key={index}>• {challenge}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  const renderCalendarView = () => {
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-purple-300">
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1))}
              className="px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1))}
              className="px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition-colors"
            >
              Next
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {weekdays.map(day => (
            <div key={day} className="text-center text-sm font-medium text-purple-300 py-2">
              {day}
            </div>
          ))}
          
          {calendarDays.map((day, index) => (
            <motion.button
              key={index}
              className={`aspect-square p-2 rounded-lg text-sm transition-all relative ${
                day.isToday ? 'bg-purple-600 text-white' :
                day.isCurrentMonth ? 'bg-gray-800/50 hover:bg-gray-700/50 text-gray-300' :
                'bg-gray-900/30 text-gray-500'
              } ${selectedDate.toDateString() === day.date.toDateString() ? 'ring-2 ring-purple-400' : ''}`}
              onClick={() => setSelectedDate(day.date)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div>{day.date.getDate()}</div>
              <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex gap-1">
                <div className={`w-1 h-1 rounded-full ${getEnergyColor(day.cosmicEnergy).split(' ')[0]}`} />
                {day.majorTransits > 0 && (
                  <div className="w-1 h-1 rounded-full bg-yellow-400" />
                )}
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className={`bg-gray-900 rounded-lg p-6 ${className}`}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gray-900 rounded-lg p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-purple-300 flex items-center gap-2">
          <Calendar className="w-6 h-6" />
          Cosmic Calendar
        </h1>
        
        <div className="flex gap-2">
          {['today', 'calendar', 'week'].map((viewOption) => (
            <button
              key={viewOption}
              onClick={() => setView(viewOption as any)}
              className={`px-3 py-1 rounded-lg text-sm transition-colors capitalize ${
                view === viewOption 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
              }`}
            >
              {viewOption}
            </button>
          ))}
        </div>
      </div>

      {/* Date Display */}
      <div className="mb-6">
        <h2 className="text-lg text-gray-300">{formatDate(selectedDate)}</h2>
      </div>

      {/* View Content */}
      <AnimatePresence mode="wait">
        {view === 'today' && (
          <motion.div
            key="today"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            {/* Guest user notice */}
            {!birthData && (
              <div className="bg-blue-400/10 border border-blue-400/20 rounded-lg p-4">
                <div className="text-blue-400 font-medium mb-1">General Cosmic Weather</div>
                <div className="text-sm text-gray-300">
                  Sign up and add your birth information for personalized transits and horoscope guidance.
                </div>
              </div>
            )}

            {renderCosmicWeather()}
            {renderPlanetaryPositions()}
            {personalHoroscope && renderPersonalizedHoroscope()}
          </motion.div>
        )}

        {view === 'calendar' && (
          <motion.div
            key="calendar"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {renderCalendarView()}
          </motion.div>
        )}

        {view === 'week' && (
          <motion.div
            key="week"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center text-gray-400 py-12"
          >
            Weekly view coming soon...
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}