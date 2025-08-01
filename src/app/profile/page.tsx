'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { profileService } from '../../services/profileService';
import { GalaxyBackground } from '../../components/effects/GalaxyBackground/GalaxyBackground';
import { Header } from '../../components/layout/Header';
import { LocationAutocomplete } from '../../components/common/LocationAutocomplete';
import styles from './page.module.css';

interface UserProfile {
  id?: string;
  user_id: string;
  birth_date: string | null;
  birth_time: string | null;
  birth_location: string | null;
  chosen_reader: string | null;
  preferences: Record<string, unknown>;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const [, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [birthLocation, setBirthLocation] = useState('');
  const [chosenReader, setChosenReader] = useState('');

// eslint-disable-next-line react-hooks/exhaustive-deps
  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const userProfile = await profileService.getProfile(user!.id);
      setProfile(userProfile);
      
      // Populate form fields
      setBirthDate(userProfile.birth_date || '');
      setBirthTime(userProfile.birth_time || '');
      setBirthLocation(userProfile.birth_location || '');
      setChosenReader(userProfile.chosen_reader || '');
    } catch (err) {
      console.error('Error loading profile:', err);
      setError('Failed to load profile. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user]);

// eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (user?.id) {
      loadProfile();
    }
  }, [user, loadProfile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const updatedProfile = await profileService.updateProfile(user.id, {
        birth_date: birthDate || undefined,
        birth_time: birthTime || undefined,
        birth_location: birthLocation || undefined,
        chosen_reader: chosenReader || undefined,
      });

      setProfile(updatedProfile);
      setSuccess('Profile updated successfully! ✨');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className={styles.container}>
        <GalaxyBackground />
        <Header />
        <div className={styles.content}>
          <div className={styles.authRequired}>
            <h1>Profile Access</h1>
            <p>Please sign in to view and edit your profile.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <GalaxyBackground />
      <Header />
      
      <div className={styles.content}>
        <motion.div
          className={styles.profileCard}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className={styles.cardHeader}>
            <h1 className={styles.title}>✨ Your Cosmic Profile</h1>
            <p className={styles.subtitle}>
              Complete your profile to receive personalized cosmic guidance
            </p>
          </div>

          {error && (
            <div className={styles.errorMessage}>
              {error}
            </div>
          )}

          {success && (
            <div className={styles.successMessage}>
              {success}
            </div>
          )}

          {loading ? (
            <div className={styles.loading}>
              <div className={styles.spinner}></div>
              <p>Loading your cosmic profile...</p>
            </div>
          ) : (
            <form onSubmit={handleSave} className={styles.form}>
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>🌟 Birth Information</h2>
                <p className={styles.sectionDescription}>
                  Your birth details allow us to calculate accurate astrological charts and provide personalized readings.
                </p>

                <div className={styles.formGroup}>
                  <label htmlFor="birthDate" className={styles.label}>
                    Birth Date *
                  </label>
                  <input
                    type="date"
                    id="birthDate"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className={styles.input}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="birthTime" className={styles.label}>
                    Birth Time (Optional)
                  </label>
                  <input
                    type="time"
                    id="birthTime"
                    value={birthTime}
                    onChange={(e) => setBirthTime(e.target.value)}
                    className={styles.input}
                  />
                  <small className={styles.hint}>
                    More accurate birth time enables precise rising sign calculations
                  </small>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="birthLocation" className={styles.label}>
                    Birth Location (Optional)
                  </label>
                  <LocationAutocomplete
                    value={birthLocation}
                    onChange={setBirthLocation}
                    placeholder="Start typing your birth city..."
                    className="w-full"
                    onLocationSelect={(location) => {
                      console.log('Selected location:', location);
                      setBirthLocation(location.name);
                    }}
                  />
                  <small className={styles.hint}>
                    Helps calculate precise planetary positions for your birth chart
                  </small>
                </div>
              </div>

              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>🔮 Reading Preferences</h2>
                
                <div className={styles.formGroup}>
                  <label htmlFor="chosenReader" className={styles.label}>
                    Preferred Tarot Reader
                  </label>
                  <select
                    id="chosenReader"
                    value={chosenReader}
                    onChange={(e) => setChosenReader(e.target.value)}
                    className={styles.select}
                  >
                    <option value="">Select a reader...</option>
                    <option value="sophia">Sophia - The Wisdom Keeper</option>
                    <option value="luna">Luna - The Intuitive Guide</option>
                    <option value="sage">Sage - The Ancient Oracle</option>
                    <option value="phoenix">Phoenix - The Transformative Guide</option>
                    <option value="cosmic">Cosmic - The Universal Reader</option>
                  </select>
                  <small className={styles.hint}>
                    Your chosen reader will provide personalized interpretations
                  </small>
                </div>
              </div>

              <div className={styles.actions}>
                <motion.button
                  type="submit"
                  disabled={saving}
                  className={styles.saveButton}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {saving ? (
                    <>
                      <div className={styles.buttonSpinner}></div>
                      Saving...
                    </>
                  ) : (
                    '✨ Save Profile'
                  )}
                </motion.button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
}