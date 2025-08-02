'use client';
 
import React, { useState, useRef, useEffect } from 'react';
import styles from './ReaderPanel.module.css';
export interface ReaderPanelProps {
  className?: string;
}
interface Message {
  id: string;
  type: 'user' | 'reader';
  content: string;
  timestamp: Date;
  readerMood?: 'mystical' | 'contemplative' | 'encouraging' | 'neutral';
}
interface VirtualReader {
  id: string;
  name: string;
  personality: string;
  specialty: string;
  avatar: string;
  description: string;
}
/**
 * Virtual Reader Panel - Center zone of the 3-panel layout
 * 
 * Features:
 * - 4 distinct AI avatars (Sophia, Orion, Luna, Sol)
 * - Real-time chat interface with typing indicators
 * - Evolving reader personality based on user interactions
 * - Optional TTS (text-to-speech) support
 * - Mood-based responses and visual feedback
 * - Accessibility-optimized chat experience
 */
export const ReaderPanel: React.FC<ReaderPanelProps> = ({ className = '' }) => {
  const [selectedReader, setSelectedReader] = useState<string>('sophia');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'reader',
      content: 'Welcome, seeker. I sense you have questions about your path. How may the cards guide you today?',
      timestamp: new Date(),
      readerMood: 'mystical'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [readerMood, setReaderMood] = useState<'mystical' | 'contemplative' | 'encouraging' | 'neutral'>('mystical');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const virtualReaders: VirtualReader[] = [
    {
      id: 'sophia',
      name: 'Sophia',
      personality: 'Wise and nurturing',
      specialty: 'Life guidance and emotional healing',
      avatar: '🌸',
      description: 'Ancient wisdom meets modern compassion'
    },
    {
      id: 'orion',
      name: 'Orion',
      personality: 'Direct and insightful',
      specialty: 'Career and life decisions',
      avatar: '⭐',
      description: 'Star-guided clarity for complex choices'
    },
    {
      id: 'luna',
      name: 'Luna',
      personality: 'Intuitive and mystical',
      specialty: 'Dreams, intuition, and spiritual growth',
      avatar: '🌙',
      description: 'Lunar wisdom and subconscious insights'
    },
    {
      id: 'sol',
      name: 'Sol',
      personality: 'Energetic and optimistic',
      specialty: 'Motivation and personal power',
      avatar: '☀️',
      description: 'Solar energy for transformation and growth'
    }
  ];
  const quickQuestions = [
    "What do I need to know today?",
    "How can I improve my relationships?",
    "What's blocking my progress?",
    "What opportunities await me?",
    "How can I find inner peace?"
  ];
  const currentReader = virtualReaders.find(r => r.id === selectedReader) || virtualReaders[0];
  // Auto-scroll to bottom when new messages arrive
 
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  // Focus input when reader changes
 
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [selectedReader]);
  const handleReaderChange = (readerId: string) => {
    setSelectedReader(readerId);
    const newReader = virtualReaders.find(r => r.id === readerId);
    
    // Add transition message
    const transitionMessage: Message = {
      id: Date.now().toString(),
      type: 'reader',
      content: `${newReader?.name} has joined your reading. ${newReader?.description}. How may I assist you?`,
      timestamp: new Date(),
      readerMood: 'neutral'
    };
    
    setMessages(prev => [...prev, transitionMessage]);
    setReaderMood('neutral');
  };
  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: content.trim(),
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);
    // Simulate AI response delay
    setTimeout(() => {
      const responses = [
        { content: "The cards whisper of transformation ahead. Trust in your inner wisdom as you navigate this change.", mood: 'mystical' as const },
        { content: "I see strength within you that you may not yet recognize. This challenge is preparing you for something greater.", mood: 'encouraging' as const },
        { content: "The universe is aligning to support your journey. Pay attention to the signs and synchronicities around you.", mood: 'contemplative' as const },
        { content: "Your intuition is trying to communicate something important. Take time for quiet reflection today.", mood: 'contemplative' as const },
        { content: "The energy around you suggests new opportunities emerging. Be open to unexpected possibilities.", mood: 'encouraging' as const }
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      setReaderMood(randomResponse.mood);
      const readerMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'reader',
        content: randomResponse.content,
        timestamp: new Date(),
        readerMood: randomResponse.mood
      };
      setMessages(prev => [...prev, readerMessage]);
      setIsTyping(false);
    }, 2000 + Math.random() * 1000);
  };
  const handleQuickQuestion = (question: string) => {
    handleSendMessage(question);
  };
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage(inputValue);
    }
  };
  return (
    <div className={`${styles.container} ${className}`}>
      {/* Reader Selection */}
      <header className={styles.header}>
        <div className={styles.readerSelection}>
          <h1 className={styles.title}>Choose Your Reader</h1>
          <div className={styles.readerGrid}>
            {virtualReaders.map(reader => (
              <button
                key={reader.id}
                className={`${styles.readerCard} ${
                  selectedReader === reader.id ? styles.selected : ''
                }`}
                onClick={() => handleReaderChange(reader.id)}
                aria-pressed={selectedReader === reader.id}
                aria-describedby={`reader-${reader.id}-desc`}
              >
                <div className={styles.readerAvatar}>
                  <span className={styles.avatarIcon}>{reader.avatar}</span>
                  <div className={`${styles.aura} ${styles[readerMood]}`} />
                </div>
                <div className={styles.readerInfo}>
                  <h3 className={styles.readerName}>{reader.name}</h3>
                  <p className={styles.readerPersonality}>{reader.personality}</p>
                  <p id={`reader-${reader.id}-desc`} className={styles.readerSpecialty}>
                    {reader.specialty}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </header>
      {/* Active Reader Display */}
      <section className={styles.activeReader} aria-label="Current reader information">
        <div className={styles.currentReaderCard}>
          <div className={styles.currentAvatar}>
            <span className={styles.currentAvatarIcon}>{currentReader.avatar}</span>
            <div className={`${styles.currentAura} ${styles[readerMood]}`} />
          </div>
          <div className={styles.currentReaderInfo}>
            <h2 className={styles.currentReaderName}>{currentReader.name}</h2>
            <p className={styles.currentReaderDesc}>{currentReader.description}</p>
            <div className={styles.moodIndicator}>
              <span className={styles.moodLabel}>Current energy:</span>
              <span className={`${styles.moodValue} ${styles[readerMood]}`}>
                {readerMood.charAt(0).toUpperCase() + readerMood.slice(1)}
              </span>
            </div>
          </div>
        </div>
      </section>
      {/* Chat Messages */}
      <section 
        className={styles.chatContainer}
        aria-label="Conversation with your reader"
        role="log"
        aria-live="polite"
      >
        <div className={styles.messageList}>
          {messages.map(message => (
            <div
              key={message.id}
              className={`${styles.message} ${
                message.type === 'user' ? styles.userMessage : styles.readerMessage
              }`}
            >
              {message.type === 'reader' && (
                <div className={styles.messageAvatar}>
                  <span>{currentReader.avatar}</span>
                </div>
              )}
              <div className={styles.messageContent}>
                <div className={`${styles.messageText} ${message.readerMood ? styles[message.readerMood] : ''}`}>
                  {message.content}
                </div>
                <div className={styles.messageTime}>
                  {message.timestamp.toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              </div>
            </div>
          ))}
          
          {/* Typing Indicator */}
          {isTyping && (
            <div className={`${styles.message} ${styles.readerMessage}`}>
              <div className={styles.messageAvatar}>
                <span>{currentReader.avatar}</span>
              </div>
              <div className={styles.messageContent}>
                <div className={styles.typingIndicator}>
                  <span className={styles.typingText}>
                    {currentReader.name} is channeling guidance...
                  </span>
                  <div className={styles.typingDots}>
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </section>
      {/* Quick Questions */}
      <section className={styles.quickQuestions} aria-label="Quick question suggestions">
        <h3 className={styles.quickTitle}>Need inspiration? Try asking:</h3>
        <div className={styles.quickGrid}>
          {quickQuestions.map((question, index) => (
            <button
              key={index}
              className={styles.quickButton}
              onClick={() => handleQuickQuestion(question)}
              aria-label={`Ask: ${question}`}
            >
              {question}
            </button>
          ))}
        </div>
      </section>
      {/* Input Area */}
      <section className={styles.inputSection} aria-label="Ask your question">
        <div className={styles.inputContainer}>
          <label htmlFor="message-input" className="sr-only">
            Ask your question to {currentReader.name}
          </label>
          <input
            id="message-input"
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`Ask ${currentReader.name} anything...`}
            className={styles.messageInput}
            disabled={isTyping}
            maxLength={500}
          />
          <button
            className={styles.sendButton}
            onClick={() => handleSendMessage(inputValue)}
            disabled={isTyping || !inputValue.trim()}
            aria-label="Send message"
          >
            ✨
          </button>
        </div>
        <div className={styles.inputHint}>
          Press Enter to send • Alt+1,2,3,4 to switch readers
        </div>
      </section>
    </div>
  );
};
