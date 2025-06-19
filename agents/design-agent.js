#!/usr/bin/env node

/**
 * Design Agent
 * Active agent that monitors design needs and generates components
 */

const fs = require("fs").promises;
const path = require("path");
const http = require("http");

class DesignAgent {
  constructor() {
    this.name = "Design Agent";
    this.id = "design-automation-agent";
    this.mcpServer = "http://localhost:3001";
    this.projectRoot = process.cwd();
    this.isActive = false;
    this.checkInterval = 30000; // 30 seconds
  }

  async request(endpoint, data = {}) {
    return new Promise((resolve, reject) => {
      const postData = JSON.stringify(data);
      const url = new URL(endpoint, this.mcpServer);

      const options = {
        hostname: url.hostname,
        port: url.port,
        path: url.pathname,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(postData),
        },
      };

      const req = http.request(options, (res) => {
        let responseData = "";
        res.on("data", (chunk) => {
          responseData += chunk;
        });
        res.on("end", () => {
          try {
            const result = JSON.parse(responseData);
            resolve(result);
          } catch (error) {
            reject(new Error(`Invalid JSON response: ${responseData}`));
          }
        });
      });

      req.on("error", (error) => {
        reject(error);
      });

      req.write(postData);
      req.end();
    });
  }

  async log(message, level = "INFO") {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${this.name}] [${level}] ${message}`;
    console.log(logMessage);

    // Also log to file
    try {
      const logDir = path.join(this.projectRoot, "logs");
      await fs.mkdir(logDir, { recursive: true });
      const logFile = path.join(logDir, "design-agent.log");
      await fs.appendFile(logFile, logMessage + "\n");
    } catch (error) {
      // Ignore logging errors
    }
  }

  async updateAgentStatus(status, health = "GOOD") {
    try {
      const { exec } = require("child_process");
      const { promisify } = require("util");
      const execAsync = promisify(exec);

      await execAsync(
        `node scripts/update-agent-log.js update-agent ${this.id} ${status} ${health}`
      );
    } catch (error) {
      // Ignore if update script fails
    }
  }

  async checkDesignNeeds() {
    try {
      await this.log("Checking for design needs...");

      // Analyze project structure
      const analysis = await this.request("/dev/analyze-project", {
        path: this.projectRoot,
      });

      if (analysis.success) {
        await this.log(
          `Found ${analysis.analysis.components.length} components, ${analysis.analysis.pages.length} pages`
        );

        // Check if we need common components
        const neededComponents = await this.identifyNeededComponents(
          analysis.analysis
        );

        if (neededComponents.length > 0) {
          await this.log(
            `Identified ${
              neededComponents.length
            } needed components: ${neededComponents.join(", ")}`
          );
          await this.generateNeededComponents(neededComponents);
        }
      }
    } catch (error) {
      await this.log(`Error checking design needs: ${error.message}`, "ERROR");
    }
  }

  async identifyNeededComponents(analysis) {
    const needed = [];

    // Check for common Mystic Arcana components
    const commonComponents = [
      "TarotCard",
      "CosmicButton",
      "AstrologyChart",
      "CrystalCard",
      "MysticHeader",
      "SpiritualQuote",
    ];

    for (const component of commonComponents) {
      const exists = analysis.components.some((file) =>
        file.toLowerCase().includes(component.toLowerCase())
      );

      if (!exists) {
        needed.push(component);
      }
    }

    return needed.slice(0, 2); // Limit to 2 at a time
  }

  async generateNeededComponents(components) {
    for (const componentName of components) {
      try {
        await this.log(`Generating component: ${componentName}`);

        // Get component template
        const template = await this.getComponentTemplate(componentName);

        if (template) {
          await this.createComponentFiles(componentName, template);
          await this.log(`✅ Created ${componentName} component`);
        }
      } catch (error) {
        await this.log(
          `❌ Failed to generate ${componentName}: ${error.message}`,
          "ERROR"
        );
      }
    }
  }

  async getComponentTemplate(componentName) {
    const templates = {
      TarotCard: {
        props: {
          cardName: "string",
          cardImage: "string",
          cardMeaning: "string",
        },
        type: "tarotCard",
      },
      CosmicButton: {
        props: { text: "string", onClick: "function", variant: "string" },
        type: "cosmicButton",
      },
      AstrologyChart: {
        props: {
          chartTitle: "string",
          birthDate: "string",
          zodiacSigns: "array",
        },
        type: "astrologyChart",
      },
    };

    return templates[componentName];
  }

  async createComponentFiles(componentName, template) {
    try {
      // Create component directory
      const componentDir = path.join(
        this.projectRoot,
        "src",
        "components",
        "generated",
        componentName
      );
      await fs.mkdir(componentDir, { recursive: true });

      // Generate component code
      const componentResult = await this.request("/dev/create-component", {
        name: componentName,
        type: template.type,
        props: template.props,
      });

      if (componentResult.success) {
        // Write component file
        const componentFile = path.join(componentDir, `${componentName}.tsx`);
        await fs.writeFile(componentFile, componentResult.files.component);

        // Write styles file
        const stylesFile = path.join(
          componentDir,
          `${componentName}.module.css`
        );
        await fs.writeFile(stylesFile, componentResult.files.styles);

        // Create index file for easy imports
        const indexFile = path.join(componentDir, "index.ts");
        await fs.writeFile(
          indexFile,
          `export { default } from './${componentName}';\n`
        );

        await this.log(
          `📁 Created files for ${componentName} in ${componentDir}`
        );
      }
    } catch (error) {
      throw new Error(`Failed to create component files: ${error.message}`);
    }
  }

  async monitorDesignSystem() {
    try {
      await this.log("Monitoring design system consistency...");

      // Check if design system colors are being used consistently
      const colors = await this.request("/design/colors");

      if (colors.success) {
        await this.log(
          `Design system has ${
            Object.keys(colors.colors).length
          } color categories`
        );

        // Could add more sophisticated design system monitoring here
        // For now, just log that we're monitoring
      }
    } catch (error) {
      await this.log(
        `Error monitoring design system: ${error.message}`,
        "ERROR"
      );
    }
  }

  async start() {
    await this.log("🎨 Design Agent starting...");
    this.isActive = true;
    await this.updateAgentStatus("ACTIVE", "GOOD");

    // Initial check
    await this.checkDesignNeeds();
    await this.monitorDesignSystem();

    // Set up periodic monitoring
    this.intervalId = setInterval(async () => {
      if (this.isActive) {
        await this.checkDesignNeeds();
        await this.monitorDesignSystem();
      }
    }, this.checkInterval);

    await this.log("✅ Design Agent is now active and monitoring");
  }

  async stop() {
    await this.log("🛑 Design Agent stopping...");
    this.isActive = false;

    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    await this.updateAgentStatus("INACTIVE", "GOOD");
    await this.log("✅ Design Agent stopped");
  }

  async status() {
    return {
      name: this.name,
      id: this.id,
      active: this.isActive,
      mcpServer: this.mcpServer,
      lastCheck: new Date().toISOString(),
    };
  }
}

// CLI interface
async function main() {
  const agent = new DesignAgent();
  const command = process.argv[2];

  switch (command) {
    case "start":
      await agent.start();
      // Keep running
      process.on("SIGINT", async () => {
        await agent.stop();
        process.exit(0);
      });
      break;

    case "stop":
      await agent.stop();
      break;

    case "status":
      const status = await agent.status();
      console.log(JSON.stringify(status, null, 2));
      break;

    case "check":
      await agent.checkDesignNeeds();
      break;

    default:
      console.log("🎨 Design Agent");
      console.log(
        "Usage: node agents/design-agent.js [start|stop|status|check]"
      );
      console.log("");
      console.log("Commands:");
      console.log("  start  - Start the design agent (runs continuously)");
      console.log("  stop   - Stop the design agent");
      console.log("  status - Show agent status");
      console.log("  check  - Run one-time design needs check");
      break;
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = DesignAgent;
