#!/usr/bin/env npx tsx

/**
 * Inter-Agent Message Bus & Coordination System
 * Enables real-time communication between autonomous agents
 */

import { writeFileSync, readFileSync, existsSync, appendFileSync, mkdirSync } from 'fs';
import { join } from 'path';

export interface AgentMessage {
  id: string;
  from: string;
  to: string | 'broadcast';
  type: 'request' | 'response' | 'notification' | 'coordination';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  payload: any;
  timestamp: string;
  expires_at?: string;
  correlation_id?: string;
}

export interface CoordinationRequest {
  task_type: 'tarot_reading' | 'astronomical_update' | 'compliance_check' | 'data_sync';
  requesting_agent: string;
  required_agents: string[];
  deadline?: string;
  context: any;
}

class AgentMessageBus {
  private messagePath: string;
  private coordinationPath: string;
  private logPath: string;

  constructor() {
    const baseDir = process.cwd();
    this.messagePath = join(baseDir, 'temp', 'agent-messages.json');
    this.coordinationPath = join(baseDir, 'temp', 'agent-coordination.json');
    this.logPath = join(baseDir, 'logs', 'agent-activity', `${new Date().toISOString().split('T')[0]}.log`);
    
    // Ensure directories exist
    const tempDir = join(baseDir, 'temp');
    if (!existsSync(tempDir)) {
      mkdirSync(tempDir, { recursive: true });
    }
    
    this.initializeMessageStore();
  }

  private initializeMessageStore() {
    if (!existsSync(this.messagePath)) {
      writeFileSync(this.messagePath, JSON.stringify({ messages: [], last_cleaned: new Date().toISOString() }, null, 2));
    }
    
    if (!existsSync(this.coordinationPath)) {
      writeFileSync(this.coordinationPath, JSON.stringify({ 
        active_coordinations: [], 
        completed_coordinations: [],
        last_updated: new Date().toISOString() 
      }, null, 2));
    }
  }

  private log(message: string) {
    const timestamp = new Date().toISOString();
    const logEntry = `${timestamp} [MESSAGE_BUS] ${message}`;
    console.log(logEntry);
    try {
      appendFileSync(this.logPath, logEntry + '\n');
    } catch (error) {
      console.warn('Warning: Could not write to log file:', error instanceof Error ? error.message : 'Unknown error');
    }
  }

  /**
   * Send a message between agents
   */
  sendMessage(message: Omit<AgentMessage, 'id' | 'timestamp'>): string {
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const fullMessage: AgentMessage = {
      ...message,
      id: messageId,
      timestamp: new Date().toISOString()
    };

    try {
      const data = JSON.parse(readFileSync(this.messagePath, 'utf-8'));
      data.messages.push(fullMessage);
      
      // Clean expired messages (older than 1 hour)
      const oneHourAgo = new Date(Date.now() - 3600000).toISOString();
      data.messages = data.messages.filter((msg: AgentMessage) => {
        if (msg.expires_at) {
          return msg.expires_at > new Date().toISOString();
        }
        return msg.timestamp > oneHourAgo;
      });
      
      writeFileSync(this.messagePath, JSON.stringify(data, null, 2));
      
      this.log(`Message sent: ${message.from} → ${message.to} [${message.type}:${message.priority}]`);
      return messageId;
    } catch (error) {
      this.log(`Error sending message: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  /**
   * Get messages for a specific agent
   */
  getMessages(agentId: string, markAsRead = true): AgentMessage[] {
    try {
      const data = JSON.parse(readFileSync(this.messagePath, 'utf-8'));
      const messages = data.messages.filter((msg: AgentMessage) => 
        msg.to === agentId || msg.to === 'broadcast'
      );

      if (markAsRead && messages.length > 0) {
        // Remove messages for this agent (except broadcasts)
        data.messages = data.messages.filter((msg: AgentMessage) => 
          !(msg.to === agentId && msg.to !== 'broadcast')
        );
        writeFileSync(this.messagePath, JSON.stringify(data, null, 2));
        
        this.log(`${messages.length} messages retrieved for ${agentId}`);
      }

      return messages.sort((a: AgentMessage, b: AgentMessage) => {
        const priorityOrder: Record<string, number> = { urgent: 4, high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });
    } catch (error) {
      this.log(`Error getting messages for ${agentId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return [];
    }
  }

  /**
   * Initiate coordination between multiple agents
   */
  requestCoordination(coordination: CoordinationRequest): string {
    const coordinationId = `coord_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      const data = JSON.parse(readFileSync(this.coordinationPath, 'utf-8'));
      
      const coordinationRecord = {
        id: coordinationId,
        ...coordination,
        status: 'pending',
        responses: {},
        created_at: new Date().toISOString(),
        deadline: coordination.deadline || new Date(Date.now() + 300000).toISOString() // 5 min default
      };
      
      data.active_coordinations.push(coordinationRecord);
      writeFileSync(this.coordinationPath, JSON.stringify(data, null, 2));

      // Send coordination request to all required agents
      coordination.required_agents.forEach(agentId => {
        this.sendMessage({
          from: 'message_bus',
          to: agentId,
          type: 'request',
          priority: 'high',
          payload: {
            coordination_id: coordinationId,
            task_type: coordination.task_type,
            requesting_agent: coordination.requesting_agent,
            context: coordination.context,
            deadline: coordinationRecord.deadline
          }
        });
      });

      this.log(`Coordination initiated: ${coordinationId} for ${coordination.task_type} (${coordination.required_agents.join(', ')})`);
      return coordinationId;
    } catch (error) {
      this.log(`Error requesting coordination: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  /**
   * Respond to a coordination request
   */
  respondToCoordination(coordinationId: string, agentId: string, response: any) {
    try {
      const data = JSON.parse(readFileSync(this.coordinationPath, 'utf-8'));
      const coordination = data.active_coordinations.find((c: any) => c.id === coordinationId);
      
      if (!coordination) {
        throw new Error(`Coordination ${coordinationId} not found`);
      }

      coordination.responses[agentId] = {
        response,
        timestamp: new Date().toISOString()
      };

      // Check if all agents have responded
      const allResponded = coordination.required_agents.every((agent: string) => 
        coordination.responses[agent]
      );

      if (allResponded) {
        coordination.status = 'completed';
        coordination.completed_at = new Date().toISOString();
        
        // Move to completed coordinations
        data.completed_coordinations.push(coordination);
        data.active_coordinations = data.active_coordinations.filter((c: any) => c.id !== coordinationId);
        
        // Notify requesting agent of completion
        this.sendMessage({
          from: 'message_bus',
          to: coordination.requesting_agent,
          type: 'response',
          priority: 'high',
          payload: {
            coordination_id: coordinationId,
            status: 'completed',
            responses: coordination.responses
          },
          correlation_id: coordinationId
        });

        this.log(`Coordination completed: ${coordinationId} - all agents responded`);
      }

      writeFileSync(this.coordinationPath, JSON.stringify(data, null, 2));
      this.log(`Response received for ${coordinationId} from ${agentId}`);
    } catch (error) {
      this.log(`Error responding to coordination: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  /**
   * Broadcast a notification to all agents
   */
  broadcast(from: string, type: string, payload: any, priority: 'low' | 'medium' | 'high' = 'medium') {
    return this.sendMessage({
      from,
      to: 'broadcast',
      type: 'notification',
      priority,
      payload: {
        notification_type: type,
        ...payload
      }
    });
  }

  /**
   * Get coordination status
   */
  getCoordinationStatus(coordinationId: string) {
    try {
      const data = JSON.parse(readFileSync(this.coordinationPath, 'utf-8'));
      
      let coordination = data.active_coordinations.find((c: any) => c.id === coordinationId);
      if (!coordination) {
        coordination = data.completed_coordinations.find((c: any) => c.id === coordinationId);
      }
      
      return coordination || null;
    } catch (error) {
      this.log(`Error getting coordination status: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return null;
    }
  }

  /**
   * Clean up expired coordinations
   */
  cleanup() {
    try {
      const data = JSON.parse(readFileSync(this.coordinationPath, 'utf-8'));
      const now = new Date().toISOString();
      
      // Move expired active coordinations to completed with timeout status
      const expired = data.active_coordinations.filter((c: any) => c.deadline < now);
      expired.forEach((c: any) => {
        c.status = 'timeout';
        c.completed_at = now;
        data.completed_coordinations.push(c);
      });
      
      data.active_coordinations = data.active_coordinations.filter((c: any) => c.deadline >= now);
      
      // Keep only last 100 completed coordinations
      if (data.completed_coordinations.length > 100) {
        data.completed_coordinations = data.completed_coordinations.slice(-100);
      }
      
      writeFileSync(this.coordinationPath, JSON.stringify(data, null, 2));
      
      if (expired.length > 0) {
        this.log(`Cleaned up ${expired.length} expired coordinations`);
      }
    } catch (error) {
      this.log(`Error during cleanup: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get system statistics
   */
  getStats() {
    try {
      const messageData = JSON.parse(readFileSync(this.messagePath, 'utf-8'));
      const coordData = JSON.parse(readFileSync(this.coordinationPath, 'utf-8'));
      
      return {
        pending_messages: messageData.messages.length,
        active_coordinations: coordData.active_coordinations.length,
        completed_coordinations: coordData.completed_coordinations.length,
        last_activity: new Date().toISOString()
      };
    } catch (error) {
      this.log(`Error getting stats: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}

// Create global message bus instance
export const messageBus = new AgentMessageBus();

// Auto-cleanup every 10 minutes
setInterval(() => {
  messageBus.cleanup();
}, 600000);

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'stats':
      console.log('Message Bus Statistics:');
      console.log(JSON.stringify(messageBus.getStats(), null, 2));
      break;
      
    case 'messages': {
      const agentId = args[1];
      if (!agentId) {
        console.error('Usage: agent-message-bus.ts messages <agentId>');
        process.exit(1);
      }
      const messages = messageBus.getMessages(agentId, false);
      console.log(`Messages for ${agentId}:`);
      console.log(JSON.stringify(messages, null, 2));
      break;
    }
      
    case 'broadcast': {
      const from = args[1];
      const type = args[2];
      const message = args[3];
      if (!from || !type || !message) {
        console.error('Usage: agent-message-bus.ts broadcast <from> <type> <message>');
        process.exit(1);
      }
      const msgId = messageBus.broadcast(from, type, { message });
      console.log(`Broadcast sent: ${msgId}`);
      break;
    }
      
    default:
      console.log('Available commands:');
      console.log('  stats                     - Show message bus statistics');
      console.log('  messages <agentId>        - Show messages for agent');
      console.log('  broadcast <from> <type> <message> - Send broadcast');
      break;
  }
}