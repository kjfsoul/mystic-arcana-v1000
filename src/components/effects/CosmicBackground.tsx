'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import styles from './CosmicBackground.module.css';

export interface CosmicBackgroundProps {
  intensity?: 'low' | 'medium' | 'high';
  cosmicWeather?: 'calm' | 'mercury-retrograde' | 'full-moon' | 'eclipse' | 'conjunction';
  className?: string;
}

interface Star {
  x: number;
  y: number;
  size: number;
  brightness: number;
  twinkleSpeed: number;
  color: string;
}

interface ShootingStar {
  x: number;
  y: number;
  length: number;
  speed: number;
  angle: number;
  opacity: number;
}

/**
 * Cosmic Background Component - Living animated space environment
 * 
 * Features:
 * - Canvas-based star field with parallax layers
 * - Real-time cosmic weather effects based on astrological events
 * - Shooting stars, nebula clouds, and particle systems
 * - Performance optimized with RequestAnimationFrame
 * - Responsive to user motion preferences
 * - GPU-accelerated where possible
 */
export const CosmicBackground: React.FC<CosmicBackgroundProps> = ({
  intensity = 'medium',
  cosmicWeather = 'calm',
  className = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const shootingStarsRef = useRef<ShootingStar[]>([]);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [stars, setStars] = useState<Star[]>([]);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Check for reduced motion preference
// eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Handle resize
// eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setDimensions({ width, height });
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Get star color based on cosmic weather
// eslint-disable-next-line react-hooks/exhaustive-deps
  const getStarColor = useCallback(() => {
    const colors = {
      calm: ['#ffffff', '#e6d7ff', '#ffd700', '#ff6b9d', '#9c88ff'],
      'mercury-retrograde': ['#ff4757', '#ff6b9d', '#ffa726', '#ffffff'],
      'full-moon': ['#e6d7ff', '#ffffff', '#c5cae9', '#9c88ff'],
      eclipse: ['#1a1a2e', '#16213e', '#0f3460', '#533483'],
      conjunction: ['#ffd700', '#ff6b9d', '#9c88ff', '#ffffff', '#e6d7ff']
    };

    const colorSet = colors[cosmicWeather] || colors.calm;
    return colorSet[Math.floor(Math.random() * colorSet.length)];
  }, [cosmicWeather]);

  // Create shooting star
// eslint-disable-next-line react-hooks/exhaustive-deps
  const createShootingStar = useCallback(() => {
    if (reducedMotion || Math.random() > 0.005) return null;

    return {
      x: Math.random() * dimensions.width,
      y: Math.random() * dimensions.height * 0.3,
      length: Math.random() * 80 + 20,
      speed: Math.random() * 3 + 2,
      angle: Math.random() * Math.PI / 4 + Math.PI / 8,
      opacity: 1
    };
  }, [reducedMotion, dimensions.width, dimensions.height]);

  // Initialize stars
// eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (dimensions.width === 0 || dimensions.height === 0) return;

    const starCount = intensity === 'low' ? 100 : intensity === 'medium' ? 200 : 300;
    const newStars: Star[] = [];

    for (let i = 0; i < starCount; i++) {
      newStars.push({
        x: Math.random() * dimensions.width,
        y: Math.random() * dimensions.height,
        size: Math.random() * 2 + 0.5,
        brightness: Math.random() * 0.8 + 0.2,
        twinkleSpeed: Math.random() * 0.02 + 0.01,
        color: getStarColor()
      });
    }

    setStars(newStars);
  }, [dimensions, intensity, getStarColor]);

  // Animation loop
// eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || dimensions.width === 0 || dimensions.height === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = dimensions.width;
    canvas.height = dimensions.height;

    let time = 0;

    const animate = () => {
      time += 1;

      // Clear canvas with cosmic background
      const gradient = ctx.createRadialGradient(
        dimensions.width / 2, dimensions.height / 2, 0,
        dimensions.width / 2, dimensions.height / 2, dimensions.width
      );

      if (cosmicWeather === 'mercury-retrograde') {
        gradient.addColorStop(0, '#1a0030');
        gradient.addColorStop(0.5, '#330033');
        gradient.addColorStop(1, '#0a0015');
      } else if (cosmicWeather === 'full-moon') {
        gradient.addColorStop(0, '#1e1e3f');
        gradient.addColorStop(0.5, '#2d2d5a');
        gradient.addColorStop(1, '#0a0015');
      } else if (cosmicWeather === 'eclipse') {
        gradient.addColorStop(0, '#000000');
        gradient.addColorStop(0.5, '#1a1a2e');
        gradient.addColorStop(1, '#16213e');
      } else {
        gradient.addColorStop(0, '#0a0015');
        gradient.addColorStop(0.5, '#1a0030');
        gradient.addColorStop(1, '#0f001a');
      }

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, dimensions.width, dimensions.height);

      // Draw stars
      stars.forEach((star) => {
        const twinkle = reducedMotion ? 1 : Math.sin(time * star.twinkleSpeed) * 0.3 + 0.7;
        const alpha = star.brightness * twinkle;

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = star.color;
        ctx.shadowColor = star.color;
        ctx.shadowBlur = star.size * 2;

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Cosmic weather effects on stars
        if (cosmicWeather === 'mercury-retrograde' && !reducedMotion) {
          // Glitch effect
          if (Math.random() < 0.001) {
            star.x += (Math.random() - 0.5) * 5;
            star.y += (Math.random() - 0.5) * 5;
          }
        }
      });

      // Handle shooting stars
      if (!reducedMotion) {
        const newShootingStar = createShootingStar();
        if (newShootingStar) {
          shootingStarsRef.current.push(newShootingStar);
        }

        // Draw and update shooting stars
        shootingStarsRef.current = shootingStarsRef.current.map(star => {
          if (star.opacity <= 0) return null;

          // Draw shooting star
          ctx.save();
          ctx.globalAlpha = star.opacity;
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.shadowColor = '#ffffff';
          ctx.shadowBlur = 10;

          const endX = star.x + Math.cos(star.angle) * star.length;
          const endY = star.y + Math.sin(star.angle) * star.length;

          ctx.beginPath();
          ctx.moveTo(star.x, star.y);
          ctx.lineTo(endX, endY);
          ctx.stroke();
          ctx.restore();

          // Update shooting star
          star.x += Math.cos(star.angle) * star.speed;
          star.y += Math.sin(star.angle) * star.speed;
          star.opacity -= 0.01;

          return star;
        }).filter(Boolean) as ShootingStar[];
      }

      // Nebula effect for certain cosmic weather
      if ((cosmicWeather === 'conjunction' || cosmicWeather === 'full-moon') && !reducedMotion) {
        ctx.save();
        ctx.globalAlpha = 0.1;
        const nebulaGradient = ctx.createRadialGradient(
          dimensions.width * 0.3, dimensions.height * 0.4, 0,
          dimensions.width * 0.3, dimensions.height * 0.4, dimensions.width * 0.4
        );
        nebulaGradient.addColorStop(0, '#ff6b9d');
        nebulaGradient.addColorStop(0.5, '#9c88ff');
        nebulaGradient.addColorStop(1, 'transparent');

        ctx.fillStyle = nebulaGradient;
        ctx.fillRect(0, 0, dimensions.width, dimensions.height);
        ctx.restore();
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [dimensions, stars, cosmicWeather, reducedMotion, createShootingStar]);

  return (
    <div className={`${styles.container} ${className}`}>
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        aria-hidden="true"
        style={{
          width: dimensions.width,
          height: dimensions.height
        }}
      />

      {/* CSS-based fallback for reduced motion */}
      {reducedMotion && (
        <div className={styles.staticBackground}>
          <div className={styles.staticStars} />
          <div className={styles.staticGradient} />
        </div>
      )}

      {/* Cosmic weather indicator */}
      <div className={styles.weatherOverlay} data-weather={cosmicWeather}>
        {cosmicWeather === 'mercury-retrograde' && (
          <div className={styles.retrogradeEffect} />
        )}
        {cosmicWeather === 'full-moon' && (
          <div className={styles.moonGlow} />
        )}
        {cosmicWeather === 'eclipse' && (
          <div className={styles.eclipseRing} />
        )}
        {cosmicWeather === 'conjunction' && (
          <div className={styles.conjunctionAura} />
        )}
      </div>
    </div>
  );
};