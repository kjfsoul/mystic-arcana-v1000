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
- `npm run setup:background` - Setup Cursor IDE environment

### Supabase Database Commands
- `npm run supabase:start` - Start local Supabase instance
- `npm run supabase:stop` - Stop local Supabase instance
- `npx supabase db reset` - Reset database to initial state (migrations + seed data)

### Tarot Data Engine Commands
- `npm run setup:tarot` - Complete automated setup wizard for tarot database
- `npm run seed:tarot` - Populate database with 78-card Rider-Waite deck  
- `npm run test:tarot` - Run comprehensive tarot API verification tests
- `npm run setup:local` - Set up local tarot development environment

### Email & Automation Commands
- `npm run email:setup` - Interactive email configuration wizard
- `npm run email:start` - Start automated scheduler (daily @ 9 AM)
- `npm run email:send` - Send immediate status report to kjfsoul@gmail.com
- `npm run test:mcp` - Test MCP server connectivity (all servers currently offline)
- `npm run email:test` - Send test report for verification
- `npm run email:urgent` - Send urgent notification

### Validation & Quality Assurance  
- `npm run validate:astro` - Validate astronomical ephemeris calculations (Python)
- `npm run validate:spiritual` - Validate spiritual content references (Node.js)
- `npm run content:validate` - Monitor content generation processes

## Project Architecture

### Core Technology Stack
- **Framework**: Next.js 15.3.3 with App Router and TypeScript
- **UI**: Tailwind CSS v4, Framer Motion for animations, Ant Design (@ant-design/icons)
- **Database**: Supabase (PostgreSQL) with Row Level Security
- **WebGL**: Custom WebGL2 renderer for astronomical visualizations
- **Agent Integration**: Model Context Protocol (MCP) for AI orchestration (@modelcontextprotocol/sdk)
- **Email**: Nodemailer for automated reporting
- **Analytics**: Vercel Analytics
- **Deployment**: Vercel (primary), Netlify (configured per README)
- **Configuration**: Minimal Next.js config, Tailwind CSS v4, TypeScript strict mode

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
│   └── astronomy/        # Astronomical calculation engines
├── hooks/                # Custom React hooks
├── agents/               # Autonomous agent implementations
└── services/             # Business logic and integrations
```

### Database Schema
The application uses migration files:
- `supabase/migrations/001_initial_schema.sql` - Core user and readings schema with RLS policies
- `supabase/migrations/002_tarot_schema.sql` - Tarot Data Engine tables with decks/cards

Key tables:
- `users` - Extends Supabase auth with application data
- `user_profiles` - Birth data, preferences, chosen reader (JSONB columns)
- `tarot_readings` - Complete reading history with cosmic influences
- `decks` - Tarot deck metadata with is_active flag
- `cards` - Individual card data with meanings and keywords (JSONB columns)

### API Architecture
Current API endpoints:
- `GET /api/tarot/deck/[deckId]` - Fetch complete deck with all cards
- `POST /api/tarot/reading` - Create new tarot reading  
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User authentication

API patterns:
- Comprehensive error handling with structured error responses
- Response caching with `Cache-Control` headers
- Performance monitoring with response time tracking
- RESTful design principles
- TypeScript interfaces for request/response types

### WebGL Rendering System
High-performance astronomical visualizations using WebGL2:
- **Star Field Renderer**: Capable of 100,000+ stars at 60 FPS with realistic B-V colors
- **Galaxy Background**: Animated Milky Way with cosmic dust effects
- **Shader Programs**: Custom vertex/fragment shaders with twinkling and diffraction spikes
- **Performance Optimization**: Instanced rendering, frustum culling, typed arrays
- **Star Catalogs**: Located in `/public/data/catalogs/` (Hipparcos, Gaia, Yale formats)

## Critical Development Patterns

### Component Architecture
- Use barrel exports (`index.ts`) in component directories
- CSS Modules for scoped styling (`.module.css`)
- TypeScript interfaces for all component props
- Responsive design with mobile-first approach

#### Component Organization Pattern
Components are organized by feature domain rather than technical type:
- **Feature-First Structure**: `/astronomical/`, `/tarot/`, `/astrology/`, `/auth/`
- **Shared UI Components**: `/ui/` for reusable primitives (Button, Card, Modal)
- **Effect Components**: `/effects/` for WebGL and visual effects
- **Generated Components**: `/generated/` for AI-generated UI components
- **Layout Components**: `/layout/` for responsive layouts and navigation

### Database Interactions
- All database operations use Supabase client with RLS policies
- UUID primary keys with `gen_random_uuid()`
- JSONB columns for flexible data storage (preferences, card meanings)
- Automatic timestamp triggers for `created_at` and `updated_at`

### Error Handling
- Structured error responses with error codes and messages
- Comprehensive logging with performance metrics
- Fallback strategies for WebGL and API failures
- Human-in-the-loop approval for sensitive AI outputs

### Testing Strategy
- Jest for unit tests (`npm run test`)
- Playwright for end-to-end testing (`npm run test:e2e`)
- Python validation for astronomical calculations (`npm run validate:astro`)
- Custom validation scripts for spiritual content accuracy (`npm run validate:spiritual`)

## Agent & MCP Integration

### Multi-Agent Architecture
The application supports multiple AI agents with brand-specific memory:
- **mysticArcana**: Primary tarot/astrology agent
- **birthdayGen**: Birthday-focused readings
- **edmShuffle**: Music/festival astrology
- **astronomicalVisualization**: WebGL rendering agent
- **legalComplianceAgent**: GDPR/CCPA compliance
- **claudeInitAgent**: Session initialization and briefing
- **emailNotifier**: Automated reporting to kjfsoul@gmail.com

### Agent Registry System
All agents must be registered in `/agents/registry.json` with:
- `id`: Unique identifier
- `name`: Human-readable name
- `entrypoint`: Script location
- `lastTask`: Recent activity
- `status`: online/offline/error
- `error`: Last error message

### MCP Server Configuration
Model Context Protocol integration for:
- Astronomical data retrieval
- Content generation and validation
- Image generation for cosmic backgrounds
- Payment processing automation
- Community moderation

**CRITICAL**: All MCP servers show "offline" status. Test connectivity with `npm run test:mcp`.

### Session Initialization Protocol
On every Claude session start:
1. Auto-briefing generated at `/temp/CLAUDE_SESSION_INIT.md`
2. Task history loaded from `/logs/agent-tasks.jsonl`
3. Memory synced from knowledge graph
4. Current todos retrieved and displayed
5. Critical issues highlighted immediately

To manually initialize: `npx tsx src/agents/claude-init/index.ts`

### Email Notification System
Automated emails to kjfsoul@gmail.com include:
- ✅ Completed tasks since last report
- 📋 Current todos (high priority, in-progress, pending)
- 🚨 Urgent needs and critical issues
- ⚠️ Current challenges and system problems
- 📊 Agent status and system health metrics

## Security & Compliance

### Row Level Security
All database tables implement RLS policies:
- Users can only access their own data
- Public tables (decks, cards) are read-only for users
- Service role has full access for administrative operations

### Legal Framework
Complete legal compliance structure:
- Privacy Policy at `/legal/privacy`
- Terms of Service at `/legal/terms`
- Spiritual guidance disclaimers at `/legal/disclaimer`
- Cookie policy at `/legal/cookies`

### Data Protection
- UUID-based primary keys for security
- Encrypted user preferences in JSONB format
- Audit trails for all user actions
- Secure API key management with environment variables

## Current State & Critical Issues

### Production-Ready Components
- ✅ WebGL2 astronomical visualization system
- ✅ Supabase database with complete schema
- ✅ Tarot Data Engine with full API
- ✅ Legal compliance framework (GDPR/CCPA)
- ✅ Authentication and user management (Google OAuth + Email/Password)
- ✅ Mobile-responsive unified layout
- ✅ Automated email notification system
- ✅ Agent registry and task tracking
- ✅ Tarot reading modal with progressive card reveal
- ✅ Enhanced visual effects (halos, gradients) on cards
- ✅ Sign Up/Sign In modals with proper centering

### Known Issues
- **MCP Connectivity**: All 5 MCP servers offline (astro, content, imggen, payments, moderation) - immediate attention required
- **Agent Registry**: System health shows "stopped" status with 2 active, 6 dormant agents
- **Frontend Integration**: Tarot Data Engine API not connected to UI components
- **Missing Migration**: `003_agent_memory.sql` referenced but file not found  
- **Star Catalog**: Real astronomical data integration pending
- **Constellation Overlays**: Interactive star patterns not implemented
- **Tarot Reversals**: Not implemented - all cards show upright only
- **Agent Status**: 6 of 8 agents are dormant, only claudeInitAgent and emailNotifier are active

### Next Development Priorities
1. Diagnose and fix MCP server connectivity issues
2. Connect Tarot Data Engine API to frontend components
3. Create missing `003_agent_memory.sql` migration file
4. Integrate real star catalog data (Hipparcos/Gaia)
5. Implement interactive constellation overlays

## Development Guidelines

### Code Style
- **IMPORTANT**: DO NOT ADD ***ANY*** COMMENTS unless asked
- Follow existing code conventions in each file
- Use existing libraries and patterns
- Maintain consistent naming conventions

### Cursor IDE Development Rules
From `.cursor/rules/` - applied automatically to specific file patterns:

#### API Architecture Standards (api-architecture.mdc)
- Every feature must expose clean, documented APIs
- Use RESTful conventions with clear resource naming  
- Implement rate limiting and authentication on all endpoints
- Separate astronomical calculations, user management, and content generation into distinct services
- Cache astronomical data intelligently but never compromise accuracy for performance

#### Frontend UX Guidelines (frontend-ux.mdc)
- Mobile-first progressive enhancement
- Progressive disclosure: reveal complexity gradually
- WCAG 2.1 AA accessibility compliance minimum
- Performance budget: <3 second load times, <100KB initial bundle
- Always indicate when content is AI-generated vs human-created
- Mindful notifications that enhance rather than interrupt spiritual practice

#### Spiritual Content Standards (spiritual-content.mdc)
- Maintain academic rigor when documenting traditional tarot and astrological practices
- All spiritual interpretations must reference authoritative sources and acknowledge cultural origins
- Document virtual guide personalities with clear attribution between AI-generated content and human expert knowledge
- Include examples demonstrating respectful handling of sensitive spiritual data
- Maintain transparency about AI involvement in spiritual guidance while protecting user privacy as sacred trust

### Task Management
- Use TodoWrite tool for complex multi-step tasks
- Mark todos as in_progress before starting work
- Complete todos immediately after finishing
- Only one todo should be in_progress at a time

### Working with Agents
- Always update `/agents/registry.json` after agent tasks
- Log completions to `/logs/agent-tasks.jsonl`
- Use XML tags for structured prompts
- Escalate to Gemini on context stalls

### File Operations
- NEVER create files unless absolutely necessary
- ALWAYS prefer editing existing files
- NEVER proactively create documentation files
- Only use emojis if explicitly requested

### Error Recovery
- Run `npm run lint` and `npm run build` after code changes to check for errors
- Test MCP connectivity with `npm run test:mcp` (currently all servers offline)
- Check agent logs in `/logs/agent-activity/` for debugging
- Use `npm run email:urgent` for critical issues requiring immediate attention
- Initialize Claude sessions with `npx tsx src/agents/claude-init/index.ts`

## Recent UI/UX Improvements

### Authentication Modal Fixes
- Modal positioning fixed using flexbox centering on backdrop
- Responsive width using viewport units (90vw desktop, 95vw tablet, 98vw mobile)
- Sign Up mode properly syncs with button clicks
- Enhanced button visibility with gradients and shadows

### Tarot Reading Experience
- **Progressive Card Reveal**: Individual card meanings show on click, full reading after all cards flipped
- **Modal Display**: Full-screen overlay with purple/blue gradients and enhanced shadows
- **Card Visual Effects**: 
  - Halo glow effect on flipped cards (purple drop-shadow)
  - Pulse animation and border highlights
  - Proper spacing in grid layouts (responsive)
- **Mobile Optimization**: 3-column grids on mobile, larger touch targets

## File Structure & Conventions

### Key Configuration Files
- `package.json` - NPM dependencies and scripts
- `next.config.js` - Next.js configuration
- `tailwind.config.js` - Tailwind CSS configuration  
- `tsconfig.json` - TypeScript configuration
- `supabase/migrations/` - Database schema migrations
- `agents/registry.json` - Agent registry with status tracking
- `.env.local` - Environment variables (not committed)

### Important Directories
- `src/app/` - Next.js App Router pages and API routes
- `src/components/` - React components organized by feature
- `src/lib/` - Shared utilities and services
- `src/agents/` - Agent implementations and orchestration
- `public/` - Static assets including tarot card images
- `logs/` - Agent activity logs and task tracking
- `scripts/` - Automation and setup scripts

## Fallback Chain
Primary: Claude → Abacus.ai → Gemini → ChatGPT
Each agent logs interactions and maintains version history for debugging.