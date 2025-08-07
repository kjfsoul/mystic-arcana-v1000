# Mystic Arcana — API Specification

---

**This API spec is designed API-first for seamless integration and extensibility, with all endpoint naming reflecting both spiritual and technical clarity. See `/docs/claude-mystic-prep-summary.md` for research-driven decisions and project background.**

## 1. Overview

Mystic Arcana's API enables core functionality for tarot, astrology, user personalization, e-commerce, and community engagement, blending spiritual language with technical structure for maximum clarity and future extensibility. All endpoints use RESTful conventions with JWT authentication unless otherwise noted.

---

## 2. Core Endpoints

### 2.1 Authentication & User

- `POST /api/auth/register` — Create new account
- `POST /api/auth/login` — Authenticate user
- `POST /api/auth/logout` — End session
- `GET /api/user/profile` — Fetch user profile & preferences
- `PATCH /api/user/profile` — Update profile

### 2.2 Tarot & Virtual Reader

- `GET /api/tarot/readers` — List virtual tarot guides
- `POST /api/tarot/draw` — Initiate new tarot reading (params: reader, spread, context)
- `GET /api/tarot/readings` — Retrieve user readings
- `POST /api/tarot/interpretation` — Log custom interpretation (AI/human)

### 2.3 Astrology & Charts

- `POST /api/astrology/chart` — Generate natal/transit chart (params: birth data, datetime)
- `GET /api/astrology/events` — List current/forecast celestial events
- `GET /api/astrology/charts` — User’s saved charts
- `POST /api/astrology/interpretation` — Log astrological insight (AI/human)

### 2.4 Journaling & User History

- `GET /api/journal/entries` — User journal feed
- `POST /api/journal/entry` — New journal entry (auto-tied to session)
- `PATCH /api/journal/entry/:id` — Edit journal entry
- `DELETE /api/journal/entry/:id` — Remove entry

### 2.5 E-commerce & Merch

- `GET /api/shop/items` — List available decks & merch
- `POST /api/shop/order` — Place new order (Stripe/PayPal)
- `GET /api/shop/orders` — View user order history

### 2.6 Content & Social

- `GET /api/content/daily` — Fetch daily content (tarot/astrology)
- `GET /api/content/blog` — Blog index & posts
- `POST /api/content/feedback` — Submit content feedback
- `POST /api/community/event` — Create or RSVP to community event
- `GET /api/community/events` — List all events

### 2.7 Rewards & Feedback

- `GET /api/rewards` — Points, badges, achievements
- `POST /api/feedback` — General app feedback, error logging

---

## 3. API Rules & Notes

- All endpoints must be versioned (`/api/v1/`) as soon as public.
- Use JWT for authentication; never return sensitive data in response.
- All tarot/astrology operations must attribute to user/agent and persist to Supabase.
- Maintain agent attribution for LLM outputs and version all prompt templates.
- Handle external API failures gracefully and return actionable errors.
- Reference `/docs/SITE_MAP.md` and `/docs/claude-mystic-prep-summary.md` for context-aware endpoint expansion.

---

## 4. Planned Extensions

- WebSocket endpoints for live readings, charting, and community events.
- OAuth login via Discord/Google/Apple.
- Endpoint for knowledge graph queries and agent orchestration.
- Plugin endpoints for future agent frameworks (MCP, A2A, AGUI).

---

_Update this API_SPECIFICATION.md with every major feature, endpoint, or agent integration. Cross-reference with FRS and site map for traceability._
