# # TECHNICAL_ARCHITECTURE.md

## Mystic Arcana — Technical Architecture Overview

### 1. Platform Architecture (Stack)

- **Frontend:**
  - React (Next.js or React Native for cross-platform/mobile)
  - TailwindCSS + custom galaxy overlays and visual effects (WebGL/Three.js for galaxy/starfield)
  - AGUI & CopilotKit (agent/user interactivity layer)
  - Modal or embedded overlays for onboarding, readings, etc.

- **Backend:**
  - Node.js (Express)
  - Supabase (PostgreSQL for user, reading, and feedback data)
  - Redis (session/cache)
  - Serverless functions (Netlify, Vercel, or AWS Lambda for scale)
  - Claude/Anthropic & Gemini/GPT via MCP agents for virtual guide logic, NLP, and content
  - Abacus.AI for data science, personalization, anomaly detection
  - Ephemeris/NASA/JPL APIs for celestial/astrological calculations
  - Knowledge Graph DB (Neo4j or similar, Phase 2)

- **DevOps & Automation:**
  - GitHub repo, Netlify deploys (CI/CD), GitHub Actions for test/build/deploy
  - Automated data pipelines: Crawler/scraper modules (Python) to populate knowledge graph
  - n8n or Make.com for workflow automation (content generation, feedback, daily posts)

- **Assets & External Data:**
  - Deck images: Custom or RW Tarot (open source)
  - Astrology/tarot PDFs, community content, docs/legal assets in `/docs`

### 2. MCP Servers

- **supermemory**: Manages long-term memory and knowledge base.
- **finrobot**: Financial data analysis and reporting.
- **archon**: Orchestrates and governs the agentic ecosystem.
- **browser**: Provides web browsing and data extraction capabilities.

### 3. Security, Privacy, and Compliance

- User data encrypted at rest/in transit (Supabase/PG, HTTPS)
- Opt-in analytics, privacy-first by design
- OAuth/social login (optional)
- Automated monitoring, error handling, and feedback loops
- Legal compliance: GDPR, CCPA, data minimization, template agreements in `/docs/legal`

### 4. Key Integration Points

- **Virtual Guide System:**
  - Claude/GPT/Gemini agents interact via AGUI protocol (CopilotKit front-end, MCP backend)
  - Multi-reader personalities managed and persisted for each user (Supabase user/reader tables)
  - Context/adaptation logic stored and evolved via feedback, session data, and knowledge graph

- **Astrology & Celestial API Layer:**
  - Swiss Ephemeris, NASA/JPL APIs accessed via serverless functions or backend
  - Real-time sky overlays and horoscope calculations

- **Knowledge Graph:**
  - Populated from crawlers/scrapers, updated via user interaction and research
  - Connects readings, interpretations, symbols, celestial data, and user feedback

- **Content & Community:**
  - User profiles, logs, feedback, group rituals, and community features
  - Email/SMS for onboarding, reminders, feedback requests

### 5. Folders & Files (Reflecting Your Project Structure)

- `/docs`: All research, PDFs, legal, and domain content
- `/public`: Images, fonts, icons
- `/src/app`: Components, API routes, context, types
- `/scripts`: ETL, crawlers, NLP, data prep
- `/tests`: e2e, integration, and unit test suites

### 6. Architectural Diagram

- (Prompt Claude or Gemini to render a Mermaid.js or Figma diagram using above components)

### 7. Next Steps & Considerations

- Finalize UI/UX for MVP (galaxy, overlays, onboarding, multi-reader selection)
- Prioritize API endpoints & security patterns
- Establish daily workflow: AI codegen in Cursor/Claude, with reference to `/docs` context
- Integrate MCP/AGUI agents and feedback loops for adaptive personalization
- Continuously update docs as infra evolves
