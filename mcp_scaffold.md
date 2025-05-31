#  # Mystic Arcana — MCP Server Suite Spec & Coding Scaffold

## 1. MCP (Model Context Protocol) Server Overview

* **Purpose:** Modular, pluggable agentic server endpoints implementing Anthropic-style MCP to expose tools, data, and workflows to AI agents and the frontend (via AGUI/CopilotKit).
* **Each MCP server covers a specialized domain/tool** as listed in Mystic NotebookLM doc (tarot engine, astrology engine, birth chart, Q\&A, rituals, journal analysis, user memory, feedback, personalization, third-party APIs, etc.).
* **All MCPs are event-driven and compatible with AGUI.**

## 2. Directory/File Structure

```
/backend/agents/mcp/
  tarotMCPServer.ts
  astrologyMCPServer.ts
  birthChartMCPServer.ts
  qaMCPServer.ts
  ritualsMCPServer.ts
  journalMCPServer.ts
  userMemoryMCPServer.ts
  feedbackMCPServer.ts
  personalizationMCPServer.ts
  thirdPartyAPIMCPServer.ts
  ... (add more as identified in NotebookLM doc)
```

* **Each file is a standalone MCP server module.**
* **Unified plugin registry** (optional): `/backend/agents/mcp/pluginRegistry.ts`
* **Master MCP router** (optional): `/backend/agents/mcp/masterMCPRouter.ts` — routes requests to the correct MCP.

## 3. MCP Server Coding Pattern (for Claude, Gemini, or dev agent):

* **Each server should:**

  * Export an AGUI/MCP-compatible API endpoint (e.g., `/api/mcp/tarot`)
  * Register tools (functions) for its domain (e.g., drawCards, getSpread, interpretCard, etc.)
  * Accept agent/user events and tool calls as per MCP spec
  * Emit responses, tool results, and status events (AGUI standard)
  * Be fully annotated with types/interfaces (TypeScript)
  * Include plugin registration for master router (optional)
  * Connect to any DB/API required (Supabase, NASA, ephemeris, etc.)
  * Document each tool/plugin at top of file

## 4. MCP Server Prompt Template (for Claude/Gemini)

<context>
You are building a modular MCP (Model Context Protocol) server for Mystic Arcana. This server will handle [DOMAIN] tools as per the NotebookLM doc. All endpoints are AGUI-compatible and connect to the agentic frontend.
</context>

<instructions>
- Export endpoint `/api/mcp/[domain]`
- Register tools: [list tools/functions from NotebookLM doc or business plan]
- Accept AGUI/MCP tool calls and emit results, errors, and intermediate events
- Annotate all interfaces and tool signatures
- Connect to Supabase/3rd-party APIs as needed
- Document tool registry at top of file
</instructions>

\<output\_format>
/backend/agents/mcp/\[domain]MCPServer.ts

* Tool registry and plugin interface
* Main handler (event logic, tool calls, result emission)
* TypeScript interfaces/types for all tool inputs/outputs
* Example events (tool call, result, error)
* Export for master MCP router (if used)
  \</output\_format>

---

## 5. **How to Use This in Cursor/Claude**

* For each MCP server needed, copy the prompt template, fill in \[DOMAIN] and \[tools], and submit to Claude/Gemini.
* Attach NotebookLM doc and relevant reference files.
* Claude/Gemini will generate fully annotated TS files for each MCP server, ready to be plugged into your agentic backend.
* Update master router/plugin registry as new MCPs are created.

---

## 6. Next Steps

1. List all MCP server domains/tools from Mystic NotebookLM doc (Tarot, Astrology, QA, Rituals, etc.)
2. For each, generate a separate MCP server file with the above pattern
3. Assemble/review in `/backend/agents/mcp/`
4. Test AGUI/agent integration and event streaming

---

*This spec is now saved as your source of truth for MCP server coding and agentic modularization. Update for each server, tool, or plugin as project evolves!*


