#!/usr/bin/env npx tsx

/**
 * Email Scheduler Service
 * Manages automated email notifications
 */

import { emailNotifier } from '../src/agents/email-notifier';
import { readFileSync, appendFileSync } from 'fs';
import { join } from 'path';
import { spawn } from 'child_process';

class EmailScheduler {
  private isRunning = false;
  private dailyReportTimeout?: NodeJS.Timeout;
  private urgentCheckInterval?: NodeJS.Timeout;
  private logPath: string;

  constructor() {
    this.logPath = join(process.cwd(), 'logs', 'agent-activity', `${new Date().toISOString().split('T')[0]}.log`);
  }

  private log(message: string) {
    const timestamp = new Date().toISOString();
    const logEntry = `${timestamp} [EMAIL_SCHEDULER] ${message}`;
    console.log(logEntry);
    try {
      appendFileSync(this.logPath, logEntry + '\n');
    } catch (error) {
      console.warn('Warning: Could not write to log file:', error instanceof Error ? error.message : 'Unknown error');
    }
  }

  /**
   * Start the email scheduler
   */
  public start() {
    if (this.isRunning) {
      this.log('Email scheduler already running');
      return;
    }

    this.isRunning = true;
    this.log('Starting email scheduler...');

    // Schedule daily report at 9 AM
    this.scheduleDailyReport();

    // Check for urgent notifications every 15 minutes
    this.scheduleUrgentChecks();

    // Handle graceful shutdown
    process.on('SIGINT', () => this.stop());
    process.on('SIGTERM', () => this.stop());

    this.log('Email scheduler started successfully');
  }

  /**
   * Stop the email scheduler
   */
  public stop() {
    if (!this.isRunning) {
      return;
    }

    this.log('Stopping email scheduler...');
    
    if (this.dailyReportTimeout) {
      clearTimeout(this.dailyReportTimeout);
    }
    
    if (this.urgentCheckInterval) {
      clearInterval(this.urgentCheckInterval);
    }

    this.isRunning = false;
    this.log('Email scheduler stopped');
  }

  /**
   * Schedule daily report at 9 AM
   */
  private scheduleDailyReport() {
    const now = new Date();
    const nextNineAM = new Date();
    nextNineAM.setHours(9, 0, 0, 0);

    // If it's already past 9 AM today, schedule for tomorrow
    if (now.getHours() >= 9) {
      nextNineAM.setDate(nextNineAM.getDate() + 1);
    }

    const msUntilNineAM = nextNineAM.getTime() - now.getTime();

    this.log(`Daily report scheduled for ${nextNineAM.toLocaleString()} (in ${Math.round(msUntilNineAM / 1000 / 60)} minutes)`);

    this.dailyReportTimeout = setTimeout(async () => {
      try {
        this.log('Sending daily email report...');
        await emailNotifier.sendReport();
        this.log('Daily email report sent successfully');
        
        // Schedule next day's report
        this.scheduleDailyReport();
      } catch (error) {
        this.log(`Error sending daily report: ${error instanceof Error ? error.message : 'Unknown error'}`);
        
        // Retry in 1 hour
        this.dailyReportTimeout = setTimeout(() => this.scheduleDailyReport(), 60 * 60 * 1000);
      }
    }, msUntilNineAM);
  }

  /**
   * Check for urgent notifications every 15 minutes
   */
  private scheduleUrgentChecks() {
    this.log('Starting urgent notification checks every 15 minutes');
    
    this.urgentCheckInterval = setInterval(async () => {
      try {
        await this.checkForUrgentNotifications();
      } catch (error) {
        this.log(`Error during urgent check: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }, 15 * 60 * 1000); // 15 minutes

    // Run initial check
    this.checkForUrgentNotifications();
  }

  /**
   * Check for conditions requiring urgent notifications
   */
  private async checkForUrgentNotifications() {
    const urgentConditions: string[] = [];

    try {
      // Check for failed agents
      const registryPath = join(process.cwd(), 'agents', 'registry.json');
      const registry = JSON.parse(readFileSync(registryPath, 'utf-8'));
      
      const failedAgents = Object.values(registry.agents).filter((a: any) => a.status === 'failed');
      if (failedAgents.length > 0) {
        urgentConditions.push(`${failedAgents.length} agents have failed and require attention`);
      }

      // Check for high priority todos that have been pending too long
      const todoPath = join(process.cwd(), 'temp', 'todos.json');
      try {
        const todos = JSON.parse(readFileSync(todoPath, 'utf-8'));
        const criticalTodos = todos.filter((t: any) => 
          t.priority === 'high' && 
          t.status === 'pending' && 
          new Date(t.created_at || '2025-01-01') < new Date(Date.now() - 24 * 60 * 60 * 1000)
        );
        
        if (criticalTodos.length > 0) {
          urgentConditions.push(`${criticalTodos.length} high-priority todos have been pending for over 24 hours`);
        }
      } catch (e) {
        // Todo file might not exist
      }

      // Check system health
      if (registry.system_health?.mcp_connectivity === '0/5 online') {
        urgentConditions.push('All MCP servers are offline - system integration compromised');
      }

      // Send urgent notifications if needed
      for (const condition of urgentConditions) {
        this.log(`Urgent condition detected: ${condition}`);
        await emailNotifier.sendUrgentNotification(condition);
      }

      if (urgentConditions.length === 0) {
        this.log('Urgent check completed - no critical issues found');
      }

    } catch (error) {
      this.log(`Error checking urgent conditions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Send test email
   */
  public async sendTestEmail() {
    this.log('Sending test email...');
    try {
      await emailNotifier.sendReport();
      this.log('Test email sent successfully');
    } catch (error) {
      this.log(`Test email failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }
}

// Create scheduler instance
const scheduler = new EmailScheduler();

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'start':
      scheduler.start();
      console.log('Email scheduler running. Press Ctrl+C to stop.');
      break;
      
    case 'test':
      scheduler.sendTestEmail().catch(console.error);
      break;
      
    case 'urgent':
      const message = args.slice(1).join(' ');
      if (!message) {
        console.error('Usage: email-scheduler urgent <message>');
        process.exit(1);
      }
      emailNotifier.sendUrgentNotification(message).catch(console.error);
      break;
      
    default:
      console.log('Email Scheduler');
      console.log('Usage:');
      console.log('  start          - Start the email scheduler service');
      console.log('  test           - Send a test email report');
      console.log('  urgent <msg>   - Send urgent notification');
      break;
  }
}

export { EmailScheduler };