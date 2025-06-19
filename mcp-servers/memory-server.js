#!/usr/bin/env node

/**
 * MCP Memory Server
 * Provides persistent memory storage via Model Context Protocol
 */

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const fs = require('fs').promises;
const path = require('path');

class MemoryServer {
  constructor() {
    this.server = new Server(
      {
        name: 'memory-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.memoryFile = path.join(process.cwd(), 'mcp-memory.json');
    this.memory = new Map();
    this.setupToolHandlers();
    this.loadMemory();
  }

  async loadMemory() {
    try {
      const data = await fs.readFile(this.memoryFile, 'utf8');
      const memoryData = JSON.parse(data);
      this.memory = new Map(Object.entries(memoryData));
      console.error(`Loaded ${this.memory.size} memories from ${this.memoryFile}`);
    } catch (error) {
      console.error('No existing memory file found, starting fresh');
    }
  }

  async saveMemory() {
    try {
      const memoryData = Object.fromEntries(this.memory);
      await fs.writeFile(this.memoryFile, JSON.stringify(memoryData, null, 2));
    } catch (error) {
      console.error('Failed to save memory:', error.message);
    }
  }

  setupToolHandlers() {
    // List available tools
    this.server.setRequestHandler('tools/list', async () => {
      return {
        tools: [
          {
            name: 'store_memory',
            description: 'Store a memory with a key-value pair',
            inputSchema: {
              type: 'object',
              properties: {
                key: {
                  type: 'string',
                  description: 'The key to store the memory under'
                },
                value: {
                  type: 'string',
                  description: 'The value to store'
                },
                metadata: {
                  type: 'object',
                  description: 'Optional metadata for the memory'
                }
              },
              required: ['key', 'value']
            }
          },
          {
            name: 'retrieve_memory',
            description: 'Retrieve a memory by key',
            inputSchema: {
              type: 'object',
              properties: {
                key: {
                  type: 'string',
                  description: 'The key to retrieve the memory for'
                }
              },
              required: ['key']
            }
          },
          {
            name: 'list_memories',
            description: 'List all stored memories',
            inputSchema: {
              type: 'object',
              properties: {
                pattern: {
                  type: 'string',
                  description: 'Optional pattern to filter keys'
                }
              }
            }
          },
          {
            name: 'delete_memory',
            description: 'Delete a memory by key',
            inputSchema: {
              type: 'object',
              properties: {
                key: {
                  type: 'string',
                  description: 'The key to delete'
                }
              },
              required: ['key']
            }
          },
          {
            name: 'search_memories',
            description: 'Search memories by content',
            inputSchema: {
              type: 'object',
              properties: {
                query: {
                  type: 'string',
                  description: 'Search query to match against memory values'
                }
              },
              required: ['query']
            }
          }
        ]
      };
    });

    // Handle tool calls
    this.server.setRequestHandler('tools/call', async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'store_memory':
            return await this.storeMemory(args.key, args.value, args.metadata);
          case 'retrieve_memory':
            return await this.retrieveMemory(args.key);
          case 'list_memories':
            return await this.listMemories(args.pattern);
          case 'delete_memory':
            return await this.deleteMemory(args.key);
          case 'search_memories':
            return await this.searchMemories(args.query);
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        throw new Error(`Memory operation failed: ${error.message}`);
      }
    });
  }

  async storeMemory(key, value, metadata = {}) {
    const memoryEntry = {
      value,
      metadata,
      timestamp: new Date().toISOString()
    };
    
    this.memory.set(key, memoryEntry);
    await this.saveMemory();
    
    return {
      content: [
        {
          type: 'text',
          text: `Memory stored successfully with key: ${key}`
        }
      ]
    };
  }

  async retrieveMemory(key) {
    const memory = this.memory.get(key);
    
    if (!memory) {
      return {
        content: [
          {
            type: 'text',
            text: `No memory found for key: ${key}`
          }
        ]
      };
    }
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(memory, null, 2)
        }
      ]
    };
  }

  async listMemories(pattern = null) {
    let keys = Array.from(this.memory.keys());
    
    if (pattern) {
      const regex = new RegExp(pattern, 'i');
      keys = keys.filter(key => regex.test(key));
    }
    
    const memories = keys.map(key => ({
      key,
      timestamp: this.memory.get(key).timestamp,
      hasMetadata: Object.keys(this.memory.get(key).metadata || {}).length > 0
    }));
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(memories, null, 2)
        }
      ]
    };
  }

  async deleteMemory(key) {
    const existed = this.memory.has(key);
    this.memory.delete(key);
    await this.saveMemory();
    
    return {
      content: [
        {
          type: 'text',
          text: existed ? `Memory deleted: ${key}` : `No memory found for key: ${key}`
        }
      ]
    };
  }

  async searchMemories(query) {
    const regex = new RegExp(query, 'i');
    const matches = [];
    
    for (const [key, memory] of this.memory.entries()) {
      if (regex.test(memory.value) || regex.test(key)) {
        matches.push({
          key,
          value: memory.value,
          timestamp: memory.timestamp
        });
      }
    }
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(matches, null, 2)
        }
      ]
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('MCP Memory Server running on stdio');
  }
}

// Run the server
if (require.main === module) {
  const server = new MemoryServer();
  server.run().catch(console.error);
}

module.exports = MemoryServer;
