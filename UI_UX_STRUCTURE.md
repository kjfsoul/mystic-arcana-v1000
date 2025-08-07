# Mystic Arcana UI/UX Structure

This document outlines the complete UI/UX directory structure for the Mystic Arcana platform, featuring a 3-panel layout with cosmic theming and accessibility-first design.

## Directory Structure Overview

```
src/
├── components/                 # All UI components
│   ├── layout/                # Layout components
│   │   ├── ThreePanelLayout/  # Main 3-panel interface
│   │   ├── Header/            # Site header
│   │   ├── Footer/            # Site footer
│   │   └── Navigation/        # Navigation components
│   ├── panels/                # Main panel components
│   │   ├── TarotPanel/        # Left panel - Tarot readings
│   │   ├── ReaderPanel/       # Center panel - Virtual reader
│   │   └── AstrologyPanel/    # Right panel - Astrology charts
│   ├── readers/               # Virtual reader components
│   │   ├── VirtualReader/     # Animated reader avatar
│   │   ├── ReaderAvatar/      # Avatar display
│   │   └── ReaderChat/        # Chat interface
│   ├── animations/            # Animation components
│   │   ├── CosmicBackground/  # Galaxy background effects
│   │   ├── CardAnimations/    # Tarot card animations
│   │   └── TransitionEffects/ # Panel transitions
│   ├── effects/               # WebGL and canvas effects
│   │   ├── ParticleSystem/    # Cosmic particles
│   │   ├── GalaxyShader/      # WebGL galaxy shader
│   │   └── StarField/         # Parallax star field
│   ├── ui/                    # Base UI components
│   │   ├── Button/            # Styled buttons
│   │   ├── Card/              # Content cards
│   │   ├── Modal/             # Modal dialogs
│   │   ├── Tooltip/           # Tooltips
│   │   ├── Input/             # Form inputs
│   │   ├── Select/            # Dropdown selects
│   │   └── Dialog/            # Dialog components
│   ├── accessibility/         # A11y components
│   │   ├── SkipLinks/         # Skip navigation links
│   │   ├── FocusManager/      # Focus management
│   │   └── ScreenReaderAnnouncements/ # SR announcements
│   └── overlays/              # Modal overlays
│       ├── WelcomeModal/      # Onboarding modal
│       ├── ReadingOverlay/    # Reading interface overlay
│       └── AstrologyOverlay/  # Chart overlay
├── design/                    # Design system
│   ├── themes/                # Theme configurations
│   │   └── cosmicTheme.ts     # Main cosmic theme
│   ├── tokens/                # Design tokens
│   │   └── colors.ts          # Color palette
│   └── constants/             # Design constants
│       ├── breakpoints.ts     # Responsive breakpoints
│       ├── animations.ts      # Animation constants
│       └── typography.ts      # Typography scale
├── utils/                     # Utility functions
│   ├── accessibility/         # A11y utilities
│   │   └── useAccessibility.ts # Accessibility hooks
│   ├── animations/            # Animation utilities
│   │   ├── useAnimation.ts    # Animation hooks
│   │   └── useParallax.ts     # Parallax effects
│   └── cosmic-weather/        # Cosmic data utilities
│       └── useCosmicWeather.ts # Real-time cosmic data
└── tests/                     # Test utilities
    ├── accessibility/         # A11y testing
    │   └── a11y.test.ts       # Accessibility tests
    └── visual-regression/     # Visual testing
        └── screenshots/       # Test screenshots
```

## Core Layout: Three-Panel System

### Panel Structure

- **Left Panel (Tarot)**: Card selection, spreads, interpretations
- **Center Panel (Reader)**: Virtual reader avatar and chat interface
- **Right Panel (Astrology)**: Natal charts, transits, cosmic weather

### Responsive Behavior

- Desktop: All three panels visible
- Tablet: Active panel expanded, others collapsed
- Mobile: Single panel view with bottom navigation

## Key Components

### 1. ThreePanelLayout

**Location**: `/components/layout/ThreePanelLayout/`

- Main container managing all three panels
- Handles responsive behavior and panel switching
- Integrates cosmic background effects
- Manages accessibility regions and navigation

### 2. TarotPanel

**Location**: `/components/panels/TarotPanel/`

- Interactive tarot card deck with shuffle animations
- Multiple spread layouts (Celtic Cross, Three Card, Single)
- Card interpretations with cosmic weather influence
- Screen reader support for card descriptions

### 3. ReaderPanel

**Location**: `/components/panels/ReaderPanel/`

- Animated virtual reader avatar (Celestia)
- Real-time chat interface with typing indicators
- Mood-based personality expressions
- Message history and conversation context

### 4. AstrologyPanel

**Location**: `/components/panels/AstrologyPanel/`

- Interactive natal chart visualization
- Real-time planetary positions and transits
- Cosmic weather updates and alerts
- WebGL-powered galaxy background

## Animation & Effects System

### Cosmic Background

**Location**: `/components/animations/CosmicBackground/`

- Multi-layer parallax star field
- Animated nebula clouds with color shifts
- Shooting stars and cosmic particles
- Performance-optimized with RAF
- Respects `prefers-reduced-motion`

### Card Animations

**Location**: `/components/animations/CardAnimations/`

- Smooth card shuffle and flip effects
- Reveal animations for readings
- Floating and glowing effects
- Physics-based movements

### WebGL Effects

**Location**: `/components/effects/`

- **StarField**: Parallax star layers with depth
- **ParticleSystem**: Floating cosmic dust and energy orbs
- **GalaxyShader**: Rotating spiral galaxy background

## Design System

### Cosmic Theme

**Location**: `/design/themes/cosmicTheme.ts`

- Brand colors: purples, golds, deep blues
- Typography: Mystical and readable fonts
- Spacing and border radius scales
- Shadow system with cosmic glow effects
- Animation timing and easing curves

### Color Tokens

**Location**: `/design/tokens/colors.ts`

- Semantic color definitions
- Panel-specific color schemes
- Accessibility-compliant contrast ratios
- Status and state color indicators

## Accessibility Features

### Built-in A11Y Support

- WCAG AA compliance minimum
- Screen reader announcements for dynamic content
- Keyboard navigation for all interactive elements
- Focus management for modals and overlays
- High contrast mode support
- Reduced motion preferences respected

### Accessibility Utilities

**Location**: `/utils/accessibility/useAccessibility.ts`

- Live region announcements
- Focus trap management
- Keyboard navigation helpers
- ARIA attribute management

## Cosmic Weather Integration

### Real-time Data

**Location**: `/utils/cosmic-weather/useCosmicWeather.ts`

- Moon phase calculations
- Planetary hour tracking
- Transit monitoring and alerts
- Retrograde notifications
- Tarot timing recommendations

### Integration Points

- Influences tarot card interpretations
- Affects reader personality and responses
- Updates astrology panel data
- Provides optimal reading timing suggestions

## Component Guidelines

### File Structure

Each component follows this structure:

```
ComponentName/
├── ComponentName.tsx          # Main component
├── ComponentName.module.css   # Component styles
├── ComponentName.test.tsx     # Unit tests
└── index.ts                   # Export file
```

### Naming Conventions

- **Components**: PascalCase (e.g., `VirtualReader`)
- **Files**: PascalCase for components, camelCase for utilities
- **CSS Classes**: kebab-case with BEM methodology
- **Props**: camelCase with descriptive names

### TypeScript Integration

- Full TypeScript support for all components
- Strict type definitions for props and state
- Shared types in `/types/` directory
- Design token type safety

## Performance Considerations

### Optimization Strategies

- Lazy loading for heavy animation components
- Canvas and WebGL for GPU-accelerated effects
- RequestAnimationFrame for smooth animations
- Component memoization for expensive renders
- Image optimization and progressive loading

### Bundle Management

- Tree-shaking friendly exports
- Dynamic imports for animation-heavy components
- CSS modules for style isolation
- Minimal runtime dependencies

## Development Workflow

### Getting Started

1. Install dependencies: `npm install`
2. Start development server: `npm run dev`
3. Access component storybook: `npm run storybook`
4. Run accessibility tests: `npm run test:a11y`

### Testing Strategy

- Unit tests for component logic
- Integration tests for panel interactions
- Accessibility testing with axe-core
- Visual regression testing for animations
- Performance testing for WebGL effects

## Future Enhancements

### Planned Features

- Voice synthesis for reader responses
- 3D avatar integration with Ready Player Me
- Advanced WebGL shaders for enhanced effects
- Real-time multiplayer readings
- AR overlay for physical tarot cards
- Machine learning for personalized interpretations

### Extensibility

- Plugin system for custom readers
- Theme marketplace for different aesthetics
- Custom animation presets
- Modular panel system for brand variations
- API integration for real ephemeris data

---

This structure provides a solid foundation for the Mystic Arcana platform while maintaining flexibility for future growth and customization.
