# Astrology Features File Manifest
## Mystic Arcana Platform - Complete Astrology System Reference

*Generated: 2025-01-13*

---

## 🏗️ Core Architecture Files

### **Type Definitions**
```
src/types/astrology.ts              # Core astrology types (BirthData, PlanetData, etc.)
src/types/astronomical.ts           # Astronomical calculation types
src/types/horoscope.ts             # Horoscope-specific interfaces
```

### **Configuration & Constants**
```
src/constants/AstrologyConstants.ts # Zodiac signs, planets, aspects configuration
```

---

## 🧠 Core Services & Libraries

### **Main Service Layer**
```
src/services/astrology/AstrologyService.ts        # Primary astrology service orchestrator
src/services/astrology/SwissEphemerisService.ts   # Swiss Ephemeris integration service
src/services/profileService.ts                    # User profile astrology data management
src/services/zodiacService.ts                     # Zodiac sign calculations and data
src/services/horoscope/DailyHoroscopeService.ts   # Daily horoscope generation
```

### **Calculation Libraries**
```
src/lib/astrology/BirthChartCalculator.ts      # Birth chart calculations
src/lib/astrology/AstronomicalCalculator.ts   # Core astronomical computations  
src/lib/astrology/HoroscopeService.ts          # Horoscope calculation engine
src/lib/astrology/planetCalculator.ts         # Planet position calculations
src/lib/astrology/SwissEphemerisShim.ts       # Swiss Ephemeris compatibility layer
src/lib/astrology/types.ts                    # Library-specific types
src/lib/astrology/MoonPhase.ts                # Moon phase calculations
```

### **Specialized Calculators**
```
src/lib/astrology/compatibilityEngine.ts      # Relationship compatibility analysis
src/lib/astrology/SynastryCalculator.ts       # Synastry (relationship) charts
src/lib/astrology/CareerAnalyzer.ts           # Career-focused astrology analysis
```

### **Interpretation Engines**
```
src/lib/astrology/interpretations/love.ts     # Love & relationship interpretations
src/lib/astrology/interpretations/career.ts   # Career guidance interpretations
```

### **Swiss Ephemeris Integration**
```
src/lib/astronomy/SwissEphemerisBridge.ts         # Node.js Swiss Ephemeris bridge
src/lib/astronomy/SwissEphemerisBridge.browser.ts # Browser-compatible bridge
src/agents/swiss-ephemeris-shim.ts                # Agent wrapper for ephemeris
```

### **Caching & Performance**
```
src/lib/cache/AstrologyCache.ts               # Astrology calculation caching system
```

---

## 🌟 Transit & Ephemeris System

### **Transit Calculations**
```
src/lib/ephemeris/transitEngine.ts            # Planetary transit calculations
src/lib/astro/transitEngine.ts                # Alternative transit engine
src/agents/lunar-transit-narrator.ts          # Lunar transit storytelling agent
```

### **Swiss Ephemeris MCP Server**
```
swiss-ephemeris-mcp-server/index.js           # MCP server for ephemeris calculations
swiss-ephemeris-mcp-server/package.json       # Server dependencies
swiss-ephemeris-mcp-server/README.md          # Server documentation
swiss-ephemeris-mcp-server/vendor/swisseph/   # Swiss Ephemeris binary data
```

---

## 🎨 UI Components

### **Core Astrology Components**
```
src/components/astrology/AstrologyReadingRoom.tsx    # Main astrology interface
src/components/astrology/BirthChartViewer.tsx        # Birth chart visualization
src/components/astrology/InteractiveBirthChart.tsx   # Interactive chart component
src/components/astrology/AdvancedChartPreview.tsx    # Advanced chart display
```

### **Specialized Analysis Components**
```
src/components/astrology/CompatibilityReport.tsx     # Relationship compatibility UI
src/components/astrology/CompatibilityInsights.tsx   # Compatibility analysis display
src/components/astrology/InteractiveCareerInsights.tsx # Career astrology insights
src/components/astrology/CareerInsights.tsx          # Career guidance component
src/components/astrology/CosmicDeepDive.tsx          # Deep astrological analysis
```

### **Cosmic Events & Weather**
```
src/components/astrology/MercuryRetrogradeBanner.tsx  # Mercury retrograde notifications
src/components/cosmic/CosmicWeather.tsx              # Cosmic weather display
src/components/cosmic/CelestialEventsCarousel.tsx    # Celestial events carousel
```

### **Input & Location Components**
```
src/components/astrology/LocationInput.tsx           # Astrology location input
src/components/forms/LocationInput.tsx               # General location input
src/components/forms/LocationSearch.tsx              # Location search functionality
src/components/common/LocationAutocomplete.tsx       # Location autocomplete
```

### **Panel & Layout Components**
```
src/components/panels/AstrologyPanel.tsx             # Main astrology panel
src/components/panels/AstrologyPanel/AstrologyPanel.tsx # Modular panel component
src/components/panels/AstrologyZonePreview.tsx       # Astrology zone preview
```

---

## 🎭 Agent System

### **Astrology Agents**
```
src/agents/astrology-guru.ts                  # Core astrology interpretation agent
src/agents/lunar-transit-narrator.ts          # Lunar event storytelling
src/agents/swiss-ephemeris-shim.ts            # Ephemeris calculation agent
```

### **Reader Personas (Astrology-focused)**
```
src/agents/readers/orion.ts                   # Orion - Career astrology specialist
src/agents/readers/luna.ts                    # Luna - Relationship astrology specialist
src/components/readers/OrionCard.tsx          # Orion UI component
src/components/readers/LunaCard.tsx           # Luna UI component
```

---

## 🛠️ API Routes

### **Core Astrology APIs**
```
src/app/api/astrology/route.ts                # Main astrology calculation endpoint
src/app/api/astrology/birth-chart/route.ts    # Birth chart generation API
src/app/api/astrology/calculate/route.ts      # General astrology calculations
src/app/api/astrology/compatibility/route.ts # Compatibility analysis API
src/app/api/astrology/horoscope/route.ts      # Horoscope generation API
src/app/api/astrology/moon-phase/route.ts     # Moon phase calculation API
```

### **Caching & Optimization APIs**
```
src/app/api/astrology/cache/clear/route.ts    # Cache management endpoint
src/app/api/astrology/cache/stats/route.ts    # Cache statistics endpoint
```

---

## 📱 Pages & User Interfaces

### **Astrology Pages**
```
src/app/astrology/birth-chart/page.tsx        # Birth chart generation page
src/app/astrology/career/page.tsx             # Career astrology page
src/app/horoscope/page.tsx                    # Daily horoscope page
src/app/horoscope/calendar.tsx                # Horoscope calendar view
src/pages/astro.tsx                           # Legacy astrology page
```

### **Profile & User Data**
```
src/app/profile/page.tsx                      # User profile with birth data
src/components/profile/EnhancedProfileForm.tsx # Profile form with astrology fields
```

---

## 🧪 Testing & Validation

### **Unit Tests**
```
src/lib/astrology/__tests__/compatibilityEngine.test.ts     # Compatibility engine tests
src/lib/astrology/interpretations/__tests__/love.test.ts    # Love interpretation tests
src/app/services/astrology/__tests__/unit/LoveEngine.test.ts # Love engine unit tests
src/app/services/astrology/__tests__/unit/CareerEngine.test.ts # Career engine tests
```

### **Integration Tests**
```
src/__tests__/integration/luna-compatibility-flow.test.ts   # Luna compatibility flow
src/__tests__/integration/orion-career-flow.test.ts         # Orion career flow
src/components/readers/__tests__/OrionCard.test.tsx         # Orion component tests
src/agents/readers/__tests__/orion.test.ts                  # Orion agent tests
src/agents/readers/__tests__/luna.test.ts                   # Luna agent tests
```

---

## 🌌 Astronomical & Cosmic Systems

### **Astronomical Calculations**
```
src/lib/astronomy/AstronomicalEngine.ts       # Core astronomical engine
src/lib/astronomy/CoordinateTransforms.ts     # Coordinate transformation utilities
src/lib/astronomy/CosmicWeatherAPI.ts         # Cosmic weather data API
src/lib/astronomy/StarCatalogLoader.ts        # Star catalog data loading
src/lib/astronomy/types.ts                    # Astronomical type definitions
src/services/astronomical/AstronomicalEngine.ts # Service layer astronomical engine
```

### **Visualization Components**
```
src/components/astro/GalaxyView.tsx                          # Galaxy visualization component
src/components/astronomical/RealStarField/RealStarField.tsx  # Real star field rendering
src/components/astronomical/HighPerformanceStarField/HighPerformanceStarField.tsx # Optimized star field
src/components/astronomical/CelestialEventsCarousel.tsx      # Celestial events display
```

### **Background & Effects**
```
src/components/animations/CosmicBackground/CosmicBackground.tsx # Cosmic animated background
src/components/effects/CosmicBackground.tsx                     # Cosmic visual effects
src/components/effects/GalaxyShader/GalaxyShader.tsx           # WebGL galaxy shaders
src/components/effects/GalaxyBackground/GalaxyBackground.tsx   # Galaxy background component
```

---

## 🐍 Python Integration Layer

### **Python Services**
```
src/services/astrology-python/simple_astrology.py        # Simple Python astrology calculations
src/services/astrology-python/cached_astrology.py        # Cached Python calculations
src/services/astrology-python/cached_astrology_simple.py # Simplified cached calculations
src/services/astrology-python/ephemeris_service.py       # Python ephemeris service
```

### **Python Cache Files**
```
src/services/astrology-python/__pycache__/               # Python bytecode cache
```

---

## 📚 Knowledge & Content

### **Prompts & Content Generation**
```
src/lib/knowledge/LovePrompts.ts               # Love astrology content prompts
src/lib/knowledge/CareerPrompts.ts             # Career astrology content prompts
```

### **Data & Reference**
```
src/data/zodiacSigns.ts                        # Zodiac sign reference data
src/lib/astro/nasaCache.json                   # NASA astronomical data cache
```

---

## 🔧 Utilities & Hooks

### **React Hooks**
```
src/hooks/useProfileAutofill.ts                # Profile autofill with birth data
src/hooks/useGeolocation.ts                    # Geolocation for birth location
src/utils/cosmic-weather/useCosmicWeather.ts   # Cosmic weather data hook
```

### **Utility Services**
```
src/lib/astro/nasaClient.ts                    # NASA API client
src/lib/astro/nasaFallbackHandler.ts           # NASA API fallback handling
```

---

## 🎨 Styling & Assets

### **CSS Modules**
```
src/components/astrology/AstrologyReadingRoom.module.css    # Reading room styles
src/components/astrology/InteractiveBirthChart.module.css   # Birth chart styles
src/components/panels/AstrologyPanel.module.css            # Panel styles
src/components/panels/AstrologyPanel/AstrologyPanel.module.css # Modular panel styles
src/components/panels/AstrologyZonePreview.module.css      # Zone preview styles
```

---

## 📋 Configuration & Setup

### **Development Scripts**
```
scripts/test-caching-einstein.ts               # Astrology caching test script
scripts/agent-message-bus.ts                   # Agent communication testing
```

### **Registry & Metadata**
```
agents/registry.json                           # Agent registry including astrology agents
```

---

## 🔍 File Statistics Summary

**Total Astrology-Related Files: 120+**

### By Category:
- **Core Services & Libraries:** 25 files
- **UI Components:** 32 files  
- **API Routes:** 8 files
- **Python Integration:** 5 files
- **Tests:** 12 files
- **Types & Configuration:** 8 files
- **Agents & AI:** 9 files
- **Astronomical System:** 15 files
- **Styling & Assets:** 6 files

### Technology Integration:
- ✅ **Swiss Ephemeris** - Professional astronomical calculations
- ✅ **Python Integration** - Advanced astrological computations
- ✅ **MCP Server** - Modular calculation protocol
- ✅ **AI Agents** - Personalized interpretations
- ✅ **Real-time Calculations** - Live planetary positions
- ✅ **Caching System** - Performance optimization
- ✅ **WebGL Visualizations** - Galaxy and star field rendering

---

## 🚀 Key Dependencies

### NPM Packages:
- `swisseph` - Swiss Ephemeris calculations
- `astronomy-engine` - Astronomical calculations
- Various React/Next.js UI libraries

### Python Packages:
- `pyephemeris` or equivalent for Python calculations
- Caching libraries for performance

### External Services:
- NASA APIs for astronomical data
- Location services for birth location data

---

*This manifest represents the complete astrology feature system as of January 2025. The system provides professional-grade astrological calculations, AI-powered interpretations, and rich visualizations for birth charts, compatibility analysis, career guidance, and cosmic event tracking.*