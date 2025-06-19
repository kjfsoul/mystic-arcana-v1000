#!/bin/bash

# Mystic Arcana MCP Server Monitor & Repair System
# Monitors MCP servers, agents, and Docker-based MCP toolkit integration

set -euo pipefail

# Configuration
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOG_DIR="$PROJECT_ROOT/logs"
AGENT_REGISTRY="$PROJECT_ROOT/agents/registry.json"
MCP_CONFIG="$PROJECT_ROOT/mcp-final-working-config.json"
DOCKER_MCP_CONFIG="$PROJECT_ROOT/docker-mcp-config.yml"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check Docker MCP toolkit availability
check_docker_mcp() {
    log "Checking Docker MCP toolkit availability..."

    if command -v docker &> /dev/null; then
        success "Docker is available"

        # Check for Docker MCP toolkit
        if docker --help | grep -q "mcp" 2>/dev/null; then
            success "Docker MCP toolkit detected"
            return 0
        else
            warning "Docker MCP toolkit not yet available - using fallback methods"
            return 1
        fi
    else
        error "Docker not available"
        return 1
    fi
}

# Monitor MCP servers
monitor_mcp_servers() {
    log "Monitoring MCP servers..."

    if [[ -f "$MCP_CONFIG" ]]; then
        node "$PROJECT_ROOT/scripts/mcp-tester.js" "$MCP_CONFIG" || {
            error "MCP server testing failed"
            repair_mcp_servers
        }
    else
        warning "MCP configuration not found: $MCP_CONFIG"
        create_default_mcp_config
    fi
}

# Repair MCP servers
repair_mcp_servers() {
    log "Attempting to repair MCP servers..."

    # Try Docker-based approach first
    if check_docker_mcp; then
        setup_docker_mcp_servers
    else
        # Fallback to npm-based installation
        install_npm_mcp_servers
    fi
}

# Setup Docker-based MCP servers
setup_docker_mcp_servers() {
    log "Setting up Docker-based MCP servers..."

    # Create Docker Compose configuration for MCP servers
    cat > "$DOCKER_MCP_CONFIG" << 'EOF'
version: '3.8'
services:
  mcp-filesystem:
    image: modelcontextprotocol/filesystem-server:latest
    volumes:
      - .:/workspace
    environment:
      - MCP_ROOT_PATH=/workspace
    ports:
      - "3001:3000"
    restart: unless-stopped

  mcp-git:
    image: modelcontextprotocol/git-server:latest
    volumes:
      - .:/workspace
      - ~/.gitconfig:/root/.gitconfig:ro
    working_dir: /workspace
    ports:
      - "3002:3000"
    restart: unless-stopped

  mcp-memory:
    image: modelcontextprotocol/memory-server:latest
    volumes:
      - mcp-memory-data:/data
    environment:
      - MCP_MEMORY_PATH=/data
    ports:
      - "3003:3000"
    restart: unless-stopped

  mcp-web-search:
    image: modelcontextprotocol/web-search-server:latest
    environment:
      - BRAVE_API_KEY=${BRAVE_API_KEY:-}
      - GOOGLE_API_KEY=${GOOGLE_API_KEY:-}
    ports:
      - "3004:3000"
    restart: unless-stopped

  mcp-database:
    image: modelcontextprotocol/database-server:latest
    environment:
      - DATABASE_URL=${SUPABASE_URL:-}
      - DATABASE_KEY=${SUPABASE_ANON_KEY:-}
    ports:
      - "3005:3000"
    restart: unless-stopped

volumes:
  mcp-memory-data:
EOF

    # Start Docker MCP services
    if docker-compose -f "$DOCKER_MCP_CONFIG" up -d; then
        success "Docker MCP servers started successfully"
        update_mcp_config_for_docker
    else
        error "Failed to start Docker MCP servers"
        return 1
    fi
}

# Update MCP configuration for Docker endpoints
update_mcp_config_for_docker() {
    log "Updating MCP configuration for Docker endpoints..."

    cat > "$PROJECT_ROOT/mcp-docker-config.json" << 'EOF'
{
  "mcpServers": {
    "filesystem": {
      "command": "curl",
      "args": ["-X", "POST", "http://localhost:3001/mcp", "-H", "Content-Type: application/json"],
      "env": {},
      "type": "http"
    },
    "git": {
      "command": "curl",
      "args": ["-X", "POST", "http://localhost:3002/mcp", "-H", "Content-Type: application/json"],
      "env": {},
      "type": "http"
    },
    "memory": {
      "command": "curl",
      "args": ["-X", "POST", "http://localhost:3003/mcp", "-H", "Content-Type: application/json"],
      "env": {},
      "type": "http"
    },
    "web-search": {
      "command": "curl",
      "args": ["-X", "POST", "http://localhost:3004/mcp", "-H", "Content-Type: application/json"],
      "env": {},
      "type": "http"
    },
    "database": {
      "command": "curl",
      "args": ["-X", "POST", "http://localhost:3005/mcp", "-H", "Content-Type: application/json"],
      "env": {},
      "type": "http"
    }
  }
}
EOF

    success "Docker MCP configuration created"
}

# Install npm-based MCP servers (fallback)
install_npm_mcp_servers() {
    log "Installing npm-based MCP servers as fallback..."

    # Install essential MCP servers
    npm install -g @modelcontextprotocol/server-filesystem || warning "Failed to install filesystem server"
    npm install -g @modelcontextprotocol/server-git || warning "Failed to install git server"
    npm install -g @modelcontextprotocol/server-memory || warning "Failed to install memory server"

    success "MCP servers installation attempted"
}

# Create default MCP configuration
create_default_mcp_config() {
    log "Creating default MCP configuration..."

    cp "$PROJECT_ROOT/mcp-final-working-config.json" "$PROJECT_ROOT/mcp-backup-$(date +%Y%m%d-%H%M%S).json" 2>/dev/null || true

    cat > "$MCP_CONFIG" << 'EOF'
{
  "mcpServers": {
    "filesystem": {
      "command": "mcp-server-filesystem",
      "args": ["/mnt/persist/workspace"],
      "env": {}
    },
    "git": {
      "command": "mcp-server-git",
      "args": [],
      "env": {}
    },
    "memory": {
      "command": "mcp-server-memory",
      "args": [],
      "env": {}
    }
  }
}
EOF

    success "Default MCP configuration created"
}

# Main monitoring function
main() {
    log "Starting Mystic Arcana MCP & Agent Monitor..."

    # Create log directory if it doesn't exist
    mkdir -p "$LOG_DIR/mcp"

    # Check Docker MCP availability
    check_docker_mcp

    # Monitor MCP servers
    monitor_mcp_servers

    # Monitor agents (will be implemented in next part)
    # monitor_agents

    success "Monitoring cycle completed"
}

# Run if called directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
