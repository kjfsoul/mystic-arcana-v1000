
'use client';

import React, { useRef, useEffect } from 'react';
import { StarField } from '../../effects/StarField/StarField';
import { RealStarField } from '../../astronomical/RealStarField/RealStarField';
import { HighPerformanceStarField } from '../../astronomical/HighPerformanceStarField/HighPerformanceStarField';
import { ParticleSystem } from '../../effects/ParticleSystem/ParticleSystem';
import { useGeolocation } from '../../../hooks/useGeolocation';
import styles from './CosmicBackground.module.css';

interface CosmicBackgroundProps {
  className?: string;
  intensity?: 'low' | 'medium' | 'high';
  interactive?: boolean;
  useRealStars?: boolean; // Toggle between real and decorative stars
  useHighPerformance?: boolean; // Use WebGL2 high-performance renderer
}

/**
 * CosmicBackground Component
 *
 * Creates an immersive galaxy/starry-sky background with animated elements.
 * Combines multiple canvas animations for depth.
 *
 * Features:
 * - Parallax star layers with varying depths
 * - Animated nebula clouds with color shifts
 * - Shooting stars and cosmic particles
 * - Interactive mouse/touch effects
 * - Performance-optimized with requestAnimationFrame
 * - Respects user's prefers-reduced-motion settings
 */
export const CosmicBackground: React.FC<CosmicBackgroundProps> = ({
  className = '',
  intensity = 'medium',
  interactive = true,
  useRealStars = false,
  useHighPerformance = false
}) => {
  const { location, loading: locationLoading, error: locationError } = useGeolocation();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const mousePosition = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Nebula gradient colors
    const nebulaColors = [
      { r: 147, g: 112, b: 219 }, // Medium purple
      { r: 138, g: 43, b: 226 },  // Blue violet
      { r: 75, g: 0, b: 130 },    // Indigo
      { r: 255, g: 215, b: 0 },   // Gold accents
    ];

    // Animated nebula clouds
    const drawNebula = (time: number) => {
      ctx.globalAlpha = 0.02;

      const gradient = ctx.createRadialGradient(
        canvas.width * 0.5 + Math.sin(time * 0.0001) * 100,
        canvas.height * 0.5 + Math.cos(time * 0.0001) * 100,
        0,
        canvas.width * 0.5,
        canvas.height * 0.5,
        canvas.width * 0.7
      );

      // Animate gradient colors
      nebulaColors.forEach((color, i) => {
        const offset = i / (nebulaColors.length - 1);
        const alpha = 0.1 + Math.sin(time * 0.0002 + i) * 0.05;
        gradient.addColorStop(
          offset,
          `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`
        );
      });

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    // Shooting stars
    class ShootingStar {
      x: number = 0;
      y: number = 0;
      length: number = 0;
      speed: number = 0;
      angle: number = 0;
      opacity: number = 0;
      fadeSpeed: number = 0;

      constructor(canvasWidth: number, canvasHeight: number) {
        this.reset(canvasWidth, canvasHeight);
      }

      update(canvasWidth: number, canvasHeight: number) {
        // Move and fade the star
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;
        this.opacity -= this.fadeSpeed;

        // Reset when faded out or off screen
        if (
          this.opacity <= 0 ||
          this.x > canvasWidth ||
          this.y > canvasHeight
        ) {
          this.reset(canvasWidth, canvasHeight);
        }
      }

      reset(canvasWidth: number, canvasHeight: number) {
        this.x = Math.random() * canvasWidth;
        this.y = Math.random() * canvasHeight * 0.5;
        this.length = Math.random() * 80 + 20;
        this.speed = Math.random() * 10 + 5;
        this.angle = Math.random() * (Math.PI / 4) + (Math.PI / 4);
        this.opacity = 1;
        this.fadeSpeed = Math.random() * 0.02 + 0.01;
      }

      draw(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(
          this.x - Math.cos(this.angle) * this.length,
          this.y - Math.sin(this.angle) * this.length
        );
        ctx.stroke();
        ctx.restore();
      }
    }

    // Create shooting stars based on intensity
    const shootingStarsCount = intensity === 'high' ? 5 : intensity === 'medium' ? 3 : 1;
    const shootingStars: ShootingStar[] = Array.from(
      { length: shootingStarsCount },
      () => new ShootingStar(canvas.width, canvas.height)
    );

    // Animation loop
    const animate = (time: number) => {
      if (!canvas || !ctx) return;

      // Clear with fade effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw nebula
      drawNebula(time);

      // Draw and update shooting stars
      shootingStars.forEach(star => {
        star.update(canvas.width, canvas.height);
        star.draw(ctx);
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    // Handle mouse movement for interactive effects
    const handleMouseMove = (e: MouseEvent) => {
      if (!interactive) return;
      mousePosition.current = {
        x: e.clientX,
        y: e.clientY
      };
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!prefersReducedMotion) {
      animationRef.current = requestAnimationFrame(animate);
    }

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [intensity, interactive]);

  return (
    <div className={`${styles.cosmicBackground} ${className}`}>
      {/* Conditional star field layer */}
      {useRealStars && location ? (
        useHighPerformance ? (
          <HighPerformanceStarField
            useRealStars={true}
            className={styles.starFieldLayer}
            renderConfig={{
              maxStars: intensity === 'high' ? 100000 : intensity === 'medium' ? 50000 : 25000,
              minMagnitude: intensity === 'high' ? 6.5 : intensity === 'medium' ? 5.5 : 4.5,
              showConstellations: false, // Disabled for performance
              showPlanets: true
            }}
          />
        ) : (
          <RealStarField
            location={location}
            className={styles.starFieldLayer}
            renderConfig={{
              maxStars: intensity === 'high' ? 50000 : intensity === 'medium' ? 25000 : 10000,
              minMagnitude: intensity === 'high' ? 6.5 : intensity === 'medium' ? 5.5 : 4.5,
              showConstellations: true,
              showPlanets: true
            }}
            interactive={interactive}
          />
        )
      ) : (
        <StarField
          density={intensity === 'high' ? 300 : intensity === 'medium' ? 200 : 100}
          className={styles.starFieldLayer}
        />
      )}

      {/* Loading indicator for real stars */}
      {useRealStars && locationLoading && (
        <div className={styles.loadingIndicator}>
          <p>🌍 Getting your location for accurate star positions...</p>
        </div>
      )}

      {/* Error fallback for real stars */}
      {useRealStars && locationError && (
        <div className={styles.errorIndicator}>
          <p>⚠️ Using approximate star positions</p>
        </div>
      )}

      {/* Animated canvas layer */}
      <canvas
        ref={canvasRef}
        className={styles.nebulaLayer}
        aria-hidden="true"
      />

      {/* Particle system for additional effects */}
      <ParticleSystem
        particleCount={intensity === 'high' ? 100 : intensity === 'medium' ? 50 : 25}
        className={styles.particleLayer}
      />

      {/* Gradient overlay for depth */}
      <div className={styles.gradientOverlay} aria-hidden="true" />
    </div>
  );
};
