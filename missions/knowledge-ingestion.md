# MISSION: Intelligence Engine - Phase 1: Knowledge Ingestion

## OBJECTIVE

Activate the `ContentIngestor` agent and build the foundational "Knowledge Pool" in Supabase. This involves designing the necessary database schema and ingesting the structured tarot interpretations from `tarot-images.json` and the thematic principles from the Perplexity enrichment documents.

## CONTEXT

The Tarot Reading Room UI is complete and awaiting an intelligent backend. This mission creates that intelligence by processing the provided knowledge source files (`tarot-images.json`, `___TAROT AND ASTROLOGY DAILY DATABASE ENRICHMENT__.md`) into a structured, queryable database. This is the first phase of the Personalized Reading Intelligence Engine initiative.

## EXECUTION PLAN (BATCH COMMANDS)

**// 1. Spawn and configure the data and validation agents.**
mcp**claude-flow**agent_spawn { "type": "architect", "name": "SystemDesigner" }
mcp**claude-flow**agent_spawn { "type": "coder", "name": "ContentIngestor" }
mcp**claude-flow**agent_spawn { "type": "tester", "name": "QAValidator" }
mcp**claude-flow**memory_store { "key": "mission/objective", "value": "Build Foundational Knowledge Pool" }

**// 2. Read all relevant knowledge source files in a single batch.**
Read { "file*path": "tarot-images.json" }
Read { "file_path": "***TAROT AND ASTROLOGY DAILY DATABASE ENRICHMENT**.md" }
Read { "file_path": "ASTROLOGICAL SOURCE BLOCK.md" }
Read { "file_path": "Database Entry for July 26, 2025.md" }

**// 3. Create microtasks for the knowledge ingestion pipeline.**
mcp**claude-flow**task_create { "name": "Design Knowledge Pool Schema", "parent": "main" }
mcp**claude-flow**task_create { "name": "Develop Ingestion Script", "parent": "main", "dependencies": ["[ID_FOR_Design_Knowledge_Pool_Schema]"] }
mcp**claude-flow**task_create { "name": "Execute Seeding and Validate", "parent": "main", "dependencies": ["[ID_FOR_Develop_Ingestion_Script]"] }

**// 4. Assign tasks and provide instructions.**
mcp**claude-flow**agent_assign { "taskId": "[ID_FOR_Design_Knowledge_Pool_Schema]", "agentId": "SystemDesigner" }
mcp**claude-flow**agent_communicate { "to": "SystemDesigner", "message": "Based on the structure of the provided knowledge files, design a new Supabase migration script. Create tables like `tarot_interpretations` (with columns for card, position, context, meaning, keywords) and `astrological_insights` (with columns for transit, aspect, interpretation). Ensure the schema is optimized for querying." }

mcp**claude-flow**agent_assign { "taskId": "[ID_FOR_Develop_Ingestion_Script]", "agentId": "ContentIngestor" }
mcp**claude-flow**agent_communicate { "to": "ContentIngestor", "message": "Create a new script, `scripts/ingest-knowledge-pool.ts`. This script must parse the `tarot-images.json` file and the markdown enrichment documents, transform the data to match the new schema, and insert it into the Supabase tables." }

mcp**claude-flow**agent_assign { "taskId": "[ID_FOR_Execute_Seeding_and_Validate]", "agentId": "QAValidator" }
mcp**claude-flow**agent_communicate { "to": "QAValidator", "message": "Execute the Supabase migration and then run the `ingest-knowledge-pool.ts` script. After execution, write and run a temporary validation script that queries the new tables to confirm that the data has been successfully and accurately populated. Provide a summary of the ingested data (e.g., 'Ingested 78 base tarot interpretations')." }

## DELIVERABLES

1. A new Supabase migration script in the `/supabase/migrations` directory.
2. A new, functional script: `/scripts/ingest-knowledge-pool.ts`.
3. Logs from the `QAValidator` confirming that the new tables have been created and populated successfully in Supabase.
4. An updated `claude.md` file logging the completion of this phase.
