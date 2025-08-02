'use client';
import React, { useState } from 'react';
import { TarotReading } from '@/lib/tarot/TarotEngine';
import { SaveReadingModal } from '@/components/modals/SaveReadingModal';
import { TarotService } from '@/services/TarotService';
import { useAuth } from '@/contexts/AuthContext';
// Test page to demonstrate the save reading functionality
export default function TestSaveReadingPage() {
  const { user } = useAuth();
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string>('');
  // Mock reading for testing
  const mockReading: TarotReading = {
    id: 'test-reading-123',
    spreadType: 'three-card',
    isGuest: false,
    cards: [
      {
        id: 'fool',
        name: 'The Fool',
        arcana: 'major' as const,
        meaning: {
          upright: 'New beginnings, innocence, spontaneity',
          reversed: 'Recklessness, naivity, foolishness',
          keywords: ['new beginnings', 'innocence', 'spontaneity']
        },
        frontImage: '/tarot/deck-rider-waite/0-the-fool.jpg',
        backImage: '/tarot/card-back.jpg',
        description: 'The card of new beginnings and infinite potential',
        position: 'upright'
      },
      {
        id: 'magician',
        name: 'The Magician',
        arcana: 'major' as const,
        meaning: {
          upright: 'Manifestation, resourcefulness, power',
          reversed: 'Manipulation, poor planning, untapped talents',
          keywords: ['manifestation', 'resourcefulness', 'power']
        },
        frontImage: '/tarot/deck-rider-waite/1-the-magician.jpg',
        backImage: '/tarot/card-back.jpg',
        description: 'The card of manifestation and willpower',
        position: 'upright'
      },
      {
        id: 'high-priestess',
        name: 'The High Priestess',
        arcana: 'major' as const,
        meaning: {
          upright: 'Intuition, sacred knowledge, divine feminine',
          reversed: 'Secrets, disconnected from intuition',
          keywords: ['intuition', 'sacred knowledge', 'divine feminine']
        },
        frontImage: '/tarot/deck-rider-waite/2-the-high-priestess.jpg',
        backImage: '/tarot/card-back.jpg',
        description: 'The card of intuition and hidden knowledge',
        position: 'reversed'
      }
    ],
    positions: ['Past', 'Present', 'Future'],
    interpretation: 'This reading suggests a journey from innocence to mastery, guided by intuition. The Fool represents your past state of openness and new beginnings. The Magician in the present position shows you are now harnessing your power and manifesting your desires. The High Priestess in the future indicates that deeper spiritual wisdom and intuitive understanding await you.',
    question: 'What does my spiritual journey look like?',
    timestamp: new Date(),
    cosmicInfluence: {
      moonPhase: 'Waxing Crescent',
      planetaryHour: 'Venus'
    }
  };
  const handleSaveReading = async (notes: string, isPublic: boolean) => {
    if (!user) {
      throw new Error('User must be authenticated to save readings');
    }
    setSaveStatus('Saving...');
    
    try {
      // Create a complete reading object with notes
      const readingToSave = {
        ...mockReading,
        notes,
        isPublic
      };
      const { data, error } = await TarotService.saveReading(readingToSave, user.id);
      
      if (error) {
        throw new Error(typeof error === 'string' ? error : 'Failed to save reading');
      }
      setSaveStatus('✅ Reading saved successfully!');
      console.log('Saved reading:', data);
    } catch (error) {
      setSaveStatus(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Test Save Reading Modal</h1>
        
        {/* User Status */}
        <div className="mb-8 p-4 bg-gray-800 rounded-lg">
          <h2 className="text-lg font-semibold text-purple-300 mb-2">Authentication Status</h2>
          {user ? (
            <div className="text-green-400">
              ✅ Logged in as: {user.email}
            </div>
          ) : (
            <div className="text-red-400">
              ❌ Not logged in - Save functionality will show error
            </div>
          )}
        </div>
        {/* Mock Reading Display */}
        <div className="mb-8 p-6 bg-gray-800 rounded-lg">
          <h2 className="text-xl font-semibold text-purple-300 mb-4">Sample Reading</h2>
          <div className="space-y-3">
            <p className="text-gray-300"><strong>Type:</strong> {mockReading.spreadType}</p>
            <p className="text-gray-300"><strong>Question:</strong> {mockReading.question}</p>
            <div>
              <strong className="text-gray-300">Cards:</strong>
              <ul className="mt-2 space-y-1">
                {mockReading.cards.map((card, index) => (
                  <li key={card.id} className="text-gray-400 ml-4">
                    {mockReading.positions[index]}: {card.name}
                  </li>
                ))}
              </ul>
            </div>
            <p className="text-gray-300 mt-4">{mockReading.interpretation}</p>
          </div>
        </div>
        {/* Test Buttons */}
        <div className="space-y-4">
          <button
            onClick={() => setShowSaveModal(true)}
            className="w-full px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-lg text-white font-semibold text-lg transition-all transform hover:scale-105"
          >
            🪶 Open Save Reading Modal
          </button>
          {saveStatus && (
            <div className="p-4 bg-gray-800 rounded-lg">
              <p className="text-center">{saveStatus}</p>
            </div>
          )}
        </div>
        {/* Instructions */}
        <div className="mt-12 p-6 bg-gray-800/50 rounded-lg">
          <h3 className="text-lg font-semibold text-purple-300 mb-3">How to Fix the Issues:</h3>
          <ol className="space-y-3 text-gray-300">
            <li>
              <strong>1. Size Issue Fixed:</strong> The new modal has larger, more accessible buttons and options. Each scroll/quill option is now 120x120px minimum.
            </li>
            <li>
              <strong>2. Visual Feedback:</strong> Selected options now show clear checkmarks and highlighted borders.
            </li>
            <li>
              <strong>3. Authentication Fix:</strong> The TarotService now properly sends the authentication token to the API.
            </li>
            <li>
              <strong>4. Better UX:</strong> Clear error messages, loading states, and success feedback.
            </li>
            <li>
              <strong>5. Mobile Responsive:</strong> The modal adapts to smaller screens automatically.
            </li>
          </ol>
        </div>
      </div>
      {/* Save Reading Modal */}
      <SaveReadingModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        reading={mockReading}
        onSave={handleSaveReading}
      />
    </div>
  );
}
