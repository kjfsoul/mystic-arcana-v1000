'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Feather, Scroll, Check } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { TarotReading } from '@/lib/tarot/TarotEngine';

interface SaveReadingModalProps {
  isOpen: boolean;
  onClose: () => void;
  reading: TarotReading;
  onSave: (notes: string, isPublic: boolean) => Promise<void>;
}

const quillStyles = [
  { name: 'Classic', icon: '🪶', color: 'from-gray-600 to-gray-800' },
  { name: 'Phoenix', icon: '🔥', color: 'from-orange-500 to-red-600' },
  { name: 'Mystic', icon: '✨', color: 'from-purple-500 to-pink-600' },
  { name: 'Ocean', icon: '🌊', color: 'from-blue-500 to-teal-600' },
];

const scrollStyles = [
  { name: 'Ancient', icon: '📜', texture: 'bg-gradient-to-br from-yellow-100 to-amber-200' },
  { name: 'Starlight', icon: '⭐', texture: 'bg-gradient-to-br from-indigo-100 to-purple-200' },
  { name: 'Moon', icon: '🌙', texture: 'bg-gradient-to-br from-gray-100 to-blue-200' },
  { name: 'Rose', icon: '🌹', texture: 'bg-gradient-to-br from-pink-100 to-rose-200' },
];

export const SaveReadingModal: React.FC<SaveReadingModalProps> = ({
  isOpen,
  onClose,
  reading,
  onSave
}) => {
  const { user } = useAuth();
  const [notes, setNotes] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [selectedQuill, setSelectedQuill] = useState(0);
  const [selectedScroll, setSelectedScroll] = useState(0);
  const [isSaving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = async () => {
    if (!user) {
      setSaveError('Please sign in to save your reading');
      return;
    }

    setSaving(true);
    setSaveError(null);

    try {
      await onSave(notes, isPublic);
      setSaveSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Save error:', error);
      setSaveError(error instanceof Error ? error.message : 'Failed to save reading');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="relative w-full max-w-2xl bg-gray-900 rounded-2xl shadow-2xl overflow-hidden"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', damping: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative p-6 bg-gradient-to-r from-purple-600 to-indigo-600">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
            
            <h2 className="text-2xl font-bold text-white mb-2">Save Your Reading</h2>
            <p className="text-purple-100">Preserve this moment of cosmic wisdom in your personal journal</p>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Scroll Style Selection */}
            <div>
              <h3 className="text-lg font-semibold text-purple-300 mb-3 flex items-center gap-2">
                <Scroll className="w-5 h-5" />
                Choose Your Scroll
              </h3>
              <div className="grid grid-cols-4 gap-3">
                {scrollStyles.map((style, index) => (
                  <button
                    key={style.name}
                    onClick={() => setSelectedScroll(index)}
                    className={`relative p-4 rounded-lg border-2 transition-all ${
                      selectedScroll === index 
                        ? 'border-purple-400 shadow-lg shadow-purple-400/30' 
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <div className={`w-full h-20 rounded ${style.texture} mb-2 flex items-center justify-center text-3xl`}>
                      {style.icon}
                    </div>
                    <span className="text-xs text-gray-300">{style.name}</span>
                    {selectedScroll === index && (
                      <motion.div
                        className="absolute top-1 right-1"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                      >
                        <Check className="w-4 h-4 text-purple-400" />
                      </motion.div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Quill Style Selection */}
            <div>
              <h3 className="text-lg font-semibold text-purple-300 mb-3 flex items-center gap-2">
                <Feather className="w-5 h-5" />
                Select Your Quill
              </h3>
              <div className="grid grid-cols-4 gap-3">
                {quillStyles.map((style, index) => (
                  <button
                    key={style.name}
                    onClick={() => setSelectedQuill(index)}
                    className={`relative p-4 rounded-lg border-2 transition-all ${
                      selectedQuill === index 
                        ? 'border-purple-400 shadow-lg shadow-purple-400/30' 
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <div className={`w-full h-20 rounded bg-gradient-to-br ${style.color} mb-2 flex items-center justify-center text-3xl`}>
                      {style.icon}
                    </div>
                    <span className="text-xs text-gray-300">{style.name}</span>
                    {selectedQuill === index && (
                      <motion.div
                        className="absolute top-1 right-1"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                      >
                        <Check className="w-4 h-4 text-purple-400" />
                      </motion.div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes Section */}
            <div>
              <h3 className="text-lg font-semibold text-purple-300 mb-3">Personal Reflections</h3>
              <div className={`relative rounded-lg ${scrollStyles[selectedScroll].texture} p-1`}>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Write your thoughts, feelings, and insights about this reading..."
                  className="w-full h-32 p-4 bg-gray-900/90 rounded-lg resize-none text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  style={{
                    backgroundImage: `linear-gradient(to right, transparent 0%, transparent 2%, rgba(255,255,255,0.05) 2%, rgba(255,255,255,0.05) 2.5%, transparent 2.5%)`,
                    backgroundSize: '100% 1.5rem',
                    lineHeight: '1.5rem'
                  }}
                />
                <div className="absolute bottom-3 right-3 text-4xl opacity-50">
                  {quillStyles[selectedQuill].icon}
                </div>
              </div>
            </div>

            {/* Privacy Toggle */}
            <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-200">Share with Community</h4>
                <p className="text-sm text-gray-400">Allow others to find inspiration in your reading</p>
              </div>
              <button
                onClick={() => setIsPublic(!isPublic)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  isPublic ? 'bg-purple-600' : 'bg-gray-600'
                }`}
              >
                <motion.div
                  className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full"
                  animate={{ x: isPublic ? 24 : 0 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                />
              </button>
            </div>

            {/* Error Message */}
            {saveError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg"
              >
                <p className="text-red-400 text-sm">{saveError}</p>
              </motion.div>
            )}

            {/* Success Message */}
            {saveSuccess && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 bg-green-500/20 border border-green-500/50 rounded-lg"
              >
                <p className="text-green-400 text-center">✨ Reading saved to your journal!</p>
              </motion.div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                disabled={isSaving}
                className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving || !user}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Save to Journal
                  </>
                )}
              </button>
            </div>

            {!user && (
              <p className="text-center text-sm text-gray-400">
                Please <button onClick={() => {/* trigger auth modal */}} className="text-purple-400 hover:text-purple-300 underline">sign in</button> to save your readings
              </p>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};