'use client';
 
import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
interface MysticalShuffleAnimationProps {
  onShuffleComplete?: () => void;
  onShuffleStart?: () => void;
  isShuffling: boolean;
  onTriggerShuffle?: () => void;
  className?: string;
  size?: 'small' | 'medium' | 'large';
}
interface StarParticle {
  id: number;
  x: number;
  y: number;
  delay: number;
  duration: number;
  size: number;
}
export const MysticalShuffleAnimation: React.FC<MysticalShuffleAnimationProps> = ({
  onShuffleComplete,
  onShuffleStart,
  isShuffling,
  onTriggerShuffle,
  className = '',
  size = 'medium',
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [starParticles, setStarParticles] = useState<StarParticle[]>([]);
  const [showFlash, setShowFlash] = useState(false);
  // Size configurations
  const sizeConfig = {
    small: {
      deck: 'w-16 h-20',
      radius: 60,
      icon: 'w-8 h-8',
    },
    medium: {
      deck: 'w-20 h-24',
      radius: 80,
      icon: 'w-10 h-10',
    },
    large: {
      deck: 'w-24 h-28',
      radius: 100,
      icon: 'w-12 h-12',
    },
  };
  const config = sizeConfig[size];
  // Generate star particles
 
  const generateStars = useCallback(() => {
    const stars: StarParticle[] = [];
    for (let i = 0; i < 15; i++) {
      const angle = (i * 360) / 15;
      const distance = 80 + Math.random() * 40;
      stars.push({
        id: i,
        x: Math.cos((angle * Math.PI) / 180) * distance,
        y: Math.sin((angle * Math.PI) / 180) * distance,
        delay: Math.random() * 0.5,
        duration: 1.5 + Math.random() * 1,
        size: 4 + Math.random() * 4,
      });
    }
    setStarParticles(stars);
  }, []);
  // Play shuffle sound
 
  const playShuffleSound = useCallback(() => {
    try {
      const audio = new Audio('/sounds/card-shuffle.mp3');
      audio.volume = 0.3;
      audio.play().catch(() => {
        // Fallback sound generation
        const audioContext = new AudioContext();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.3);
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.3);
      });
    } catch {
      console.log('Sound playback not available');
    }
  }, []);
  // Handle shuffle trigger
 
  const handleShuffle = useCallback(() => {
    if (isShuffling) return;
    
    generateStars();
    playShuffleSound();
    onShuffleStart?.();
    onTriggerShuffle?.();
    // Show flash effect at the end
    setTimeout(() => {
      setShowFlash(true);
      setTimeout(() => setShowFlash(false), 300);
      onShuffleComplete?.();
    }, 2500);
  }, [isShuffling, onShuffleStart, onTriggerShuffle, onShuffleComplete, generateStars, playShuffleSound]);
  // Clear particles when shuffling ends
 
  useEffect(() => {
    if (!isShuffling) {
      const timer = setTimeout(() => setStarParticles([]), 500);
      return () => clearTimeout(timer);
    }
  }, [isShuffling]);
  return (
    <div className={`relative inline-block ${className}`}>
      {/* Main deck container */}
      <motion.div
        className={`relative ${config.deck} cursor-pointer rounded-lg`}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        onClick={handleShuffle}
        whileTap={{ scale: 0.95 }}
        style={{
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e1b4b 100%)',
          border: '2px solid rgba(139, 92, 246, 0.3)',
          boxShadow: isHovered || isShuffling 
            ? '0 0 30px rgba(139, 92, 246, 0.6), inset 0 0 20px rgba(251, 191, 36, 0.2)'
            : '0 0 15px rgba(139, 92, 246, 0.3)',
        }}
        animate={{
          boxShadow: isShuffling
            ? [
                '0 0 15px rgba(139, 92, 246, 0.3)',
                '0 0 40px rgba(251, 191, 36, 0.8), inset 0 0 30px rgba(139, 92, 246, 0.4)',
                '0 0 60px rgba(255, 107, 107, 0.6), inset 0 0 40px rgba(76, 205, 196, 0.3)',
                '0 0 40px rgba(251, 191, 36, 0.8), inset 0 0 30px rgba(139, 92, 246, 0.4)',
                '0 0 15px rgba(139, 92, 246, 0.3)',
              ]
            : isHovered
            ? '0 0 30px rgba(139, 92, 246, 0.6), inset 0 0 20px rgba(251, 191, 36, 0.2)'
            : '0 0 15px rgba(139, 92, 246, 0.3)',
        }}
        transition={{
          duration: isShuffling ? 2.5 : 0.3,
          repeat: isShuffling ? Infinity : 0,
        }}
      >
        {/* Mystical pattern overlay */}
        <div
          className="absolute inset-0 rounded-lg opacity-30"
          style={{
            background: `
              radial-gradient(circle at 25% 25%, rgba(251, 191, 36, 0.2) 0%, transparent 50%),
              radial-gradient(circle at 75% 75%, rgba(139, 92, 246, 0.2) 0%, transparent 50%),
              linear-gradient(45deg, transparent 40%, rgba(255, 255, 255, 0.1) 50%, transparent 60%)
            `,
          }}
        />
        {/* Shuffle icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{
              rotate: isShuffling ? [0, 360, 720, 1080] : isHovered ? [0, 5, -5, 0] : 0,
              scale: isHovered ? 1.1 : 1,
            }}
            transition={{
              duration: isShuffling ? 2.5 : isHovered ? 0.5 : 0.3,
              ease: isShuffling ? 'easeInOut' : 'easeOut',
            }}
          >
            <RefreshCw 
              className={`${config.icon} text-yellow-300 drop-shadow-lg`}
              style={{
                filter: 'drop-shadow(0 0 8px rgba(251, 191, 36, 0.8))',
              }}
            />
          </motion.div>
        </div>
        {/* Animated cards during shuffle */}
        <AnimatePresence>
          {isShuffling && (
            <>
              {Array.from({ length: 8 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-4 h-6 bg-gradient-to-br from-purple-600 to-blue-700 rounded-sm border border-yellow-300"
                  style={{
                    top: '50%',
                    left: '50%',
                    marginTop: '-12px',
                    marginLeft: '-8px',
                    boxShadow: '0 0 8px rgba(251, 191, 36, 0.6)',
                  }}
                  initial={{ 
                    x: 0, 
                    y: 0, 
                    rotate: 0, 
                    scale: 0.8,
                    opacity: 0,
                  }}
                  animate={{
                    x: Math.cos((i * 360 / 8) * Math.PI / 180) * config.radius,
                    y: Math.sin((i * 360 / 8) * Math.PI / 180) * config.radius,
                    rotate: [0, 180, 360, 540],
                    scale: [0.8, 1.2, 1, 0.8],
                    opacity: [0, 1, 1, 0],
                  }}
                  transition={{
                    duration: 2.5,
                    delay: i * 0.1,
                    ease: 'easeInOut',
                  }}
                />
              ))}
            </>
          )}
        </AnimatePresence>
        {/* Star particles */}
        <AnimatePresence>
          {starParticles.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute pointer-events-none"
              style={{
                top: '50%',
                left: '50%',
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                marginTop: `-${particle.size / 2}px`,
                marginLeft: `-${particle.size / 2}px`,
              }}
              initial={{
                opacity: 0,
                scale: 0,
                x: 0,
                y: 0,
              }}
              animate={{
                opacity: [0, 1, 1, 0],
                scale: [0, 1.5, 1, 0],
                x: particle.x,
                y: particle.y,
              }}
              exit={{
                opacity: 0,
                scale: 0,
              }}
              transition={{
                duration: particle.duration,
                delay: particle.delay,
                ease: 'easeOut',
              }}
            >
              {/* Star shape */}
              <div
                className="absolute inset-0"
                style={{
                  background: 'radial-gradient(circle, rgba(251, 191, 36, 1) 0%, rgba(251, 191, 36, 0.8) 30%, transparent 70%)',
                  borderRadius: '50%',
                  filter: 'blur(1px)',
                }}
              />
              <div
                className="absolute inset-0"
                style={{
                  background: 'radial-gradient(circle, rgba(255, 255, 255, 0.8) 0%, transparent 60%)',
                  borderRadius: '50%',
                  transform: 'scale(0.6)',
                }}
              />
            </motion.div>
          ))}
        </AnimatePresence>
        {/* Flash effect */}
        <AnimatePresence>
          {showFlash && (
            <motion.div
              className="absolute inset-0 rounded-lg bg-white"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.8, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            />
          )}
        </AnimatePresence>
      </motion.div>
      {/* Hover instruction */}
      {!isShuffling && (
        <motion.div
          className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-purple-300 whitespace-nowrap"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0.6 }}
          transition={{ duration: 0.2 }}
        >
          {isHovered ? 'Click to shuffle!' : 'Hover to see magic ✨'}
        </motion.div>
      )}
      {/* Shuffling indicator */}
      {isShuffling && (
        <motion.div
          className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-yellow-300 whitespace-nowrap font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          Shuffling the cosmic deck... ✨
        </motion.div>
      )}
    </div>
  );
};
