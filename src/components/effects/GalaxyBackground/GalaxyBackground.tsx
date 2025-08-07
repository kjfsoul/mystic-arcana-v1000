"use client";

import React, { useEffect, useRef } from "react";
import styles from "./GalaxyBackground.module.css";
interface GalaxyBackgroundProps {
  className?: string;
  intensity?: number; // 0-1, controls brightness
  showMilkyWay?: boolean;
  animated?: boolean;
  starCount?: number; // Optional star count override for performance
}
/**
 * Galaxy Background Component
 *
 * Renders a beautiful Milky Way galaxy background using CSS gradients
 * and canvas-based star field for astronomical accuracy.
 */
export const GalaxyBackground: React.FC<GalaxyBackgroundProps> = ({
  className = "",
  intensity = 0.7,
  showMilkyWay = true,
  animated = true,
  starCount,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    // Variables for animation handling
    // Generate background stars
    const generateStars = () => {
      const rect = canvas.getBoundingClientRect();
      const width = rect.width || window.innerWidth;
      const height = rect.height || window.innerHeight;
      // Set canvas size
      canvas.width = width;
      canvas.height = height;
      ctx.clearRect(0, 0, width, height);
      // Drastically reduce star count for faster initial render
      const finalStarCount =
        starCount || Math.min(25, Math.floor((width * height) / 32000));
      for (let i = 0; i < finalStarCount; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const size = Math.random() * 1.5; // Smaller stars
        const opacity = Math.random() * intensity * 0.4; // Much dimmer stars
        // Create star color based on temperature
        const temp = Math.random();
        let color;
        if (temp < 0.1) {
          color = `rgba(155, 176, 255, ${opacity})`; // Blue giant
        } else if (temp < 0.3) {
          color = `rgba(202, 215, 255, ${opacity})`; // Blue-white
        } else if (temp < 0.6) {
          color = `rgba(255, 244, 234, ${opacity})`; // White
        } else if (temp < 0.8) {
          color = `rgba(255, 210, 161, ${opacity})`; // Yellow
        } else {
          color = `rgba(255, 204, 111, ${opacity})`; // Orange
        }
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
        // Add subtle glow only for the brightest stars (much reduced)
        if (opacity > 0.15) {
          ctx.shadowColor = color;
          ctx.shadowBlur = size * 1;
          ctx.beginPath();
          ctx.arc(x, y, size * 0.3, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }
      // Add Milky Way dust lanes if enabled
      if (showMilkyWay) {
        const gradient = ctx.createLinearGradient(
          0,
          height * 0.3,
          width,
          height * 0.7,
        );
        gradient.addColorStop(0, `rgba(139, 69, 19, ${0.1 * intensity})`);
        gradient.addColorStop(0.3, `rgba(160, 82, 45, ${0.15 * intensity})`);
        gradient.addColorStop(0.5, `rgba(205, 133, 63, ${0.2 * intensity})`);
        gradient.addColorStop(0.7, `rgba(160, 82, 45, ${0.15 * intensity})`);
        gradient.addColorStop(1, `rgba(139, 69, 19, ${0.1 * intensity})`);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, height * 0.3, width, height * 0.4);
        // Add nebula-like regions
        for (let i = 0; i < 3; i++) {
          const nebulaX = Math.random() * width;
          const nebulaY = height * 0.4 + Math.random() * height * 0.2;
          const nebulaSize = 50 + Math.random() * 100;
          const nebulaGradient = ctx.createRadialGradient(
            nebulaX,
            nebulaY,
            0,
            nebulaX,
            nebulaY,
            nebulaSize,
          );
          const colors = [
            `rgba(255, 20, 147, ${0.1 * intensity})`, // Deep pink
            `rgba(138, 43, 226, ${0.08 * intensity})`, // Blue violet
            `rgba(75, 0, 130, ${0.05 * intensity})`, // Indigo
          ];
          const color = colors[Math.floor(Math.random() * colors.length)];
          nebulaGradient.addColorStop(0, color);
          nebulaGradient.addColorStop(1, "rgba(0, 0, 0, 0)");
          ctx.fillStyle = nebulaGradient;
          ctx.fillRect(
            nebulaX - nebulaSize,
            nebulaY - nebulaSize,
            nebulaSize * 2,
            nebulaSize * 2,
          );
        }
      }
    };
    // Set canvas size and handle DPI scaling
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      // Set the actual canvas size in memory
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      // Scale the canvas back down using CSS
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      // Scale the drawing context so everything draws at the correct size
      ctx.scale(dpr, dpr);
      // Force regeneration after resize
      generateStars();
    };
    // Initialize canvas with defer to avoid blocking render
    setTimeout(() => {
      resizeCanvas();
    }, 50);
    window.addEventListener("resize", resizeCanvas);
    // REMOVED: Animation loop causing constant wobbling
    // Animation disabled to fix performance and wobbling issues
    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [intensity, showMilkyWay, animated, starCount]);
  return (
    <div className={`${styles.galaxyContainer} ${className}`}>
      {/* CSS Gradient Background */}
      <div
        className={styles.galaxyGradient}
        style={{
          opacity: intensity,
          background: showMilkyWay
            ? `radial-gradient(ellipse at center, 
                rgba(25, 25, 112, 0.8) 0%, 
                rgba(72, 61, 139, 0.6) 30%, 
                rgba(123, 104, 238, 0.4) 50%, 
                rgba(25, 25, 112, 0.3) 70%, 
                rgba(0, 0, 0, 0.9) 100%),
               linear-gradient(45deg, 
                rgba(138, 43, 226, 0.1) 0%, 
                rgba(75, 0, 130, 0.2) 50%, 
                rgba(25, 25, 112, 0.1) 100%)`
            : `radial-gradient(ellipse at center, 
                rgba(25, 25, 112, 0.6) 0%, 
                rgba(0, 0, 0, 0.8) 70%, 
                rgba(0, 0, 0, 1) 100%)`,
        }}
      />
      {/* Canvas for detailed stars */}
      <canvas ref={canvasRef} className={styles.galaxyCanvas} />
      {/* Animated cosmic dust overlay */}
      {animated && (
        <div
          className={styles.cosmicDust}
          style={{ opacity: intensity * 0.3 }}
        />
      )}
    </div>
  );
};
