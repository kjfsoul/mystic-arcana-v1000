'use client';

import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { HighPerformanceStarRenderer } from '../../../lib/astronomy/HighPerformanceStarRenderer';
import { astronomicalEngine } from '../../../services/astronomical/AstronomicalEngine';
import { useGeolocation } from '../../../hooks/useGeolocation';
import { RenderConfig, Star } from '../../../types/astronomical';
import { GalaxyBackground } from '../../effects/GalaxyBackground/GalaxyBackground';
import styles from './HighPerformanceStarField.module.css';

interface HighPerformanceStarFieldProps {
  useRealStars?: boolean;
  renderConfig?: Partial<RenderConfig>;
  className?: string;
  onStarClick?: (star: Star) => void;
  onPerformanceUpdate?: (stats: {
    totalStars: number;
    visibleStars: number;
    fps: number;
    renderTime: number;
  }) => void;
}

/**
 * High-Performance Star Field Component
 * 
 * Renders 100,000+ stars using WebGL2 with real astronomical data
 * from Claude Opus 4's Swiss Ephemeris calculations.
 */
export const HighPerformanceStarField: React.FC<HighPerformanceStarFieldProps> = ({
  useRealStars = false,
  renderConfig = {},
  className = '',
  onStarClick,
  onPerformanceUpdate
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<HighPerformanceStarRenderer | null>(null);
  const animationRef = useRef<number>(0);
  const onPerformanceUpdateRef = useRef(onPerformanceUpdate);

  // Update the ref when the callback changes
  useEffect(() => {
    onPerformanceUpdateRef.current = onPerformanceUpdate;
  }, [onPerformanceUpdate]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [starCount, setStarCount] = useState(0);

  const { location, loading: locationLoading } = useGeolocation();

  /**
   * Convert astronomical Star to renderer Star format
   */
  const convertToRendererStar = useCallback((astronomicalStar: Star): Star => {
    // The Star type from astronomical types is already compatible
    // Just ensure optional fields have defaults for the renderer
    return {
      ...astronomicalStar,
      // Ensure we have both coordinate formats
      ra: astronomicalStar.ra ?? astronomicalStar.coordinates.ra,
      dec: astronomicalStar.dec ?? astronomicalStar.coordinates.dec,
      // Ensure required fields have defaults
      colorIndex: astronomicalStar.colorIndex ?? 0,
      spectralClass: astronomicalStar.spectralClass ?? 'Unknown',
      spectralType: astronomicalStar.spectralType ?? astronomicalStar.spectralClass ?? 'Unknown',
      constellation: astronomicalStar.constellation ?? 'Unknown',
      properMotion: astronomicalStar.properMotion ?? { ra: 0, dec: 0 }
    };
  }, []);

  // Default render configuration optimized for performance
  const finalRenderConfig = useMemo((): RenderConfig => ({
    starCatalog: 'hipparcos',
    maxStars: 100000,
    minMagnitude: 6.5,
    showConstellations: false,
    showPlanets: true,
    showDeepSky: false,
    coordinateSystem: 'horizontal',
    projection: 'stereographic',
    ...renderConfig
  }), [renderConfig]);

  /**
   * Start the high-performance render loop
   */
  const startRenderLoop = useCallback(() => {
    const render = (time: number) => {
      if (rendererRef.current) {
        const stats = rendererRef.current.render(time);

        // Update performance callback
        if (onPerformanceUpdateRef.current) {
          onPerformanceUpdateRef.current({
            totalStars: stats.totalStars,
            visibleStars: stats.visibleStars,
            fps: stats.fps,
            renderTime: stats.renderTime
          });
        }
      }

      animationRef.current = requestAnimationFrame(render);
    };

    animationRef.current = requestAnimationFrame(render);
  }, []);

  /**
   * Initialize the high-performance renderer
   */
  const initializeRenderer = useCallback(async () => {
    if (!canvasRef.current) {
      console.log('❌ Canvas ref not available');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      console.log('🚀 Initializing high-performance star renderer...');

      // Ensure canvas is properly sized
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      console.log(`📐 Canvas size: ${rect.width}x${rect.height}`);

      // Create high-performance renderer
      const renderer = new HighPerformanceStarRenderer(canvas);
      rendererRef.current = renderer;

      // Ensure proper canvas sizing
      renderer.resize(rect.width, rect.height);
      console.log(`📐 Renderer resized to: ${rect.width}x${rect.height}`);

      // Load star data
      let stars: Star[] = [];

      if (useRealStars && location) {
        console.log('🌟 Loading real astronomical star data...');

        // Initialize astronomical engine
        await astronomicalEngine.initialize({
          ephemerisAccuracy: 'high',
          updateInterval: 1000,
          precessionCorrection: true,
          nutationCorrection: true,
          aberrationCorrection: true,
          refractionCorrection: true
        });

        // Load real star catalog
        const astronomicalStars = await astronomicalEngine.loadStarCatalog(finalRenderConfig.starCatalog);

        // Convert and filter stars based on configuration
        stars = astronomicalStars
          .filter(star => star.magnitude <= finalRenderConfig.minMagnitude)
          .slice(0, finalRenderConfig.maxStars)
          .sort((a, b) => a.magnitude - b.magnitude) // Brightest first
          .map(convertToRendererStar);

        console.log(`✨ Loaded ${stars.length} real stars from ${finalRenderConfig.starCatalog} catalog`);
      } else {
        // Generate procedural stars for performance testing
        console.log(`🎨 Generating ${finalRenderConfig.maxStars} procedural stars...`);
        stars = generateProceduralStars(finalRenderConfig.maxStars);
        console.log(`✅ Generated ${stars.length} procedural stars for testing`);
        console.log('Sample star:', stars[0]);
      }

      // Load stars into renderer
      console.log(`📤 Loading ${stars.length} stars into renderer...`);
      renderer.loadStars(stars);
      setStarCount(stars.length);
      console.log(`✅ Stars loaded into renderer`);

      // Set up view matrices for celestial sphere viewing
      // Position camera at origin looking outward at the celestial sphere
      const viewMatrix = new Float32Array([
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
      ]);

      // Create projection matrix suitable for viewing unit sphere
      const aspect = rect.width / rect.height;
      const projectionMatrix = createPerspectiveMatrix(
        Math.PI / 2, // 90 degree FOV for wide sky view
        aspect,
        0.1,  // Near plane
        10.0  // Far plane (stars are on unit sphere at distance ~1)
      );

      console.log(`📷 Camera setup: FOV=90°, aspect=${aspect.toFixed(2)}, near=0.1, far=10.0`);

      renderer.updateMatrices(viewMatrix, projectionMatrix);

      // Start render loop
      console.log(`🎬 Starting render loop...`);
      startRenderLoop();
      console.log(`✅ Render loop started`);

    } catch (err) {
      console.error('Failed to initialize high-performance star renderer:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [useRealStars, location, finalRenderConfig, convertToRendererStar, startRenderLoop]);

  /**
   * Generate procedural stars for testing
   */
  const generateProceduralStars = (count: number): Star[] => {
    const stars: Star[] = [];

    for (let i = 0; i < count; i++) {
      // Random position on celestial sphere
      const ra = Math.random() * 360;
      const dec = (Math.random() - 0.5) * 180;

      // Realistic magnitude distribution (more faint stars)
      const magnitude = 1 + Math.pow(Math.random(), 0.3) * 5;

      // Random color index (B-V)
      const colorIndex = (Math.random() - 0.5) * 2;

      const star: Star = {
        id: `proc_${i}`,
        name: `Star ${i}`,
        coordinates: { ra, dec },
        ra, // Compatibility field
        dec, // Compatibility field
        magnitude,
        colorIndex,
        spectralClass: 'G2V',
        spectralType: 'G2V', // Compatibility field
        properMotion: { ra: 0, dec: 0 },
        constellation: 'Generated'
      };
      stars.push(star);
    }

    return stars;
  };

  /**
   * Create perspective projection matrix
   */
  const createPerspectiveMatrix = (
    fov: number,
    aspect: number,
    near: number,
    far: number
  ): Float32Array => {
    const f = 1.0 / Math.tan(fov / 2);
    const rangeInv = 1 / (near - far);

    return new Float32Array([
      f / aspect, 0, 0, 0,
      0, f, 0, 0,
      0, 0, (near + far) * rangeInv, -1,
      0, 0, near * far * rangeInv * 2, 0
    ]);
  };

  /**
   * Handle canvas resize
   */
  const handleResize = useCallback(() => {
    if (canvasRef.current && rendererRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      rendererRef.current.resize(rect.width, rect.height);
    }
  }, []);

  // Initialize renderer when dependencies change
  useEffect(() => {
    if (!locationLoading) {
      initializeRenderer();
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, [initializeRenderer, locationLoading]);

  // Handle window resize
  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  // Handle canvas click for star selection
  const handleCanvasClick = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!onStarClick || !rendererRef.current) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // TODO: Implement star picking using GPU-based selection
    // For now, this is a placeholder
    console.log(`Star click at (${x}, ${y})`);
  }, [onStarClick]);

  return (
    <div className={`${styles.starFieldContainer} ${className}`}>
      {/* Galaxy background */}
      <GalaxyBackground
        intensity={0.8}
        showMilkyWay={true}
        animated={true}
        className={styles.galaxyBackground}
      />

      <canvas
        ref={canvasRef}
        className={styles.starCanvas}
        onClick={handleCanvasClick}
      />

      {/* Loading overlay */}
      {isLoading && (
        <div className={styles.loadingOverlay}>
          <div className={styles.loadingSpinner} />
          <p>Loading {useRealStars ? 'real astronomical' : 'procedural'} star data...</p>
        </div>
      )}

      {/* Error overlay */}
      {error && (
        <div className={styles.errorOverlay}>
          <div className={styles.errorMessage}>
            <h3>⚠️ Rendering Error</h3>
            <p>{error}</p>
            <button onClick={() => setError(null)}>Retry</button>
          </div>
        </div>
      )}

      {/* Performance info */}
      {!isLoading && !error && (
        <div className={styles.performanceInfo}>
          <span className={styles.starCount}>
            ⭐ {starCount.toLocaleString()} stars
          </span>
          <span className={styles.mode}>
            {useRealStars ? '🔬 Real Data' : '🎨 Procedural'}
          </span>
        </div>
      )}
    </div>
  );
};
