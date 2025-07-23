'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AstronomicalCalculator, BirthData, PlanetPosition, HousePosition } from '@/lib/astrology/AstronomicalCalculator';
import { TransitEngine, PlanetaryPosition, TransitAspect } from '@/lib/ephemeris/transitEngine';
import styles from './InteractiveBirthChart.module.css';

interface ChartProps {
  birthData: BirthData;
  onPlanetClick?: (planet: PlanetPosition) => void;
  onHouseClick?: (house: HousePosition) => void;
  showTransits?: boolean;
  transitDate?: Date;
  className?: string;
}

// Zodiac signs configuration
const ZODIAC_SIGNS = [
  { name: 'Aries', symbol: '♈', startDegree: 0, element: 'fire' },
  { name: 'Taurus', symbol: '♉', startDegree: 30, element: 'earth' },
  { name: 'Gemini', symbol: '♊', startDegree: 60, element: 'air' },
  { name: 'Cancer', symbol: '♋', startDegree: 90, element: 'water' },
  { name: 'Leo', symbol: '♌', startDegree: 120, element: 'fire' },
  { name: 'Virgo', symbol: '♍', startDegree: 150, element: 'earth' },
  { name: 'Libra', symbol: '♎', startDegree: 180, element: 'air' },
  { name: 'Scorpio', symbol: '♏', startDegree: 210, element: 'water' },
  { name: 'Sagittarius', symbol: '♐', startDegree: 240, element: 'fire' },
  { name: 'Capricorn', symbol: '♑', startDegree: 270, element: 'earth' },
  { name: 'Aquarius', symbol: '♒', startDegree: 300, element: 'air' },
  { name: 'Pisces', symbol: '♓', startDegree: 330, element: 'water' }
];

// Planet symbols and information
const PLANETS = {
  sun: { symbol: '☉', name: 'Sun', color: '#FFD700' },
  moon: { symbol: '☽', name: 'Moon', color: '#C0C0C0' },
  mercury: { symbol: '☿', name: 'Mercury', color: '#FFA500' },
  venus: { symbol: '♀', name: 'Venus', color: '#FF69B4' },
  mars: { symbol: '♂', name: 'Mars', color: '#FF4500' },
  jupiter: { symbol: '♃', name: 'Jupiter', color: '#4169E1' },
  saturn: { symbol: '♄', name: 'Saturn', color: '#8B4513' },
  uranus: { symbol: '♅', name: 'Uranus', color: '#40E0D0' },
  neptune: { symbol: '♆', name: 'Neptune', color: '#4B0082' },
  pluto: { symbol: '♇', name: 'Pluto', color: '#8B0000' }
};

export const InteractiveBirthChart: React.FC<ChartProps> = ({
  birthData,
  onPlanetClick,
  onHouseClick,
  showTransits = false,
  transitDate = new Date(),
  className
}) => {
  const [selectedObject, setSelectedObject] = useState<{
    type: 'planet' | 'house' | 'sign' | 'transit';
    data: PlanetPosition | HousePosition | typeof ZODIAC_SIGNS[0] | PlanetaryPosition;
  } | null>(null);
  
  const [showModal, setShowModal] = useState(false);
  const [chartSize, setChartSize] = useState(400);
  const [isAnimating, setIsAnimating] = useState(true);
  const [transitEngine] = useState(() => new TransitEngine());
  const [transitData, setTransitData] = useState<{
    positions: PlanetaryPosition[];
    aspects: TransitAspect[];
  }>({ positions: [], aspects: [] });

  // Calculate responsive chart size
  useEffect(() => {
    const updateSize = () => {
      const container = document.querySelector(`.${styles.chartContainer}`);
      if (container) {
        const rect = container.getBoundingClientRect();
        const size = Math.min(rect.width * 0.9, 500, window.innerHeight * 0.6);
        setChartSize(size);
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Calculate real astronomical positions
  const [chartData, setChartData] = useState<{
    planets: PlanetPosition[];
    houses: HousePosition[];
    ascendant: number;
    midheaven: number;
  }>({
    planets: [],
    houses: [],
    ascendant: 0,
    midheaven: 0
  });

  useEffect(() => {
    const calculateChart = async () => {
      try {
        const result = await AstronomicalCalculator.calculateChart(birthData);
        setChartData(result);
      } catch (error) {
        console.error('Error calculating chart:', error);
        // Keep fallback data
        setChartData({
          planets: [],
          houses: [],
          ascendant: 0,
          midheaven: 0
        });
      }
    };
    
    calculateChart();
  }, [birthData]);

  // Load transit data when transits are enabled
  useEffect(() => {
    if (showTransits) {
      const loadTransits = async () => {
        try {
          const positions = await transitEngine.getCurrentPlanetaryPositions();
          const aspects = await transitEngine.calculateTransits(birthData, transitDate);
          setTransitData({ positions, aspects });
        } catch (error) {
          console.error('Error loading transits:', error);
          setTransitData({ positions: [], aspects: [] });
        }
      };
      
      loadTransits();
    }
  }, [showTransits, transitDate, birthData, transitEngine]);

  const { planets: planetPositions, houses: housePositions } = chartData;

  // Convert degree to SVG coordinates
  const degreeToCoords = (degree: number, radius: number, centerX: number, centerY: number) => {
    const radians = ((degree - 90) * Math.PI) / 180; // -90 to start from top
    return {
      x: centerX + radius * Math.cos(radians),
      y: centerY + radius * Math.sin(radians)
    };
  };

  const handleObjectClick = (type: 'planet' | 'house' | 'sign' | 'transit', data: PlanetPosition | HousePosition | typeof ZODIAC_SIGNS[0] | PlanetaryPosition) => {
    setSelectedObject({ type, data });
    setShowModal(true);
    
    if (type === 'planet' && onPlanetClick) {
      onPlanetClick(data as PlanetPosition);
    } else if (type === 'house' && onHouseClick) {
      onHouseClick(data as HousePosition);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedObject(null);
  };

  const center = chartSize / 2;
  const outerRadius = chartSize * 0.45;
  const zodiacRadius = chartSize * 0.42;
  const planetRadius = chartSize * 0.35;
  const transitRadius = chartSize * 0.32; // Outer ring for transits
  const houseRadius = chartSize * 0.25;

  return (
    <div className={`${styles.chartContainer} ${className || ''}`}>
      <motion.div
        className={styles.chartWrapper}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <svg 
          width={chartSize} 
          height={chartSize} 
          className={styles.chart}
          viewBox={`0 0 ${chartSize} ${chartSize}`}
        >
          {/* Background circles */}
          <circle
            cx={center}
            cy={center}
            r={outerRadius}
            fill="none"
            stroke="rgba(138, 43, 226, 0.3)"
            strokeWidth="2"
            className={styles.outerCircle}
          />
          
          <circle
            cx={center}
            cy={center}
            r={planetRadius}
            fill="none"
            stroke="rgba(72, 61, 139, 0.2)"
            strokeWidth="1"
          />
          
          <circle
            cx={center}
            cy={center}
            r={houseRadius}
            fill="none"
            stroke="rgba(25, 25, 112, 0.2)"
            strokeWidth="1"
          />

          {/* Zodiac signs */}
          {ZODIAC_SIGNS.map((sign) => {
            const startAngle = sign.startDegree;
            const midAngle = startAngle + 15;
            
            const coords = degreeToCoords(midAngle, zodiacRadius, center, center);
            
            return (
              <g key={sign.name}>
                {/* House division lines */}
                <line
                  x1={center}
                  y1={center}
                  x2={degreeToCoords(startAngle, outerRadius, center, center).x}
                  y2={degreeToCoords(startAngle, outerRadius, center, center).y}
                  stroke="rgba(138, 43, 226, 0.2)"
                  strokeWidth="1"
                />
                
                {/* Zodiac symbol */}
                <motion.text
                  x={coords.x}
                  y={coords.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className={styles.zodiacSymbol}
                  onClick={() => handleObjectClick('sign', sign)}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {sign.symbol}
                </motion.text>
              </g>
            );
          })}

          {/* House numbers */}
          {housePositions.map((house, index) => {
            const coords = degreeToCoords(house.cusp, houseRadius, center, center);
            
            return (
              <motion.g key={house.number}>
                {/* House division line */}
                <line
                  x1={center}
                  y1={center}
                  x2={degreeToCoords(house.cusp, outerRadius, center, center).x}
                  y2={degreeToCoords(house.cusp, outerRadius, center, center).y}
                  stroke="rgba(72, 61, 139, 0.4)"
                  strokeWidth="1"
                />
                
                {/* House number */}
                <motion.text
                  x={coords.x}
                  y={coords.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className={styles.houseNumber}
                  onClick={() => handleObjectClick('house', house)}
                  whileHover={{ scale: 1.3 }}
                  whileTap={{ scale: 0.8 }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                >
                  {house.number}
                </motion.text>
              </motion.g>
            );
          })}

          {/* Natal Planets */}
          {planetPositions.map((planet, index) => {
            const coords = degreeToCoords(planet.longitude, planetRadius, center, center);
            const planetInfo = PLANETS[planet.name.toLowerCase() as keyof typeof PLANETS];
            
            return (
              <motion.g
                key={`natal-${planet.name}`}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
              >
                {/* Planet glow effect */}
                <circle
                  cx={coords.x}
                  cy={coords.y}
                  r="12"
                  fill={planetInfo?.color || '#fff'}
                  opacity="0.2"
                  className={styles.planetGlow}
                />
                
                {/* Planet symbol */}
                <motion.text
                  x={coords.x}
                  y={coords.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className={`${styles.planetSymbol} ${planet.name === 'Sun' ? styles.sunSymbol : ''} ${planet.name === 'Moon' ? styles.moonSymbol : ''} ${isAnimating ? styles.animating : ''}`}
                  fill={planetInfo?.color || '#fff'}
                  onClick={() => handleObjectClick('planet', planet)}
                  whileHover={{ scale: 1.4 }}
                  whileTap={{ scale: 0.8 }}
                  animate={isAnimating ? (
                    planet.name === 'Moon' ? { 
                      filter: ['brightness(1)', 'brightness(1.3)', 'brightness(1)'],
                      rotate: [0, 360]
                    } : planet.name === 'Sun' ? {
                      filter: ['brightness(1)', 'brightness(1.2)', 'brightness(1)'],
                      scale: [1, 1.05, 1]
                    } : {
                      rotate: planet.speed > 1 ? [0, 360] : [0, 180, 0]
                    }
                  ) : {}}
                  transition={isAnimating ? (
                    planet.name === 'Moon' ? {
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    } : planet.name === 'Sun' ? {
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut"
                    } : {
                      duration: 60 / (planet.speed || 1),
                      repeat: Infinity,
                      ease: "linear"
                    }
                  ) : {}}
                >
                  {planet.symbol}
                  {planet.isRetrograde && (
                    <motion.tspan 
                      className={styles.retrograde}
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      ℞
                    </motion.tspan>
                  )}
                </motion.text>
              </motion.g>
            );
          })}

          {/* Transit Planets */}
          {showTransits && transitData.positions.map((transit, index) => {
            const coords = degreeToCoords(transit.longitude, transitRadius, center, center);
            const planetInfo = PLANETS[transit.planet as keyof typeof PLANETS];
            
            return (
              <motion.g
                key={`transit-${transit.planet}`}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 0.8, scale: 1 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
              >
                {/* Transit planet ring */}
                <circle
                  cx={coords.x}
                  cy={coords.y}
                  r="8"
                  fill="none"
                  stroke={planetInfo?.color || '#fff'}
                  strokeWidth="2"
                  opacity="0.6"
                />
                
                {/* Transit planet symbol */}
                <motion.text
                  x={coords.x}
                  y={coords.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className={styles.transitSymbol}
                  fill={planetInfo?.color || '#fff'}
                  fontSize="12"
                  opacity="0.9"
                  onClick={() => handleObjectClick('transit', transit)}
                  whileHover={{ scale: 1.3, opacity: 1 }}
                  whileTap={{ scale: 0.9 }}
                  animate={isAnimating ? {
                    rotate: transit.retrograde ? [0, -360] : [0, 360]
                  } : {}}
                  transition={isAnimating ? {
                    duration: Math.abs(1 / (transit.speed || 0.1)) * 10,
                    repeat: Infinity,
                    ease: "linear"
                  } : {}}
                >
                  {planetInfo?.symbol || '●'}
                  {transit.retrograde && (
                    <motion.tspan 
                      className={styles.retrograde}
                      dx="2"
                      fontSize="8"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      ℞
                    </motion.tspan>
                  )}
                </motion.text>
              </motion.g>
            );
          })}

          {/* Transit Aspect Lines */}
          {showTransits && transitData.aspects.map((aspect, index) => {
            const natalPlanet = planetPositions.find(p => p.name.toLowerCase() === aspect.natalPlanet);
            const transitPlanet = transitData.positions.find(p => p.planet === aspect.transitPlanet);
            
            if (!natalPlanet || !transitPlanet) return null;
            
            const natalCoords = degreeToCoords(natalPlanet.longitude, planetRadius, center, center);
            const transitCoords = degreeToCoords(transitPlanet.longitude, transitRadius, center, center);
            
            const aspectColors = {
              conjunction: '#FFD700',
              sextile: '#00CED1', 
              square: '#FF4500',
              trine: '#32CD32',
              opposition: '#FF1493'
            };
            
            return (
              <motion.line
                key={`aspect-${index}`}
                x1={natalCoords.x}
                y1={natalCoords.y}
                x2={transitCoords.x}
                y2={transitCoords.y}
                stroke={aspectColors[aspect.aspect] || '#fff'}
                strokeWidth={aspect.strength === 'strong' ? 3 : aspect.strength === 'moderate' ? 2 : 1}
                opacity={aspect.strength === 'strong' ? 0.8 : aspect.strength === 'moderate' ? 0.6 : 0.4}
                strokeDasharray={aspect.applying ? "5,5" : "none"}
                initial={{ opacity: 0, pathLength: 0 }}
                animate={{ opacity: aspect.strength === 'strong' ? 0.8 : aspect.strength === 'moderate' ? 0.6 : 0.4, pathLength: 1 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              />
            );
          })}
        </svg>
        
        {/* Animation control */}
        <motion.button
          className={styles.animationToggle}
          onClick={() => setIsAnimating(!isAnimating)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title={isAnimating ? 'Pause animations' : 'Start animations'}
        >
          {isAnimating ? '⏸️' : '▶️'}
        </motion.button>
      </motion.div>

      {/* Modal for detailed information */}
      <AnimatePresence>
        {showModal && selectedObject && (
          <motion.div
            className={styles.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
          >
            <motion.div
              className={styles.modalContent}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button className={styles.closeButton} onClick={closeModal}>
                ✕
              </button>
              
              <div className={styles.modalHeader}>
                {selectedObject.type === 'planet' && (
                  <>
                    <span className={styles.modalSymbol}>
                      {(selectedObject.data as PlanetPosition).symbol}
                    </span>
                    <h3>{(selectedObject.data as PlanetPosition).name}</h3>
                  </>
                )}
                {selectedObject.type === 'transit' && (
                  <>
                    <span className={styles.modalSymbol}>
                      {PLANETS[(selectedObject.data as PlanetaryPosition).planet as keyof typeof PLANETS]?.symbol || '●'}
                    </span>
                    <h3>Transit {(selectedObject.data as PlanetaryPosition).planet}</h3>
                  </>
                )}
                {selectedObject.type === 'house' && (
                  <>
                    <span className={styles.modalSymbol}>🏠</span>
                    <h3>House {(selectedObject.data as HousePosition).number}</h3>
                  </>
                )}
                {selectedObject.type === 'sign' && (
                  <>
                    <span className={styles.modalSymbol}>
                      {(selectedObject.data as typeof ZODIAC_SIGNS[0]).symbol}
                    </span>
                    <h3>{(selectedObject.data as typeof ZODIAC_SIGNS[0]).name}</h3>
                  </>
                )}
              </div>
              
              <div className={styles.modalBody}>
                {selectedObject.type === 'planet' && (
                  <div>
                    <p><strong>Position:</strong> {(selectedObject.data as PlanetPosition).degree}° {(selectedObject.data as PlanetPosition).minute}&apos; {(selectedObject.data as PlanetPosition).sign}</p>
                    <p><strong>House:</strong> {(selectedObject.data as PlanetPosition).house}</p>
                    {(selectedObject.data as PlanetPosition).isRetrograde && (
                      <p className={styles.retrogradeText}><strong>Retrograde:</strong> This planet appears to move backward, intensifying its introspective energy.</p>
                    )}
                    <p className={styles.interpretation}>
                      {getPlantInterpretation(selectedObject.data as PlanetPosition)}
                    </p>
                  </div>
                )}
                {selectedObject.type === 'transit' && (
                  <div>
                    <p><strong>Current Position:</strong> {Math.floor((selectedObject.data as PlanetaryPosition).longitude)}° {(selectedObject.data as PlanetaryPosition).sign}</p>
                    <p><strong>Daily Motion:</strong> {Math.abs((selectedObject.data as PlanetaryPosition).speed).toFixed(2)}° per day</p>
                    {(selectedObject.data as PlanetaryPosition).retrograde && (
                      <p className={styles.retrogradeText}><strong>Retrograde:</strong> This planet is currently moving backward, creating reflective energy.</p>
                    )}
                    <p className={styles.interpretation}>
                      This transit planet is currently influencing your natal chart. Its position relative to your birth planets creates specific energetic patterns and opportunities for growth.
                    </p>
                    {transitData.aspects.length > 0 && (
                      <div className="mt-4">
                        <strong>Active Aspects:</strong>
                        <ul className="mt-2 space-y-1">
                          {transitData.aspects
                            .filter(aspect => aspect.transitPlanet === (selectedObject.data as PlanetaryPosition).planet)
                            .slice(0, 3)
                            .map((aspect, idx) => (
                            <li key={idx} className="text-sm">
                              {aspect.aspect} {aspect.natalPlanet} (orb: {aspect.orb.toFixed(1)}°)
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
                {selectedObject.type === 'house' && (
                  <div>
                    <p><strong>Cusp:</strong> {Math.floor((selectedObject.data as HousePosition).cusp)}° {(selectedObject.data as HousePosition).sign}</p>
                    <p><strong>Ruling Planet:</strong> {(selectedObject.data as HousePosition).ruler}</p>
                    <p className={styles.interpretation}>
                      {getHouseInterpretation((selectedObject.data as HousePosition).number)}
                    </p>
                  </div>
                )}
                {selectedObject.type === 'sign' && (
                  <div>
                    <p><strong>Element:</strong> {(selectedObject.data as typeof ZODIAC_SIGNS[0]).element}</p>
                    <p className={styles.interpretation}>
                      {getSignInterpretation(selectedObject.data as typeof ZODIAC_SIGNS[0])}
                    </p>
                  </div>
                )}
              </div>
              
              <button className={styles.backButton} onClick={closeModal}>
                Back to Chart
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Interpretation functions
function getPlantInterpretation(planet: PlanetPosition): string {
  const interpretations: Record<string, string> = {
    'Sun': 'The Sun represents your core identity, ego, and life purpose. It illuminates your authentic self and the energy you radiate to the world. Your solar placement shows how you express your individuality and creative power.',
    'Moon': 'The Moon governs your emotions, instincts, and subconscious patterns. It reveals your inner world, emotional needs, and how you seek comfort and security. This placement shows your intuitive nature and receptive qualities.',
    'Mercury': 'Mercury rules communication, thinking, and information processing. It shows how you learn, express ideas, and connect with others through words and thoughts. This placement reveals your mental agility and communication style.',
    'Venus': 'Venus represents love, beauty, values, and attraction. It shows what you find beautiful, how you express affection, and what brings you pleasure. This placement reveals your approach to relationships and aesthetic preferences.',
    'Mars': 'Mars governs action, energy, and desire. It shows how you pursue goals, assert yourself, and channel your passion. This placement reveals your drive, ambition, and how you handle conflict and competition.',
    'Jupiter': 'Jupiter represents expansion, wisdom, and growth. It shows where you seek meaning, truth, and abundance. This placement reveals your philosophical nature, optimism, and potential for personal development.',
    'Saturn': 'Saturn represents structure, discipline, and life lessons. It shows where you face challenges that lead to wisdom and mastery. This placement reveals your approach to responsibility and long-term achievement.',
    'Uranus': 'Uranus represents innovation, rebellion, and sudden change. It shows where you seek freedom and express your uniqueness. This placement reveals your progressive nature and capacity for breakthrough insights.',
    'Neptune': 'Neptune represents dreams, spirituality, and transcendence. It shows where you connect with the divine and express your imagination. This placement reveals your intuitive gifts and spiritual aspirations.',
    'Pluto': 'Pluto represents transformation, power, and regeneration. It shows where you experience deep change and uncover hidden truths. This placement reveals your capacity for renewal and psychological insight.'
  };
  
  return interpretations[planet.name] || 'This celestial body influences your personal journey in profound ways.';
}

function getHouseInterpretation(house: number): string {
  const interpretations: Record<number, string> = {
    1: 'The First House represents your identity, appearance, and first impressions. It shows how you present yourself to the world and your natural approach to new beginnings.',
    2: 'The Second House governs your values, possessions, and self-worth. It reveals your relationship with money, material security, and what you consider truly valuable.',
    3: 'The Third House rules communication, learning, and local environment. It shows your relationship with siblings, neighbors, and how you process and share information.',
    4: 'The Fourth House represents home, family, and emotional foundations. It reveals your roots, sense of security, and connection to your ancestral heritage.',
    5: 'The Fifth House governs creativity, romance, and self-expression. It shows your approach to fun, children, artistic pursuits, and matters of the heart.',
    6: 'The Sixth House rules daily routines, health, and service. It reveals your work habits, attention to detail, and approach to maintaining physical and mental well-being.',
    7: 'The Seventh House represents partnerships, marriage, and open enemies. It shows your approach to one-on-one relationships and what you seek in a committed partner.',
    8: 'The Eighth House governs transformation, shared resources, and the occult. It reveals your relationship with power, sexuality, death, and regenerative experiences.',
    9: 'The Ninth House rules higher learning, philosophy, and distant travel. It shows your quest for meaning, religious beliefs, and connection to foreign cultures.',
    10: 'The Tenth House represents career, reputation, and public image. It reveals your professional ambitions, authority figures, and how you want to be remembered.',
    11: 'The Eleventh House governs friendships, groups, and hopes for the future. It shows your social networks, humanitarian ideals, and collective aspirations.',
    12: 'The Twelfth House rules the subconscious, spirituality, and hidden aspects of life. It reveals your connection to the divine, karmic patterns, and need for solitude.'
  };
  
  return interpretations[house] || 'This house area of life holds special significance in your personal journey.';
}

function getSignInterpretation(sign: { name: string; element: string }): string {
  const interpretations: Record<string, string> = {
    'Aries': 'Aries energy is pioneering, courageous, and initiating. This fire sign brings enthusiasm, leadership, and a desire to be first. It represents new beginnings and the warrior spirit.',
    'Taurus': 'Taurus energy is stable, practical, and sensual. This earth sign brings patience, determination, and appreciation for beauty. It represents material security and enjoying life\'s pleasures.',
    'Gemini': 'Gemini energy is curious, communicative, and adaptable. This air sign brings versatility, wit, and love of learning. It represents mental agility and social connection.',
    'Cancer': 'Cancer energy is nurturing, intuitive, and protective. This water sign brings emotional depth, empathy, and strong family ties. It represents home, security, and maternal instincts.',
    'Leo': 'Leo energy is creative, confident, and dramatic. This fire sign brings warmth, generosity, and natural leadership. It represents self-expression and the desire to shine brightly.',
    'Virgo': 'Virgo energy is analytical, helpful, and perfectionistic. This earth sign brings attention to detail, service orientation, and practical wisdom. It represents healing and improvement.',
    'Libra': 'Libra energy is harmonious, diplomatic, and aesthetic. This air sign brings balance, fairness, and appreciation for beauty. It represents partnership and social grace.',
    'Scorpio': 'Scorpio energy is intense, transformative, and mysterious. This water sign brings emotional depth, psychological insight, and powerful regeneration. It represents death and rebirth.',
    'Sagittarius': 'Sagittarius energy is adventurous, philosophical, and optimistic. This fire sign brings wisdom-seeking, cultural exploration, and jovial spirit. It represents higher learning and freedom.',
    'Capricorn': 'Capricorn energy is ambitious, disciplined, and traditional. This earth sign brings structure, responsibility, and long-term vision. It represents achievement and authority.',
    'Aquarius': 'Aquarius energy is innovative, humanitarian, and independent. This air sign brings progressive thinking, social consciousness, and unique perspectives. It represents the future and collective ideals.',
    'Pisces': 'Pisces energy is compassionate, intuitive, and spiritual. This water sign brings imagination, empathy, and connection to the divine. It represents unity and transcendence.'
  };
  
  return interpretations[sign.name] || 'This zodiac sign brings its unique energy and perspective to your chart.';
}