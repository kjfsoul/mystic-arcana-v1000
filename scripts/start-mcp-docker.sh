#!/bin/bash

# Start MCP Servers in Docker Containers
# Simple approach using individual docker run commands

set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
NETWORK_NAME="mcp-network"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[MCP-DOCKER]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Create Docker network
create_network() {
    log "Creating Docker network: $NETWORK_NAME"
    docker network create $NETWORK_NAME 2>/dev/null || {
        warning "Network $NETWORK_NAME already exists"
    }
}

# Stop and remove existing containers
cleanup_containers() {
    log "Cleaning up existing MCP containers..."
    
    containers=("mcp-filesystem" "mcp-git" "mcp-memory")
    for container in "${containers[@]}"; do
        if docker ps -a --format '{{.Names}}' | grep -q "^${container}$"; then
            log "Stopping and removing container: $container"
            docker stop $container >/dev/null 2>&1 || true
            docker rm $container >/dev/null 2>&1 || true
        fi
    done
}

# Start MCP Filesystem Server
start_filesystem_server() {
    log "Starting MCP Filesystem Server..."
    
    docker run -d \
        --name mcp-filesystem \
        --network $NETWORK_NAME \
        -p 3001:3000 \
        -v "$PROJECT_ROOT:/workspace:ro" \
        -e NODE_ENV=production \
        -e MCP_ROOT_PATH=/workspace \
        node:18-alpine \
        sh -c '
            npm init -y &&
            npm install express cors &&
            cat > server.js << "EOF" &&
const express = require("express");
const cors = require("cors");
const fs = require("fs").promises;
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// Simple MCP-like filesystem server
app.post("/mcp", async (req, res) => {
  try {
    const { method, params } = req.body;
    const workspacePath = process.env.MCP_ROOT_PATH || "/workspace";
    
    switch (method) {
      case "tools/list":
        res.json({
          tools: [
            { name: "read_file", description: "Read file contents" },
            { name: "list_directory", description: "List directory contents" }
          ]
        });
        break;
        
      case "tools/call":
        const { name, arguments: args } = params;
        if (name === "read_file") {
          const filePath = path.join(workspacePath, args.path);
          const content = await fs.readFile(filePath, "utf8");
          res.json({ content: [{ type: "text", text: content }] });
        } else if (name === "list_directory") {
          const dirPath = path.join(workspacePath, args.path || "");
          const entries = await fs.readdir(dirPath, { withFileTypes: true });
          const items = entries.map(entry => ({
            name: entry.name,
            type: entry.isDirectory() ? "directory" : "file"
          }));
          res.json({ content: [{ type: "text", text: JSON.stringify(items, null, 2) }] });
        } else {
          res.status(400).json({ error: "Unknown tool: " + name });
        }
        break;
        
      default:
        res.status(400).json({ error: "Unknown method: " + method });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/health", (req, res) => {
  res.json({ status: "healthy", service: "mcp-filesystem" });
});

const port = process.env.PORT || 3000;
app.listen(port, "0.0.0.0", () => {
  console.log(`MCP Filesystem Server running on port ${port}`);
});
EOF
            node server.js
        '
    
    if [ $? -eq 0 ]; then
        log "✅ MCP Filesystem Server started on port 3001"
    else
        error "❌ Failed to start MCP Filesystem Server"
        return 1
    fi
}

# Start MCP Git Server
start_git_server() {
    log "Starting MCP Git Server..."
    
    docker run -d \
        --name mcp-git \
        --network $NETWORK_NAME \
        -p 3002:3000 \
        -v "$PROJECT_ROOT:/workspace" \
        -e NODE_ENV=production \
        node:18-alpine \
        sh -c '
            apk add --no-cache git &&
            npm init -y &&
            npm install express cors simple-git &&
            cat > server.js << "EOF" &&
const express = require("express");
const cors = require("cors");
const simpleGit = require("simple-git");

const app = express();
app.use(cors());
app.use(express.json());

const git = simpleGit("/workspace");

app.post("/mcp", async (req, res) => {
  try {
    const { method, params } = req.body;
    
    switch (method) {
      case "tools/list":
        res.json({
          tools: [
            { name: "git_status", description: "Get git status" },
            { name: "git_log", description: "Get git log" },
            { name: "git_diff", description: "Get git diff" }
          ]
        });
        break;
        
      case "tools/call":
        const { name, arguments: args } = params;
        if (name === "git_status") {
          const status = await git.status();
          res.json({ content: [{ type: "text", text: JSON.stringify(status, null, 2) }] });
        } else if (name === "git_log") {
          const log = await git.log({ maxCount: args.maxCount || 10 });
          res.json({ content: [{ type: "text", text: JSON.stringify(log, null, 2) }] });
        } else if (name === "git_diff") {
          const diff = args.file ? await git.diff([args.file]) : await git.diff();
          res.json({ content: [{ type: "text", text: diff }] });
        } else {
          res.status(400).json({ error: "Unknown tool: " + name });
        }
        break;
        
      default:
        res.status(400).json({ error: "Unknown method: " + method });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/health", (req, res) => {
  res.json({ status: "healthy", service: "mcp-git" });
});

const port = process.env.PORT || 3000;
app.listen(port, "0.0.0.0", () => {
  console.log(`MCP Git Server running on port ${port}`);
});
EOF
            node server.js
        '
    
    if [ $? -eq 0 ]; then
        log "✅ MCP Git Server started on port 3002"
    else
        error "❌ Failed to start MCP Git Server"
        return 1
    fi
}

# Start MCP Memory Server
start_memory_server() {
    log "Starting MCP Memory Server..."
    
    docker run -d \
        --name mcp-memory \
        --network $NETWORK_NAME \
        -p 3003:3000 \
        -v mcp-memory-data:/data \
        -e NODE_ENV=production \
        -e MCP_MEMORY_PATH=/data \
        node:18-alpine \
        sh -c '
            npm init -y &&
            npm install express cors sqlite3 &&
            cat > server.js << "EOF" &&
const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

const dbPath = path.join(process.env.MCP_MEMORY_PATH || "/data", "memory.db");
const db = new sqlite3.Database(dbPath);

// Initialize database
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS memories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE,
    value TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
});

app.post("/mcp", async (req, res) => {
  try {
    const { method, params } = req.body;
    
    switch (method) {
      case "tools/list":
        res.json({
          tools: [
            { name: "store_memory", description: "Store a memory" },
            { name: "retrieve_memory", description: "Retrieve a memory" },
            { name: "list_memories", description: "List all memories" }
          ]
        });
        break;
        
      case "tools/call":
        const { name, arguments: args } = params;
        
        if (name === "store_memory") {
          db.run("INSERT OR REPLACE INTO memories (key, value) VALUES (?, ?)", 
                 [args.key, args.value], function(err) {
            if (err) res.status(500).json({ error: err.message });
            else res.json({ content: [{ type: "text", text: `Memory stored: ${args.key}` }] });
          });
        } else if (name === "retrieve_memory") {
          db.get("SELECT value FROM memories WHERE key = ?", [args.key], (err, row) => {
            if (err) res.status(500).json({ error: err.message });
            else if (row) res.json({ content: [{ type: "text", text: row.value }] });
            else res.json({ content: [{ type: "text", text: "Memory not found" }] });
          });
        } else if (name === "list_memories") {
          db.all("SELECT key, value, timestamp FROM memories ORDER BY timestamp DESC", (err, rows) => {
            if (err) res.status(500).json({ error: err.message });
            else res.json({ content: [{ type: "text", text: JSON.stringify(rows, null, 2) }] });
          });
        } else {
          res.status(400).json({ error: "Unknown tool: " + name });
        }
        break;
        
      default:
        res.status(400).json({ error: "Unknown method: " + method });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/health", (req, res) => {
  res.json({ status: "healthy", service: "mcp-memory" });
});

const port = process.env.PORT || 3000;
app.listen(port, "0.0.0.0", () => {
  console.log(`MCP Memory Server running on port ${port}`);
});
EOF
            node server.js
        '
    
    if [ $? -eq 0 ]; then
        log "✅ MCP Memory Server started on port 3003"
    else
        error "❌ Failed to start MCP Memory Server"
        return 1
    fi
}

# Wait for services to be healthy
wait_for_health() {
    log "Waiting for services to be healthy..."
    
    services=("3001:mcp-filesystem" "3002:mcp-git" "3003:mcp-memory")
    
    for service in "${services[@]}"; do
        port="${service%%:*}"
        name="${service##*:}"
        
        log "Checking health of $name on port $port..."
        
        for i in {1..30}; do
            if curl -s "http://localhost:$port/health" >/dev/null 2>&1; then
                log "✅ $name is healthy"
                break
            fi
            
            if [ $i -eq 30 ]; then
                error "❌ $name failed to become healthy"
                return 1
            fi
            
            sleep 2
        done
    done
}

# Main function
main() {
    log "Starting MCP Docker Services..."
    
    create_network
    cleanup_containers
    
    start_filesystem_server
    start_git_server  
    start_memory_server
    
    wait_for_health
    
    log "🎉 All MCP services are running!"
    log "   - Filesystem: http://localhost:3001"
    log "   - Git: http://localhost:3002"
    log "   - Memory: http://localhost:3003"
    
    # Update the agent log
    node "$PROJECT_ROOT/scripts/update-agent-log.js" resolve-issue docker-compose-yaml-error "Started MCP servers using individual Docker containers"
}

# Run if called directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
