"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Star, Clock, Target, Compass, Sparkles } from "lucide-react";
// TODO: Implement ReaderPersona integration
// import { ReaderPersona } from '@/types/ReaderPersona';
import { ORION_PERSONA } from "@/agents/readers/orion";

interface OrionCardProps {
  onSelect?: () => void;
  isSelected?: boolean;
  showDetails?: boolean;
  className?: string;
}

export const OrionCard: React.FC<OrionCardProps> = ({
  onSelect,
  isSelected = false,
  showDetails = false,
  className = "",
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const persona = ORION_PERSONA;

  const specialtyIcons = [
    { icon: Target, label: "Career Guidance", color: "text-blue-400" },
    { icon: Clock, label: "Cosmic Timing", color: "text-purple-400" },
    { icon: Compass, label: "Life Purpose", color: "text-indigo-400" },
    { icon: Star, label: "Birth Charts", color: "text-cyan-400" },
  ];

  return (
    <motion.div
      className={`relative p-6 rounded-xl border-2 transition-all duration-300 cursor-pointer
                  ${
                    isSelected
                      ? "border-blue-400 bg-gradient-to-br from-blue-900/30 to-indigo-900/30 shadow-lg shadow-blue-500/20"
                      : "border-slate-600 bg-gradient-to-br from-slate-800/50 to-slate-900/50 hover:border-blue-500/50"
                  }
                  backdrop-blur-md ${className}`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onSelect}
    >
      {/* Cosmic Background Pattern */}
      <div className="absolute inset-0 overflow-hidden rounded-xl">
        <div className="absolute top-4 right-4 w-32 h-32 bg-gradient-radial from-blue-500/10 to-transparent rounded-full" />
        <div className="absolute bottom-6 left-6 w-24 h-24 bg-gradient-radial from-purple-500/10 to-transparent rounded-full" />
      </div>

      {/* Header */}
      <div className="relative flex items-center gap-4 mb-4">
        {/* Avatar */}
        <div className="relative">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-full flex items-center justify-center">
            <Star className="w-8 h-8 text-white" />
          </div>
          {isSelected && (
            <motion.div
              className="absolute -inset-2 border-2 border-blue-400 rounded-full"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
          )}
          {/* Floating sparkles */}
          <motion.div
            className="absolute -top-1 -right-1 w-3 h-3"
            animate={isHovered ? { rotate: 360 } : {}}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles className="w-3 h-3 text-blue-400" />
          </motion.div>
        </div>

        {/* Name and Title */}
        <div className="flex-1">
          <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
            {persona.name}
            <motion.span
              className="text-blue-400"
              animate={isHovered ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 1, repeat: Infinity }}
            >
              ✨
            </motion.span>
          </h3>
          <p className="text-blue-300 font-medium">{persona.title}</p>
        </div>

        {/* Selection Indicator */}
        {isSelected && (
          <motion.div
            className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center"
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
            className="flex items-center gap-2 p-2 bg-slate-800/50 rounded-lg"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Icon className={`w-4 h-4 ${color}`} />
            <span className="text-xs text-slate-300">{label}</span>
          </motion.div>
        ))}
      </div>

      {/* Tone Description */}
      <div className="bg-slate-800/30 rounded-lg p-3 mb-4">
        <div className="text-xs text-slate-400 mb-1">Reading Style</div>
        <p className="text-sm text-slate-200">
          {persona.tone.voice} • {persona.tone.communication}
        </p>
      </div>

      {/* Expertise Tags */}
      <div className="flex flex-wrap gap-1 mb-4">
        {persona.expertise.astrology?.specializations
          .slice(0, 4)
          .map((specialty) => (
            <span
              key={specialty}
              className="px-2 py-1 text-xs bg-blue-900/30 text-blue-200 rounded-full border border-blue-700/30"
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
          animate={{ opacity: 1, height: "auto" }}
          transition={{ duration: 0.3 }}
        >
          <div className="text-xs text-slate-400 mb-2">Sample Guidance</div>
          <div className="bg-gradient-to-r from-blue-900/20 to-indigo-900/20 rounded-lg p-3">
            <p className="text-sm text-slate-200 italic">
              "{persona.conversationalStyles[0].phrases[0]}"
            </p>
          </div>
        </motion.div>
      )}

      {/* Hover Effect - Constellation Lines */}
      {isHovered && (
        <div className="absolute inset-0 pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            <motion.path
              d="M20,20 L40,30 L60,25 L80,35"
              stroke="rgba(96, 165, 250, 0.3)"
              strokeWidth="0.5"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2 }}
            />
          </svg>
        </div>
      )}

      {/* Astrology Symbol Decoration */}
      <div className="absolute top-2 right-2 w-6 h-6 opacity-20">
        <div className="w-full h-full border-2 border-blue-400 rounded-full relative">
          <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-blue-400 rounded-full transform -translate-x-1/2 -translate-y-1/2" />
        </div>
      </div>
    </motion.div>
  );
};

export default OrionCard;
