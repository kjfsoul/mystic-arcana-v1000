#!/bin/bash

echo "⚙️ Bootstrapping Claude + Agent Framework"

# 1. Load Claude Context
./scripts/init_claude.sh

# 2. Register core agents (if not already registered)
echo "📡 Registering core agents in MCP..."

python3 scripts/agent_register.py --agent_id=VirtualReaderAgent --file=agents/virtual_reader_agent.py
python3 scripts/agent_register.py --agent_id=AstrologyDataAgent --file=agents/astrology_data_agent.py
python3 scripts/agent_register.py --agent_id=SaveReadingAgent --file=agents/save_reading_agent.py

# 3. Log task status
echo "🗂️ Syncing microtask + session logs..."

cp IMPLEMENTATION_MICROTASKS.md logs/snapshots/microtasks_$(date +%Y%m%d).md
cp claude.md logs/snapshots/claude_log_$(date +%Y%m%d).md

echo "✅ Claude + Agent ecosystem initialized"
