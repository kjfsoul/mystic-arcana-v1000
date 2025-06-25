'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { AuthModal } from '../auth/AuthModal';
import styles from './Header.module.css';

interface HeaderProps {
  onHomeClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onHomeClick }) => {
  const { user, isGuest, signOut, loading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleShowSignIn = () => {
    setAuthMode('signin');
    setShowAuthModal(true);
  };

  const handleShowSignUp = () => {
    setAuthMode('signup');
    setShowAuthModal(true);
  };

  return (
    <>
      <motion.header 
        className={styles.header}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className={styles.headerContent}>
          {/* Logo/Title */}
          {onHomeClick ? (
            <button onClick={onHomeClick} className={styles.logoLink}>
              <div className={styles.logo}>
                <span className={styles.logoText}>✨ Mystic Arcana</span>
              </div>
            </button>
          ) : (
            <Link href="/" className={styles.logoLink}>
              <div className={styles.logo}>
                <span className={styles.logoText}>✨ Mystic Arcana</span>
              </div>
            </Link>
          )}

          {/* Authentication Section */}
          <div className={styles.authSection}>
            {loading ? (
              <div className={styles.loading}>Loading...</div>
            ) : isGuest ? (
              <div className={styles.guestActions}>
                <motion.button
                  className={styles.authButton}
                  onClick={handleShowSignIn}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Sign In
                </motion.button>
                <motion.button
                  className={`${styles.authButton} ${styles.primary}`}
                  onClick={handleShowSignUp}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Sign Up
                </motion.button>
              </div>
            ) : (
              <div className={styles.userActions}>
                <span className={styles.welcomeText}>
                  Welcome, {user?.email?.split('@')[0] || 'Cosmic Traveler'}! ✨
                </span>
                <motion.button
                  className={styles.signOutButton}
                  onClick={handleSignOut}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Sign Out
                </motion.button>
              </div>
            )}
          </div>
        </div>
      </motion.header>

      {/* Authentication Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode={authMode}
      />
    </>
  );
};