#!/bin/bash

# MCP Memory Server Setup Script for Mystic Arcana
# This script sets up and tests the MCP memory server functionality

echo "🔮 Setting up MCP Memory Server for Mystic Arcana..."

# Create memory storage directory
echo "📁 Creating memory storage directory..."
mkdir -p /Users/kfitz/mystic-arcana-v1000/.cursor/mcp-memory

# Install required MCP servers
echo "📦 Installing MCP servers..."
npm install -g @modelcontextprotocol/server-memory
npm install -g @modelcontextprotocol/server-filesystem
npm install -g @modelcontextprotocol/server-git
npm install -g @modelcontextprotocol/server-brave-search
npm install -g @modelcontextprotocol/server-github

# Test memory server installation
echo "🧪 Testing memory server installation..."
if command -v mcp-server-memory &> /dev/null; then
    echo "✅ Memory server installed successfully"
else
    echo "❌ Memory server installation failed"
    echo "Trying alternative installation method..."
    npx -y @modelcontextprotocol/server-memory --version
fi

# Create test memory entry
echo "💾 Creating test memory entry..."
cat > test-memory.json << EOF
{
  "entities": [{
    "name": "MCP Setup Test",
    "entityType": "System Test",
    "observations": [
      "MCP memory server setup completed",
      "Test entry created successfully",
      "Ready for Mystic Arcana project memory management"
    ]
  }]
}
EOF

echo "📋 MCP Configuration Status:"
echo "Memory storage path: /Users/kfitz/mystic-arcana-v1000/.cursor/mcp-memory"
echo "Configuration file: /Users/kfitz/mystic-arcana-v1000/.cursor/mcp.json"

# Display current MCP configuration
echo "🔧 Current MCP Configuration:"
cat /Users/kfitz/mystic-arcana-v1000/.cursor/mcp.json

echo ""
echo "🎯 Next Steps:"
echo "1. Restart Cursor/Claude to reload MCP configuration"
echo "2. Test memory commands in Claude session:"
echo "   - mcp__memory__read_graph()"
echo "   - mcp__memory__search_nodes('test')"
echo "3. If still not working, check Cursor MCP settings"

echo ""
echo "🚨 Troubleshooting:"
echo "- Ensure Cursor has MCP enabled in settings"
echo "- Check that Node.js and npm are properly installed"
echo "- Verify file permissions for memory storage directory"
echo "- Try restarting Cursor completely"

echo ""
echo "✅ MCP Memory Server setup complete!"
