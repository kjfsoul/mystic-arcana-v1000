#!/usr/bin/env ts-node

/**
 * SUPERMEMORY MCP INTEGRATION TEST - CLOUD ENDPOINT VALIDATION
 * 
 * This script provides end-to-end validation of the Supermemory MCP integration
 * with PersonaLearner and Sophia agents against a live cloud endpoint.
 * 
 * Features:
 * - Tests against live cloud Supermemory service
 * - Runs comprehensive integration tests
 * - Validates PersonaLearner and Sophia agent integration
 * - Provides detailed validation output
 * 
 * Usage: npm run test:supermemory-integration
 * 
 * Environment: SUPERMEMORY_MCP_URL must be set to the cloud endpoint
 */

import axios from 'axios';
import * as dotenv from 'dotenv';
import { PersonaLearnerAgent } from '../src/agents/PersonaLearner';
import { ConversationSession, ConversationState } from '../src/agents/sophia';
import { TarotCard, SpreadType } from '../src/types/tarot';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Test configuration
const SUPERMEMORY_MCP_URL = process.env.SUPERMEMORY_MCP_URL || 'https://supermemory-mcp.your-cloud-provider.com';
const TEST_TIMEOUT = 60000; // 60 seconds

// Test results interface
interface TestResult {
  name: string;
  success: boolean;
  duration: number;
  error?: string;
  details?: any;
}

interface TestSuiteResults {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  duration: number;
  results: TestResult[];
  endpointUrl: string;
  endpointReachable: boolean;
}

class SupermemoryIntegrationTest {
  private personaLearner: PersonaLearnerAgent;
  private testResults: TestResult[] = [];
  private suiteStartTime: number = 0;
  private supermemoryUrl: string;

  constructor() {
    this.supermemoryUrl = SUPERMEMORY_MCP_URL;
    // Set environment variable for PersonaLearner
    process.env.SUPERMEMORY_MCP_URL = this.supermemoryUrl;
    this.personaLearner = new PersonaLearnerAgent();
    
    console.log(`🌍 Cloud Endpoint: ${this.supermemoryUrl}`);
  }

  /**
   * Main test execution method
   */
  async runTestSuite(): Promise<TestSuiteResults> {
    console.log('🧪 SUPERMEMORY MCP CLOUD INTEGRATION TEST SUITE');
    console.log('='.repeat(60));
    console.log(`🌍 Testing against cloud endpoint: ${this.supermemoryUrl}`);
    console.log('='.repeat(60));
    
    this.suiteStartTime = Date.now();
    let endpointReachable = false;

    try {
      // Step 1: Verify cloud endpoint is reachable
      console.log('🔍 Verifying cloud endpoint connectivity...');
      endpointReachable = await this.verifyCloudEndpoint();
      
      if (!endpointReachable) {
        throw new Error(`Cloud endpoint ${this.supermemoryUrl} is not reachable`);
      }

      // Step 2: Run integration tests
      console.log('🔬 Running integration tests against cloud service...');
      await this.runIntegrationTests();

    } catch (error) {
      console.error('💥 Test suite failed:', error);
      this.testResults.push({
        name: 'Test Suite Setup',
        success: false,
        duration: Date.now() - this.suiteStartTime,
        error: error instanceof Error ? error.message : String(error)
      });
    }

    // Calculate final results
    const suiteDuration = Date.now() - this.suiteStartTime;
    const passedTests = this.testResults.filter(r => r.success).length;
    const failedTests = this.testResults.filter(r => !r.success).length;

    const finalResults: TestSuiteResults = {
      totalTests: this.testResults.length,
      passedTests,
      failedTests,
      duration: suiteDuration,
      results: this.testResults,
      endpointUrl: this.supermemoryUrl,
      endpointReachable
    };

    this.printTestSummary(finalResults);
    return finalResults;
  }

  /**
   * Verify cloud endpoint is reachable
   */
  private async verifyCloudEndpoint(): Promise<boolean> {
    try {
      console.log(`🔍 Testing connectivity to ${this.supermemoryUrl}...`);
      
      // First, try health check endpoint
      let response;
      try {
        response = await axios.get(`${this.supermemoryUrl}/health`, { 
          timeout: 10000,
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Supermemory-Integration-Test/1.0'
          }
        });
      } catch (healthError) {
        // If health endpoint fails, try status endpoint as fallback
        console.log('⚠️  Health endpoint unavailable, trying status endpoint...');
        response = await axios.get(`${this.supermemoryUrl}/status`, { 
          timeout: 10000,
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Supermemory-Integration-Test/1.0'
          }
        });
      }

      if (response.status === 200) {
        console.log('✅ Cloud endpoint is reachable and responding');
        console.log(`📊 Response: ${JSON.stringify(response.data, null, 2)}`);
        return true;
      } else {
        console.error(`❌ Cloud endpoint returned status: ${response.status}`);
        return false;
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNREFUSED') {
          console.error(`❌ Connection refused to ${this.supermemoryUrl}`);
        } else if (error.code === 'ENOTFOUND') {
          console.error(`❌ DNS resolution failed for ${this.supermemoryUrl}`);
        } else if (error.code === 'TIMEOUT') {
          console.error(`❌ Request timeout to ${this.supermemoryUrl}`);
        } else {
          console.error(`❌ HTTP error: ${error.response?.status} ${error.response?.statusText}`);
        }
      } else {
        console.error(`❌ Cloud endpoint verification failed:`, error);
      }
      return false;
    }
  }


  /**
   * Run comprehensive integration tests
   */
  private async runIntegrationTests(): Promise<void> {
    const tests = [
      { name: 'Server Health Check', method: this.testServerHealth.bind(this) },
      { name: 'Memory Recording', method: this.testMemoryRecording.bind(this) },
      { name: 'Memory Retrieval', method: this.testMemoryRetrieval.bind(this) },
      { name: 'PersonaLearner Integration', method: this.testPersonaLearnerIntegration.bind(this) },
      { name: 'End-to-End Reading Flow', method: this.testEndToEndReadingFlow.bind(this) },
      { name: 'Error Handling', method: this.testErrorHandling.bind(this) },
      { name: 'Concurrent Operations', method: this.testConcurrentOperations.bind(this) }
    ];

    for (const test of tests) {
      console.log(`\n🧪 Running test: ${test.name}`);
      await this.runSingleTest(test.name, test.method);
    }
  }

  /**
   * Run a single test with timeout and error handling
   */
  private async runSingleTest(name: string, testMethod: () => Promise<any>): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Run test with timeout
      const result = await Promise.race([
        testMethod(),
        this.timeoutPromise(TEST_TIMEOUT, `Test '${name}' timed out`)
      ]);

      const duration = Date.now() - startTime;
      
      this.testResults.push({
        name,
        success: true,
        duration,
        details: result
      });
      
      console.log(`✅ ${name} passed (${duration}ms)`);
      
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      this.testResults.push({
        name,
        success: false,
        duration,
        error: errorMessage
      });
      
      console.error(`❌ ${name} failed (${duration}ms): ${errorMessage}`);
    }
  }

  /**
   * Test 1: Server Health Check
   */
  private async testServerHealth(): Promise<any> {
    const response = await axios.get(`${this.supermemoryUrl}/health`);
    
    if (response.status !== 200) {
      throw new Error(`Health check failed with status: ${response.status}`);
    }
    
    return { status: response.status, data: response.data };
  }

  /**
   * Test 2: Memory Recording
   */
  private async testMemoryRecording(): Promise<any> {
    const testUserId = `test_user_${Date.now()}`;
    const testData = {
      userId: testUserId,
      entryType: 'test_memory',
      data: {
        test_content: 'This is a test memory entry',
        timestamp: new Date().toISOString(),
        context: 'integration_test'
      },
      synthesisPrompt: 'Test memory recording for integration testing'
    };

    const response = await axios.post(`${this.supermemoryUrl}/record`, testData);
    
    if (response.status !== 201 && response.status !== 200) {
      throw new Error(`Memory recording failed with status: ${response.status}`);
    }
    
    return { 
      status: response.status, 
      recordId: response.data?.id,
      testUserId 
    };
  }

  /**
   * Test 3: Memory Retrieval
   */
  private async testMemoryRetrieval(): Promise<any> {
    // First record a memory to retrieve
    const testUserId = `retrieval_test_${Date.now()}`;
    const recordData = {
      userId: testUserId,
      entryType: 'retrieval_test',
      data: {
        test_message: 'Memory retrieval test data',
        unique_id: Math.random().toString(36)
      },
      synthesisPrompt: 'Test data for memory retrieval validation'
    };

    // Record the memory
    await axios.post(`${this.supermemoryUrl}/record`, recordData);
    
    // Wait a bit for processing
    await this.sleep(1000);
    
    // Retrieve the memory
    const response = await axios.get(`${this.supermemoryUrl}/journey/${testUserId}`);
    
    if (response.status !== 200) {
      throw new Error(`Memory retrieval failed with status: ${response.status}`);
    }
    
    const journey = response.data.journey || [];
    const foundMemory = journey.find((entry: any) => 
      entry.entry_type === 'retrieval_test' && 
      entry.data?.unique_id === recordData.data.unique_id
    );
    
    if (!foundMemory) {
      throw new Error('Recorded memory was not found in retrieval results');
    }
    
    return {
      status: response.status,
      journeyLength: journey.length,
      memoryFound: !!foundMemory,
      testUserId
    };
  }

  /**
   * Test 4: PersonaLearner Integration
   */
  private async testPersonaLearnerIntegration(): Promise<any> {
    const testUserId = `persona_test_${Date.now()}`;
    
    // Create mock conversation session
    const mockSession: ConversationSession = {
      sessionId: `session_${Date.now()}`,
      userId: testUserId,
      spreadType: 'three-card' as SpreadType,
      cards: [
        { 
          id: 'death-test',
          name: 'Death', 
          arcana: 'major' as const, 
          number: 13, 
          frontImage: '/test.jpg',
          backImage: '/test-back.jpg',
          meaning: {
            upright: 'Transformation and renewal',
            reversed: 'Resistance to change',
            keywords: ['transformation', 'renewal', 'ending']
          },
          description: 'Death represents transformation and new beginnings'
        } as TarotCard,
        { 
          id: 'fool-test',
          name: 'The Fool', 
          arcana: 'major' as const, 
          number: 0, 
          frontImage: '/test.jpg',
          backImage: '/test-back.jpg',
          meaning: {
            upright: 'New beginnings',
            reversed: 'Recklessness',
            keywords: ['beginnings', 'innocence', 'spontaneity']
          },
          description: 'The Fool represents new beginnings and faith'
        } as TarotCard,
        { 
          id: 'sun-test',
          name: 'The Sun', 
          arcana: 'major' as const, 
          number: 19, 
          frontImage: '/test.jpg',
          backImage: '/test-back.jpg',
          meaning: {
            upright: 'Success and vitality',
            reversed: 'Inner child blocked',
            keywords: ['success', 'joy', 'vitality']
          },
          description: 'The Sun represents success and vitality'
        } as TarotCard
      ],
      currentState: ConversationState.READING_COMPLETE,
      currentCardIndex: 3,
      userResponses: [],
      cardInterpretations: [
        {
          base_interpretation: 'Transformation and renewal',
          personalized_guidance: 'Time for personal change',
          spiritual_wisdom: 'Embrace the cycle of life',
          practical_advice: 'Let go of what no longer serves',
          reader_notes: 'Strong transformative energy',
          confidence_score: 0.85,
          source_references: ['test_integration']
        }
      ],
      startTime: new Date(),
      context: {
        userId: testUserId,
        spreadType: 'three-card' as SpreadType,
        sessionId: `session_${Date.now()}`,
        timestamp: new Date(),
        cards: []
      }
    };

    // Test logging interaction
    await this.personaLearner.logInteraction(testUserId, mockSession, {
      rating: 4,
      helpful_cards: ['Death', 'The Sun'],
      session_notes: 'Integration test feedback'
    });

    // Wait for processing
    await this.sleep(2000);

    // Test memory retrieval
    const memories = await this.personaLearner.retrieveUserMemories(testUserId);
    
    if (memories.length === 0) {
      throw new Error('PersonaLearner failed to log and retrieve memories');
    }

    // Find our test memory
    const testMemory = memories.find(m => 
      m.content.includes('Death') && 
      m.content.includes('The Sun') &&
      m.category === 'tarot_reading'
    );

    if (!testMemory) {
      throw new Error('Test memory not found in PersonaLearner retrieval');
    }

    return {
      memoriesCount: memories.length,
      testMemoryFound: !!testMemory,
      testUserId
    };
  }

  /**
   * Test 5: End-to-End Reading Flow
   */
  private async testEndToEndReadingFlow(): Promise<any> {
    const testUserId = `e2e_test_${Date.now()}`;
    
    // Simulate a complete reading session with multiple interactions
    const interactions = [
      { type: 'conversation_turn', data: { turn: 1, dialogue: 'Welcome to your reading' }},
      { type: 'card_reveal', data: { card: 'The Magician', engagement: 'high' }},
      { type: 'user_response', data: { response: 'I feel ready for change' }},
      { type: 'question_answer', data: { question: 'What are your goals?', answer: 'Personal growth' }}
    ];

    // Log each interaction
    for (const interaction of interactions) {
      await this.logTestInteraction(testUserId, interaction);
      await this.sleep(500); // Small delay between interactions
    }

    // Wait for all processing to complete
    await this.sleep(3000);

    // Retrieve and validate the complete journey
    const memories = await this.personaLearner.retrieveUserMemories(testUserId);
    
    if (memories.length < interactions.length) {
      throw new Error(`Expected at least ${interactions.length} memories, got ${memories.length}`);
    }

    // Test engagement analysis
    const analysis = await this.personaLearner.getEngagementAnalysis(testUserId);
    
    return {
      interactionsLogged: interactions.length,
      memoriesRetrieved: memories.length,
      engagementLevel: analysis.currentLevel,
      levelName: analysis.levelName,
      testUserId
    };
  }

  /**
   * Test 6: Error Handling
   */
  private async testErrorHandling(): Promise<any> {
    // Test invalid user ID
    const invalidMemories = await this.personaLearner.retrieveUserMemories('');
    if (invalidMemories.length !== 0) {
      throw new Error('Expected empty memories for invalid user ID');
    }

    // Test server connectivity resilience (simulate server downtime)
    const originalUrl = process.env.SUPERMEMORY_MCP_URL;
    process.env.SUPERMEMORY_MCP_URL = 'http://localhost:99999'; // Invalid port
    
    const testLearner = new PersonaLearnerAgent();
    
    // This should not throw an error, but gracefully handle the failure
    const mockSession: ConversationSession = {
      sessionId: 'error_test',
      spreadType: 'single' as SpreadType,
      cards: [{ 
        id: 'test-card',
        name: 'Test Card', 
        arcana: 'major' as const, 
        number: 0, 
        frontImage: '/test.jpg',
        backImage: '/test-back.jpg',
        meaning: {
          upright: 'Test meaning',
          reversed: 'Test reversed',
          keywords: ['test']
        },
        description: 'Test card for error handling'
      } as TarotCard],
      currentState: ConversationState.READING_COMPLETE,
      currentCardIndex: 1,
      userResponses: [],
      cardInterpretations: [],
      startTime: new Date(),
      context: {
        spreadType: 'single' as SpreadType,
        sessionId: 'error_test',
        timestamp: new Date(),
        cards: []
      }
    };

    // This should not throw an error
    await testLearner.logInteraction('error_test_user', mockSession);
    
    // Restore original URL
    process.env.SUPERMEMORY_MCP_URL = originalUrl;
    
    return {
      invalidUserHandled: true,
      serverDowntimeHandled: true
    };
  }

  /**
   * Test 7: Concurrent Operations
   */
  private async testConcurrentOperations(): Promise<any> {
    const testUserId = `concurrent_test_${Date.now()}`;
    const concurrentOperations = 5;
    
    // Create multiple concurrent memory operations
    const promises = Array.from({ length: concurrentOperations }, (_, i) => 
      this.createConcurrentOperation(testUserId, i)
    );

    const results = await Promise.all(promises);
    
    // Wait for processing
    await this.sleep(2000);
    
    // Verify all operations completed
    const memories = await this.personaLearner.retrieveUserMemories(testUserId);
    
    return {
      operationsExecuted: concurrentOperations,
      operationsSucceeded: results.filter(r => r.success).length,
      memoriesStored: memories.length,
      testUserId
    };
  }

  /**
   * Helper method for concurrent operations test
   */
  private async createConcurrentOperation(userId: string, index: number): Promise<{ success: boolean }> {
    try {
      const payload = {
        userId,
        entryType: 'concurrent_test',
        data: {
          operation_index: index,
          timestamp: new Date().toISOString(),
          test_data: `Concurrent operation ${index}`
        },
        synthesisPrompt: `Concurrent test operation ${index}`
      };

      const response = await axios.post(`${this.supermemoryUrl}/record`, payload, { timeout: 5000 });
      return { success: response.status === 200 || response.status === 201 };
    } catch (error) {
      return { success: false };
    }
  }

  /**
   * Helper method to log test interactions
   */
  private async logTestInteraction(userId: string, interaction: any): Promise<void> {
    const payload = {
      userId,
      entryType: interaction.type,
      data: interaction.data,
      synthesisPrompt: `Test interaction: ${interaction.type}`
    };

    await axios.post(`${this.supermemoryUrl}/record`, payload);
  }


  /**
   * Print comprehensive test summary
   */
  private printTestSummary(results: TestSuiteResults): void {
    console.log('\n' + '='.repeat(60));
    console.log('🧪 SUPERMEMORY MCP INTEGRATION TEST SUMMARY');
    console.log('='.repeat(60));
    
    console.log(`📊 Total Tests: ${results.totalTests}`);
    console.log(`✅ Passed: ${results.passedTests}`);
    console.log(`❌ Failed: ${results.failedTests}`);
    console.log(`⏱️  Total Duration: ${results.duration}ms`);
    console.log(`🌍 Cloud Endpoint: ${results.endpointUrl}`);
    console.log(`🔗 Endpoint Reachable: ${results.endpointReachable ? '✅' : '❌'}`);
    
    console.log('\n📋 DETAILED RESULTS:');
    results.results.forEach((result, index) => {
      const status = result.success ? '✅' : '❌';
      const duration = `(${result.duration}ms)`;
      console.log(`${index + 1}. ${status} ${result.name} ${duration}`);
      
      if (!result.success && result.error) {
        console.log(`   ↳ Error: ${result.error}`);
      }
      
      if (result.details && typeof result.details === 'object') {
        const detailStr = JSON.stringify(result.details, null, 2)
          .split('\n')
          .map(line => `   ↳ ${line}`)
          .join('\n');
        console.log(detailStr);
      }
    });
    
    console.log('\n' + '='.repeat(60));
    
    if (results.failedTests === 0 && results.endpointReachable) {
      console.log('🎉 ALL TESTS PASSED - CLOUD INTEGRATION VERIFIED!');
      process.exit(0);
    } else {
      console.log('💥 SOME TESTS FAILED - SYSTEM NEEDS ATTENTION');
      process.exit(1);
    }
  }

  /**
   * Utility methods
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private timeoutPromise<T>(ms: number, message: string): Promise<T> {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error(message)), ms);
    });
  }
}

/**
 * Main execution
 */
async function main() {
  const testSuite = new SupermemoryIntegrationTest();
  
  try {
    await testSuite.runTestSuite();
  } catch (error) {
    console.error('💥 Test suite execution failed:', error);
    process.exit(1);
  }
}

// Execute main function immediately for tsx execution
main().catch(error => {
  console.error('💥 Test suite execution failed:', error);
  process.exit(1);
});

export { SupermemoryIntegrationTest, TestResult, TestSuiteResults };
