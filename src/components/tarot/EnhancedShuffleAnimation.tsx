'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Sparkles } from 'lucide-react';

interface EnhancedShuffleAnimationProps {
  onShuffleComplete?: () => void;
  onShuffleStart?: () => void;
  isShuffling: boolean;
  onTriggerShuffle?: () => void;
  className?: string;
  size?: 'small' | 'medium' | 'large';
  cardCount?: number;
  showCardPreview?: boolean;
}

interface CardParticle {
  id: number;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  delay: number;
  duration: number;
  color: string;
}

interface BioluminescentParticle {
  id: number;
  x: number;
  y: number;
  delay: number;
  duration: number;
  size: number;
  color: string;
}

export const EnhancedShuffleAnimation: React.FC<EnhancedShuffleAnimationProps> = ({
  onShuffleComplete,
  onShuffleStart,
  isShuffling,
  onTriggerShuffle,
  className = '',
  size = 'medium',
  cardCount = 78,
  showCardPreview = true
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [cardParticles, setCardParticles] = useState<CardParticle[]>([]);
  const [bioluminescentParticles, setBioluminescentParticles] = useState<BioluminescentParticle[]>([]);
  const [shufflePhase, setShufflePhase] = useState<'idle' | 'gathering' | 'shuffling' | 'spreading' | 'complete'>('idle');
  const [rippleEffect, setRippleEffect] = useState(false);

  // Size configurations
  const sizeConfig = {
    small: {
      deck: 'w-16 h-20',
      radius: 60,
      icon: 'w-6 h-6',
      cardSize: { width: 12, height: 18 }
    },
    medium: {
      deck: 'w-24 h-32',
      radius: 100,
      icon: 'w-8 h-8',
      cardSize: { width: 16, height: 24 }
    },
    large: {
      deck: 'w-32 h-40',
      radius: 140,
      icon: 'w-12 h-12',
      cardSize: { width: 20, height: 30 }
    }
  };

  const config = sizeConfig[size];

  // Bioluminescent colors for particles
  const bioluminescentColors = [
    'rgba(0, 255, 255, 0.8)',      // Cyan
    'rgba(127, 255, 212, 0.8)',    // Aquamarine
    'rgba(173, 216, 230, 0.8)',    // Light blue
    'rgba(144, 238, 144, 0.8)',    // Light green
    'rgba(221, 160, 221, 0.8)',    // Plum
    'rgba(255, 182, 193, 0.8)'     // Light pink
  ];

  const cardColors = [
    'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
    'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
    'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
    'linear-gradient(135deg, #059669 0%, #10b981 100%)'
  ];

  // Generate enhanced card particles with more realistic movement
  const generateCardParticles = useCallback(() => {
    const particles: CardParticle[] = [];
    const particleCount = Math.min(cardCount, 15); // Limit for performance
    
    for (let i = 0; i < particleCount; i++) {
      const angle = (i * 360) / particleCount;
      const distance = config.radius + Math.random() * 60;
      const colorIndex = Math.floor(Math.random() * cardColors.length);
      
      particles.push({
        id: i,
        x: Math.cos((angle * Math.PI) / 180) * distance,
        y: Math.sin((angle * Math.PI) / 180) * distance,
        rotation: Math.random() * 360,
        scale: 0.8 + Math.random() * 0.4,
        delay: Math.random() * 0.3,
        duration: 2 + Math.random() * 1,
        color: cardColors[colorIndex]
      });
    }
    setCardParticles(particles);
  }, [cardCount, config.radius]);

  // Generate bioluminescent particles
  const generateBioluminescentParticles = useCallback(() => {
    const particles: BioluminescentParticle[] = [];
    
    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * 360;
      const distance = 50 + Math.random() * 150;
      const colorIndex = Math.floor(Math.random() * bioluminescentColors.length);
      
      particles.push({
        id: i,
        x: Math.cos((angle * Math.PI) / 180) * distance,
        y: Math.sin((angle * Math.PI) / 180) * distance,
        delay: Math.random() * 0.5,
        duration: 1.5 + Math.random() * 2,
        size: 3 + Math.random() * 5,
        color: bioluminescentColors[colorIndex]
      });
    }
    setBioluminescentParticles(particles);
  }, []);

  // Enhanced shuffle with phases
  const handleShuffle = useCallback(async () => {
    if (isShuffling) return;
    
    onShuffleStart?.();
    onTriggerShuffle?.();
    
    // Phase 1: Gathering (0-0.5s)
    setShufflePhase('gathering');
    setRippleEffect(true);
    
    setTimeout(() => {
      // Phase 2: Main shuffle (0.5-2.5s)
      setShufflePhase('shuffling');
      generateCardParticles();
      generateBioluminescentParticles();
      
      setTimeout(() => {
        // Phase 3: Spreading (2.5-3s)
        setShufflePhase('spreading');
        
        setTimeout(() => {
          // Phase 4: Complete (3s+)
          setShufflePhase('complete');
          setRippleEffect(false);
          onShuffleComplete?.();
          
          setTimeout(() => {
            setShufflePhase('idle');
          }, 500);
        }, 500);
      }, 2000);
    }, 500);
  }, [isShuffling, onShuffleStart, onTriggerShuffle, onShuffleComplete, generateCardParticles, generateBioluminescentParticles]);

  // Clear particles when shuffling ends
  useEffect(() => {
    if (shufflePhase === 'idle') {
      const timer = setTimeout(() => {
        setCardParticles([]);
        setBioluminescentParticles([]);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [shufflePhase]);

  // Haptic feedback for mobile
  const triggerHaptic = useCallback(() => {
    if ('vibrate' in navigator) {
      navigator.vibrate([30, 10, 30]);
    }
  }, []);

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Ripple effect */}
      <AnimatePresence>
        {rippleEffect && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              borderRadius: '50%',
              border: '2px solid rgba(0, 255, 255, 0.6)',
              transform: 'translate(-50%, -50%)',
              left: '50%',
              top: '50%'
            }}
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 4, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        )}
      </AnimatePresence>

      {/* Main deck container with enhanced styling */}
      <motion.div
        className={`relative ${config.deck} cursor-pointer rounded-xl`}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        onClick={() => {
          triggerHaptic();
          handleShuffle();
        }}
        whileTap={{ scale: 0.95 }}
        style={{
          background: shufflePhase === 'shuffling'
            ? 'linear-gradient(135deg, #1e1b4b 0%, #7c3aed 25%, #fbbf24 50%, #059669 75%, #1e1b4b 100%)'
            : 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e1b4b 100%)',
          border: '3px solid rgba(139, 92, 246, 0.4)',
          boxShadow: isHovered || isShuffling 
            ? '0 0 40px rgba(139, 92, 246, 0.8), inset 0 0 30px rgba(251, 191, 36, 0.3)'
            : '0 0 20px rgba(139, 92, 246, 0.4)',
          backdropFilter: 'blur(10px)'
        }}
        animate={{
          boxShadow: shufflePhase === 'shuffling'
            ? [
                '0 0 20px rgba(139, 92, 246, 0.4)',
                '0 0 60px rgba(0, 255, 255, 0.8), inset 0 0 40px rgba(251, 191, 36, 0.4)',
                '0 0 80px rgba(144, 238, 144, 0.6), inset 0 0 50px rgba(221, 160, 221, 0.3)',
                '0 0 60px rgba(0, 255, 255, 0.8), inset 0 0 40px rgba(251, 191, 36, 0.4)',
                '0 0 20px rgba(139, 92, 246, 0.4)'
              ]
            : isHovered
            ? '0 0 40px rgba(139, 92, 246, 0.8), inset 0 0 30px rgba(251, 191, 36, 0.3)'
            : '0 0 20px rgba(139, 92, 246, 0.4)',
          scale: shufflePhase === 'gathering' ? 1.1 : 1
        }}
        transition={{
          duration: shufflePhase === 'shuffling' ? 2 : 0.3,
          repeat: shufflePhase === 'shuffling' ? Infinity : 0
        }}
      >
        {/* Enhanced mystical pattern overlay */}
        <div
          className="absolute inset-0 rounded-xl opacity-40"
          style={{
            background: `
              radial-gradient(circle at 30% 30%, rgba(0, 255, 255, 0.3) 0%, transparent 40%),
              radial-gradient(circle at 70% 70%, rgba(144, 238, 144, 0.3) 0%, transparent 40%),
              radial-gradient(circle at 50% 20%, rgba(221, 160, 221, 0.2) 0%, transparent 60%),
              linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.1) 50%, transparent 70%)
            `
          }}
        />

        {/* Central icon with phase-based animation */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{
              rotate: shufflePhase === 'shuffling' 
                ? [0, 360, 720, 1080] 
                : shufflePhase === 'gathering'
                ? [0, 180]
                : isHovered ? [0, 10, -10, 0] : 0,
              scale: shufflePhase === 'gathering' ? 1.3 : isHovered ? 1.2 : 1
            }}
            transition={{
              duration: shufflePhase === 'shuffling' 
                ? 2 
                : shufflePhase === 'gathering'
                ? 0.5
                : isHovered ? 0.6 : 0.3,
              ease: shufflePhase === 'shuffling' ? 'linear' : 'easeOut'
            }}
          >
            {shufflePhase === 'complete' ? (
              <Sparkles 
                className={`${config.icon} text-cyan-300`}
                style={{
                  filter: 'drop-shadow(0 0 12px rgba(0, 255, 255, 0.8))'
                }}
              />
            ) : (
              <RefreshCw 
                className={`${config.icon} text-yellow-300`}
                style={{
                  filter: 'drop-shadow(0 0 10px rgba(251, 191, 36, 0.8))'
                }}
              />
            )}
          </motion.div>
        </div>

        {/* Card count indicator */}
        {showCardPreview && !isShuffling && (
          <motion.div
            className="absolute -top-2 -right-2 bg-purple-600 text-white text-xs px-2 py-1 rounded-full font-bold"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: isHovered ? 1 : 0.7, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            {cardCount}
          </motion.div>
        )}

        {/* Enhanced animated cards during shuffle */}
        <AnimatePresence>
          {shufflePhase === 'shuffling' && cardParticles.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute rounded-sm border border-yellow-300/50"
              style={{
                width: config.cardSize.width,
                height: config.cardSize.height,
                top: '50%',
                left: '50%',
                marginTop: `-${config.cardSize.height / 2}px`,
                marginLeft: `-${config.cardSize.width / 2}px`,
                background: particle.color,
                boxShadow: '0 0 10px rgba(251, 191, 36, 0.6)',
                backdropFilter: 'blur(1px)'
              }}
              initial={{ 
                x: 0, 
                y: 0, 
                rotate: 0, 
                scale: 0.5,
                opacity: 0
              }}
              animate={{
                x: [0, particle.x * 0.3, particle.x, particle.x * 0.7, 0],
                y: [0, particle.y * 0.3, particle.y, particle.y * 0.7, 0],
                rotate: [0, particle.rotation * 0.5, particle.rotation, particle.rotation * 1.5, 0],
                scale: [0.5, particle.scale, particle.scale * 1.2, particle.scale, 0.5],
                opacity: [0, 0.8, 1, 0.6, 0]
              }}
              transition={{
                duration: particle.duration,
                delay: particle.delay,
                ease: 'easeInOut'
              }}
            />
          ))}
        </AnimatePresence>

        {/* Bioluminescent particles */}
        <AnimatePresence>
          {shufflePhase === 'shuffling' && bioluminescentParticles.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute pointer-events-none rounded-full"
              style={{
                top: '50%',
                left: '50%',
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                marginTop: `-${particle.size / 2}px`,
                marginLeft: `-${particle.size / 2}px`,
                background: `radial-gradient(circle, ${particle.color} 0%, transparent 70%)`,
                filter: 'blur(1px)'
              }}
              initial={{
                opacity: 0,
                scale: 0,
                x: 0,
                y: 0
              }}
              animate={{
                opacity: [0, 1, 0.8, 0],
                scale: [0, 1.5, 1.2, 0],
                x: [0, particle.x * 0.5, particle.x, particle.x * 1.2],
                y: [0, particle.y * 0.5, particle.y, particle.y * 1.2]
              }}
              exit={{
                opacity: 0,
                scale: 0
              }}
              transition={{
                duration: particle.duration,
                delay: particle.delay,
                ease: 'easeOut'
              }}
            />
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Enhanced status indicators */}
      {shufflePhase === 'idle' && (
        <motion.div
          className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 text-xs text-purple-300 whitespace-nowrap text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0.7 }}
          transition={{ duration: 0.2 }}
        >
          {isHovered ? 'Click to shuffle the cosmic deck!' : `${cardCount} cards ready ✨`}
        </motion.div>
      )}

      {shufflePhase !== 'idle' && (
        <motion.div
          className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 text-xs text-cyan-300 whitespace-nowrap font-medium text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {shufflePhase === 'gathering' && 'Gathering cosmic energy... 🌟'}
          {shufflePhase === 'shuffling' && 'Shuffling through dimensions... ✨'}
          {shufflePhase === 'spreading' && 'Cards finding their destiny... 🔮'}
          {shufflePhase === 'complete' && 'The universe has spoken! 💫'}
        </motion.div>
      )}
    </div>
  );
};