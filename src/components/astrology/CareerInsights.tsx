'use client';

import React, { useState, useEffect } from 'react';
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
  const [analysis, setAnalysis] = useState<CareerAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function generateCareerAnalysis() {
      try {
        setLoading(true);
        const careerAnalysis = await analyzeCareer(userBirthData);
        setAnalysis(careerAnalysis);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to generate career analysis');
      } finally {
        setLoading(false);
      }
    }

    if (userBirthData) {
      generateCareerAnalysis();
    }
  }, [userBirthData]);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h2>💼 Career Insights</h2>
          <button onClick={onBack} className={styles.backButton}>
            ← Back
          </button>
        </div>
        <div className={styles.loadingContent}>
          <div className={styles.loadingSpinner}>🔮</div>
          <h3>Analyzing Your Cosmic Career Blueprint...</h3>
          <p>Calculating planetary influences on your professional path...</p>
        </div>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h2>💼 Career Insights</h2>
          <button onClick={onBack} className={styles.backButton}>
            ← Back
          </button>
        </div>
        <div className={styles.errorContent}>
          <div className={styles.errorIcon}>⚠️</div>
          <h3>Analysis Temporarily Unavailable</h3>
          <p>{error || 'Unable to generate career analysis at this time.'}</p>
          <button onClick={() => window.location.reload()} className={styles.retryButton}>
            🔄 Try Again
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>💼 Your Career Insights</h2>
        <button onClick={onBack} className={styles.backButton}>
          ← Back
        </button>
      </div>
      
      <div className={styles.analysisContent}>
        {/* Overview Section */}
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>🌟 Your Cosmic Career Blueprint</h3>
          <p className={styles.overview}>{analysis.overview}</p>
        </section>

        {/* Key Placements */}
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>🎯 Key Astrological Influences</h3>
          <div className={styles.placementsGrid}>
            <div className={styles.placement}>
              <h4>Midheaven</h4>
              <p>{analysis.keyPlacements.midheaven}</p>
            </div>
            <div className={styles.placement}>
              <h4>Saturn Discipline</h4>
              <p>{analysis.keyPlacements.saturn}</p>
            </div>
            <div className={styles.placement}>
              <h4>Mars Drive</h4>
              <p>{analysis.keyPlacements.mars}</p>
            </div>
          </div>
        </section>

        {/* Strengths */}
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>💪 Your Professional Strengths</h3>
          <div className={styles.strengthsList}>
            {analysis.strengths.map((strength, index) => (
              <div key={index} className={styles.strengthItem}>
                <div className={styles.strengthHeader}>
                  <h4>{strength.title}</h4>
                  <div className={styles.rating}>
                    {'⭐'.repeat(strength.rating)}
                  </div>
                </div>
                <p>{strength.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Challenges */}
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>🎯 Growth Opportunities</h3>
          <div className={styles.challengesList}>
            {analysis.challenges.map((challenge, index) => (
              <div key={index} className={styles.challengeItem}>
                <h4>{challenge.title}</h4>
                <p className={styles.challengeDescription}>{challenge.description}</p>
                <div className={styles.advice}>
                  <strong>Guidance:</strong> {challenge.advice}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Career Paths */}
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>🛤️ Recommended Career Paths</h3>
          <div className={styles.pathsList}>
            {analysis.recommendedPaths.map((path, index) => (
              <div key={index} className={styles.pathItem}>
                <div className={styles.pathHeader}>
                  <h4>{path.title}</h4>
                  <div className={styles.compatibility}>
                    {'🌟'.repeat(path.compatibility)}
                  </div>
                </div>
                <p className={styles.pathDescription}>{path.description}</p>
                <div className={styles.industries}>
                  <strong>Ideal Industries:</strong>
                  <div className={styles.industryTags}>
                    {path.industries.map((industry, idx) => (
                      <span key={idx} className={styles.industryTag}>{industry}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* House Information */}
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>🏠 Career-Related Houses</h3>
          <div className={styles.housesGrid}>
            <div className={styles.houseItem}>
              <h4>2nd House</h4>
              <p>{analysis.keyPlacements.secondHouse}</p>
            </div>
            <div className={styles.houseItem}>
              <h4>6th House</h4>
              <p>{analysis.keyPlacements.sixthHouse}</p>
            </div>
            <div className={styles.houseItem}>
              <h4>10th House</h4>
              <p>{analysis.keyPlacements.tenthHouse}</p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <div className={styles.footer}>
          <p>✨ Generated using real astronomical calculations and traditional astrological principles</p>
        </div>
      </div>
    </div>
  );
};
}