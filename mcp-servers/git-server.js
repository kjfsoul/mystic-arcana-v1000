#!/usr/bin/env node

/**
 * MCP Git Server
 * Provides git operations via Model Context Protocol
 */

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

class GitServer {
  constructor() {
    this.server = new Server(
      {
        name: 'git-server',
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
            name: 'git_status',
            description: 'Get the status of the git repository',
            inputSchema: {
              type: 'object',
              properties: {
                path: {
                  type: 'string',
                  description: 'Path to the git repository (optional, defaults to current directory)'
                }
              }
            }
          },
          {
            name: 'git_log',
            description: 'Get the git commit history',
            inputSchema: {
              type: 'object',
              properties: {
                path: {
                  type: 'string',
                  description: 'Path to the git repository (optional)'
                },
                maxCount: {
                  type: 'number',
                  description: 'Maximum number of commits to show',
                  default: 10
                }
              }
            }
          },
          {
            name: 'git_diff',
            description: 'Get the git diff',
            inputSchema: {
              type: 'object',
              properties: {
                path: {
                  type: 'string',
                  description: 'Path to the git repository (optional)'
                },
                file: {
                  type: 'string',
                  description: 'Specific file to diff (optional)'
                },
                staged: {
                  type: 'boolean',
                  description: 'Show staged changes',
                  default: false
                }
              }
            }
          },
          {
            name: 'git_branch',
            description: 'List git branches',
            inputSchema: {
              type: 'object',
              properties: {
                path: {
                  type: 'string',
                  description: 'Path to the git repository (optional)'
                },
                remote: {
                  type: 'boolean',
                  description: 'Include remote branches',
                  default: false
                }
              }
            }
          },
          {
            name: 'git_add',
            description: 'Add files to git staging area',
            inputSchema: {
              type: 'object',
              properties: {
                path: {
                  type: 'string',
                  description: 'Path to the git repository (optional)'
                },
                files: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Files to add (use "." for all files)'
                }
              },
              required: ['files']
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
          case 'git_status':
            return await this.gitStatus(args.path);
          case 'git_log':
            return await this.gitLog(args.path, args.maxCount);
          case 'git_diff':
            return await this.gitDiff(args.path, args.file, args.staged);
          case 'git_branch':
            return await this.gitBranch(args.path, args.remote);
          case 'git_add':
            return await this.gitAdd(args.path, args.files);
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        throw new Error(`Git operation failed: ${error.message}`);
      }
    });
  }

  async executeGitCommand(command, cwd = process.cwd()) {
    try {
      const { stdout, stderr } = await execAsync(command, { cwd });
      return { stdout: stdout.trim(), stderr: stderr.trim() };
    } catch (error) {
      throw new Error(`Git command failed: ${error.message}`);
    }
  }

  async gitStatus(repoPath = process.cwd()) {
    const { stdout } = await this.executeGitCommand('git status --porcelain', repoPath);
    const longStatus = await this.executeGitCommand('git status', repoPath);
    
    return {
      content: [
        {
          type: 'text',
          text: `Git Status:\n\n${longStatus.stdout}\n\nPorcelain format:\n${stdout}`
        }
      ]
    };
  }

  async gitLog(repoPath = process.cwd(), maxCount = 10) {
    const command = `git log --oneline -n ${maxCount}`;
    const { stdout } = await this.executeGitCommand(command, repoPath);
    
    return {
      content: [
        {
          type: 'text',
          text: `Recent commits:\n${stdout}`
        }
      ]
    };
  }

  async gitDiff(repoPath = process.cwd(), file = null, staged = false) {
    let command = staged ? 'git diff --cached' : 'git diff';
    if (file) {
      command += ` ${file}`;
    }
    
    const { stdout } = await this.executeGitCommand(command, repoPath);
    
    return {
      content: [
        {
          type: 'text',
          text: stdout || 'No differences found'
        }
      ]
    };
  }

  async gitBranch(repoPath = process.cwd(), remote = false) {
    const command = remote ? 'git branch -a' : 'git branch';
    const { stdout } = await this.executeGitCommand(command, repoPath);
    
    return {
      content: [
        {
          type: 'text',
          text: `Git branches:\n${stdout}`
        }
      ]
    };
  }

  async gitAdd(repoPath = process.cwd(), files = []) {
    const fileList = files.join(' ');
    const command = `git add ${fileList}`;
    const { stdout, stderr } = await this.executeGitCommand(command, repoPath);
    
    return {
      content: [
        {
          type: 'text',
          text: `Added files: ${fileList}\n${stdout}\n${stderr}`
        }
      ]
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('MCP Git Server running on stdio');
  }
}

// Run the server
if (require.main === module) {
  const server = new GitServer();
  server.run().catch(console.error);
}

module.exports = GitServer;
