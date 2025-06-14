'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { UnlockJourneyModal } from '../modals/UnlockJourneyModal';
import { AuthModal } from '../auth/AuthModal';
import styles from './AstrologyReadingRoom.module.css';

interface AstrologyReadingRoomProps {
  onBack: () => void;
}

// interface BirthData {
//   date: string;
//   time: string;
//   location: string;
// }

type UserTier = 'guest' | 'signed-up' | 'subscriber';

export const AstrologyReadingRoom: React.FC<AstrologyReadingRoomProps> = ({ onBack }) => {
  const { user, isGuest } = useAuth();
  const [userTier, setUserTier] = useState<UserTier>('guest');
  const [selectedService, setSelectedService] = useState<'chart' | 'horoscope' | null>(null);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    if (isGuest) {
      setUserTier('guest');
    } else if (user) {
      // For MVP, assume signed-up users are not subscribers yet
      // In production, check user subscription status
      setUserTier('signed-up');
    }
  }, [user, isGuest]);

  const handleServiceSelection = (service: 'chart' | 'horoscope') => {
    setSelectedService(service);
    
    if (service === 'chart') {
      if (userTier === 'guest') {
        // Show example chart and then unlock modal
        setTimeout(() => setShowUnlockModal(true), 3000);
      }
      // For MVP, both guest and signed-up users see the same content
    }
  };

  const exampleChart = {
    sun: { sign: 'Leo', degree: 15, house: 5 },
    moon: { sign: 'Pisces', degree: 28, house: 12 },
    rising: { sign: 'Aries', degree: 3, house: 1 },
    mercury: { sign: 'Cancer', degree: 22, house: 4 },
    venus: { sign: 'Virgo', degree: 8, house: 6 },
    mars: { sign: 'Gemini', degree: 11, house: 3 }
  };

  const getPlanetEmoji = (planet: string) => {
    const planetMap: Record<string, string> = {
      sun: '☉',
      moon: '☽',
      mercury: '☿',
      venus: '♀',
      mars: '♂',
      jupiter: '♃',
      saturn: '♄'
    };
    return planetMap[planet] || '✦';
  };

  const renderGuestExperience = () => (
    <motion.div 
      className={styles.chartContainer}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className={styles.chartHeader}>
        <h3>✨ Sample Birth Chart</h3>
        <p className={styles.chartSubtitle}>
          This is an example of what your personalized chart could reveal
        </p>
      </div>

      <div className={styles.chartWheel}>
        <div className={styles.wheelCenter}>
          <div className={styles.coreIdentity}>
            <div className={styles.sunSign}>
              {getPlanetEmoji('sun')} Leo Rising
            </div>
            <div className={styles.moonSign}>
              {getPlanetEmoji('moon')} Pisces Moon
            </div>
          </div>
        </div>

        <div className={styles.planetaryPositions}>
          {Object.entries(exampleChart).map(([planet, data]) => (
            <motion.div
              key={planet}
              className={styles.planetPosition}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <span className={styles.planetSymbol}>{getPlanetEmoji(planet)}</span>
              <span className={styles.planetInfo}>
                {data.sign} {data.degree}°
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      <div className={styles.sampleInterpretation}>
        <h4>🌟 Key Insights</h4>
        <div className={styles.insights}>
          <div className={styles.insight}>
            <strong>Creative Fire:</strong> Your Leo energy brings natural leadership and creative expression
          </div>
          <div className={styles.insight}>
            <strong>Intuitive Depths:</strong> Pisces Moon grants deep emotional intelligence and psychic abilities
          </div>
          <div className={styles.insight}>
            <strong>Dynamic Action:</strong> Mars in Gemini creates versatile communication skills
          </div>
        </div>
        
        <div className={styles.upgradeHint}>
          <p>This is just the beginning. Your complete chart reveals so much more...</p>
        </div>
      </div>
    </motion.div>
  );

  const renderDailyHoroscope = () => (
    <motion.div 
      className={styles.horoscopeContainer}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className={styles.horoscopeHeader}>
        <h3>🌙 Daily Cosmic Weather</h3>
        <p className={styles.horoscopeDate}>
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      <div className={styles.horoscopeContent}>
        <div className={styles.cosmicHighlight}>
          <h4>✨ Today&apos;s Cosmic Spotlight</h4>
          <p>
            Mercury&apos;s harmonious aspect to Jupiter opens pathways for meaningful conversations 
            and expanded thinking. The waning moon in Capricorn encourages practical magic 
            and grounded manifestation.
          </p>
        </div>

        <div className={styles.generalGuidance}>
          <h4>🌟 Universal Guidance</h4>
          <ul>
            <li>💫 Trust your intuitive insights today</li>
            <li>🗣️ Important conversations lead to new opportunities</li>
            <li>🌱 Plant seeds for long-term goals</li>
            <li>🔮 Evening meditation brings clarity</li>
          </ul>
        </div>

        <div className={styles.premiumTeaser}>
          <div className={styles.teaserContent}>
            <h4>🎯 Want Your Personal Forecast?</h4>
            <p>
              For deeper, personalized insights based on your unique birth chart, 
              <strong> sign up for free</strong> to unlock your cosmic blueprint.
            </p>
            <button 
              className={styles.upgradeButton}
              onClick={() => setShowAuthModal(true)}
            >
              Get My Personal Reading
            </button>
          </div>
        </div>
      </div>
    </motion.div>
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
        ← Back to Cosmic Lobby
      </motion.button>

      <motion.div
        className={styles.content}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className={styles.header}>
          <h1 className={styles.title}>✨ Astrology Reading Room</h1>
          <p className={styles.subtitle}>
            Discover your cosmic blueprint and celestial guidance
          </p>
        </div>

        {!selectedService ? (
          <div className={styles.serviceSelection}>
            <motion.div 
              className={styles.serviceCard}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleServiceSelection('chart')}
            >
              <div className={styles.serviceIcon}>🌟</div>
              <h3>Birth Chart Reading</h3>
              <p>Explore your cosmic DNA and life purpose</p>
              <div className={styles.serviceAccess}>
                {userTier === 'guest' && <span className={styles.accessBadge}>Preview Available</span>}
                {userTier === 'signed-up' && <span className={styles.accessBadge}>Basic Chart</span>}
                {userTier === 'subscriber' && <span className={styles.accessBadge}>Full Access</span>}
              </div>
            </motion.div>

            <motion.div 
              className={styles.serviceCard}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleServiceSelection('horoscope')}
            >
              <div className={styles.serviceIcon}>🌙</div>
              <h3>Daily Horoscope</h3>
              <p>Today&apos;s cosmic weather and guidance</p>
              <div className={styles.serviceAccess}>
                <span className={styles.accessBadge}>Free for All</span>
              </div>
            </motion.div>
          </div>
        ) : (
          <div className={styles.serviceContent}>
            {selectedService === 'chart' && renderGuestExperience()}
            {selectedService === 'horoscope' && renderDailyHoroscope()}
            
            <button 
              className={styles.backToServices}
              onClick={() => setSelectedService(null)}
            >
              ← Choose Different Service
            </button>
          </div>
        )}
      </motion.div>

      {/* Unlock Journey Modal */}
      <UnlockJourneyModal
        isVisible={showUnlockModal}
        onClose={() => setShowUnlockModal(false)}
        type="astrology"
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode="signup"
        title="Unlock Your Cosmic Blueprint"
        subtitle="Sign up for free to access personalized astrology readings"
      />
    </div>
  );
};