'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import styles from './AuthModal.module.css';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: 'signin' | 'signup';
  title?: string;
  subtitle?: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  mode: initialMode = 'signin',
  title = 'Welcome to Mystic Arcana',
  subtitle = 'Sign in to unlock your personalized journey'
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  
  // Sync internal mode with prop when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setEmail('');
      setPassword('');
      setBirthDate('');
      setBirthTime('');
      setBirthLocation('');
      setError(null);
    }
  }, [isOpen, initialMode]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [birthLocation, setBirthLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const { signIn, signUp, signInWithGoogle } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (mode === 'signin') {
        const { error } = await signIn(email, password);
        if (error) {
          setError(error.message);
        } else {
          onClose();
        }
      } else {
        // Prepare profile data for signup
        const profileData: Record<string, string> = {};
        if (birthDate) profileData.birth_date = birthDate;
        if (birthTime) profileData.birth_time = birthTime;
        if (birthLocation) profileData.birth_location = birthLocation;
        
        const { data, error } = await signUp(email, password, profileData);
        if (error) {
          setError(error.message);
        } else if (data?.user && !data.session) {
          // Email confirmation required
          setSuccess('Check your email to confirm your account!');
          setEmail('');
          setPassword('');
          setBirthDate('');
          setBirthTime('');
          setBirthLocation('');
        } else if (data?.session) {
          // Auto-logged in after signup
          onClose();
        }
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);

    try {
      const { error } = await signInWithGoogle();
      if (error) {
        setError(error.message);
      }
    } catch {
      setError('Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === 'signin' ? 'signup' : 'signin');
    setError(null);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={styles.backdrop}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => {
            // Only close if clicking the backdrop, not the modal
            if (e.target === e.currentTarget) {
              onClose();
            }
          }}
        >
          {/* Modal */}
          <motion.div
            className={styles.modal}
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className={styles.closeButton}
              onClick={onClose}
              aria-label="Close modal"
            >
              ×
            </button>

            <div className={styles.header}>
              <h2 className={styles.title}>{title}</h2>
              <p className={styles.subtitle}>{subtitle}</p>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.inputGroup}>
                <label htmlFor="email" className={styles.label}>
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={styles.input}
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="password" className={styles.label}>
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={styles.input}
                  placeholder="Enter your password"
                  required
                  minLength={6}
                />
              </div>

              {mode === 'signup' && (
                <>
                  <div className={styles.inputGroup}>
                    <label htmlFor="birthDate" className={styles.label}>
                      Birth Date
                    </label>
                    <input
                      id="birthDate"
                      type="date"
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      className={styles.input}
                      required
                    />
                  </div>

                  <div className={styles.inputGroup}>
                    <label htmlFor="birthTime" className={styles.label}>
                      Birth Time (Optional)
                    </label>
                    <input
                      id="birthTime"
                      type="time"
                      value={birthTime}
                      onChange={(e) => setBirthTime(e.target.value)}
                      className={styles.input}
                    />
                  </div>

                  <div className={styles.inputGroup}>
                    <label htmlFor="birthLocation" className={styles.label}>
                      Birth Location (Optional)
                    </label>
                    <input
                      id="birthLocation"
                      type="text"
                      value={birthLocation}
                      onChange={(e) => setBirthLocation(e.target.value)}
                      className={styles.input}
                      placeholder="City, Country"
                    />
                  </div>
                </>
              )}

              {error && (
                <div className={styles.error} role="alert">
                  {error}
                </div>
              )}

              {success && (
                <div className={styles.success} role="alert">
                  {success}
                </div>
              )}

              <button
                type="submit"
                className={styles.submitButton}
                disabled={loading || !!success}
              >
                {loading ? 'Loading...' : mode === 'signin' ? 'Sign In' : 'Sign Up'}
              </button>
            </form>

            <div className={styles.divider}>
              <span>or</span>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              className={styles.googleButton}
              disabled={loading}
            >
              <span className={styles.googleIcon}>G</span>
              Continue with Google
            </button>

            <div className={styles.footer}>
              {mode === 'signin' ? (
                <>
                  <p>
                    Don&apos;t have an account?{' '}
                    <button
                      type="button"
                      onClick={toggleMode}
                      className={styles.linkButton}
                    >
                      Sign up
                    </button>
                  </p>
                  <p className={styles.forgotPassword}>
                    <a href="/auth/reset-password" className={styles.linkButton}>
                      Forgot your password?
                    </a>
                  </p>
                </>
              ) : (
                <p>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={toggleMode}
                    className={styles.linkButton}
                  >
                    Sign in
                  </button>
                </p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};