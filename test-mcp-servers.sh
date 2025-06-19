#!/bin/bash

# MCP Server Test Script for Mystic Arcana
echo "🧪 Testing MCP Server Availability..."

# Test if npx can find the MCP servers
echo "📦 Testing MCP server installations..."

echo "1. Testing memory server..."
if npx -y @modelcontextprotocol/server-memory --help > /dev/null 2>&1; then
    echo "   ✅ Memory server available"
else
    echo "   ❌ Memory server not available"
fi

echo "2. Testing filesystem server..."
if npx -y @modelcontextprotocol/server-filesystem --help > /dev/null 2>&1; then
    echo "   ✅ Filesystem server available"
else
    echo "   ❌ Filesystem server not available"
fi

echo "3. Testing git server..."
if npx -y @modelcontextprotocol/server-git --help > /dev/null 2>&1; then
    echo "   ✅ Git server available"
else
    echo "   ❌ Git server not available"
fi

# Check if memory storage directory exists
echo ""
echo "📁 Checking memory storage directory..."
if [ -d "/Users/kfitz/mystic-arcana-v1000/.cursor/mcp-memory" ]; then
    echo "   ✅ Memory storage directory exists"
    ls -la /Users/kfitz/mystic-arcana-v1000/.cursor/mcp-memory
else
    echo "   ❌ Memory storage directory missing"
    echo "   Creating directory..."
    mkdir -p /Users/kfitz/mystic-arcana-v1000/.cursor/mcp-memory
    echo "   ✅ Directory created"
fi

# Check MCP configuration file
echo ""
echo "🔧 Checking MCP configuration..."
if [ -f "/Users/kfitz/mystic-arcana-v1000/.cursor/mcp.json" ]; then
    echo "   ✅ MCP configuration file exists"
    echo "   📄 Configuration preview:"
    head -10 /Users/kfitz/mystic-arcana-v1000/.cursor/mcp.json
else
    echo "   ❌ MCP configuration file missing"
fi

# Check Node.js and npm
echo ""
echo "🟢 Checking Node.js environment..."
echo "   Node.js version: $(node --version)"
echo "   npm version: $(npm --version)"

echo ""
echo "🎯 Summary:"
echo "   - Run this script to verify MCP server availability"
echo "   - If any servers show ❌, run: npm install -g @modelcontextprotocol/server-[name]"
echo "   - After fixing issues, restart Cursor completely"
echo "   - Test memory commands in a new Claude session"

echo ""
echo "✅ MCP server test complete!"
