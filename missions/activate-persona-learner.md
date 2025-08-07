# MISSION: Intelligence Engine - Phase 2: Persona Activation & Memory Integration

## OBJECTIVE

Activate the `PersonaLearner` agent and the primary virtual reader, `Sophia`. This mission will connect the Tarot Reading Room UI to the new Supabase Knowledge Pool via the `Sophia` agent and implement the `a-mem` logging functionality through the `PersonaLearner` agent to achieve stateful, personalized readings.

## CONTEXT

The Knowledge Pool is populated with 390+ tarot interpretations, and the Tarot Reading Room UI is feature-complete. This mission bridges these two systems to create our core user experience.

**CRITICAL PROTOCOL:** The SwarmLead must first consult a `StrategicGuardian` agent to verify this mission aligns with the master plan in `IMPLEMENTATION_MICROTASKS.md`. The mission will only proceed upon its approval.

## EXECUTION PLAN (BATCH COMMANDS)

**// 1. Spawn and configure the necessary agents.**
mcp**claude-flow**agent_spawn { "type": "validator", "name": "StrategicGuardian" }
mcp**claude-flow**agent_spawn { "type": "coder", "name": "PersonaImplementer" }
mcp**claude-flow**agent_spawn { "type": "tester", "name": "QAValidator" }
mcp**claude-flow**memory_store { "key": "mission/objective", "value": "Activate PersonaLearner & Sophia" }

**// 2. Read all relevant context files in a single batch.**
Read { "file_path": "IMPLEMENTATION_MICROTASKS.md" }
Read { "file_path": "adaptive_personalization.md" }
Read { "file_path": "src/agents/PersonaLearner.ts" }
Read { "file_path": "src/agents/sophia.ts" } // Assuming stub from previous agent activation
Read { "file_path": "src/lib/memory/a-mem/memory_system.py" }
Read { "file_path": "src/components/tarot/InteractiveReadingSurface.tsx" }

**// 3. Create microtasks for the mission after strategic approval.**
mcp**claude-flow**task_create { "name": "Strategic Alignment Check", "parent": "main" }
mcp**claude-flow**task_create { "name": "Enhance Sophia Agent with Knowledge Pool", "parent": "main", "dependencies": ["Strategic Alignment Check"] }
mcp**claude-flow**task_create { "name": "Enhance PersonaLearner with a-mem Hook", "parent": "main", "dependencies": ["Strategic Alignment Check"] }
mcp**claude-flow**task_create { "name": "Integrate Agents into Reading UI", "parent": "main", "dependencies": ["Enhance Sophia Agent with Knowledge Pool", "Enhance PersonaLearner with a-mem Hook"] }
mcp**claude-flow**task_create { "name": "Create End-to-End Validation Test", "parent": "main", "dependencies": ["Integrate Agents into Reading UI"] }

**// 4. Assign tasks and provide instructions.**
mcp**claude-flow**agent_communicate { "to": "PersonaImplementer", "message": "First, update the `sophia.ts` agent. Its `getReading` method must now query the new `tarot_interpretations` table in Supabase using the provided card and spread position to fetch real interpretations from the Knowledge Pool. The method should then synthesize these interpretations into a soulful, narrative response. Second, update the `PersonaLearner.ts` agent. Its `logInteraction` method must take the user ID and the final reading from Sophia and create a new, structured `MemoryNote` in the `a-mem` system via its Python script. Third, modify `InteractiveReadingSurface.tsx` to call the `sophia.getReading` method to display the interpretation, and upon completion, call `PersonaLearner.logInteraction`." }

mcp**claude-flow**agent_communicate { "to": "QAValidator", "message": "Create a new test script `scripts/test-persona-learning-loop.ts`. This test must simulate a user completing a reading, verify that the interpretation text received on the frontend contains keywords present in the Supabase Knowledge Pool (proving it's not mock data), and then check the `a-mem` log file to confirm that a new memory note for that specific reading was successfully created and persisted." }

## DELIVERABLES

1. Updated `sophia.ts` file that queries the Supabase Knowledge Pool.
2. Updated `PersonaLearner.ts` file that successfully writes to the `a-mem` system.
3. Updated `InteractiveReadingSurface.tsx` that integrates both agents.
4. A new, passing test script `scripts/test-persona-learning-loop.ts`.
5. An updated `claude.md` file logging the completion of the Intelligence Engine's Phase 2.
