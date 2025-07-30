/**
 * Progressive Reveal System Validation Test
 * 
 * This test validates the complete progressive reveal system including:
 * - Engagement level tracking and incrementation
 * - Threshold calculations and level-ups
 * - Database integration (mocked)
 * - Visual progression system
 */

import { PersonaLearnerAgent } from '../src/agents/PersonaLearner';
import fs from 'fs/promises';
import path from 'path';

interface TestResult {
  test_name: string;
  passed: boolean;
  details: string;
  execution_time: number;
}

class ProgressiveRevealTester {
  private results: TestResult[] = [];
  private personaLearner: PersonaLearnerAgent;
  private testUserId = 'test_progressive_reveal_user';

  constructor() {
    this.personaLearner = new PersonaLearnerAgent();
  }

  async runCompleteTest(): Promise<{
    success: boolean;
    total_tests: number;
    passed_tests: number;
    results: TestResult[];
  }> {
    console.log('🎭 Starting Progressive Reveal System Validation...\n');

    // Test 1: Initial engagement level setup
    await this.testInitialEngagementLevel();

    // Test 2: Engagement metrics calculation
    await this.testEngagementMetricsCalculation();

    // Test 3: Level threshold validation
    await this.testLevelThresholds();

    // Test 4: Progressive level-up simulation
    await this.testProgressiveLevelUp();

    // Test 5: Visual asset validation
    await this.testVisualAssetAvailability();

    // Test 6: Engagement analysis functionality
    await this.testEngagementAnalysis();

    // Test 7: Edge cases and error handling
    await this.testEdgeCases();

    const passedTests = this.results.filter(r => r.passed).length;
    const success = passedTests === this.results.length;

    console.log(`\n🎯 Progressive Reveal Test Summary:`);
    console.log(`   Total Tests: ${this.results.length}`);
    console.log(`   Passed: ${passedTests}`);
    console.log(`   Failed: ${this.results.length - passedTests}`);
    console.log(`   Success Rate: ${((passedTests / this.results.length) * 100).toFixed(1)}%`);

    if (success) {
      console.log('   ✅ All progressive reveal tests PASSED');
    } else {
      console.log('   ❌ Some progressive reveal tests FAILED');
    }

    // Output detailed results
    console.log('\n📊 Detailed Results:');
    this.results.forEach(result => {
      const status = result.passed ? '✅' : '❌';
      console.log(`   ${status} ${result.test_name} (${result.execution_time}ms)`);
      if (!result.passed) {
        console.log(`      └─ ${result.details}`);
      }
    });

    return {
      success,
      total_tests: this.results.length,
      passed_tests: passedTests,
      results: this.results
    };
  }

  /**
   * Test 1: Initial engagement level setup
   */
  private async testInitialEngagementLevel(): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Reset test user to level 1
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(`engagement_level_${this.testUserId}`, '1');
      }

      // Check initial engagement level
      const result = await this.personaLearner.checkAndIncrementEngagementLevel(this.testUserId);
      
      const passed = result.newLevel === 1 && !result.levelIncreased;

      this.results.push({
        test_name: 'Initial Engagement Level Setup',
        passed,
        details: passed 
          ? `Initial level correctly set to ${result.newLevel}`
          : `Expected level 1, got ${result.newLevel}. Level increased: ${result.levelIncreased}`,
        execution_time: Date.now() - startTime
      });

    } catch (error) {
      this.results.push({
        test_name: 'Initial Engagement Level Setup',
        passed: false,
        details: `Initial setup failed: ${error}`,
        execution_time: Date.now() - startTime
      });
    }
  }

  /**
   * Test 2: Engagement metrics calculation
   */
  private async testEngagementMetricsCalculation(): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Create mock memory data for testing
      await this.createMockMemoryData(5, 15, 3); // 5 readings, 15 turns, 3 questions

      // Get engagement analysis
      const analysis = await this.personaLearner.getEngagementAnalysis(this.testUserId);
      
      const hasMetrics = analysis.metrics && 
                        typeof analysis.metrics.completedReadings === 'number' &&
                        typeof analysis.metrics.conversationTurns === 'number' &&
                        typeof analysis.metrics.questionsAnswered === 'number';

      this.results.push({
        test_name: 'Engagement Metrics Calculation',
        passed: hasMetrics,
        details: hasMetrics 
          ? `Metrics calculated: ${analysis.metrics.completedReadings} readings, ${analysis.metrics.conversationTurns} turns, ${analysis.metrics.questionsAnswered} questions`
          : 'Failed to calculate engagement metrics properly',
        execution_time: Date.now() - startTime
      });

    } catch (error) {
      this.results.push({
        test_name: 'Engagement Metrics Calculation',
        passed: false,
        details: `Metrics calculation failed: ${error}`,
        execution_time: Date.now() - startTime
      });
    }
  }

  /**
   * Test 3: Level threshold validation
   */
  private async testLevelThresholds(): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Test progression from level 1 to 2 (3 readings, 10 turns, 2 questions)
      await this.createMockMemoryData(3, 10, 2);
      
      const result = await this.personaLearner.checkAndIncrementEngagementLevel(this.testUserId);
      
      const shouldLevelUp = result.newLevel >= 2;

      this.results.push({
        test_name: 'Level Threshold Validation',
        passed: shouldLevelUp,
        details: shouldLevelUp 
          ? `Successfully leveled up to ${result.newLevel} with threshold criteria met`
          : `Did not level up. Current level: ${result.newLevel}`,
        execution_time: Date.now() - startTime
      });

    } catch (error) {
      this.results.push({
        test_name: 'Level Threshold Validation',
        passed: false,
        details: `Threshold validation failed: ${error}`,
        execution_time: Date.now() - startTime
      });
    }
  }

  /**
   * Test 4: Progressive level-up simulation
   */
  private async testProgressiveLevelUp(): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Reset to level 1
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(`engagement_level_${this.testUserId}`, '1');
      }

      const levelProgression = [];
      
      // Simulate progressive engagement
      const simulationSteps = [
        { readings: 0, turns: 0, questions: 0, expectedMinLevel: 1 },
        { readings: 3, turns: 10, questions: 2, expectedMinLevel: 2 },
        { readings: 10, turns: 30, questions: 8, expectedMinLevel: 3 },
        { readings: 25, turns: 75, questions: 20, expectedMinLevel: 4 },
        { readings: 50, turns: 150, questions: 40, expectedMinLevel: 5 }
      ];

      for (const step of simulationSteps) {
        await this.createMockMemoryData(step.readings, step.turns, step.questions);
        const result = await this.personaLearner.checkAndIncrementEngagementLevel(this.testUserId);
        
        levelProgression.push({
          step: step.expectedMinLevel,
          achieved: result.newLevel,
          expected: step.expectedMinLevel
        });
        
        // Update stored level for next iteration
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(`engagement_level_${this.testUserId}`, result.newLevel.toString());
        }
      }

      // Validate progression
      const validProgression = levelProgression.every(p => p.achieved >= p.expected);
      const finalLevel = levelProgression[levelProgression.length - 1].achieved;

      this.results.push({
        test_name: 'Progressive Level-Up Simulation',
        passed: validProgression && finalLevel >= 4, // Should reach at least level 4
        details: validProgression 
          ? `Progressive level-up successful. Final level: ${finalLevel}`
          : `Invalid progression: ${JSON.stringify(levelProgression)}`,
        execution_time: Date.now() - startTime
      });

    } catch (error) {
      this.results.push({
        test_name: 'Progressive Level-Up Simulation',
        passed: false,
        details: `Progressive level-up test failed: ${error}`,
        execution_time: Date.now() - startTime
      });
    }
  }

  /**
   * Test 5: Visual asset availability
   */
  private async testVisualAssetAvailability(): Promise<void> {
    const startTime = Date.now();
    
    try {
      const assetsDir = path.join(process.cwd(), 'public', 'images', 'readers', 'sophia');
      const requiredLevels = [1, 2, 3, 4, 5];
      const missingAssets = [];

      for (const level of requiredLevels) {
        const assetPath = path.join(assetsDir, `level_${level}.png`);
        try {
          await fs.access(assetPath);
        } catch {
          missingAssets.push(`level_${level}.png`);
        }
      }

      const allAssetsPresent = missingAssets.length === 0;

      this.results.push({
        test_name: 'Visual Asset Availability',
        passed: allAssetsPresent,
        details: allAssetsPresent 
          ? 'All 5 visual asset levels are available'
          : `Missing assets: ${missingAssets.join(', ')}`,
        execution_time: Date.now() - startTime
      });

    } catch (error) {
      this.results.push({
        test_name: 'Visual Asset Availability',
        passed: false,
        details: `Asset availability check failed: ${error}`,
        execution_time: Date.now() - startTime
      });
    }
  }

  /**
   * Test 6: Engagement analysis functionality
   */
  private async testEngagementAnalysis(): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Create comprehensive mock data
      await this.createMockMemoryData(15, 45, 12);
      
      const analysis = await this.personaLearner.getEngagementAnalysis(this.testUserId);
      
      const hasRequiredFields = analysis.currentLevel && 
                               analysis.levelName && 
                               analysis.metrics && 
                               typeof analysis.progressToNext === 'number';

      const hasValidProgress = analysis.progressToNext !== undefined && 
                              analysis.progressToNext >= 0 && 
                              analysis.progressToNext <= 100;

      const passed = hasRequiredFields && hasValidProgress;

      this.results.push({
        test_name: 'Engagement Analysis Functionality',
        passed,
        details: passed 
          ? `Analysis complete: Level ${analysis.currentLevel} (${analysis.levelName}), ${analysis.progressToNext?.toFixed(1)}% to next`
          : 'Engagement analysis missing required fields or invalid data',
        execution_time: Date.now() - startTime
      });

    } catch (error) {
      this.results.push({
        test_name: 'Engagement Analysis Functionality',
        passed: false,
        details: `Engagement analysis failed: ${error}`,
        execution_time: Date.now() - startTime
      });
    }
  }

  /**
   * Test 7: Edge cases and error handling
   */
  private async testEdgeCases(): Promise<void> {
    const startTime = Date.now();
    
    try {
      let passedCount = 0;
      let totalCount = 0;

      // Test 1: Guest user (empty userId)
      totalCount++;
      const guestResult = await this.personaLearner.checkAndIncrementEngagementLevel('');
      if (!guestResult.levelIncreased && guestResult.newLevel === 1) {
        passedCount++;
      }

      // Test 2: Invalid user ID
      totalCount++;
      const invalidResult = await this.personaLearner.checkAndIncrementEngagementLevel('invalid_user_12345');
      if (invalidResult.newLevel >= 1 && invalidResult.newLevel <= 5) {
        passedCount++;
      }

      // Test 3: User with no memories
      totalCount++;
      const noMemoriesResult = await this.personaLearner.checkAndIncrementEngagementLevel('user_with_no_memories');
      if (noMemoriesResult.newLevel === 1) {
        passedCount++;
      }

      // Test 4: Maximum level capping
      totalCount++;
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(`engagement_level_max_test_user`, '5');
      }
      await this.createMockMemoryData(100, 500, 100, 'max_test_user'); // Excessive engagement
      const maxLevelResult = await this.personaLearner.checkAndIncrementEngagementLevel('max_test_user');
      if (maxLevelResult.newLevel <= 5) {
        passedCount++;
      }

      const passed = passedCount === totalCount;

      this.results.push({
        test_name: 'Edge Cases and Error Handling',
        passed,
        details: passed 
          ? `All ${totalCount} edge cases handled correctly`
          : `${passedCount}/${totalCount} edge cases passed`,
        execution_time: Date.now() - startTime
      });

    } catch (error) {
      this.results.push({
        test_name: 'Edge Cases and Error Handling',
        passed: false,
        details: `Edge case testing failed: ${error}`,
        execution_time: Date.now() - startTime
      });
    }
  }

  /**
   * Helper method to create mock memory data
   */
  private async createMockMemoryData(
    readings: number, 
    conversationTurns: number, 
    questions: number,
    userIdSuffix: string = ''
  ): Promise<void> {
    const userId = userIdSuffix ? `${this.testUserId}_${userIdSuffix}` : this.testUserId;
    const logDir = path.join(process.cwd(), 'logs', 'persona-learning');
    
    try {
      await fs.mkdir(logDir, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }

    const logFile = path.join(logDir, `memory_${new Date().toISOString().split('T')[0]}.jsonl`);
    const logEntries = [];

    // Create reading completion memories
    for (let i = 0; i < readings; i++) {
      const readingMemory = {
        content: JSON.stringify({
          reading_summary: {
            id: `mock_reading_${i}`,
            session_id: `mock_session_${i}`,
            timestamp: new Date(Date.now() - (readings - i) * 86400000).toISOString(), // Spread over days
            spread_type: 'three-card',
            cards: ['The Fool', 'The Star', 'Ace of Cups'],
            narrative: `Mock reading ${i} narrative`,
            guidance: `Mock guidance for reading ${i}`
          },
          interaction_data: {
            user_id: userId,
            session_id: `mock_session_${i}`,
            reader: 'sophia',
            feedback: { rating: 4 + Math.random() }
          },
          learning_insights: {
            themes_identified: ['growth', 'spirituality', 'wisdom'],
            interpretation_quality: 0.8 + Math.random() * 0.2
          }
        }),
        keywords: ['reading_completed', 'sophia', 'mock_data'],
        context: `Mock reading completion ${i}`,
        category: 'tarot_reading',
        tags: ['mock', 'test', 'reading_completed'],
        timestamp: new Date().toISOString(),
        logged_at: new Date().toISOString(),
        source: 'test_setup'
      };
      
      logEntries.push(JSON.stringify(readingMemory));
    }

    // Create conversation turn memories
    for (let i = 0; i < conversationTurns; i++) {
      const conversationMemory = {
        content: JSON.stringify({
          conversation_data: {
            user_id: userId,
            session_id: `mock_conversation_session_${Math.floor(i / 5)}`, // Group turns into sessions
            turn_number: (i % 5) + 1,
            conversation_state: 'REVEALING_CARD_1',
            sophia_dialogue: `Mock dialogue for turn ${i}`,
            user_response: `Mock user response ${i}`
          },
          engagement_metrics: {
            dialogue_length: 50 + Math.random() * 100,
            has_user_response: true
          }
        }),
        keywords: ['conversation_turn', 'sophia', 'mock_data'],
        context: `Mock conversation turn ${i}`,
        category: 'conversation_learning',
        tags: ['mock', 'test', 'conversation_turn'],
        timestamp: new Date().toISOString(),
        logged_at: new Date().toISOString(),
        source: 'test_setup'
      };
      
      logEntries.push(JSON.stringify(conversationMemory));
    }

    // Create question response memories
    for (let i = 0; i < questions; i++) {
      const questionMemory = {
        content: JSON.stringify({
          question_data: {
            user_id: userId,
            session_id: `mock_question_session_${i}`,
            question: `What area of your life would you like guidance on? (Question ${i})`,
            response: `I'm seeking clarity about my spiritual growth and understanding (Response ${i})`,
            question_type: 'spiritual_focus'
          },
          insight_analysis: {
            response_sentiment: 'positive',
            insight_value: true
          }
        }),
        keywords: ['question_answered', 'sophia', 'mock_data'],
        context: `Mock question response ${i}`,
        category: 'personalization_insight',
        tags: ['mock', 'test', 'question_answered'],
        timestamp: new Date().toISOString(),
        logged_at: new Date().toISOString(),
        source: 'test_setup'
      };
      
      logEntries.push(JSON.stringify(questionMemory));
    }

    // Write all entries to the log file
    const content = logEntries.join('\n') + '\n';
    await fs.appendFile(logFile, content);
    
    console.log(`Created mock memory data: ${readings} readings, ${conversationTurns} turns, ${questions} questions for user ${userId}`);
  }

  /**
   * Cleanup test data
   */
  async cleanup(): Promise<void> {
    try {
      // Clean up localStorage
      if (typeof localStorage !== 'undefined') {
        const keysToRemove = [
          `engagement_level_${this.testUserId}`,
          `engagement_level_max_test_user`,
          `last_known_level_${this.testUserId}`
        ];
        
        keysToRemove.forEach(key => {
          localStorage.removeItem(key);
        });
      }

      // Clean up test memory files
      const logDir = path.join(process.cwd(), 'logs', 'persona-learning');
      const logFile = path.join(logDir, `memory_${new Date().toISOString().split('T')[0]}.jsonl`);
      
      try {
        const content = await fs.readFile(logFile, 'utf-8');
        const lines = content.split('\n').filter(line => {
          if (!line.trim()) return false;
          try {
            const entry = JSON.parse(line);
            return entry.source !== 'test_setup';
          } catch {
            return true; // Keep non-JSON lines
          }
        });
        
        await fs.writeFile(logFile, lines.join('\n'));
        console.log('✅ Test cleanup completed');
      } catch (cleanupError) {
        console.log('⚠️ Cleanup warning:', cleanupError);
      }
    } catch (error) {
      console.log('⚠️ Cleanup failed:', error);
    }
  }
}

// Main execution
async function main() {
  const tester = new ProgressiveRevealTester();
  
  try {
    const results = await tester.runCompleteTest();
    
    // Cleanup test data
    await tester.cleanup();
    
    // Exit with appropriate code
    process.exit(results.success ? 0 : 1);
    
  } catch (error) {
    console.error('🔥 Progressive reveal test execution failed:', error);
    await tester.cleanup();
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { ProgressiveRevealTester };