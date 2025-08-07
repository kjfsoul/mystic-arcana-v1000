'use client';
/* eslint-disable @typescript-eslint/no-unused-vars */
 
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EnhancedTarotPanel } from './EnhancedTarotPanel';
import { SpreadType } from './EnhancedTarotSpreadLayouts';
import { TarotCard } from '@/types/tarot';
import { Share2, Download, MessageCircle, Heart } from 'lucide-react';
interface MobileTarotReaderProps {
  embedMode?: boolean; // For TikTok/Instagram embeds
  showSocialActions?: boolean;
  onShare?: (cards: TarotCard[], image: string) => void;
  className?: string;
}
export const MobileTarotReader: React.FC<MobileTarotReaderProps> = ({
  embedMode = false,
  showSocialActions = true,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onShare,
  className = ''
}) => {
  const [currentReading, setCurrentReading] = useState<{
    cards: TarotCard[];
    interpretation: string;
    timestamp: Date;
  } | null>(null);
  const [showSharePanel, setShowSharePanel] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isPortrait, setIsPortrait] = useState(true);
  // Detect orientation changes
 
  useEffect(() => {
    const checkOrientation = () => {
      setIsPortrait(window.innerHeight > window.innerWidth);
    };
    checkOrientation();
    window.addEventListener('orientationchange', checkOrientation);
    window.addEventListener('resize', checkOrientation);
    return () => {
      window.removeEventListener('orientationchange', checkOrientation);
      window.removeEventListener('resize', checkOrientation);
    };
  }, []);
  // Handle reading completion
  const handleReadingComplete = (cards: TarotCard[], interpretation: string) => {
    setCurrentReading({
      cards,
      interpretation,
      timestamp: new Date()
    });
  };
  // Generate shareable content
  const generateShareContent = () => {
    if (!currentReading) return '';
    
    const cardNames = currentReading.cards.map(card => card.name).join(', ');
    return `🔮 My Mystic Arcana reading: ${cardNames}\n\n✨ Get your cosmic guidance at mysticarcana.com\n\n#TarotReading #Mystical #CosmicGuidance`;
  };
  // Share functionality
  const handleShare = async () => {
    if (!currentReading) return;
    const shareData = {
      title: '🔮 My Mystic Arcana Reading',
      text: generateShareContent(),
      url: window.location.href
    };
    try {
      if (navigator.share && navigator.canShare?.(shareData)) {
        await navigator.share(shareData);
      } else {
        // Fallback: Copy to clipboard
        await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
        
        // Show success feedback
        setShowSharePanel(false);
        // You could add a toast notification here
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };
  // Download reading as image (for social media)
  const handleDownload = async () => {
    if (!currentReading) return;
    try {
      // This would generate an image of the reading
      // For now, we'll trigger the browser's save functionality
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        canvas.width = 1080; // Instagram square format
        canvas.height = 1080;
        
        // Create gradient background
        const gradient = ctx.createRadialGradient(540, 540, 0, 540, 540, 540);
        gradient.addColorStop(0, '#1e1b4b');
        gradient.addColorStop(0.5, '#312e81');
        gradient.addColorStop(1, '#1e1b4b');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 1080, 1080);
        
        // Add reading info
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('🔮 Mystic Arcana Reading', 540, 100);
        
        ctx.font = '32px Arial';
        ctx.fillStyle = '#a855f7';
        
        currentReading.cards.forEach((card, index) => {
          ctx.fillText(card.name, 540, 200 + (index * 50));
        });
        
        // Convert to blob and download
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `mystic-arcana-reading-${Date.now()}.png`;
            link.click();
            URL.revokeObjectURL(url);
          }
        });
      }
    } catch (error) {
      console.error('Error generating image:', error);
    }
  };
  return (
    <div className={`relative w-full min-h-screen ${className}`}>
      {/* Main tarot panel optimized for mobile */}
      <EnhancedTarotPanel
        initialSpreadType="three-card"
        showDeckSelection={!embedMode}
        socialMediaMode={embedMode}
        onReadingComplete={handleReadingComplete}
        className="w-full"
      />
      {/* Social media actions */}
      <AnimatePresence>
        {showSocialActions && currentReading && !embedMode && (
          <motion.div
            className="fixed bottom-4 right-4 z-50"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            <motion.button
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 rounded-full shadow-lg shadow-purple-500/25"
              onClick={() => setShowSharePanel(true)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              style={{
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}
            >
              <Share2 className="w-6 h-6" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Share panel */}
      <AnimatePresence>
        {showSharePanel && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowSharePanel(false)}
          >
            <motion.div
              className="w-full bg-white dark:bg-gray-900 rounded-t-3xl p-6 space-y-4"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
              
              <h3 className="text-xl font-semibold text-center text-gray-900 dark:text-white">
                Share Your Reading
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <motion.button
                  className="flex items-center justify-center space-x-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 p-4 rounded-xl"
                  onClick={handleShare}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Share2 className="w-5 h-5" />
                  <span>Share</span>
                </motion.button>
                
                <motion.button
                  className="flex items-center justify-center space-x-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 p-4 rounded-xl"
                  onClick={handleDownload}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Download className="w-5 h-5" />
                  <span>Save</span>
                </motion.button>
              </div>
              
              <div className="text-center">
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                  Share your cosmic insights with friends
                </p>
                
                <div className="flex justify-center space-x-4">
                  <motion.button
                    className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Heart className="w-5 h-5 text-red-500" />
                  </motion.button>
                  
                  <motion.button
                    className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <MessageCircle className="w-5 h-5 text-blue-500" />
                  </motion.button>
                </div>
              </div>
              
              <motion.button
                className="w-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 rounded-xl"
                onClick={() => setShowSharePanel(false)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Cancel
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Embed overlay info */}
      {embedMode && (
        <motion.div
          className="fixed top-4 left-4 right-4 bg-black/60 backdrop-blur-sm rounded-lg p-3 text-center z-40"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          <div className="text-white text-sm font-medium">
            🔮 Mystic Arcana
          </div>
          <div className="text-purple-300 text-xs">
            Get your full cosmic reading at mysticarcana.com
          </div>
        </motion.div>
      )}
      {/* Viewport meta for proper mobile scaling */}
      <style jsx global>{`
        @media (max-width: 768px) {
          body {
            overscroll-behavior: none;
            -webkit-overflow-scrolling: touch;
          }
          
          .tarot-card {
            touch-action: manipulation;
          }
        }
        
        /* Prevent zoom on double tap */
        * {
          touch-action: manipulation;
        }
        
        /* Optimize for portrait orientation */
        @media (orientation: portrait) and (max-width: 768px) {
          .spread-container {
            padding: 1rem;
          }
        }
        
        /* Optimize for landscape on mobile */
        @media (orientation: landscape) and (max-height: 500px) {
          .spread-container {
            padding: 0.5rem;
          }
          
          .card-spacing {
            margin: 0.25rem;
          }
        }
      `}</style>
    </div>
  );
};
