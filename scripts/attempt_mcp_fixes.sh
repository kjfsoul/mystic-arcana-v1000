#!/bin/bash
set -euo pipefail
echo "🔧 Attempting to auto-install missing MCP servers..."
REGISTRY_FILE="agents/registry.json"
ATTEMPTED_PACKAGES=""

# Extract broken server IDs
IDS=$(jq -r '.servers[] | select(.status == "BROKEN") | .id' "$REGISTRY_FILE")

for ID in $IDS; do
  PACKAGE=""
  # Handle overrides using a case statement for POSIX compatibility
  case "$ID" in
    "_supabase-direct")
      PACKAGE="@supabase/mcp-server-supabase"
      ;;
    "@21st-dev/magic")
      PACKAGE="@21st-dev/magic"
      ;;
    "agent-orchestrator")
      PACKAGE="@modelcontextprotocol/server-agent-orchestrator"
      ;;
    "astrology-engine")
      PACKAGE="@modelcontextprotocol/server-astrology-engine"
      ;;
    "brave-search")
      PACKAGE="@modelcontextprotocol/server-brave-search"
      ;;
    "context7")
      PACKAGE="@modelcontextprotocol/server-context7"
      ;;
    "fetch")
      PACKAGE="@modelcontextprotocol/server-fetch"
      ;;
    "filesystem")
      PACKAGE="@modelcontextprotocol/server-filesystem"
      ;;
    "git")
      PACKAGE="@modelcontextprotocol/server-git"
      ;;
    "github")
      PACKAGE="@modelcontextprotocol/server-github"
      ;;
    "mem0")
      PACKAGE="@composio/mem0"
      ;;
    "memory")
      PACKAGE="@modelcontextprotocol/server-memory"
      ;;
    "perplexityai")
      PACKAGE="@composio/perplexityai"
      ;;
    "supabase")
      PACKAGE="@modelcontextprotocol/server-supabase"
      ;;
    "tarot-engine")
      PACKAGE="@modelcontextprotocol/server-tarot-engine"
      ;;
    *)
      echo "❌ Unknown MCP server ID: $ID"
      continue
      ;;
  esac

  echo "➡ Trying: $PACKAGE"
  if npm install -g "$PACKAGE" &>/dev/null; then
    echo "✅ Installed: $PACKAGE"
    ATTEMPTED_PACKAGES="$ATTEMPTED_PACKAGES $PACKAGE"
  else
    echo "❌ Failed (may not exist): $PACKAGE"
  fi
done

echo ""
echo "🔍 Checking installed MCP servers..."

# Check each attempted package
for PACKAGE in $ATTEMPTED_PACKAGES; do
  if npm list -g --depth=0 | grep -q "$PACKAGE@"; then
    echo "✅ Installed: $PACKAGE"
  else
    echo "❌ Not installed: $PACKAGE"
  fi
done
