# MISSION: Resolve Docker & Supabase Environment Blocker

## OBJECTIVE

Diagnose and resolve the Docker daemon and Supabase startup failure. The end goal is a fully operational local Supabase instance with all migrations applied, ready for live data validation.

## CONTEXT

The `VALIDATION_REPORT_Persona_Learner.md` has identified a critical blocker: the Docker daemon is not running, preventing Supabase from starting. This blocks all live data testing. The last failed command was `/Applications/Docker.app/Contents/MacOS/Docker & sleep 30 && docker version`, which resulted in a "No such file or directory" and "Cannot connect to the Docker daemon" error.

## EXECUTION PLAN (BATCH COMMANDS)

**// 1. Spawn a specialized DevOps agent.**
mcp**claude-flow**agent_spawn { "type": "coder", "name": "DevOpsSpecialist", "specialty": "Docker/Supabase/CLI" }
mcp**claude-flow**memory_store { "key": "mission/objective", "value": "Fix local Docker and Supabase environment." }

**// 2. Phase 1: Diagnostics. Execute the following commands in a single batch to gather system state.**
Bash { "command": "docker --version" }
Bash { "command": "which docker" }
Bash { "command": "docker ps -a" }
Bash { "command": "ls -l /var/run/docker.sock" }
Read { "file_path": "supabase/config.toml" }
Read { "file_path": "docker-compose.yml" } // Check for Supabase-related docker compose file
Read { "file_path": "package.json" } // To check for supabase CLI scripts

**// 3. Phase 2: Analysis & Hypothesis. Create microtasks based on diagnostics.**
mcp**claude-flow**task_create { "name": "Analyze Diagnostic Output", "parent": "main" }
mcp**claude-flow**agent_assign { "taskId": "[ID_FOR_Analyze_Diagnostic_Output]", "agentId": "DevOpsSpecialist" }
mcp**claude-flow**agent_communicate { "to": "DevOpsSpecialist", "message": "Analyze the output from the diagnostic commands. Determine the root cause of the Docker failure. Is Docker not installed, not in the system PATH, or are there permissions issues? Formulate a step-by-step plan to resolve the issue." }

**// 4. Phase 3: Resolution & Verification.**
mcp**claude-flow**task_create { "name": "Execute Resolution Plan", "parent": "main", "dependencies": ["Analyze Diagnostic Output"] }
mcp**claude-flow**agent_assign { "taskId": "[ID_FOR_Execute_Resolution_Plan]", "agentId": "DevOpsSpecialist" }
mcp**claude-flow**agent_communicate { "to": "DevOpsSpecialist", "message": "Execute your resolution plan. This will likely involve: 1. Attempting to start Docker with the correct command/path. 2. Running `supabase start` to launch the local instance. 3. Running all pending database migrations to create necessary tables like `tarot_interpretations`. 4. Running a final `docker ps` and a simple Supabase query to verify that the entire stack is operational." }

## DELIVERABLES

1. A running local Docker daemon and Supabase instance, confirmed with a `docker ps` command showing the Supabase containers.
2. A log confirming that all database migrations have been successfully applied.
3. A final report detailing the root cause of the issue and the steps taken to resolve it, appended to `claude.md`.
