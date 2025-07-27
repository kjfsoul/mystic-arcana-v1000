#!/usr/bin/env tsx
/**
 * Test Script for CrewAI Tarot Deck Generation System
 * 
 * This script tests the complete crew orchestration system for generating
 * the Crew Tarot Deck without requiring the full Next.js server.
 * 
 * Usage:
 *   npx tsx scripts/test-crew-system.ts
 *   npm run test:crew
 */

import { crewRunner } from '../src/crew/runner';
import { dataOracle, uiEnchanter, cardWeaver, qualityGuardian } from '../src/crew/agents';

interface TestResult {
  name: string;
  success: boolean;
  duration: number;
  error?: string;
  data?: any;
}

class CrewSystemTester {
  private results: TestResult[] = [];

  async runAllTests(): Promise<void> {
    console.log('🧪 Starting CrewAI System Tests\n');

    // Individual agent tests
    await this.testAgent('DataOracle Blueprint Generation', () => 
      dataOracle.generateThematicBlueprint()
    );

    const blueprintResult = this.getLastSuccessfulResult();
    if (blueprintResult?.data) {
      await this.testAgent('UIEnchanter Prompt Generation', () => 
        uiEnchanter.generateCardPrompts(blueprintResult.data)
      );

      const promptsResult = this.getLastSuccessfulResult();
      if (promptsResult?.data) {
        await this.testAgent('CardWeaver Card Generation', () => 
          cardWeaver.generateCardData(blueprintResult.data, promptsResult.data)
        );

        const cardsResult = this.getLastSuccessfulResult();
        if (cardsResult?.data?.cards) {
          await this.testAgent('QualityGuardian Validation', () => 
            qualityGuardian.validateDeck(cardsResult.data.cards)
          );
        }
      }
    }

    // Full crew orchestration test
    await this.testCrew('Complete Crew Tarot Deck Generation', 
      'generateCrewTarotDeck', {}
    );

    // Health check test
    await this.testCrew('Health Check', 'healthCheck', {});

    // Display results
    this.displayResults();
  }

  private async testAgent(testName: string, testFn: () => Promise<any>): Promise<void> {
    const startTime = Date.now();
    
    try {
      console.log(`🔄 Running: ${testName}`);
      const result = await testFn();
      const duration = Date.now() - startTime;

      if (result.success) {
        console.log(`✅ Passed: ${testName} (${duration}ms)`);
        this.results.push({
          name: testName,
          success: true,
          duration,
          data: result.data
        });
      } else {
        console.log(`❌ Failed: ${testName} - ${result.error}`);
        this.results.push({
          name: testName,
          success: false,
          duration,
          error: result.error
        });
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMsg = error instanceof Error ? error.message : String(error);
      
      console.log(`💥 Error: ${testName} - ${errorMsg}`);
      this.results.push({
        name: testName,
        success: false,
        duration,
        error: errorMsg
      });
    }
    
    console.log(''); // Empty line for readability
  }

  private async testCrew(testName: string, taskName: string, params: any): Promise<void> {
    const startTime = Date.now();
    
    try {
      console.log(`🚀 Running: ${testName}`);
      const result = await crewRunner.runCrew(taskName, params);
      const duration = Date.now() - startTime;

      if (result.success) {
        console.log(`✅ Passed: ${testName} (${duration}ms)`);
        console.log(`   └─ Completed ${result.results.length} tasks`);
        
        // Show task summary
        result.results.forEach(taskResult => {
          const status = taskResult.success ? '✅' : '❌';
          console.log(`      ${status} ${taskResult.taskId} (${taskResult.duration}ms)`);
        });

        this.results.push({
          name: testName,
          success: true,
          duration,
          data: result
        });
      } else {
        console.log(`❌ Failed: ${testName}`);
        this.results.push({
          name: testName,
          success: false,
          duration,
          error: 'Crew operation failed'
        });
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMsg = error instanceof Error ? error.message : String(error);
      
      console.log(`💥 Error: ${testName} - ${errorMsg}`);
      this.results.push({
        name: testName,
        success: false,
        duration,
        error: errorMsg
      });
    }
    
    console.log(''); // Empty line for readability
  }

  private getLastSuccessfulResult(): TestResult | undefined {
    for (let i = this.results.length - 1; i >= 0; i--) {
      if (this.results[i].success) {
        return this.results[i];
      }
    }
    return undefined;
  }

  private displayResults(): void {
    const totalTests = this.results.length;
    const passedTests = this.results.filter(r => r.success).length;
    const failedTests = totalTests - passedTests;
    const totalDuration = this.results.reduce((sum, r) => sum + r.duration, 0);

    console.log('=' .repeat(60));
    console.log('🏁 CrewAI System Test Results');
    console.log('=' .repeat(60));
    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed: ${passedTests} ✅`);
    console.log(`Failed: ${failedTests} ${failedTests > 0 ? '❌' : ''}`);
    console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
    console.log(`Total Duration: ${totalDuration}ms`);
    console.log('');

    if (failedTests > 0) {
      console.log('Failed Tests:');
      this.results
        .filter(r => !r.success)
        .forEach(r => {
          console.log(`❌ ${r.name}: ${r.error}`);
        });
      console.log('');
    }

    // Show detailed results for deck generation
    const deckGenResult = this.results.find(r => 
      r.name.includes('Complete Crew Tarot Deck Generation') && r.success
    );

    if (deckGenResult?.data) {
      console.log('🃏 Deck Generation Details:');
      const operation = deckGenResult.data;
      console.log(`Operation ID: ${operation.operationId}`);
      console.log(`Total Duration: ${operation.totalDuration}ms`);
      console.log(`Tasks Completed: ${operation.results.length}`);
      
      // Show cards generated if available
      const cardGenTask = operation.results.find((r: any) => r.taskId === 'generate_cards');
      if (cardGenTask?.data?.totalCards) {
        console.log(`Total Cards Generated: ${cardGenTask.data.totalCards}`);
      }

      // Show validation results if available
      const validationTask = operation.results.find((r: any) => r.taskId === 'validate_deck');
      if (validationTask?.data?.validationResults) {
        const validation = validationTask.data.validationResults;
        console.log(`Validation: ${validation.issues.length === 0 ? 'PASSED' : 'FAILED'}`);
        if (validation.issues.length > 0) {
          console.log(`Issues Found: ${validation.issues.length}`);
          validation.issues.slice(0, 3).forEach((issue: string) => {
            console.log(`  - ${issue}`);
          });
        }
      }
    }

    console.log('');
    console.log('📊 For detailed logs, check:');
    console.log('  - A-mem/crew-operations.log (memory logs)');
    console.log('  - crew_memory_logs/ (operation logs)');
    console.log('  - Or use: curl http://localhost:3000/api/crew/logs');
  }
}

// Run tests if called directly
async function main() {
  const tester = new CrewSystemTester();
  
  try {
    await tester.runAllTests();
    process.exit(0);
  } catch (error) {
    console.error('💥 Test suite failed:', error);
    process.exit(1);
  }
}

// Check if this script is being run directly
if (require.main === module) {
  main();
}

export { CrewSystemTester };