#!/usr/bin/env node

/**
 * MCP Server Connection Tester
 * Tests individual MCP server connections using the Model Context Protocol
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class MCPTester {
    constructor() {
        this.timeout = 10000; // 10 seconds
    }

    /**
     * Test a single MCP server connection
     */
    async testServer(serverName, command, args = [], env = {}) {
        return new Promise((resolve) => {
            console.log(`\n🔍 Testing MCP server: ${serverName}`);
            console.log(`   Command: ${command}`);
            console.log(`   Args: ${JSON.stringify(args)}`);

            // Check if command exists first
            if (!this.commandExists(command)) {
                resolve({
                    success: false,
                    error: 'Command not found',
                    details: `Command '${command}' not found in PATH`
                });
                return;
            }

            const child = spawn(command, args, {
                stdio: ['pipe', 'pipe', 'pipe'],
                env: { ...process.env, ...env }
            });

            let hasResponded = false;
            let stdoutData = '';
            let stderrData = '';

            // Set up timeout
            const timeoutId = setTimeout(() => {
                if (!hasResponded) {
                    hasResponded = true;
                    child.kill('SIGTERM');
                    resolve({
                        success: false,
                        error: 'Connection timeout',
                        details: `Server did not respond within ${this.timeout}ms`
                    });
                }
            }, this.timeout);

            // MCP Initialize request
            const initRequest = {
                jsonrpc: "2.0",
                id: 1,
                method: "initialize",
                params: {
                    protocolVersion: "2024-11-05",
                    capabilities: {
                        roots: {
                            listChanged: true
                        }
                    },
                    clientInfo: {
                        name: "mcp-validation-test",
                        version: "1.0.0"
                    }
                }
            };

            child.stdout.on('data', (data) => {
                stdoutData += data.toString();
                
                // Try to parse JSON responses
                const lines = stdoutData.split('\n');
                for (const line of lines) {
                    if (line.trim()) {
                        try {
                            const response = JSON.parse(line.trim());
                            if (response.id === 1) {
                                if (!hasResponded) {
                                    hasResponded = true;
                                    clearTimeout(timeoutId);
                                    child.kill('SIGTERM');
                                    
                                    if (response.error) {
                                        resolve({
                                            success: false,
                                            error: 'MCP protocol error',
                                            details: response.error.message || JSON.stringify(response.error)
                                        });
                                    } else {
                                        resolve({
                                            success: true,
                                            capabilities: response.result?.capabilities || {},
                                            serverInfo: response.result?.serverInfo || {}
                                        });
                                    }
                                }
                                return;
                            }
                        } catch (e) {
                            // Not valid JSON, continue collecting data
                        }
                    }
                }
            });

            child.stderr.on('data', (data) => {
                stderrData += data.toString();
            });

            child.on('error', (error) => {
                if (!hasResponded) {
                    hasResponded = true;
                    clearTimeout(timeoutId);
                    resolve({
                        success: false,
                        error: 'Process error',
                        details: error.message
                    });
                }
            });

            child.on('close', (code, signal) => {
                if (!hasResponded) {
                    hasResponded = true;
                    clearTimeout(timeoutId);
                    resolve({
                        success: false,
                        error: 'Process closed unexpectedly',
                        details: `Exit code: ${code}, Signal: ${signal}`,
                        stdout: stdoutData,
                        stderr: stderrData
                    });
                }
            });

            // Send the initialize request
            try {
                child.stdin.write(JSON.stringify(initRequest) + '\n');
            } catch (error) {
                if (!hasResponded) {
                    hasResponded = true;
                    clearTimeout(timeoutId);
                    resolve({
                        success: false,
                        error: 'Failed to send request',
                        details: error.message
                    });
                }
            }
        });
    }

    /**
     * Check if a command exists in PATH
     */
    commandExists(command) {
        const { execSync } = require('child_process');
        try {
            execSync(`which ${command}`, { stdio: 'ignore' });
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Validate environment variables
     */
    validateEnvVars(envVars) {
        const missing = [];
        const present = [];

        for (const [key, value] of Object.entries(envVars)) {
            if (value && value.startsWith('${') && value.endsWith('}')) {
                const envVarName = value.slice(2, -1);
                if (process.env[envVarName]) {
                    present.push(envVarName);
                } else {
                    missing.push(envVarName);
                }
            }
        }

        return { missing, present };
    }

    /**
     * Test all servers from MCP configuration
     */
    async testAllServers(configPath = '.mcp.json') {
        if (!fs.existsSync(configPath)) {
            console.error(`❌ Configuration file not found: ${configPath}`);
            return;
        }

        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        const servers = config.mcpServers || {};
        
        console.log(`\n🚀 Testing ${Object.keys(servers).length} MCP servers...\n`);

        const results = {
            working: [],
            broken: [],
            total: Object.keys(servers).length
        };

        for (const [serverName, serverConfig] of Object.entries(servers)) {
            const { command, args = [], env = {} } = serverConfig;

            // Validate environment variables
            const envValidation = this.validateEnvVars(env);
            if (envValidation.missing.length > 0) {
                console.log(`⚠️  Missing environment variables for ${serverName}: ${envValidation.missing.join(', ')}`);
                results.broken.push({
                    name: serverName,
                    error: 'Missing environment variables',
                    details: envValidation.missing.join(', ')
                });
                continue;
            }

            if (envValidation.present.length > 0) {
                console.log(`✅ Environment variables set for ${serverName}: ${envValidation.present.join(', ')}`);
            }

            // Test the server
            const result = await this.testServer(serverName, command, args, env);
            
            if (result.success) {
                console.log(`✅ ${serverName}: Working`);
                if (result.capabilities) {
                    console.log(`   Capabilities: ${Object.keys(result.capabilities).join(', ')}`);
                }
                if (result.serverInfo) {
                    console.log(`   Server: ${result.serverInfo.name || 'Unknown'} v${result.serverInfo.version || 'Unknown'}`);
                }
                results.working.push({
                    name: serverName,
                    capabilities: result.capabilities,
                    serverInfo: result.serverInfo
                });
            } else {
                console.log(`❌ ${serverName}: ${result.error}`);
                console.log(`   Details: ${result.details}`);
                if (result.stderr) {
                    console.log(`   Error output: ${result.stderr.substring(0, 200)}...`);
                }
                results.broken.push({
                    name: serverName,
                    error: result.error,
                    details: result.details
                });
            }
        }

        // Generate summary
        console.log(`\n📊 SUMMARY:`);
        console.log(`Total servers: ${results.total}`);
        console.log(`Working: ${results.working.length}`);
        console.log(`Broken: ${results.broken.length}`);

        // Save results
        fs.writeFileSync('mcp-test-results.json', JSON.stringify(results, null, 2));
        console.log(`\n💾 Results saved to: mcp-test-results.json`);

        // Generate working configuration
        const workingConfig = {
            mcpServers: {}
        };

        for (const server of results.working) {
            workingConfig.mcpServers[server.name] = servers[server.name];
        }

        fs.writeFileSync('mcp-working-config.json', JSON.stringify(workingConfig, null, 2));
        console.log(`📝 Working configuration saved to: mcp-working-config.json`);

        return results;
    }
}

// CLI interface
if (require.main === module) {
    const tester = new MCPTester();
    
    const args = process.argv.slice(2);
    const configPath = args[0] || '.mcp.json';
    
    tester.testAllServers(configPath)
        .then((results) => {
            process.exit(results.broken.length > 0 ? 1 : 0);
        })
        .catch((error) => {
            console.error('❌ Error running tests:', error.message);
            process.exit(1);
        });
}

module.exports = MCPTester;