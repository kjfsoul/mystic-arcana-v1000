#!/usr/bin/env tsx

/**
 * KNOWLEDGE GRAPH INGESTION VALIDATION TEST
 * 
 * This test validates the complete end-to-end pipeline:
 * 1. Clears Knowledge Graph tables
 * 2. Runs ingestion on sample URLs
 * 3. Validates data was properly ingested with correct relationships
 * 4. Provides detailed assertions and reporting
 * 
 * Usage:
 *   npx tsx scripts/test-knowledge-ingestion.ts
 *   npm run test:kg-ingestion
 */

import { createClient } from '@supabase/supabase-js';
import { IngestionPipeline } from './run-ingestion-pipeline';
import { config } from 'dotenv';

// Load environment variables
config();

interface TestResult {
  testName: string;
  passed: boolean;
  message: string;
  details?: any;
}

interface ValidationResults {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  testResults: TestResult[];
  startTime: Date;
  endTime?: Date;
  duration?: number;
}

/**
 * Knowledge Graph Ingestion Validation Test Suite
 * 
 * This comprehensive test suite validates that:
 * - The ingestion pipeline correctly extracts data from expert sources
 * - Knowledge Graph tables are properly populated
 * - Relationships between sources, concepts, and interpretations are correct
 * - Data quality meets expected standards
 */
class KnowledgeGraphIngestionTest {
  private supabase: any;
  private results: ValidationResults;
  
  // Test configuration
  private readonly TEST_URLS = [
    'https://www.biddytarot.com/tarot-card-meanings/major-arcana/fool/',
    'https://www.biddytarot.com/tarot-card-meanings/major-arcana/magician/',
    'https://www.biddytarot.com/tarot-card-meanings/major-arcana/high-priestess/'
  ];
  
  private readonly EXPECTED_CARDS = ['The Fool', 'The Magician', 'The High Priestess'];

  constructor() {
    this.results = {
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      testResults: [],
      startTime: new Date()
    };
  }

  /**
   * Initialize the test suite
   */
  async initialize(): Promise<void> {
    console.log('🧪 KNOWLEDGE GRAPH INGESTION VALIDATION TEST');
    console.log('============================================');
    console.log(`📅 Started at: ${this.results.startTime.toISOString()}`);
    
    try {
      // Initialize Supabase client
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';
      
      this.supabase = createClient(supabaseUrl, supabaseServiceKey);
      
      // Test database connectivity
      const { error } = await this.supabase
        .from('kg_sources')
        .select('count', { count: 'exact', head: true });
      
      if (error) {
        throw new Error(`Database connectivity test failed: ${error.message}`);
      }
      
      console.log('✅ Database connection established');
      console.log('✅ Test suite initialized');
      console.log(`🎯 Testing with ${this.TEST_URLS.length} sample URLs`);
      console.log(`📋 Expected cards: ${this.EXPECTED_CARDS.join(', ')}`);
      
    } catch (error) {
      console.error('❌ Test suite initialization failed:', error);
      throw error;
    }
  }

  /**
   * Execute the complete validation test suite
   */
  async runValidationTests(): Promise<ValidationResults> {
    try {
      console.log('\\n🚀 STARTING VALIDATION TESTS');
      console.log('=============================');
      
      // Phase 1: Clear Knowledge Graph tables
      await this.testClearKnowledgeGraphTables();
      
      // Phase 2: Run ingestion pipeline on sample URLs
      await this.testIngestionPipeline();
      
      // Phase 3: Validate data integrity
      await this.testDataIntegrity();
      
      // Phase 4: Validate relationships
      await this.testRelationships();
      
      // Phase 5: Validate data quality
      await this.testDataQuality();
      
      // Calculate final results
      this.results.endTime = new Date();
      this.results.duration = this.results.endTime.getTime() - this.results.startTime.getTime();
      
      console.log('\\n🎉 VALIDATION TESTS COMPLETED');
      console.log('=============================');
      this.logResults();
      
      return this.results;
      
    } catch (error) {
      this.results.endTime = new Date();
      this.results.duration = this.results.endTime.getTime() - this.results.startTime.getTime();
      
      console.error('\\n💥 VALIDATION TESTS FAILED');
      console.error('===========================');
      console.error('Error:', error);
      this.logResults();
      
      throw error;
    }
  }

  /**
   * Test 1: Clear Knowledge Graph tables
   */
  private async testClearKnowledgeGraphTables(): Promise<void> {
    console.log('\\n📋 Phase 1: Clearing Knowledge Graph tables...');
    
    try {
      // Clear tables in correct order (respecting foreign key constraints)
      const clearOperations = [
        { table: 'kg_interpretation_lineage', description: 'interpretation lineage records' },
        { table: 'kg_interpretation_synthesis', description: 'interpretation syntheses' },
        { table: 'kg_concept_relationships', description: 'concept relationships' },
        { table: 'kg_interpretations', description: 'interpretations' },
        { table: 'kg_concepts', description: 'concepts' },
        // Note: Not clearing kg_sources as they contain foundational data
      ];
      
      for (const operation of clearOperations) {
        const { error, count } = await this.supabase
          .from(operation.table)
          .delete()
          .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records
        
        if (error) {
          this.addTestResult({
            testName: `Clear ${operation.table}`,
            passed: false,
            message: `Failed to clear ${operation.table}: ${error.message}`,
            details: { error }
          });
        } else {
          this.addTestResult({
            testName: `Clear ${operation.table}`,
            passed: true,
            message: `Successfully cleared ${operation.table}`,
            details: { recordsDeleted: count }
          });
          console.log(`  ✅ Cleared ${operation.description}`);
        }
      }
      
      // Verify tables are empty
      await this.testTablesAreEmpty();
      
    } catch (error) {
      this.addTestResult({
        testName: 'Clear Knowledge Graph tables',
        passed: false,
        message: `Failed to clear tables: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: { error }
      });
      throw error;
    }
  }

  /**
   * Test 2: Run ingestion pipeline on sample URLs
   */
  private async testIngestionPipeline(): Promise<void> {
    console.log('\\n🔮 Phase 2: Running ingestion pipeline...');
    
    try {
      // Create ingestion pipeline with test configuration
      const pipeline = new IngestionPipeline({
        maxCards: 3,
        delayBetweenRequests: 500, // Faster for testing
        skipExisting: false,
        dryRun: false
      });
      
      await pipeline.initialize();
      
      // Run ingestion on specific test URLs
      console.log('  🕷️ Extracting from sample URLs...');
      let successfulExtractions = 0;
      
      for (let i = 0; i < this.TEST_URLS.length; i++) {
        const url = this.TEST_URLS[i];
        console.log(`  [${i + 1}/${this.TEST_URLS.length}] Processing: ${url}`);
        
        try {
          const extraction = await pipeline.crawlAndExtractTarot(url);
          const sourceId = await this.getSourceId('Biddy Tarot');
          await pipeline.saveToKnowledgeGraph(extraction, sourceId);
          
          successfulExtractions++;
          console.log(`    ✅ Successfully processed ${extraction.cardName}`);
          
        } catch (error) {
          console.error(`    ❌ Failed to process ${url}: ${error}`);
          this.addTestResult({
            testName: `Extract from ${url}`,
            passed: false,
            message: `Failed to extract from URL: ${error instanceof Error ? error.message : 'Unknown error'}`,
            details: { url, error }
          });
        }
        
        // Small delay between requests
        if (i < this.TEST_URLS.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
      this.addTestResult({
        testName: 'Ingestion Pipeline Execution',
        passed: successfulExtractions === this.TEST_URLS.length,
        message: `Processed ${successfulExtractions}/${this.TEST_URLS.length} URLs successfully`,
        details: { 
          totalUrls: this.TEST_URLS.length,
          successfulExtractions,
          successRate: (successfulExtractions / this.TEST_URLS.length) * 100
        }
      });
      
      if (successfulExtractions === 0) {
        throw new Error('No URLs were successfully processed');
      }
      
      console.log(`  ✅ Pipeline completed: ${successfulExtractions}/${this.TEST_URLS.length} successful`);
      
    } catch (error) {
      this.addTestResult({
        testName: 'Ingestion Pipeline Execution',
        passed: false,
        message: `Pipeline execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: { error }
      });
      throw error;
    }
  }

  /**
   * Test 3: Validate data integrity
   */
  private async testDataIntegrity(): Promise<void> {
    console.log('\\n📊 Phase 3: Validating data integrity...');
    
    try {
      // Test 3a: Check concepts were created
      const { data: concepts, error: conceptsError } = await this.supabase
        .from('kg_concepts')
        .select('*')
        .eq('concept_type', 'tarot_card');
      
      if (conceptsError) {
        throw new Error(`Failed to query concepts: ${conceptsError.message}`);
      }
      
      const conceptCount = concepts?.length || 0;
      const expectedCount = this.EXPECTED_CARDS.length;
      
      this.addTestResult({
        testName: 'Concepts Created',
        passed: conceptCount >= expectedCount,
        message: `Found ${conceptCount} concepts (expected at least ${expectedCount})`,
        details: { 
          conceptCount, 
          expectedCount,
          concepts: concepts?.map(c => c.name) || []
        }
      });
      
      console.log(`  ✅ Concepts: ${conceptCount} found`);
      
      // Test 3b: Check interpretations were created
      const { data: interpretations, error: interpretationsError } = await this.supabase
        .from('kg_interpretations')
        .select('*');
      
      if (interpretationsError) {
        throw new Error(`Failed to query interpretations: ${interpretationsError.message}`);
      }
      
      const interpretationCount = interpretations?.length || 0;
      const expectedInterpretations = expectedCount * 2; // At least 2 contexts per card
      
      this.addTestResult({
        testName: 'Interpretations Created',
        passed: interpretationCount >= expectedInterpretations,
        message: `Found ${interpretationCount} interpretations (expected at least ${expectedInterpretations})`,
        details: { 
          interpretationCount, 
          expectedInterpretations,
          contexts: [...new Set(interpretations?.map(i => i.context_type) || [])]
        }
      });
      
      console.log(`  ✅ Interpretations: ${interpretationCount} found`);
      
      // Test 3c: Validate specific expected cards
      for (const expectedCard of this.EXPECTED_CARDS) {
        const concept = concepts?.find(c => c.name === expectedCard);
        
        this.addTestResult({
          testName: `Card Present: ${expectedCard}`,
          passed: !!concept,
          message: concept ? `${expectedCard} found in database` : `${expectedCard} missing from database`,
          details: { expectedCard, found: !!concept, concept }
        });
        
        if (concept) {
          console.log(`  ✅ ${expectedCard}: Present with ID ${concept.id}`);
        } else {
          console.log(`  ❌ ${expectedCard}: Missing`);
        }
      }
      
    } catch (error) {
      this.addTestResult({
        testName: 'Data Integrity Validation',
        passed: false,
        message: `Data integrity check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: { error }
      });
      throw error;
    }
  }

  /**
   * Test 4: Validate relationships
   */
  private async testRelationships(): Promise<void> {
    console.log('\\n🔗 Phase 4: Validating relationships...');
    
    try {
      // Test 4a: Validate concept-interpretation relationships
      const { data: conceptsWithInterpretations, error } = await this.supabase
        .from('kg_concepts')
        .select(`
          id,
          name,
          kg_interpretations (
            id,
            context_type,
            primary_meaning,
            source_id
          )
        `)
        .eq('concept_type', 'tarot_card');
      
      if (error) {
        throw new Error(`Failed to query relationships: ${error.message}`);
      }
      
      let totalRelationships = 0;
      let validRelationships = 0;
      
      for (const concept of conceptsWithInterpretations || []) {
        const interpretations = concept.kg_interpretations || [];
        totalRelationships += interpretations.length;
        
        for (const interpretation of interpretations) {
          // Validate that interpretation has required fields
          if (interpretation.primary_meaning && 
              interpretation.context_type && 
              interpretation.source_id) {
            validRelationships++;
          }
        }
        
        console.log(`  📋 ${concept.name}: ${interpretations.length} interpretations`);
      }
      
      this.addTestResult({
        testName: 'Concept-Interpretation Relationships',
        passed: validRelationships === totalRelationships && totalRelationships > 0,
        message: `${validRelationships}/${totalRelationships} valid relationships`,
        details: { 
          totalRelationships, 
          validRelationships,
          concepts: conceptsWithInterpretations?.length || 0
        }
      });
      
      console.log(`  ✅ Relationships: ${validRelationships}/${totalRelationships} valid`);
      
      // Test 4b: Validate source relationships
      const { data: sources, error: sourcesError } = await this.supabase
        .from('kg_sources')
        .select('id, name')
        .eq('name', 'Biddy Tarot');
      
      if (sourcesError) {
        throw new Error(`Failed to query sources: ${sourcesError.message}`);
      }
      
      const biddyTarotSource = sources?.[0];
      
      this.addTestResult({
        testName: 'Source Exists',
        passed: !!biddyTarotSource,
        message: biddyTarotSource ? 'Biddy Tarot source found' : 'Biddy Tarot source missing',
        details: { biddyTarotSource }
      });
      
      if (biddyTarotSource) {
        console.log(`  ✅ Source: Biddy Tarot found with ID ${biddyTarotSource.id}`);
      }
      
    } catch (error) {
      this.addTestResult({
        testName: 'Relationships Validation',
        passed: false,
        message: `Relationships validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: { error }
      });
      throw error;
    }
  }

  /**
   * Test 5: Validate data quality
   */
  private async testDataQuality(): Promise<void> {
    console.log('\\n⭐ Phase 5: Validating data quality...');
    
    try {
      // Test 5a: Check concept completeness scores
      const { data: concepts, error: conceptsError } = await this.supabase
        .from('kg_concepts')
        .select('name, concept_completeness_score, keywords, archetypal_energy')
        .eq('concept_type', 'tarot_card');
      
      if (conceptsError) {
        throw new Error(`Failed to query concept quality: ${conceptsError.message}`);
      }
      
      let qualityPassCount = 0;
      const minQualityScore = 5.0;
      
      for (const concept of concepts || []) {
        const hasKeywords = concept.keywords && concept.keywords.length > 0;
        const hasArchetype = concept.archetypal_energy && concept.archetypal_energy.length > 10;
        const qualityScore = concept.concept_completeness_score || 0;
        
        const qualityPass = qualityScore >= minQualityScore && hasKeywords && hasArchetype;
        
        if (qualityPass) {
          qualityPassCount++;
        }
        
        console.log(`  📊 ${concept.name}: Quality ${qualityScore.toFixed(1)}/10, Keywords: ${hasKeywords}, Archetype: ${hasArchetype}`);
      }
      
      const totalConcepts = concepts?.length || 0;
      
      this.addTestResult({
        testName: 'Data Quality Standards',
        passed: qualityPassCount === totalConcepts && totalConcepts > 0,
        message: `${qualityPassCount}/${totalConcepts} concepts meet quality standards`,
        details: { 
          qualityPassCount, 
          totalConcepts, 
          minQualityScore,
          qualityRate: totalConcepts > 0 ? (qualityPassCount / totalConcepts) * 100 : 0
        }
      });
      
      // Test 5b: Check interpretation depth
      const { data: interpretations, error: interpretationsError } = await this.supabase
        .from('kg_interpretations')
        .select('context_type, primary_meaning, interpretation_depth_score');
      
      if (interpretationsError) {
        throw new Error(`Failed to query interpretation quality: ${interpretationsError.message}`);
      }
      
      const meaningfulInterpretations = interpretations?.filter(i => 
        i.primary_meaning && 
        i.primary_meaning.length > 20 && 
        i.interpretation_depth_score >= 3
      ) || [];
      
      const interpretationCount = interpretations?.length || 0;
      
      this.addTestResult({
        testName: 'Interpretation Quality',
        passed: meaningfulInterpretations.length === interpretationCount && interpretationCount > 0,
        message: `${meaningfulInterpretations.length}/${interpretationCount} interpretations are meaningful`,
        details: { 
          meaningfulInterpretations: meaningfulInterpretations.length,
          totalInterpretations: interpretationCount,
          qualityRate: interpretationCount > 0 ? (meaningfulInterpretations.length / interpretationCount) * 100 : 0
        }
      });
      
      console.log(`  ✅ Quality: ${qualityPassCount}/${totalConcepts} concepts pass standards`);
      console.log(`  ✅ Meanings: ${meaningfulInterpretations.length}/${interpretationCount} interpretations are meaningful`);
      
    } catch (error) {
      this.addTestResult({
        testName: 'Data Quality Validation',
        passed: false,
        message: `Data quality validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: { error }
      });
      throw error;
    }
  }

  /**
   * Helper method to verify tables are empty
   */
  private async testTablesAreEmpty(): Promise<void> {
    const tablesToCheck = [
      'kg_concepts',
      'kg_interpretations', 
      'kg_concept_relationships',
      'kg_interpretation_synthesis',
      'kg_interpretation_lineage'
    ];
    
    for (const table of tablesToCheck) {
      const { data, error } = await this.supabase
        .from(table)
        .select('id')
        .limit(1);
      
      if (error) {
        throw new Error(`Failed to check if ${table} is empty: ${error.message}`);
      }
      
      const isEmpty = !data || data.length === 0;
      
      this.addTestResult({
        testName: `${table} is empty`,
        passed: isEmpty,
        message: isEmpty ? `${table} successfully cleared` : `${table} still contains data`,
        details: { table, isEmpty, recordCount: data?.length || 0 }
      });
    }
  }

  /**
   * Helper method to get source ID
   */
  private async getSourceId(sourceName: string): Promise<string> {
    const { data, error } = await this.supabase
      .from('kg_sources')
      .select('id')
      .eq('name', sourceName)
      .single();
    
    if (error || !data) {
      throw new Error(`Could not find source '${sourceName}' in database`);
    }
    
    return data.id;
  }

  /**
   * Add a test result
   */
  private addTestResult(result: TestResult): void {
    this.results.testResults.push(result);
    this.results.totalTests++;
    
    if (result.passed) {
      this.results.passedTests++;
    } else {
      this.results.failedTests++;
    }
  }

  /**
   * Log final results
   */
  private logResults(): void {
    console.log(`\\n📊 VALIDATION TEST RESULTS`);
    console.log('==========================');
    console.log(`📋 Total Tests: ${this.results.totalTests}`);
    console.log(`✅ Passed: ${this.results.passedTests}`);
    console.log(`❌ Failed: ${this.results.failedTests}`);
    console.log(`📈 Success Rate: ${this.results.totalTests > 0 ? ((this.results.passedTests / this.results.totalTests) * 100).toFixed(1) : 0}%`);
    console.log(`⏱️ Duration: ${(this.results.duration || 0) / 1000}s`);
    
    if (this.results.failedTests > 0) {
      console.log(`\\n❌ FAILED TESTS:`);
      this.results.testResults
        .filter(result => !result.passed)
        .forEach((result, index) => {
          console.log(`  ${index + 1}. ${result.testName}`);
          console.log(`     ${result.message}`);
        });
    }
    
    if (this.results.passedTests > 0) {
      console.log(`\\n✅ PASSED TESTS:`);
      this.results.testResults
        .filter(result => result.passed)
        .forEach((result, index) => {
          console.log(`  ${index + 1}. ${result.testName}`);
        });
    }
    
    // Overall result
    const overallPassed = this.results.failedTests === 0 && this.results.passedTests > 0;
    console.log(`\\n${overallPassed ? '🎉' : '💥'} OVERALL RESULT: ${overallPassed ? 'PASSED' : 'FAILED'}`);
    
    if (overallPassed) {
      console.log('✨ Knowledge Graph ingestion pipeline is working correctly!');
      console.log('🚀 Ready for production use and n8n automation');
    } else {
      console.log('🔧 Knowledge Graph ingestion pipeline needs attention');
      console.log('📋 Review failed tests above for details');
    }
  }
}

/**
 * Main execution function
 */
async function main() {
  let testSuite: KnowledgeGraphIngestionTest;
  
  try {
    testSuite = new KnowledgeGraphIngestionTest();
    
    await testSuite.initialize();
    const results = await testSuite.runValidationTests();
    
    // Exit with appropriate code
    const success = results.failedTests === 0 && results.passedTests > 0;
    process.exit(success ? 0 : 1);
    
  } catch (error) {
    console.error('\\n💥 Test suite failed:', error);
    process.exit(1);
  }
}

// Execute if this script is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
}

export { KnowledgeGraphIngestionTest, TestResult, ValidationResults };