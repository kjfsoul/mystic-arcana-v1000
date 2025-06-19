# Responsive Layout Refactor Prompt

<prompt>
<objective>
Refactor the main page layout in Mystic Arcana to be fully responsive, fixing the layout issue where content is cut off on mobile devices. The current implementation has multiple competing layout systems that need consolidation.
</objective>

<context>
The current Mystic Arcana project has **4 different layout implementations** causing confusion:

1. **`src/app/page.tsx`** - Main entry point with "Cosmic Lobby" design
2. **`src/components/layout/ThreePanelLayout.tsx`** - Original 3-panel layout
3. **`src/components/layout/EnhancedHomepage.tsx`** - Enhanced homepage variant  
4. **`src/components/layout/RefactoredHomepage.tsx`** - Refactored 2-panel design

The layout works on desktop (three columns) but fails on mobile, causing panels to be squished or cut off. The desired behavior is a three-column grid on large screens (`lg` breakpoint and up) that collapses into a single-column vertical stack on smaller screens (mobile).

**Current Issues:**
- Multiple layout systems create maintenance complexity
- Mobile users experience cut-off content and poor UX
- Panel components don't adapt properly to screen size
- Touch interactions are not optimized for mobile

**Key Files Involved:**
- `src/app/page.tsx` (main entry point)
- `src/app/page.module.css` (main styles)
- `src/components/panels/TarotZonePreview.tsx`
- `src/components/panels/AstrologyZonePreview.tsx`
- `src/components/cosmic/CelestialEventsCarousel.tsx`
</context>

<workflow>
This is a refactoring task. I will provide the existing code structure, and you will provide the updated, responsive version that consolidates the layout systems and fixes mobile responsiveness.
</workflow>

<task>
Update the main page layout system to be fully responsive. You must:

1. **Choose ONE primary layout system** and consolidate the others
2. **Use responsive Tailwind CSS classes** to achieve the layout change
3. **Apply mobile-first approach** with `lg:` prefixes for desktop view
4. **Fix the CosmicLobby component** to use proper responsive grid/flexbox
5. **Ensure all panels stack vertically on mobile** and display in columns on desktop

Here is the current structure of `src/app/page.tsx`:

```typescript
// src/app/page.tsx - Current Implementation
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GalaxyBackground } from '../components/effects/GalaxyBackground/GalaxyBackground';
import { TarotZonePreview } from '../components/panels/TarotZonePreview';
import { AstrologyZonePreview } from '../components/panels/AstrologyZonePreview';
import { CelestialEventsCarousel } from '../components/cosmic/CelestialEventsCarousel';
import { Header } from '../components/layout/Header';

type ViewMode = 'lobby' | 'tarot-room' | 'astrology-room' | 'awe-view';

export default function Home() {
  const [viewMode, setViewMode] = useState<ViewMode>('lobby');

  return (
    <main className={styles.main}>
      <Header />
      <div className={styles.galaxyLayer}>
        <GalaxyBackground intensity={galaxyIntensity} showMilkyWay={true} animated={true} />
      </div>

      <AnimatePresence mode="wait">
        {viewMode === 'lobby' && (
          <CosmicLobby
            key="lobby"
            onEnterTarot={handleEnterTarotRoom}
            onEnterAstrology={handleEnterAstrologyRoom}
            onEnterAweView={handleEnterAweView}
          />
        )}
        {/* Other view modes... */}
      </AnimatePresence>
    </main>
  );
}

// PROBLEM: CosmicLobby uses non-responsive layout
const CosmicLobby: React.FC<CosmicLobbyProps> = ({ onEnterTarot, onEnterAstrology, onEnterAweView }) => {
  return (
    <motion.div className={styles.cosmicLobby}>
      {/* NON-RESPONSIVE: This layout breaks on mobile */}
      <div className="grid grid-cols-3 gap-8 p-8 min-h-screen">
        <TarotZonePreview onClick={onEnterTarot} />
        <CelestialEventsCarousel onClick={onEnterAweView} />
        <AstrologyZonePreview onClick={onEnterAstrology} />
      </div>
    </motion.div>
  );
};
```

**Required Responsive Pattern:**
```css
/* Target Layout Behavior */
Mobile (default):   [Panel 1]     /* Single column stack */
                    [Panel 2]
                    [Panel 3]

Desktop (lg+):      [Panel 1] [Panel 2] [Panel 3]  /* Three columns */
```

**Responsive Classes to Use:**
- `grid-cols-1 lg:grid-cols-3` - Single column mobile, three columns desktop
- `gap-4 lg:gap-8` - Smaller gaps on mobile, larger on desktop  
- `p-4 lg:p-8` - Less padding on mobile, more on desktop
- `space-y-4 lg:space-y-0` - Vertical spacing on mobile, none on desktop

Please provide the complete refactored code that fixes the mobile responsiveness and consolidates the layout system.
</task>
</prompt>
