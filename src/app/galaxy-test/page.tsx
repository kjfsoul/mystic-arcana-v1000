'use client';

import React from 'react';
import { GalaxyBackground } from '../../components/effects/GalaxyBackground/GalaxyBackground';

export default function GalaxyTestPage() {
  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      position: 'relative',
      overflow: 'hidden',
      background: '#000'
    }}>
      <GalaxyBackground 
        intensity={0.8}
        showMilkyWay={true}
        animated={true}
      />
      
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        color: 'white',
        fontFamily: 'monospace',
        fontSize: '14px',
        background: 'rgba(0,0,0,0.5)',
        padding: '10px',
        borderRadius: '5px',
        zIndex: 10
      }}>
        <h2>🌌 Galaxy Background Test</h2>
        <p>✨ Realistic Milky Way rendering</p>
        <p>🎨 Procedural star generation</p>
        <p>💫 Animated cosmic effects</p>
        <p>🌟 Performance optimized</p>
      </div>
    </div>
  );
}
