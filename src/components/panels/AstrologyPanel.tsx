'use client';
 
import React, { useState, useEffect } from 'react';
import styles from './AstrologyPanel.module.css';
export interface AstrologyPanelProps {
  className?: string;
}
interface PlanetaryPosition {
  name: string;
  sign: string;
  degree: number;
  symbol: string;
  energy: string;
}
interface MoonPhase {
  phase: string;
  illumination: number;
  symbol: string;
  energy: string;
}
/**
 * Astrology Panel - Right zone of the 3-panel layout
 * 
 * Features:
 * - Live night sky visualization with animated constellations
 * - Real-time planetary positions and aspects
 * - Interactive birth chart modal
 * - Personalized horoscopes (daily, monthly, yearly)
 * - Moon phase tracking and lunar calendar
 * - Cosmic weather integration
 */
export const AstrologyPanel: React.FC<AstrologyPanelProps> = ({ className = '' }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedView, setSelectedView] = useState<'sky' | 'chart' | 'horoscope' | 'moon'>('sky');
  const [moonPhase] = useState<MoonPhase>({
    phase: 'Waxing Crescent',
    illumination: 0.23,
    symbol: '🌒',
    energy: 'Setting intentions and new beginnings'
  });
  const [planetaryPositions] = useState<PlanetaryPosition[]>([
    { name: 'Sun', sign: 'Capricorn', degree: 18.5, symbol: '☉', energy: 'Achievement and structure' },
    { name: 'Moon', sign: 'Pisces', degree: 12.3, symbol: '☽', energy: 'Intuition and dreams' },
    { name: 'Mercury', sign: 'Capricorn', degree: 25.1, symbol: '☿', energy: 'Practical communication' },
    { name: 'Venus', sign: 'Aquarius', degree: 3.7, symbol: '♀', energy: 'Innovative relationships' },
    { name: 'Mars', sign: 'Sagittarius', degree: 29.2, symbol: '♂', energy: 'Adventurous action' },
    { name: 'Jupiter', sign: 'Taurus', degree: 8.4, symbol: '♃', energy: 'Grounded expansion' }
  ]);
  const views = [
    { id: 'sky', name: 'Night Sky', icon: '🌌', description: 'Live cosmic view' },
    { id: 'chart', name: 'Birth Chart', icon: '🔮', description: 'Personal astrology' },
    { id: 'horoscope', name: 'Horoscope', icon: '📜', description: 'Daily guidance' },
    { id: 'moon', name: 'Moon Cycle', icon: '🌙', description: 'Lunar insights' }
  ];
  const zodiacSigns = [
    { name: 'Aries', symbol: '♈', dates: 'Mar 21 - Apr 19', element: 'Fire' },
    { name: 'Taurus', symbol: '♉', dates: 'Apr 20 - May 20', element: 'Earth' },
    { name: 'Gemini', symbol: '♊', dates: 'May 21 - Jun 20', element: 'Air' },
    { name: 'Cancer', symbol: '♋', dates: 'Jun 21 - Jul 22', element: 'Water' },
    { name: 'Leo', symbol: '♌', dates: 'Jul 23 - Aug 22', element: 'Fire' },
    { name: 'Virgo', symbol: '♍', dates: 'Aug 23 - Sep 22', element: 'Earth' },
    { name: 'Libra', symbol: '♎', dates: 'Sep 23 - Oct 22', element: 'Air' },
    { name: 'Scorpio', symbol: '♏', dates: 'Oct 23 - Nov 21', element: 'Water' },
    { name: 'Sagittarius', symbol: '♐', dates: 'Nov 22 - Dec 21', element: 'Fire' },
    { name: 'Capricorn', symbol: '♑', dates: 'Dec 22 - Jan 19', element: 'Earth' },
    { name: 'Aquarius', symbol: '♒', dates: 'Jan 20 - Feb 18', element: 'Air' },
    { name: 'Pisces', symbol: '♓', dates: 'Feb 19 - Mar 20', element: 'Water' }
  ];
  // Update current time every minute
 
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);
  const handleViewChange = (viewId: string) => {
    setSelectedView(viewId as typeof selectedView);
  };
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });
  };
  return (
    <div className={`${styles.container} ${className}`}>
      {/* Panel Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>
            <span className={styles.icon}>✨</span>
            Astrology Zone
          </h1>
          <div className={styles.currentTime}>
            <div className={styles.date}>{formatDate(currentDate)}</div>
            <div className={styles.time}>{formatTime(currentDate)}</div>
          </div>
        </div>
      </header>
      {/* View Navigation */}
      <nav className={styles.viewNav} role="tablist" aria-label="Astrology views">
        {views.map(view => (
          <button
            key={view.id}
            role="tab"
            aria-selected={selectedView === view.id}
            aria-controls={`${view.id}-panel`}
            className={`${styles.viewButton} ${selectedView === view.id ? styles.active : ''
              }`}
            onClick={() => handleViewChange(view.id)}
          >
            <span className={styles.viewIcon}>{view.icon}</span>
            <span className={styles.viewName}>{view.name}</span>
          </button>
        ))}
      </nav>
      {/* Main Content Area */}
      <main className={styles.mainContent}>
        {/* Night Sky View */}
        {selectedView === 'sky' && (
          <section
            id="sky-panel"
            className={styles.skyView}
            role="tabpanel"
            aria-labelledby="sky-tab"
          >
            <div className={styles.skyContainer}>
              <div className={styles.constellation}>
                <h3 className={styles.sectionTitle}>Current Sky</h3>
                <div className={styles.constellationMap}>
                  {/* Simplified constellation visualization */}
                  <div className={styles.starGroup}>
                    <span className={styles.star} style={{ top: '20%', left: '30%' }}>✦</span>
                    <span className={styles.star} style={{ top: '40%', left: '45%' }}>✧</span>
                    <span className={styles.star} style={{ top: '60%', left: '35%' }}>✦</span>
                    <span className={styles.star} style={{ top: '30%', left: '70%' }}>✧</span>
                    <span className={styles.star} style={{ top: '50%', left: '80%' }}>✦</span>
                    <span className={styles.star} style={{ top: '70%', left: '65%' }}>✧</span>
                  </div>
                  <div className={styles.constellationLabel}>Orion</div>
                </div>
              </div>
              <div className={styles.cosmicWeather}>
                <h4 className={styles.weatherTitle}>Cosmic Weather</h4>
                <div className={styles.weatherCard}>
                  <span className={styles.weatherIcon}>🌙</span>
                  <div className={styles.weatherInfo}>
                    <div className={styles.weatherMain}>Moon in Pisces</div>
                    <div className={styles.weatherSub}>Heightened intuition and dreams</div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
        {/* Birth Chart View */}
        {selectedView === 'chart' && (
          <section
            id="chart-panel"
            className={styles.chartView}
            role="tabpanel"
            aria-labelledby="chart-tab"
          >
            <div className={styles.chartContainer}>
              <h3 className={styles.sectionTitle}>Your Birth Chart</h3>
              <div className={styles.chartWheel}>
                <div className={styles.chartCenter}>
                  <span className={styles.chartSymbol}>☉</span>
                </div>
                <div className={styles.chartRing}>
                  {zodiacSigns.slice(0, 6).map((sign, index) => (
                    <div
                      key={sign.name}
                      className={styles.chartSegment}
                      style={{ transform: `rotate(${index * 60}deg)` }}
                    >
                      <span className={styles.chartSignSymbol}>{sign.symbol}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className={styles.chartInfo}>
                <p className={styles.chartDescription}>
                  Create your personalized birth chart by entering your birth details.
                </p>
                <button className={styles.createChartButton}>
                  ✨ Create My Chart
                </button>
              </div>
            </div>
          </section>
        )}
        {/* Horoscope View */}
        {selectedView === 'horoscope' && (
          <section
            id="horoscope-panel"
            className={styles.horoscopeView}
            role="tabpanel"
            aria-labelledby="horoscope-tab"
          >
            <div className={styles.horoscopeContainer}>
              <h3 className={styles.sectionTitle}>Daily Horoscope</h3>
              <div className={styles.signSelector}>
                <h4 className={styles.selectorTitle}>Select Your Sign</h4>
                <div className={styles.signGrid}>
                  {zodiacSigns.map(sign => (
                    <button
                      key={sign.name}
                      className={styles.signButton}
                      aria-label={`${sign.name} horoscope`}
                    >
                      <span className={styles.signSymbol}>{sign.symbol}</span>
                      <span className={styles.signName}>{sign.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}
        {/* Moon Cycle View */}
        {selectedView === 'moon' && (
          <section
            id="moon-panel"
            className={styles.moonView}
            role="tabpanel"
            aria-labelledby="moon-tab"
          >
            <div className={styles.moonContainer}>
              <h3 className={styles.sectionTitle}>Lunar Cycle</h3>
              <div className={styles.currentMoon}>
                <div className={styles.moonPhaseCard}>
                  <div className={styles.moonSymbol}>{moonPhase.symbol}</div>
                  <div className={styles.moonDetails}>
                    <h4 className={styles.moonPhaseName}>{moonPhase.phase}</h4>
                    <div className={styles.moonIllumination}>
                      {Math.round(moonPhase.illumination * 100)}% illuminated
                    </div>
                    <p className={styles.moonEnergy}>{moonPhase.energy}</p>
                  </div>
                </div>
              </div>
              <div className={styles.moonCalendar}>
                <h4 className={styles.calendarTitle}>This Month&apos;s Phases</h4>
                <div className={styles.phasesList}>
                  <div className={styles.phaseItem}>
                    <span className={styles.phaseIcon}>🌑</span>
                    <div className={styles.phaseInfo}>
                      <div className={styles.phaseName}>New Moon</div>
                      <div className={styles.phaseDate}>Jan 11</div>
                    </div>
                  </div>
                  <div className={styles.phaseItem}>
                    <span className={styles.phaseIcon}>🌓</span>
                    <div className={styles.phaseInfo}>
                      <div className={styles.phaseName}>First Quarter</div>
                      <div className={styles.phaseDate}>Jan 18</div>
                    </div>
                  </div>
                  <div className={styles.phaseItem}>
                    <span className={styles.phaseIcon}>🌕</span>
                    <div className={styles.phaseInfo}>
                      <div className={styles.phaseName}>Full Moon</div>
                      <div className={styles.phaseDate}>Jan 25</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
      {/* Planetary Positions */}
      <section className={styles.planetaryPositions} aria-label="Current planetary positions">
        <h3 className={styles.sectionTitle}>Planetary Positions</h3>
        <div className={styles.planetsList}>
          {planetaryPositions.map(planet => (
            <div key={planet.name} className={styles.planetItem}>
              <span className={styles.planetSymbol}>{planet.symbol}</span>
              <div className={styles.planetInfo}>
                <div className={styles.planetName}>{planet.name}</div>
                <div className={styles.planetPosition}>
                  {planet.degree.toFixed(1)}° {planet.sign}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
      {/* Quick Actions */}
      <section className={styles.quickActions}>
        <button className={styles.quickButton}>
          🔮 Birth Chart
        </button>
        <button className={styles.quickButton}>
          📅 Lunar Calendar
        </button>
        <button className={styles.quickButton}>
          ⭐ Compatibility
        </button>
      </section>
      {/* Constellation Background */}
      <div className={styles.constellationBackground} aria-hidden="true">
        <div className={styles.backgroundStar} style={{ top: '10%', left: '15%' }}>✦</div>
        <div className={styles.backgroundStar} style={{ top: '25%', right: '20%' }}>✧</div>
        <div className={styles.backgroundStar} style={{ bottom: '30%', left: '25%' }}>✦</div>
        <div className={styles.backgroundStar} style={{ bottom: '15%', right: '15%' }}>✧</div>
      </div>
    </div>
  );
};
