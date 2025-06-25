#!/usr/bin/env node
const { spawn } = require("child_process");
const fs = require("fs");

// Load MCP config
const mcpConfig = JSON.parse(fs.readFileSync(".roo/mcp-settings.json", "utf8"));
const servers = mcpConfig.mcpServers || {};

// Utility to start and keep references to all servers
const processes = {};
Object.entries(servers).forEach(([name, config]) => {
  const proc = spawn(config.command, config.args, {
    env: { ...process.env, ...(config.env || {}) },
  });
  processes[name] = proc;
  proc.stdout.on("data", (data) => {
    console.log(`[${name}] ${data}`.trim());
  });
  proc.stderr.on("data", (data) => {
    console.error(`[${name} ERROR] ${data}`.trim());
  });
  proc.on("exit", (code) => {
    console.log(`[${name}] exited with code ${code}`);
  });
});

// Main orchestrator loop
console.log(
  "Agent orchestrator running. Listening for commands (type 'help' for options):"
);
process.stdin.setEncoding("utf-8");
process.stdin.on("data", async (data) => {
  const input = data.trim();
  if (input === "help") {
    console.log("Available commands:");
    console.log("- tarot: Draw a tarot spread");
    console.log("- astro: Calculate an astrology chart");
    console.log("- log: Log an event");
    console.log("- exit: Quit orchestrator");
    return;
  }
  if (input === "tarot") {
    // Example: trigger tarot MCP server (replace with full JSON-RPC if needed)
    // For real MCP JSON-RPC: send the correct payload via stdin/stdout
    console.log("Would call tarot-engine-mystic here...");
    // (You'd send a JSON-RPC request to the tarot MCP process here)
    return;
  }
  if (input === "astro") {
    console.log("Would call astrology-engine-mystic here...");
    // (Same as above for astrology)
    return;
  }
  if (input === "exit") {
    Object.values(processes).forEach((proc) => proc.kill());
    process.exit(0);
  }
  console.log("Unknown command:", input);
});
