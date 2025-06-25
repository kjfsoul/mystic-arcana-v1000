#!/usr/bin/env node

// Use ESM import style for compatibility and future-proofing.
// Node.js supports top-level await and ESM imports in .mjs or with "type": "module" in package.json.
// If you must use CommonJS, consider dynamic import or a compatible fetch polyfill.
import fetch from "node-fetch";

const TAROT_API_URL =
  process.env.TAROT_API_URL ||
  "http://localhost:3000/api/tarot/deck/00000000-0000-0000-0000-000000000001";

/**
 * Draws a three-card tarot spread from the specified API.
 * Each card is randomly assigned an orientation: Upright or Reversed.
 * 
 * Returns: Promise<Array<{...card, position: "Upright" | "Reversed"}>>
 */
async function drawSpread() {
  const response = await fetch(TAROT_API_URL);
  const { cards } = await response.json();
  let spread = [...cards].sort(() => Math.random() - 0.5).slice(0, 3);
  spread = spread.map((card) => ({
    ...card,
    position: Math.random() > 0.5 ? "Upright" : "Reversed",
  }));
  return spread;
}
(async () => {
  const result = await drawSpread();
  console.log(JSON.stringify(result, null, 2));
  setInterval(() => {}, 1 << 30); // Keep alive for MCP
})();
