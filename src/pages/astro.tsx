import React, { useState, useEffect } from 'react';
import GalaxyView from '@/components/astro/GalaxyView';
import { getPlanetPositions } from '@/lib/astrology/planetCalculator';

const AstroPage = () => {
  const [pov, setPov] = useState<'Earth' | 'Moon' | 'Mars'>('Earth');
  const [planets, setPlanets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlanets = async () => {
      setLoading(true);
      const positions = await getPlanetPositions(new Date());
      setPlanets(positions);
      setLoading(false);
    };
    fetchPlanets();
  }, []);

  if (loading) {
    return <div>Loading celestial data...</div>;
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
      <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 1, background: 'rgba(0,0,0,0.5)', padding: '10px', borderRadius: '5px' }}>
        <label htmlFor="pov-select" style={{ color: 'white', marginRight: '10px' }}>View From:</label>
        <select id="pov-select" value={pov} onChange={e => setPov(e.target.value as any)} style={{ color: 'black' }}>
          <option value="Earth">Earth</option>
          <option value="Moon">Moon</option>
          <option value="Mars">Mars</option>
        </select>
      </div>
      <GalaxyView pov={pov} planets={planets} />
    </div>
  );
};

export default AstroPage;