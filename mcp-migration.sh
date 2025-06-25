#!/bin/bash
# MCP Server Consolidation Migration Script
# This script consolidates all MCP servers into a single canonical structure

set -e  # Exit on error

echo "🚀 Starting MCP Server Consolidation..."

# 1. Create new directory structure
echo "📁 Creating new directory structure..."
mkdir -p mcp-servers/core
mkdir -p mcp-servers/custom/tarot
mkdir -p mcp-servers/custom/astrology
mkdir -p mcp-servers/custom/agent-orchestrator

# 2. Backup existing configs
echo "📦 Backing up existing configs..."
if [ -f ".mcp.json" ]; then
    cp .mcp.json .mcp.json.backup.$(date +%Y%m%d_%H%M%S)
fi
if [ -f "mcp.json" ]; then
    cp mcp.json mcp.json.backup.$(date +%Y%m%d_%H%M%S)
fi
if [ -f ".roo/mcp.json" ]; then
    cp .roo/mcp.json .roo/mcp.json.backup.$(date +%Y%m%d_%H%M%S)
fi

# 3. Move custom servers to new locations
echo "🚚 Moving custom servers..."
if [ -f "mcp/tarot-mcp.js" ]; then
    cp mcp/tarot-mcp.js mcp-servers/custom/tarot/server.js
    echo "   ✓ Moved tarot server"
fi
if [ -f "mcp/astrology-mcp.js" ]; then
    cp mcp/astrology-mcp.js mcp-servers/custom/astrology/server.js
    echo "   ✓ Moved astrology server"
fi
if [ -f "mcp/agent-orchestrator.js" ]; then
    cp mcp/agent-orchestrator.js mcp-servers/custom/agent-orchestrator/server.js
    echo "   ✓ Moved agent orchestrator"
fi

# 4. Create environment variables file
echo "🔐 Creating environment variables template..."
cat > .env.mcp <<EOF
# MCP Server Environment Variables
# Copy this to .env.mcp.local and fill in your actual keys

# Brave Search API
BRAVE_API_KEY=your_brave_api_key_here

# GitHub Personal Access Token
GITHUB_PERSONAL_ACCESS_TOKEN=your_github_token_here

# Upstash Context7 API
UPSTASH_CONTEXT7_API_KEY=your_context7_key_here

# 21st.dev Magic API
TWENTY_FIRST_API_KEY=your_21st_key_here

# Supabase Access Token
SUPABASE_ACCESS_TOKEN=your_supabase_token_here
SUPABASE_PROJECT_REF=your_project_ref_here
EOF

# 5. Create documentation
echo "📝 Creating documentation..."
cat > mcp-servers/README.md <<EOF
# MCP Servers Directory

This directory contains all MCP (Model Context Protocol) servers for Mystic Arcana.

## Directory Structure

- **core/** - Official MCP servers installed via npm
- **custom/** - Project-specific custom servers
  - **tarot/** - Tarot reading engine server
  - **astrology/** - Astrology calculation server
  - **agent-orchestrator/** - Multi-agent coordination server

## Configuration

All MCP servers are configured in \`.roo/mcp.json\`.

## Environment Variables

Sensitive keys are stored in \`.env.mcp.local\` (not committed to git).
Copy \`.env.mcp\` to \`.env.mcp.local\` and fill in your keys.

## Running Servers

Servers are automatically started when you use Roo or Cursor with MCP enabled.

## Testing

To test a specific server:
\`\`\`bash
npm run test:mcp
\`\`\`
EOF

# 6. Add to .gitignore
echo "🚫 Updating .gitignore..."
if ! grep -q ".env.mcp.local" .gitignore 2>/dev/null; then
    echo -e "\n# MCP Environment Variables\n.env.mcp.local" >> .gitignore
fi
if ! grep -q "mcp-cleanup-backup/" .gitignore 2>/dev/null; then
    echo "mcp-cleanup-backup/" >> .gitignore
fi

# 7. Archive old directories
echo "📦 Archiving old directories..."
mkdir -p mcp-cleanup-backup
if [ -d "mcp" ]; then
    mv mcp mcp-cleanup-backup/
fi
if [ -d "mcp-servers" ] && [ "$(ls -A mcp-servers | grep -v -E '^(core|custom|README.md)$')" ]; then
    # Move old files from mcp-servers to backup
    find mcp-servers -maxdepth 1 -type f -exec mv {} mcp-cleanup-backup/ \;
fi

# 8. Clean up obsolete files
echo "🧹 Cleaning up obsolete files..."
obsolete_files=(
    "mcp-client.js"
    "mcp-custom-config.json"
    "mcp-final-working-config.json"
    "mcp-minimal-config.json"
    "mcp-server.pid"
    "mcp-test-results.json"
    "mcp-ui-config.json"
    "mcp-working-config.json"
    "mcp-design-server.js"
    "simple-mcp-server.js"
    "test-mcp-simple.js"
    "test-mcp-working.js"
    "docker-mcp-config.json"
)

for file in "${obsolete_files[@]}"; do
    if [ -f "$file" ]; then
        mv "$file" mcp-cleanup-backup/
        echo "   ✓ Archived $file"
    fi
done

echo "✅ Migration complete!"
echo ""
echo "Next steps:"
echo "1. Copy .env.mcp to .env.mcp.local and fill in your API keys"
echo "2. Review the new .roo/mcp.json configuration"
echo "3. Test all servers with: npm run test:mcp"
echo "4. Once verified, you can remove mcp-cleanup-backup/"
echo ""
echo "🎯 All MCP servers are now consolidated in /mcp-servers/"