'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, RefreshCw, Info, Star } from 'lucide-react';
import { BirthData } from '@/types/astrology';

interface BirthChartData {
  svg: string;
  signSummary: string;
  houseBreakdown: string[];
  isUnavailable?: boolean;
}

interface BirthChartAPIResponse {
  success: boolean;
  data?: BirthChartData & {
    isUnavailable?: boolean;
    error?: string;
  };
  error?: string;
}

interface BirthChartViewerProps {
  birthData: BirthData;
  onBack?: () => void;
  className?: string;
}

async function callBirthChartAPI(birthData: BirthData): Promise<BirthChartAPIResponse> {
  try {
    const response = await fetch('/api/astrology/birth-chart', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        birthData: {
          name: birthData.name || 'User',
          date: birthData.date,
          city: birthData.city,
          country: birthData.country,
          lat: birthData.lat || birthData.latitude,
          lng: birthData.lng || birthData.longitude,
          timezone: birthData.timezone
        }
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to call birth chart API:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

function getFallbackChart(): BirthChartData {
  return {
    svg: '<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg"><circle cx="200" cy="200" r="180" fill="none" stroke="#6B7280" stroke-width="2" stroke-dasharray="10,5"/><text x="200" y="200" text-anchor="middle" fill="#6B7280" font-size="16">Chart Unavailable</text></svg>',
    signSummary: "Birth chart temporarily unavailable. Our astrological calculation service is currently offline. We use authentic astronomical calculations with Swiss Ephemeris data to generate your complete natal chart. Please try again in a few moments.",
    houseBreakdown: [
      "Birth chart service temporarily unavailable",
      "Please try again in a few moments",
      "We use Swiss Ephemeris for accurate calculations"
    ],
    isUnavailable: true
  };
}

export const BirthChartViewer: React.FC<BirthChartViewerProps> = ({
  birthData,
  onBack,
  className = ''
}) => {
  const [chartData, setChartData] = useState<BirthChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUnavailable, setIsUnavailable] = useState(false);

  useEffect(() => {
    async function fetchBirthChart() {
      try {
        setLoading(true);
        setError(null);
        const result = await callBirthChartAPI(birthData);
        
        if (!result.success || !result.data) {
          console.warn('Birth chart API failed, using fallback:', result.error);
          const fallback = getFallbackChart();
          setChartData(fallback);
          setIsUnavailable(true);
          return;
        }

        // Check if service is temporarily unavailable
        if (result.data.isUnavailable) {
          setIsUnavailable(true);
        }

        setChartData({
          svg: result.data.svg,
          signSummary: result.data.signSummary,
          houseBreakdown: result.data.houseBreakdown
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load birth chart');
        const fallback = getFallbackChart();
        setChartData(fallback);
        setIsUnavailable(true);
      } finally {
        setLoading(false);
      }
    }

    fetchBirthChart();
  }, [birthData]);

  const handleRetry = () => {
    setIsUnavailable(false);
    setError(null);
    setLoading(true);
    setTimeout(() => {
      setChartData(null);
    }, 100);
  };

  // Shimmer loading component
  const ShimmerContent = () => (
    <motion.div 
      className={`min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4 ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-6xl mx-auto">
        {onBack && (
          <div className="mb-6">
            <div className="w-32 h-6 bg-white/10 rounded animate-pulse"></div>
          </div>
        )}
        
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Chart shimmer */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <div className="w-48 h-6 bg-white/10 rounded animate-pulse mb-4"></div>
            <div className="aspect-square bg-white/5 rounded-xl animate-pulse"></div>
          </div>
          
          {/* Content shimmer */}
          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <div className="w-40 h-6 bg-white/10 rounded animate-pulse mb-4"></div>
              <div className="space-y-3">
                <div className="w-full h-4 bg-white/5 rounded animate-pulse"></div>
                <div className="w-4/5 h-4 bg-white/5 rounded animate-pulse"></div>
                <div className="w-5/6 h-4 bg-white/5 rounded animate-pulse"></div>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <div className="w-48 h-6 bg-white/10 rounded animate-pulse mb-4"></div>
              <div className="space-y-2">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-white/10 rounded-full animate-pulse"></div>
                    <div className="w-3/4 h-4 bg-white/5 rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  if (loading) {
    return <ShimmerContent />;
  }

  if (error && !chartData) {
    return (
      <div className={`min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4 ${className}`}>
        <div className="max-w-4xl mx-auto pt-8">
          {onBack && (
            <button
              onClick={onBack}
              className="mb-6 flex items-center gap-2 text-white/70 hover:text-white transition-colors"
            >
              ← Back
            </button>
          )}
          
          <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Error Loading Birth Chart</h2>
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

  if (!chartData) {
    return null;
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4 ${className}`}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        {onBack && (
          <motion.div 
            className="flex items-center justify-between mb-8 pt-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
            >
              ← Back
            </button>
            
            <h1 className="text-3xl font-bold text-white text-center flex-1">
              🌟 Your Birth Chart
            </h1>
            
            <div className="w-24"></div> {/* Spacer */}
          </motion.div>
        )}

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
              We believe in providing authentic astrological insights based on real planetary positions.
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

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Birth Chart SVG */}
          <motion.div 
            className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Star className="w-6 h-6 text-yellow-400" />
              Natal Chart
            </h2>
            
            <div 
              className="w-full max-w-md mx-auto"
              dangerouslySetInnerHTML={{ __html: chartData.svg }}
            />
          </motion.div>

          {/* Chart Information */}
          <div className="space-y-6">
            {/* Sign Summary */}
            <motion.div 
              className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-purple-400" />
                Your Sun Sign
              </h3>
              <p className="text-white/90 leading-relaxed">{chartData.signSummary}</p>
            </motion.div>

            {/* House Breakdown */}
            <motion.div 
              className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Star className="w-5 h-5 text-blue-400" />
                House Positions
              </h3>
              <div className="space-y-3">
                {chartData.houseBreakdown.map((house, index) => (
                  <motion.div 
                    key={index}
                    className="flex items-start gap-3 p-3 bg-white/5 rounded-lg"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + index * 0.05 }}
                  >
                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-white/80 leading-relaxed">{house}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Footer Note */}
        {!isUnavailable && (
          <motion.div 
            className="text-center mt-8 text-white/60 text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <p>✨ Chart generated using authentic astronomical calculations with Swiss Ephemeris data</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};