#!/usr/bin/env bash

mkdir -p ".claude"

# === settings.local.json ===
if [ ! -f ".claude/settings.local.json" ]; then
  cat <<EOF > ".claude/settings.local.json"
{
  "permissions": {
    "allow": ["gp", "ls", "mkdir", "mv", "python", "gh", "supabase", "npx"],
    "deny": ["rm", "bash *"],
    "mcp_serena": true
  },
  "slashCommands": {
    "enabled": true
  }
}
EOF
fi

# === Create folders ===
mkdir -p ".claude/commands/workflows"
mkdir -p ".claude/commands/automation"
mkdir -p ".claude/commands/github"
mkdir -p ".claude/commands/optimization"
mkdir -p ".claude/commands/sparc"
mkdir -p ".claude/hooks"
mkdir -p ".claude/PRPs"
mkdir -p ".claude/agents"
mkdir -p "scripts"

# === Manual file creation ===
create_if_missing() {
  local filepath="$1"
  local content="$2"
  if [ ! -f "$filepath" ]; then
    echo -e "$content" > "$filepath"
  fi
}

# === Command Files ===
create_if_missing ".claude/commands/workflows/primer.md" "## Claude Code Primer\n\n1. Run \`tree -L 2\`\n2. Load claude.md, STATE_OF_THE_ARCANA.md, adaptive_personalization.md\n3. Register agent state\n4. Prepare for mobile fix & test coverage"
create_if_missing ".claude/commands/workflows/full_setup.md" "## Claude Code Full Setup Placeholder"
create_if_missing ".claude/commands/automation/agent_activation_sprint.md" "## Agent Activation Sprint Placeholder"
create_if_missing ".claude/commands/github/fix_issue.md" "## Fix GitHub Issue Placeholder"
create_if_missing ".claude/commands/optimization/test_suite.md" "## Test Suite Finalization Placeholder"
create_if_missing ".claude/commands/sparc/generate_prp.md" "## PRP Generator Placeholder"
create_if_missing ".claude/commands/sparc/execute_prp.md" "## PRP Executor Placeholder"

# === Hook File ===
create_if_missing ".claude/hooks/on_edit.json" '{
  "matcher": "tool_used:edit",
  "command": "../../scripts/log_edit.sh"
}'

# === PRP File ===
create_if_missing ".claude/PRPs/init_virtual_reader_system.md" '# Feature: Virtual Reader Agent Expansion
## CONTEXT
Mystic Arcana has 28 reader agents defined, 4 active. Goal: activate all.
## REQUIREMENTS
- Use Claude Code and registered agents only
- Implement modular memory scaffolding via a_mem
- Include journaling context processing and spread adaptation
## REFERENCES
- adaptive_personalization.md
- claude.md
- STATE_OF_THE_ARCANA.md'

# === Sub-agent File ===
create_if_missing ".claude/agents/validation_gate.md" '# Validation Gate Agent

## ROLE
Ensure all Claude Code outputs meet Mystic Arcana standards.
## TRIGGER
After any PRP execution or Claude-edit command.
## TOOLS
- Supabase client
- Git
- Claude Hooks
## MODEL
Claude Sonnet or Claude Code'

# === Logging Script ===
if [ ! -f "scripts/log_edit.sh" ]; then
  cat <<EOF > "scripts/log_edit.sh"
#!/bin/bash
echo "\$(date) - Claude made an edit." >> logs/claude-edits.log
EOF
  chmod +x scripts/log_edit.sh
fi
