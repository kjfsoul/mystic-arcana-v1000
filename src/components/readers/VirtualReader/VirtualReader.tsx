'use client';

import React, { useRef, useEffect, useState } from 'react';
import styles from './VirtualReader.module.css';

interface VirtualReaderProps {
  mood: 'neutral' | 'mystical' | 'contemplative';
  isTyping: boolean;
  onMoodChange: (mood: 'neutral' | 'mystical' | 'contemplative') => void;
  className?: string;
}

/**
 * VirtualReader Component
 * 
 * Animated avatar representing the AI reader with personality expressions.
 * Features mood changes, typing animations, and cosmic particle effects.
 * 
 * Could be enhanced with:
 * - 3D avatar using Three.js or Ready Player Me
 * - Voice synthesis integration
 * - Eye tracking for user engagement
 * - Facial expression mapping to conversation context
 */
export const VirtualReader: React.FC<VirtualReaderProps> = ({
  mood,
  isTyping,
  onMoodChange,
  className = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const [eyeBlinkTimer, setEyeBlinkTimer] = useState(0);

// eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 200;
    canvas.height = 200;

    const drawAvatar = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw cosmic aura based on mood
      const auraColors = {
        neutral: ['rgba(147, 112, 219, 0.3)', 'rgba(138, 43, 226, 0.1)'],
        mystical: ['rgba(255, 215, 0, 0.4)', 'rgba(255, 140, 0, 0.2)'],
        contemplative: ['rgba(75, 0, 130, 0.4)', 'rgba(25, 25, 112, 0.2)']
      };

      const gradient = ctx.createRadialGradient(100, 100, 30, 100, 100, 80);
      gradient.addColorStop(0, auraColors[mood][0]);
      gradient.addColorStop(1, auraColors[mood][1]);

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw face outline
      ctx.strokeStyle = '#9370DB';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(100, 100, 60, 0, Math.PI * 2);
      ctx.stroke();

      // Draw eyes
      const eyeY = 85;
      const leftEyeX = 85;
      const rightEyeX = 115;
      const eyeSize = eyeBlinkTimer > 0 ? 2 : 8;

      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      ctx.arc(leftEyeX, eyeY, eyeSize, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(rightEyeX, eyeY, eyeSize, 0, Math.PI * 2);
      ctx.fill();

      // Draw mouth based on mood
      ctx.strokeStyle = '#9370DB';
      ctx.lineWidth = 2;
      ctx.beginPath();

      if (mood === 'mystical') {
        // Slight smile
        ctx.arc(100, 115, 15, 0.2, Math.PI - 0.2);
      } else if (mood === 'contemplative') {
        // Neutral line
        ctx.moveTo(90, 120);
        ctx.lineTo(110, 120);
      } else {
        // Gentle curve
        ctx.arc(100, 110, 20, 0.3, Math.PI - 0.3);
      }
      ctx.stroke();

      // Typing indicator particles
      if (isTyping) {
        const time = Date.now() * 0.005;
        for (let i = 0; i < 3; i++) {
          const x = 100 + Math.sin(time + i * 0.5) * 10;
          const y = 140 + Math.cos(time + i * 0.8) * 5;
          const alpha = 0.5 + Math.sin(time + i) * 0.3;

          ctx.fillStyle = `rgba(255, 215, 0, ${alpha})`;
          ctx.beginPath();
          ctx.arc(x, y, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Random eye blink
      if (Math.random() < 0.01) {
        setEyeBlinkTimer(10);
      }
      if (eyeBlinkTimer > 0) {
        setEyeBlinkTimer(prev => prev - 1);
      }
    };

    const animate = () => {
      drawAvatar();
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [mood, isTyping, eyeBlinkTimer]);

  return (
    <div className={`${styles.virtualReader} ${className}`}>
      <div className={styles.avatarContainer}>
        <canvas
          ref={canvasRef}
          className={styles.avatarCanvas}
          aria-label="Virtual reader avatar showing current mood and activity"
        />

        {/* Mood indicators */}
        <div className={styles.moodIndicators}>
          <button
            onClick={() => onMoodChange('neutral')}
            className={`${styles.moodButton} ${mood === 'neutral' ? styles.active : ''}`}
            aria-label="Set reader to neutral mood"
            title="Neutral"
          >
            ⚪
          </button>
          <button
            onClick={() => onMoodChange('mystical')}
            className={`${styles.moodButton} ${mood === 'mystical' ? styles.active : ''}`}
            aria-label="Set reader to mystical mood"
            title="Mystical"
          >
            ✨
          </button>
          <button
            onClick={() => onMoodChange('contemplative')}
            className={`${styles.moodButton} ${mood === 'contemplative' ? styles.active : ''}`}
            aria-label="Set reader to contemplative mood"
            title="Contemplative"
          >
            🔮
          </button>
        </div>
      </div>

      {/* Reader name and title */}
      <div className={styles.readerInfo}>
        <h3 className={styles.readerName}>Celestia</h3>
        <p className={styles.readerTitle}>Cosmic Oracle</p>
        <div className={styles.energyLevel}>
          <span>Energy Level: </span>
          <div className={styles.energyBar}>
            <div
              className={styles.energyFill}
              style={{
                width: mood === 'mystical' ? '90%' : mood === 'contemplative' ? '70%' : '50%'
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};