'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { AuthModal } from '@/components/auth/AuthModal';
import Link from 'next/link';
import styles from './page.module.css';

interface ReadingRecord {
  id: string;
  spread_type: string;
  cards_drawn: {
    cards?: Array<{
      id: string;
      name: string;
      isReversed?: boolean;
    }>;
    positions?: string[];
  };
  created_at: string;
}

export default function ReadingsPage() {
  const { user, isGuest } = useAuth();
  const router = useRouter();
  const [readings, setReadings] = useState<ReadingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);

// eslint-disable-next-line react-hooks/exhaustive-deps
  const loadReadings = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('tarot_readings')
        .select('id, spread_type, cards_drawn, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading readings:', error);
      } else {
        setReadings(data || []);
      }
    } catch (err) {
      console.error('Failed to load readings:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

// eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (isGuest) {
      setShowAuthModal(true);
      return;
    }
    loadReadings();
  }, [user, isGuest, loadReadings]);

  const formatSpreadType = (spreadType: string) => {
    const types = {
      'single': 'Single Card',
      'three-card': 'Three Card Spread',
      'celtic-cross': 'Celtic Cross'
    };
    return types[spreadType as keyof typeof types] || spreadType;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isGuest) {
    return (
      <>
        <div className={styles.guestContainer}>
          <motion.div
            className={styles.guestMessage}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1>Your Reading History</h1>
            <p>Sign in to view your past tarot readings and insights.</p>
            <button
              onClick={() => setShowAuthModal(true)}
              className={styles.signInButton}
            >
              Sign In to View Readings
            </button>
            <Link href="/" className={styles.backLink}>
              ← Back to Home
            </Link>
          </motion.div>
        </div>
        
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => {
            setShowAuthModal(false);
            router.push('/');
          }}
          mode="signin"
          title="Sign in to view your readings"
          subtitle="Access your personal tarot history"
        />
      </>
    );
  }

  return (
    <div className={styles.container}>
      <motion.div
        className={styles.header}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1>Your Reading History</h1>
        <p>Explore your journey through the cards</p>
        <Link href="/" className={styles.backLink}>
          ← Back to Home
        </Link>
      </motion.div>

      {loading ? (
        <div className={styles.loading}>
          <motion.div
            className={styles.loadingSpinner}
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            🔮
          </motion.div>
          <p>Loading your readings...</p>
        </div>
      ) : readings.length === 0 ? (
        <motion.div
          className={styles.emptyState}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className={styles.emptyIcon}>🌟</div>
          <h2>No readings yet</h2>
          <p>Your tarot journey awaits. Start your first reading to begin exploring the wisdom of the cards.</p>
          <Link href="/" className={styles.startReadingButton}>
            Start Your First Reading
          </Link>
        </motion.div>
      ) : (
        <motion.div
          className={styles.readingsGrid}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {readings.map((reading, index) => (
            <motion.div
              key={reading.id}
              className={styles.readingCard}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className={styles.readingHeader}>
                <h3>{formatSpreadType(reading.spread_type)}</h3>
                <span className={styles.readingDate}>
                  {formatDate(reading.created_at)}
                </span>
              </div>
              
              <div className={styles.cardsPreview}>
                {(reading.cards_drawn?.cards || []).slice(0, 3).map((card, cardIndex) => (
                  <div
                    key={cardIndex}
                    className={`${styles.cardPreview} ${card.isReversed ? styles.reversed : ''}`}
                  >
                    <span className={styles.cardName}>{card.name}</span>
                    {card.isReversed && (
                      <span className={styles.reversedLabel}>Reversed</span>
                    )}
                  </div>
                ))}
                {(reading.cards_drawn?.cards || []).length > 3 && (
                  <div className={styles.moreCards}>
                    +{(reading.cards_drawn?.cards || []).length - 3} more
                  </div>
                )}
              </div>
              
              <div className={styles.readingStats}>
                <span>{(reading.cards_drawn?.cards || []).length} cards drawn</span>
                <span>•</span>
                <span>{(reading.cards_drawn?.cards || []).filter(c => c.isReversed).length} reversed</span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
