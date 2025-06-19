#!/usr/bin/env node

/**
 * Agent Log Updater
 * Allows both Augment Agent and Claude Code to update the shared log file
 * Usage: node scripts/update-agent-log.js [action] [data]
 */

const fs = require('fs');
const path = require('path');

class AgentLogUpdater {
    constructor() {
        this.logPath = path.join(__dirname, '../logs/mcp-agent-status.json');
        this.backupDir = path.join(__dirname, '../logs/backups');
        
        // Ensure backup directory exists
        if (!fs.existsSync(this.backupDir)) {
            fs.mkdirSync(this.backupDir, { recursive: true });
        }
    }

    /**
     * Load current log data
     */
    loadLog() {
        try {
            const data = fs.readFileSync(this.logPath, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.error('Failed to load log file:', error.message);
            return null;
        }
    }

    /**
     * Save log data with backup
     */
    saveLog(data) {
        try {
            // Create backup
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const backupPath = path.join(this.backupDir, `mcp-agent-status-${timestamp}.json`);
            
            if (fs.existsSync(this.logPath)) {
                fs.copyFileSync(this.logPath, backupPath);
            }

            // Update timestamp
            data.metadata.lastUpdated = new Date().toISOString();

            // Save updated log
            fs.writeFileSync(this.logPath, JSON.stringify(data, null, 2));
            console.log('✅ Log updated successfully');
            return true;
        } catch (error) {
            console.error('❌ Failed to save log file:', error.message);
            return false;
        }
    }

    /**
     * Update MCP server status
     */
    updateMcpServer(serverName, status, error = null) {
        const log = this.loadLog();
        if (!log) return false;

        if (!log.mcpServers.servers[serverName]) {
            console.error(`Server ${serverName} not found in registry`);
            return false;
        }

        log.mcpServers.servers[serverName].status = status;
        log.mcpServers.servers[serverName].lastCheck = new Date().toISOString();
        
        if (error) {
            log.mcpServers.servers[serverName].error = error;
            log.mcpServers.servers[serverName].repairAttempts += 1;
        } else if (status === 'WORKING') {
            log.mcpServers.servers[serverName].error = null;
            log.mcpServers.servers[serverName].lastWorking = new Date().toISOString();
            log.mcpServers.servers[serverName].repairAttempts = 0;
        }

        // Update overall MCP status
        const workingServers = Object.values(log.mcpServers.servers).filter(s => s.status === 'WORKING').length;
        const totalServers = Object.keys(log.mcpServers.servers).length;
        
        log.mcpServers.totalWorking = workingServers;
        log.mcpServers.totalBroken = totalServers - workingServers;
        log.mcpServers.status = workingServers === totalServers ? 'HEALTHY' : 
                               workingServers > 0 ? 'DEGRADED' : 'BROKEN';

        return this.saveLog(log);
    }

    /**
     * Update agent status
     */
    updateAgent(agentId, status, health = null, issues = []) {
        const log = this.loadLog();
        if (!log) return false;

        // Find agent by ID
        let agentKey = null;
        for (const [key, agent] of Object.entries(log.registeredAgents.agents)) {
            if (agent.id === agentId) {
                agentKey = key;
                break;
            }
        }

        if (!agentKey) {
            console.error(`Agent ${agentId} not found in registry`);
            return false;
        }

        log.registeredAgents.agents[agentKey].status = status;
        log.registeredAgents.agents[agentKey].lastActivity = new Date().toISOString();
        
        if (health) {
            log.registeredAgents.agents[agentKey].health = health;
        }
        
        if (issues.length > 0) {
            log.registeredAgents.agents[agentKey].issues = issues;
        }

        // Update overall agent status
        const activeAgents = Object.values(log.registeredAgents.agents).filter(a => a.status === 'ACTIVE').length;
        const completedAgents = Object.values(log.registeredAgents.agents).filter(a => a.status === 'COMPLETED').length;
        const totalAgents = Object.keys(log.registeredAgents.agents).length;
        
        log.registeredAgents.activeAgents = activeAgents;
        log.registeredAgents.completedAgents = completedAgents;
        log.registeredAgents.inactiveAgents = totalAgents - activeAgents - completedAgents;

        return this.saveLog(log);
    }

    /**
     * Add system issue
     */
    addSystemIssue(id, severity, description, impact, recommendedAction) {
        const log = this.loadLog();
        if (!log) return false;

        const issue = {
            id,
            severity,
            description,
            impact,
            recommendedAction,
            timestamp: new Date().toISOString()
        };

        if (severity === 'HIGH' || severity === 'CRITICAL') {
            log.systemHealth.criticalIssues.push(issue);
        } else {
            log.systemHealth.warnings.push(issue);
        }

        // Update overall health
        if (log.systemHealth.criticalIssues.length > 0) {
            log.systemHealth.overall = 'CRITICAL';
        } else if (log.systemHealth.warnings.length > 0) {
            log.systemHealth.overall = 'DEGRADED';
        } else {
            log.systemHealth.overall = 'HEALTHY';
        }

        return this.saveLog(log);
    }

    /**
     * Resolve system issue
     */
    resolveSystemIssue(issueId, resolution) {
        const log = this.loadLog();
        if (!log) return false;

        // Remove from critical issues
        log.systemHealth.criticalIssues = log.systemHealth.criticalIssues.filter(issue => {
            if (issue.id === issueId) {
                console.log(`✅ Resolved critical issue: ${issue.description}`);
                return false;
            }
            return true;
        });

        // Remove from warnings
        log.systemHealth.warnings = log.systemHealth.warnings.filter(issue => {
            if (issue.id === issueId) {
                console.log(`✅ Resolved warning: ${issue.description}`);
                return false;
            }
            return true;
        });

        // Update overall health
        if (log.systemHealth.criticalIssues.length === 0 && log.systemHealth.warnings.length === 0) {
            log.systemHealth.overall = 'HEALTHY';
        } else if (log.systemHealth.criticalIssues.length === 0) {
            log.systemHealth.overall = 'DEGRADED';
        }

        return this.saveLog(log);
    }

    /**
     * Request handoff between agents
     */
    requestHandoff(fromAgent, toAgent, reason, task = null) {
        const log = this.loadLog();
        if (!log) return false;

        const handoffRequest = {
            from: fromAgent,
            to: toAgent,
            reason,
            task,
            timestamp: new Date().toISOString(),
            status: 'PENDING'
        };

        if (!log.handoffs) {
            log.handoffs = [];
        }

        log.handoffs.push(handoffRequest);

        // Update next steps
        log.nextSteps = {
            assignedTo: toAgent,
            dueBy: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour from now
            tasks: task ? [task] : [`Handle handoff from ${fromAgent}: ${reason}`],
            handoffId: handoffRequest.timestamp
        };

        console.log(`🔄 Handoff requested: ${fromAgent} → ${toAgent}`);
        console.log(`   Reason: ${reason}`);
        
        return this.saveLog(log);
    }

    /**
     * Accept handoff
     */
    acceptHandoff(agentName, handoffId) {
        const log = this.loadLog();
        if (!log) return false;

        if (log.handoffs) {
            const handoff = log.handoffs.find(h => h.timestamp === handoffId);
            if (handoff && handoff.to === agentName) {
                handoff.status = 'ACCEPTED';
                handoff.acceptedAt = new Date().toISOString();
                console.log(`✅ Handoff accepted by ${agentName}`);
                return this.saveLog(log);
            }
        }

        console.error('Handoff not found or not assigned to this agent');
        return false;
    }

    /**
     * Get current status summary
     */
    getStatusSummary() {
        const log = this.loadLog();
        if (!log) return null;

        return {
            timestamp: new Date().toISOString(),
            mcpServers: {
                status: log.mcpServers.status,
                working: log.mcpServers.totalWorking,
                broken: log.mcpServers.totalBroken
            },
            agents: {
                active: log.registeredAgents.activeAgents,
                completed: log.registeredAgents.completedAgents,
                inactive: log.registeredAgents.inactiveAgents
            },
            systemHealth: log.systemHealth.overall,
            criticalIssues: log.systemHealth.criticalIssues.length,
            warnings: log.systemHealth.warnings.length,
            pendingHandoffs: log.handoffs ? log.handoffs.filter(h => h.status === 'PENDING').length : 0
        };
    }
}

// CLI interface
if (require.main === module) {
    const updater = new AgentLogUpdater();
    const args = process.argv.slice(2);
    const action = args[0];

    switch (action) {
        case 'status':
            const summary = updater.getStatusSummary();
            console.log('📊 System Status Summary:');
            console.log(JSON.stringify(summary, null, 2));
            break;

        case 'update-mcp':
            const [serverName, status, error] = args.slice(1);
            if (updater.updateMcpServer(serverName, status, error)) {
                console.log(`✅ Updated MCP server ${serverName} to ${status}`);
            }
            break;

        case 'update-agent':
            const [agentId, agentStatus, health] = args.slice(1);
            if (updater.updateAgent(agentId, agentStatus, health)) {
                console.log(`✅ Updated agent ${agentId} to ${agentStatus}`);
            }
            break;

        case 'add-issue':
            const [issueId, severity, description, impact, action] = args.slice(1);
            if (updater.addSystemIssue(issueId, severity, description, impact, action)) {
                console.log(`✅ Added system issue: ${issueId}`);
            }
            break;

        case 'resolve-issue':
            const [resolveId, resolution] = args.slice(1);
            if (updater.resolveSystemIssue(resolveId, resolution)) {
                console.log(`✅ Resolved issue: ${resolveId}`);
            }
            break;

        case 'handoff':
            const [fromAgent, toAgent, reason, task] = args.slice(1);
            if (updater.requestHandoff(fromAgent, toAgent, reason, task)) {
                console.log(`✅ Handoff requested: ${fromAgent} → ${toAgent}`);
            }
            break;

        case 'accept-handoff':
            const [agentName, handoffId] = args.slice(1);
            if (updater.acceptHandoff(agentName, handoffId)) {
                console.log(`✅ Handoff accepted by ${agentName}`);
            }
            break;

        default:
            console.log('Usage: node update-agent-log.js [action] [args...]');
            console.log('Actions:');
            console.log('  status                                    - Show system status');
            console.log('  update-mcp [server] [status] [error]     - Update MCP server status');
            console.log('  update-agent [id] [status] [health]      - Update agent status');
            console.log('  add-issue [id] [severity] [desc] [impact] [action] - Add system issue');
            console.log('  resolve-issue [id] [resolution]          - Resolve system issue');
            console.log('  handoff [from] [to] [reason] [task]      - Request agent handoff');
            console.log('  accept-handoff [agent] [handoffId]       - Accept handoff');
            break;
    }
}

module.exports = AgentLogUpdater;
