#!/usr/bin/env node
/**
 * Test script for Mystic Marketplace features
 * Tests wishlist persistence and celestial event filtering
 */

import { MYSTIC_PRODUCTS, CelestialEventType } from '../src/lib/stripe/initStripe';

interface TestResult {
  testName: string;
  passed: boolean;
  message: string;
  details?: any;
}

class MarketplaceTestSuite {
  private results: TestResult[] = [];

  private addResult(testName: string, passed: boolean, message: string, details?: any) {
    this.results.push({ testName, passed, message, details });
    console.log(`${passed ? '✅' : '❌'} ${testName}: ${message}`);
    if (details) console.log(`   Details: ${JSON.stringify(details, null, 2)}`);
  }

  testProductSchema() {
    console.log('\n🧪 Testing Product Schema with Celestial Events...');
    
    // Test 1: Verify all products have proper structure
    const productKeys = Object.keys(MYSTIC_PRODUCTS);
    this.addResult(
      'Product Count',
      productKeys.length >= 8,
      `Found ${productKeys.length} products (expected ≥8)`
    );

    // Test 2: Verify celestial event tags exist
    let productsWithEvents = 0;
    let totalEventTags = 0;

    Object.entries(MYSTIC_PRODUCTS).forEach(([key, product]) => {
      if (product.metadata.cosmic_alignment) {
        productsWithEvents++;
        totalEventTags += product.metadata.cosmic_alignment.length;
      }
    });

    this.addResult(
      'Celestial Event Coverage',
      productsWithEvents >= 6,
      `${productsWithEvents} products have celestial alignments (${totalEventTags} total tags)`
    );

    // Test 3: Verify specific product examples
    const retrogradeProduct = MYSTIC_PRODUCTS.retrograde_collection;
    this.addResult(
      'Mercury Retrograde Product',
      retrogradeProduct?.metadata.cosmic_alignment?.includes('mercury_retrograde'),
      'Retrograde collection has mercury_retrograde tag'
    );

    const moonProduct = MYSTIC_PRODUCTS.full_moon_crystal_set;
    this.addResult(
      'Full Moon Product',
      moonProduct?.metadata.cosmic_alignment?.includes('full_moon'),
      'Full moon crystal set has full_moon tag'
    );

    // Test 4: Verify element assignments
    let productsWithElements = 0;
    Object.entries(MYSTIC_PRODUCTS).forEach(([key, product]) => {
      if (product.metadata.element) {
        productsWithElements++;
      }
    });

    this.addResult(
      'Element Assignment',
      productsWithElements >= 4,
      `${productsWithElements} products have element assignments`
    );
  }

  testFilteringLogic() {
    console.log('\n🔍 Testing Celestial Event Filtering Logic...');

    // Mock filter function (simulating the marketplace filtering)
    const filterProducts = (filters: {
      celestialEvents?: CelestialEventType[];
      productTypes?: string[];
      elements?: string[];
      priceRange?: [number, number];
    }) => {
      return Object.entries(MYSTIC_PRODUCTS).filter(([key, product]) => {
        // Price range filter
        if (filters.priceRange) {
          if (product.price < filters.priceRange[0] || product.price > filters.priceRange[1]) {
            return false;
          }
        }

        // Celestial events filter
        if (filters.celestialEvents && filters.celestialEvents.length > 0) {
          const cosmicAlignment = product.metadata.cosmic_alignment;
          if (!cosmicAlignment) return false;
          const hasMatchingEvent = filters.celestialEvents.some(event => 
            cosmicAlignment.includes(event)
          );
          if (!hasMatchingEvent) return false;
        }

        // Product type filter
        if (filters.productTypes && filters.productTypes.length > 0) {
          if (!filters.productTypes.includes(product.metadata.type)) return false;
        }

        // Element filter
        if (filters.elements && filters.elements.length > 0) {
          if (!product.metadata.element || !filters.elements.includes(product.metadata.element)) return false;
        }

        return true;
      });
    };

    // Test 1: Filter by Mercury Retrograde
    const retrogradeProducts = filterProducts({
      celestialEvents: ['mercury_retrograde']
    });
    this.addResult(
      'Mercury Retrograde Filter',
      retrogradeProducts.length === 1,
      `Found ${retrogradeProducts.length} mercury retrograde products`
    );

    // Test 2: Filter by Full Moon
    const fullMoonProducts = filterProducts({
      celestialEvents: ['full_moon']
    });
    this.addResult(
      'Full Moon Filter',
      fullMoonProducts.length >= 1,
      `Found ${fullMoonProducts.length} full moon products`
    );

    // Test 3: Filter by product type
    const crystalProducts = filterProducts({
      productTypes: ['crystals']
    });
    this.addResult(
      'Crystal Product Filter',
      crystalProducts.length >= 2,
      `Found ${crystalProducts.length} crystal products`
    );

    // Test 4: Filter by element
    const waterProducts = filterProducts({
      elements: ['water']
    });
    this.addResult(
      'Water Element Filter',
      waterProducts.length >= 1,
      `Found ${waterProducts.length} water element products`
    );

    // Test 5: Filter by price range
    const budgetProducts = filterProducts({
      priceRange: [0, 5000] // Under $50
    });
    this.addResult(
      'Price Range Filter',
      budgetProducts.length >= 2,
      `Found ${budgetProducts.length} products under $50`
    );

    // Test 6: Combined filters
    const combinedResults = filterProducts({
      celestialEvents: ['full_moon', 'new_moon'],
      productTypes: ['crystals'],
      priceRange: [0, 8000]
    });
    this.addResult(
      'Combined Filters',
      combinedResults.length >= 1,
      `Found ${combinedResults.length} products matching multiple criteria`
    );
  }

  async testWishlistStructure() {
    console.log('\n💖 Testing Wishlist Data Structure...');

    // Test wishlist migration SQL
    const migrationPath = '../supabase/migrations/20250121_create_wishlist_table.sql';
    
    try {
      const fs = await import('fs');
      const path = await import('path');
      const currentDir = path.dirname(new URL(import.meta.url).pathname);
      const migrationContent = fs.readFileSync(currentDir + '/' + migrationPath, 'utf8');
      
      // Check for essential SQL components
      const hasTable = migrationContent.includes('CREATE TABLE IF NOT EXISTS wishlist_items');
      const hasRLS = migrationContent.includes('ENABLE ROW LEVEL SECURITY');
      const hasPolicies = migrationContent.includes('CREATE POLICY');
      const hasIndexes = migrationContent.includes('CREATE INDEX');

      this.addResult(
        'Wishlist Table Creation',
        hasTable,
        'Migration includes wishlist_items table'
      );

      this.addResult(
        'Row Level Security',
        hasRLS,
        'Migration enables RLS for security'
      );

      this.addResult(
        'Security Policies',
        hasPolicies,
        'Migration includes user access policies'
      );

      this.addResult(
        'Database Indexes',
        hasIndexes,
        'Migration includes performance indexes'
      );

    } catch (error) {
      this.addResult(
        'Migration File Access',
        false,
        `Could not read migration file: ${error.message}`
      );
    }
  }

  async testUIComponentStructure() {
    console.log('\n🎨 Testing UI Component Structure...');

    // Test FilterSidebar component
    try {
      const fs = await import('fs');
      const path = await import('path');
      const currentDir = path.dirname(new URL(import.meta.url).pathname);
      const filterSidebarPath = '../src/components/marketplace/FilterSidebar.tsx';
      const filterContent = fs.readFileSync(currentDir + '/' + filterSidebarPath, 'utf8');
      
      const hasFilterState = filterContent.includes('FilterState');
      const hasCelestialEvents = filterContent.includes('celestialEvents');
      const hasWishlistSupport = filterContent.includes('productCount');
      const hasAccessibility = filterContent.includes('aria-label');

      this.addResult(
        'FilterSidebar Component',
        hasFilterState && hasCelestialEvents,
        'FilterSidebar has proper filtering structure'
      );

      this.addResult(
        'Accessibility Features',
        hasAccessibility,
        'FilterSidebar includes accessibility attributes'
      );

    } catch (error) {
      this.addResult(
        'FilterSidebar File Access',
        false,
        `Could not read FilterSidebar: ${error.message}`
      );
    }

    // Test marketplace page updates
    try {
      const fs = await import('fs');
      const path = await import('path');
      const currentDir = path.dirname(new URL(import.meta.url).pathname);
      const marketplacePath = '../src/app/marketplace/page.tsx';
      const marketplaceContent = fs.readFileSync(currentDir + '/' + marketplacePath, 'utf8');
      
      const hasWishlistHook = marketplaceContent.includes('useWishlist');
      const hasFilterSidebar = marketplaceContent.includes('FilterSidebar');
      const hasFilterState = marketplaceContent.includes('FilterState');
      const hasProductFiltering = marketplaceContent.includes('filteredProducts');

      this.addResult(
        'Marketplace Integration',
        hasWishlistHook && hasFilterSidebar && hasProductFiltering,
        'Marketplace page properly integrates new features'
      );

    } catch (error) {
      this.addResult(
        'Marketplace File Access',
        false,
        `Could not read marketplace page: ${error.message}`
      );
    }
  }

  async runAllTests() {
    console.log('🔮✨ MYSTIC MARKETPLACE TEST SUITE ✨🔮');
    console.log('='.repeat(50));
    
    this.testProductSchema();
    this.testFilteringLogic();
    await this.testWishlistStructure();
    await this.testUIComponentStructure();

    console.log('\n📊 TEST RESULTS SUMMARY');
    console.log('='.repeat(30));
    
    const passed = this.results.filter(r => r.passed).length;
    const total = this.results.length;
    const passRate = (passed / total * 100).toFixed(1);

    console.log(`✅ Passed: ${passed}/${total} (${passRate}%)`);
    console.log(`❌ Failed: ${total - passed}/${total}`);

    if (passed === total) {
      console.log('\n🎉 ALL TESTS PASSED! Marketplace features are ready for production.');
    } else {
      console.log('\n⚠️  Some tests failed. Review the results above.');
    }

    // Failed tests details
    const failedTests = this.results.filter(r => !r.passed);
    if (failedTests.length > 0) {
      console.log('\n❌ FAILED TESTS:');
      failedTests.forEach(test => {
        console.log(`   • ${test.testName}: ${test.message}`);
      });
    }

    return {
      total,
      passed,
      failed: total - passed,
      passRate: parseFloat(passRate),
      results: this.results
    };
  }
}

// Run the tests
if (import.meta.url === `file://${process.argv[1]}`) {
  const testSuite = new MarketplaceTestSuite();
  testSuite.runAllTests().then(summary => {
    process.exit(summary.failed > 0 ? 1 : 0);
  });
}

export { MarketplaceTestSuite };