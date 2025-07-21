import os
from pathlib import Path

def safe_write(path, content):
    if not Path(path).exists():
        with open(path, "w") as f:
            f.write(content)
        print(f"✅ Created {path}")
    else:
        print(f"⚠️ Skipped {path} (already exists)")

core_files = {
    "mystic-agents/task_pool.json": "[]",
    "mystic-agents/memory_trigger.py": "# Memory trigger logic for CrewAI\n",
    "mystic-agents/strategic_agent_loop.py": "# Main loop for autonomous agent execution\n",
    "utils/a_mem_logger.py": "# a_mem logger placeholder\n"
}

for file, template in core_files.items():
    safe_write(file, template)