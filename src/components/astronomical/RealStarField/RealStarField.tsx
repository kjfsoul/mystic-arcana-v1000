"use client";

import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import { astronomicalEngine } from "../../../services/astronomical/AstronomicalEngine";
import {
  Star,
  GeoLocation,
  RenderConfig,
  ScreenCoordinates,
} from "../../../types/astronomical";
import styles from "./RealStarField.module.css";
/* eslint-disable no-unused-vars */
interface RealStarFieldProps {
  className?: string;
  location: GeoLocation;
  time?: Date;
  renderConfig?: Partial<RenderConfig>;
  interactive?: boolean;
  onStarClick?: (star: Star) => void;
}
/* eslint-enable no-unused-vars */
/**
 * RealStarField Component
 *
 * Renders a factually accurate star field based on real astronomical data.
 * Uses the AstronomicalEngine for precise star positions and visibility.
 */
export const RealStarField: React.FC<RealStarFieldProps> = ({
  className = "",
  location,
  time = new Date(),
  renderConfig = {},
  interactive = true,
  onStarClick,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const [stars, setStars] = useState<Star[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Memoized render configuration to prevent infinite re-renders

  const finalRenderConfig = useMemo(
    (): RenderConfig => ({
      starCatalog: "hipparcos",
      maxStars: 50000,
      minMagnitude: 6.5,
      showConstellations: true,
      showPlanets: true,
      showDeepSky: false,
      coordinateSystem: "horizontal",
      projection: "stereographic",
      ...renderConfig,
    }),
    [renderConfig],
  );
  // Initialize astronomical engine and load star data

  useEffect(() => {
    const initializeStarField = async () => {
      try {
        setIsLoading(true);
        setError(null);
        // Set observer location
        astronomicalEngine.setObserverLocation(location);
        // Load star catalog
        console.log(
          `🌟 Loading ${finalRenderConfig.starCatalog} star catalog...`,
        );
        await astronomicalEngine.loadStarCatalog(finalRenderConfig.starCatalog);
        // Get visible stars for current time and location
        const visibleStars = await astronomicalEngine.getVisibleStars();
        setStars(visibleStars);
        console.log(`✨ Loaded ${visibleStars.length} visible stars`);
      } catch (err) {
        console.error("Failed to initialize star field:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load star data",
        );
      } finally {
        setIsLoading(false);
      }
    };
    initializeStarField();
  }, [location, finalRenderConfig, time]);
  // Convert star coordinates to screen positions

  const getStarScreenPosition = useCallback((): ScreenCoordinates => {
    return astronomicalEngine.transformCoordinates();
  }, []);
  // Get star color based on B-V color index

  const getStarColor = useCallback((star: Star): string => {
    const bv = star.colorIndex;
    // Convert B-V color index to RGB
    if (bv < -0.3) return "#9bb0ff"; // Blue
    if (bv < 0.0) return "#aabfff"; // Blue-white
    if (bv < 0.3) return "#cad7ff"; // White
    if (bv < 0.6) return "#f8f7ff"; // Yellow-white
    if (bv < 1.0) return "#fff4ea"; // Yellow
    if (bv < 1.4) return "#ffd2a1"; // Orange
    return "#ffad51"; // Red
  }, []);
  // Calculate star size based on magnitude

  const getStarSize = useCallback((magnitude: number): number => {
    // Brighter stars (lower magnitude) are larger
    const size = Math.max(0.5, 4 - magnitude);
    return Math.min(size, 8); // Cap maximum size
  }, []);
  // Render stars on canvas

  const renderStars = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    // Clear canvas
    ctx.fillStyle = "#000011";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (isLoading) {
      // Show loading state
      ctx.fillStyle = "#ffffff";
      ctx.font = "16px Arial";
      ctx.textAlign = "center";
      ctx.fillText(
        "Loading star catalog...",
        canvas.width / 2,
        canvas.height / 2,
      );
      return;
    }
    if (error) {
      // Show error state
      ctx.fillStyle = "#ff6b6b";
      ctx.font = "16px Arial";
      ctx.textAlign = "center";
      ctx.fillText(`Error: ${error}`, canvas.width / 2, canvas.height / 2);
      return;
    }
    // Render each visible star
    stars.forEach((star) => {
      const screenPos = getStarScreenPosition(star);
      if (!screenPos.visible) return;
      const size = getStarSize(star.magnitude);
      const color = getStarColor(star);
      const alpha = Math.max(0.1, 1 - star.magnitude / 6.5);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = size;
      // Draw star as circle
      ctx.beginPath();
      ctx.arc(screenPos.x, screenPos.y, size / 2, 0, Math.PI * 2);
      ctx.fill();
      // Add diffraction spikes for bright stars
      if (star.magnitude < 2.0) {
        ctx.strokeStyle = color;
        ctx.lineWidth = 0.5;
        ctx.globalAlpha = alpha * 0.7;
        const spikeLength = size * 3;
        ctx.beginPath();
        ctx.moveTo(screenPos.x - spikeLength, screenPos.y);
        ctx.lineTo(screenPos.x + spikeLength, screenPos.y);
        ctx.moveTo(screenPos.x, screenPos.y - spikeLength);
        ctx.lineTo(screenPos.x, screenPos.y + spikeLength);
        ctx.stroke();
      }
      ctx.restore();
    });
    // Show star count and info
    ctx.fillStyle = "#ffffff";
    ctx.font = "12px Arial";
    ctx.textAlign = "left";
    ctx.fillText(`Stars: ${stars.length}`, 10, 20);
    ctx.fillText(`Time: ${time.toLocaleString()}`, 10, 35);
    ctx.fillText(
      `Location: ${location.latitude.toFixed(2)}°, ${location.longitude.toFixed(2)}°`,
      10,
      50,
    );
  }, [
    stars,
    isLoading,
    error,
    getStarScreenPosition,
    getStarColor,
    getStarSize,
    time,
    location,
  ]);
  // Handle canvas resize

  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }
    renderStars();
  }, [renderStars]);
  // Handle mouse clicks for star selection

  const handleCanvasClick = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      if (!interactive || !onStarClick) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      // Find closest star to click position
      let closestStar: Star | null = null;
      let closestDistance = Infinity;
      stars.forEach((star) => {
        const screenPos = getStarScreenPosition(star);
        if (!screenPos.visible) return;
        const distance = Math.sqrt(
          Math.pow(screenPos.x - x, 2) + Math.pow(screenPos.y - y, 2),
        );
        if (distance < 20 && distance < closestDistance) {
          closestDistance = distance;
          closestStar = star;
        }
      });
      if (closestStar) {
        onStarClick(closestStar);
      }
    },
    [interactive, onStarClick, stars, getStarScreenPosition],
  );
  // Set up canvas and event listeners

  useEffect(() => {
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [handleResize]);
  // Animation loop for real-time updates

  useEffect(() => {
    const animate = () => {
      renderStars();
      animationRef.current = requestAnimationFrame(animate);
    };
    animate();
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [renderStars]);
  return (
    <div className={`${styles.realStarField} ${className}`}>
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        onClick={handleCanvasClick}
        style={{ cursor: interactive ? "crosshair" : "default" }}
      />
      {isLoading && (
        <div className={styles.loadingOverlay}>
          <div className={styles.spinner} />
          <p>Loading astronomical data...</p>
        </div>
      )}
      {error && (
        <div className={styles.errorOverlay}>
          <p>⚠️ {error}</p>
          <p>Falling back to placeholder star field</p>
        </div>
      )}
    </div>
  );
};
