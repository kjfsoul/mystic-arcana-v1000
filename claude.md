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

---

> This file is the canonical project memory for Claude, agents, and all devs. Update after any major workflow, feature, or compliance change.


