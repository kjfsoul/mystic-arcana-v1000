#  # TOOLS\_SERVICES\_OVERVIEW\.md

## Mystic Arcana — Procured & Paid Tools

This document tracks all premium, procured, and key free/open-source tools in the Mystic Arcana stack. It ensures we have a record of replacement options and can maintain flexibility, compliance, and cost efficiency as needs evolve.

### Core Paid/Procured Tools & Services

* **Replit Core** — Cloud-based collaborative code editor; fallback for fast prototypes and deployments if local setup fails or for isolated AI workflows.
* **Canva Pro** — Design asset generation (social, web graphics, overlays); rapid image editing, templates, and scheduled content posts.
* **ChatGPT Plus** — Generative AI for content, ideation, blog, prompts, and conversational testing (esp. fallback to GPT-4/4o if other agents fail).
* **Gemini Advanced (Google One Pro)** — High-volume, advanced LLM (code, content, vision); access to Gemini Flash, Stitch, Whisk, Veo; useful for rapid prototyping, image/video gen, and research.
* **Claude Max (Claude 4 Opus, Claude Code)** — Deep codegen, architecture, documentation, and prompt engineering; high-context agentic workflows; in-IDE dev with Cursor.
* **Perplexity Pro** — Research, live data, and verification; fallback search/reasoning for data/competitive insights.
* **Cursor** — AI-native IDE (Claude, GPT integration); enables direct Claude Code/Claude Opus coding, code review, and file context.
* **GitHub** — Source of truth for code, version control, and issue tracking.
* **Supabase** — Backend as a Service (PostgreSQL, auth, storage, API, analytics).
* **Netlify** — Hosting, CI/CD, serverless functions, and deploy previews; fallback Vercel or AWS as backup.
* **ChatLLM Teams** — Multi-agent, multi-LLM orchestration for benchmarking and parallel code/content generation.
* **Abacus.AI** — ML/AI model training, anomaly detection, personalization, agent orchestration.
* **Genspark** — No-code/low-code AI agent builder and integration suite for automations and workflows.

### Key Free & Open Source Tools

* **CopilotKit** — AGUI/agent UI frontend library for agentic apps (open source).
* **Neo4j Community** — Free version for knowledge graph prototyping.
* **n8n** — Free/paid open-source workflow automation (alternative to Zapier/Make).

### Where They Fit in the Stack

* **Frontend/UI:** Canva Pro (assets), CopilotKit (agent UI), Cursor/VS Code (dev), Gemini/Claude/ChatGPT (prompting).
* **Backend:** Claude Max, Gemini Advanced, ChatLLM Teams, Supabase, Abacus.AI, GitHub, Netlify.
* **Automation/Integration:** n8n, Genspark, Replit Core (as emergency cloud dev), Perplexity Pro (verification), ChatGPT/Gemini for blog/posts.

### Replacement/Fallback Strategy

* **Keep all credentials secure and documented in a team vault.**
* Each paid tool has at least one fallback (open source or alternate paid agent) listed in project docs.
* Regularly review new entrants to ensure best-in-class tools for security, compliance, and features.

### Diagram/Reference Integration

* In architectural diagrams, visually tag which elements (databases, LLMs, frontends) use procured/paid tools vs. free/open-source (for clarity and audit).


