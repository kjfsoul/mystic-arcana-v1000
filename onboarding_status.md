#  # CLAUDE\_ONBOARDING\_STATUS.md

## Status: Initial Project Bootstrapping

* As of now, **no direct Claude prompts have been executed** using this structured onboarding sequence, but you have already:

  * Generated and organized your project file structure (see latest `/docs`, `/src`, etc.)
  * Uploaded/created key docs in `/docs` (overview, technical architecture, legal, research, competitive analysis, knowledge graph, agent protocols, etc.)
  * Defined initial directory and dependency structure via Cursor, Next.js, Supabase, and Netlify.

* This doc will serve as a checkpoint for Claude onboarding, capturing:

  * Which prompts have been run in Cursor/Claude so far
  * Feedback after each session
  * Any issues, changes, or clarifications needed for future agent/AI onboarding

## Next Steps

1. **Prepare Claude (Cursor or Web):**

   * Open Cursor and select Claude 4 Opus or Claude Code.
   * Paste in the initial context prompt (as per `/docs/CLAUDE_INIT_PROMPTS.md`).
   * Reference or upload your directory structure (from `tree`, `.git|.next' | cat`, etc.).
2. **Sequentially load docs and ask clarifying questions:**

   * Paste/import docs: `PROJECT_OVERVIEW.md`, `TECHNICAL_ARCHITECTURE.md`, `TOOLS_SERVICES_OVERVIEW.md`, etc.
   * Use prompts to load knowledge graph/agent protocol specs as needed.
3. **Begin with your first functional or architectural task.**

   * E.g., “Build the galaxy/starfield UI,” “Draft API routes for the tarot reading engine,” etc.

**Tip:** After each major session, update this file to track what’s been tried, what worked, and what Claude needs to know next.


