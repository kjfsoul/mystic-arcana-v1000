# MCP Server Consolidation Plan

## Current Issues
1. **3 conflicting MCP config files** (.mcp.json, .roo/mcp.json, mcp.json)
2. **Servers scattered across 3 directories** (/mcp/, /mcp-servers/, /src/agents/)
3. **Duplicate server definitions** (filesystem, memory defined multiple times)
4. **Exposed API keys in configs**
5. **Non-functional server references**

## Consolidation Strategy

### 1. Canonical Directory Structure
```
/mcp-servers/
├── core/              # Official MCP servers (via npx)
├── custom/            # Project-specific servers
│   ├── tarot/
│   │   └── server.js
│   ├── astrology/
│   │   └── server.js
│   └── agent-orchestrator/
│       └── server.js
└── README.md          # Documentation
```

### 2. Single Config Location
- **Keep:** `.roo/mcp.json` (Roo's standard location)
- **Archive:** `.mcp.json` → `.mcp.json.backup`
- **Remove:** `mcp.json` (duplicate)

### 3. Server Consolidation

#### Active Servers to Keep:
1. **filesystem** - File operations
2. **memory** - Knowledge graph
3. **brave-search** - Web search
4. **github** - Git operations
5. **context7** - Library docs
6. **@21st-dev/magic** - UI components
7. **tarot-engine-mystic** - Custom tarot server
8. **astrology-engine-mystic** - Custom astrology server
9. **agent-orchestrator** - Agent coordination

#### Servers to Remove:
- sequential-thinking (unused)
- MCP_DOCKER (not implemented)
- claude-mystic (incorrect usage)
- Duplicate filesystem/memory definitions

### 4. Environment Variables
Create `.env.mcp` for sensitive keys:
```bash
BRAVE_API_KEY=xxx
GITHUB_PERSONAL_ACCESS_TOKEN=xxx
UPSTASH_CONTEXT7_API_KEY=xxx
TWENTY_FIRST_API_KEY=xxx
SUPABASE_ACCESS_TOKEN=xxx
```

### 5. Breaking Changes
- Server paths will change
- Config file location changes
- Environment variable requirements

## Migration Steps
1. Create new directory structure
2. Move servers to canonical locations
3. Update paths in .roo/mcp.json
4. Move sensitive keys to .env.mcp
5. Archive old configs
6. Test all servers
7. Update documentation