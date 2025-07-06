# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Essential Commands
- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build production application  
- `npm run start` - Start production server
- `npm run lint` - Run ESLint on the codebase
- `npm run test` - Run Jest test suite
- `npm run test:e2e` - Run Playwright end-to-end tests

### Supabase Database Commands
- `npm run supabase:start` - Start local Supabase instance
- `npm run supabase:stop` - Stop local Supabase instance
- `npx supabase db reset` - Reset database to initial state

### ⚠️ UNIMPLEMENTED Commands (Scripts Missing)
**These commands are documented but DO NOT EXIST in package.json:**
- `npm run seed:tarot` - **MISSING** - Seed tarot card data into database
- `npm run test:tarot` - **BROKEN** - Points to non-existent test file
- `npm run setup:tarot` - **MISSING** - Initialize tarot engine
- `npm run setup:local` - **MISSING** - Setup local tarot environment
- `npm run astrology:setup` - **BROKEN** - Points to missing script ./scripts/setup-astrology.sh
- `npm run astrology:test` - **MISSING** - Run basic astrology tests
- `npm run astrology:test-chart` - **MISSING** - Test birth chart generation
- `npm run astrology:test-transits` - **MISSING** - Test planetary transits
- `npm run email:*` commands - **ALL MISSING** - Email system not implemented

**Before using these commands, you must first create the missing scripts and package.json entries.**

### Validation Commands
- `npm run validate:astro` - Validate astronomical ephemeris calculations
- `npm run validate:spiritual` - Validate spiritual content references

### Supabase Vector Extension Requirements
⚠️ **CRITICAL**: The database requires the `vector` extension for AI/ML embeddings:

**Required Extension:**
- `vector` - PostgreSQL extension for vector similarity search

**Tables using vector columns:**
- `journal_entries.embedding` - User journal entry embeddings
- `user_embeddings.embedding` - User preference embeddings  
- `user_interactions.embedding` - Interaction pattern embeddings
- `user_profile_embeddings.embedding` - Zodiac/astrology embeddings

**Functions requiring vector extension:**
- `update_user_embedding(uuid, vector)` - Updates user embedding data

**Setup Note:** 
- Vector extension must be enabled in Supabase dashboard before running migrations
- Dropping this extension requires dropping all dependent objects (not recommended)
- Local development: Enable via `CREATE EXTENSION IF NOT EXISTS vector;`
- **See SUPABASE_VECTOR_SETUP.md for detailed troubleshooting guide**

## Project Architecture

### Core Technology Stack
- **Framework**: Next.js 15.3.3 with App Router and TypeScript
- **UI**: Tailwind CSS v4, Framer Motion for animations
- **Database**: Supabase (PostgreSQL) with Row Level Security
- **WebGL**: Custom WebGL2 renderer for astronomical visualizations
- **Astrology**: swisseph-v2 for astronomical calculations (partially integrated)
- **Analytics**: Vercel Analytics
- **Deployment**: Vercel (primary), Netlify (alternative)
- **AI/LLM**: Claude, ChatGPT, Gemini (via MCP integration)
- **Automation**: n8n workflows, GitHub Actions

### Performance Requirements
- **Galaxy/starfield UI**: Must maintain 60fps with WebGL/Three.js
- **Astronomical calculations**: Under 200ms response time
- **Page load**: <3 second load times, <100KB initial bundle
- **Mobile-first PWA**: Offline spiritual practice capabilities
- **CDN optimization**: Required for tarot deck images and celestial charts

### Directory Structure
```
src/
├── app/                    # Next.js App Router pages and API routes
│   ├── api/tarot/         # Tarot Data Engine API endpoints
│   └── legal/             # Legal compliance pages
├── components/            # React components organized by feature
│   ├── astronomical/      # Star field and celestial visualizations
│   ├── tarot/            # Tarot card and reading components
│   ├── astrology/        # Astrology reading components
│   ├── effects/          # WebGL effects and backgrounds
│   └── ui/               # Reusable UI primitives
├── lib/                  # Shared utilities and services
│   ├── supabase/         # Database client configuration
│   └── tarot/            # Tarot deck data
├── hooks/                # Custom React hooks
├── contexts/             # React contexts (Auth)
├── services/             # Business logic and integrations
│   ├── astrology/        # Astronomical calculations (TypeScript)
│   └── astrology-python/ # Python-based astrology engine
└── agents/               # MCP agents and virtual readers
```

### Database Schema

**Core Tables:**
- `users` - Extends Supabase auth with application data
- `user_profiles` - Birth data, preferences, chosen reader
- `tarot_readings` - Complete reading history with interpretations

**Tarot System:**
- `decks` - Tarot deck metadata (name, description, active status)
- `cards` - Individual card data (78 cards with meanings, keywords, images)

**AI/ML Tables (require vector extension):**
- `journal_entries` - User journal entries with AI embeddings
- `user_embeddings` - User preference/behavior embeddings
- `user_interactions` - Interaction pattern embeddings
- `user_profile_embeddings` - Zodiac/astrology profile embeddings

**Features:**
- Row Level Security (RLS) on all tables
- Automatic user creation trigger
- Updated timestamp triggers
- Performance indexes on frequently queried columns
- UUID primary keys throughout
- Vector similarity search capabilities

## Current State & Critical Issues

### What ACTUALLY Works ✅
1. **Authentication System** (95% complete)
   - Email/password signup and login functional
   - Session management with persistence working
   - Password reset flow implemented
   - Profile creation with birth date collection
   - OAuth callback route properly implemented
   - **Issue**: Google OAuth requires Supabase dashboard configuration

2. **Tarot Backend** (100% complete)
   - All 78 card images exist in `/public/tarot/deck-rider-waite/`
   - Database properly seeded with complete card data
   - API endpoint `/api/tarot/deck/[deckId]` returns full 78-card deck
   - Tarot reading engine with spread selection
   - Reading history and persistence

3. **Basic Horoscope System** (75% complete)
   - Zodiac sign calculation from birth dates
   - Daily personalized horoscope generation
   - Guest vs authenticated user display
   - Integration with user profiles

4. **Visual Design** (95% complete)
   - WebGL star field and galaxy backgrounds work beautifully
   - Responsive layout system with mobile optimization
   - Legal pages fully implemented
   - UI components styled and animated
   - Brand-consistent frosted glass effects

5. **Infrastructure** (95% complete)
   - Next.js 15.3.3 app structure solid
   - TypeScript configured correctly
   - Database schema well-designed with vector extension support
   - Build process working successfully
   - All core APIs functional

### What Is BROKEN/FAKE and Needs Complete Rebuild ❌
1. **Birth Chart System** (0% real functionality)
   - Uses completely fake planetary positions
   - No real astronomical calculations
   - All chart data is hardcoded placeholders
   - **REQUIRES**: Real ephemeris integration (Swiss Ephemeris)

2. **Compatibility Analysis** (Disabled - was 100% fake)
   - Previously used mock planetary calculations
   - Now honestly shows "under development" status
   - **REQUIRES**: Real synastry calculations with actual planetary aspects

3. **Career Astrology** (Disabled - was 100% fake)
   - Previously used generic career advice
   - Now honestly shows "under development" status
   - **REQUIRES**: Real vocational astrology with midheaven calculations

### What Needs External Configuration ⚠️
1. **Google OAuth Setup**
   - Requires Google OAuth console configuration
   - Supabase dashboard OAuth provider setup
   - Redirect URL whitelisting

2. **Vector Extension** (for AI features)
   - Must enable `vector` extension in Supabase dashboard
   - Required for journal entries and user embeddings
   - Cannot be done through code migrations

3. **Astronomical Calculation Engine** (CRITICAL MISSING)
   - Must integrate Swiss Ephemeris or equivalent
   - Required for ALL real astrological features
   - Cannot provide authentic astrology without this

4. **Agent System** (20% real)
   - Scripts exist but don't spawn real processes
   - Registry tracks non-existent services
   - Most agents are dormant/conceptual

## Implementation Priority (from IMPLEMENTATION_MICROTASKS.md)

### Phase 1: Fix Authentication (CURRENT PRIORITY)
1. Debug `/app/auth/callback/route.ts` - verify it works with actual OAuth
2. Test email/password signup flow - ensure email confirmation works
3. Fix AuthContext to properly track user state
4. Add profile creation flow after signup
5. Test end-to-end: signup → login → logout → password reset

### Phase 2: Implement Tarot Reading Flow
1. Connect shuffle animation to actual deck
2. Implement card selection for spreads (single, 3-card, Celtic Cross)
3. Create proper TarotReading class with interpretations
4. Save readings to database
5. Create reading history page

### Phase 3: Astrology Integration
1. Install ephemeris library (Swiss Ephemeris or AstrologyJS)
2. Create planet position calculator
3. Build birth chart generator
4. Create astrology UI components

## Critical Development Rules

### From CLAUDE_INTEGRITY_RULES.md:
1. **NO FABRICATION** - Never claim features work without testing
2. **REALISTIC ESTIMATES** - Complex features take time, not minutes
3. **TEST EVERYTHING** - Run code before claiming completion
4. **ADMIT LIMITATIONS** - If something needs human intervention, say so

### Spiritual Technology Ethics (from Cursor rules)
1. **Human augmentation over replacement** - AI enhances human spiritual advisors
2. **All AI-generated content must feel genuinely helpful**, not mechanically produced
3. **Treat user spiritual data with same reverence as medical records**
4. **Always indicate when content is AI-generated vs human-created**
5. **Acknowledge diverse spiritual traditions respectfully**
6. **Ensure platform serves users of all abilities** - WCAG 2.1 AA compliance minimum

### API Architecture Standards
- **API-first development** - every feature must expose clean, documented APIs
- **Use RESTful conventions** with clear resource naming
- **Implement rate limiting and authentication** on all endpoints
- **Separate services** for astronomical calculations, user management, and content generation
- **Cache astronomical data intelligently** but never compromise accuracy for performance

### Code Style
- Use existing patterns and libraries
- Maintain TypeScript strict mode
- Follow component organization by feature
- Use CSS Modules for styling
- **Mobile-first progressive enhancement** approach
- **Progressive disclosure** - reveal complexity gradually to users

### Testing Requirements
Before claiming ANY feature works:
1. Run the actual code
2. Check for real output (not just "no errors")
3. Verify data persistence
4. Test error cases
5. Confirm user can actually use the feature
6. **Astronomical calculations verified against known historical events**
7. **Cultural sensitivity testing** with practitioners from relevant traditions
8. **Accessibility testing** with real users who have disabilities
9. **Privacy testing** including penetration testing for spiritual data
10. **Performance testing** for peak usage (new moons, major astrological events)

## Multi-Brand Architecture
The codebase supports multiple brands:
- **Mystic Arcana** - Primary spiritual technology platform
- **BirthdayGen** - Birthday-focused astrology application
- **EDM Shuffle** - Music festival astrology integration

## Next Steps - CRITICAL PRIORITIES

### ⚠️ INTEGRITY CRISIS - IMMEDIATE ACTION REQUIRED

**CURRENT STATUS**: The application has significant integrity violations that must be fixed before any production deployment.

### 🚨 HIGHEST PRIORITY - MUST FIX IMMEDIATELY

1. **Implement Real Astronomical Calculations**
   - Replace ALL fake planetary position data
   - Integrate Swiss Ephemeris or equivalent
   - Build proper birth chart calculation engine
   - Time Required: 1-2 weeks of focused development

2. **Rebuild Astrology Features with Real Data**
   - Birth charts using actual planetary positions
   - House calculations with proper coordinate systems
   - Aspect calculations based on real astronomical angles
   - Time Required: 2-3 weeks after ephemeris integration

3. **Complete Honesty Audit**
   - Remove any remaining placeholder/fake content
   - Label all limitations clearly
   - Test all features from user perspective
   - Time Required: 1 week

### Partially Working Features (Not Ready for Production)
- ✅ Authentication and user management
- ✅ Tarot reading system  
- ✅ Basic zodiac horoscopes
- ❌ Birth chart calculations (completely fake)
- ❌ Compatibility analysis (disabled due to fake data)
- ❌ Career astrology (disabled due to fake data)

### External Configuration Still Needed
1. **Google OAuth** - Configure in Supabase dashboard and Google console
2. **Vector Extension** - Enable in Supabase for AI features  
3. **Email Provider** - Configure SMTP for notifications
4. **Ephemeris Data Source** - Acquire astronomical calculation library
5. **MCP server connections** for Claude Code and virtual reader agents
6. **Swiss Ephemeris and NASA/JPL API** configurations
7. **n8n workflow automation** endpoints

### FORBIDDEN Until Integrity Issues Fixed
- ❌ Production deployment
- ❌ User testing of astrology features
- ❌ Marketing astrology capabilities
- ❌ Claiming "working" astrology system

**BOTTOM LINE**: The application cannot be considered "ready" until all astrological calculations use real astronomical data. Current astrology features are demonstrations only and must not be presented as functional to real users.

---

## Claude Code Onboarding Status

### Last Session Update: July 2, 2025

**All onboarding rules have been read and internalized as of 2025-07-02**

### Canonical Config Files Read:
- ✅ `/Users/kfitz/mystic-arcana-v1000/CLAUDE_INTEGRITY_RULES.md` - Mandatory compliance rules
- ✅ `/Users/kfitz/mystic-arcana-v1000/IMPLEMENTATION_MICROTASKS.md` - Task breakdown and model assignments
- ✅ `/Users/kfitz/mystic-arcana-v1000/claudeupdate.md` - Honest project assessment
- ✅ `/Users/kfitz/mystic-arcana-v1000/PRD.md` - Product requirements document
- ✅ `/Users/kfitz/mystic-arcana-v1000/GEMINI.md` - GEMINI.md file not found
- ✅ `/Users/kfitz/mystic-arcana-v1000/technical_architecture.md` - Technical architecture overview
- ✅ `/Users/kfitz/mystic-arcana-v1000/docs/**/*.md` - 52+ documentation files scanned

### Available MCP Servers:
- **memory** - Knowledge graph storage (tested ✅)
- **filesystem** - File operations (tested ✅)
- **ide** - VS Code diagnostics and code execution (tested ✅)
- **context7** - Library documentation (tested ✅)
- **21st-dev_magic** - UI component builder, logos, inspiration, refinement (tested ✅)
- **brave-search** - Web and local search (available)

### Agent Registry Status:
- **Registry File**: `/Users/kfitz/mystic-arcana-v1000/agents/registry.json` (230+ lines)
- **Key Agents**: Mystic Arcana Oracle, UI/UX agents, Tarot UX Optimizer
- **Current Status**: Most agents dormant/conceptual (20% real functionality)
- **Critical Issue**: 8 of 9 agents not actively contributing to development

### Current Session Summary:
- **Context**: Full compliance with Claude Mandates onboarding process
- **Primary Task**: Tarot deck spreads implementation and mobile UI optimization
- **Agent Activation Status**: Ready to coordinate with available agents for development tasks
- **Blocking Issues**: Need to activate registry agents for actual development work vs conceptual tracking

### Detected Changes Since Last Session:
- CLAUDE.md updated with missing command documentation (marked as UNIMPLEMENTED)
- Agent registry analyzed - most agents require activation for productive use
- MCP server ecosystem confirmed functional and ready for coordination

### Changelog:
**2025-07-02**: Initial onboarding completed. All mandatory files read. MCP servers tested. Agent registry analyzed. Ready for coordinated development work with focus on activating dormant agents for productive tarot spread development.