'use client';

import React, { useRef, useEffect, useState } from 'react';

export default function DebugStarsPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    console.log(message);
    setLogs(prev => [...prev.slice(-10), `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    addLog('🚀 Starting debug star renderer...');

    try {
      // Get 2D context for simple debugging
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        addLog('❌ Could not get 2D context');
        return;
      }

      // Set canvas size
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      addLog(`📐 Canvas sized: ${rect.width}x${rect.height} (${canvas.width}x${canvas.height})`);

      // Clear canvas
      ctx.fillStyle = '#000011';
      ctx.fillRect(0, 0, rect.width, rect.height);

      // Generate some test stars
      const starCount = 1000;
      const stars = [];
      
      for (let i = 0; i < starCount; i++) {
        stars.push({
          x: Math.random() * rect.width,
          y: Math.random() * rect.height,
          magnitude: Math.random() * 6, // 0-6 magnitude
          color: Math.random() // B-V color index
        });
      }

      addLog(`✨ Generated ${stars.length} test stars`);

      // Draw stars
      let drawnCount = 0;
      stars.forEach((star) => {
        // Only draw stars brighter than magnitude 6
        if (star.magnitude <= 6) {
          // Calculate size based on magnitude (brighter = larger)
          const size = Math.max(0.5, (6 - star.magnitude) * 0.8);
          
          // Calculate color based on B-V index
          let r, g, b;
          if (star.color < 0.3) {
            // Blue stars
            r = 155 + star.color * 100;
            g = 176 + star.color * 79;
            b = 255;
          } else if (star.color < 0.6) {
            // White stars
            r = 255;
            g = 244 - star.color * 50;
            b = 234 - star.color * 100;
          } else {
            // Red/orange stars
            r = 255;
            g = 210 - star.color * 100;
            b = 161 - star.color * 150;
          }

          ctx.fillStyle = `rgb(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)})`;
          ctx.beginPath();
          ctx.arc(star.x, star.y, size, 0, Math.PI * 2);
          ctx.fill();

          // Add glow for bright stars
          if (star.magnitude < 3) {
            ctx.shadowColor = ctx.fillStyle;
            ctx.shadowBlur = size * 2;
            ctx.beginPath();
            ctx.arc(star.x, star.y, size * 0.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
          }

          drawnCount++;
        }
      });

      addLog(`🎨 Drew ${drawnCount} visible stars (magnitude <= 6)`);

      // Add some bright reference stars
      const brightStars = [
        { x: rect.width * 0.2, y: rect.height * 0.3, name: 'Sirius (mag -1.46)' },
        { x: rect.width * 0.8, y: rect.height * 0.7, name: 'Vega (mag 0.03)' },
        { x: rect.width * 0.5, y: rect.height * 0.2, name: 'Polaris (mag 1.98)' },
      ];

      brightStars.forEach(star => {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(star.x, star.y, 4, 0, Math.PI * 2);
        ctx.fill();
        
        // Add bright glow
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(star.x, star.y, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Add label
        ctx.fillStyle = '#cccccc';
        ctx.font = '12px monospace';
        ctx.fillText(star.name, star.x + 10, star.y - 10);
      });

      addLog(`⭐ Added ${brightStars.length} bright reference stars`);
      addLog('✅ Debug star field complete!');

    } catch (error) {
      addLog(`❌ Error: ${error}`);
    }
  }, []);

  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      position: 'relative',
      background: '#000'
    }}>
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          display: 'block'
        }}
      />
      
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        color: 'white',
        fontFamily: 'monospace',
        fontSize: '12px',
        background: 'rgba(0,0,0,0.8)',
        padding: '10px',
        borderRadius: '5px',
        zIndex: 10,
        maxWidth: '400px',
        maxHeight: '300px',
        overflow: 'auto'
      }}>
        <h3>🐛 Debug Star Renderer</h3>
        <div style={{ fontSize: '10px' }}>
          {logs.map((log, index) => (
            <div key={index}>{log}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
