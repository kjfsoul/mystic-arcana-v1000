#!/bin/bash

# Mystic Arcana Demo Mode Startup Script
# Runs demonstration tasks to show agent capabilities

echo "🔮 MYSTIC ARCANA CREW DEMONSTRATION 🔮"
echo "=" * 40

# Set environment variables for demo mode
export AUTONOMOUS_MODE=false
export RUN_DEMONSTRATION=true

# Verify required environment variables
if [ -z "$ANTHROPIC_API_KEY" ]; then
    echo "❌ ERROR: ANTHROPIC_API_KEY not set"
    echo "Please set your Anthropic API key:"
    echo "export ANTHROPIC_API_KEY='your-key-here'"
    exit 1
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

# Run demonstration
echo "🎭 Running Mystic Arcana Crew Demonstration..."
echo ""

python main.py

echo ""
echo "✨ Demonstration completed"