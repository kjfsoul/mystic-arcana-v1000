'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// import { useAuth } from '../../contexts/AuthContext';
import { AuthModal } from '../auth/AuthModal';
import styles from './UnlockJourneyModal.module.css';
interface UnlockJourneyModalProps {
  isVisible: boolean;
  onClose: () => void;
  type?: 'tarot' | 'astrology';
  className?: string;
}
export const UnlockJourneyModal: React.FC<UnlockJourneyModalProps> = ({
  isVisible,
  onClose,
  type = 'tarot',
  className = ''
}) => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  // const { isGuest } = useAuth(); // Uncomment if needed for future logic
  const handleBeginJourney = () => {
    setShowAuthModal(true);
  };
  const handleContinueAsGuest = () => {
    onClose();
  };
  const handleAuthClose = () => {
    setShowAuthModal(false);
    onClose();
  };
  const content = {
    tarot: {
      emoji: '🌟',
      headline: 'Unlock Your Full Journey',
      description: "You've experienced a glimpse of the magic. Sign up for free to access all tarot spreads, save your readings, get personalized interpretations, and connect with our virtual readers.",
      features: [
        '🎴 Access all tarot spreads (Three-Card, Celtic Cross)',
        '💾 Save and revisit your reading history',
        '✨ Personalized interpretations based on your energy',
        '🔮 Connect with AI-powered virtual readers',
        '🌙 Daily cosmic guidance tailored to you'
      ]
    },
    astrology: {
      emoji: '⭐',
      headline: 'Unlock Your Cosmic Blueprint',
      description: "You've seen the surface of your celestial story. Sign up for free to access your complete birth chart, personalized forecasts, and cosmic guidance tailored to your unique astrological signature.",
      features: [
        '🌟 Complete birth chart with all planetary positions',
        '📊 Advanced aspects and house interpretations',
        '🔄 Real-time transit predictions',
        '📅 Personalized daily and monthly forecasts',
        '💫 Compatibility readings with others'
      ]
    }
  };
  const currentContent = content[type];
  if (!isVisible) return null;
  return (
    <>
      <AnimatePresence>
        {isVisible && (
          <motion.div
            className={`${styles.modal} ${className}`}
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            {/* Cosmic Background Effects */}
            <div className={styles.cosmicEffects}>
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className={styles.floatingOrb}
                  animate={{
                    y: [-10, 10, -10],
                    opacity: [0.3, 0.7, 0.3],
                    scale: [0.8, 1.2, 0.8]
                  }}
                  transition={{
                    duration: 3 + i * 0.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.3
                  }}
                  style={{
                    left: `${15 + i * 15}%`,
                    top: `${10 + (i % 2) * 30}%`
                  }}
                >
                  ✦
                </motion.div>
              ))}
            </div>
            {/* Modal Content */}
            <div className={styles.content}>
              {/* Header */}
              <motion.div 
                className={styles.header}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className={styles.emoji}>{currentContent.emoji}</div>
                <h2 className={styles.headline}>{currentContent.headline}</h2>
                <p className={styles.description}>{currentContent.description}</p>
              </motion.div>
              {/* Features List */}
              <motion.div 
                className={styles.features}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                {currentContent.features.map((feature, index) => (
                  <motion.div
                    key={index}
                    className={styles.feature}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                  >
                    {feature}
                  </motion.div>
                ))}
              </motion.div>
              {/* Actions */}
              <motion.div 
                className={styles.actions}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <motion.button
                  className={styles.primaryButton}
                  onClick={handleBeginJourney}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Begin Your Journey (Free Signup)
                </motion.button>
                
                <motion.button
                  className={styles.secondaryButton}
                  onClick={handleContinueAsGuest}
                  whileHover={{ opacity: 0.8 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Continue as Guest
                </motion.button>
              </motion.div>
              {/* Close Button */}
              <motion.button
                className={styles.closeButton}
                onClick={onClose}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                ×
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Authentication Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={handleAuthClose}
        mode="signup"
        title="Begin Your Cosmic Journey"
        subtitle="Sign up for free to unlock personalized readings and save your cosmic insights"
      />
    </>
  );
};
