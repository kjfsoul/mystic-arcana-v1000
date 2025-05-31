#  # ARCHITECTURE\_DIAGRAM\_ANNOTATED.md

## Mystic Arcana — Architecture Diagram (with Paid/Free Tool Tagging)

```mermaid
graph TD
  subgraph Legend
    X1[🔷 = Procured/Paid]
    X2[◻️ = Open Source/Free]
  end

  A[User Device (Web/Mobile)]
  B[🔷 React/Next.js Frontend<br>+ Galaxy/Starfield UI]
  C[◻️ CopilotKit + AGUI<br>Agent Interactivity Layer]
  D[🔷 Node.js/Express API Server]
  E[🔷 Supabase (PostgreSQL User/Readings DB)]
  F[◻️ Redis (Cache/Sessions)]
  G[🔷 Netlify (Serverless/Deploy)]
  H[🔷 Claude/GPT/Gemini<br>Virtual Guide Agents (MCP Protocol)]
  I[🔷 Abacus.AI (Personalization/Analytics)]
  J[◻️ Neo4j Community (Knowledge Graph, Phase 2)]
  K[◻️ Ephemeris/NASA/JPL APIs<br>(Astrology/Celestial Data)]
  L[◻️ Python Data Pipelines/Crawlers (Knowledge Graph)]
  M[◻️ n8n/Make.com (Automation)]
  N[🔷 Canva Pro (Asset Design)]
  O[🔷 Replit Core (Fallback Dev Env)]
  P[🔷 Perplexity Pro (Live Search/Research)]
  Q[🔷 ChatLLM Teams (Multi-agent LLM Orchestration)]
  R[🔷 Genspark (No-code Automation)]
  S[🔷 Cursor (AI IDE)]
  T[🔷 GitHub (Repo/CI/CD)]

  A --> B
  B --> C
  C --> D
  D --> E
  D --> F
  D --> G
  D --> H
  D --> I
  D --> K
  D --> J
  J <-- L
  G --> K
  M --> D
  D --> B

  B --> N
  D --> O
  D --> P
  D --> Q
  D --> R
  B --> S
  D --> T

  subgraph Frontend
    B
    C
    N
    S
  end
  subgraph Backend/API
    D
    E
    F
    G
    H
    I
    J
    K
    O
    P
    Q
    R
    T
  end
  subgraph Data/Automation
    L
    M
  end
```

**Legend:**

* 🔷 = Procured/Paid tool or service
* ◻️ = Open source or free (self-hosted or community tier)

**Instructions:**

* Update this diagram as new tools/services are added or swapped.
* Use this annotated view for onboarding, compliance, and cost reviews.


