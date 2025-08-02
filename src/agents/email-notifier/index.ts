#!/usr/bin/env npx tsx
/**
 * Email Notification Agent
 * Sends automated email updates to kjfsoul@gmail.com
 */
import * as nodemailer from 'nodemailer';
import { readFileSync, existsSync, writeFileSync, appendFileSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';
interface CompletedTask {
  agent_name: string;
  task_description: string;
  timestamp: string;
  status: string;
}
interface AgentStatus {
  total: number;
  active: number;
  failed: number;
  system_health?: unknown;
}
interface SystemHealth {
  uptime: number;
  memory_usage: NodeJS.MemoryUsage;
  active_processes: number;
}
interface TodoItem {
  priority: string;
  status: string;
  content: string;
}
interface AgentRegistry {
  agents: Record<string, {
    status: string;
    [key: string]: unknown;
  }>;
  system_health?: {
    mcp_connectivity?: string;
  };
  [key: string]: unknown;
}
interface MessageData {
  messages: unknown[];
}
interface EmailReport {
  timestamp: string;
  completed_tasks: CompletedTask[];
  todos: {
    high_priority: string[];
    in_progress: string[];
    pending: string[];
  };
  challenges: string[];
  urgent_needs: string[];
  agent_status: AgentStatus;
  system_health: SystemHealth;
}
class EmailNotificationAgent {
  private recipient = 'kjfsoul@gmail.com';
  private transporter: nodemailer.Transporter;
  private logPath: string;
  private lastReportPath: string;
  private registryPath: string;
  private todoPath: string;
  private taskLogPath: string;
  private messageBusPath: string;
  constructor() {
    const baseDir = process.cwd();
    this.logPath = join(baseDir, 'logs', 'agent-activity', `${new Date().toISOString().split('T')[0]}.log`);
    this.lastReportPath = join(baseDir, 'temp', 'last-email-report.json');
    this.registryPath = join(baseDir, 'agents', 'registry.json');
    this.todoPath = join(baseDir, 'temp', 'todos.json');
    this.taskLogPath = join(baseDir, 'logs', 'agent-tasks.jsonl');
    this.messageBusPath = join(baseDir, 'temp', 'agent-messages.json');
    // Configure email transporter
    // Using Gmail SMTP - you'll need to set up app password
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'mystic.arcana.notifications@gmail.com',
        pass: process.env.EMAIL_PASS || '' // App password required
      }
    });
  }
  private log(message: string) {
    const timestamp = new Date().toISOString();
    const logEntry = `${timestamp} [EMAIL_NOTIFIER] ${message}`;
    console.log(logEntry);
    try {
      appendFileSync(this.logPath, logEntry + '\n');
    } catch (error) {
      console.warn('Warning: Could not write to log file:', error instanceof Error ? error.message : 'Unknown error');
    }
  }
  /**
   * Collect all updates since last report
   */
  private async collectUpdates(): Promise<EmailReport> {
    const report: EmailReport = {
      timestamp: new Date().toISOString(),
      completed_tasks: [],
      todos: {
        high_priority: [],
        in_progress: [],
        pending: []
      },
      challenges: [],
      urgent_needs: [],
      agent_status: { total: 0, active: 0, failed: 0 },
      system_health: {
        uptime: process.uptime(),
        memory_usage: process.memoryUsage(),
        active_processes: 1
      }
    };
    try {
      // 1. Get completed tasks from task log
      if (existsSync(this.taskLogPath)) {
        const lines = readFileSync(this.taskLogPath, 'utf-8').split('\n').filter(l => l.trim());
        const lastReportTime = this.getLastReportTime();
        
        for (const line of lines) {
          try {
            const task = JSON.parse(line);
            if (new Date(task.timestamp) > lastReportTime && task.status === 'completed') {
              report.completed_tasks.push(task);
            }
          } catch {
            // Skip invalid lines
          }
        }
      }
      // 2. Get current todos
      if (existsSync(this.todoPath)) {
        const todos = JSON.parse(readFileSync(this.todoPath, 'utf-8')) as TodoItem[];
        report.todos.high_priority = todos.filter((t) => t.priority === 'high' && t.status !== 'completed').map((t) => t.content);
        report.todos.in_progress = todos.filter((t) => t.status === 'in_progress').map((t) => t.content);
        report.todos.pending = todos.filter((t) => t.status === 'pending').map((t) => t.content);
      }
      // 3. Get agent status
      if (existsSync(this.registryPath)) {
        const registry = JSON.parse(readFileSync(this.registryPath, 'utf-8')) as AgentRegistry;
        report.agent_status = {
          total: Object.keys(registry.agents).length,
          active: Object.values(registry.agents).filter((a) => a.status === 'active').length,
          failed: Object.values(registry.agents).filter((a) => a.status === 'failed').length,
          system_health: registry.system_health
        };
      }
      // 4. Identify challenges and urgent needs
      report.challenges = await this.identifyChallenges();
      report.urgent_needs = await this.identifyUrgentNeeds();
      // 5. Get system health metrics
      report.system_health = await this.getSystemHealth();
    } catch (error) {
      this.log(`Error collecting updates: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    return report;
  }
  /**
   * Get last report time
   */
  private getLastReportTime(): Date {
    if (existsSync(this.lastReportPath)) {
      try {
        const lastReport = JSON.parse(readFileSync(this.lastReportPath, 'utf-8'));
        return new Date(lastReport.timestamp);
      } catch {
        // Default to 24 hours ago
      }
    }
    return new Date(Date.now() - 24 * 60 * 60 * 1000);
  }
  /**
   * Identify current challenges
   */
  private async identifyChallenges(): Promise<string[]> {
    const challenges: string[] = [];
    // Check for failed agents
    try {
      const registry = JSON.parse(readFileSync(this.registryPath, 'utf-8')) as AgentRegistry;
      const failedAgents = Object.values(registry.agents).filter((a) => a.status === 'failed');
      if (failedAgents.length > 0) {
        challenges.push(`${failedAgents.length} agents are in failed state`);
      }
    } catch {}
    // Check for pending messages
    try {
      const messages = JSON.parse(readFileSync(this.messageBusPath, 'utf-8')) as MessageData;
      if (messages.messages.length > 10) {
        challenges.push(`${messages.messages.length} unprocessed messages in queue`);
      }
    } catch {}
    // Known critical issues
    challenges.push('Mobile responsiveness broken in three-panel layout');
    challenges.push('4 competing layout systems need consolidation');
    return challenges;
  }
  /**
   * Identify urgent needs
   */
  private async identifyUrgentNeeds(): Promise<string[]> {
    const urgent: string[] = [];
    // Check todos for high priority items
    if (existsSync(this.todoPath)) {
      try {
        const todos = JSON.parse(readFileSync(this.todoPath, 'utf-8'));
        const highPriority = todos.filter((t: TodoItem) => t.priority === 'high' && t.status !== 'completed');
        if (highPriority.length > 0) {
          urgent.push(`${highPriority.length} high-priority tasks pending`);
        }
      } catch {}
    }
    // Check for MCP server connectivity
    try {
      const registry = JSON.parse(readFileSync(this.registryPath, 'utf-8')) as AgentRegistry;
      if (registry.system_health?.mcp_connectivity === '0/5 online') {
        urgent.push('All MCP servers are offline - external integrations unavailable');
      }
    } catch {}
    return urgent;
  }
  /**
   * Get system health metrics
   */
  private async getSystemHealth(): Promise<SystemHealth> {
    const health: SystemHealth = {
      uptime: process.uptime(),
      memory_usage: process.memoryUsage(),
      active_processes: 0
    };
    try {
      // Count active processes
      const psCount = execSync('ps aux | grep -E "(tsx|node)" | grep -v grep | wc -l', { encoding: 'utf-8' });
      health.active_processes = parseInt(psCount.trim());
    } catch {}
    return health;
  }
  /**
   * Format email content
   */
  private formatEmailContent(report: EmailReport): { subject: string; html: string; text: string } {
    const urgentCount = report.urgent_needs.length;
    const completedCount = report.completed_tasks.length;
    
    const subject = `Mystic Arcana Daily Report - ${urgentCount} Urgent Items, ${completedCount} Completed Tasks`;
    const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    h1 { color: #5a3d8a; }
    h2 { color: #7a5db0; margin-top: 20px; }
    .urgent { background-color: #fee; padding: 10px; border-left: 4px solid #f44; margin: 10px 0; }
    .completed { background-color: #efe; padding: 10px; border-left: 4px solid #4f4; margin: 10px 0; }
    .challenge { background-color: #fef; padding: 10px; border-left: 4px solid #fa0; margin: 10px 0; }
    .section { margin: 20px 0; }
    ul { margin: 10px 0; }
    .metric { display: inline-block; margin: 0 20px 10px 0; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ccc; color: #666; font-size: 0.9em; }
  </style>
</head>
<body>
  <h1>🔮 Mystic Arcana Daily Report</h1>
  <p><strong>Generated:</strong> ${new Date(report.timestamp).toLocaleString()}</p>
  
  ${report.urgent_needs.length > 0 ? `
  <div class="section urgent">
    <h2>🚨 Urgent Needs (${report.urgent_needs.length})</h2>
    <ul>
      ${report.urgent_needs.map(need => `<li>${need}</li>`).join('')}
    </ul>
  </div>
  ` : ''}
  
  <div class="section">
    <h2>✅ Completed Tasks (${report.completed_tasks.length})</h2>
    ${report.completed_tasks.length > 0 ? `
    <ul>
      ${report.completed_tasks.map(task => 
        `<li><strong>${task.agent_name}:</strong> ${task.task_description} - ${new Date(task.timestamp).toLocaleTimeString()}</li>`
      ).join('')}
    </ul>
    ` : '<p>No tasks completed since last report.</p>'}
  </div>
  
  <div class="section">
    <h2>📋 Current Todos</h2>
    ${report.todos.high_priority.length > 0 ? `
    <h3>⚡ High Priority (${report.todos.high_priority.length})</h3>
    <ul>
      ${report.todos.high_priority.map(todo => `<li>${todo}</li>`).join('')}
    </ul>
    ` : ''}
    
    ${report.todos.in_progress.length > 0 ? `
    <h3>🔄 In Progress (${report.todos.in_progress.length})</h3>
    <ul>
      ${report.todos.in_progress.map(todo => `<li>${todo}</li>`).join('')}
    </ul>
    ` : ''}
    
    ${report.todos.pending.length > 0 ? `
    <h3>⏳ Pending (${report.todos.pending.length})</h3>
    <ul>
      ${report.todos.pending.map(todo => `<li>${todo}</li>`).join('')}
    </ul>
    ` : ''}
  </div>
  
  ${report.challenges.length > 0 ? `
  <div class="section challenge">
    <h2>⚠️ Current Challenges (${report.challenges.length})</h2>
    <ul>
      ${report.challenges.map(challenge => `<li>${challenge}</li>`).join('')}
    </ul>
  </div>
  ` : ''}
  
  <div class="section">
    <h2>📊 System Status</h2>
    <div>
      <span class="metric"><strong>Active Agents:</strong> ${report.agent_status.active}/${report.agent_status.total}</span>
      <span class="metric"><strong>Failed Agents:</strong> ${report.agent_status.failed}</span>
      <span class="metric"><strong>Active Processes:</strong> ${report.system_health.active_processes}</span>
    </div>
  </div>
  
  <div class="footer">
    <p>This is an automated report from the Mystic Arcana development system.</p>
    <p>To modify report settings, update the Email Notification Agent configuration.</p>
  </div>
</body>
</html>
    `;
    const text = `
MYSTIC ARCANA DAILY REPORT
Generated: ${new Date(report.timestamp).toLocaleString()}
${report.urgent_needs.length > 0 ? `URGENT NEEDS (${report.urgent_needs.length}):
${report.urgent_needs.map(need => `- ${need}`).join('\n')}
` : ''}
COMPLETED TASKS (${report.completed_tasks.length}):
${report.completed_tasks.length > 0 ? 
  report.completed_tasks.map(task => 
    `- ${task.agent_name}: ${task.task_description} - ${new Date(task.timestamp).toLocaleTimeString()}`
  ).join('\n') : 'No tasks completed since last report.'}
CURRENT TODOS:
${report.todos.high_priority.length > 0 ? `High Priority (${report.todos.high_priority.length}):
${report.todos.high_priority.map(todo => `- ${todo}`).join('\n')}
` : ''}
${report.todos.in_progress.length > 0 ? `In Progress (${report.todos.in_progress.length}):
${report.todos.in_progress.map(todo => `- ${todo}`).join('\n')}
` : ''}
${report.todos.pending.length > 0 ? `Pending (${report.todos.pending.length}):
${report.todos.pending.map(todo => `- ${todo}`).join('\n')}
` : ''}
${report.challenges.length > 0 ? `CURRENT CHALLENGES (${report.challenges.length}):
${report.challenges.map(challenge => `- ${challenge}`).join('\n')}
` : ''}
SYSTEM STATUS:
- Active Agents: ${report.agent_status.active}/${report.agent_status.total}
- Failed Agents: ${report.agent_status.failed}
- Active Processes: ${report.system_health.active_processes}
This is an automated report from the Mystic Arcana development system.
    `;
    return { subject, html, text };
  }
  /**
   * Send email report
   */
  public async sendReport() {
    this.log('Generating email report...');
    
    try {
      const report = await this.collectUpdates();
      const { subject, html, text } = this.formatEmailContent(report);
      // Check if email credentials are configured
      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        this.log('Email credentials not configured. Set EMAIL_USER and EMAIL_PASS environment variables.');
        this.log('Report generated but not sent. Saving to file...');
        
        // Save report to file instead
        const reportPath = join(process.cwd(), 'temp', `email-report-${Date.now()}.html`);
        writeFileSync(reportPath, html);
        this.log(`Report saved to: ${reportPath}`);
        return;
      }
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: this.recipient,
        subject,
        text,
        html
      };
      const info = await this.transporter.sendMail(mailOptions);
      this.log(`Email sent successfully: ${info.messageId}`);
      // Save last report timestamp
      writeFileSync(this.lastReportPath, JSON.stringify({ timestamp: report.timestamp }));
    } catch (error) {
      this.log(`Error sending email report: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }
  /**
   * Send urgent notification
   */
  public async sendUrgentNotification(message: string) {
    this.log(`Sending urgent notification: ${message}`);
    
    try {
      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        this.log('Email credentials not configured for urgent notification.');
        return;
      }
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: this.recipient,
        subject: `🚨 URGENT: Mystic Arcana - ${message.substring(0, 50)}`,
        text: `URGENT NOTIFICATION\n\n${message}\n\nTimestamp: ${new Date().toISOString()}`,
        html: `
          <div style="background-color: #fee; padding: 20px; border: 2px solid #f44;">
            <h2 style="color: #f44;">🚨 URGENT NOTIFICATION</h2>
            <p><strong>${message}</strong></p>
            <p style="color: #666;">Timestamp: ${new Date().toISOString()}</p>
          </div>
        `
      };
      await this.transporter.sendMail(mailOptions);
      this.log('Urgent notification sent successfully');
    } catch (error) {
      this.log(`Error sending urgent notification: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
// Create and export agent instance
export const emailNotifier = new EmailNotificationAgent();
// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];
  switch (command) {
    case 'send':
      emailNotifier.sendReport().catch(console.error);
      break;
      
    case 'urgent':
      const message = args.slice(1).join(' ');
      if (!message) {
        console.error('Usage: email-notifier urgent <message>');
        process.exit(1);
      }
      emailNotifier.sendUrgentNotification(message).catch(console.error);
      break;
      
    default:
      console.log('Email Notification Agent');
      console.log('Usage:');
      console.log('  send           - Send daily report');
      console.log('  urgent <msg>   - Send urgent notification');
      break;
  }
}
