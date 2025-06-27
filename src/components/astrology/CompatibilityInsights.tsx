'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// import { useAuth } from '../../contexts/AuthContext'; // For future user-specific features
import { BirthData } from '@/lib/astrology/AstronomicalCalculator';
import { calculateCompatibility, CompatibilityResult } from '@/lib/astrology/SynastryCalculator';
import styles from './CompatibilityInsights.module.css';

interface CompatibilityInsightsProps {
  userBirthData: BirthData;
  onBack: () => void;
}

interface PartnerFormData {
  name: string;
  date: string;
  time: string;
  latitude: string;
  longitude: string;
  timezone: string;
}

export const CompatibilityInsights: React.FC<CompatibilityInsightsProps> = ({ 
  userBirthData, 
  onBack 
}) => {
  // const { user } = useAuth(); // For future user-specific features
  const [showPartnerForm, setShowPartnerForm] = useState(true);
  const [compatibilityResult, setCompatibilityResult] = useState<CompatibilityResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  
  const [partnerData, setPartnerData] = useState<PartnerFormData>({
    name: '',
    date: '1990-06-15',
    time: '14:30',
    timezone: 'America/New_York'
  });
  const [partnerLocation, setPartnerLocation] = useState<LocationResult | null>(null);

  const handlePartnerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCalculating(true);
    
    if (!partnerLocation) {
      alert('Please select a birth location for your partner.');
      return;
    }

    try {
      const combinedDateTime = new Date(`${partnerData.date}T${partnerData.time}:00`);
      
      const partnerBirthData: BirthData = {
        date: combinedDateTime,
        latitude: partnerLocation.latitude,
        longitude: partnerLocation.longitude,
        timezone: partnerLocation.timezone || partnerData.timezone
      };

      // Calculate compatibility
      const result = await calculateCompatibility(userBirthData, partnerBirthData);
      setCompatibilityResult(result);
      setShowPartnerForm(false);
    } catch (error) {
      console.error('Error calculating compatibility:', error);
    } finally {
      setIsCalculating(false);
    }
  };

  const renderPartnerForm = () => (
    <motion.div 
      className={styles.formContainer}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className={styles.formHeader}>
        <h3>💕 Enter Partner&apos;s Birth Information</h3>
        <p className={styles.formSubtitle}>
          Discover your cosmic compatibility together
        </p>
      </div>

      <form onSubmit={handlePartnerSubmit} className={styles.partnerForm}>
        <div className={styles.formField}>
          <label>Partner&apos;s Name:</label>
          <input
            type="text"
            value={partnerData.name}
            onChange={(e) => setPartnerData({ ...partnerData, name: e.target.value })}
            placeholder="Enter their name"
            required
          />
        </div>

        <div className={styles.formGrid}>
          <div className={styles.formField}>
            <label>Birth Date:</label>
            <input
              type="date"
              value={partnerData.date}
              onChange={(e) => setPartnerData({ ...partnerData, date: e.target.value })}
              required
            />
          </div>
          
          <div className={styles.formField}>
            <label>Birth Time:</label>
            <input
              type="time"
              value={partnerData.time}
              onChange={(e) => setPartnerData({ ...partnerData, time: e.target.value })}
              required
            />
          </div>
          
          <div className={styles.locationField}>
            <LocationSearch
              value={partnerLocation}
              onChange={setPartnerLocation}
              placeholder="Enter partner's birth city"
              label="Partner's Birth Location"
            />
          </div>
        </div>
        
        <div className={styles.formActions}>
          <button 
            type="submit" 
            className={styles.calculateButton}
            disabled={isCalculating}
          >
            {isCalculating ? '✨ Calculating...' : 'Analyze Compatibility ✨'}
          </button>
          <button 
            type="button" 
            className={styles.cancelButton}
            onClick={onBack}
          >
            Cancel
          </button>
        </div>
      </form>
    </motion.div>
  );

  const renderCompatibilityResults = () => {
    if (!compatibilityResult) return null;

    return (
      <motion.div 
        className={styles.resultsContainer}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className={styles.resultsHeader}>
          <h3>💫 Your Compatibility Insights</h3>
          <p className={styles.resultsSubtitle}>
            Cosmic connection analysis for you and {partnerData.name}
          </p>
        </div>

        <div className={styles.compatibilityGrid}>
          {/* Love Compatibility */}
          <motion.div 
            className={styles.compatibilityCard}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className={styles.cardHeader}>
              <span className={styles.cardIcon}>💕</span>
              <h4>Love & Romance</h4>
            </div>
            <div className={styles.rating}>
              <div className={styles.ratingStars}>
                {[...Array(5)].map((_, i) => (
                  <span 
                    key={i} 
                    className={i < compatibilityResult.love.rating ? styles.starFilled : styles.starEmpty}
                  >
                    ★
                  </span>
                ))}
              </div>
              <span className={styles.ratingText}>{compatibilityResult.love.rating}/5</span>
            </div>
            <p className={styles.cardDescription}>{compatibilityResult.love.description}</p>
          </motion.div>

          {/* Friendship Compatibility */}
          <motion.div 
            className={styles.compatibilityCard}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className={styles.cardHeader}>
              <span className={styles.cardIcon}>🤝</span>
              <h4>Friendship</h4>
            </div>
            <div className={styles.rating}>
              <div className={styles.ratingStars}>
                {[...Array(5)].map((_, i) => (
                  <span 
                    key={i} 
                    className={i < compatibilityResult.friendship.rating ? styles.starFilled : styles.starEmpty}
                  >
                    ★
                  </span>
                ))}
              </div>
              <span className={styles.ratingText}>{compatibilityResult.friendship.rating}/5</span>
            </div>
            <p className={styles.cardDescription}>{compatibilityResult.friendship.description}</p>
          </motion.div>

          {/* Teamwork Compatibility */}
          <motion.div 
            className={styles.compatibilityCard}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className={styles.cardHeader}>
              <span className={styles.cardIcon}>🎯</span>
              <h4>Teamwork</h4>
            </div>
            <div className={styles.rating}>
              <div className={styles.ratingStars}>
                {[...Array(5)].map((_, i) => (
                  <span 
                    key={i} 
                    className={i < compatibilityResult.teamwork.rating ? styles.starFilled : styles.starEmpty}
                  >
                    ★
                  </span>
                ))}
              </div>
              <span className={styles.ratingText}>{compatibilityResult.teamwork.rating}/5</span>
            </div>
            <p className={styles.cardDescription}>{compatibilityResult.teamwork.description}</p>
          </motion.div>
        </div>

        {/* Overall Summary */}
        <motion.div 
          className={styles.overallSummary}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <h4>🌟 Overall Cosmic Connection</h4>
          <p className={styles.summaryText}>{compatibilityResult.overall.summary}</p>
          <div className={styles.keyAspects}>
            <h5>Key Aspects:</h5>
            <ul>
              {compatibilityResult.overall.keyAspects.map((aspect, index) => (
                <li key={index}>{aspect}</li>
              ))}
            </ul>
          </div>
        </motion.div>

        <div className={styles.resultsActions}>
          <button 
            className={styles.newAnalysisButton}
            onClick={() => {
              setShowPartnerForm(true);
              setCompatibilityResult(null);
            }}
          >
            Analyze Another Partner
          </button>
          <button 
            className={styles.backButton}
            onClick={onBack}
          >
            Back to Astrology
          </button>
        </div>
      </motion.div>
    );
  };

  return (
    <div className={styles.container}>
      <motion.button
        className={styles.backButtonTop}
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
          <h1 className={styles.title}>💫 Compatibility Insights</h1>
          <p className={styles.subtitle}>
            Discover your cosmic connection and relationship dynamics
          </p>
        </div>

        <AnimatePresence mode="wait">
          {showPartnerForm ? (
            <motion.div key="form">
              {renderPartnerForm()}
            </motion.div>
          ) : (
            <motion.div key="results">
              {renderCompatibilityResults()}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};