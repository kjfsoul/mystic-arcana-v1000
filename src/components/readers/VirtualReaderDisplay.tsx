"use client";
import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { PersonaLearnerAgentClient } from "@/agents/PersonaLearner-client";
import { Sparkles, Eye, Lock, Unlock } from "lucide-react";
interface VirtualReaderDisplayProps {
  readerId?: string;
  size?: "small" | "medium" | "large";
  showLevel?: boolean;
  showProgress?: boolean;
  className?: string;
}
interface EngagementData {
  currentLevel: number;
  levelName: string;
  metrics: {
    completedReadings: number;
    conversationTurns: number;
    questionsAnswered: number;
    sessionCount: number;
  };
  nextThreshold?: {
    level: number;
    readings: number;
    turns: number;
    questions: number;
  };
  progressToNext?: number;
}
export const VirtualReaderDisplay: React.FC<VirtualReaderDisplayProps> = ({
  readerId = "sophia",
  size = "medium",
  showLevel = true,
  showProgress = false,
  className = "",
}) => {
  const { user } = useAuth();
  const [engagementData, setEngagementData] = useState<EngagementData | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [previousLevel, setPreviousLevel] = useState<number | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  const personaLearner = useMemo(() => new PersonaLearnerAgentClient(), []);
  // Size configurations
  const sizeConfig = {
    small: {
      container: "w-16 h-24",
      image: "w-full h-full",
      text: "text-xs",
      badge: "text-xs px-2 py-1",
    },
    medium: {
      container: "w-32 h-48",
      image: "w-full h-full",
      text: "text-sm",
      badge: "text-sm px-3 py-1",
    },
    large: {
      container: "w-48 h-72",
      image: "w-full h-full",
      text: "text-base",
      badge: "text-base px-4 py-2",
    },
  };
  const config = sizeConfig[size];
  // Load engagement data

  useEffect(() => {
    const loadEngagementData = async () => {
      if (user) {
        // Guest users see level 1
        setEngagementData({
          currentLevel: 1,
          levelName: "Guest User",
          metrics: {
            completedReadings: 0,
            conversationTurns: 0,
            questionsAnswered: 0,
            sessionCount: 0,
          },
        });
        setIsLoading(false);
        return;
      }
      try {
        const userId = (user as any)?.id;
        if (!userId) {
          setIsLoading(false);
          return;
        }

        const analysis = await personaLearner.getEngagementAnalysis(userId);

        // Check if level increased since last view
        const lastKnownLevel = localStorage.getItem(
          `last_known_level_${userId}`,
        );
        if (lastKnownLevel) {
          const lastLevel = parseInt(lastKnownLevel);
          if (analysis.currentLevel > lastLevel) {
            setPreviousLevel(lastLevel);
          }
        }

        // Store current level
        localStorage.setItem(
          `last_known_level_${userId}`,
          analysis.currentLevel.toString(),
        );

        setEngagementData(analysis);
        // Reset image loading states when engagement data changes
        setImageError(false);
        setImageLoaded(false);
      } catch (error) {
        console.error(
          "VirtualReaderDisplay: Failed to load engagement data:",
          error,
        );
        // Fallback to level 1
        setEngagementData({
          currentLevel: 1,
          levelName: "Novice Seeker",
          metrics: {
            completedReadings: 0,
            conversationTurns: 0,
            questionsAnswered: 0,
            sessionCount: 0,
          },
        });
      } finally {
        setIsLoading(false);
      }
    };
    loadEngagementData();
  }, [user, personaLearner]);
  // Clear level up indicator after animation

  useEffect(() => {
    if (previousLevel !== null) {
      const timer = setTimeout(() => {
        setPreviousLevel(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [previousLevel]);
  const getImagePath = (level: number): string => {
    // Ensure level is within valid range
    const validLevel = Math.max(1, Math.min(5, level));
    return `/images/readers/${readerId}/level_${validLevel}.png`;
  };
  const getLevelColor = (level: number): string => {
    switch (level) {
      case 1:
        return "from-purple-600 to-purple-800";
      case 2:
        return "from-purple-500 to-pink-600";
      case 3:
        return "from-pink-500 to-purple-600";
      case 4:
        return "from-purple-400 to-pink-500";
      case 5:
        return "from-gold-400 to-yellow-500";
      default:
        return "from-purple-600 to-purple-800";
    }
  };
  const getLevelIcon = (level: number) => {
    if (level >= 5) return <Unlock className="w-4 h-4" />;
    if (level >= 3) return <Eye className="w-4 h-4" />;
    return <Lock className="w-4 h-4" />;
  };
  if (isLoading) {
    return (
      <div
        className={`${config.container} ${className} flex items-center justify-center`}
      >
        <motion.div
          className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }
  return (
    <div className={`relative ${config.container} ${className}`}>
      {/* Level Up Animation Overlay */}
      <AnimatePresence>
        {previousLevel !== null && engagementData && (
          <motion.div
            className="absolute inset-0 z-20 flex items-center justify-center bg-black/80 rounded-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="text-center"
              initial={{ scale: 0.5, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.5, y: -20 }}
              transition={{ type: "spring", damping: 15, stiffness: 300 }}
            >
              <motion.div
                className="text-gold-400 mb-2"
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 2, ease: "linear" }}
              >
                <Sparkles className="w-8 h-8 mx-auto" />
              </motion.div>
              <div className={`text-white font-bold ${config.text}`}>
                Level Up!
              </div>
              <div className={`text-gold-300 ${config.text}`}>
                {previousLevel} → {engagementData.currentLevel}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Main Reader Image */}
      <motion.div
        className="relative w-full h-full rounded-lg overflow-hidden bg-gradient-to-br from-purple-900/50 to-black/50"
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", damping: 20, stiffness: 300 }}
      >
        {!imageError && imageLoaded ? (
          <motion.img
            src={getImagePath(engagementData?.currentLevel || 1)}
            alt={`${readerId} - Level ${engagementData?.currentLevel || 1}`}
            className={`${config.image} object-cover transition-opacity duration-500`}
            onError={() => {
              console.log(
                "VirtualReaderDisplay: Image failed to load:",
                getImagePath(engagementData?.currentLevel || 1),
              );
              setImageError(true);
            }}
            onLoad={(e) => {
              const img = e.target as HTMLImageElement;
              // Check if image is actually valid (not just a black square)
              if (img.naturalWidth > 0 && img.naturalHeight > 0) {
                setImageLoaded(true);
                setImageError(false);
              } else {
                console.log(
                  "VirtualReaderDisplay: Image appears to be invalid",
                );
                setImageError(true);
              }
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            key={engagementData?.currentLevel} // Re-animate on level change
            transition={{ duration: 0.8 }}
          />
        ) : (
          // Enhanced fallback display if image fails to load
          <div
            className={`${config.image} bg-gradient-to-br from-purple-800 via-indigo-800 to-purple-900 flex flex-col items-center justify-center relative overflow-hidden`}
          >
            {/* Mystical Background Effects */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-t from-purple-900/50 via-transparent to-purple-500/30"
              animate={{
                opacity: [0.3, 0.7, 0.3],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            {/* Floating Sparkles */}
            <motion.div
              className="absolute top-1/4 left-1/4"
              animate={{
                y: [-10, 10, -10],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Sparkles className="w-4 h-4 text-purple-300" />
            </motion.div>

            <motion.div
              className="absolute top-3/4 right-1/4"
              animate={{
                y: [10, -10, 10],
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1,
              }}
            >
              <Sparkles className="w-3 h-3 text-pink-300" />
            </motion.div>

            {/* Main Content */}
            <div className="text-center text-purple-200 relative z-10">
              <motion.div
                animate={{
                  rotate: [0, 360],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  rotate: { duration: 8, repeat: Infinity, ease: "linear" },
                  scale: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                }}
                className="mb-3"
              >
                <Sparkles className="w-12 h-12 mx-auto text-purple-300" />
              </motion.div>

              <motion.div
                className={`${config.text} font-semibold mb-1`}
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {readerId.charAt(0).toUpperCase() + readerId.slice(1)}
              </motion.div>

              <div className={`${config.text} text-purple-400`}>
                Level {engagementData?.currentLevel || 1}
              </div>

              <div className={`text-xs text-purple-500 mt-2 px-2 opacity-75`}>
                Mystical Form Revealing...
              </div>

              <div className={`text-xs text-purple-600 mt-1 px-1 opacity-50`}>
                Add images to /public/images/readers/{readerId}/
              </div>
            </div>
          </div>
        )}
        {/* Level Badge */}
        {showLevel && engagementData && (
          <motion.div
            className={`absolute top-2 right-2 bg-gradient-to-r ${getLevelColor(engagementData.currentLevel)} 
              text-white ${config.badge} rounded-full font-bold shadow-lg backdrop-blur-sm border border-white/20
              flex items-center space-x-1`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            {getLevelIcon(engagementData.currentLevel)}
            <span>{engagementData.currentLevel}</span>
          </motion.div>
        )}
        {/* Cosmic Glow Effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-purple-500/10 pointer-events-none"
          animate={{
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </motion.div>
      {/* Level Name and Progress */}
      {(showLevel || showProgress) && engagementData && (
        <motion.div
          className="mt-2 text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {showLevel && (
            <div className={`${config.text} text-purple-300 font-medium`}>
              {engagementData.levelName}
            </div>
          )}

          {showProgress && engagementData.nextThreshold && (
            <div className="mt-1">
              <div className={`${config.text} text-purple-400 mb-1`}>
                Progress to Level {engagementData.nextThreshold.level}
              </div>
              <div className="w-full bg-purple-900/50 rounded-full h-2">
                <motion.div
                  className={`h-2 bg-gradient-to-r ${getLevelColor(engagementData.nextThreshold.level)} rounded-full`}
                  initial={{ width: 0 }}
                  animate={{ width: `${engagementData.progressToNext || 0}%` }}
                  transition={{ duration: 1, delay: 0.7 }}
                />
              </div>
              <div className={`${config.text} text-purple-500 mt-1`}>
                {Math.round(engagementData.progressToNext || 0)}%
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};
