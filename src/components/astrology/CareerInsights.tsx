'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BirthData } from '@/lib/astrology/AstronomicalCalculator';
import { analyzeCareer, CareerAnalysis } from '@/lib/astrology/CareerAnalyzer';
import styles from './CareerInsights.module.css';

interface CareerInsightsProps {
  userBirthData: BirthData;
  onBack: () => void;
}

export const CareerInsights: React.FC<CareerInsightsProps> = ({ 
  userBirthData, 
  onBack 
}) => {
  const [careerAnalysis, setCareerAnalysis] = useState<CareerAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'strengths' | 'challenges' | 'paths'>('overview');

  useEffect(() => {
    const loadCareerAnalysis = async () => {
      try {
        const analysis = await analyzeCareer(userBirthData);
        setCareerAnalysis(analysis);
      } catch (error) {
        console.error('Error analyzing career:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCareerAnalysis();
  }, [userBirthData]);

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <motion.div 
          className={styles.loadingSpinner}
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          ✨
        </motion.div>
        <p>Analyzing your cosmic career blueprint...</p>
      </div>
    );
  }

  if (!careerAnalysis) {
    return (
      <div className={styles.errorContainer}>
        <p>Unable to generate career analysis. Please try again.</p>
        <button className={styles.retryButton} onClick={onBack}>
          Back to Astrology
        </button>
      </div>
    );
  }

  const renderOverview = () => (
    <motion.div 
      className={styles.overviewSection}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className={styles.overviewHeader}>
        <h3>🌟 Your Cosmic Career Blueprint</h3>
      </div>
      
      <div className={styles.overviewContent}>
        <p className={styles.overviewText}>{careerAnalysis.overview}</p>
        
        <div className={styles.keyPlacements}>
          <h4>Key Astrological Influences</h4>
          <div className={styles.placementsGrid}>
            <div className={styles.placementCard}>
              <span className={styles.placementIcon}>👑</span>
              <div>
                <strong>Midheaven</strong>
                <p>{careerAnalysis.keyPlacements.midheaven}</p>
              </div>
            </div>
            <div className={styles.placementCard}>
              <span className={styles.placementIcon}>⚡</span>
              <div>
                <strong>Mars</strong>
                <p>{careerAnalysis.keyPlacements.mars}</p>
              </div>
            </div>
            <div className={styles.placementCard}>
              <span className={styles.placementIcon}>🏗️</span>
              <div>
                <strong>Saturn</strong>
                <p>{careerAnalysis.keyPlacements.saturn}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderStrengths = () => (
    <motion.div 
      className={styles.strengthsSection}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className={styles.sectionHeader}>
        <h3>💪 Your Professional Strengths</h3>
        <p>Natural talents that drive your career success</p>
      </div>
      
      <div className={styles.strengthsGrid}>
        {careerAnalysis.strengths.map((strength, index) => (
          <motion.div 
            key={index}
            className={styles.strengthCard}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.2 }}
          >
            <div className={styles.strengthHeader}>
              <h4>{strength.title}</h4>
              <div className={styles.strengthRating}>
                {[...Array(5)].map((_, i) => (
                  <span 
                    key={i} 
                    className={i < strength.rating ? styles.starFilled : styles.starEmpty}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>
            <p className={styles.strengthDescription}>{strength.description}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );

  const renderChallenges = () => (
    <motion.div 
      className={styles.challengesSection}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className={styles.sectionHeader}>
        <h3>🎯 Growth Opportunities</h3>
        <p>Areas for development that will enhance your career success</p>
      </div>
      
      <div className={styles.challengesGrid}>
        {careerAnalysis.challenges.map((challenge, index) => (
          <motion.div 
            key={index}
            className={styles.challengeCard}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.2 }}
          >
            <div className={styles.challengeHeader}>
              <span className={styles.challengeIcon}>🌱</span>
              <h4>{challenge.title}</h4>
            </div>
            <p className={styles.challengeDescription}>{challenge.description}</p>
            <div className={styles.challengeAdvice}>
              <strong>Action Steps:</strong>
              <p>{challenge.advice}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );

  const renderPaths = () => (
    <motion.div 
      className={styles.pathsSection}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className={styles.sectionHeader}>
        <h3>🚀 Recommended Career Paths</h3>
        <p>Industries and roles aligned with your cosmic blueprint</p>
      </div>
      
      <div className={styles.pathsGrid}>
        {careerAnalysis.recommendedPaths.map((path, index) => (
          <motion.div 
            key={index}
            className={styles.pathCard}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.2 }}
          >
            <div className={styles.pathHeader}>
              <h4>{path.title}</h4>
              <div className={styles.compatibilityRating}>
                <span>Compatibility: </span>
                {[...Array(5)].map((_, i) => (
                  <span 
                    key={i} 
                    className={i < path.compatibility ? styles.starFilled : styles.starEmpty}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>
            <p className={styles.pathDescription}>{path.description}</p>
            <div className={styles.pathIndustries}>
              <strong>Key Industries:</strong>
              <div className={styles.industriesTags}>
                {path.industries.map((industry, idx) => (
                  <span key={idx} className={styles.industryTag}>
                    {industry}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
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
        ← Back to Astrology
      </motion.button>

      <motion.div
        className={styles.content}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className={styles.header}>
          <h1 className={styles.title}>💼 Career Insights</h1>
          <p className={styles.subtitle}>
            Discover your professional purpose through cosmic guidance
          </p>
        </div>

        <div className={styles.tabNavigation}>
          {[
            { key: 'overview', label: 'Overview', icon: '🌟' },
            { key: 'strengths', label: 'Strengths', icon: '💪' },
            { key: 'challenges', label: 'Growth', icon: '🎯' },
            { key: 'paths', label: 'Paths', icon: '🚀' }
          ].map((tab) => (
            <button
              key={tab.key}
              className={`${styles.tabButton} ${selectedTab === tab.key ? styles.activeTab : ''}`}
              onClick={() => setSelectedTab(tab.key as 'overview' | 'strengths' | 'challenges' | 'paths')}
            >
              <span className={styles.tabIcon}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        <div className={styles.tabContent}>
          {selectedTab === 'overview' && renderOverview()}
          {selectedTab === 'strengths' && renderStrengths()}
          {selectedTab === 'challenges' && renderChallenges()}
          {selectedTab === 'paths' && renderPaths()}
        </div>
      </motion.div>
    </div>
  );
};