#!/usr/bin/env node

/**
 * MCP Filesystem Server
 * Provides file system operations via Model Context Protocol
 */

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const fs = require('fs').promises;
const path = require('path');

class FilesystemServer {
  constructor() {
    this.server = new Server(
      {
        name: 'filesystem-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
  }

  setupToolHandlers() {
    // List available tools
    this.server.setRequestHandler('tools/list', async () => {
      return {
        tools: [
          {
            name: 'read_file',
            description: 'Read the contents of a file',
            inputSchema: {
              type: 'object',
              properties: {
                path: {
                  type: 'string',
                  description: 'Path to the file to read'
                }
              },
              required: ['path']
            }
          },
          {
            name: 'write_file',
            description: 'Write content to a file',
            inputSchema: {
              type: 'object',
              properties: {
                path: {
                  type: 'string',
                  description: 'Path to the file to write'
                },
                content: {
                  type: 'string',
                  description: 'Content to write to the file'
                }
              },
              required: ['path', 'content']
            }
          },
          {
            name: 'list_directory',
            description: 'List the contents of a directory',
            inputSchema: {
              type: 'object',
              properties: {
                path: {
                  type: 'string',
                  description: 'Path to the directory to list'
                }
              },
              required: ['path']
            }
          },
          {
            name: 'create_directory',
            description: 'Create a new directory',
            inputSchema: {
              type: 'object',
              properties: {
                path: {
                  type: 'string',
                  description: 'Path to the directory to create'
                }
              },
              required: ['path']
            }
          },
          {
            name: 'file_exists',
            description: 'Check if a file or directory exists',
            inputSchema: {
              type: 'object',
              properties: {
                path: {
                  type: 'string',
                  description: 'Path to check'
                }
              },
              required: ['path']
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
          case 'read_file':
            return await this.readFile(args.path);
          case 'write_file':
            return await this.writeFile(args.path, args.content);
          case 'list_directory':
            return await this.listDirectory(args.path);
          case 'create_directory':
            return await this.createDirectory(args.path);
          case 'file_exists':
            return await this.fileExists(args.path);
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        throw new Error(`Tool execution failed: ${error.message}`);
      }
    });
  }

  async readFile(filePath) {
    const content = await fs.readFile(filePath, 'utf8');
    return {
      content: [
        {
          type: 'text',
          text: content
        }
      ]
    };
  }

  async writeFile(filePath, content) {
    await fs.writeFile(filePath, content, 'utf8');
    return {
      content: [
        {
          type: 'text',
          text: `Successfully wrote to ${filePath}`
        }
      ]
    };
  }

  async listDirectory(dirPath) {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    const items = entries.map(entry => ({
      name: entry.name,
      type: entry.isDirectory() ? 'directory' : 'file',
      path: path.join(dirPath, entry.name)
    }));

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(items, null, 2)
        }
      ]
    };
  }

  async createDirectory(dirPath) {
    await fs.mkdir(dirPath, { recursive: true });
    return {
      content: [
        {
          type: 'text',
          text: `Successfully created directory ${dirPath}`
        }
      ]
    };
  }

  async fileExists(filePath) {
    try {
      await fs.access(filePath);
      return {
        content: [
          {
            type: 'text',
            text: `true`
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `false`
          }
        ]
      };
    }
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('MCP Filesystem Server running on stdio');
  }
}

// Run the server
if (require.main === module) {
  const server = new FilesystemServer();
  server.run().catch(console.error);
}

module.exports = FilesystemServer;
