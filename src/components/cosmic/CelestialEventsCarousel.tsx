"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./CelestialEventsCarousel.module.css";
interface CelestialEvent {
  id: string;
  type:
    | "moon-phase"
    | "retrograde"
    | "eclipse"
    | "conjunction"
    | "meteor-shower"
    | "solstice";
  title: string;
  description: string;
  date: Date;
  impact: "high" | "medium" | "low";
  zodiacSigns?: string[];
}
interface CelestialEventsCarouselProps {
  onClick?: () => void;
}
export const CelestialEventsCarousel: React.FC<
  CelestialEventsCarouselProps
> = ({ onClick }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [events] = useState<CelestialEvent[]>([
    {
      id: "1",
      type: "moon-phase",
      title: "New Moon in Capricorn",
      description: "A powerful time for setting intentions and new beginnings",
      date: new Date(Date.now() + 86400000 * 2),
      impact: "high",
      zodiacSigns: ["Capricorn", "Cancer"],
    },
    {
      id: "2",
      type: "retrograde",
      title: "Mercury Retrograde Ends",
      description: "Communication clears, technology stabilizes",
      date: new Date(Date.now() + 86400000 * 7),
      impact: "high",
      zodiacSigns: ["Gemini", "Virgo"],
    },
    {
      id: "3",
      type: "conjunction",
      title: "Venus-Jupiter Conjunction",
      description: "Expansion in love and abundance",
      date: new Date(Date.now() + 86400000 * 14),
      impact: "medium",
      zodiacSigns: ["Taurus", "Libra", "Pisces"],
    },
    {
      id: "4",
      type: "eclipse",
      title: "Lunar Eclipse in Scorpio",
      description: "Deep transformation and emotional release",
      date: new Date(Date.now() + 86400000 * 30),
      impact: "high",
      zodiacSigns: ["Scorpio", "Taurus"],
    },
  ]);
  // Auto-rotate carousel

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % events.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [events.length]);
  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + events.length) % events.length);
  };
  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % events.length);
  };
  const getEventIcon = (type: CelestialEvent["type"]) => {
    const icons = {
      "moon-phase": "🌙",
      retrograde: "♂️",
      eclipse: "🌒",
      conjunction: "✨",
      "meteor-shower": "☄️",
      solstice: "☀️",
    };
    return icons[type] || "⭐";
  };
  const getImpactColor = (impact: CelestialEvent["impact"]) => {
    const colors = {
      high: "var(--color-impact-high)",
      medium: "var(--color-impact-medium)",
      low: "var(--color-impact-low)",
    };
    return colors[impact];
  };
  const formatDate = (date: Date) => {
    const days = Math.ceil(
      (date.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
    );
    if (days === 0) return "Today";
    if (days === 1) return "Tomorrow";
    if (days < 7) return `In ${days} days`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };
  return (
    <div className={styles.carouselContainer} onClick={onClick}>
      <h2 className={styles.title}>Cosmic Events</h2>

      <div className={styles.carousel}>
        <button
          className={styles.navButton}
          onClick={(e) => {
            e.stopPropagation();
            handlePrevious();
          }}
          aria-label="Previous event"
        >
          ←
        </button>
        <AnimatePresence mode="wait">
          <motion.div
            key={events[currentIndex].id}
            className={styles.eventCard}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5 }}
          >
            <div className={styles.eventHeader}>
              <span className={styles.eventIcon}>
                {getEventIcon(events[currentIndex].type)}
              </span>
              <span
                className={styles.eventDate}
                style={{ color: getImpactColor(events[currentIndex].impact) }}
              >
                {formatDate(events[currentIndex].date)}
              </span>
            </div>
            <h3 className={styles.eventTitle}>{events[currentIndex].title}</h3>
            <p className={styles.eventDescription}>
              {events[currentIndex].description}
            </p>
            {events[currentIndex].zodiacSigns && (
              <div className={styles.zodiacSigns}>
                <span className={styles.zodiacLabel}>Affects:</span>
                {events[currentIndex].zodiacSigns.map((sign, index) => (
                  <span key={sign} className={styles.zodiacSign}>
                    {sign}
                    {index < events[currentIndex].zodiacSigns!.length - 1
                      ? ", "
                      : ""}
                  </span>
                ))}
              </div>
            )}
            <div
              className={styles.impactIndicator}
              style={
                {
                  "--impact-color": getImpactColor(events[currentIndex].impact),
                } as React.CSSProperties
              }
            >
              <span className={styles.impactDot} />
              <span className={styles.impactLabel}>
                {events[currentIndex].impact} impact
              </span>
            </div>
          </motion.div>
        </AnimatePresence>
        <button
          className={styles.navButton}
          onClick={(e) => {
            e.stopPropagation();
            handleNext();
          }}
          aria-label="Next event"
        >
          →
        </button>
      </div>
      <div className={styles.indicators}>
        {events.map((_, index) => (
          <button
            key={index}
            className={`${styles.indicator} ${index === currentIndex ? styles.active : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIndex(index);
            }}
            aria-label={`Go to event ${index + 1}`}
          />
        ))}
      </div>
      <motion.div
        className={styles.clickHint}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
      >
        Click for cosmic perspective →
      </motion.div>
    </div>
  );
};
