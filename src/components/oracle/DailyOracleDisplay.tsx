'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DailyOracleData, DailyOracleResponse } from '@/types/oracle';
import { useAuth } from '@/contexts/AuthContext';
import { profileService } from '@/services/profileService';
import styles from './DailyOracleDisplay.module.css';

interface DailyOracleDisplayProps {
  className?: string;
}

export const DailyOracleDisplay: React.FC<DailyOracleDisplayProps> = ({ className }) => {
  const [oracleData, setOracleData] = useState<DailyOracleData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'tarot' | 'cosmic' | 'compatibility'>('overview');
  const [isExpanded, setIsExpanded] = useState(false);
  
  const { user } = useAuth();

  useEffect(() => {
    const loadOracleData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // For guest users, show a placeholder message
        if (!user) {
          setError('Sign in to receive your personalized Daily Oracle reading');
          setIsLoading(false);
          return;
        }

        // Get user profile for birth data
        const profile = await profileService.getProfile(user.id);
        console.log('Profile data for Oracle:', profile);
        
        if (!profile?.birth_date) {
          setError('Complete your birth profile to receive your Daily Oracle reading');
          setIsLoading(false);
          return;
        }

        // Prepare birth data
        const birthData = {
          name: profile.full_name || 'User',
          date: new Date(profile.birth_date),
          city: profile.birth_city || 'New York',
          country: profile.birth_country || 'United States',
          latitude: 40.7128, // Default coordinates
          longitude: -74.0060,
          timezone: 'America/New_York'
        };

        // Call the Daily Oracle API
        const response = await fetch('/api/oracle/daily', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            birthData,
            userId: user.id,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch Daily Oracle data');
        }

        const result: DailyOracleResponse = await response.json();
        
        if (!result.success || !result.data) {
          throw new Error(result.error || 'Failed to generate Daily Oracle reading');
        }

        setOracleData(result.data);
      } catch (err) {
        console.error('Error loading Daily Oracle:', err);
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    loadOracleData();
  }, [user]);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const LoadingShimmer = () => (
    <motion.div 
      className={`${styles.container} ${className} ${styles.loading}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className={styles.header}>
        <div className={styles.shimmerLine} style={{ width: '60%', height: '28px' }}></div>
        <div className={styles.shimmerLine} style={{ width: '40%', height: '16px', marginTop: '8px' }}></div>
      </div>
      <div className={styles.content}>
        <div className={styles.shimmerGrid}>
          {[...Array(4)].map((_, i) => (
            <div key={i} className={styles.shimmerCard}>
              <div className={styles.shimmerLine} style={{ width: '70%', height: '20px', marginBottom: '12px' }}></div>
              <div className={styles.shimmerLine} style={{ width: '100%', height: '14px', marginBottom: '8px' }}></div>
              <div className={styles.shimmerLine} style={{ width: '80%', height: '14px' }}></div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );

  const ErrorState = () => (
    <motion.div 
      className={`${styles.container} ${className} ${styles.error}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className={styles.errorContent}>
        <span className={styles.errorIcon}>🔮</span>
        <h3 className={styles.errorTitle}>Oracle Unavailable</h3>
        <p className={styles.errorMessage}>{error}</p>
        {!user && (
          <motion.button
            className={styles.signInButton}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {/* Add sign in logic */}}
          >
            Sign In for Personal Reading
          </motion.button>
        )}
      </div>
    </motion.div>
  );

  if (isLoading) return <LoadingShimmer />;
  if (error || !oracleData) return <ErrorState />;

  const tabContent = {
    overview: (
      <div className={styles.overviewTab}>
        <motion.div 
          className={styles.keyMessage}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h4 className={styles.messageTitle}>Today's Key Message</h4>
          <p className={styles.messageText}>{oracleData.keyMessage}</p>
        </motion.div>

        <motion.div 
          className={styles.affirmation}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h4 className={styles.affirmationTitle}>✨ Daily Affirmation</h4>
          <p className={styles.affirmationText}>"{oracleData.affirmation}"</p>
        </motion.div>

        <motion.div 
          className={styles.actionAdvice}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h4 className={styles.adviceTitle}>Actionable Guidance</h4>
          <ul className={styles.adviceList}>
            {oracleData.actionableAdvice.map((advice, index) => (
              <motion.li 
                key={index} 
                className={styles.adviceItem}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
              >
                <span className={styles.adviceBullet}>▸</span>
                {advice}
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </div>
    ),
    tarot: (
      <div className={styles.tarotTab}>
        <div className={styles.spreadHeader}>
          <h4 className={styles.spreadTitle}>🃏 {oracleData.dailySpread.theme}</h4>
          <p className={styles.spreadDescription}>{oracleData.dailySpread.overallGuidance}</p>
        </div>
        
        <div className={styles.tarotCards}>
          {Object.entries(oracleData.dailySpread.cards).map(([timeOfDay, cardData], index) => (
            <motion.div 
              key={timeOfDay}
              className={styles.tarotCard}
              initial={{ opacity: 0, y: 30, rotateY: 90 }}
              animate={{ opacity: 1, y: 0, rotateY: 0 }}
              transition={{ delay: 0.1 + index * 0.15 }}
            >
              <div className={styles.cardTime}>
                {timeOfDay.charAt(0).toUpperCase() + timeOfDay.slice(1)}
              </div>
              <div className={styles.cardContent}>
                <h5 className={styles.cardName}>
                  {cardData.card.name}
                  {cardData.card.isReversed && <span className={styles.reversed}> (Reversed)</span>}
                </h5>
                <p className={styles.cardInterpretation}>{cardData.interpretation}</p>
                <p className={styles.personalMessage}>{cardData.personalizedMessage}</p>
              </div>
            </motion.div>
          ))}
        </div>
        
        <motion.div 
          className={styles.practicalAdvice}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h4 className={styles.practicalTitle}>Practical Application</h4>
          <p className={styles.practicalText}>{oracleData.dailySpread.practicalAdvice}</p>
        </motion.div>
      </div>
    ),
    cosmic: (
      <div className={styles.cosmicTab}>
        <motion.div 
          className={styles.horoscopeSection}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h4 className={styles.horoscopeTitle}>
            ♌ {oracleData.horoscope.sign.charAt(0).toUpperCase() + oracleData.horoscope.sign.slice(1)} Reading
          </h4>
          <p className={styles.horoscopeText}>{oracleData.horoscope.daily}</p>
        </motion.div>

        <motion.div 
          className={styles.cosmicFocus}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h4 className={styles.cosmicTitle}>🌙 Cosmic Influences</h4>
          
          <div className={styles.cosmicDetails}>
            <div className={styles.cosmicItem}>
              <span className={styles.cosmicLabel}>Moon Phase:</span>
              <span className={styles.cosmicValue}>{oracleData.cosmicFocus.moonPhase}</span>
            </div>
            <div className={styles.cosmicItem}>
              <span className={styles.cosmicLabel}>Moon Sign:</span>
              <span className={styles.cosmicValue}>{oracleData.cosmicFocus.moonSign}</span>
            </div>
            <div className={styles.cosmicItem}>
              <span className={styles.cosmicLabel}>Dominant Planet:</span>
              <span className={styles.cosmicValue}>{oracleData.cosmicFocus.dominantPlanet}</span>
            </div>
            <div className={styles.cosmicItem}>
              <span className={styles.cosmicLabel}>Energy Theme:</span>
              <span className={styles.cosmicValue}>{oracleData.cosmicFocus.energyTheme}</span>
            </div>
          </div>

          <div className={styles.keyAspects}>
            <span className={styles.aspectsLabel}>Key Planetary Aspects:</span>
            <div className={styles.aspectsList}>
              {oracleData.cosmicFocus.keyAspects.map((aspect, index) => (
                <span key={index} className={styles.aspect}>{aspect}</span>
              ))}
            </div>
          </div>

          <div className={styles.cosmicRecommendation}>
            <h5 className={styles.recommendationTitle}>Cosmic Recommendation</h5>
            <p className={styles.recommendationText}>{oracleData.cosmicFocus.recommendation}</p>
          </div>
        </motion.div>
      </div>
    ),
    compatibility: (
      <div className={styles.compatibilityTab}>
        <motion.div 
          className={styles.compatibilityContent}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h4 className={styles.compatibilityTitle}>💕 Relationship Insights</h4>
          
          <div className={styles.compatibilityDetails}>
            <div className={styles.matchSection}>
              <div className={styles.bestMatch}>
                <span className={styles.matchLabel}>Best Harmony With:</span>
                <span className={styles.matchSign}>{oracleData.compatibility.bestMatchSign}</span>
              </div>
              <div className={styles.challengingMatch}>
                <span className={styles.matchLabel}>Growth Challenge With:</span>
                <span className={styles.challengeSign}>{oracleData.compatibility.challengingSign}</span>
              </div>
            </div>
            
            <div className={styles.relationshipAdvice}>
              <h5 className={styles.relationshipTitle}>Relationship Guidance</h5>
              <p className={styles.relationshipText}>{oracleData.compatibility.relationshipAdvice}</p>
            </div>
            
            <div className={styles.communicationTips}>
              <h5 className={styles.communicationTitle}>Communication Focus</h5>
              <p className={styles.communicationText}>{oracleData.compatibility.communicationTips}</p>
            </div>
          </div>
        </motion.div>
      </div>
    )
  };

  return (
    <motion.div 
      className={`${styles.container} ${className} ${isExpanded ? styles.expanded : ''}`}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h3 className={styles.title}>
            <span className={styles.titleIcon}>🔮</span>
            Daily Oracle
          </h3>
          <p className={styles.subtitle}>
            {formatDate(oracleData.date)} • Personalized Reading
          </p>
          <p className={styles.theme}>{oracleData.overallTheme}</p>
        </div>
        
        <button 
          className={styles.expandButton}
          onClick={() => setIsExpanded(!isExpanded)}
          aria-label={isExpanded ? 'Collapse' : 'Expand'}
        >
          {isExpanded ? '−' : '+'}
        </button>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            className={styles.expandedContent}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className={styles.tabs}>
              {[
                { key: 'overview', label: 'Overview', icon: '✨' },
                { key: 'tarot', label: 'Tarot Spread', icon: '🃏' },
                { key: 'cosmic', label: 'Cosmic Focus', icon: '🌙' },
                { key: 'compatibility', label: 'Relationships', icon: '💕' }
              ].map((tab) => (
                <motion.button
                  key={tab.key}
                  className={`${styles.tab} ${activeTab === tab.key ? styles.activeTab : ''}`}
                  onClick={() => setActiveTab(tab.key as any)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className={styles.tabIcon}>{tab.icon}</span>
                  <span className={styles.tabLabel}>{tab.label}</span>
                </motion.button>
              ))}
            </div>

            <div className={styles.tabContent}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {tabContent[activeTab]}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Compact preview when collapsed */}
      {!isExpanded && (
        <motion.div 
          className={styles.compactPreview}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <p className={styles.previewText}>{oracleData.keyMessage}</p>
          <div className={styles.previewHint}>
            <span className={styles.hintText}>Click + to explore your full reading</span>
            <span className={styles.hintArrow}>↗</span>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};