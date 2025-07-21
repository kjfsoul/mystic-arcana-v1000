#!/bin/bash

# Mystic Arcana Strategic Agent Loop Startup
# Autonomous always-on CrewAI agents with task pooling and collaboration

echo "🔮✨ MYSTIC ARCANA STRATEGIC AGENT LOOP ✨🔮"
echo "=" * 60

# Set environment variables
export AUTONOMOUS_MODE=true
export RUN_DEMONSTRATION=false

# Verify required environment variables
if [ -z "$ANTHROPIC_API_KEY" ]; then
    echo "❌ ERROR: ANTHROPIC_API_KEY not set"
    echo "Please set your Anthropic API key:"
    echo "export ANTHROPIC_API_KEY='your-key-here'"
    exit 1
fi

if [ -z "$PERPLEXITY_API_KEY" ]; then
    echo "⚠️  WARNING: PERPLEXITY_API_KEY not set"
    echo "Some research functions may not work properly"
fi

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔄 Activating virtual environment..."
source venv/bin/activate

# Install/update dependencies
echo "📥 Installing dependencies..."
pip install -r requirements.txt

# Create necessary directories
mkdir -p crew_memory_logs
mkdir -p output
mkdir -p backups

# Initialize task pool if it doesn't exist
if [ ! -f "task_pool.json" ]; then
    echo "🔄 Initializing task pool..."
    python -c "from task_pool import TaskPool; TaskPool()"
fi

# Show system status
echo ""
echo "🤖 System Configuration:"
echo "├── Autonomous Mode: ON"
echo "├── Memory Watching: ON" 
echo "├── Task Pool: Ready"
echo "├── Load Balancing: ON"
echo "├── Collaboration: ON"
echo "└── Self-Improvement: ON"
echo ""

# Start strategic agent loop
echo "🚀 Starting Strategic Agent Loop..."
echo "🔄 Agents will continuously work on available tasks"
echo "🧠 Memory watcher will create tasks from observations"
echo "🤝 Agents will collaborate when blocked"
echo "🔧 Self-improvement tasks will be injected hourly"
echo "🛑 Press Ctrl+C to stop gracefully"
echo ""

# Run the strategic agent loop
python strategic_agent_loop.py

echo ""
echo "✨ Strategic Agent Loop shutdown complete"