#!/usr/bin/env npx tsx

/**
 * Mystic Arcana Agent Orchestrator
 * Spawns and manages autonomous agents in background processes
 */

import { spawn, ChildProcess } from "child_process";
import { readFileSync, writeFileSync, appendFileSync } from "fs";
import { join } from "path";
import { EventEmitter } from "events";

interface Agent {
  id: string;
  name: string;
  type: string;
  brand: string;
  status: "active" | "dormant" | "failed" | "starting" | "stopping";
  entrypoint: string;
  capabilities: string[];
  memory_context: string;
  process?: ChildProcess;
  last_heartbeat?: string;
  restart_count?: number;
}

class AgentOrchestrator extends EventEmitter {
  private agents: Map<string, Agent> = new Map();
  private registryPath: string;
  private logPath: string;
  private isShuttingDown = false;
  private heartbeatInterval?: NodeJS.Timeout;

  constructor() {
    super();
    this.registryPath = join(process.cwd(), "agents", "registry.json");
    this.logPath = join(
      process.cwd(),
      "logs",
      "agent-activity",
      `${new Date().toISOString().split("T")[0]}.log`,
    );

    // Handle graceful shutdown
    process.on("SIGINT", () => this.shutdown());
    process.on("SIGTERM", () => this.shutdown());
  }

  private log(message: string) {
    const timestamp = new Date().toISOString();
    const logEntry = `${timestamp} [ORCHESTRATOR] ${message}`;
    console.log(logEntry);
    try {
      appendFileSync(this.logPath, logEntry + "\n");
    } catch (error) {
      console.warn(
        "Warning: Could not write to log file:",
        error instanceof Error ? error.message : "Unknown error",
      );
    }
  }

  private updateRegistry() {
    try {
      const registryData = readFileSync(this.registryPath, "utf-8");
      const registry = JSON.parse(registryData);

      // Update agent statuses
      for (const [agentId, agent] of this.agents) {
        if (registry.agents[agentId]) {
          registry.agents[agentId].status = agent.status;
          registry.agents[agentId].last_active =
            agent.last_heartbeat || new Date().toISOString();
        }
      }

      registry.last_updated = new Date().toISOString();
      registry.system_health.overall_status = this.getSystemStatus();

      writeFileSync(this.registryPath, JSON.stringify(registry, null, 2));
    } catch (error) {
      this.log(
        `Error updating registry: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  private getSystemStatus(): string {
    const activeCount = Array.from(this.agents.values()).filter(
      (a) => a.status === "active",
    ).length;
    const failedCount = Array.from(this.agents.values()).filter(
      (a) => a.status === "failed",
    ).length;

    if (failedCount > 0) return "degraded";
    if (activeCount === 0) return "stopped";
    return "operational";
  }

  async loadAgents() {
    try {
      const registryData = readFileSync(this.registryPath, "utf-8");
      const registry = JSON.parse(registryData);

      for (const [agentId, agentConfig] of Object.entries(registry.agents)) {
        const config = agentConfig as any;
        if (config.status === "active") {
          const agent: Agent = {
            ...config,
            restart_count: 0,
          };
          this.agents.set(agentId, agent);
        }
      }

      this.log(`Loaded ${this.agents.size} active agents from registry`);
    } catch (error) {
      this.log(
        `Error loading agents: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
      throw error;
    }
  }

  async spawnAgent(agentId: string): Promise<boolean> {
    const agent = this.agents.get(agentId);
    if (!agent) {
      this.log(`Agent ${agentId} not found`);
      return false;
    }

    try {
      agent.status = "starting";
      this.log(`Spawning agent: ${agent.name}`);

      // Create agent script dynamically based on type
      const agentScript = this.generateAgentScript(agent);
      const scriptPath = join(process.cwd(), "temp", `${agentId}-runtime.ts`);

      // Ensure temp directory exists
      const fs = require("fs");
      if (!fs.existsSync(join(process.cwd(), "temp"))) {
        fs.mkdirSync(join(process.cwd(), "temp"), { recursive: true });
      }

      writeFileSync(scriptPath, agentScript);

      // Spawn the agent process
      const agentProcess = spawn("npx", ["tsx", scriptPath], {
        detached: true,
        stdio: ["ignore", "pipe", "pipe"],
      });

      agent.process = agentProcess;
      agent.status = "active";
      agent.last_heartbeat = new Date().toISOString();
      agent.restart_count = agent.restart_count || 0;

      // Handle agent output
      agentProcess.stdout?.on("data", (data) => {
        this.log(`[${agentId}] ${data.toString().trim()}`);
      });

      agentProcess.stderr?.on("data", (data) => {
        this.log(`[${agentId}] ERROR: ${data.toString().trim()}`);
      });

      // Handle agent exit
      agentProcess.on("exit", (code) => {
        this.log(`Agent ${agentId} exited with code ${code}`);
        agent.status = code === 0 ? "dormant" : "failed";

        // Auto-restart failed agents (max 3 attempts)
        if (
          code !== 0 &&
          !this.isShuttingDown &&
          (agent.restart_count || 0) < 3
        ) {
          agent.restart_count = (agent.restart_count || 0) + 1;
          this.log(
            `Restarting agent ${agentId} (attempt ${agent.restart_count})`,
          );
          setTimeout(() => this.spawnAgent(agentId), 5000);
        }
      });

      this.log(
        `Agent ${agent.name} spawned successfully (PID: ${agentProcess.pid})`,
      );
      return true;
    } catch (error) {
      this.log(
        `Failed to spawn agent ${agentId}: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
      agent.status = "failed";
      return false;
    }
  }

  private generateAgentScript(agent: Agent): string {
    return `
/**
 * Auto-generated agent runtime for ${agent.name}
 * Agent ID: ${agent.id}
 * Type: ${agent.type}
 */

class ${agent.id.replace(/-/g, "")}Agent {
  private isRunning = false;
  private heartbeatInterval?: NodeJS.Timeout;

  constructor() {
    console.log('[AGENT] ${agent.name} initializing...');
    this.setupHeartbeat();
    this.start();
  }

  private setupHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      console.log('[HEARTBEAT] ${agent.name} alive');
    }, 30000); // 30 second heartbeat
  }

  async start() {
    this.isRunning = true;
    console.log('[AGENT] ${agent.name} started - capabilities: ${agent.capabilities.join(", ")}');
    
    // Agent-specific initialization based on type
    ${this.generateAgentTypeLogic(agent)}
    
    // Main agent loop
    while (this.isRunning) {
      try {
        await this.processTask();
        await new Promise(resolve => setTimeout(resolve, 5000)); // 5 second cycle
      } catch (error) {
        console.error('[AGENT] Error in main loop:', error instanceof Error ? error.message : 'Unknown error');
        await new Promise(resolve => setTimeout(resolve, 10000)); // 10 second retry delay
      }
    }
  }

  async processTask() {
    // Agent-specific task processing
    ${this.generateTaskProcessingLogic(agent)}
  }

  stop() {
    console.log('[AGENT] ${agent.name} stopping...');
    this.isRunning = false;
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('[AGENT] Received SIGINT, shutting down...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('[AGENT] Received SIGTERM, shutting down...');
  process.exit(0);
});

// Start the agent
new ${agent.id.replace(/-/g, "")}Agent();
`;
  }

  private generateAgentTypeLogic(agent: Agent): string {
    switch (agent.type) {
      case "tarot_astrology_reader":
        return `
    console.log('[INIT] Initializing tarot and astrology systems...');
    // TODO: Connect to tarot deck APIs
    // TODO: Initialize ephemeris calculations
    `;

      case "webgl_renderer":
        return `
    console.log('[INIT] Initializing WebGL astronomical renderer...');
    // TODO: Setup star field renderer
    // TODO: Initialize galaxy background system
    `;

      case "compliance_monitor":
        return `
    console.log('[INIT] Initializing legal compliance monitoring...');
    // TODO: Setup GDPR/CCPA compliance checks
    // TODO: Monitor spiritual disclaimer adherence
    `;

      case "data_management":
        return `
    console.log('[INIT] Initializing tarot data management...');
    // TODO: Connect to Supabase database
    // TODO: Setup deck and card data synchronization
    `;

      default:
        return `console.log('[INIT] Generic agent initialization...');`;
    }
  }

  private generateTaskProcessingLogic(agent: Agent): string {
    switch (agent.type) {
      case "tarot_astrology_reader":
        return `
    // Process pending reading requests
    console.log('[TASK] Checking for new tarot/astrology requests...');
    // TODO: Query database for pending readings
    // TODO: Generate cosmic interpretations
    `;

      case "webgl_renderer":
        return `
    // Update astronomical visualizations
    console.log('[TASK] Updating star field and galaxy rendering...');
    // TODO: Update star positions based on current time
    // TODO: Optimize rendering performance
    `;

      case "compliance_monitor":
        return `
    // Monitor compliance status
    console.log('[TASK] Monitoring legal compliance...');
    // TODO: Check for privacy policy updates needed
    // TODO: Validate spiritual content accuracy
    `;

      case "data_management":
        return `
    // Manage tarot data integrity
    console.log('[TASK] Managing tarot deck data...');
    // TODO: Sync deck changes
    // TODO: Optimize database queries
    `;

      default:
        return `console.log('[TASK] Processing generic agent tasks...');`;
    }
  }

  async startAll() {
    this.log("Starting agent orchestration...");

    const spawnPromises = Array.from(this.agents.keys()).map((agentId) =>
      this.spawnAgent(agentId),
    );

    const results = await Promise.all(spawnPromises);
    const successCount = results.filter(Boolean).length;

    this.log(`Started ${successCount}/${this.agents.size} agents successfully`);

    // Start heartbeat monitoring
    this.startHeartbeatMonitoring();
    this.updateRegistry();

    return successCount;
  }

  private startHeartbeatMonitoring() {
    this.heartbeatInterval = setInterval(() => {
      this.updateRegistry();
      this.checkAgentHealth();
    }, 60000); // Check every minute
  }

  private checkAgentHealth() {
    for (const [agentId, agent] of this.agents) {
      if (agent.process && agent.process.killed) {
        this.log(`Agent ${agentId} process died, marking as failed`);
        agent.status = "failed";
      }
    }
  }

  async shutdown() {
    if (this.isShuttingDown) return;

    this.isShuttingDown = true;
    this.log("Shutting down agent orchestrator...");

    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    // Stop all agents
    for (const [agentId, agent] of this.agents) {
      if (agent.process && !agent.process.killed) {
        this.log(`Stopping agent: ${agentId}`);
        agent.process.kill("SIGTERM");
        agent.status = "dormant";
      }
    }

    this.updateRegistry();
    this.log("Agent orchestrator shutdown complete");
    process.exit(0);
  }

  getStatus() {
    const status = {
      totalAgents: this.agents.size,
      activeAgents: Array.from(this.agents.values()).filter(
        (a) => a.status === "active",
      ).length,
      failedAgents: Array.from(this.agents.values()).filter(
        (a) => a.status === "failed",
      ).length,
      systemStatus: this.getSystemStatus(),
      agents: Array.from(this.agents.entries()).map(([id, agent]) => ({
        id,
        name: agent.name,
        status: agent.status,
        lastHeartbeat: agent.last_heartbeat,
        restartCount: agent.restart_count || 0,
      })),
    };

    return status;
  }
}

// Main execution
async function main() {
  const orchestrator = new AgentOrchestrator();

  try {
    await orchestrator.loadAgents();
    const successCount = await orchestrator.startAll();

    console.log("\\n🚀 Agent Orchestration Status:");
    console.log(JSON.stringify(orchestrator.getStatus(), null, 2));

    // Keep the orchestrator running
    console.log("\\n✅ Agent orchestrator running. Press Ctrl+C to stop.");

    // Status reporting every 5 minutes
    setInterval(() => {
      console.log("\\n📊 Agent Status Update:");
      console.log(JSON.stringify(orchestrator.getStatus(), null, 2));
    }, 300000);
  } catch (error) {
    console.error(
      "❌ Failed to start agent orchestrator:",
      error instanceof Error ? error.message : "Unknown error",
    );
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
