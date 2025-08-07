# Mystic Arcana Legal Integration & Deployment Guide

## Markdown File Structure

- Stored under `/content/legal/`

## Component Renderer

- React component uses Tailwind CSS
- Integrates `react-markdown` and `remark-gfm`

## Route System

- Slug-based routing via `/legal/[slug].tsx`

## Legal Routes

- /legal/privacy
- /legal/terms
- /legal/disclaimer
- /legal/cookies
- /legal/affiliate
- /legal/community
- /legal/index

## User Flow Integration

- Reader Experience: Show Terms + Disclaimer before using AI readers
- Journal Tools: Show Privacy + Community Guidelines
- Shop: Show Affiliate Disclosure
- Onboarding: Consent to Terms, Privacy, Disclaimer

## Consent Tracking

- Stored in Supabase under user profile metadata or `legal_consents` table
