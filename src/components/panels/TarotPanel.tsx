"use client";
import React, { useState } from "react";
import styles from "./TarotPanel.module.css";
export interface TarotPanelProps {
  className?: string;
}
/**
 * Interactive Tarot Panel - Left zone of the 3-panel layout
 *
 * Features:
 * - Deck selection and manipulation
 * - Multiple spread layouts (One Card, Past/Present/Future, Celtic Cross, etc.)
 * - Tactile card interactions with animations
 * - Archetype gallery background
 * - Accessibility-optimized card interactions
 */
export const TarotPanel: React.FC<TarotPanelProps> = ({ className = "" }) => {
  const [selectedSpread, setSelectedSpread] = useState<string>("one-card");
  const [selectedDeck, setSelectedDeck] = useState<string>("classic");
  const [isShuffling, setIsShuffling] = useState(false);
  const spreads = [
    {
      id: "one-card",
      name: "One Card",
      description: "Quick insight for your day",
    },
    {
      id: "three-card",
      name: "Past/Present/Future",
      description: "Timeline perspective",
    },
    {
      id: "celtic-cross",
      name: "Celtic Cross",
      description: "Comprehensive life reading",
    },
    {
      id: "zodiac",
      name: "Zodiac Spread",
      description: "12-card astrological layout",
    },
    { id: "career", name: "Career Path", description: "Professional guidance" },
    {
      id: "love",
      name: "Love & Relationships",
      description: "Matters of the heart",
    },
  ];
  const decks = [
    {
      id: "classic",
      name: "Classic Tarot",
      description: "Traditional Rider-Waite imagery",
    },
    {
      id: "mystic-arcana",
      name: "Mystic Arcana",
      description: "Our signature cosmic deck",
    },
    {
      id: "ethereal",
      name: "Ethereal Dreams",
      description: "Celestial-themed artwork",
    },
  ];
  const handleShuffle = async () => {
    setIsShuffling(true);
    // Simulate shuffle animation
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsShuffling(false);
  };
  const handleSpreadSelect = (spreadId: string) => {
    setSelectedSpread(spreadId);
    // Announce change for screen readers
    const announcement = `Selected ${spreads.find((s) => s.id === spreadId)?.name} spread`;
    const ariaLive = document.getElementById("tarot-announcements");
    if (ariaLive) {
      ariaLive.textContent = announcement;
    }
  };
  return (
    <div className={`${styles.container} ${className}`}>
      {/* Screen Reader Announcements */}
      <div id="tarot-announcements" aria-live="polite" className="sr-only" />
      {/* Panel Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>
            <span className={styles.icon}>🔮</span>
            Tarot Zone
          </h1>
          <p className={styles.subtitle}>
            Select your cards and discover your path
          </p>
        </div>
      </header>
      {/* Deck Selection */}
      <section
        className={styles.deckSection}
        aria-labelledby="deck-selection-title"
      >
        <h2 id="deck-selection-title" className={styles.sectionTitle}>
          Choose Your Deck
        </h2>
        <div className={styles.deckGrid}>
          {decks.map((deck) => (
            <button
              key={deck.id}
              className={`${styles.deckCard} ${
                selectedDeck === deck.id ? styles.selected : ""
              }`}
              onClick={() => setSelectedDeck(deck.id)}
              aria-pressed={selectedDeck === deck.id}
              aria-describedby={`deck-${deck.id}-desc`}
            >
              <div className={styles.deckPreview}>
                <div className={styles.cardBack} />
              </div>
              <div className={styles.deckInfo}>
                <h3 className={styles.deckName}>{deck.name}</h3>
                <p
                  id={`deck-${deck.id}-desc`}
                  className={styles.deckDescription}
                >
                  {deck.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      </section>
      {/* Spread Selection */}
      <section
        className={styles.spreadSection}
        aria-labelledby="spread-selection-title"
      >
        <h2 id="spread-selection-title" className={styles.sectionTitle}>
          Select Reading Type
        </h2>
        <div className={styles.spreadList}>
          {spreads.map((spread) => (
            <button
              key={spread.id}
              className={`${styles.spreadOption} ${
                selectedSpread === spread.id ? styles.selected : ""
              }`}
              onClick={() => handleSpreadSelect(spread.id)}
              aria-pressed={selectedSpread === spread.id}
              aria-describedby={`spread-${spread.id}-desc`}
            >
              <div className={styles.spreadIcon}>
                {spread.id === "one-card" && "🌟"}
                {spread.id === "three-card" && "📜"}
                {spread.id === "celtic-cross" && "✨"}
                {spread.id === "zodiac" && "♈"}
                {spread.id === "career" && "💼"}
                {spread.id === "love" && "💖"}
              </div>
              <div className={styles.spreadInfo}>
                <h3 className={styles.spreadName}>{spread.name}</h3>
                <p
                  id={`spread-${spread.id}-desc`}
                  className={styles.spreadDescription}
                >
                  {spread.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      </section>
      {/* Card Interaction Area */}
      <section
        className={styles.cardSection}
        aria-labelledby="card-interaction-title"
      >
        <h2 id="card-interaction-title" className={styles.sectionTitle}>
          Prepare Your Reading
        </h2>

        <div className={styles.deckArea}>
          <div
            className={`${styles.deck} ${isShuffling ? styles.shuffling : ""}`}
          >
            <div className={styles.cardStack}>
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={styles.card}
                  style={{
                    transform: `translateY(${-i * 2}px) rotate(${i * 0.5}deg)`,
                  }}
                />
              ))}
            </div>
          </div>

          <div className={styles.actions}>
            <button
              className={`${styles.actionButton} ${styles.shuffleButton}`}
              onClick={handleShuffle}
              disabled={isShuffling}
              aria-label={isShuffling ? "Shuffling cards..." : "Shuffle deck"}
            >
              {isShuffling ? (
                <>
                  <span className={styles.spinner} />
                  Shuffling...
                </>
              ) : (
                <>🔄 Shuffle</>
              )}
            </button>

            <button
              className={`${styles.actionButton} ${styles.drawButton}`}
              disabled={isShuffling}
              aria-label="Draw cards for reading"
            >
              ✨ Draw Cards
            </button>
          </div>
        </div>
      </section>
      {/* Quick Reading Section */}
      <section className={styles.quickSection}>
        <h2 className={styles.sectionTitle}>Quick Actions</h2>
        <div className={styles.quickActions}>
          <button className={styles.quickButton}>🎯 Daily Card</button>
          <button className={styles.quickButton}>🌙 Moon Card</button>
          <button className={styles.quickButton}>💫 Surprise Me</button>
        </div>
      </section>
      {/* Archetype Gallery Background */}
      <div className={styles.archetypeGallery} aria-hidden="true">
        <div className={styles.archetypeSymbol}>♈</div>
        <div className={styles.archetypeSymbol}>♉</div>
        <div className={styles.archetypeSymbol}>♊</div>
        <div className={styles.archetypeSymbol}>♋</div>
      </div>
    </div>
  );
};
