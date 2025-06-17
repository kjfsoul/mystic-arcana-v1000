# Mystic Arcana

Mystic Arcana is a spiritual-technology platform blending deep human wisdom, adaptive AI, and ethical design to deliver personalized tarot, astrology, and self-discovery tools. The project is modular and API-first, with all documentation organized under docs/. Deployed via Netlify.

Mystic Arcana is a next-generation, human-centric SaaS platform for tarot, astrology, and spiritual self-discovery, blending the wisdom of tradition with adaptive AI and agent-driven technology. The system is designed for rich, interactive cosmic experiences, seamless e-commerce, and continuous learning, all wrapped in an accessible, soulful UI.

Use this doc as the master reference for goals and philosophy. Cross-reference with docs/ and claude-mystic-prep-summary.md for technical, spiritual, and strategy context.


---

## Table of Contents

* [Project Overview](#project-overview)
* [Key Features](#key-features)
* [Technology Stack](#technology-stack)
* [Getting Started](#getting-started)
* [Deployment](#deployment)
* [Documentation](#documentation)
* [Contribution Guidelines](#contribution-guidelines)
* [License](#license)

---

## Project Overview

Mystic Arcana is more than an app—it’s a digital sanctuary. Users can receive personalized tarot and astrology readings, explore archetypes, journal, shop curated decks and merch, and participate in a vibrant community, all within an intuitive and visually stunning galaxy-inspired environment. The platform combines advanced automation, human oversight, and deep personalization for both casual seekers and lifelong mystics.

## Key Features

* **Galaxy UI**: Animated cosmic interface with shifting constellations, planets, and tarot archetype imagery
* **Multi-Reader Tarot Engine**: Choose from virtual readers with adaptive styles and memory
* **Astrology Engine**: Real-time, data-driven charting and cosmic overlays
* **Personal Journaling & Analytics**: Secure, searchable journaling and reading/astrology history
* **E-commerce**: Stripe-integrated merch and deck sales; print-on-demand via Printify
* **Automated Daily Content**: Multi-platform content generation, live search, and scheduling via n8n
* **Community Engagement**: Social features, Discord integration, and events
* **Human Oversight**: Human-in-the-loop for interpretation and quality control

## Technology Stack

* **Frontend**: Next.js (React, TypeScript, Tailwind CSS, Framer Motion)
* **Backend**: Node.js, Express (future-proofed for agent orchestration)
* **Database**: Supabase (PostgreSQL)
* **Automation/Integration**: n8n, GitHub Actions
* **Deployment**: Netlify (primary), Vercel (optional for previews)
* **Image/Video Generation**: SDXL, AUTOMATIC1111, Canva Pro, DALL·E
* **LLM/Agents**: Claude 4 Opus, Claude Code, ChatGPT Plus, Gemini Advanced, Perplexity Pro
* **E-commerce**: Stripe, Printify

## Getting Started

1. **Clone the Repo:**

   ```bash
   git clone https://github.com/your-org/mystic-arcana.git
   cd mystic-arcana
   ```
2. **Install Dependencies:**

   ```bash
   npm install
   ```
3. **Environment Setup:**

   * Copy `.env.example` to `.env.local` and fill in required API keys for Supabase, Stripe, Printify, and LLMs.
4. **Run Local Development:**

   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:3000`.

## Deployment

* **Vercel** (primary):

  * Deploy via Git integration or CLI using your connected Vercel account.
  * Main branch deploys to production; preview branches supported.
  * Automatic deployments from GitHub repository.

## Documentation

Core documentation is in the `/docs` directory and includes:

* Feature Requirements Spec (FRS)
* Product Requirements Doc (PRD)
* Technical Architecture
* Tools & Services Overview
* MCP/agent scaffolding
* Human Oversight Model

Spiritual/astrological reference materials and detailed learning guides are also provided for agent training and interpretation logic.

## Contribution Guidelines

1. Fork the repo and create a new feature branch.
2. Write clean, well-documented code; respect naming conventions reflecting both spiritual concepts and technical clarity.
3. Open a pull request; link to related docs, issues, or feature specs.
4. All code contributions may be reviewed by both human admins and LLM/agent pipelines.
5. Every doc must be modular (one Markdown file per topic: API, UI, spiritual logic, etc).
6. All updates must be versioned and logged.
7. Always attribute source of wisdom—human or AI.
8. Use spiritually resonant and technically clear names for all components and variables.
9. Major decisions must cite competitive/strategy docs (claude-mystic-prep-summary.md).

## License

See [LICENSE](LICENSE) for details. Most source code is MIT-licensed. Spiritual/educational resources may be subject to separate terms—see `/docs/legal/` for details.

---

*For more info or support, see the project overview and documentation, or reach out via Discord/community channels listed in the app UI.*
