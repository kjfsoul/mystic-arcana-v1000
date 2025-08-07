'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, BookOpen } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { TarotReading } from '@/lib/tarot/TarotEngine';
import { TarotService } from '@/services/TarotService';
import { SaveReadingModal } from '@/components/modals/SaveReadingModal';
interface TarotPanelWithSaveModalProps {
  reading: TarotReading | null;
  onReadingComplete?: () => void;
}
export const TarotPanelWithSaveModal: React.FC<TarotPanelWithSaveModalProps> = ({
  reading,
  onReadingComplete: _onReadingComplete
}) => {
  const { user, isGuest } = useAuth();
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [_isSaving, _setSaving] = useState(false);
  const handleSaveReading = async (notes: string, isPublic: boolean) => {
    if (!reading || !user) {
      throw new Error('Cannot save reading without user authentication');
    }
    _setSaving(true);
    
    try {
      // Add notes to the reading
      const readingWithNotes = {
        ...reading,
        notes,
        isPublic,
        tags: ['manual-save', new Date().toISOString().split('T')[0]]
      };
      const { error } = await TarotService.saveReading(readingWithNotes, user.id);
      
      if (error) {
        throw new Error(typeof error === 'string' ? error : 'Failed to save reading');
      }
      // Success - the modal will handle closing itself
    } catch (error) {
      console.error('Save reading error:', error);
      throw error;
    } finally {
      _setSaving(false);
    }
  };
  return (
    <>
      {/* Save Button - Make it prominent and easy to click */}
      {reading && (
        <motion.div
          className="fixed bottom-8 right-8 z-40"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          <button
            onClick={() => setShowSaveModal(true)}
            className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            disabled={isGuest}
          >
            <div className="flex items-center gap-3">
              <Save className="w-6 h-6 text-white" />
              <span className="text-lg font-semibold text-white">Save to Journal</span>
            </div>
            
            {/* Pulse animation to draw attention */}
            <motion.div
              className="absolute inset-0 rounded-full bg-white opacity-20"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </button>
          {/* Guest tooltip */}
          {isGuest && (
            <div className="absolute bottom-full right-0 mb-2 p-3 bg-gray-800 rounded-lg shadow-lg">
              <p className="text-sm text-gray-300 whitespace-nowrap">
                Sign in to save your readings
              </p>
            </div>
          )}
        </motion.div>
      )}
      {/* Alternative inline save button for better visibility */}
      {reading && (
        <div className="mt-8 flex justify-center">
          <button
            onClick={() => setShowSaveModal(true)}
            className="inline-flex items-center gap-3 px-8 py-4 bg-gray-800 hover:bg-gray-700 border-2 border-purple-500 rounded-lg transition-all"
            disabled={isGuest}
          >
            <BookOpen className="w-6 h-6 text-purple-400" />
            <div className="text-left">
              <div className="text-lg font-semibold text-white">Save This Reading</div>
              <div className="text-sm text-gray-400">Preserve your cosmic insights</div>
            </div>
          </button>
        </div>
      )}
      {/* Save Reading Modal */}
      <SaveReadingModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        reading={reading!}
        onSave={handleSaveReading}
      />
    </>
  );
};
// Example of how to integrate in your existing component:
/*
import { TarotPanelWithSaveModal } from './TarotPanelWithSaveModal';
// In your component:
const YourTarotComponent = () => {
  const [currentReading, setCurrentReading] = useState<TarotReading | null>(null);
  
  return (
    <div>
      {/* Your existing tarot UI *}
      
      {/* Add the save functionality *}
      <TarotPanelWithSaveModal 
        reading={currentReading}
        onReadingComplete={() => console.log('Reading saved!')}
      />
    </div>
  );
};
*/
