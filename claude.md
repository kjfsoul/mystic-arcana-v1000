# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Session Management & Onboarding

### Onboarding Status

- All onboarding rules have been read and internalized, as of 2025-01-31
- Files read and validated:
  - CLAUDE_INTEGRITY_RULES.md ✅ (Re-read 2025-01-31)
  - IMPLEMENTATION_MICROTASKS.md ✅ (Re-read 2025-01-31)
  - claudeupdate.md ✅ (Re-read 2025-01-31)
  - PRD.md ✅ (Re-read 2025-01-31)
  - GEMINI.md ✅ (Re-read 2025-01-31)
  - technical_architecture.md ✅ (Re-read 2025-01-31)
  - Multiple docs/ files reviewed ✅ (57 files found in docs/)
- Fully synced with Roo Code and Gemini CLI agent workflow
- Committed to brutal honesty and no fabrication per integrity rules
- Acknowledged mandatory a_mem logging for all development actions

### Recent Session Summaries (Condensed)

#### 2025-07-29 - Intelligence Engine Phase 2 Complete (PersonaLearner Activation)
- **Achievement**: Sophia agent connected to Knowledge Pool with personalized interpretations
- **Integration**: PersonaLearner integrated with a-mem system for persistent memory
- **Files Enhanced**: `sophia.ts`, `PersonaLearner.ts`, `InteractiveReadingSurface.tsx`
- **Validation**: 7/7 tests passed (100% success rate)
- **Impact**: Full personalization engine with adaptive learning capabilities

#### 2025-07-29 - Agent Activation Initiative & Intelligence Engine Mission
- **Phase 1**: Tarot UX Enhancement - Enhanced UI components with cosmic animations
- **Knowledge Pool**: 420+ structured records, 5 database tables with vector search
- **Agents Activated**: UIEnchanter, CardWeaver, QAValidator, SystemDesigner, ContentIngestor
- **Critical Files**: Knowledge Pool schema, ingestion pipeline, validation suite

#### 2025-07-24 - Astrology Validation & Bug Fixes
- Fixed compatibility calculations and career report TypeError
- Resolved authentication errors with session management
- Updated Swiss Ephemeris integration
- Fixed location input and profile autofill issues

#### 2025-01-31 - Claude Mandates Compliance & BirthData Consolidation
- **Key Accomplishments**:
  - Created centralized `src/types/astrology.ts` with BirthData interface
  - Fixed 28 broken imports across codebase
  - Production build successful
- **Current State**:
  - Authentication: 95% functional
  - Astrology: 95% functional with real calculations
  - Tarot: 90% backend complete
  - E-commerce: 90% functional with Stripe
  - Agent System: Partially functional

#### 2025-07-21 - Major Feature Development
- **Mercury Retrograde**: Banner with animations and Stripe marketplace
- **Horoscope Engine**: Real-time transit calculations and personalized guidance
- **Swiss Ephemeris**: Compatibility shim with professional-grade calculations
- **Marketplace Expansion**: 10 products with celestial filtering and wishlist

#### 2025-07-23 - Agent Registry Expansion
- Expanded from 17 to 25 agents (8 new specialized agents)
- Fixed RiderWaiteDeck.ts (21% → 100% complete with all 78 cards)
- Fixed database seeding script
- Created comprehensive deck validation

## Development Commands

### Essential Commands

- `npm run dev` - Start development server (port 3000)
- `npm run build` - Build production application  
- `npm run lint` - Run ESLint
- `npm run test` - Run Jest tests
- `npm run test:e2e` - Run Playwright E2E tests

### Tarot System Commands

- `npm run seed:tarot` - Seed database with tarot cards
- `npm run test:tarot` - Test tarot engine
- `npm run validate:tarot` - Validate deck data

### Database Commands

- `npm run supabase:start` - Start local Supabase
- `npm run supabase:stop` - Stop local Supabase
- `npx supabase db reset` - Reset database

## Project Architecture

### Core Technology Stack

- **Framework**: Next.js 15.3.3 with App Router
- **TypeScript**: ES2017 target, strict mode
- **UI**: Tailwind CSS v4, Framer Motion, Ant Design
- **Database**: Supabase (PostgreSQL) with RLS
- **WebGL**: Custom WebGL2 renderer
- **Testing**: Jest (unit), Playwright (E2E)
- **Deployment**: Netlify (primary), Vercel (previews)

### Critical Requirements

1. **Supabase Vector Extension**: Must be enabled for AI features
2. **Environment Variables**: See `.env.example`
3. **Python Integration**: Astrology requires Python venv

## Claude Flow MCP Integration

### Available MCP Tools

#### Coordination Tools:
- `mcp__claude-flow__swarm_init` - Set up coordination topology
- `mcp__claude-flow__agent_spawn` - Create specialized coordinators
- `mcp__claude-flow__task_orchestrate` - Break down complex tasks

#### Monitoring Tools:
- `mcp__claude-flow__swarm_status` - Monitor coordination
- `mcp__claude-flow__agent_list` - View active patterns
- `mcp__claude-flow__memory_usage` - Persistent memory

### 🧠 SWARM ORCHESTRATION PATTERN

**MANDATORY**: When using swarms:
1. **SPAWN ALL AGENTS IN ONE BATCH** - Single message with multiple tools
2. **EXECUTE TASKS IN PARALLEL** - Never sequential
3. **USE BATCHTOOL FOR EVERYTHING** - Batch operations
4. **ALL AGENTS MUST USE COORDINATION TOOLS** - Claude Flow hooks required

### Agent Count Configuration
- Check CLI args first: `npx claude-flow@alpha --agents 5`
- Auto-decide based on task complexity if no args
- Balance agent types based on task requirements

### Mandatory Agent Coordination Protocol

Every spawned agent MUST:

**Before Starting:**
```bash
npx claude-flow@alpha hooks pre-task --description "[task]"
npx claude-flow@alpha hooks session-restore --session-id "swarm-[id]"
```

**During Work:**
```bash
npx claude-flow@alpha hooks post-edit --file "[file]" --memory-key "swarm/[agent]/[step]"
npx claude-flow@alpha hooks notification --message "[what was done]"
```

**After Completing:**
```bash
npx claude-flow@alpha hooks post-task --task-id "[task]" --analyze-performance true
npx claude-flow@alpha hooks session-end --export-metrics true
```

### Performance Benefits
- **84.8% SWE-Bench solve rate**
- **32.3% token reduction**
- **2.8-4.4x speed improvement**
- **27+ neural models**

## Known Issues & Limitations

1. **Astrology System**: Currently demonstration-only with mock data
2. **Agent System**: 80% conceptual, needs activation
3. **Email System**: Requires SMTP configuration
4. **Python Scripts**: Require manual venv activation
5. **Vector Extension**: Must be manually enabled in Supabase

## Deployment Notes

- **Primary**: Deploy to Vercel 
- **Environment**: Ensure all required env vars are set
- **Database**: Run migrations before deployment
- **Assets**: Tarot images require CDN for performance

# important-instruction-reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files unless explicitly requested.