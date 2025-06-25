#!/usr/bin/env npx tsx

/**
 * Claude Session Initialization Agent
 * Automatically triggers on every Claude session start to provide briefing
 */

import { existsSync, readFileSync, writeFileSync, appendFileSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

interface AgentTask {
  agent_id: string;
  agent_name: string;
  task_type: string;
  task_description: string;
  status: 'started' | 'completed' | 'failed';
  timestamp: string;
  error?: string;
}

interface AgentRegistry {
  agents: Record<string, {
    status: string;
    [key: string]: unknown;
  }>;
  [key: string]: unknown;
}

interface TodoItem {
  priority: string;
  status: string;
  content: string;
}

interface MemoryGraph {
  entities?: Record<string, unknown>;
  [key: string]: unknown;
}

interface MessageBusStats {
  pending_messages: number;
  active_coordinations: number;
}

interface SessionBriefing {
  session_id: string;
  timestamp: string;
  project_state: {
    active_agents: number;
    pending_tasks: string[];
    recent_completions: AgentTask[];
    critical_issues: string[];
  };
  memory_context: {
    total_entities: number;
    recent_updates: string[];
  };
  todos: {
    high_priority: string[];
    in_progress: string[];
    pending: string[];
  };
  initialization_status: string;
}

class ClaudeInitializationAgent {
  private taskLogPath: string;
  private briefingPath: string;
  private registryPath: string;
  private claudeMdPath: string;
  private memoryGraphPath: string;
  private todoPath: string;
  private logPath: string;

  constructor() {
    const baseDir = process.cwd();
    this.taskLogPath = join(baseDir, 'logs', 'agent-tasks.jsonl');
    this.briefingPath = join(baseDir, 'temp', 'claude-session-briefing.json');
    this.registryPath = join(baseDir, 'agents', 'registry.json');
    this.claudeMdPath = join(baseDir, 'CLAUDE.md');
    this.memoryGraphPath = join(baseDir, 'memory', 'knowledge-graph.json');
    this.todoPath = join(baseDir, 'temp', 'todos.json');
    this.logPath = join(baseDir, 'logs', 'agent-activity', `${new Date().toISOString().split('T')[0]}.log`);
  }

  private log(message: string) {
    const timestamp = new Date().toISOString();
    const logEntry = `${timestamp} [CLAUDE_INIT] ${message}`;
    console.log(logEntry);
    try {
      appendFileSync(this.logPath, logEntry + '\n');
    } catch (error) {
      console.warn('Warning: Could not write to log file:', error instanceof Error ? error.message : 'Unknown error');
    }
  }

  /**
   * Log agent task completion
   */
  public logTaskCompletion(task: Omit<AgentTask, 'timestamp'>) {
    const fullTask: AgentTask = {
      ...task,
      timestamp: new Date().toISOString()
    };

    try {
      appendFileSync(this.taskLogPath, JSON.stringify(fullTask) + '\n');
      this.log(`Task logged: ${task.agent_name} - ${task.task_type} - ${task.status}`);
      
      // Update memory graph with task completion
      this.updateMemoryWithTask(fullTask);
    } catch (error) {
      this.log(`Error logging task: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update memory graph with task completion
   */
  private updateMemoryWithTask(task: AgentTask) {
    try {
      // Use MCP to add observation about task completion
      const observation = `${task.agent_name} ${task.status} task: ${task.task_description} at ${task.timestamp}`;
      
      // This would be called via MCP in real implementation
      this.log(`Memory update: ${observation}`);
    } catch (error) {
      this.log(`Error updating memory: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate session briefing for Claude
   */
  public async generateSessionBriefing(): Promise<SessionBriefing> {
    this.log('Generating session briefing for Claude...');
    
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      // 1. Get active agents from registry
      const registry = JSON.parse(readFileSync(this.registryPath, 'utf-8'));
      const activeAgents = Object.values((registry as AgentRegistry).agents).filter((a) => a.status === 'active').length;
      
      // 2. Get recent task completions
      const recentTasks = this.getRecentTasks(24); // Last 24 hours
      
      // 3. Get memory context
      const memoryContext = this.getMemoryContext();
      
      // 4. Get todos
      const todos = this.getTodos();
      
      // 5. Get critical issues
      const criticalIssues = this.getCriticalIssues();
      
      // 6. Get pending tasks from agents
      const pendingTasks = this.getPendingTasks();
      
      const briefing: SessionBriefing = {
        session_id: sessionId,
        timestamp: new Date().toISOString(),
        project_state: {
          active_agents: activeAgents,
          pending_tasks: pendingTasks,
          recent_completions: recentTasks,
          critical_issues: criticalIssues
        },
        memory_context: memoryContext,
        todos: todos,
        initialization_status: 'complete'
      };
      
      // Save briefing
      writeFileSync(this.briefingPath, JSON.stringify(briefing, null, 2));
      
      // Generate Claude-friendly summary
      this.generateClaudeSummary(briefing);
      
      this.log(`Session briefing generated: ${sessionId}`);
      return briefing;
      
    } catch (error) {
      this.log(`Error generating briefing: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  /**
   * Get recent tasks from log
   */
  private getRecentTasks(hoursAgo: number): AgentTask[] {
    if (!existsSync(this.taskLogPath)) {
      return [];
    }
    
    const cutoffTime = new Date(Date.now() - hoursAgo * 3600000);
    const tasks: AgentTask[] = [];
    
    try {
      const lines = readFileSync(this.taskLogPath, 'utf-8').split('\n').filter(l => l.trim());
      
      for (const line of lines) {
        try {
          const task = JSON.parse(line);
          if (new Date(task.timestamp) > cutoffTime) {
            tasks.push(task);
          }
        } catch {
          // Skip invalid lines
        }
      }
      
      return tasks.slice(-10); // Return last 10 tasks
    } catch (error) {
      this.log(`Error reading task log: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return [];
    }
  }

  /**
   * Get memory context summary
   */
  private getMemoryContext() {
    try {
      if (existsSync(this.memoryGraphPath)) {
        const graph = JSON.parse(readFileSync(this.memoryGraphPath, 'utf-8')) as MemoryGraph;
        return {
          total_entities: Object.keys(graph.entities || {}).length,
          recent_updates: [] // Would query recent observations
        };
      }
    } catch {
      this.log('Error reading memory graph');
    }
    
    return {
      total_entities: 0,
      recent_updates: []
    };
  }

  /**
   * Get todos from todo system
   */
  private getTodos() {
    try {
      if (existsSync(this.todoPath)) {
        const todos = JSON.parse(readFileSync(this.todoPath, 'utf-8'));
        
        const highPriority = todos.filter((t: TodoItem) => t.priority === 'high' && t.status !== 'completed').map((t: TodoItem) => t.content);
        const inProgress = todos.filter((t: TodoItem) => t.status === 'in_progress').map((t: TodoItem) => t.content);
        const pending = todos.filter((t: TodoItem) => t.status === 'pending').map((t: TodoItem) => t.content);
        
        return {
          high_priority: highPriority,
          in_progress: inProgress,
          pending: pending
        };
      }
    } catch {
      this.log('Error reading todos');
    }
    
    return {
      high_priority: [],
      in_progress: [],
      pending: []
    };
  }

  /**
   * Get critical issues from CLAUDE.md
   */
  private getCriticalIssues(): string[] {
    const issues: string[] = [];
    
    try {
      const claudeMd = readFileSync(this.claudeMdPath, 'utf-8');
      
      // Extract critical issues from CLAUDE.md
      if (claudeMd.includes('CRITICAL')) {
        const criticalSection = claudeMd.match(/\*\*CRITICAL\*\*:([^*]+)/g);
        if (criticalSection) {
          issues.push(...criticalSection.map(s => s.replace(/\*\*CRITICAL\*\*:/, '').trim()));
        }
      }
      
      // Add known mobile issues
      issues.push('Fix mobile responsiveness in three-panel layout');
      
    } catch {
      this.log('Error reading CLAUDE.md');
    }
    
    return issues;
  }

  /**
   * Get pending tasks from message bus
   */
  private getPendingTasks(): string[] {
    const tasks: string[] = [];
    
    try {
      // Check message bus for pending coordinations
      const messageBusStats = execSync('npx tsx scripts/agent-message-bus.ts stats', { encoding: 'utf-8' });
      
      if (messageBusStats.includes('pending_messages')) {
        const stats = JSON.parse(messageBusStats.split('Message Bus Statistics:')[1]) as MessageBusStats;
        if (stats.pending_messages > 0) {
          tasks.push(`${stats.pending_messages} pending agent messages`);
        }
        if (stats.active_coordinations > 0) {
          tasks.push(`${stats.active_coordinations} active coordinations`);
        }
      }
    } catch {
      // Message bus might not be running
    }
    
    return tasks;
  }

  /**
   * Generate Claude-friendly summary
   */
  private generateClaudeSummary(briefing: SessionBriefing) {
    const summaryPath = join(process.cwd(), 'temp', 'CLAUDE_SESSION_INIT.md');
    
    let summary = `# Claude Session Initialization - ${new Date().toISOString()}\n\n`;
    summary += `## Project State\n`;
    summary += `- **Active Agents**: ${briefing.project_state.active_agents}\n`;
    summary += `- **Memory Entities**: ${briefing.memory_context.total_entities}\n`;
    
    if (briefing.project_state.critical_issues.length > 0) {
      summary += `\n## 🚨 Critical Issues\n`;
      briefing.project_state.critical_issues.forEach(issue => {
        summary += `- ${issue}\n`;
      });
    }
    
    if (briefing.todos.in_progress.length > 0) {
      summary += `\n## 🔄 In Progress\n`;
      briefing.todos.in_progress.forEach(todo => {
        summary += `- ${todo}\n`;
      });
    }
    
    if (briefing.todos.high_priority.length > 0) {
      summary += `\n## ⚡ High Priority\n`;
      briefing.todos.high_priority.forEach(todo => {
        summary += `- ${todo}\n`;
      });
    }
    
    if (briefing.project_state.recent_completions.length > 0) {
      summary += `\n## ✅ Recent Completions\n`;
      briefing.project_state.recent_completions.forEach(task => {
        summary += `- **${task.agent_name}**: ${task.task_description} (${task.status})\n`;
      });
    }
    
    if (briefing.project_state.pending_tasks.length > 0) {
      summary += `\n## 📋 Pending Tasks\n`;
      briefing.project_state.pending_tasks.forEach(task => {
        summary += `- ${task}\n`;
      });
    }
    
    summary += `\n## Instructions\n`;
    summary += `1. Review critical issues and high priority items\n`;
    summary += `2. Check in-progress tasks for continuity\n`;
    summary += `3. Reference CLAUDE.md for detailed project context\n`;
    summary += `4. All agents are running autonomously - coordinate via message bus\n`;
    
    writeFileSync(summaryPath, summary);
    this.log(`Claude session summary written to ${summaryPath}`);
  }

  /**
   * Auto-trigger on session start
   */
  public async autoInitialize() {
    this.log('Auto-initializing Claude session...');
    
    try {
      // Generate briefing
      await this.generateSessionBriefing();
      
      // Send notification to all agents
      execSync(`npx tsx scripts/agent-message-bus.ts broadcast claudeInitAgent session_start "Claude session initialized"`);
      
      // Log the initialization as a task
      this.logTaskCompletion({
        agent_id: 'claude-init-agent',
        agent_name: 'Claude Session Initialization Agent',
        task_type: 'session_initialization',
        task_description: 'Generated session briefing and notified all agents',
        status: 'completed'
      });
      
    } catch (error) {
      this.log(`Auto-initialization error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      this.logTaskCompletion({
        agent_id: 'claude-init-agent',
        agent_name: 'Claude Session Initialization Agent',
        task_type: 'session_initialization',
        task_description: 'Failed to generate session briefing',
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}

// Create and export agent instance
export const claudeInitAgent = new ClaudeInitializationAgent();

// Auto-run if called directly
if (require.main === module) {
  claudeInitAgent.autoInitialize().catch(console.error);
}