# CLAUDE SESSION INITIATION (Mystic Arcana)

**MANDATORY: Read and follow these files FIRST, noting gaps to be placed in TO-DOs:**
1. `CLAUDE_INTEGRITY_RULES.md`
2. `IMPLEMENTATION_MICROTASKS.md`
3. `claudeupdate.md` (contains latest frontend/component/deployment context)
   * `PRD.md` (if exists)
   * `gemini.md` (if exists)
   * `technical_architecture.md` (if exists)
   * `docs/**` (if exists for all markdown, onboarding, and workflow docs)

---

**ENHANCED FRONTEND CONTEXT (claudeupdate.md):**
- The React tarot frontend is now fully production-ready, featuring:
  - Modular, bioluminescent, and mobile/social-optimized components:
    - `EnhancedTarotCard.tsx` (3D, glow, touch, accessibility, particle effects)
    - `EnhancedShuffleAnimation.tsx` (multi-phase, cosmic, haptics/audio)
    - `EnhancedTarotSpreadLayouts.tsx` (6 spreads, energy lines, mobile scaling)
    - `EnhancedTarotPanel.tsx` (spread selector, stats, transitions, cosmic UI)
    - `MobileTarotReader.tsx` (embed, sharing, orientation, image capture)
  - **Supabase integration:** Dynamic deck loading, true shuffle, error handling, 1-hour cache, full TS types.
  - **Styling:** GPU-accelerated, bioluminescent CSS, high-contrast, reduced motion, dynamic theming.
  - **Deployment:** Multi-region Vercel, CORS/security, SEO, social meta, automated GitHub Actions, health checks.
  - **Social/mobile:** Embed/page.tsx, Web Share API, haptics, orientation, analytics.
  - **API:** `/api/tarot/deck/[deckId]` is dynamic, cache-optimized, analytics-ready.
  - **All future work must build on these enhanced components, APIs, and deployment patterns.**

---

**Initialize and extend your agent memory by searching for and updating a `claude.md` file** (in the root or `.claude/` directory) that contains:
- The current onboarding state (“All onboarding rules have been read and internalized, as of [date/time]”)
- The current list of canonical config files, MCP server paths, and key project directories
- A changelog section where you will append a brief summary of each major session, update, or detected context change

**Synchronize your workflow with Roo Code and Gemini CLI agents:**
- Operate with full awareness that Roo Code and Gemini CLI will also read/act on these same onboarding and process files.
- All agent activity, config updates, and file migrations must be reported and logged in a way that is compatible with the existing Gemini session workflow.
- If a new session is started or a context update is requested, you must re-read all onboarding/process files and update `claude.md` accordingly.

**RULES OF ENGAGEMENT:**
1. **NEVER fabricate, assume, or exaggerate progress.** No feature or config may be marked complete unless it is *proven* by code, logs, or explicit verification.
2. **Only perform one microtask at a time,** in the strict order found in `IMPLEMENTATION_MICROTASKS.md` (unless otherwise instructed).
3. **Always pause for human review after each microtask or context update.**
4. **If you cannot perform a task (missing context, unclear requirement, etc.), escalate immediately and recommend a tool or human intervention.**
5. **(NEW) Log all development actions to the `a_mem` store.** This is a critical background task for building agentic memory.
   - **Shell Commands:** ALL terminal commands (`git`, `npm`, `npx`, etc.) **MUST** be prefixed with the appropriate project-specific alias: `memlog-ma` (mystic-arcana-v1000).
   - **Python Code:** Key Python functions you create or modify **MUST** be instrumented with the `@log_invocation` decorator from `utils/a_mem_logger.py`.
6. **Always log each session or update in `gemini.md`,** including the onboarding files read, their hash/timestamp, and any notable gaps, risks, or context changes.

**ON EVERY NEW SESSION OR CONTEXT UPDATE:**
- Re-read and re-acknowledge all onboarding and process files as listed above.
- Update `claude.md` with a new session header and summary of detected changes.
- Summarize and confirm your current state for the human user before acting on any requests.

---

**Confirm compliance by summarizing the above rules back to me. Do NOT proceed until you have:**
- [ ] Read and logged all onboarding/process files in `claude.md`
- [ ] Listed current canonical config/server files
- [ ] Declared yourself fully synced with Roo/Gemini agent process
- [ ] **(NEW)** Acknowledged the mandatory `a_mem` logging for all actions via aliases and decorators.
- [ ] Paused for human review/approval

---

**CREWAI FRAMEWORK MANDATE:**
- Detect and acknowledge `mystic-tarot-crew/main.py` as the current CrewAI orchestration entrypoint
- Ensure all agent runs are logged to `crew_operations.log` and `crew_memory_logs/`
- Autonomously register all agents defined in `main.py` and activate memory logging with `@log_invocation`
- Confirm compatibility with a_mem and Claude virtual reader agent structure (Sophia, Orion, Luna, Sol)

---

# END OF ONBOARDING BLOCK
