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

### Testing Commands
- `npm run validate:astro` - Validate astronomical ephemeris calculations
- `npm run validate:spiritual` - Validate spiritual content references

## Project Architecture

### Core Technology Stack
- **Framework**: Next.js 15.3.3 with App Router and TypeScript
- **UI**: Tailwind CSS v4, Framer Motion for animations
- **Database**: Supabase (PostgreSQL) with Row Level Security
- **WebGL**: Custom WebGL2 renderer for astronomical visualizations
- **Analytics**: Vercel Analytics
- **Deployment**: Vercel (primary)

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
└── services/             # Business logic and integrations
```

### Database Schema
- `users` - Extends Supabase auth with application data
- `user_profiles` - Birth data, preferences
- `tarot_readings` - Complete reading history
- `decks` - Tarot deck metadata
- `cards` - Individual card data with meanings

## Current State & Critical Issues

### What ACTUALLY Works ✅
1. **Tarot Backend** (90% complete)
   - All 78 card images exist in `/public/tarot/deck-rider-waite/`
   - Database properly seeded with card data
   - API endpoint `/api/tarot/deck/[deckId]` returns real data
   - Supabase connection is functional

2. **Visual Design** (95% complete)
   - WebGL star field and galaxy backgrounds work
   - Responsive layout system
   - Legal pages fully implemented
   - UI components styled and animated

3. **Infrastructure** (85% complete)
   - Next.js app structure solid
   - TypeScript configured correctly
   - Database schema well-designed
   - Build process working

### What DOESN'T Work ❌
1. **Authentication** (0% functional)
   - Sign up/login forms exist but don't work properly
   - OAuth callback route exists but needs testing
   - Session management incomplete
   - Always runs in guest mode

2. **Core Features** (5% functional)
   - No actual tarot reading generation
   - No user data persistence  
   - No reading history
   - No payment processing
   - No real email notifications

3. **Agent System** (20% real)
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

### Code Style
- Use existing patterns and libraries
- Maintain TypeScript strict mode
- Follow component organization by feature
- Use CSS Modules for styling

### Testing Requirements
Before claiming ANY feature works:
1. Run the actual code
2. Check for real output (not just "no errors")
3. Verify data persistence
4. Test error cases
5. Confirm user can actually use the feature

## Next Steps

1. **FIX AUTHENTICATION FIRST** - Nothing else matters until users can sign up/login
2. **IMPLEMENT BASIC TAROT READING** - Connect the beautiful UI to actual functionality
3. **TEST WITH REAL USERS** - Get feedback before adding complexity

The infrastructure is solid, the design is beautiful, but the core user journey (signup → get reading → save reading) doesn't work yet. Focus on making this ONE flow work perfectly before adding any new features.