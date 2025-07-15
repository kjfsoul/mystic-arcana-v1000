# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Session Management & Onboarding

### Onboarding Status
- All onboarding rules have been read and internalized, as of 2025-07-10
- Files read and validated:
  - CLAUDE_INTEGRITY_RULES.md ✅
  - IMPLEMENTATION_MICROTASKS.md ✅
  - claudeupdate.md ✅
  - PRD.md ✅
  - GEMINI.md ✅
  - technical_architecture.md ✅
  - Multiple docs/ files reviewed ✅

### Session Changelog
#### 2025-07-10 - Initial Onboarding Session
- Read all mandated onboarding files
- Analyzed codebase structure comprehensively
- Identified existing configurations and patterns
- Current state: MVP with working tarot backend (90%), visual design (95%), but broken authentication (0%) and missing core features per claudeupdate.md

#### 2025-07-15 - Integration Log
- Integrated `personalizedtarot.md` models for adaptive reader logic.
- Integrated `communityengage.md` mechanics for user interaction loops.
- Integrated virtual reader mini-app frontend logic (from legacy `app.js`, `index.html`).
- Integrated `astrologycalcs.md` specifications into the backend astrology service.

## Development Commands

### Essential Commands

- `npm run dev` - Start development server with Turbopack (port 3000)
- `npm run build` - Build production application  
- `npm run start` - Start production server
- `npm run lint` - Run ESLint on the codebase
- `npm run test` - Run Jest test suite
- `npm run test:e2e` - Run Playwright end-to-end tests (uses port 3002)

### Tarot System Commands

- `npm run seed:tarot` - Seed database with tarot card data
- `npm run test:tarot` - Test tarot engine functionality
- `npm run test:tarot-api` - Test tarot API endpoints specifically
- `npm run setup:tarot` - Initialize tarot engine configuration
- `npm run setup:local` - Setup local tarot development environment
- `npm run validate:tarot` - Validate tarot deck data integrity
- `npm run deck:manage` - Enhanced deck management tool

### Database Commands

- `npm run supabase:start` - Start local Supabase instance
- `npm run supabase:stop` - Stop local Supabase instance
- `npx supabase db reset` - Reset database to initial state

### Content & Validation Commands

- `npm run validate:astro` - Validate astronomical ephemeris calculations
- `npm run validate:spiritual` - Validate spiritual content references
- `npm run content:validate` - Monitor content generation quality

### Background Setup

- `npm run setup:background` - Initialize background services (runs `.cursor/install.sh`)

### ⚠️ Commands Requiring External Setup

- `npm run astrology:setup` - ❌ Missing script `./scripts/setup-astrology.sh`
- `npm run astrology:test` - Requires Python venv activation (`venv-astrology`)
- `npm run astrology:test-chart` - Requires Python venv activation
- `npm run astrology:test-transits` - Requires Python venv activation
- `npm run email:*` commands - Functional but require SMTP configuration

## Project Architecture

### Core Technology Stack

- **Framework**: Next.js 15.3.3 with App Router
- **TypeScript**: ES2017 target, strict mode, bundler module resolution
- **UI**: Tailwind CSS v4, Framer Motion, Ant Design components
- **Database**: Supabase (PostgreSQL) with Row Level Security
- **WebGL**: Custom WebGL2 renderer for astronomical visualizations
- **Testing**: Jest (unit), Playwright (E2E)
- **Deployment**: Netlify (primary), Vercel (previews)
- **Security**: Semgrep CI/CD integration with daily scans

### High-Level Architecture Patterns

1. **API-First Design**: Every feature exposes RESTful APIs in `/app/api/`
2. **Feature-Based Organization**: Components grouped by feature domain
3. **Service Layer Pattern**: Business logic isolated in `/services/`
4. **Context-Based State**: Authentication and session state via React Context
5. **Database Abstraction**: All DB operations through Supabase client
6. **Multi-Brand Support**: Configurable for Mystic Arcana, BirthdayGen, EDM Shuffle

### Critical Requirements

1. **Supabase Vector Extension**: Must be enabled in dashboard for AI features
   - Required for `journal_entries`, `user_embeddings`, `user_interactions` tables
   - See `SUPABASE_VECTOR_SETUP.md` for troubleshooting

2. **Environment Variables** (see `.env.example`):
   ```
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   SUPABASE_SERVICE_ROLE_KEY
   REDIS_URL (default: redis://localhost:6379)
   PYTHON_PATH (for astrology calculations)
   N8N_WEBHOOK_URL (automation workflows)
   ```

3. **Python Integration**: Astrology features require Python virtual environment
   - Create venv: `python -m venv venv-astrology`
   - Install deps: `pip install -r services/astrology-python/requirements.txt`

### Testing Strategy

- **Unit Tests**: Run with `npm run test`
  - Located in `tests/` directory
  - Uses `@/` path alias for imports from `src/`
  - Jest with ts-jest preset and jsdom environment
  
- **E2E Tests**: Run with `npm run test:e2e`
  - Located in `tests/e2e/` directory
  - Uses port 3002 (auto-starts dev server)
  - Chromium browser only

- **Run Specific Tests**:
  ```bash
  npm run test -- tests/specific-test.test.ts
  npm run test:e2e -- tests/e2e/specific.spec.ts
  ```

### Development Workflow

1. **Authentication Flow**: 
   - Email/password fully functional
   - Google OAuth requires Supabase dashboard config
   - Session persists across page reloads
   - Profile creation after signup

2. **Tarot System**:
   - All 78 cards with images in `/public/tarot/deck-rider-waite/`
   - Database seeded via `npm run seed:tarot`
   - API endpoints handle deck operations
   - Reading history persisted to database

3. **Astrology Features** (⚠️ Currently using mock data):
   - Birth charts use fake planetary positions
   - Compatibility/career features disabled
   - Requires Swiss Ephemeris integration for real data

### Code Organization Patterns

1. **Import Aliases**: Use `@/*` for imports from `src/*`
2. **Component Structure**: 
   ```
   components/
   ├── feature-name/
   │   ├── FeatureComponent.tsx
   │   ├── FeatureComponent.module.css
   │   └── index.ts
   ```
3. **API Routes**: Follow Next.js 15 App Router conventions
4. **Service Layer**: Separate business logic from UI components
5. **Type Safety**: Maintain strict TypeScript throughout

### Performance Constraints

- WebGL animations must maintain 60fps
- Astronomical calculations <200ms response
- Initial bundle <100KB
- Mobile-first responsive design
- Offline capability for core features

### Security & Compliance

- Semgrep scans run daily via GitHub Actions
- All user data treated with medical-record level security
- RLS enabled on all Supabase tables
- No secrets in code (use environment variables)
- Legal documents in `/docs/legal/`

### Known Issues & Limitations

1. **Astrology System**: Currently demonstration-only with mock data
2. **Agent System**: 80% conceptual, needs activation for real functionality
3. **Email System**: Functional but requires SMTP configuration
4. **Python Scripts**: Require manual venv activation
5. **Vector Extension**: Must be manually enabled in Supabase dashboard

### Deployment Notes

- **Primary**: Deploy to Netlify (see `netlify.toml`)
- **Preview**: Vercel deployments for PR previews
- **Environment**: Ensure all required env vars are set
- **Database**: Run migrations before deployment
- **Assets**: Tarot images require CDN for performance