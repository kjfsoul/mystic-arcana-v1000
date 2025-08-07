#!/usr/bin/env npx tsx

/**
 * Agent Task Logging Utility
 * Used by agents to log task completions
 */

import { claudeInitAgent } from "../src/agents/claude-init";

// Parse command line arguments
const args = process.argv.slice(2);

if (args.length < 4) {
  console.error(
    "Usage: log-agent-task.ts <agent_id> <agent_name> <task_type> <task_description> [status] [error]",
  );
  process.exit(1);
}

const [
  agentId,
  agentName,
  taskType,
  taskDescription,
  status = "completed",
  error,
] = args;

// Log the task
claudeInitAgent.logTaskCompletion({
  agent_id: agentId,
  agent_name: agentName,
  task_type: taskType,
  task_description: taskDescription,
  status: status as "started" | "completed" | "failed",
  error: error,
});

console.log(`Task logged: ${agentName} - ${taskType} - ${status}`);
