'use client';
 
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, User, Globe } from 'lucide-react';
import CosmicCalendar from './calendar';
import { InteractiveBirthChart } from '@/components/astrology/InteractiveBirthChart';
import { useAuth } from '@/contexts/AuthContext';
import { BirthData } from '../../types/astrology';
export default function HoroscopePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'today' | 'calendar' | 'chart'>('today');
  const [birthData, setBirthData] = useState<BirthData | null>(null);
  const [showTransits, setShowTransits] = useState(false);
  // Load user's birth data if available
 
  useEffect(() => {
    if (user) {
      // This would typically come from user profile/database
      // For demo, we'll use sample data if user is logged in
      setBirthData({
        birthDate: '1990-06-15',
        birthTime: '14:30',
        latitude: 40.7128,
        longitude: -74.0060,
        timezone: 'America/New_York'
      });
    }
  }, [user]);
  const tabs = [
    { id: 'today', label: 'Today', icon: Globe },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'chart', label: 'Birth Chart', icon: User }
  ];
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Cosmic Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 opacity-20">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                opacity: [0.2, 1, 0.2],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 3,
              }}
            />
          ))}
        </div>
      </div>
      <div className="relative z-10">
        {/* Header */}
        <div className="container mx-auto px-4 py-8">
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-4">
              Cosmic Transit Engine
            </h1>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Real-time planetary movements with personalized insights and astronomical accuracy
            </p>
          </motion.div>
          {/* Navigation Tabs */}
          <div className="flex justify-center mb-8">
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-2 border border-purple-500/20">
              <div className="flex space-x-2">
                {tabs.map((tab) => {
                  const IconComponent = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                        activeTab === tab.id
                          ? 'bg-purple-600 text-white shadow-lg'
                          : 'text-gray-400 hover:text-white hover:bg-gray-800'
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          {/* Settings Toggle for Chart View */}
          {activeTab === 'chart' && birthData && (
            <motion.div
              className="flex justify-center mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-4 border border-purple-500/20">
                <label className="flex items-center gap-3 cursor-pointer">
                  <span className="text-gray-300">Show Current Transits</span>
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={showTransits}
                      onChange={(e) => setShowTransits(e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`w-12 h-6 rounded-full transition-colors ${
                      showTransits ? 'bg-purple-600' : 'bg-gray-600'
                    }`}>
                      <div className={`w-5 h-5 bg-white rounded-full transition-transform transform ${
                        showTransits ? 'translate-x-6' : 'translate-x-0.5'
                      } mt-0.5`} />
                    </div>
                  </div>
                </label>
              </div>
            </motion.div>
          )}
          {/* Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-6xl mx-auto"
          >
            {activeTab === 'today' && (
              <CosmicCalendar 
                birthData={birthData || undefined}
                className="bg-gray-900/70 backdrop-blur-sm border border-purple-500/30"
              />
            )}
            {activeTab === 'calendar' && (
              <CosmicCalendar 
                birthData={birthData || undefined}
                className="bg-gray-900/70 backdrop-blur-sm border border-purple-500/30"
              />
            )}
            {activeTab === 'chart' && (
              <div className="space-y-6">
                {!birthData ? (
                  <div className="bg-gray-900/70 backdrop-blur-sm rounded-lg p-8 border border-purple-500/30 text-center">
                    <div className="text-gray-400 mb-4">
                      <User className="w-16 h-16 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold mb-2">Birth Chart Unavailable</h3>
                      <p>Please sign up and add your birth information to view your personalized birth chart with current transits.</p>
                    </div>
                    {!user && (
                      <div className="flex gap-4 justify-center mt-6">
                        <button className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
                          Sign Up
                        </button>
                        <button className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
                          Log In
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-gray-900/70 backdrop-blur-sm rounded-lg p-6 border border-purple-500/30">
                    <div className="mb-4 text-center">
                      <h3 className="text-xl font-semibold text-purple-300 mb-2">
                        {showTransits ? 'Birth Chart with Current Transits' : 'Natal Birth Chart'}
                      </h3>
                      <p className="text-gray-400 text-sm">
                        {showTransits 
                          ? 'Your birth chart with current planetary positions overlaid. Transit planets appear in the outer ring with aspect lines showing current influences.'
                          : 'Your personal birth chart calculated from exact birth time and location. Click planets, houses, or signs for detailed information.'
                        }
                      </p>
                    </div>
                    
                    <div className="flex justify-center">
                      <InteractiveBirthChart
                        birthData={birthData}
                        showTransits={showTransits}
                        transitDate={new Date()}
                        className="max-w-2xl w-full"
                      />
                    </div>
                    {showTransits && (
                      <div className="mt-6 grid md:grid-cols-3 gap-4 text-sm">
                        <div className="bg-gray-800/50 rounded-lg p-4">
                          <h4 className="font-semibold text-purple-300 mb-2">Transit Legend</h4>
                          <div className="space-y-1 text-gray-300">
                            <div>● Natal planets (inner)</div>
                            <div>○ Transit planets (outer)</div>
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-0.5 bg-yellow-400"></div>
                              <span>Conjunction</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-0.5 bg-green-400"></div>
                              <span>Trine</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-0.5 bg-red-400"></div>
                              <span>Square</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-gray-800/50 rounded-lg p-4">
                          <h4 className="font-semibold text-purple-300 mb-2">Aspect Strength</h4>
                          <div className="space-y-1 text-gray-300">
                            <div>Strong: 0-1° orb</div>
                            <div>Moderate: 1-3° orb</div>
                            <div>Weak: 3-6° orb</div>
                            <div className="mt-2 text-xs">
                              Dashed lines = applying<br/>
                              Solid lines = separating
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-gray-800/50 rounded-lg p-4">
                          <h4 className="font-semibold text-purple-300 mb-2">How to Use</h4>
                          <div className="space-y-1 text-gray-300 text-xs">
                            <div>• Click any planet for details</div>
                            <div>• Transit aspects show current influences</div>
                            <div>• Retrograde planets marked with ℞</div>
                            <div>• Toggle animation for movement</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
