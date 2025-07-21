#!/bin/bash

# Mystic Arcana Autonomous Crew Startup Script
# Sets up environment and starts continuous autonomous operation

echo "🔮✨ MYSTIC ARCANA AUTONOMOUS CREW STARTUP ✨🔮"
echo "=" * 50

# Set environment variables for autonomous mode
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

# Start autonomous operation
echo "🚀 Starting Mystic Arcana Autonomous Crew..."
echo "🛑 Press Ctrl+C to stop autonomous operation"
echo ""

# Run the main script in autonomous mode
python main.py

echo ""
echo "✨ Autonomous operation completed"