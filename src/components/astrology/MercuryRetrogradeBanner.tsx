'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SwissEphemerisShim } from '@/lib/astrology/SwissEphemerisShim';

interface MercuryRetrogradeBannerProps {
  onMarketplaceClick?: () => void;
}

interface RetrogradePeriod {
  start: Date;
  end: Date;
  stationaryDate: Date;
}

export const MercuryRetrogradeBanner: React.FC<MercuryRetrogradeBannerProps> = ({
  onMarketplaceClick
}) => {
  const [isRetrograde, setIsRetrograde] = useState(false);
  const [currentPeriod, setCurrentPeriod] = useState<RetrogradePeriod | null>(null);
  const [loading, setLoading] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  // Mercury Retrograde periods for 2025
  const retrogradePeriods: RetrogradePeriod[] = [
    {
      start: new Date('2025-03-15'),
      end: new Date('2025-04-07'),
      stationaryDate: new Date('2025-03-29')
    },
    {
      start: new Date('2025-07-18'),
      end: new Date('2025-08-11'),
      stationaryDate: new Date('2025-08-01')
    },
    {
      start: new Date('2025-11-09'),
      end: new Date('2025-11-29'),
      stationaryDate: new Date('2025-11-19')
    }
  ];

  useEffect(() => {
    const checkMercuryRetrograde = async () => {
      try {
        const now = new Date();
        
        // Check if we're currently in a retrograde period
        const activePeriod = retrogradePeriods.find(period => 
          now >= period.start && now <= period.end
        );

        if (activePeriod) {
          setIsRetrograde(true);
          setCurrentPeriod(activePeriod);
        } else {
          // For demo purposes, let's also check if Mercury is actually retrograde using ephemeris
          await SwissEphemerisShim.initialize();
          
          const today = new Date();
          const jd = SwissEphemerisShim.dateToJulianDay(today);
          const nextDay = new Date(today);
          nextDay.setDate(nextDay.getDate() + 1);
          const jdNext = SwissEphemerisShim.dateToJulianDay(nextDay);
          
          const mercuryToday = SwissEphemerisShim.calculatePlanetPosition('Mercury', jd);
          const mercuryTomorrow = SwissEphemerisShim.calculatePlanetPosition('Mercury', jdNext);
          
          if (mercuryToday && mercuryTomorrow) {
            const isMovingBackward = mercuryTomorrow.longitude < mercuryToday.longitude;
            setIsRetrograde(isMovingBackward || !!activePeriod);
          } else {
            setIsRetrograde(!!activePeriod);
          }
        }
      } catch (error) {
        console.error('Error checking Mercury retrograde:', error);
        // Fallback to period-based check
        const now = new Date();
        const activePeriod = retrogradePeriods.find(period => 
          now >= period.start && now <= period.end
        );
        setIsRetrograde(!!activePeriod);
        setCurrentPeriod(activePeriod || null);
      } finally {
        setLoading(false);
      }
    };

    checkMercuryRetrograde();
  }, []);

  useEffect(() => {
    if (!isRetrograde || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    const animate = () => {
      // Clear canvas
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw star field
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      for (let i = 0; i < 50; i++) {
        const x = (i * 17) % canvas.width;
        const y = (i * 23) % canvas.height;
        const size = Math.sin(time * 0.01 + i) * 1 + 1;
        ctx.fillRect(x, y, size, size);
      }

      // Draw Sun (center)
      ctx.beginPath();
      ctx.arc(centerX, centerY, 15, 0, Math.PI * 2);
      ctx.fillStyle = '#FFD700';
      ctx.fill();
      ctx.strokeStyle = '#FFA500';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw Earth orbit
      ctx.beginPath();
      ctx.arc(centerX, centerY, 80, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(100, 149, 237, 0.3)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Draw Mercury orbit
      ctx.beginPath();
      ctx.arc(centerX, centerY, 50, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 140, 0, 0.3)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Calculate Earth position (normal orbit)
      const earthAngle = time * 0.02;
      const earthX = centerX + Math.cos(earthAngle) * 80;
      const earthY = centerY + Math.sin(earthAngle) * 80;

      // Draw Earth
      ctx.beginPath();
      ctx.arc(earthX, earthY, 8, 0, Math.PI * 2);
      ctx.fillStyle = '#6B93D6';
      ctx.fill();

      // Calculate Mercury position (retrograde motion - appears to move backward relative to Earth)
      const mercuryBaseAngle = time * 0.08; // Mercury orbits faster
      const retrogradeEffect = Math.sin(time * 0.05) * 0.3; // Retrograde loop effect
      const mercuryAngle = mercuryBaseAngle - retrogradeEffect; // Backward motion
      const mercuryX = centerX + Math.cos(mercuryAngle) * 50;
      const mercuryY = centerY + Math.sin(mercuryAngle) * 50;

      // Draw Mercury with retrograde glow
      ctx.beginPath();
      ctx.arc(mercuryX, mercuryY, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#FF6B6B';
      ctx.fill();
      
      // Add retrograde glow effect
      ctx.beginPath();
      ctx.arc(mercuryX, mercuryY, 12, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 107, 107, 0.5)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw Mercury's retrograde trail
      ctx.strokeStyle = 'rgba(255, 107, 107, 0.3)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = 0; i < 20; i++) {
        const trailAngle = mercuryAngle + (i * 0.1);
        const trailX = centerX + Math.cos(trailAngle) * 50;
        const trailY = centerY + Math.sin(trailAngle) * 50;
        if (i === 0) {
          ctx.moveTo(trailX, trailY);
        } else {
          ctx.lineTo(trailX, trailY);
        }
      }
      ctx.stroke();

      time += 1;
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRetrograde]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDaysRemaining = (endDate: Date) => {
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="w-full h-32 bg-gradient-to-r from-purple-900/50 to-blue-900/50 flex items-center justify-center rounded-lg">
        <div className="flex items-center space-x-2 text-white/70">
          <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
          <span>Checking cosmic alignments...</span>
        </div>
      </div>
    );
  }

  if (!isRetrograde) {
    return (
      <motion.div 
        className="w-full bg-gradient-to-r from-green-900/30 to-blue-900/30 rounded-lg p-4 border border-green-500/30"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">☿</div>
            <div>
              <h3 className="text-lg font-semibold text-green-300">Mercury is Direct</h3>
              <p className="text-green-200/80 text-sm">Clear communication and smooth technology</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-green-200/60 text-xs">Next Retrograde</p>
            <p className="text-green-300 font-medium text-sm">
              {retrogradePeriods.find(p => p.start > new Date()) ? 
                formatDate(retrogradePeriods.find(p => p.start > new Date())!.start) : 
                'Check ephemeris'
              }
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div 
        className="w-full bg-gradient-to-r from-red-900/40 to-purple-900/40 rounded-lg border border-red-500/30 overflow-hidden"
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 300 }}
      >
        <div className="relative p-6">
          {/* Animated background canvas */}
          <canvas
            ref={canvasRef}
            width={200}
            height={100}
            className="absolute top-0 right-0 opacity-30 pointer-events-none"
          />
          
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex-1">
              <motion.div 
                className="flex items-center space-x-3 mb-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <motion.div 
                  className="text-3xl"
                  animate={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  ☿
                </motion.div>
                <div>
                  <h2 className="text-xl font-bold text-red-300">Mercury Retrograde Active</h2>
                  <p className="text-red-200/80 text-sm">Planetary reflection and cosmic review period</p>
                </div>
              </motion.div>
              
              {currentPeriod && (
                <motion.div 
                  className="space-y-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="flex items-center space-x-4 text-sm">
                    <span className="text-red-200/60">Period:</span>
                    <span className="text-red-200">{formatDate(currentPeriod.start)} - {formatDate(currentPeriod.end)}</span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm">
                    <span className="text-red-200/60">Days remaining:</span>
                    <span className="text-red-300 font-medium">{getDaysRemaining(currentPeriod.end)} days</span>
                  </div>
                </motion.div>
              )}
            </div>
            
            <motion.div 
              className="flex flex-col space-y-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <motion.button
                onClick={onMarketplaceClick}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg"
                whileHover={{ scale: 1.05, boxShadow: "0 10px 25px rgba(139, 69, 19, 0.3)" }}
                whileTap={{ scale: 0.95 }}
              >
                🌟 Retrograde Collection
              </motion.button>
              <p className="text-xs text-center text-red-200/60">
                Vintage cosmic fashion drop
              </p>
            </motion.div>
          </div>
          
          {/* Cosmic particles effect */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-red-400 rounded-full"
                style={{
                  left: `${20 + i * 15}%`,
                  top: `${30 + (i % 2) * 40}%`,
                }}
                animate={{
                  opacity: [0.3, 1, 0.3],
                  scale: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 2 + i * 0.5,
                  repeat: Infinity,
                  delay: i * 0.3,
                }}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};