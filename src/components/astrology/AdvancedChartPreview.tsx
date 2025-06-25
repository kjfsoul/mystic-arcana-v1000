'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CosmicDeepDive } from './CosmicDeepDive';
import { LifeEvent } from '../timeline';
import styles from './AdvancedChartPreview.module.css';

interface AdvancedChartPreviewProps {
  onBack: () => void;
  lifeEvents?: LifeEvent[];
}

export const AdvancedChartPreview: React.FC<AdvancedChartPreviewProps> = ({ onBack, lifeEvents = [] }) => {
  const [showLearnMore, setShowLearnMore] = useState(false);

  const upcomingFeatures = [
    {
      icon: '⏰',
      title: 'Life Timeline Analysis',
      description: lifeEvents.length > 0 
        ? `Analyze your ${lifeEvents.length} life events through planetary cycles and transits`
        : 'See your life unfold through major planetary cycles and transits',
      status: lifeEvents.length > 0 ? `${lifeEvents.length} events ready for analysis` : 'Add timeline events first'
    },
    {
      icon: '🌊',
      title: 'Progressive Evolution',
      description: 'Track your soul\'s evolution through secondary progressions',
      status: 'Coming Q2 2025'
    },
    {
      icon: '💫',
      title: 'Advanced Aspects',
      description: 'Quintiles, septiles, and minor aspects for deeper insights',
      status: 'Coming Q3 2025'
    },
    {
      icon: '🔄',
      title: 'Transit Forecasting',
      description: 'Precise timing for opportunities and challenges ahead',
      status: 'Coming Q3 2025'
    },
    {
      icon: '🌌',
      title: 'Fixed Stars & Asteroids',
      description: 'Ancient star wisdom and asteroid influences in your chart',
      status: 'Coming Q4 2025'
    },
    {
      icon: '🎯',
      title: 'Electional Astrology',
      description: 'Choose the perfect timing for important life events',
      status: 'Coming Q4 2025'
    }
  ];

  const renderLearnMoreModal = () => (
    <AnimatePresence>
      {showLearnMore && (
        <motion.div 
          className={styles.modalBackdrop}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowLearnMore(false)}
        >
          <motion.div 
            className={styles.modalContent}
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h2>🌌 Advanced Astrological Chart</h2>
              <button 
                className={styles.closeButton}
                onClick={() => setShowLearnMore(false)}
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>
            
            <div className={styles.modalBody}>
              <div className={styles.introSection}>
                <h3>Dive Deep Into Your Cosmic Blueprint</h3>
                <p>
                  Our Advanced Chart unlocks the hidden layers of your astrological DNA, 
                  revealing profound insights about your life path, timing, and spiritual evolution. 
                  This isn&apos;t just astrology—it&apos;s your personal roadmap through the cosmos.
                </p>
              </div>

              <div className={styles.featuresGrid}>
                {upcomingFeatures.map((feature, index) => (
                  <motion.div 
                    key={index}
                    className={styles.featureCard}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className={styles.featureIcon}>{feature.icon}</div>
                    <div className={styles.featureContent}>
                      <h4>{feature.title}</h4>
                      <p>{feature.description}</p>
                      <span className={styles.featureStatus}>{feature.status}</span>
                    </div>
                  </motion.div>
                ))}
              </div>

              {lifeEvents.length === 0 && (
                <div className={styles.timelineEncouragement}>
                  <h3>📅 Enhance Your Reading</h3>
                  <p>
                    Add your life timeline to unlock deeper insights! Your major life events 
                    will be analyzed alongside planetary transits to reveal cosmic patterns 
                    in your personal evolution.
                  </p>
                  <button 
                    className={styles.timelineButton}
                    onClick={() => {
                      onBack();
                      setTimeout(() => {
                        // This will be handled by the parent component
                        (document.querySelector('[data-service="timeline"]') as HTMLElement)?.click();
                      }, 100);
                    }}
                  >
                    Build Your Timeline First
                  </button>
                </div>
              )}

              <div className={styles.earlyAccessSection}>
                <h3>🚀 Be Among the First</h3>
                <p>
                  Join our exclusive early access program and be notified the moment 
                  Advanced Charts become available. Early adopters receive special pricing 
                  and lifetime feature updates.
                </p>
                
                <div className={styles.benefits}>
                  <div className={styles.benefit}>
                    <span className={styles.benefitIcon}>⚡</span>
                    <span>First access to new features</span>
                  </div>
                  <div className={styles.benefit}>
                    <span className={styles.benefitIcon}>💎</span>
                    <span>Exclusive early adopter pricing</span>
                  </div>
                  <div className={styles.benefit}>
                    <span className={styles.benefitIcon}>🎓</span>
                    <span>Free educational masterclasses</span>
                  </div>
                  <div className={styles.benefit}>
                    <span className={styles.benefitIcon}>👥</span>
                    <span>Private community access</span>
                  </div>
                </div>
              </div>

              <div className={styles.modalActions}>
                <button className={styles.primaryButton}>
                  Join Early Access List
                </button>
                <button 
                  className={styles.secondaryButton}
                  onClick={() => setShowLearnMore(false)}
                >
                  Maybe Later
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className={styles.container}>
      <motion.button
        className={styles.backButton}
        onClick={onBack}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        ← Back to Astrology
      </motion.button>

      <motion.div
        className={styles.content}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className={styles.header}>
          <h1 className={styles.title}>🌌 Advanced Astrological Chart</h1>
          <p className={styles.subtitle}>
            Unlock the deepest mysteries of your cosmic blueprint
          </p>
        </div>

        <motion.div 
          className={styles.visualSection}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          <CosmicDeepDive />
        </motion.div>

        <motion.div 
          className={styles.descriptionSection}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <div className={styles.description}>
            <h2>Beyond Traditional Astrology</h2>
            <p>
              While basic charts show you the surface, Advanced Charts reveal the quantum 
              fabric of your cosmic existence. Experience the universe&apos;s gravitational 
              waves as they shape your destiny, witness black holes of transformation, 
              and navigate the celestial mechanics of your soul&apos;s evolution.
            </p>
            
            <div className={styles.highlights}>
              <div className={styles.highlight}>
                <span className={styles.highlightIcon}>🕳️</span>
                <div>
                  <strong>Karmic Black Holes</strong>
                  <p>Identify and heal deep soul patterns</p>
                </div>
              </div>
              <div className={styles.highlight}>
                <span className={styles.highlightIcon}>🌊</span>
                <div>
                  <strong>Gravitational Waves</strong>
                  <p>Feel the cosmic forces shaping your path</p>
                </div>
              </div>
              <div className={styles.highlight}>
                <span className={styles.highlightIcon}>⚡</span>
                <div>
                  <strong>Quantum Astrology</strong>
                  <p>Where science meets ancient wisdom</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className={styles.actionSection}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
        >
          <button 
            className={styles.learnMoreButton}
            onClick={() => setShowLearnMore(true)}
          >
            <span className={styles.buttonIcon}>🚀</span>
            Learn More & Join Waitlist
          </button>
          
          <p className={styles.comingSoon}>
            Advanced Charts launching 2025 • Be among the first to experience the future of astrology
          </p>
        </motion.div>
      </motion.div>

      {renderLearnMoreModal()}
    </div>
  );
};