# Claude Init Prompts

# CLAUDE_INIT_PROMPTS.md

## Initial Claude Prompts and Instructions for Mystic Arcana

This file provides a chronological library of prompts for onboarding Claude (Claude 4 Opus, Claude Code) into your project, ensuring it understands context, project structure, and key requirements before generating any code or performing tasks. This guide is tailored for use in Cursor or similar Claude-integrated IDEs.

---

### 1. Project Initialization (Context Bootstrapping)

**Prompt 1: Import Project Context and File Structure**

> You are my technical partner on Mystic Arcana. Here is my project directory:
> (Paste or upload a snapshot of your full project directory tree, e.g. via `tree` or `.git|.next' | cat`.)
>
> All docs are in `/docs`, app code in `/src/app`, assets in `/public`, and scripts/utilities in `/scripts`.
> Familiarize yourself with all project docs, legal, and business requirements before proposing any code or architecture changes.
>
> Please acknowledge, summarize, and ask clarifying questions if anything is unclear about the structure.

---

### 2. Business/Domain Onboarding

**Prompt 2: Import Core Vision and Brand Docs**

> Please ingest the following documentation from `/docs`:
>
> - `PROJECT_OVERVIEW.md`
> - `TECHNICAL_ARCHITECTURE.md`
> - `TOOLS_SERVICES_OVERVIEW.md`
> - `ARCHITECTURE_DIAGRAM_ANNOTATED.md`
> - `COMPETITIVE_ANALYSIS.md` (or equivalent)
>
> Use these to understand the project vision, unique features, UI/UX requirements, and critical competitive differentiators. When in doubt, reference these docs before answering.

---

### 3. Specialized Docs and Agent Protocols

**Prompt 3: Knowledge Graph, Data Crawler, and Agent System**

> Read and reference the following:
>
> - Knowledge graph/crawler design specs (list file names)
> - Any MCP/AGUI protocol documentation
> - Legal/compliance docs in `/docs/legal`.
>
> Be prepared to generate Python code for scrapers, data pipelines, and knowledge graph population. Ensure compliance with all relevant ethical/data privacy requirements.

---

### 4. Frontend/UI/UX Generation

**Prompt 4: UI/UX and Branding Inputs**

> Please use the following:
>
> - `public/images/Mystic Arcana Logo.png` (or attach/export if required)
> - Color palette and visual style notes (paste sample palette, image, or theme description)
> - UI/UX references in docs (e.g., wireframes, user flows, onboarding specs)
>
> Build UI with a galaxy/starfield backdrop, left-side tarot deck, right-side astrology, interactive overlays, and seamless onboarding modals as described in docs.

---

### 5. Coding/Task Guidance

**Prompt 5: Task Specification (Use As Needed)**

> For each coding task, specify:
>
> - File(s) to be created/edited
> - Brief description of desired outcome
> - Any reference implementations (cite docs, code, or competitor features)
>
> Ask Claude to break down large tasks, show architectural choices, and offer refactoring/review as needed.

---

### 6. Feedback & Documentation Updates

**Prompt 6: Feedback and Correction**

> All generated code or docs should:
>
> - Reference core vision docs
> - Adhere to project-specific folder structure
> - Solicit feedback after each major block ("Is this accurate? If not, what needs revision?")
> - Update doc files (`PROJECT_OVERVIEW.md`, `TECHNICAL_ARCHITECTURE.md`, etc.) with all material changes.

---

**Tip:**

- Store these prompt templates in `/docs/CLAUDE_INIT_PROMPTS.md`.
- Use as a checklist for onboarding any new Claude instance or for bootstrapping in Cursor, VS Code, or web-based AI IDEs.
