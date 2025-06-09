/**
 * Color Design Tokens
 * 
 * Semantic color definitions for the Mystic Arcana brand.
 * These tokens provide consistent color usage across components.
 */

export const colorTokens = {
  // Brand colors
  brand: {
    primary: '#843dff',      // Mystic purple
    secondary: '#ffd700',    // Cosmic gold
    tertiary: '#4b0082',     // Deep indigo
  },

  // UI colors
  background: {
    primary: '#0a0a0a',      // Deep space black
    secondary: '#171717',     // Lighter cosmic dark
    elevated: '#262626',      // Panel backgrounds
    glass: 'rgba(147, 112, 219, 0.1)', // Glass overlay
  },

  text: {
    primary: '#ffffff',       // Primary text
    secondary: '#d4d4d4',     // Secondary text
    muted: '#a3a3a3',        // Muted text
    accent: '#ffd700',       // Accent text (gold)
    mystical: '#dda0dd',     // Mystical elements
  },

  // Interactive states
  interactive: {
    hover: 'rgba(132, 61, 255, 0.8)',
    active: 'rgba(132, 61, 255, 1)',
    focus: 'rgba(255, 215, 0, 0.4)',
    disabled: 'rgba(163, 163, 163, 0.3)',
  },

  // Panel-specific colors
  panels: {
    tarot: {
      primary: '#9370db',     // Medium slate blue
      accent: '#dda0dd',      // Plum
      glow: 'rgba(147, 112, 219, 0.4)',
    },
    reader: {
      primary: '#ffd700',     // Gold
      accent: '#ffb347',      // Peach
      glow: 'rgba(255, 215, 0, 0.4)',
    },
    astrology: {
      primary: '#4b0082',     // Indigo
      accent: '#6a5acd',      // Slate blue
      glow: 'rgba(75, 0, 130, 0.4)',
    },
  },

  // Status colors
  status: {
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
    cosmic: '#8a2be2',      // Blue violet for special states
  },

  // Cosmic weather colors
  cosmic: {
    newMoon: '#1a1a2e',
    waxingMoon: '#16213e',
    fullMoon: '#e94560',
    waningMoon: '#0f3460',
    retrograde: '#e94560',
    favorable: '#10b981',
    challenging: '#f59e0b',
  },

  // Accessibility helpers
  accessibility: {
    focusRing: '#ffd700',
    screenReaderOnly: 'transparent',
    highContrast: '#ffffff',
  },
} as const;

export type ColorTokens = typeof colorTokens;