'use client';
 
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { EnhancedTarotCard } from './EnhancedTarotCard';
import { TarotCard } from '@/types/tarot';
export type SpreadType = 'single' | 'three-card' | 'celtic-cross' | 'horseshoe' | 'relationship' | 'custom';
interface SpreadPosition {
  x: number;
  y: number;
  rotate: number;
  label: string;
  description?: string;
  size?: 'small' | 'medium' | 'large';
}
interface EnhancedTarotSpreadLayoutsProps {
  spreadType: SpreadType;
  cards: TarotCard[];
  onCardClick?: (_card: TarotCard, _index: number) => void;
  isRevealing?: boolean;
  showBioluminescence?: boolean;
  customPositions?: SpreadPosition[];
  isMobile?: boolean;
}
export const EnhancedTarotSpreadLayouts: React.FC<EnhancedTarotSpreadLayoutsProps> = ({
  spreadType,
  cards,
  onCardClick: _onCardClick,
  isRevealing = false,
  showBioluminescence = true,
  customPositions: _customPositions = [],
  isMobile = false
}) => {
  const [revealedCards, setRevealedCards] = useState<Set<number>>(new Set());
  const [_connectionLines, _setConnectionLines] = useState<Array<{ from: number; to: number; strength: number }>>([]);
  const [_energyFlow, _setEnergyFlow] = useState(0);
  // Energy flow animation
 
  useEffect(() => {
    if (isRevealing) {
      const interval = setInterval(() => {
        _setEnergyFlow(prev => (prev + 0.1) % 1);
      }, 100);
      return () => clearInterval(interval);
    }
  }, [isRevealing]);
  // Generate connection lines between cards for energy flow
 
  useEffect(() => {
    if (spreadType === 'three-card' && cards.length === 3) {
      _setConnectionLines([
        { from: 0, to: 1, strength: 0.8 },
        { from: 1, to: 2, strength: 0.9 }
      ]);
    } else if (spreadType === 'celtic-cross' && cards.length >= 6) {
      _setConnectionLines([
        { from: 0, to: 1, strength: 1.0 },
        { from: 0, to: 2, strength: 0.6 },
        { from: 0, to: 3, strength: 0.6 },
        { from: 0, to: 4, strength: 0.7 },
        { from: 0, to: 5, strength: 0.7 }
      ]);
    }
  }, [spreadType, cards.length]);
  const getSpreadPositions = (spreadType: SpreadType): SpreadPosition[] => {
    const mobileScale = isMobile ? 0.7 : 1;
    const positions: Record<SpreadType, SpreadPosition[]> = {
      'single': [
        { x: 0, y: 0, rotate: 0, label: 'Your Guidance', description: 'The universe\'s message for you', size: 'large' }
      ],
      'three-card': [
        { x: -140 * mobileScale, y: 0, rotate: -8, label: 'Past', description: 'What has led to this moment', size: 'medium' },
        { x: 0, y: -20 * mobileScale, rotate: 0, label: 'Present', description: 'Your current situation', size: 'large' },
        { x: 140 * mobileScale, y: 0, rotate: 8, label: 'Future', description: 'What lies ahead', size: 'medium' }
      ],
      'celtic-cross': [
        { x: 0, y: 0, rotate: 0, label: 'Present', description: 'Current situation', size: 'medium' },
        { x: 0, y: 0, rotate: 90, label: 'Challenge', description: 'What crosses you', size: 'small' },
        { x: 0, y: -180 * mobileScale, rotate: 0, label: 'Distant Past', description: 'Foundation', size: 'small' },
        { x: 0, y: 180 * mobileScale, rotate: 0, label: 'Recent Past', description: 'Recent influences', size: 'small' },
        { x: -180 * mobileScale, y: 0, rotate: 0, label: 'Possible Outcome', description: 'Potential future', size: 'small' },
        { x: 180 * mobileScale, y: 0, rotate: 0, label: 'Near Future', description: 'Immediate path', size: 'small' },
        { x: 300 * mobileScale, y: 180 * mobileScale, rotate: 0, label: 'Your Approach', description: 'How you see yourself', size: 'small' },
        { x: 300 * mobileScale, y: 60 * mobileScale, rotate: 0, label: 'External', description: 'Outside influences', size: 'small' },
        { x: 300 * mobileScale, y: -60 * mobileScale, rotate: 0, label: 'Hopes & Fears', description: 'Inner desires and worries', size: 'small' },
        { x: 300 * mobileScale, y: -180 * mobileScale, rotate: 0, label: 'Final Outcome', description: 'Ultimate result', size: 'medium' }
      ],
      'horseshoe': [
        { x: -200 * mobileScale, y: 100 * mobileScale, rotate: -30, label: 'Past', description: 'Your foundation', size: 'small' },
        { x: -100 * mobileScale, y: -50 * mobileScale, rotate: -15, label: 'Present', description: 'Current situation', size: 'medium' },
        { x: 0, y: -100 * mobileScale, rotate: 0, label: 'Hidden Factors', description: 'What you don\'t see', size: 'medium' },
        { x: 100 * mobileScale, y: -50 * mobileScale, rotate: 15, label: 'Advice', description: 'Guidance offered', size: 'medium' },
        { x: 200 * mobileScale, y: 100 * mobileScale, rotate: 30, label: 'Likely Outcome', description: 'Probable future', size: 'small' }
      ],
      'relationship': [
        { x: -120 * mobileScale, y: -80 * mobileScale, rotate: -10, label: 'You', description: 'Your energy', size: 'medium' },
        { x: 120 * mobileScale, y: -80 * mobileScale, rotate: 10, label: 'Them', description: 'Their energy', size: 'medium' },
        { x: 0, y: 0, rotate: 0, label: 'Connection', description: 'The bond between you', size: 'large' },
        { x: -80 * mobileScale, y: 120 * mobileScale, rotate: -5, label: 'Challenges', description: 'What to work on', size: 'small' },
        { x: 80 * mobileScale, y: 120 * mobileScale, rotate: 5, label: 'Potential', description: 'Where this leads', size: 'small' }
      ],
      'custom': customPositions
    };
    return positions[spreadType] || positions['single'];
  };
  const positions = getSpreadPositions(spreadType);
  const handleCardReveal = (card: TarotCard, index: number) => {
    setRevealedCards(prev => new Set([...prev, index]));
        onCardClick?.(card, index);
  };
  // Generate bioluminescent connection lines
  const renderConnectionLines = () => {
    if (!showBioluminescence || !isRevealing) return null;
    return _connectionLines.map((connection, index) => {
      const fromPos = positions[connection.from];
      const toPos = positions[connection.to];
      
      if (!fromPos || !toPos) return null;
      const lineLength = Math.sqrt(
        Math.pow(toPos.x - fromPos.x, 2) + Math.pow(toPos.y - fromPos.y, 2)
      );
      const angle = Math.atan2(toPos.y - fromPos.y, toPos.x - fromPos.x) * (180 / Math.PI);
      return (
        <motion.div
          key={`connection-${index}`}
          className="absolute pointer-events-none"
          style={{
            left: '50%',
            top: '50%',
            width: lineLength,
            height: '2px',
            background: `linear-gradient(90deg, 
              rgba(0, 255, 255, ${connection.strength * 0.3}) 0%, 
              rgba(127, 255, 212, ${connection.strength * 0.6}) 50%, 
              rgba(0, 255, 255, ${connection.strength * 0.3}) 100%)`,
            transformOrigin: '0 50%',
            transform: `translate(${fromPos.x}px, ${fromPos.y}px) rotate(${angle}deg)`,
            filter: 'blur(1px)',
            boxShadow: `0 0 10px rgba(0, 255, 255, ${connection.strength * 0.5})`
          }}
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ 
            scaleX: 1, 
            opacity: connection.strength,
            boxShadow: [
              `0 0 10px rgba(0, 255, 255, ${connection.strength * 0.5})`,
              `0 0 20px rgba(127, 255, 212, ${connection.strength * 0.8})`,
              `0 0 10px rgba(0, 255, 255, ${connection.strength * 0.5})`
            ]
          }}
          transition={{ 
            duration: 1.5, 
            delay: index * 0.3,
            boxShadow: {
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut'
            }
          }}
        />
      );
    });
  };
  // Render energy field background
  const renderEnergyField = () => {
    if (!showBioluminescence || !isRevealing) return null;
    return (
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at ${50 + Math.sin(_energyFlow * Math.PI * 2) * 20}% ${50 + Math.cos(_energyFlow * Math.PI * 2) * 20}%, 
            rgba(0, 255, 255, 0.1) 0%, 
            rgba(127, 255, 212, 0.05) 30%, 
            transparent 70%)`,
          filter: 'blur(20px)'
        }}
        animate={{
          opacity: [0.3, 0.6, 0.3],
          scale: [1, 1.05, 1]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />
    );
  };
  const cardVariants = {
    hidden: { 
      rotateY: 180,
      scale: 0.5,
      opacity: 0,
      y: 50
    },
    visible: (custom: number) => ({
      rotateY: 0,
      scale: 1,
      opacity: 1,
      y: 0,
      transition: {
        delay: custom * 0.4,
        duration: 0.8,
        type: "spring" as const,
        stiffness: 100,
        damping: 15
      }
    })
  };
  return (
    <div className="relative w-full min-h-screen flex items-center justify-center overflow-hidden">
      {/* Energy field background */}
      {renderEnergyField()}
      {/* Connection lines */}
      {renderConnectionLines()}
      {/* Main spread container */}
      <motion.div 
        className="relative"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        style={{
          width: isMobile ? '100vw' : 'auto',
          height: isMobile ? '100vh' : 'auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {cards.map((card, index) => {
          const position = positions[index];
          if (!position) return null;
          
          return (
            <motion.div
              key={card.id}
              className="absolute"
              style={{
                transform: `translate(${position.x}px, ${position.y}px) rotate(${position.rotate}deg)`,
                zIndex: index === cards.length - 1 ? 10 : 5 - Math.abs(position.rotate) / 10
              }}
              custom={index}
              initial="hidden"
              animate={isRevealing ? "visible" : "hidden"}
              variants={cardVariants}
            >
              {/* Position label with bioluminescent glow */}
              <motion.div
                className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-center pointer-events-none"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: isRevealing ? 1 : 0, y: 0 }}
                transition={{ delay: index * 0.4 + 0.5, duration: 0.5 }}
              >
                <div 
                  className="text-sm font-medium text-cyan-300 mb-1"
                  style={{
                    textShadow: showBioluminescence ? '0 0 10px rgba(0, 255, 255, 0.8)' : 'none',
                    filter: showBioluminescence ? 'drop-shadow(0 0 5px rgba(0, 255, 255, 0.5))' : 'none'
                  }}
                >
                  {position.label}
                </div>
                {position.description && (
                  <div className="text-xs text-purple-300 opacity-80 max-w-24 leading-tight">
                    {position.description}
                  </div>
                )}
              </motion.div>
              
              <EnhancedTarotCard
                card={card}
                isFlipped={isRevealing && revealedCards.has(index)}
                onFlip={() => handleCardReveal(card, index)}
                size={position.size || 'medium'}
                showBioluminescence={showBioluminescence}
                delay={index * 0.2}
              />
              {/* Card number indicator */}
              <motion.div
                className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-purple-600/80 text-white text-xs px-2 py-1 rounded-full font-bold backdrop-blur-sm"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: isRevealing ? 0.8 : 0, scale: 1 }}
                transition={{ delay: index * 0.4 + 0.8, duration: 0.3 }}
              >
                {index + 1}
              </motion.div>
            </motion.div>
          );
        })}
      </motion.div>
      {/* Mobile-optimized position guide */}
      {isMobile && spreadType === 'celtic-cross' && (
        <motion.div 
          className="absolute bottom-4 left-4 right-4 bg-black/80 backdrop-blur-md rounded-lg p-4 text-xs"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: isRevealing ? 1 : 0, y: 0 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          <h4 className="text-cyan-300 font-semibold mb-2 text-center">Position Guide</h4>
          <div className="grid grid-cols-2 gap-2">
            {positions.slice(0, cards.length).map((position, index) => (
              <div key={index} className="flex items-center space-x-2">
                <span className="bg-purple-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold">
                  {index + 1}
                </span>
                <span className="text-purple-300">{position.label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
      {/* Spread info overlay */}
      <motion.div
        className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm rounded-lg p-3 text-sm"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 0.9, x: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <div className="text-cyan-300 font-semibold capitalize">{spreadType.replace('-', ' ')} Spread</div>
        <div className="text-purple-300 text-xs">{cards.length} Cards</div>
      </motion.div>
    </div>
  );
};
