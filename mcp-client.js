#!/usr/bin/env node

/**
 * Simple MCP Client
 * Easy command-line interface for the working MCP server
 */

const https = require('http');

class MCPClient {
  constructor(baseUrl = 'http://localhost:3000') {
    this.baseUrl = baseUrl;
  }

  async request(endpoint, data = {}) {
    return new Promise((resolve, reject) => {
      const postData = JSON.stringify(data);
      const url = new URL(endpoint, this.baseUrl);
      
      const options = {
        hostname: url.hostname,
        port: url.port,
        path: url.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      const req = https.request(options, (res) => {
        let responseData = '';
        res.on('data', (chunk) => {
          responseData += chunk;
        });
        res.on('end', () => {
          try {
            const result = JSON.parse(responseData);
            resolve(result);
          } catch (error) {
            reject(new Error(`Invalid JSON response: ${responseData}`));
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.write(postData);
      req.end();
    });
  }

  async get(endpoint) {
    return new Promise((resolve, reject) => {
      const url = new URL(endpoint, this.baseUrl);
      
      const options = {
        hostname: url.hostname,
        port: url.port,
        path: url.pathname,
        method: 'GET'
      };

      const req = https.request(options, (res) => {
        let responseData = '';
        res.on('data', (chunk) => {
          responseData += chunk;
        });
        res.on('end', () => {
          try {
            const result = JSON.parse(responseData);
            resolve(result);
          } catch (error) {
            reject(new Error(`Invalid JSON response: ${responseData}`));
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.end();
    });
  }

  // Filesystem operations
  async readFile(filePath) {
    return this.request('/filesystem/read', { path: filePath });
  }

  async writeFile(filePath, content) {
    return this.request('/filesystem/write', { path: filePath, content });
  }

  async listDirectory(dirPath = '.') {
    return this.request('/filesystem/list', { path: dirPath });
  }

  // Git operations
  async gitStatus() {
    return this.request('/git/status');
  }

  async gitLog(maxCount = 10) {
    return this.request('/git/log', { maxCount });
  }

  async gitDiff(file = null, staged = false) {
    return this.request('/git/diff', { file, staged });
  }

  // Memory operations
  async storeMemory(key, value, metadata = {}) {
    return this.request('/memory/store', { key, value, metadata });
  }

  async retrieveMemory(key) {
    return this.request('/memory/retrieve', { key });
  }

  async listMemories() {
    return this.request('/memory/list');
  }

  async deleteMemory(key) {
    return this.request('/memory/delete', { key });
  }

  // Health check
  async health() {
    return this.get('/health');
  }

  async info() {
    return this.get('/');
  }
}

// CLI interface
async function main() {
  const client = new MCPClient();
  const args = process.argv.slice(2);
  const command = args[0];

  try {
    switch (command) {
      case 'health':
        const health = await client.health();
        console.log('🏥 Health Check:', JSON.stringify(health, null, 2));
        break;

      case 'info':
        const info = await client.info();
        console.log('📋 Server Info:', JSON.stringify(info, null, 2));
        break;

      case 'read':
        const filePath = args[1];
        if (!filePath) {
          console.error('Usage: node mcp-client.js read <file-path>');
          process.exit(1);
        }
        const fileResult = await client.readFile(filePath);
        if (fileResult.success) {
          console.log('📄 File Content:');
          console.log(fileResult.content);
        } else {
          console.error('❌ Error:', fileResult.error);
        }
        break;

      case 'list':
        const dirPath = args[1] || '.';
        const listResult = await client.listDirectory(dirPath);
        if (listResult.success) {
          console.log(`📁 Directory Contents (${dirPath}):`);
          listResult.items.forEach(item => {
            const icon = item.type === 'directory' ? '📁' : '📄';
            console.log(`  ${icon} ${item.name}`);
          });
        } else {
          console.error('❌ Error:', listResult.error);
        }
        break;

      case 'git-status':
        const statusResult = await client.gitStatus();
        if (statusResult.success) {
          console.log('🔀 Git Status:');
          console.log(statusResult.longStatus);
        } else {
          console.error('❌ Error:', statusResult.error);
        }
        break;

      case 'git-log':
        const maxCount = parseInt(args[1]) || 10;
        const logResult = await client.gitLog(maxCount);
        if (logResult.success) {
          console.log(`📜 Git Log (last ${maxCount} commits):`);
          console.log(logResult.log);
        } else {
          console.error('❌ Error:', logResult.error);
        }
        break;

      case 'store':
        const key = args[1];
        const value = args[2];
        if (!key || !value) {
          console.error('Usage: node mcp-client.js store <key> <value>');
          process.exit(1);
        }
        const storeResult = await client.storeMemory(key, value);
        if (storeResult.success) {
          console.log('💾 Memory Stored:', storeResult.message);
        } else {
          console.error('❌ Error:', storeResult.error);
        }
        break;

      case 'retrieve':
        const retrieveKey = args[1];
        if (!retrieveKey) {
          console.error('Usage: node mcp-client.js retrieve <key>');
          process.exit(1);
        }
        const retrieveResult = await client.retrieveMemory(retrieveKey);
        if (retrieveResult.success) {
          console.log('🧠 Memory Retrieved:');
          console.log(JSON.stringify(retrieveResult.memory, null, 2));
        } else {
          console.log('❌ Memory not found');
        }
        break;

      case 'memories':
        const memoriesResult = await client.listMemories();
        if (memoriesResult.success) {
          console.log('🧠 Stored Memories:');
          memoriesResult.memories.forEach(memory => {
            console.log(`  📝 ${memory.key} (${memory.timestamp})`);
          });
        } else {
          console.error('❌ Error:', memoriesResult.error);
        }
        break;

      default:
        console.log('🚀 Simple MCP Client');
        console.log('Usage: node mcp-client.js <command> [args...]');
        console.log('');
        console.log('Commands:');
        console.log('  health                    - Check server health');
        console.log('  info                      - Show server info');
        console.log('  read <file>               - Read file content');
        console.log('  list [directory]          - List directory contents');
        console.log('  git-status                - Show git status');
        console.log('  git-log [count]           - Show git log');
        console.log('  store <key> <value>       - Store memory');
        console.log('  retrieve <key>            - Retrieve memory');
        console.log('  memories                  - List all memories');
        console.log('');
        console.log('Examples:');
        console.log('  node mcp-client.js health');
        console.log('  node mcp-client.js read package.json');
        console.log('  node mcp-client.js list src');
        console.log('  node mcp-client.js git-status');
        console.log('  node mcp-client.js store project-status "Working on MCP servers"');
        break;
    }
  } catch (error) {
    console.error('❌ Connection Error:', error.message);
    console.log('💡 Make sure the MCP server is running: node simple-mcp-server.js');
  }
}

if (require.main === module) {
  main();
}

module.exports = MCPClient;
