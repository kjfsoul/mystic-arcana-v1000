#!/usr/bin/env npx tsx

/**
 * MCP Server Connectivity Testing Script
 * Tests all configured MCP servers and updates registry status
 */

import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

interface MCPServer {
  url: string;
  status: "online" | "offline" | "unknown" | "error";
  capabilities: string[];
  last_check: string | null;
  response_time?: number;
  error_message?: string;
}

interface AgentRegistry {
  registry_version: string;
  last_updated: string;
  agents: Record<string, any>;
  mcp_servers: Record<string, MCPServer>;
  system_health: {
    overall_status: string;
    active_agents: number;
    dormant_agents: number;
    failed_agents: number;
    mcp_connectivity: string;
  };
}

async function testMCPConnectivity(
  serverName: string,
  serverConfig: MCPServer,
): Promise<MCPServer> {
  const startTime = Date.now();
  const timestamp = new Date().toISOString();

  console.log(`[MCP] Testing ${serverName} at ${serverConfig.url}...`);

  try {
    // Attempt to connect to MCP server
    // Note: These are placeholder URLs - actual MCP servers would need real endpoints
    const response = await fetch(`http://${serverConfig.url}/health`, {
      method: "GET",
    });

    const responseTime = Date.now() - startTime;

    if (response.ok) {
      console.log(`[MCP] ✅ ${serverName} online (${responseTime}ms)`);
      return {
        ...serverConfig,
        status: "online" as const,
        last_check: timestamp,
        response_time: responseTime,
      };
    } else {
      console.log(`[MCP] ❌ ${serverName} returned ${response.status}`);
      return {
        ...serverConfig,
        status: "error" as const,
        last_check: timestamp,
        response_time: responseTime,
        error_message: `HTTP ${response.status}: ${response.statusText}`,
      };
    }
  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.log(
      `[MCP] ❌ ${serverName} connection failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    );

    return {
      ...serverConfig,
      status: "offline" as const,
      last_check: timestamp,
      response_time: responseTime,
      error_message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

async function main() {
  const registryPath = join(process.cwd(), "agents", "registry.json");

  try {
    console.log("[MCP] Starting connectivity tests...");

    // Load current registry
    const registryData = readFileSync(registryPath, "utf-8");
    const registry: AgentRegistry = JSON.parse(registryData);

    // Test each MCP server
    const mcpResults: Record<string, MCPServer> = {};
    let onlineCount = 0;
    let offlineCount = 0;
    let errorCount = 0;

    for (const [serverName, serverConfig] of Object.entries(
      registry.mcp_servers,
    )) {
      const result = await testMCPConnectivity(serverName, serverConfig);
      mcpResults[serverName] = result;

      switch (result.status) {
        case "online":
          onlineCount++;
          break;
        case "offline":
          offlineCount++;
          break;
        case "error":
          errorCount++;
          break;
      }
    }

    // Update registry with results
    const updatedRegistry: AgentRegistry = {
      ...registry,
      last_updated: new Date().toISOString(),
      mcp_servers: mcpResults,
      system_health: {
        ...registry.system_health,
        mcp_connectivity: `${onlineCount}/${Object.keys(registry.mcp_servers).length} online`,
      },
    };

    // Write updated registry
    writeFileSync(registryPath, JSON.stringify(updatedRegistry, null, 2));

    // Generate summary report
    console.log("\n[MCP] Connectivity Test Summary:");
    console.log(`✅ Online: ${onlineCount}`);
    console.log(`❌ Offline: ${offlineCount}`);
    console.log(`⚠️  Errors: ${errorCount}`);
    console.log(
      `📊 Overall: ${onlineCount}/${Object.keys(registry.mcp_servers).length} servers operational`,
    );

    // Log to activity log
    const logEntry = `${new Date().toISOString()} [MCP] Connectivity test complete: ${onlineCount}/${Object.keys(registry.mcp_servers).length} servers online`;
    const activityLogPath = join(
      process.cwd(),
      "logs",
      "agent-activity",
      `${new Date().toISOString().split("T")[0]}.log`,
    );

    try {
      const fs = require("fs");
      fs.appendFileSync(activityLogPath, logEntry + "\n");
    } catch (logError) {
      console.warn(
        "[MCP] Warning: Could not write to activity log:",
        logError instanceof Error ? logError.message : "Unknown error",
      );
    }

    // If all servers offline, suggest alternatives
    if (onlineCount === 0) {
      console.log("\n[MCP] ⚠️  All MCP servers offline. Consider:");
      console.log("1. Check network connectivity");
      console.log("2. Verify server URLs and ports");
      console.log(
        "3. Explore open-source alternatives at glama.ai/settings/mcp/servers",
      );
      console.log("4. Implement fallback strategies for offline operations");
    }

    process.exit(0);
  } catch (error) {
    console.error(
      "[MCP] ❌ Connectivity test failed:",
      error instanceof Error ? error.message : "Unknown error",
    );

    // Log error
    const errorLogPath = join(process.cwd(), "logs", "errors", "latest.log");
    const errorEntry = `${new Date().toISOString()} [MCP_TEST] ${error instanceof Error ? error.message : "Unknown error"}\n`;

    try {
      const fs = require("fs");
      fs.appendFileSync(errorLogPath, errorEntry);
    } catch (logError) {
      console.warn(
        "[MCP] Warning: Could not write to error log:",
        logError instanceof Error ? logError.message : "Unknown error",
      );
    }

    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
