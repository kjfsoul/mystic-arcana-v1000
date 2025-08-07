'use client';
 
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, /* Save, Feather, Scroll, */ Check, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase/client';
import { TarotReading } from '@/lib/tarot/TarotEngine';
import styles from './CosmicJournalEntry.module.css';
interface CosmicJournalEntryProps {
  isOpen: boolean;
  onClose: () => void;
  reading: TarotReading | null;
  cardName?: string;
  cardMeaning?: string;
  question?: string;
}
const writingQuills = [
  { 
    id: 'phoenix', 
    name: 'Phoenix Feather', 
    icon: '🔥', 
    color: 'from-orange-500 to-red-600', 
    description: 'Fiery insights',
    textTransform: 'passionate',
    cursor: 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'32\' height=\'32\' fill=\'%23f97316\'><text y=\'20\' font-size=\'20\'>🔥</text></svg>") 16 16, text'
  },
  { 
    id: 'swan', 
    name: 'Swan Quill', 
    icon: '🦢', 
    color: 'from-blue-400 to-purple-500', 
    description: 'Graceful wisdom',
    textTransform: 'elegant',
    cursor: 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'32\' height=\'32\' fill=\'%2360a5fa\'><text y=\'20\' font-size=\'20\'>🦢</text></svg>") 16 16, text'
  },
  { 
    id: 'eagle', 
    name: 'Eagle Plume', 
    icon: '🦅', 
    color: 'from-yellow-500 to-amber-600', 
    description: 'Soaring vision',
    textTransform: 'bold',
    cursor: 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'32\' height=\'32\' fill=\'%23eab308\'><text y=\'20\' font-size=\'20\'>🦅</text></svg>") 16 16, text'
  },
  { 
    id: 'mystic', 
    name: 'Mystic Ink', 
    icon: '✨', 
    color: 'from-purple-500 to-pink-600', 
    description: 'Magical clarity',
    textTransform: 'mystical',
    cursor: 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'32\' height=\'32\' fill=\'%23a855f7\'><text y=\'20\' font-size=\'20\'>✨</text></svg>") 16 16, text'
  },
];
export const CosmicJournalEntry: React.FC<CosmicJournalEntryProps> = ({
  isOpen,
  onClose,
  reading,
  cardName = 'King of Pentacles',
  cardMeaning = 'Financial success, business acumen, security, leadership',
  question = ''
}) => {
  const { user, isGuest } = useAuth();
  const [selectedQuill, setSelectedQuill] = useState('phoenix');
  const [interpretation, setInterpretation] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [isSaving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // Check authentication status on mount and when user changes
 
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setIsAuthenticated(!!session && !!user && !isGuest);
        setAuthChecked(true);
        
        // Clear any previous errors when auth state changes
        if (session && user && !isGuest) {
          setSaveError(null);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setIsAuthenticated(false);
        setAuthChecked(true);
      }
    };
    checkAuth();
    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session && !!user && !isGuest);
      if (session && user && !isGuest) {
        setSaveError(null);
      }
    });
    return () => {
      subscription.unsubscribe();
    };
  }, [user, isGuest]);
  const handleSave = async () => {
    // Re-check authentication before saving
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session || !user || isGuest) {
      setSaveError('Please sign in to save your reading to the cosmic journal');
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      // Save to journal_entries table
      const journalEntry = {
        user_id: user.id,
        entry_type: 'tarot_reflection',
        content: {
          cardName,
          cardMeaning,
          question,
          interpretation,
          additionalNotes,
          quillStyle: selectedQuill,
          timestamp: new Date().toISOString()
        },
        tags: ['tarot', cardName.toLowerCase().replace(/\s+/g, '-')],
        is_public: false
      };
      const { error: dbError } = await supabase
        .from('journal_entries')
        .insert([journalEntry]);
      if (dbError) {
        console.error('Database error:', dbError);
        setSaveError('Failed to save to cosmic journal. Please try again.');
        return;
      }
      // If there's a full reading, save that too
      if (reading && session.access_token) {
        const response = await fetch('/api/tarot/save-reading', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({
            userId: user.id,
            spreadType: reading.spreadType,
            cards: reading.cards,
            interpretation: interpretation || reading.interpretation,
            question,
            notes: additionalNotes,
            isPublic: false
          })
        });
        if (!response.ok) {
          const errorData = await response.json();
          console.error('API error:', errorData);
          // Don't fail the whole save if just the reading API fails
        }
      }
      setSaveSuccess(true);
      setTimeout(() => {
        onClose();
        // Reset form
        setInterpretation('');
        setAdditionalNotes('');
        setSaveSuccess(false);
      }, 1500);
    } catch (error) {
      console.error('Save error:', error);
      setSaveError('An unexpected error occurred. Please try again.');
    } finally {
      setSaving(false);
    }
  };
  const getQuillStyles = (quillId: string) => {
    const quill = writingQuills.find(q => q.id === quillId);
    if (!quill) return { className: '', style: {} };
    
    const baseStyle = {
      cursor: quill.cursor,
      transition: 'all 0.3s ease',
    };
    
    switch (quillId) {
      case 'phoenix':
        return {
          className: 'text-orange-500',
          style: {
            ...baseStyle,
            fontWeight: 'bold',
            textShadow: '0 0 10px rgba(249, 115, 22, 0.5)',
            fontSize: '1.05em',
            letterSpacing: '0.02em'
          }
        };
      case 'swan':
        return {
          className: 'text-blue-400',
          style: {
            ...baseStyle,
            fontStyle: 'italic',
            fontFamily: 'serif',
            textShadow: '0 0 8px rgba(96, 165, 250, 0.4)',
            lineHeight: '1.7'
          }
        };
      case 'eagle':
        return {
          className: 'text-yellow-500',
          style: {
            ...baseStyle,
            fontWeight: '600',
            textTransform: 'uppercase' as const,
            textShadow: '0 0 12px rgba(234, 179, 8, 0.6)',
            letterSpacing: '0.05em'
          }
        };
      case 'mystic':
        return {
          className: 'text-purple-500',
          style: {
            ...baseStyle,
            fontFamily: 'fantasy',
            textShadow: '0 0 15px rgba(168, 85, 247, 0.7)',
            background: 'linear-gradient(45deg, #a855f7, #ec4899)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontSize: '1.02em'
          }
        };
      default:
        return { className: 'text-gray-400', style: baseStyle };
    }
  };
  if (!isOpen) return null;
  return (
    <AnimatePresence>
      <motion.div
        className={styles.modalOverlay}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className={styles.modalContent}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className={styles.header}>
            <h2 className={styles.title}>✦ COSMIC JOURNAL ENTRY ✦</h2>
            <p className={styles.subtitle}>Preserve this moment of divine insight</p>
            <button onClick={onClose} className={styles.closeButton}>
              <X className="w-5 h-5" />
            </button>
          </div>
          {/* Content */}
          <div className={styles.content}>
            {/* Writing Quill Selection */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Choose Your Writing Quill:</h3>
              <div className={styles.quillGrid}>
                {writingQuills.map((quill) => (
                  <button
                    key={quill.id}
                    onClick={() => setSelectedQuill(quill.id)}
                    className={`${styles.quillOption} ${selectedQuill === quill.id ? styles.quillSelected : ''}`}
                  >
                    <span className={styles.quillIcon}>{quill.icon}</span>
                    <span className={styles.quillName}>{quill.name}</span>
                    {selectedQuill === quill.id && (
                      <Check className={styles.checkIcon} />
                    )}
                  </button>
                ))}
              </div>
            </div>
            {/* Question */}
            {question && (
              <div className={styles.questionSection}>
                <span className={styles.questionLabel}>❓</span>
                <p className={styles.questionText}>{question}</p>
              </div>
            )}
            {/* Sacred Interpretation */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>💜 Your Sacred Interpretation *</h3>
              <div className={styles.textareaWrapper}>
                <textarea
                  value={interpretation}
                  onChange={(e) => setInterpretation(e.target.value)}
                  placeholder="What wisdom does this card reveal to you?"
                  className={`${styles.textarea} ${getQuillStyles(selectedQuill).className}`}
                  style={getQuillStyles(selectedQuill).style}
                  rows={4}
                />
                <span className={styles.quillWatermark}>
                  {writingQuills.find(q => q.id === selectedQuill)?.icon}
                </span>
              </div>
            </div>
            {/* Single Reading Info */}
            <div className={styles.singleReadingInfo}>
              <p className={styles.readingLabel}>⭐ Your single Reading **</p>
              <div className={styles.cardInfo}>
                <strong>{cardName}</strong>
                <p className={styles.cardMeaning}>{cardMeaning}</p>
              </div>
            </div>
            {/* Additional Notes */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>📜 Additional Sacred Notes</h3>
              <div className={styles.textareaWrapper}>
                <textarea
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  placeholder="Any additional thoughts, emotions, or mystical observations..."
                  className={`${styles.textarea} ${getQuillStyles(selectedQuill).className}`}
                  style={getQuillStyles(selectedQuill).style}
                  rows={3}
                />
              </div>
            </div>
            {/* Authentication Warning */}
            {authChecked && !isAuthenticated && (
              <motion.div
                className={styles.authWarning}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <AlertCircle className="w-5 h-5" />
                <p>Authentication required - Please sign in to save your cosmic insights</p>
              </motion.div>
            )}
            {/* Error Message */}
            {saveError && (
              <motion.div
                className={styles.errorMessage}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <AlertCircle className="w-5 h-5" />
                <p>{saveError}</p>
              </motion.div>
            )}
            {/* Success Message */}
            {saveSuccess && (
              <motion.div
                className={styles.successMessage}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <p>✨ Your cosmic wisdom has been preserved in the eternal journal!</p>
              </motion.div>
            )}
            {/* Action Buttons */}
            <div className={styles.actions}>
              <button
                onClick={onClose}
                className={styles.abandonButton}
                disabled={isSaving}
              >
                Abandon Scroll
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving || !isAuthenticated || !interpretation.trim()}
                className={styles.saveButton}
              >
                {isSaving ? (
                  <>
                    <div className={styles.spinner} />
                    <span>Preserving...</span>
                  </>
                ) : (
                  <>
                    <span>🔮 Seal & Preserve</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
