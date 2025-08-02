'use client';
 
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Heart, 
  Users, 
  Briefcase, 
  Stars, 
  AlertCircle,
  RefreshCw,
  Info
} from 'lucide-react';
import { BirthData } from '@/lib/astrology/AstronomicalCalculator';
import { calculateCompatibility, CompatibilityResult } from '@/lib/astrology/SynastryCalculator';
interface CompatibilityReportProps {
  person1Data: BirthData;
  person2Data: BirthData;
  onBack: () => void;
}
export const CompatibilityReport: React.FC<CompatibilityReportProps> = ({
  person1Data,
  person2Data,
  onBack
}) => {
  const [compatibility, setCompatibility] = useState<CompatibilityResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUnavailable, setIsUnavailable] = useState(false);
 
  useEffect(() => {
    async function fetchCompatibility() {
      try {
        setLoading(true);
        setError(null);
        const result = await calculateCompatibility(person1Data, person2Data);
        setCompatibility(result);
        
        // Check if this is a fallback response
        if (result.love.rating === 0 && result.love.description.includes('temporarily unavailable')) {
          setIsUnavailable(true);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to calculate compatibility');
      } finally {
        setLoading(false);
      }
    }
    fetchCompatibility();
  }, [person1Data, person2Data]);
  const handleRetry = () => {
    setIsUnavailable(false);
    setError(null);
    // Re-trigger the effect by changing a state value
    setLoading(true);
    setTimeout(() => {
      // This will re-run the useEffect
      setCompatibility(null);
    }, 100);
  };
  const getScoreColor = (rating: number) => {
    if (rating === 0) return 'text-gray-400';
    if (rating >= 4) return 'text-green-400';
    if (rating >= 3) return 'text-blue-400';
    if (rating >= 2) return 'text-yellow-400';
    return 'text-red-400';
  };
  const getScoreStars = (rating: number) => {
    if (rating === 0) return '◦◦◦◦◦';
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4 flex items-center justify-center">
        <motion.div 
          className="text-center text-white"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="mb-4"
          >
            <Stars className="w-16 h-16 mx-auto text-purple-300" />
          </motion.div>
          <h2 className="text-2xl font-bold mb-2">Calculating Cosmic Compatibility</h2>
          <p className="text-purple-200">Analyzing planetary positions and synastry aspects...</p>
        </motion.div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
        <div className="max-w-4xl mx-auto pt-8">
          <button
            onClick={onBack}
            className="mb-6 flex items-center gap-2 text-white/70 hover:text-white transition-colors"
          >
            ← Back to Astrology
          </button>
          
          <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Error Calculating Compatibility</h2>
            <p className="text-red-200 mb-4">{error}</p>
            <button
              onClick={handleRetry}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2 mx-auto"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }
  if (!compatibility) {
    return null;
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div 
          className="flex items-center justify-between mb-8 pt-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
          >
            ← Back to Astrology
          </button>
          
          <h1 className="text-3xl font-bold text-white text-center flex-1">
            💫 Compatibility Report
          </h1>
          
          <div className="w-24"></div> {/* Spacer */}
        </motion.div>
        {/* Service Unavailable Warning */}
        {isUnavailable && (
          <motion.div 
            className="bg-yellow-500/20 border border-yellow-500/50 rounded-xl p-6 mb-6"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="flex items-center gap-3 mb-3">
              <Info className="w-6 h-6 text-yellow-400" />
              <h3 className="text-lg font-semibold text-yellow-200">Service Temporarily Unavailable</h3>
            </div>
            <p className="text-yellow-100 mb-4">
              Our astronomical calculation service (using Swiss Ephemeris and Kerykeion) is currently offline. 
              We believe in providing authentic astrological insights based on real planetary positions, 
              not mock data.
            </p>
            <button
              onClick={handleRetry}
              className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Check Service Status
            </button>
          </motion.div>
        )}
        {/* Compatibility Scores */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Love Compatibility */}
          <motion.div 
            className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <Heart className="w-8 h-8 text-pink-400" />
              <h3 className="text-xl font-bold text-white">Love</h3>
            </div>
            <div className={`text-3xl font-bold mb-2 ${getScoreColor(compatibility.love.rating)}`}>
              {getScoreStars(compatibility.love.rating)}
            </div>
            <p className="text-white/80 text-sm leading-relaxed">{compatibility.love.description}</p>
          </motion.div>
          {/* Friendship Compatibility */}
          <motion.div 
            className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <Users className="w-8 h-8 text-blue-400" />
              <h3 className="text-xl font-bold text-white">Friendship</h3>
            </div>
            <div className={`text-3xl font-bold mb-2 ${getScoreColor(compatibility.friendship.rating)}`}>
              {getScoreStars(compatibility.friendship.rating)}
            </div>
            <p className="text-white/80 text-sm leading-relaxed">{compatibility.friendship.description}</p>
          </motion.div>
          {/* Teamwork Compatibility */}
          <motion.div 
            className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <Briefcase className="w-8 h-8 text-green-400" />
              <h3 className="text-xl font-bold text-white">Teamwork</h3>
            </div>
            <div className={`text-3xl font-bold mb-2 ${getScoreColor(compatibility.teamwork.rating)}`}>
              {getScoreStars(compatibility.teamwork.rating)}
            </div>
            <p className="text-white/80 text-sm leading-relaxed">{compatibility.teamwork.description}</p>
          </motion.div>
        </div>
        {/* Overall Summary */}
        <motion.div 
          className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 backdrop-blur-md rounded-2xl p-8 border border-white/20 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <Stars className="w-6 h-6 text-yellow-400" />
            Overall Cosmic Connection
          </h3>
          <p className="text-white/90 text-lg leading-relaxed">{compatibility.overall.summary}</p>
        </motion.div>
        {/* Key Aspects */}
        <motion.div 
          className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="text-2xl font-bold text-white mb-6">Key Astrological Insights</h3>
          <div className="space-y-4">
            {compatibility.overall.keyAspects.map((aspect, index) => (
              <motion.div 
                key={index}
                className="flex items-start gap-3 p-4 bg-white/5 rounded-xl"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
              >
                <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-white/80 leading-relaxed">{aspect}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
        {/* Footer Note */}
        {!isUnavailable && (
          <motion.div 
            className="text-center mt-8 text-white/60 text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <p>✨ Analysis based on authentic astronomical calculations using Swiss Ephemeris data</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};
