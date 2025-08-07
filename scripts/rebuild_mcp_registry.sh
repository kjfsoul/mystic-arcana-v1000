#!/bin/bash
# This script works with both bash and zsh
set -euo pipefail

echo "🔍 Rebuilding agents/registry.json from all known MCP sources..."
OUT="agents/registry.json"
mkdir -p agents/
TMP_IDS=$(mktemp)

# Function to add IDs to the temporary file
add_ids() {
  local source="$1"
  local ids="$2"
  if [[ -n "$ids" ]]; then
    echo "$ids" | while IFS= read -r id; do
      if [[ -n "$id" ]]; then
        echo "$id" >> "$TMP_IDS"
        echo "✅ $source => $id"
      fi
    done
  fi
}

# --- logs/mcp-agent-status.json ---
echo "📁 Scanning logs/mcp-agent-status.json..."
if [[ -f logs/mcp-agent-status.json ]]; then
  if ids=$(jq -r '.mcpServers.servers | keys[]' logs/mcp-agent-status.json 2>/dev/null); then
    add_ids "logs" "$ids"
  else
    echo "⚠️  Failed to parse logs/mcp-agent-status.json"
  fi
else
  echo "⚠️  logs/mcp-agent-status.json does not exist"
fi

# --- .roo/mcp*.json ---
echo "📁 Scanning .roo/*.json..."
if [[ -d .roo ]]; then
  while IFS= read -r -d '' file; do
    echo "🔎 Checking $file"
    if ids=$(jq -r '.mcpServers | to_entries[] | select(.value | type != "string") | .key' "$file" 2>/dev/null); then
      add_ids "$file" "$ids"
    else
      echo "⚠️  Failed to parse $file"
    fi
  done < <(find .roo -type f -name "mcp*.json" -print0 2>/dev/null)
else
  echo "⚠️  .roo directory does not exist"
fi

# --- .claude/settings.local.json ---
echo "📁 Scanning .claude/settings.local.json..."
if [[ -f .claude/settings.local.json ]]; then
  if ids=$(jq -r '.mcpServers | keys[]' .claude/settings.local.json 2>/dev/null); then
    add_ids ".claude" "$ids"
  else
    echo "⚠️  Failed to parse .claude/settings.local.json"
  fi
else
  echo "⚠️  .claude/settings.local.json does not exist"
fi

# --- .env.mcp ---
echo "📁 Scanning .env.mcp for MCP_SERVER_* vars..."
if [[ -f .env.mcp ]]; then
  if ids=$(grep -E '^MCP_SERVER_' .env.mcp | cut -d '=' -f1 | sed 's/^MCP_SERVER_//' | tr '[:upper:]' '[:lower:]' 2>/dev/null); then
    add_ids ".env.mcp" "$ids"
  else
    echo "⚠️  Failed to parse .env.mcp"
  fi
else
  echo "⚠️  .env.mcp does not exist"
fi

# --- Deduplicate ---
if [[ -s "$TMP_IDS" ]]; then
  # Use a more compatible approach for reading into an array
  ALL_IDS=()
  while IFS= read -r id; do
    if [[ -n "$id" ]]; then
      ALL_IDS+=("$id")
    fi
  done < <(sort -u "$TMP_IDS" | grep -v '^$')
else
  echo "⚠️  No MCP server IDs found"
  ALL_IDS=()
fi

# --- Create JSON using jq ---
echo "📝 Writing to $OUT..."
SERVERS_TMP=$(mktemp)

# Process each server ID
COUNT=0
for ID in "${ALL_IDS[@]:-}"; do
  CMD="mcp-server-${ID}"
  STATUS="BROKEN"
  
  # Check if command exists in PATH or in venv
  if command -v "$CMD" >/dev/null 2>&1; then
    STATUS="WORKING"
  elif [[ -n "${VIRTUAL_ENV:-}" ]] && [[ -x "${VIRTUAL_ENV}/bin/${CMD}" ]]; then
    STATUS="WORKING"
  fi
  
  # Add the server entry to the temporary file
  echo "{\"id\":\"$ID\",\"type\":\"mcp\",\"status\":\"$STATUS\"}" >> "$SERVERS_TMP"
  ((COUNT++))
done

# Use jq to create the final JSON
if [[ $COUNT -gt 0 ]]; then
  jq -s '{"servers": .}' "$SERVERS_TMP" > "$OUT"
else
  echo '{"servers": []}' | jq . > "$OUT"
fi

# Clean up
rm -f "$TMP_IDS" "$SERVERS_TMP"

echo "✅ Wrote $COUNT MCP servers to $OUT"
