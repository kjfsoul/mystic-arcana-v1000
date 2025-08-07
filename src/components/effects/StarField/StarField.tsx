"use client";

import React, { useRef, useEffect } from "react";
import styles from "./StarField.module.css";
interface StarFieldProps {
  density?: number;
  className?: string;
  speed?: number;
  interactive?: boolean;
}
interface Star {
  x: number;
  y: number;
  z: number;
  prevX?: number;
  prevY?: number;
  brightness: number;
  color: string;
}
/**
 * StarField Component
 *
 * Creates a parallax star field effect with multiple layers of depth.
 * Stars twinkle and move based on user interaction or auto-motion.
 */
export const StarField: React.FC<StarFieldProps> = ({
  density = 200,
  className = "",
  speed = 1,
  interactive = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const starsRef = useRef<Star[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initializeStars();
    };
    const initializeStars = () => {
      starsRef.current = [];
      for (let i = 0; i < density; i++) {
        starsRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          z: Math.random() * 1000,
          brightness: Math.random(),
          color: getStarColor(),
        });
      }
    };
    const getStarColor = () => {
      const colors = [
        "#FFFFFF", // White
        "#FFE4B5", // Warm white
        "#E6E6FA", // Lavender
        "#FFD700", // Gold
        "#87CEEB", // Sky blue
        "#DDA0DD", // Plum
      ];
      return colors[Math.floor(Math.random() * colors.length)];
    };
    const updateStars = (deltaTime: number) => {
      starsRef.current.forEach((star) => {
        // Store previous position for trails
        star.prevX = star.x;
        star.prevY = star.y;
        // Move star towards viewer
        star.z -= speed * deltaTime * 0.1;
        // Reset star if too close
        if (star.z <= 0) {
          star.x = Math.random() * canvas.width;
          star.y = Math.random() * canvas.height;
          star.z = 1000;
          star.brightness = Math.random();
        }
        // Calculate screen position
        const k = 128 / star.z;
        star.x += (star.x - canvas.width / 2) * k * deltaTime * 0.01;
        star.y += (star.y - canvas.height / 2) * k * deltaTime * 0.01;
        // Add gentle drift
        star.x += Math.sin(timeRef.current * 0.001 + star.z * 0.001) * 0.5;
        star.y += Math.cos(timeRef.current * 0.001 + star.z * 0.001) * 0.3;
        // Twinkling effect
        star.brightness += (Math.random() - 0.5) * 0.02;
        star.brightness = Math.max(0.1, Math.min(1, star.brightness));
      });
    };
    const drawStars = () => {
      // Clear with slight fade for trails
      ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      starsRef.current.forEach((star) => {
        if (
          star.x < 0 ||
          star.x > canvas.width ||
          star.y < 0 ||
          star.y > canvas.height
        ) {
          return;
        }
        // Calculate size based on distance
        const size = (1 - star.z / 1000) * 3;
        const alpha = star.brightness * (1 - star.z / 1000);
        // Draw star
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = star.color;
        ctx.shadowColor = star.color;
        ctx.shadowBlur = size * 2;
        ctx.beginPath();
        ctx.arc(star.x, star.y, size, 0, Math.PI * 2);
        ctx.fill();
        // Draw star cross for brighter stars
        if (alpha > 0.7) {
          ctx.strokeStyle = star.color;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(star.x - size * 2, star.y);
          ctx.lineTo(star.x + size * 2, star.y);
          ctx.moveTo(star.x, star.y - size * 2);
          ctx.lineTo(star.x, star.y + size * 2);
          ctx.stroke();
        }
        ctx.restore();
      });
    };
    const animate = (currentTime: number) => {
      const deltaTime = currentTime - timeRef.current;
      timeRef.current = currentTime;
      updateStars(deltaTime);
      drawStars();
      animationRef.current = requestAnimationFrame(animate);
    };
    const handleMouseMove = (e: MouseEvent) => {
      if (interactive) {
        mouseRef.current = {
          x: e.clientX,
          y: e.clientY,
        };
      }
    };
    // Initialize
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    window.addEventListener("mousemove", handleMouseMove);
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (!prefersReducedMotion) {
      animate(0);
    } else {
      // Static star field for reduced motion
      drawStars();
    }
    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [density, speed, interactive]);
  return (
    <canvas
      ref={canvasRef}
      className={`${styles.starField} ${className}`}
      aria-hidden="true"
      role="presentation"
    />
  );
};
