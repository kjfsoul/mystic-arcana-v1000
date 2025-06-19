#!/usr/bin/env node

/**
 * Simple Working MCP Server
 * No complex SDK - just basic HTTP endpoints that work
 */

const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

const app = express();
app.use(cors());
app.use(express.json());

// Simple in-memory storage
const memory = new Map();

// Filesystem operations
app.post('/filesystem/read', async (req, res) => {
  try {
    const { path: filePath } = req.body;
    const content = await fs.readFile(filePath, 'utf8');
    res.json({ success: true, content });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/filesystem/write', async (req, res) => {
  try {
    const { path: filePath, content } = req.body;
    await fs.writeFile(filePath, content, 'utf8');
    res.json({ success: true, message: `File written: ${filePath}` });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/filesystem/list', async (req, res) => {
  try {
    const { path: dirPath = '.' } = req.body;
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    const items = entries.map(entry => ({
      name: entry.name,
      type: entry.isDirectory() ? 'directory' : 'file',
      path: path.join(dirPath, entry.name)
    }));
    res.json({ success: true, items });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Git operations
app.post('/git/status', async (req, res) => {
  try {
    const { stdout } = await execAsync('git status --porcelain');
    const { stdout: longStatus } = await execAsync('git status');
    res.json({ 
      success: true, 
      status: stdout.trim(),
      longStatus: longStatus.trim()
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/git/log', async (req, res) => {
  try {
    const { maxCount = 10 } = req.body;
    const { stdout } = await execAsync(`git log --oneline -n ${maxCount}`);
    res.json({ success: true, log: stdout.trim() });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/git/diff', async (req, res) => {
  try {
    const { file, staged = false } = req.body;
    let command = staged ? 'git diff --cached' : 'git diff';
    if (file) command += ` ${file}`;
    
    const { stdout } = await execAsync(command);
    res.json({ success: true, diff: stdout });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Memory operations
app.post('/memory/store', async (req, res) => {
  try {
    const { key, value, metadata = {} } = req.body;
    const entry = {
      value,
      metadata,
      timestamp: new Date().toISOString()
    };
    memory.set(key, entry);
    res.json({ success: true, message: `Memory stored: ${key}` });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/memory/retrieve', async (req, res) => {
  try {
    const { key } = req.body;
    const entry = memory.get(key);
    if (entry) {
      res.json({ success: true, memory: entry });
    } else {
      res.json({ success: false, message: 'Memory not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/memory/list', async (req, res) => {
  try {
    const entries = Array.from(memory.entries()).map(([key, value]) => ({
      key,
      timestamp: value.timestamp,
      hasMetadata: Object.keys(value.metadata || {}).length > 0
    }));
    res.json({ success: true, memories: entries });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/memory/delete', async (req, res) => {
  try {
    const { key } = req.body;
    const existed = memory.has(key);
    memory.delete(key);
    res.json({ 
      success: true, 
      message: existed ? `Memory deleted: ${key}` : `No memory found: ${key}` 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'simple-mcp-server',
    timestamp: new Date().toISOString(),
    capabilities: ['filesystem', 'git', 'memory']
  });
});

// API documentation
app.get('/', (req, res) => {
  res.json({
    name: 'Simple MCP Server',
    version: '1.0.0',
    endpoints: {
      filesystem: [
        'POST /filesystem/read - Read file content',
        'POST /filesystem/write - Write file content', 
        'POST /filesystem/list - List directory contents'
      ],
      git: [
        'POST /git/status - Get git status',
        'POST /git/log - Get git log',
        'POST /git/diff - Get git diff'
      ],
      memory: [
        'POST /memory/store - Store memory',
        'POST /memory/retrieve - Retrieve memory',
        'POST /memory/list - List memories',
        'POST /memory/delete - Delete memory'
      ],
      health: [
        'GET /health - Health check',
        'GET / - This documentation'
      ]
    },
    examples: {
      readFile: {
        url: 'POST /filesystem/read',
        body: { path: './package.json' }
      },
      gitStatus: {
        url: 'POST /git/status',
        body: {}
      },
      storeMemory: {
        url: 'POST /memory/store',
        body: { key: 'test', value: 'Hello World' }
      }
    }
  });
});

const port = process.env.PORT || 3000;
app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Simple MCP Server running on port ${port}`);
  console.log(`📋 API Documentation: http://localhost:${port}/`);
  console.log(`❤️  Health Check: http://localhost:${port}/health`);
  console.log(`🔧 Capabilities: filesystem, git, memory`);
});

module.exports = app;
