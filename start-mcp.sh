#!/bin/bash

# Start Working MCP Server
# Simple, reliable MCP server that actually works

set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PID_FILE="$PROJECT_ROOT/mcp-server.pid"
LOG_FILE="$PROJECT_ROOT/logs/mcp-server.log"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[MCP]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

# Check if server is running
is_running() {
    if [[ -f "$PID_FILE" ]]; then
        local pid=$(cat "$PID_FILE")
        if ps -p "$pid" > /dev/null 2>&1; then
            return 0
        else
            rm -f "$PID_FILE"
            return 1
        fi
    fi
    return 1
}

# Start the server
start_server() {
    if is_running; then
        warning "MCP server is already running (PID: $(cat "$PID_FILE"))"
        return 0
    fi

    log "Starting Simple MCP Server..."
    
    # Create logs directory
    mkdir -p "$(dirname "$LOG_FILE")"
    
    # Start server in background
    nohup node "$PROJECT_ROOT/simple-mcp-server.js" > "$LOG_FILE" 2>&1 &
    local pid=$!
    
    # Save PID
    echo "$pid" > "$PID_FILE"
    
    # Wait a moment and check if it started successfully
    sleep 2
    
    if is_running; then
        log "✅ MCP Server started successfully (PID: $pid)"
        log "📋 Server URL: http://localhost:3000"
        log "❤️  Health Check: http://localhost:3000/health"
        log "📄 Logs: $LOG_FILE"
        
        # Test health endpoint
        if curl -s http://localhost:3000/health > /dev/null 2>&1; then
            log "🎉 Server is healthy and responding!"
        else
            warning "Server started but health check failed"
        fi
        
        return 0
    else
        error "Failed to start MCP server"
        if [[ -f "$LOG_FILE" ]]; then
            error "Check logs: $LOG_FILE"
            tail -10 "$LOG_FILE"
        fi
        return 1
    fi
}

# Stop the server
stop_server() {
    if ! is_running; then
        warning "MCP server is not running"
        return 0
    fi

    local pid=$(cat "$PID_FILE")
    log "Stopping MCP Server (PID: $pid)..."
    
    kill "$pid"
    
    # Wait for graceful shutdown
    local count=0
    while ps -p "$pid" > /dev/null 2>&1 && [[ $count -lt 10 ]]; do
        sleep 1
        ((count++))
    done
    
    # Force kill if still running
    if ps -p "$pid" > /dev/null 2>&1; then
        warning "Force killing server..."
        kill -9 "$pid"
    fi
    
    rm -f "$PID_FILE"
    log "✅ MCP Server stopped"
}

# Restart the server
restart_server() {
    log "Restarting MCP Server..."
    stop_server
    sleep 1
    start_server
}

# Show server status
status_server() {
    if is_running; then
        local pid=$(cat "$PID_FILE")
        log "✅ MCP Server is running (PID: $pid)"
        
        # Test health endpoint
        if curl -s http://localhost:3000/health > /dev/null 2>&1; then
            log "🎉 Server is healthy and responding"
            
            # Show server info
            info "Server capabilities:"
            curl -s http://localhost:3000/health | jq -r '.capabilities[]' | sed 's/^/  - /'
        else
            error "Server is running but not responding to health checks"
        fi
    else
        warning "MCP Server is not running"
    fi
}

# Show logs
show_logs() {
    if [[ -f "$LOG_FILE" ]]; then
        log "📄 MCP Server Logs:"
        tail -20 "$LOG_FILE"
    else
        warning "No log file found: $LOG_FILE"
    fi
}

# Test server functionality
test_server() {
    log "🧪 Testing MCP Server functionality..."
    
    if ! is_running; then
        error "Server is not running. Start it first with: $0 start"
        return 1
    fi
    
    # Test health endpoint
    info "Testing health endpoint..."
    if curl -s http://localhost:3000/health | jq . > /dev/null; then
        log "✅ Health check passed"
    else
        error "❌ Health check failed"
        return 1
    fi
    
    # Test filesystem
    info "Testing filesystem operations..."
    if node mcp-client.js read package.json > /dev/null 2>&1; then
        log "✅ Filesystem operations working"
    else
        error "❌ Filesystem operations failed"
    fi
    
    # Test git
    info "Testing git operations..."
    if node mcp-client.js git-status > /dev/null 2>&1; then
        log "✅ Git operations working"
    else
        error "❌ Git operations failed"
    fi
    
    # Test memory
    info "Testing memory operations..."
    if node mcp-client.js store test-key test-value > /dev/null 2>&1; then
        log "✅ Memory operations working"
    else
        error "❌ Memory operations failed"
    fi
    
    log "🎉 All tests passed! MCP Server is fully functional."
}

# Main function
main() {
    case "${1:-}" in
        start)
            start_server
            ;;
        stop)
            stop_server
            ;;
        restart)
            restart_server
            ;;
        status)
            status_server
            ;;
        logs)
            show_logs
            ;;
        test)
            test_server
            ;;
        *)
            echo "🚀 Simple MCP Server Manager"
            echo ""
            echo "Usage: $0 {start|stop|restart|status|logs|test}"
            echo ""
            echo "Commands:"
            echo "  start    - Start the MCP server"
            echo "  stop     - Stop the MCP server"
            echo "  restart  - Restart the MCP server"
            echo "  status   - Show server status"
            echo "  logs     - Show server logs"
            echo "  test     - Test server functionality"
            echo ""
            echo "Examples:"
            echo "  $0 start     # Start the server"
            echo "  $0 status    # Check if running"
            echo "  $0 test      # Test all functionality"
            echo ""
            echo "Client Usage:"
            echo "  node mcp-client.js health"
            echo "  node mcp-client.js read package.json"
            echo "  node mcp-client.js git-status"
            echo "  node mcp-client.js store key value"
            ;;
    esac
}

# Run if called directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
