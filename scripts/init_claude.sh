#!/bin/bash

echo "⚙️ Bootstrapping Claude Memory Context..."

export CLAUDE_FILES=(
  "claude.md"
  "claudeupdate.md"
  "CLAUDE_INTEGRITY_RULES.md"
  "CLAUDE_SESSION_COMMANDS.md"
  "adaptive_personalization.md"
  "ASTROLOGY_IMPLEMENTATION.md"
  "SPIRITUAL_VOICE_CHECKLIST.md"
  "docs/personalization/personalizedtarot.md"
  "docs/research/perplexityvirtualreaders.md"
  "docs/community/communityengage.md"
  "docs/astrology/astrologycalcs.md"
)

for file in "${CLAUDE_FILES[@]}"; do
  echo "🔄 Loading $file into Claude context..."
  curl -X POST http://localhost:5555/claude/load \
       -H "Content-Type: application/json" \
       -d "{\"file\": \"$file\"}"
done

echo "✅ Claude memory initialized."
