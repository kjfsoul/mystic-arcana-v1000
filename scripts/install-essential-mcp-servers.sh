#!/bin/bash

# Essential MCP Servers Installation Script
# Installs core MCP servers that are commonly available and useful

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Installing Essential MCP Servers ===${NC}"
echo

# Check prerequisites
check_prerequisites() {
    echo "Checking prerequisites..."
    
    # Check if npm/node is available
    if ! command -v npm >/dev/null 2>&1; then
        echo -e "${RED}❌ npm is required but not installed${NC}"
        echo "Please install Node.js and npm first"
        exit 1
    fi
    
    if ! command -v npx >/dev/null 2>&1; then
        echo -e "${RED}❌ npx is required but not installed${NC}"
        echo "Please install Node.js and npm first"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Node.js and npm are available${NC}"
}

# Install MCP servers via npm
install_mcp_servers() {
    echo -e "${BLUE}Installing MCP servers...${NC}"
    
    # Essential file system server
    echo "Installing @modelcontextprotocol/server-filesystem..."
    if npm install -g @modelcontextprotocol/server-filesystem; then
        echo -e "${GREEN}✅ @modelcontextprotocol/server-filesystem installed${NC}"
    else
        echo -e "${YELLOW}⚠️ Failed to install @modelcontextprotocol/server-filesystem${NC}"
    fi
    
    # Memory server
    echo "Installing @modelcontextprotocol/server-memory..."
    if npm install -g @modelcontextprotocol/server-memory; then
        echo -e "${GREEN}✅ @modelcontextprotocol/server-memory installed${NC}"
    else
        echo -e "${YELLOW}⚠️ Failed to install @modelcontextprotocol/server-memory${NC}"
    fi
    
    echo
}

# Check what MCP commands are actually available after installation
check_installed_commands() {
    echo -e "${BLUE}Checking installed MCP commands...${NC}"
    
    local commands=("mcp-server-filesystem" "mcp-server-memory")
    
    for cmd in "${commands[@]}"; do
        if command -v "$cmd" >/dev/null 2>&1; then
            echo -e "${GREEN}✅ $cmd is available${NC}"
        else
            echo -e "${RED}❌ $cmd not found in PATH${NC}"
            echo "   Try: which $cmd"
        fi
    done
}

# Main installation process
main() {
    check_prerequisites
    install_mcp_servers
    check_installed_commands
    
    echo
    echo -e "${GREEN}=== Installation Complete ===${NC}"
    echo
    echo -e "${BLUE}Summary:${NC}"
    echo "• Installed essential MCP servers via npm"
    echo
    echo -e "${BLUE}Next steps:${NC}"
    echo "1. Restart your MCP client/IDE"
    echo "2. Test MCP connections"
    echo "3. Add more servers as needed"
    echo
    echo -e "${YELLOW}Note:${NC} If servers still don't work, you may need to:"
    echo "• Check your npm global bin directory is in PATH"
    echo "• Run: npm config get prefix"
    echo "• Add \$(npm config get prefix)/bin to your PATH"
}

# Run the installation
main "$@"