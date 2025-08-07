# # Mystic Arcana Frontend — Claude Kickoff Prompt & MVP File/UX Spec

## 1. Claude Opus Kickoff Prompt — _For Galaxy UI & MVP Experience_

<context>
Mystic Arcana is a next-generation tarot and astrology web app delivering a cosmic, cinematic, interactive experience. All design and branding is based on rich cosmic purples, golds, deep blues, and star-gold accents, as seen in the attached logo and sample images. The interface must be accessible, immersive, and responsive.

You have:

- Logo file and palette reference (see attachments)
- UI/UX specs and business context from chat history
- Mystic NotebookLM, astrology/tarot PDFs, competitive/market docs
- Feature and component requirements as outlined below
- Supabase, Netlify, and GitHub already set up
- Asset uploads/links provided as needed

  </context>

<instructions>
1. Generate a React (TypeScript + Tailwind + Framer Motion or Three.js) scaffold for the following UI/UX:
    - Fullscreen animated galaxy background (starfield, shifting planets, constellations, parallax, accessible motion toggle)
    - **Left:** Custom tarot deck area, lure text ("Get your Past, Present, and Future revealed!"), deck pile, animated 3-card spread (user can shuffle/cut, click-to-pick, cards flip face up)
    - Tarot deck must support dynamic import of card images (either custom, open source Rider-Waite, or image API)
    - Behind deck: old-frame collage with iconic tarot archetypes (e.g., High Priestess, Moon, Fool) as background art
    - **Right:** Orion constellation visual, shimmering stars for daily/monthly/yearly astrology (click reveals reading, stars "burst" with animation, then reading modal appears)
    - Galaxy background is always present, with planets drifting in/out and constellation overlays
    - Onboarding modal appears at launch with welcome/brand pitch (see sample below)
    - Header with logo and navigation; footer with socials/legal
    - Responsive, keyboard-navigable, high-contrast & screen-reader ready
    - All assets/components mapped to /assets, /components, /styles as per best practice
2. Extract primary color palette from provided logo image (or reference colors as purples, golds, blues in Tailwind config)
3. Draft brand pitch/welcome script for onboarding modal (short, soulful, inviting)
4. Place all code in correct files, note where assets go, and which need to be generated/fetched
5. Document all component props, state, and expected interactions as comments and in a reference README
</instructions>

<example>
Welcome to Mystic Arcana — Where Wonder, Hope, and Magic Converge.
Step into your personal cosmos: explore the mysteries of tarot and the stars in one seamless journey. Draw your cards, discover your horoscope, and watch as the galaxy shifts with your energy. Ready to see what the universe has in store?
</example>

\<output_format>

- src/components/GalaxyBackground.tsx
- src/components/TarotDeck.tsx
- src/components/OldFrameArchetypes.tsx
- src/components/AstrologyOrion.tsx
- src/components/OnboardingModal.tsx
- src/components/HeaderNav.tsx
- src/components/FooterNav.tsx
- src/components/OverlayWidgets.tsx
- src/assets/{logo.png, palette.json, tarot_card_imgs/..., orion_bg.svg, etc.}
- src/styles/{tailwind.config.js, main.css, ...}
- README.md (file/component/asset map and build instructions)
  \</output_format>

<thinking>
- Review all available context/docs for accessibility, competitive design, and on-brand color/animation choices
- Summarize any further asset or clarification needs before code generation
- Note any best-practice recommendations for file structure, animation, or accessibility
</thinking>

---

## 2. File & Asset Management Instructions

- Place logo and generated palette in /assets
- Tarot card and background art in /assets/tarot_card_imgs and /assets/bg
- CSS/Tailwind config in /styles
- Reference docs and devlog in /reference
- All code output as .tsx (React/TS)

---

## 3. Immediate Next Steps

- Claude to execute prompt, create file/component scaffold with example code/comments for each
- Identify missing assets or component props for next-gen UX (e.g., custom tarot art, star map overlays)
- User to review and approve or iterate on initial code/UX scaffold

---

_This is the definitive Claude Opus kickoff for Mystic Arcana’s cosmic frontend — copy this prompt, update files/links as you go, and keep all major UX/asset/code outputs logged for the next module!_
