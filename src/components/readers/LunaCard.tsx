'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Moon, Stars, Feather } from 'lucide-react';
// TODO: Implement ReaderPersona integration
// import { ReaderPersona } from '@/types/ReaderPersona';
import { LUNA_PERSONA } from '@/agents/readers/luna';

interface LunaCardProps {
  onSelect?: () => void;
  isSelected?: boolean;
  showDetails?: boolean;
  className?: string;
}

export const LunaCard: React.FC<LunaCardProps> = ({
  onSelect,
  isSelected = false,
  showDetails = false,
  className = ''
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const persona = LUNA_PERSONA;

  const specialtyIcons = [
    { icon: Heart, label: 'Love & Compatibility', color: 'text-pink-400' },
    { icon: Moon, label: 'Emotional Wellness', color: 'text-purple-400' },
    { icon: Stars, label: 'Relationship Patterns', color: 'text-indigo-400' },
    { icon: Feather, label: 'Shadow Work', color: 'text-violet-400' }
  ];

  const floatingElements = [
    { delay: 0, x: 20, y: 15 },
    { delay: 0.5, x: -15, y: 25 },
    { delay: 1, x: 10, y: -20 },
  ];

  return (
    <motion.div
      className={`relative p-6 rounded-xl border-2 transition-all duration-300 cursor-pointer overflow-hidden
                  ${isSelected 
                    ? 'border-pink-400 bg-gradient-to-br from-pink-900/30 to-purple-900/30 shadow-lg shadow-pink-500/20' 
                    : 'border-slate-600 bg-gradient-to-br from-slate-800/50 to-slate-900/50 hover:border-pink-500/50'}
                  backdrop-blur-md ${className}`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onSelect}
    >
      {/* Ethereal Background Pattern */}
      <div className="absolute inset-0 overflow-hidden rounded-xl">
        <div className="absolute top-6 right-6 w-28 h-28 bg-gradient-radial from-pink-500/15 to-transparent rounded-full" />
        <div className="absolute bottom-8 left-8 w-20 h-20 bg-gradient-radial from-purple-500/15 to-transparent rounded-full" />
        <div className="absolute top-1/2 left-1/2 w-36 h-36 bg-gradient-radial from-violet-500/10 to-transparent rounded-full transform -translate-x-1/2 -translate-y-1/2" />
      </div>

      {/* Floating Sparkles */}
      {floatingElements.map((element, index) => (
        <motion.div
          key={index}
          className="absolute w-2 h-2"
          style={{
            top: `${20 + element.y}%`,
            right: `${15 + element.x}%`
          }}
          animate={isHovered ? {
            y: [-5, 5, -5],
            opacity: [0.3, 0.8, 0.3],
            scale: [0.8, 1.2, 0.8]
          } : {}}
          transition={{
            duration: 2 + element.delay,
            repeat: Infinity,
            delay: element.delay
          }}
        >
          <div className="w-full h-full bg-pink-400 rounded-full blur-[1px]" />
        </motion.div>
      ))}

      {/* Header */}
      <div className="relative flex items-center gap-4 mb-4">
        {/* Avatar */}
        <div className="relative">
          <div className="w-16 h-16 bg-gradient-to-br from-pink-600 to-purple-700 rounded-full flex items-center justify-center">
            <Moon className="w-8 h-8 text-white" />
          </div>
          
          {isSelected && (
            <motion.div
              className="absolute -inset-2 border-2 border-pink-400 rounded-full"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
          )}
          
          {/* Rotating heart */}
          <motion.div
            className="absolute -top-2 -right-2 w-4 h-4"
            animate={isHovered ? { 
              rotate: [0, 15, -15, 0],
              scale: [1, 1.2, 1]
            } : {}}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Heart className="w-4 h-4 text-pink-400 fill-current" />
          </motion.div>
        </div>

        {/* Name and Title */}
        <div className="flex-1">
          <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
            {persona.name}
            <motion.span
              className="text-pink-400"
              animate={isHovered ? { scale: [1, 1.3, 1] } : {}}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              ✨
            </motion.span>
          </h3>
          <p className="text-pink-300 font-medium">{persona.title}</p>
        </div>

        {/* Selection Indicator */}
        {isSelected && (
          <motion.div
            className="w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <div className="w-2 h-2 bg-white rounded-full" />
          </motion.div>
        )}
      </div>

      {/* Description */}
      <p className="text-slate-300 text-sm mb-4 leading-relaxed">
        {persona.description}
      </p>

      {/* Specialties Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {specialtyIcons.map(({ icon: Icon, label, color }, index) => (
          <motion.div
            key={label}
            className="flex items-center gap-2 p-2 bg-slate-800/50 rounded-lg border border-slate-700/30"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ 
              backgroundColor: 'rgba(100, 50, 100, 0.1)',
              borderColor: 'rgba(236, 72, 153, 0.3)'
            }}
          >
            <Icon className={`w-4 h-4 ${color}`} />
            <span className="text-xs text-slate-300">{label}</span>
          </motion.div>
        ))}
      </div>

      {/* Tone Description */}
      <div className="bg-gradient-to-r from-pink-900/20 to-purple-900/20 rounded-lg p-3 mb-4 border border-pink-700/20">
        <div className="text-xs text-pink-400 mb-1">Reading Style</div>
        <p className="text-sm text-slate-200">
          {persona.tone.voice} • {persona.tone.communication}
        </p>
      </div>

      {/* Expertise Tags */}
      <div className="flex flex-wrap gap-1 mb-4">
        {persona.expertise.astrology?.specializations.slice(0, 4).map((specialty) => (
          <span
            key={specialty}
            className="px-2 py-1 text-xs bg-pink-900/30 text-pink-200 rounded-full border border-pink-700/30"
          >
            {specialty}
          </span>
        ))}
      </div>

      {/* Sample Reading Preview */}
      {showDetails && (
        <motion.div
          className="border-t border-slate-600 pt-4"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.3 }}
        >
          <div className="text-xs text-slate-400 mb-2">Luna's Wisdom</div>
          <div className="bg-gradient-to-r from-pink-900/20 to-purple-900/20 rounded-lg p-3 border border-pink-700/20">
            <p className="text-sm text-slate-200 italic">
              "{persona.conversationalStyles[0].phrases[0]}"
            </p>
          </div>
        </motion.div>
      )}

      {/* Hover Effect - Gentle Waves */}
      {isHovered && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.1 }}
            transition={{ duration: 0.5 }}
          >
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <motion.path
                d="M0,50 Q25,30 50,50 T100,50 L100,100 L0,100 Z"
                fill="rgba(236, 72, 153, 0.1)"
                initial={{ d: "M0,50 Q25,50 50,50 T100,50 L100,100 L0,100 Z" }}
                animate={{ d: "M0,50 Q25,30 50,50 T100,50 L100,100 L0,100 Z" }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut"
                }}
              />
            </svg>
          </motion.div>
        </div>
      )}

      {/* Luna Symbol Decoration */}
      <div className="absolute top-3 right-3 w-5 h-5 opacity-30">
        <motion.div 
          className="w-full h-full"
          animate={isHovered ? { rotate: [0, 360] } : {}}
          transition={{ duration: 4, ease: "linear", repeat: Infinity }}
        >
          <svg viewBox="0 0 24 24" className="w-full h-full">
            <path
              d="M12 2C8.5 2 6 4.5 6 8c0 2.5 1.5 4.5 3.5 5.5-.5 1-1.5 2.5-1.5 4.5 0 2.5 2 4 4 4s4-1.5 4-4c0-2-1-3.5-1.5-4.5C16.5 12.5 18 10.5 18 8c0-3.5-2.5-6-6-6z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              className="text-pink-400"
            />
          </svg>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default LunaCard;