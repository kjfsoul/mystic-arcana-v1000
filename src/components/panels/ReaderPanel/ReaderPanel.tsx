'use client';

import React, { useState, useRef, useEffect } from 'react';
import { VirtualReader } from '../../readers/VirtualReader/VirtualReader';
import { ReaderChat } from '../../readers/ReaderChat/ReaderChat';
import { useAccessibility } from '../../../utils/accessibility/useAccessibility';
import styles from './ReaderPanel.module.css';

interface ReaderPanelProps {
  isActive: boolean;
  onActivate: () => void;
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'reader';
  timestamp: Date;
  type?: 'greeting' | 'reading' | 'guidance' | 'cosmic-update';
}

/**
 * ReaderPanel Component
 * 
 * Central panel featuring the virtual reader avatar and chat interface.
 * This is the primary interaction point for users with their chosen reader.
 * 
 * Features:
 * - Animated 3D/2D reader avatar with personality expressions
 * - Real-time chat interface with typing indicators
 * - Voice synthesis options for reader responses
 * - Personalized reader memory and context awareness
 * - Integration with tarot and astrology insights
 */
export const ReaderPanel: React.FC<ReaderPanelProps> = ({ isActive, onActivate }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Welcome, seeker. I sense the cosmic energies aligning for your reading today.',
      sender: 'reader',
      timestamp: new Date(),
      type: 'greeting'
    }
  ]);
  const [isReaderTyping, setIsReaderTyping] = useState(false);
  const [readerMood, setReaderMood] = useState<'neutral' | 'mystical' | 'contemplative'>('mystical');
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { announceToScreenReader } = useAccessibility();

  // Auto-scroll chat to latest message
// eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleUserMessage = async (text: string) => {
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsReaderTyping(true);

    // Simulate reader thinking/typing
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1500));

    // Generate reader response (would connect to AI in production)
    const readerResponse: Message = {
      id: (Date.now() + 1).toString(),
      text: generateReaderResponse(),
      sender: 'reader',
      timestamp: new Date(),
      type: 'guidance'
    };

    setIsReaderTyping(false);
    setMessages(prev => [...prev, readerResponse]);

    // Announce to screen reader
    announceToScreenReader(`Reader says: ${readerResponse.text}`);
  };

  const generateReaderResponse = (): string => {
    // Placeholder for AI response generation
    const responses = [
      'The cards whisper secrets of transformation in your path.',
      'I see celestial alignments bringing clarity to your question.',
      'Your intuition is strong today. Trust what your inner voice reveals.',
      'The universe conspires to guide you toward your highest good.'
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  return (
    <div
      className={`${styles.panel} ${isActive ? styles.active : ''}`}
      onClick={onActivate}
      role="tabpanel"
      aria-label="Virtual reader interaction panel"
    >
      {/* Reader Avatar Section */}
      <div className={styles.readerSection}>
        <VirtualReader
          mood={readerMood}
          isTyping={isReaderTyping}
          onMoodChange={setReaderMood}
        />

        <div className={styles.readerInfo}>
          <h2>Celestia</h2>
          <p className={styles.readerTitle}>Cosmic Oracle & Tarot Guide</p>
          <div className={styles.readerStatus}>
            {isReaderTyping ? (
              <span className={styles.typing}>
                <span className={styles.dot}></span>
                <span className={styles.dot}></span>
                <span className={styles.dot}></span>
                Channeling cosmic wisdom...
              </span>
            ) : (
              <span className={styles.online}>Ready for your reading</span>
            )}
          </div>
        </div>
      </div>

      {/* Chat Interface */}
      <div className={styles.chatSection}>
        <div
          ref={chatContainerRef}
          className={styles.chatContainer}
          role="log"
          aria-label="Conversation with reader"
          aria-live="polite"
        >
          {messages.map(message => (
            <div
              key={message.id}
              className={`${styles.message} ${styles[message.sender]}`}
              aria-label={`${message.sender === 'reader' ? 'Reader' : 'You'} said`}
            >
              <div className={styles.messageContent}>
                <p>{message.text}</p>
                <time className={styles.timestamp}>
                  {message.timestamp.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </time>
              </div>
            </div>
          ))}

          {isReaderTyping && (
            <div className={`${styles.message} ${styles.reader}`}>
              <div className={styles.typingIndicator}>
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}
        </div>

        <ReaderChat
          onSendMessage={handleUserMessage}
          disabled={isReaderTyping}
        />
      </div>
    </div>
  );
};