# MysticalShuffleAnimation Component

A mystical, casino-style card shuffling animation component built with Framer Motion, React, and Tailwind CSS.

## Features

- **Central Deck Icon**: Animated deck with rotating shuffle icon
- **Glowing Aura Effect**: Dynamic glow that pulses during shuffle
- **Spinning Card Fan**: 8 cards that fan out in a circular pattern during shuffle
- **Star Particles**: Floating particles that emanate from the deck
- **Sound Integration**: Plays shuffle sound effect (with Web Audio API fallback)
- **Responsive Design**: Three size variants (small, medium, large)
- **Smooth Animations**: 60fps performance with optimized transitions
- **Interactive States**: Hover effects and tap feedback

## Props

```typescript
interface MysticalShuffleAnimationProps {
  onShuffleComplete?: () => void; // Called when shuffle animation completes
  onShuffleStart?: () => void; // Called when shuffle starts
  isShuffling: boolean; // Current shuffle state
  onTriggerShuffle: () => void; // Function to trigger shuffle logic
  className?: string; // Additional CSS classes
  size?: "small" | "medium" | "large"; // Size variant (default: "medium")
}
```

## Animation Sequence

1. **Initial State**: Deck glows subtly with hover instruction
2. **Hover**: Enhanced glow, instruction changes to "Click to shuffle"
3. **Click**:
   - Deck expands and starts rotating
   - 8 cards fan out in circular pattern
   - Cards rotate individually while orbiting
   - Star particles spawn and drift outward
   - Glowing trails follow card movements
4. **Completion**: Bright flash effect as cards reassemble

## Size Configurations

- **Small** (Mobile): 32x44 deck, 80px fan radius
- **Medium** (Tablet): 48x64 deck, 120px fan radius
- **Large** (Desktop): 64x80 deck, 160px fan radius

## Usage Example

```tsx
<MysticalShuffleAnimation
  isShuffling={isShuffling}
  onTriggerShuffle={performShuffle}
  onShuffleStart={() => console.log("Shuffle started")}
  onShuffleComplete={() => console.log("Shuffle completed")}
  size={isMobile ? "small" : "medium"}
/>
```

## Sound Effects

The component attempts to play a shuffle sound from `/public/sounds/card-shuffle.mp3`. If unavailable, it falls back to a Web Audio API generated click sound.

## Performance Notes

- Uses GPU-accelerated transforms for smooth 60fps
- Particles are dynamically generated and cleaned up
- Optimized for touch devices with proper tap states
- Minimal re-renders through careful state management
