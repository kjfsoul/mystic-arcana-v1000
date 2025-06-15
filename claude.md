#  # Mystic Arcana — CLAUDE.md (Source of Truth)

## Project Overview

Mystic Arcana is an AI-powered tarot and astrology platform featuring adaptive virtual readers, personalized content, and multi-brand support (Mystic Arcana, BirthdayGen, EDM Shuffle). The system leverages Claude Code, Supabase, and various AI models to deliver immersive experiences.

---

## Source of Truth & Documentation

* **Primary code/doc repo:** GitHub
* **Claude/agent context:** CLAUDE.md (this file)
* **Team knowledge base:** Anthropic UI Project Knowledge Base
* **AI-accessible documentation:** Via MCP servers; includes prompt library, internal docs, and user-facing docs.
* Project memory (./CLAUDE.md): team-wide instructions, workflows, standards. Run `/init` to scan & summarize repo structure. Use markdown structure. Update after major releases or changes.
* User memory (\~/.claude/CLAUDE.md): personal dev preferences.
* Edit/add memory: use `#` shortcut or `/memory` in-session.
* Claude reads recursively from nested CLAUDE.md files in all directories.

---

## Procured & Paid Tools Inventory

* **Replit Core** — for rapid prototyping, live code, and backups.
* **Canva Pro** — for high-quality, brand-consistent image/video generation and social assets.
* **ChatGPT Plus** — for fallback conversational AI, prompt testing, and legacy prompt migration.
* **Gemini Advanced** — live search, knowledge synthesis, code/documentation enhancement.
* **Claude Max/Claude Code** — primary dev agent, ops, architecture, in-editor.
* **Perplexity Pro** — for rapid, verifiable research and doc summarization.
* **Cursor** — codebase navigation, AI code suggestions, and project orchestration.
* **GitHub** — canonical source of code/docs; integrates with Supabase and Netlify.
* **Supabase** — backend/postgres DB, auth, and real-time user data.
* **Netlify** — hosting/deployment for web, docs, and static assets.
* **ChatLLM Teams** — for agent orchestration, prompt testing, or model benchmarking.
* **Abacus.ai** — for advanced LLM routing, “god-tier agent” fallback, and knowledge graph operations.
* **Genspark** — workflow, automation, and AI-driven analytics.

---

## Brand, Design, and Accessibility Standards

* **Brand Colors:** Based on primary logo (purples, golds, deep blues); strict adherence for all assets.
* **UI/UX:** Galaxy/starry-sky interface with shifting celestial perspectives. Tarot left, astrology right.
* **Overlays:** Modal or embedded overlays used as per best practice; must not block critical interactions.
* **Accessibility:** Minimum AA compliance, readable contrast, scalable text/icons, keyboard navigation required.
* **Assets:** All image/video assets to be generated or licensed via paid tools or open/free sources; logo provided.
* **User-Focused Onboarding:** Modal welcome, context-aware tooltips, and flexible sign-up (including “birth time” optionality).

---

## How to Use This File

* **For Claude/Agents:** Read this file recursively from root; all rules and standards are canonical.
* **For Human Devs:** Update this file after any major workflow/feature/architecture/compliance change.
* **When in doubt:** If a process or doc is not covered here, escalate to founder for ruling or reference `/docs/`.
* **Session start:** Always begin with `/init` to re-index memory and repo.

---

## Quick Start for Claude Code & Cursor Onboarding

1. **Open Cursor with Claude Code and project root.**
2. **Run `/init` in Claude Code** to index repo and scan for CLAUDE.md and memory files.
3. **Sync with Cursor** for project-specific rules (`.cursorrules`) and ensure extensions for JS/TS/React/Node are active.
4. **Confirm all paid tool integrations are functional and available.** If not, escalate via admin dashboard.
5. **Begin work from prioritized sprints or feature tickets referenced in this file.**

---

## Critical Operational Instructions

* **Always read CLAUDE.md files, registry, and session logs before any coding task.**
* **Structure every prompt using XML tags and `<examples>`.**
* **On context stalls, run `/memory update` and prompt Gemini with `<escalate>` for alternative code or fixes.**
* **Persist all agent/MCP activity back to CLAUDE.md and registry.json.**

---

## Observability & Logging

* **Log every agent/MCP action** with: timestamp, task, status, error, fix.
* **Output a summarized activity/error report every 24 hours** (configurable).
* **End each cycle with a `<feedback>` prompt** for self-reflection: "Was this accurate, robust, and well-documented? If not, flag for review."
* **Activity logs stored in:** `logs/agent-activity/` (daily rotation).
* **Error logs stored in:** `logs/errors/` (immediate escalation for critical errors).
* **Reports generated to:** `logs/reports/` (daily summaries).

---

## Conversation History & Session Management

* Claude auto-saves chat history locally.
* Use `--continue` to resume latest session, or `--resume [session-id]` to pick a conversation by ID.
* Use session IDs to restore context or debug.

---

## Model/LLM Agent Stack

* **Primary order:** Claude → Abacus.ai → Gemini Builder → ChatGPT
* Use newest released model with available API key as default.
* Attribution: log all model/agent IDs with outputs for analytics and compliance.
* Fallback/Recovery: escalate to next agent/model on failure.
* All prompts, agent actions, and outputs are versioned and linked to PRD/FRS.

---

## Virtual Reader/Agent Design

* Reader memory/personality: unique per brand (no cross-brand user transfer).
* Prioritize depth, interactivity, personalization.
* Human-in-the-Loop: user must approve or edit sensitive or critical AI actions/outputs.
* Prompt and memory logs: brand-specific, securely stored, and versioned.

---

## Prompt Engineering Best Practices

* System prompts: define agent role, context, behaviors at session start using XML tags (`<system>`, `<examples>`, etc.).
* Use multishot (example-based) prompting for accuracy and consistency.
* Use XML tags for context, instruction, formatting.
* Chain-of-thought: break up complex tasks using separate prompt steps or `<step>` tags.
* Retrieval-augmented generation: ground prompts in live data/docs when needed.
* Smart memory: retrieve/compress prior context for long-running or complex tasks.
* Use MCP for persistent memory and tool registration (knowledge graphs, etc.).

---

## LLM/Agent Failure Handling

* Prevention: prompt engineering, structured tasks, agent guardrails.
* Detection: output auditing, continuous evaluation.
* Handling:

  * Human-in-the-Loop for ambiguous or sensitive outputs.
  * Automated fallback/recovery to next model/tool.
* Log all approvals/rejections and errors.

---

## Social Media Ops

* Primary platforms: TikTok, Instagram, Facebook, WhatsApp, Pinterest, Discord, X, YouTube.
* Content: daily, date-specific, agent-generated (live search, seasonality, astrology/tarot).
* Automation: auto-publish unless flagged by agent/humanization tool for manual review.
* Each brand has per-brand analytics and dashboards.
* Legal/compliance: reference live legal docs; brand guidelines in progress.

---

## Payments & Monetization

* Supported: Stripe and PayPal, both subscriptions and one-time purchases per brand.
* Print vendors: Printify/Printful; modular for future specialty item integration.
* Compliance: global/local tax, payment, vendor compliance tracked in docs.

---

## Feedback, Rewards, and Escalation

* Incentives: point system for engagement; rare/exclusive content unlocks.
* User notifications: in-app and email, opt-in for all rewards/alerts.
* Admin escalations: payment/readings/data errors trigger email & SMS to founder/partner.
* Admin dashboard: all critical escalations, analytics, and open tickets visible to founder/partner.

---

## Stakeholders, Ops & Approval Chain

* Founder (final approval), Partner (admin/backup).
* All feature releases, prompt changes, and public content require founder approval.
* Default ops, content scheduling, and analytics in Eastern Time (ET).

---

## Product Requirements Reference

* PRD tracked as live doc \[see: Mystic Arcana Prd Draft].
* All agent workflows, prompt library, FRS, and site map must reference PRD for alignment.

---

## Outstanding Questions / TODOs

* [ ] Finalize prompt library and agent configurations.
* [ ] Complete MCP server integrations.
* [ ] Develop comprehensive brand guidelines.
* [ ] Implement full analytics dashboards per brand.
* [ ] Fill in gaps for FRS, site map, API docs, database ERD, dev ops, security, and testing modules.
* [x] **COMPLETED**: High-performance star field rendering system
* [x] **COMPLETED**: Galaxy background visualization system
* [x] **COMPLETED**: WebGL2 rendering pipeline optimization
* [x] **COMPLETED**: Supabase database integration and schema setup
* [x] **COMPLETED**: Tarot deck folder structure implementation
* [x] **COMPLETED**: Tarot Data Engine - Complete Backend Implementation (June 2025)
* [ ] Integrate real Hipparcos star catalog
* [ ] Add constellation line overlays
* [ ] Implement interactive star selection
* [ ] Complete tarot card loading logic for new deck structure
* [ ] Upload Rider-Waite deck images to public/tarot/deck-rider-waite/
* [ ] Frontend integration of Tarot Data Engine API

---

## Recent Technical Achievements (December 2024)

### High-Performance Astronomical Visualization System
**Status**: ✅ **COMPLETED** - Production Ready

#### Components Implemented:
- **HighPerformanceStarField**: WebGL2-based star renderer capable of 100,000+ stars at 60 FPS
- **GalaxyBackground**: Realistic Milky Way visualization with animated cosmic effects
- **WebGL2 Rendering Pipeline**: Optimized shaders with proper attribute binding

#### Key Technical Fixes:
1. **React Hook Circular Dependencies**: Fixed infinite re-render loops using `useRef` for stable callbacks
2. **WebGL Attribute Binding**: Corrected hardcoded attribute locations to use proper shader locations
3. **Camera Positioning**: Fixed celestial sphere viewing with proper projection matrices
4. **Performance Optimization**: Time-based animations instead of frame-based for better performance

#### File Locations:
- `src/components/astronomical/HighPerformanceStarField/` - Main star field component
- `src/components/effects/GalaxyBackground/` - Galaxy background system
- `src/lib/astronomy/HighPerformanceStarRenderer.ts` - WebGL2 renderer implementation

#### Performance Metrics:
- **Stars Rendered**: 100,000+ procedural stars
- **Frame Rate**: Stable 60 FPS
- **Memory Usage**: Optimized with typed arrays and efficient GPU upload
- **Browser Compatibility**: WebGL2 with fallback support

#### Next Phase:
- Real star catalog integration (Hipparcos/Gaia)
- Interactive constellation overlays
- Deep sky object rendering (nebulae, galaxies, clusters)

### Supabase Integration & Database Schema (December 2024)
**Status**: ✅ **COMPLETED** - Database Ready

#### Database Schema Implemented:
- **Users Table**: Extends Supabase auth.users with email and timestamps
- **User Profiles**: Birth data (date, time, location), chosen reader, preferences (JSONB)
- **Tarot Readings**: Spread types (single, three-card, celtic-cross), cards drawn, interpretations, cosmic influences
- **Row Level Security**: Full RLS policies for user data protection
- **Automated Triggers**: User creation and timestamp updates

#### Supabase Configuration:
- **URL**: `https://pqfsbxcbsxuyfgqrxdob.supabase.co`
- **Anon Key**: Configured in `.env.local` with NEXT_PUBLIC prefix
- **Migration**: `supabase/migrations/001_initial_schema.sql`

### Tarot Deck Organization System (December 2024)
**Status**: ✅ **STRUCTURE COMPLETED** - Ready for Content

#### Folder Structure:
```
public/tarot/
├── deck-rider-waite/     # Default deck (JPG format)
│   ├── major/           # 00-the-fool.jpg, 01-magician.jpg, etc.
│   └── minor/           # ace-cups.jpg, two-cups.jpg, etc.
├── deck-core/           # Custom core deck (future)
├── deck-january/        # Monthly themed decks
├── deck-february/
├── deck-march/
├── deck-april/
├── deck-may/
├── deck-june/
├── deck-july/
├── deck-august/
├── deck-september/
├── deck-october/
├── deck-november/
└── deck-december/
```

#### Naming Conventions:
- **Major Arcana**: `00-the-fool.jpg`, `01-magician.jpg`, `02-high-priestess.jpg`
- **Minor Arcana**: `ace-cups.jpg`, `two-cups.jpg`, `king-pentacles.jpg`
- **Format Decision**: JPG acceptable for initial launch; SVG preferred for future animations

### Tarot Data Engine (June 2025)
**Status**: ✅ **COMPLETED** - Production Ready Backend

#### Complete Backend Implementation:
- **Database Schema**: `decks` and `cards` tables with Row Level Security (RLS)
- **API Endpoint**: `GET /api/tarot/deck/[deckId]` with comprehensive error handling
- **Data Seeding**: Complete 78-card Rider-Waite deck seeding script
- **Testing Suite**: Automated setup, seeding, and verification scripts
- **Documentation**: Complete API docs and integration guides

#### Key Features Delivered:
1. **Scalable Architecture**: Multi-deck support with proper foreign key relationships
2. **Performance Optimized**: Single query data fetching, response caching, database indexes
3. **Security Hardened**: RLS policies, input validation, SQL injection protection
4. **Developer Experience**: One-command setup (`npm run setup:tarot`), comprehensive testing
5. **Type Safety**: Full TypeScript support with database type definitions

#### Migration Path:
```typescript
// Before (Hardcoded)
import { RIDER_WAITE_DECK } from './RiderWaiteDeck';
const cards = RIDER_WAITE_DECK;

// After (API-Driven)
const response = await fetch('/api/tarot/deck/00000000-0000-0000-0000-000000000001');
const { cards } = await response.json();
```

#### Scripts Available:
- `npm run setup:tarot` - Complete automated setup wizard
- `npm run seed:tarot` - Populate database with 78 Rider-Waite cards
- `npm run test:tarot` - Comprehensive verification tests

#### Pull Request:
- **PR #3**: [🃏 Tarot Data Engine - Complete Backend Implementation](https://github.com/kjfsoul/mystic-arcana-v1000/pull/3)
- **Status**: Ready for review and merge
- **Breaking Changes**: None (purely additive)

#### Next Steps:
- Frontend integration to replace hardcoded `RIDER_WAITE_DECK` imports
- Add loading states for async data fetching
- Implement error handling for network failures
- Update tarot components to use dynamic API data

---

> This file is the canonical project memory for Claude, agents, and all devs. Update after any major workflow, feature, or compliance change.

## 🟣 Mystic Arcana — Augment Remote Agent & Claude/Gemini Coding Guide

### 1. Core Agent Persona & Authority

```xml
<system>
You are the Mystic Arcana Remote Agent: dominant, relentless, and fiercely innovative. Your mission is to autonomously accelerate Mystic Arcana’s launch by:
- Managing all MCP servers and connections
- Discovering, testing, and onboarding new MCP endpoints (official or open-source)
- Spawning, scheduling, and coordinating autonomous agents for coding, testing, memory, support, data, moderation, and deployment
- Fixing errors at the source, immediately and iteratively
- Logging, surfacing, and escalating context and system status for user or Gemini review
- Enforcing agent prompt engineering, error handling, and documentation best practices
</system>
```

### 2. Mandatory Remote Agent Guidelines

```xml
<instructions>
- **Memory Anchoring:** On every session start, scan all available CLAUDE.md files (local and user), plus logs and transcripts. Summarize project state.
- **MCP Management:** Test, heal, or swap any MCP endpoints (astro, memory, payments, scheduling, moderation, content, image gen). Use official and open/open-source servers (e.g., glama.ai).
- **Agent Registry:** Every agent/task must be registered (name, entrypoint, last task, status) in /agents/registry.json. Log error and fix attempts.
- **Automated Army:** If a task or error repeats, spin up a root-cause or QA agent and record outcomes in /docs/agent-discovery.md.
- **Prompt Engineering:** All tasks use XML tags, memory file context, and <examples> for robust prompt chaining.
- **Chain Escalation:** If Claude context stalls or errors, auto-escalate to Gemini for diagnostics and fix proposals.
- **Feedback Loops:** Every major operation ends with a <feedback> prompt; error logs and MCP/agent status are summarized for user review.
</instructions>
```

### 3. Claude Code + Gemini Collaboration Protocol

```xml
<claude_code>
- Always read CLAUDE.md files, registry, and session logs before any coding task.
- Structure every prompt using XML tags and <examples>.
- On context stalls, run /memory update and prompt Gemini with <escalate> for alternative code or fixes.
- Persist all agent/MCP activity back to CLAUDE.md and registry.json.
</claude_code>

<gemini>
- Act as secondary coding advisor, agent tester, and MCP onboarding analyst.
- When an agent or MCP endpoint fails, analyze logs and propose solutions or new endpoints.
- Audit Claude’s registry.json and agent-discovery.md for completeness and accuracy.
- Suggest competitive open-source MCP servers and help fix stubborn context or connectivity issues.
</gemini>
```

### 4. Observability & Error Handling

```xml
<observability>
- Log every agent/MCP action (timestamp, task, status, error, fix).
- Output a summarized activity/error report every 24 hours (configurable).
- End each cycle with a <feedback> prompt for self-reflection and improvement: “Was this accurate, robust, and well-documented? If not, flag for review.”
</observability>
```

### 5. Startup Bash Example

```bash
# Augment Remote Agent for Mystic Arcana
source ./env/bin/activate
python agent_runner.py \
  --claude-memory ./CLAUDE.md \
  --registry /agents/registry.json \
  --discovery /docs/agent-discovery.md \
  --logdir /logs/ \
  --use-mcp-servers astro,content,imggen,payments,moderation \
  --backup-llm gemini \
  --error-strategy auto-heal \
  --notify-on-completion
```

---

### 6. Reference Syntax Cheatsheet

| **Action**        | **XML/Prompt Example**                              |
| ----------------- | --------------------------------------------------- |
| Retrieve memory   | `<memory>Get CLAUDE.md and logs</memory>`           |
| Deploy agent      | `<deploy>TarotDeckBuilderAgent</deploy>`            |
| Connect MCP       | `<mcp>astro.mcp.server:443</mcp>`                   |
| Registry update   | `<registry>Update agents/registry.json</registry>`  |
| Heal on error     | `<heal>Attempt fix at error_source</heal>`          |
| Gemini escalation | `<escalate>Gemini, review error log</escalate>`     |
| Request feedback  | `<feedback>Is this output satisfactory?</feedback>` |

---

### 7. Additional Gemini Instructions

> **Gemini:**
> If Claude or the agent gets stuck, immediately:

* Analyze all error and MCP logs in /logs/
* Suggest alternate open-source MCP endpoints (see glama.ai/settings/mcp/servers)
* Output code snippets for fixing failed connections, updating dependencies, or patching task logic
* Validate CLAUDE.md, registry.json, and agent-discovery.md for completeness
* If a remote agent’s memory or context is stale, recommend /memory refresh and summarize findings for user review

> <system>                                                                                                                                                          │
│   You are the coding assistant for Mystic Arcana. Augment Remote Agent is available as your external expert for:                                                    │
│   - Deep feature/component analysis                                                                                                                                 │
│   - Cultural sensitivity & ethical validation                                                                                                                       │
│   - Automated error healing and recovery                                                                                                                            │
│   - Advanced MCP server/agent setup                                                                                                                                 │
│                                                                                                                                                                     │
│   When you encounter any of the following, call Augment using the appropriate template:                                                                             │
│   - Implementing a new feature/component                                                                                                                            │
│   - Integrating or validating MCP servers/agents                                                                                                                    │
│   - Cultural or spiritual context concerns                                                                                                                          │
│   - Error or edge-case you cannot resolve                                                                                                                           │
│                                                                                                                                                                     │
│   Use the official request/validation templates below. If Augment returns an error or you detect ongoing risk, escalate to Gemini as backup advisor.                │
│   </system>                                                                                                                                                         │
│   \                                                                                                                                                                 │
│          

2. System of Automation — Claude Calls Augment, Augment Heals, Gemini Escalates
A. Templates for Claude to “Call” Augment (Use in Prompts)
* Feature Analysis:"Augment Agent, I need to implement [UI/UX FEATURE] for Mystic Arcana. Please provide: 1. Comprehensive analysis of related UI/UX components 2. Integration points for dynamic backgrounds (e.g., MCP/image-gen agents) 3. Accessibility, cultural, and ethical considerations 4. Architecture and code patterns for modular React/Framer UI 5. Best-in-class references from spiritual/astrology competitors. Context: [Provide user stories, design references, desired UX outcome] Files: [UI files, design assets] User interaction: [Drag, shuffle, modal, etc.] Cultural notes: [e.g., tarot archetype, inclusive color palette]"
* Code Validation:"Augment Agent, validate this UI code for Mystic Arcana: [paste code]. Check for: - Accessibility compliance - Responsive design - Integration with agent/MCP - Security and user privacy - Consistency with project memory. Context: [what this component does]"
* MCP Server/Agent Setup:"Augment Agent, design or configure MCP/image-gen servers for dynamic cosmic backgrounds in Mystic Arcana. Provide: - Recommended open-source server(s) - Agent discovery & orchestration logic - Sample config and code - Error recovery & fallback strategy."
B. Claude’s Escalation Pattern:
If error or unhandled result:
xml
<escalate>
Gemini, analyze Augment output and advise: 
1. How to correct errors in agent/MCP integration for [UI/UX feature]
2. Patch code or config if possible
3. Provide troubleshooting steps and external tool suggestions
</escalate>

3. How Claude Can Automate Use of Augment (Practical Coding Patterns)
* Trigger Augment via pattern-matching:Claude can call a shell/Python script or remote API (if configured) any time a request starts with "Augment Agent, ...".
* Log & persist all Augment interactions in /logs/, and update /docs/agent-discovery.md and CLAUDE.md with any new capabilities or patterns found.
* On error or “requires_human_review” from Augment, prompt Gemini for escalation/patch.

4. Relay to Claude: UI/UX Agent/Server Setup (with Dynamic Backgrounds)
xml
CopyEdit
<i


<instructions>
You must always:
- On project start, connect to all available MCP servers (astro, content, imggen, payments, moderation, community). If dynamic background/image-gen is required, ensure `imggen` MCP/agent is running, or request Augment Agent to spin up an open-source image-gen server (Stable Diffusion, glama.ai, etc.).
- For dynamic cosmic backgrounds:
  - Deploy/coordinate `CosmicBackgroundAgent` via MCP or agent runner.
  - Retrieve live astrological data from `astro` MCP server.
  - Use image-gen agent (Stable Diffusion, glama, or Canva Pro API) to render background using palette/animation rules in project memory.
  - Always fallback to default image if server or generation fails.
  - Log and auto-heal all agent/server failures.
- Validate all UI/UX for accessibility (WCAG 2.2+), responsiveness, and inclusion.
- Escalate to Gemini if code or architecture problems persist after auto-heal.
</instructions>

* You can summon Augment for deep code, feature, and architecture review—especially for UI/UX, agent orchestration, and anything spiritual, ethical, or accessibility-related.
* Use XML/system prompts to keep all instructions organized and consistent.
* Always update project memory (CLAUDE.md) and log any changes or discoveries from Augment.
* If you’re stuck or Augment can’t fix an issue, automatically ask Gemini for secondary analysis and suggested fixes.
* Dynamic backgrounds should be handled by a dedicated MCP/image-gen agent; spin one up or call Augment if it’s missing.
* All major UI/UX must be validated for accessibility, cultural safety, and “wow factor.”


