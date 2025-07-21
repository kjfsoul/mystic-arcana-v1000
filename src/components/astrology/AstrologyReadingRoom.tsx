'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import { UnlockJourneyModal } from '../modals/UnlockJourneyModal';
import { AuthModal } from '../auth/AuthModal';
import { DailyHoroscopeService } from '@/services/horoscope/DailyHoroscopeService';
import { profileService } from '@/services/profileService';
import { InteractiveBirthChart } from './InteractiveBirthChart';
import { CompatibilityInsights } from './CompatibilityInsights';
import { InteractiveCareerInsights } from './InteractiveCareerInsights';
import { AdvancedChartPreview } from './AdvancedChartPreview';
import { BirthData, PlanetPosition, HousePosition } from '@/lib/astrology/AstronomicalCalculator';
import { LocationSearch } from '../forms/LocationSearch';
import { LocationResult } from '@/lib/location/GeocodingService';
import { UserTimeline, LifeEvent } from '../timeline';
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
  const [selectedService, setSelectedService] = useState<'chart' | 'horoscope' | 'compatibility' | 'career' | 'advanced' | 'timeline' | null>(null);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showBirthForm, setShowBirthForm] = useState(false);
  const [birthData, setBirthData] = useState<BirthData>({
    date: new Date('1990-06-15T14:30:00Z'),
    latitude: 40.7128, // New York City default
    longitude: -74.0060,
    timezone: 'America/New_York',
    city: 'New York',
    country: 'United States'
  });
  const [formData, setFormData] = useState({
    date: '1990-06-15',
    time: '14:30',
    timezone: 'America/New_York'
  });
  const [selectedLocation, setSelectedLocation] = useState<LocationResult | null>(null);
  const [lifeEvents, setLifeEvents] = useState<LifeEvent[]>(() => {
    // Load from localStorage on component mount
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mystic-arcana-life-events');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [personalizedHoroscope, setPersonalizedHoroscope] = useState<{personalized?: {sign: string; insight: string; advice: string; focus: string}} | null>(null);
  const [isLoadingHoroscope, setIsLoadingHoroscope] = useState(false);

  const loadPersonalizedHoroscope = useCallback(async () => {
    if (!user) return;
    
    setIsLoadingHoroscope(true);
    try {
      const profile = await profileService.getProfile(user.id);
      if (profile?.birth_date) {
        const service = DailyHoroscopeService.getInstance();
        const horoscope = service.getPersonalizedHoroscope(profile.birth_date);
        setPersonalizedHoroscope(horoscope);
      }
    } catch (error) {
      console.error('Error loading personalized horoscope:', error);
    } finally {
      setIsLoadingHoroscope(false);
    }
  }, [user]);

  useEffect(() => {
    if (isGuest) {
      setUserTier('guest');
    } else if (user) {
      // For MVP, assume signed-up users are not subscribers yet
      // In production, check user subscription status
      setUserTier('signed-up');
      
      // Load personalized horoscope for authenticated users
      loadPersonalizedHoroscope();
    }
  }, [user, isGuest, loadPersonalizedHoroscope]);

  const handleLifeEventsChange = (events: LifeEvent[]) => {
    setLifeEvents(events);
    // Persist to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('mystic-arcana-life-events', JSON.stringify(events));
    }
  };

  const handleServiceSelection = (service: 'chart' | 'horoscope' | 'compatibility' | 'career' | 'advanced' | 'timeline') => {
    setSelectedService(service);
    
    if (service === 'chart') {
      // Chart always needs birth form
      setShowBirthForm(true);
    } else if (service === 'compatibility' || service === 'career') {
      // For compatibility and career, only show form if no birth data exists
      // Otherwise, show the component directly with current birth data
      const hasValidBirthData = birthData && birthData.date && birthData.latitude && birthData.longitude;
      if (!hasValidBirthData) {
        setShowBirthForm(true);
      } else {
        setShowBirthForm(false);
      }
    }
    // Advanced chart and timeline don't need birth form - timeline is standalone, advanced is a preview/upsell
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedLocation) {
      alert('Please select a birth location');
      return;
    }
    
    // Handle optional birth time - use noon if not provided
    const timeString = formData.time || '12:00';
    const combinedDateTime = new Date(`${formData.date}T${timeString}:00`);
    
    setBirthData({
      date: combinedDateTime,
      latitude: selectedLocation.latitude,
      longitude: selectedLocation.longitude,
      timezone: selectedLocation.timezone || formData.timezone,
      city: selectedLocation.city || 'Unknown',
      country: selectedLocation.country || 'Unknown'
    });
    
    setShowBirthForm(false);
    
    // Show unlock modal for guests after they see the chart
    if (userTier === 'guest') {
      setTimeout(() => setShowUnlockModal(true), 5000);
    }
  };

  const handlePlanetClick = (planet: PlanetPosition) => {
    console.log('Planet clicked:', planet);
  };

  const handleHouseClick = (house: HousePosition) => {
    console.log('House clicked:', house);
  };


  const renderBirthDataForm = () => (
    <motion.div 
      className={styles.chartContainer}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className={styles.chartHeader}>
        <h3>✨ Enter Your Birth Information</h3>
        <p className={styles.chartSubtitle}>
          Generate your personalized interactive birth chart
        </p>
      </div>

      <form onSubmit={handleFormSubmit} className={styles.birthForm}>
        <div className={styles.formGrid}>
          <div className={styles.formField}>
            <label>Birth Date:</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>
          
          <div className={styles.formField}>
            <label>Birth Time (Optional):</label>
            <input
              type="time"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              placeholder="Leave blank if unknown"
            />
          </div>
        </div>
        
        <div className={styles.locationField}>
          <LocationSearch
            value={selectedLocation}
            onChange={setSelectedLocation}
            placeholder="Enter your birth city, state, country, or ZIP code"
            label="Birth Location"
          />
        </div>
        
        <div className={styles.formActions}>
          <button type="submit" className={styles.generateButton}>
            Generate My Birth Chart ✨
          </button>
          <button 
            type="button" 
            className={styles.cancelButton}
            onClick={() => setShowBirthForm(false)}
          >
            Cancel
          </button>
        </div>
      </form>
    </motion.div>
  );

  const renderInteractiveChart = () => (
    <motion.div 
      className={styles.chartContainer}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className={styles.chartHeader}>
        <h3>✨ Your Interactive Birth Chart</h3>
        <p className={styles.chartSubtitle}>
          Click any planet, house, or zodiac sign to explore deeper meanings
        </p>
        <button 
          className={styles.editBirthData}
          onClick={() => setShowBirthForm(true)}
        >
          Edit Birth Info
        </button>
      </div>

      <InteractiveBirthChart
        birthData={birthData}
        onPlanetClick={handlePlanetClick}
        onHouseClick={handleHouseClick}
        className={styles.birthChart}
      />

      <div className={styles.chartInstructions}>
        <h4>🔮 How to Use Your Chart</h4>
        <div className={styles.instructions}>
          <div className={styles.instruction}>
            <span className={styles.icon}>🪐</span>
            <strong>Click Planets:</strong> Discover what each celestial body reveals about you
          </div>
          <div className={styles.instruction}>
            <span className={styles.icon}>🏠</span>
            <strong>Click Houses:</strong> Explore the 12 areas of your life
          </div>
          <div className={styles.instruction}>
            <span className={styles.icon}>♈</span>
            <strong>Click Signs:</strong> Learn about zodiac influences
          </div>
          <div className={styles.instruction}>
            <span className={styles.icon}>▶️</span>
            <strong>Toggle Animation:</strong> Watch the cosmos come alive
          </div>
        </div>
        
        {userTier === 'guest' && (
          <div className={styles.upgradeHint}>
            <p>Want to save your chart and unlock advanced features? 
              <button 
                className={styles.signUpLink}
                onClick={() => setShowAuthModal(true)}
              >
                Sign up for free!
              </button>
            </p>
          </div>
        )}
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

        {userTier === 'guest' ? (
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
        ) : (
          <div className={styles.personalizedSection}>
            <div className={styles.personalizedContent}>
              {isLoadingHoroscope ? (
                <div className={styles.loadingPersonalized}>
                  <h4>🔮 Loading Your Personal Reading...</h4>
                  <p>Accessing your cosmic blueprint...</p>
                </div>
              ) : personalizedHoroscope?.personalized ? (
                <div className={styles.realPersonalizedContent}>
                  <h4>🌟 Your {personalizedHoroscope.personalized.sign.charAt(0).toUpperCase() + personalizedHoroscope.personalized.sign.slice(1)} Reading</h4>
                  <div className={styles.personalizedInsight}>
                    <p className={styles.mainInsight}>{personalizedHoroscope.personalized.insight}</p>
                  </div>
                  <div className={styles.personalizedAdvice}>
                    <h5>Your Focus Today:</h5>
                    <p>{personalizedHoroscope.personalized.advice}</p>
                  </div>
                  <div className={styles.energyFocus}>
                    <h5>Energy Focus:</h5>
                    <span className={styles.focusValue}>{personalizedHoroscope.personalized.focus}</span>
                  </div>
                  <button 
                    className={styles.personalButton}
                    onClick={() => handleServiceSelection('chart')}
                  >
                    View My Birth Chart
                  </button>
                </div>
              ) : (
                <div className={styles.noPersonalizedData}>
                  <h4>🎯 Complete Your Profile for Personal Readings</h4>
                  <p>
                    To receive personalized cosmic guidance, please add your birth date to your profile.
                  </p>
                  <Link href="/profile" className={styles.personalButton}>
                    Complete Your Profile ✨
                  </Link>
                  <button 
                    className={styles.personalButton}
                    onClick={() => handleServiceSelection('chart')}
                    style={{ marginTop: '0.5rem' }}
                  >
                    Add Birth Information
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
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

            <motion.div 
              className={styles.serviceCard}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleServiceSelection('compatibility')}
            >
              <div className={styles.serviceIcon}>💫</div>
              <h3>Compatibility Insights</h3>
              <p>Discover your cosmic connection with another</p>
              <div className={styles.serviceAccess}>
                {userTier === 'guest' && <span className={styles.accessBadge}>Demo Available</span>}
                {userTier === 'signed-up' && <span className={styles.accessBadge}>Full Access</span>}
                {userTier === 'subscriber' && <span className={styles.accessBadge}>Premium</span>}
              </div>
            </motion.div>

            <motion.div 
              className={styles.serviceCard}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleServiceSelection('career')}
            >
              <div className={styles.serviceIcon}>💼</div>
              <h3>Career Insights</h3>
              <p>Unlock your professional purpose and potential</p>
              <div className={styles.serviceAccess}>
                {userTier === 'guest' && <span className={styles.accessBadge}>Demo Available</span>}
                {userTier === 'signed-up' && <span className={styles.accessBadge}>Full Access</span>}
                {userTier === 'subscriber' && <span className={styles.accessBadge}>Premium Plus</span>}
              </div>
            </motion.div>

            <motion.div 
              className={styles.serviceCard}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleServiceSelection('timeline')}
              data-service="timeline"
            >
              <div className={styles.serviceIcon}>📅</div>
              <h3>Life Timeline</h3>
              <p>Map your journey through key life events</p>
              <div className={styles.serviceAccess}>
                <span className={styles.accessBadge}>Free for All</span>
              </div>
            </motion.div>

            <motion.div 
              className={`${styles.serviceCard} ${styles.advancedCard}`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleServiceSelection('advanced')}
            >
              <div className={styles.serviceIcon}>🌌</div>
              <h3>Advanced Chart</h3>
              <p>Dive deep into your inner cosmic fabric</p>
              <div className={styles.serviceAccess}>
                <span className={styles.comingSoonBadge}>Coming 2025</span>
              </div>
            </motion.div>
          </div>
        ) : (
          <div className={styles.serviceContent}>
            {selectedService === 'chart' && (
              <>
                {showBirthForm && renderBirthDataForm()}
                {!showBirthForm && renderInteractiveChart()}
              </>
            )}
            {selectedService === 'horoscope' && renderDailyHoroscope()}
            {selectedService === 'compatibility' && (
              <>
                {showBirthForm && renderBirthDataForm()}
                {!showBirthForm && (
                  <CompatibilityInsights 
                    userBirthData={birthData}
                    onBack={() => setSelectedService(null)}
                  />
                )}
              </>
            )}
            {selectedService === 'career' && (
              <>
                {showBirthForm && renderBirthDataForm()}
                {!showBirthForm && (
                  <InteractiveCareerInsights 
                    birthData={birthData}
                    onBack={() => setSelectedService(null)}
                  />
                )}
              </>
            )}
            {selectedService === 'timeline' && (
              <UserTimeline 
                events={lifeEvents}
                onEventsChange={handleLifeEventsChange}
              />
            )}
            {selectedService === 'advanced' && (
              <AdvancedChartPreview 
                onBack={() => setSelectedService(null)}
                lifeEvents={lifeEvents}
              />
            )}
            
            {selectedService !== 'compatibility' && selectedService !== 'career' && selectedService !== 'advanced' && selectedService !== 'timeline' && (
              <button 
                className={styles.backToServices}
                onClick={() => {
                  setSelectedService(null);
                  setShowBirthForm(false);
                }}
              >
                ← Choose Different Service
              </button>
            )}
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