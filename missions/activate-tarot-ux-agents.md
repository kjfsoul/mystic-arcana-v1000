# MISSION: Agent Activation Initiative - Phase 1: Polished Tarot Reading Room

## OBJECTIVE

Kickstart the Agent Activation Initiative by implementing the core functionality for the `UIEnchanter` and `CardWeaver` agents. The primary goal is to build the "Polished Reading Room" experience as defined in `TAROT_UI_DEMO_READINESS.md`, replacing the current placeholder UI.

## CONTEXT

The project audit (`STATE_OF_THE_ARCANA.md`) has confirmed that the backend Tarot Engine and APIs are 90% complete and production-ready. This mission leverages that stable backend to build the sophisticated, user-facing reading experience. This is the first step in activating the 24 idle development agents.

## EXECUTION PLAN (BATCH COMMANDS)

**// 1. Activate and configure the Tarot UX agents.**
mcp**claude-flow**agent_spawn { "type": "coder", "name": "UIEnchanter", "specialty": "Frontend/Framer-Motion" }
mcp**claude-flow**agent_spawn { "type": "coder", "name": "CardWeaver", "specialty": "Frontend/Logic" }
mcp**claude-flow**memory_store { "key": "mission/objective", "value": "Build Polished Tarot Reading Room" }

**// 2. Read all relevant context files for the Tarot Reading UX in a single batch.**
Read { "file_path": "docs/research/TAROT_UI_DEMO_READINESS.md" }
Read { "file_path": "src/components/tarot/EnhancedTarotPanel.tsx" }
Read { "file_path": "src/components/tarot/EnhancedTarotSpreadLayouts.tsx" }
Read { "file_path": "src/lib/tarot/RiderWaiteDeck.ts" }
Read { "file_path": "src/app/api/tarot/draw/route.ts" }

**// 3. Create a hierarchy of microtasks for the new UI.**
mcp**claude-flow**task_create { "name": "Implement Card Selection & Spread UI", "parent": "main" }
mcp**claude-flow**task_create { "name": "Develop Interactive Reading Surface", "parent": "main" }
mcp**claude-flow**task_create { "name": "Build Dynamic Interpretation Panel", "parent": "main" }
mcp**claude-flow**task_create { "name": "Create E2E Validation Test", "parent": "main" }

**// 4. Assign tasks and provide instructions.**
mcp**claude-flow**agent*assign { "taskId": "[ID_FOR_Implement_Card_Selection*&\_Spread_UI]", "agentId": "UIEnchanter" }
mcp**claude-flow**agent_communicate { "to": "UIEnchanter", "message": "Based on `TAROT_UI_DEMO_READINESS.md`, build the React components for the spread selection menu (Celtic Cross, Three Card, etc.) and the initial card layout view. Use Framer Motion for fluid animations." }

mcp**claude-flow**agent_assign { "taskId": "[ID_FOR_Develop_Interactive_Reading_Surface]", "agentId": "CardWeaver" }
mcp**claude-flow**agent_communicate { "to": "CardWeaver", "message": "Implement the logic for the reading surface. Wire the UI components built by `UIEnchanter` to the `/api/tarot/draw` endpoint. Ensure that when a user selects a spread and draws, the correct cards are fetched and displayed. Manage the state of the reading (cards drawn, positions, etc.)." }

mcp**claude-flow**agent_assign { "taskId": "[ID_FOR_Create_E2E_Validation_Test]", "agentId": "QAValidator" }
mcp**claude-flow**agent_communicate { "to": "QAValidator", "message": "Create a new Playwright test file `tests/e2e/tarot-reading-flow.spec.ts`. The test must navigate to the reading page, select the 'Three Card' spread, execute a draw, and verify that three cards are displayed on the screen." }

**// 5. Update project memory.**
Write { "file*path": "claude.md", "content": "[\_DATE*] - AGENT ACTIVATION INITIATIVE PHASE 1: Began implementation of the Polished Tarot Reading Room. Activated UIEnchanter and CardWeaver agents.", "mode": "append" }

## DELIVERABLES

1. A new, functional "Reading Room" page/component that allows users to select a spread and draw cards from the API.
2. Updated agent files for `UIEnchanter` and `CardWeaver` with implemented logic.
3. A new, passing Playwright E2E test that validates the core reading flow.
