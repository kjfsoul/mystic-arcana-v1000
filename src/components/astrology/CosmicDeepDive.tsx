'use client';
 
import React, { useEffect, useRef } from 'react';
import styles from './CosmicDeepDive.module.css';
interface CosmicDeepDiveProps {
  className?: string;
}
export const CosmicDeepDive: React.FC<CosmicDeepDiveProps> = ({ className }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
 
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    // Set canvas size
    const updateCanvasSize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    // Animation state
    let time = 0;
    const planets: Array<{
      x: number;
      y: number;
      radius: number;
      color: string;
      orbitRadius: number;
      orbitSpeed: number;
      angle: number;
    }> = [];
    const blackHoles: Array<{
      x: number;
      y: number;
      radius: number;
      intensity: number;
    }> = [];
    const gravitationalWaves: Array<{
      x: number;
      y: number;
      radius: number;
      opacity: number;
      speed: number;
    }> = [];
    // Initialize cosmic objects
    const initializeObjects = () => {
      const centerX = canvas.width / (2 * window.devicePixelRatio);
      const centerY = canvas.height / (2 * window.devicePixelRatio);
      // Create planets in orbital system
      planets.push(
        { x: centerX, y: centerY, radius: 8, color: '#FFD700', orbitRadius: 60, orbitSpeed: 0.01, angle: 0 }, // Sun
        { x: centerX, y: centerY, radius: 3, color: '#FFA500', orbitRadius: 80, orbitSpeed: 0.02, angle: Math.PI * 0.3 }, // Mercury
        { x: centerX, y: centerY, radius: 4, color: '#FF69B4', orbitRadius: 100, orbitSpeed: 0.015, angle: Math.PI * 0.7 }, // Venus
        { x: centerX, y: centerY, radius: 4, color: '#4169E1', orbitRadius: 120, orbitSpeed: 0.012, angle: Math.PI * 1.2 }, // Earth
        { x: centerX, y: centerY, radius: 3, color: '#FF4500', orbitRadius: 140, orbitSpeed: 0.008, angle: Math.PI * 1.8 }, // Mars
        { x: centerX, y: centerY, radius: 12, color: '#DAA520', orbitRadius: 180, orbitSpeed: 0.005, angle: Math.PI * 0.1 }, // Jupiter
        { x: centerX, y: centerY, radius: 10, color: '#F4A460', orbitRadius: 220, orbitSpeed: 0.003, angle: Math.PI * 1.5 }, // Saturn
        { x: centerX, y: centerY, radius: 6, color: '#40E0D0', orbitRadius: 260, orbitSpeed: 0.002, angle: Math.PI * 0.9 }, // Uranus
        { x: centerX, y: centerY, radius: 6, color: '#0000FF', orbitRadius: 300, orbitSpeed: 0.001, angle: Math.PI * 1.6 } // Neptune
      );
      // Create black holes
      blackHoles.push(
        { x: centerX - 150, y: centerY - 100, radius: 25, intensity: 1 },
        { x: centerX + 180, y: centerY + 120, radius: 30, intensity: 0.8 }
      );
      // Initialize gravitational waves
      for (let i = 0; i < 8; i++) {
        gravitationalWaves.push({
          x: centerX,
          y: centerY,
          radius: 50 + i * 40,
          opacity: 0.3 - i * 0.03,
          speed: 0.5 + i * 0.1
        });
      }
    };
    initializeObjects();
    const drawGravitationalWaves = () => {
      gravitationalWaves.forEach(wave => {
        ctx.save();
        ctx.globalAlpha = wave.opacity * (0.5 + 0.5 * Math.sin(time * 0.02 + wave.radius * 0.01));
        ctx.strokeStyle = '#8A2BE2';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 10]);
        ctx.lineDashOffset = time * wave.speed;
        
        ctx.beginPath();
        ctx.arc(wave.x, wave.y, wave.radius + Math.sin(time * 0.01 + wave.radius * 0.005) * 10, 0, Math.PI * 2);
        ctx.stroke();
        
        // Add inner distortion rings
        ctx.globalAlpha = wave.opacity * 0.3;
        ctx.strokeStyle = '#9370DB';
        ctx.beginPath();
        ctx.arc(wave.x, wave.y, wave.radius * 0.7 + Math.cos(time * 0.015 + wave.radius * 0.008) * 8, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.restore();
      });
    };
    const drawBlackHoles = () => {
      blackHoles.forEach(hole => {
        // Event horizon
        const gradient = ctx.createRadialGradient(hole.x, hole.y, 0, hole.x, hole.y, hole.radius);
        gradient.addColorStop(0, 'rgba(0, 0, 0, 1)');
        gradient.addColorStop(0.7, 'rgba(75, 0, 130, 0.8)');
        gradient.addColorStop(1, 'rgba(138, 43, 226, 0.2)');
        
        ctx.save();
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(hole.x, hole.y, hole.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Accretion disk
        ctx.globalAlpha = 0.6 * hole.intensity;
        const diskGradient = ctx.createRadialGradient(hole.x, hole.y, hole.radius, hole.x, hole.y, hole.radius * 2.5);
        diskGradient.addColorStop(0, 'rgba(255, 69, 0, 0.8)');
        diskGradient.addColorStop(0.5, 'rgba(255, 140, 0, 0.4)');
        diskGradient.addColorStop(1, 'rgba(255, 215, 0, 0.1)');
        
        ctx.fillStyle = diskGradient;
        ctx.beginPath();
        ctx.arc(hole.x, hole.y, hole.radius * 2.5, 0, Math.PI * 2);
        ctx.fill();
        
        // Rotating matter streams
        ctx.save();
        ctx.translate(hole.x, hole.y);
        ctx.rotate(time * 0.02 * hole.intensity);
        ctx.strokeStyle = 'rgba(255, 140, 0, 0.6)';
        ctx.lineWidth = 3;
        
        for (let i = 0; i < 3; i++) {
          ctx.save();
          ctx.rotate((i * Math.PI * 2) / 3);
          ctx.beginPath();
          ctx.arc(0, 0, hole.radius * 1.5, 0, Math.PI / 3);
          ctx.stroke();
          ctx.restore();
        }
        
        ctx.restore();
        ctx.restore();
      });
    };
    const drawPlanets = () => {
      const centerX = canvas.width / (2 * window.devicePixelRatio);
      const centerY = canvas.height / (2 * window.devicePixelRatio);
      planets.forEach((planet, index) => {
        // Update orbital position
        planet.angle += planet.orbitSpeed;
        planet.x = centerX + Math.cos(planet.angle) * planet.orbitRadius;
        planet.y = centerY + Math.sin(planet.angle) * planet.orbitRadius;
        // Draw orbital path (faint)
        if (index > 0) { // Skip sun
          ctx.save();
          ctx.globalAlpha = 0.1;
          ctx.strokeStyle = '#8A2BE2';
          ctx.lineWidth = 1;
          ctx.setLineDash([2, 8]);
          ctx.beginPath();
          ctx.arc(centerX, centerY, planet.orbitRadius, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }
        // Draw planet
        const planetGradient = ctx.createRadialGradient(
          planet.x - planet.radius * 0.3, 
          planet.y - planet.radius * 0.3, 
          0, 
          planet.x, 
          planet.y, 
          planet.radius
        );
        planetGradient.addColorStop(0, planet.color);
        planetGradient.addColorStop(1, `${planet.color}88`);
        ctx.save();
        ctx.fillStyle = planetGradient;
        ctx.beginPath();
        ctx.arc(planet.x, planet.y, planet.radius, 0, Math.PI * 2);
        ctx.fill();
        // Add planetary glow
        ctx.globalAlpha = 0.3;
        ctx.shadowColor = planet.color;
        ctx.shadowBlur = planet.radius * 2;
        ctx.beginPath();
        ctx.arc(planet.x, planet.y, planet.radius * 0.8, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
      });
    };
    const drawCosmicBackground = () => {
      // Create deep space gradient
      const centerX = canvas.width / (2 * window.devicePixelRatio);
      const centerY = canvas.height / (2 * window.devicePixelRatio);
      
      const spaceGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, Math.max(centerX, centerY));
      spaceGradient.addColorStop(0, 'rgba(25, 25, 112, 0.1)');
      spaceGradient.addColorStop(0.5, 'rgba(0, 0, 0, 0.8)');
      spaceGradient.addColorStop(1, 'rgba(0, 0, 0, 1)');
      
      ctx.fillStyle = spaceGradient;
      ctx.fillRect(0, 0, canvas.width / window.devicePixelRatio, canvas.height / window.devicePixelRatio);
      // Add distant stars
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      for (let i = 0; i < 100; i++) {
        const x = Math.random() * (canvas.width / window.devicePixelRatio);
        const y = Math.random() * (canvas.height / window.devicePixelRatio);
        const size = Math.random() * 1.5;
        const twinkle = 0.3 + 0.7 * Math.sin(time * 0.01 + i);
        
        ctx.save();
        ctx.globalAlpha = twinkle;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    };
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width / window.devicePixelRatio, canvas.height / window.devicePixelRatio);
      
      drawCosmicBackground();
      drawGravitationalWaves();
      drawBlackHoles();
      drawPlanets();
      
      time += 1;
      animationRef.current = requestAnimationFrame(animate);
    };
    animate();
    return () => {
      window.removeEventListener('resize', updateCanvasSize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);
  return (
    <div className={`${styles.container} ${className || ''}`}>
      <canvas 
        ref={canvasRef}
        className={styles.canvas}
      />
      <div className={styles.overlay}>
        <div className={styles.pulsingOrb} />
        <div className={styles.cosmicText}>
          <h3>Are you ready to dive deep into your inner fabric?</h3>
          <p>Unlock the mysteries of your cosmic blueprint</p>
        </div>
      </div>
    </div>
  );
};
