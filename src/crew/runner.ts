// CrewAI Orchestration Runner for Tarot Deck Generation
// Handles task execution, health monitoring, and a_mem logging
import { dataOracle, uiEnchanter, cardWeaver, qualityGuardian } from './agents';
import fs from 'fs/promises';
import path from 'path';
export interface CrewTask {
  id: string;
  name: string;
  agent: string;
  description: string;
  dependencies?: string[];
  params?: any;
}
export interface CrewResult {
  taskId: string;
  success: boolean;
  data?: any;
  error?: string;
  duration: number;
  timestamp: string;
}
export interface CrewOperationLog {
  operationId: string;
  taskName: string;
  results: CrewResult[];
  totalDuration: number;
  success: boolean;
  timestamp: string;
}
class CrewRunner {
  private logDir: string;
  private memLogFile: string;
  constructor() {
    this.logDir = path.join(process.cwd(), 'crew_memory_logs');
    this.memLogFile = path.join(process.cwd(), 'A-mem', 'crew-operations.log');
  }
  /**
   * Initialize logging directories
   */
  async initializeLogging(): Promise<void> {
    try {
      await fs.mkdir(this.logDir, { recursive: true });
      await fs.mkdir(path.dirname(this.memLogFile), { recursive: true });
      
      // Create initial log entry
      await this.logToMemory({
        event: 'crew_runner_initialized',
        timestamp: new Date().toISOString(),
        message: 'CrewAI orchestration system initialized'
      });
    } catch (error) {
      console.error('Failed to initialize logging:', error);
    }
  }
  /**
   * Log events to a_mem system
   */
  private async logToMemory(logEntry: any): Promise<void> {
    try {
      const logLine = JSON.stringify(logEntry) + '\n';
      await fs.appendFile(this.memLogFile, logLine);
    } catch (error) {
      console.error('Failed to log to a_mem:', error);
    }
  }
  /**
   * Execute a single task with timing and logging
   */
  private async executeTask(task: CrewTask): Promise<CrewResult> {
    const startTime = Date.now();
    const timestamp = new Date().toISOString();
    try {
      await this.logToMemory({
        event: 'task_started',
        taskId: task.id,
        agent: task.agent,
        timestamp
      });
      let result;
      switch (task.agent) {
        case 'DataOracle':
          if (task.name === 'generateBlueprint') {
            result = await dataOracle.generateThematicBlueprint();
          } else if (task.name === 'storeDeckMetadata') {
            result = await dataOracle.storeDeckMetadata(task.params.blueprint);
          }
          break;
        
        case 'UIEnchanter':
          if (task.name === 'generatePrompts') {
            result = await uiEnchanter.generateCardPrompts(task.params.blueprint);
          }
          break;
        
        case 'CardWeaver':
          if (task.name === 'generateCards') {
            result = await cardWeaver.generateCardData(task.params.blueprint, task.params.prompts);
          }
          break;
        
        case 'QualityGuardian':
          if (task.name === 'validateDeck') {
            result = await qualityGuardian.validateDeck(task.params.cards);
          } else if (task.name === 'storeDeck') {
            result = await qualityGuardian.storeValidatedDeck(task.params.deckId, task.params.cards);
          }
          break;
        
        default:
          throw new Error(`Unknown agent: ${task.agent}`);
      }
      if (!result) {
        throw new Error(`Agent ${task.agent} returned no result for task ${task.name}`);
      }
      const duration = Date.now() - startTime;
      const taskResult: CrewResult = {
        taskId: task.id,
        success: result.success,
        data: result.data,
        error: result.error,
        duration,
        timestamp
      };
      await this.logToMemory({
        event: 'task_completed',
        taskId: task.id,
        agent: task.agent,
        success: result.success,
        duration,
        timestamp
      });
      return taskResult;
    } catch (error) {
      const duration = Date.now() - startTime;
      const taskResult: CrewResult = {
        taskId: task.id,
        success: false,
        error: error instanceof Error ? error.message : String(error),
        duration,
        timestamp
      };
      await this.logToMemory({
        event: 'task_failed',
        taskId: task.id,
        agent: task.agent,
        error: taskResult.error,
        duration,
        timestamp
      });
      return taskResult;
    }
  }
  /**
   * Main crew execution method
   */
  async runCrew(taskName: string, params: any = {}): Promise<CrewOperationLog> {
    const operationId = `crew_${Date.now()}`;
    const startTime = Date.now();
    const timestamp = new Date().toISOString();
    await this.initializeLogging();
    await this.logToMemory({
      event: 'crew_operation_started',
      operationId,
      taskName,
      timestamp
    });
    try {
      const results: CrewResult[] = [];
      const operationData: any = { ...params };
      switch (taskName) {
        case 'generateCrewTarotDeck':
          results.push(...await this.executeCrewTarotDeckGeneration(operationData));
          break;
        
        case 'validateExistingDeck':
          results.push(...await this.validateExistingDeck(operationData));
          break;
        
        case 'healthCheck':
          results.push(await this.performHealthCheck());
          break;
        
        default:
          throw new Error(`Unknown task: ${taskName}`);
      }
      const totalDuration = Date.now() - startTime;
      const allSuccessful = results.every(r => r.success);
      const operationLog: CrewOperationLog = {
        operationId,
        taskName,
        results,
        totalDuration,
        success: allSuccessful,
        timestamp
      };
      // Store operation log
      const logFile = path.join(this.logDir, `${operationId}.json`);
      await fs.writeFile(logFile, JSON.stringify(operationLog, null, 2));
      await this.logToMemory({
        event: 'crew_operation_completed',
        operationId,
        taskName,
        success: allSuccessful,
        totalDuration,
        resultsCount: results.length,
        timestamp
      });
      return operationLog;
    } catch (error) {
      const totalDuration = Date.now() - startTime;
      const operationLog: CrewOperationLog = {
        operationId,
        taskName,
        results: [],
        totalDuration,
        success: false,
        timestamp
      };
      await this.logToMemory({
        event: 'crew_operation_failed',
        operationId,
        taskName,
        error: error instanceof Error ? error.message : String(error),
        totalDuration,
        timestamp
      });
      throw error;
    }
  }
  /**
   * Execute the complete Crew Tarot Deck generation process
   */
  private async executeCrewTarotDeckGeneration(params: any): Promise<CrewResult[]> {
    const tasks: CrewTask[] = [
      {
        id: 'blueprint_generation',
        name: 'generateBlueprint',
        agent: 'DataOracle',
        description: 'Generate thematic blueprint for Crew Tarot Deck'
      },
      {
        id: 'store_metadata',
        name: 'storeDeckMetadata',
        agent: 'DataOracle',
        description: 'Store deck metadata in database',
        dependencies: ['blueprint_generation']
      },
      {
        id: 'generate_prompts',
        name: 'generatePrompts',
        agent: 'UIEnchanter',
        description: 'Generate AI art prompts for all cards',
        dependencies: ['blueprint_generation']
      },
      {
        id: 'generate_cards',
        name: 'generateCards',
        agent: 'CardWeaver',
        description: 'Generate card data structures',
        dependencies: ['blueprint_generation', 'generate_prompts']
      },
      {
        id: 'validate_deck',
        name: 'validateDeck',
        agent: 'QualityGuardian',
        description: 'Validate complete deck structure',
        dependencies: ['generate_cards']
      },
      {
        id: 'store_deck',
        name: 'storeDeck',
        agent: 'QualityGuardian',
        description: 'Store validated deck in database',
        dependencies: ['validate_deck']
      }
    ];
    const results: CrewResult[] = [];
    const taskData: any = {};
    // Execute tasks in dependency order
    for (const task of tasks) {
      // Check dependencies
      if (task.dependencies) {
        const missingDeps = task.dependencies.filter(dep => 
          !results.find(r => r.taskId === dep && r.success)
        );
        if (missingDeps.length > 0) {
          results.push({
            taskId: task.id,
            success: false,
            error: `Missing dependencies: ${missingDeps.join(', ')}`,
            duration: 0,
            timestamp: new Date().toISOString()
          });
          continue;
        }
      }
      // Prepare task parameters
      const taskParams: any = { ...task.params };
      
      if (task.id === 'store_metadata' || task.id === 'generate_prompts' || task.id === 'generate_cards') {
        const blueprintResult = results.find(r => r.taskId === 'blueprint_generation');
        if (blueprintResult?.data) {
          taskParams.blueprint = blueprintResult.data;
        }
      }
      
      if (task.id === 'generate_cards') {
        const promptsResult = results.find(r => r.taskId === 'generate_prompts');
        if (promptsResult?.data) {
          taskParams.prompts = promptsResult.data;
        }
      }
      
      if (task.id === 'validate_deck' || task.id === 'store_deck') {
        const cardsResult = results.find(r => r.taskId === 'generate_cards');
        if (cardsResult?.data?.cards) {
          taskParams.cards = cardsResult.data.cards;
        }
        if (task.id === 'store_deck') {
          taskParams.deckId = '00000000-0000-0000-0000-000000000002';
        }
      }
      // Execute task
      const taskWithParams = { ...task, params: taskParams };
      const result = await this.executeTask(taskWithParams);
      results.push(result);
      // Stop execution if critical task fails
      if (!result.success && ['blueprint_generation', 'generate_cards', 'validate_deck'].includes(task.id)) {
        await this.logToMemory({
          event: 'crew_operation_aborted',
          reason: `Critical task ${task.id} failed`,
          error: result.error,
          timestamp: new Date().toISOString()
        });
        break;
      }
    }
    return results;
  }
  /**
   * Validate an existing deck
   */
  private async validateExistingDeck(params: { cards: any[] }): Promise<CrewResult[]> {
    const task: CrewTask = {
      id: 'validate_existing',
      name: 'validateDeck',
      agent: 'QualityGuardian',
      description: 'Validate existing deck structure',
      params
    };
    return [await this.executeTask(task)];
  }
  /**
   * Perform system health check
   */
  private async performHealthCheck(): Promise<CrewResult> {
    const startTime = Date.now();
    
    try {
      // Check agent availability
      const agentTests = [
        { name: 'DataOracle', test: () => dataOracle.generateThematicBlueprint() },
        { name: 'UIEnchanter', test: () => uiEnchanter.generateCardPrompts({}) },
        { name: 'CardWeaver', test: () => cardWeaver.generateCardData({}, {}) },
        { name: 'QualityGuardian', test: () => qualityGuardian.validateDeck([]) }
      ];
      const healthResults = await Promise.allSettled(
        agentTests.map(async (agent) => {
          try {
            await agent.test();
            return { agent: agent.name, status: 'healthy' };
          } catch (error) {
            return { agent: agent.name, status: 'error', error: String(error) };
          }
        })
      );
      const duration = Date.now() - startTime;
      
      return {
        taskId: 'health_check',
        success: true,
        data: {
          status: 'Operational',
          agents: healthResults.map(r => r.status === 'fulfilled' ? r.value : { error: r.reason }),
          systemTime: new Date().toISOString()
        },
        duration,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      
      return {
        taskId: 'health_check',
        success: false,
        error: String(error),
        duration,
        timestamp: new Date().toISOString()
      };
    }
  }
  /**
   * Autonomous health monitoring (for background operation)
   */
  async monitorHealth(): Promise<void> {
    try {
      const healthResult = await this.performHealthCheck();
      
      await this.logToMemory({
        event: 'health_monitor',
        status: healthResult.success ? 'healthy' : 'unhealthy',
        data: healthResult.data,
        error: healthResult.error,
        timestamp: new Date().toISOString()
      });
      // If health check fails, could trigger alerts here
      if (!healthResult.success) {
        console.warn('Health check failed:', healthResult.error);
      }
    } catch (error) {
      await this.logToMemory({
        event: 'health_monitor_error',
        error: String(error),
        timestamp: new Date().toISOString()
      });
    }
  }
}
// Export singleton instance
export const crewRunner = new CrewRunner();
// Auto-start health monitoring in autonomous mode
if (process.env.AUTONOMOUS_MODE === 'true') {
  // Health check every 5 minutes for local development
  // For production, use Vercel cron or similar
  setInterval(async () => {
    await crewRunner.monitorHealth();
  }, 5 * 60 * 1000);
  
  console.log('🤖 CrewAI autonomous health monitoring started');
}
