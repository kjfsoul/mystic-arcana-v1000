'use client';

import React, { useRef, useEffect } from 'react';
import styles from './GalaxyShader.module.css';

interface GalaxyShaderProps {
  className?: string;
  intensity?: number;
  colors?: string[];
}

/**
 * GalaxyShader Component
 * 
 * WebGL shader-based galaxy background with rotating spiral arms
 * and nebula effects. Used in astrology panel for immersive chart backdrop.
 */
export const GalaxyShader: React.FC<GalaxyShaderProps> = ({ 
  className = '',
  intensity = 1.0,
  colors = ['#9370DB', '#4B0082', '#FFD700']
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // WebGL shader implementation would go here
    // For now, using CSS animation as placeholder
    canvas.width = 500;
    canvas.height = 500;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Placeholder galaxy effect
    const gradient = ctx.createRadialGradient(250, 250, 0, 250, 250, 250);
    gradient.addColorStop(0, 'rgba(255, 215, 0, 0.3)');
    gradient.addColorStop(0.3, 'rgba(147, 112, 219, 0.2)');
    gradient.addColorStop(1, 'rgba(75, 0, 130, 0.1)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 500, 500);

    return () => {
      // Cleanup
    };
  }, [intensity, colors]);

  return (
    <canvas 
      ref={canvasRef}
      className={`${styles.galaxyShader} ${className}`}
      aria-hidden="true"
    />
  );
};