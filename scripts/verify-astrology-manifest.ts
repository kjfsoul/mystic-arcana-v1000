#!/usr/bin/env node

/**
 * Astrology Manifest Verification Script
 * Validates existence and integrity of all files listed in ASTROLOGY_FILES_MANIFEST.md
 */

import * as fs from 'fs';
import * as path from 'path';

interface VerificationResult {
  filePath: string;
  exists: boolean;
  isEmpty: boolean;
  isStub: boolean;
  hasImportErrors: boolean;
  errorDetails?: string;
}

interface IntegrityReport {
  totalFiles: number;
  existingFiles: number;
  missingFiles: string[];
  emptyFiles: string[];
  stubFiles: string[];
  importErrors: string[];
  timestamp: string;
}

class AstrologyManifestVerifier {
  private rootPath: string;
  private results: VerificationResult[] = [];

  constructor(rootPath: string = '/Users/kfitz/mystic-arcana-v1000') {
    this.rootPath = rootPath;
  }

  /**
   * Extract file paths from manifest
   */
  extractFilePaths(): string[] {
    const manifestPath = path.join(this.rootPath, 'ASTROLOGY_FILES_MANIFEST.md');
    const content = fs.readFileSync(manifestPath, 'utf-8');
    
    // Extract paths from code blocks and inline references
    const pathPattern = /^(src\/[^\s#]+|swiss-ephemeris-mcp-server\/[^\s#]+|scripts\/[^\s#]+|agents\/[^\s#]+)/gm;
    const matches = content.match(pathPattern) || [];
    
    // Also extract from inline code blocks
    const codeBlockPattern = /```[\s\S]*?```/g;
    const codeBlocks = content.match(codeBlockPattern) || [];
    
    const allPaths: Set<string> = new Set(matches);
    
    codeBlocks.forEach(block => {
      const lines = block.split('\n');
      lines.forEach(line => {
        const match = line.match(/^(src\/[^\s#]+|swiss-ephemeris-mcp-server\/[^\s#]+|scripts\/[^\s#]+|agents\/[^\s#]+)/);
        if (match) {
          allPaths.add(match[1].trim());
        }
      });
    });

    return Array.from(allPaths);
  }

  /**
   * Check if file exists and is not empty
   */
  verifyFile(filePath: string): VerificationResult {
    const fullPath = path.join(this.rootPath, filePath);
    const result: VerificationResult = {
      filePath,
      exists: false,
      isEmpty: false,
      isStub: false,
      hasImportErrors: false
    };

    try {
      if (fs.existsSync(fullPath)) {
        result.exists = true;
        
        const stats = fs.statSync(fullPath);
        result.isEmpty = stats.size === 0;
        
        if (!result.isEmpty && !fullPath.endsWith('/')) {
          const content = fs.readFileSync(fullPath, 'utf-8');
          
          // Check for stub indicators
          const stubIndicators = [
            'NOT IMPLEMENTED',
            'TODO: Implement',
            'STUB:',
            'throw new Error("Not implemented")',
            'return null; // stub',
            '// Placeholder',
            '// TODO'
          ];
          
          result.isStub = stubIndicators.some(indicator => 
            content.includes(indicator)
          );
          
          // Check for import errors (basic check)
          if (filePath.endsWith('.ts') || filePath.endsWith('.tsx') || filePath.endsWith('.js')) {
            const importPattern = /import\s+(?:[\w\s{},*]+\s+from\s+)?['"]([^'"]+)['"]/g;
            let match;
            
            while ((match = importPattern.exec(content)) !== null) {
              const importPath = match[1];
              if (!this.resolveImport(fullPath, importPath)) {
                result.hasImportErrors = true;
                result.errorDetails = `Unresolved import: ${importPath}`;
                break;
              }
            }
          }
        }
      }
    } catch (error: any) {
      result.errorDetails = error.message;
    }

    return result;
  }

  /**
   * Resolve import path
   */
  private resolveImport(fromFile: string, importPath: string): boolean {
    // Skip external packages
    if (!importPath.startsWith('.') && !importPath.startsWith('/')) {
      return true; // Assume npm packages exist
    }

    const dir = path.dirname(fromFile);
    const extensions = ['.ts', '.tsx', '.js', '.jsx', '.json', ''];
    
    for (const ext of extensions) {
      const resolvedPath = path.resolve(dir, importPath + ext);
      if (fs.existsSync(resolvedPath)) {
        return true;
      }
      // Check index file
      const indexPath = path.resolve(dir, importPath, 'index' + ext);
      if (fs.existsSync(indexPath)) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Run full verification
   */
  async verify(): Promise<IntegrityReport> {
    console.log('🔍 Starting Astrology Manifest Verification...\n');
    
    const filePaths = this.extractFilePaths();
    console.log(`📋 Found ${filePaths.length} file paths in manifest\n`);

    const report: IntegrityReport = {
      totalFiles: filePaths.length,
      existingFiles: 0,
      missingFiles: [],
      emptyFiles: [],
      stubFiles: [],
      importErrors: [],
      timestamp: new Date().toISOString()
    };

    for (const filePath of filePaths) {
      const result = this.verifyFile(filePath);
      this.results.push(result);

      if (!result.exists) {
        report.missingFiles.push(filePath);
        console.log(`❌ MISSING: ${filePath}`);
      } else {
        report.existingFiles++;
        
        if (result.isEmpty) {
          report.emptyFiles.push(filePath);
          console.log(`⚠️  EMPTY: ${filePath}`);
        }
        
        if (result.isStub) {
          report.stubFiles.push(filePath);
          console.log(`🔸 STUB: ${filePath}`);
        }
        
        if (result.hasImportErrors) {
          report.importErrors.push(`${filePath}: ${result.errorDetails}`);
          console.log(`🔴 IMPORT ERROR: ${filePath} - ${result.errorDetails}`);
        }
      }
    }

    return report;
  }

  /**
   * Generate integrity status JSON
   */
  generateIntegrityStatus(report: IntegrityReport): void {
    const statusPath = path.join(this.rootPath, 'integrity_status.json');
    
    const status = {
      astrology_manifest_verification: {
        ...report,
        integrity_score: ((report.existingFiles - report.emptyFiles.length - report.stubFiles.length) / report.totalFiles * 100).toFixed(2) + '%',
        critical_issues: report.missingFiles.length + report.importErrors.length,
        warnings: report.emptyFiles.length + report.stubFiles.length
      }
    };

    // Merge with existing status if it exists
    let existingStatus = {};
    if (fs.existsSync(statusPath)) {
      try {
        existingStatus = JSON.parse(fs.readFileSync(statusPath, 'utf-8'));
      } catch (e) {
        // Ignore parse errors
      }
    }

    const mergedStatus = { ...existingStatus, ...status };
    fs.writeFileSync(statusPath, JSON.stringify(mergedStatus, null, 2));
    
    console.log(`\n📊 Integrity status saved to: ${statusPath}`);
  }

  /**
   * Append to claude.md
   */
  updateClaudeMd(report: IntegrityReport): void {
    const claudePath = path.join(this.rootPath, 'claude.md');
    const timestamp = new Date().toISOString();
    
    const summary = `

## Astrology Manifest Verification - ${timestamp}

### 🔍 Verification Results

**Total Files Checked:** ${report.totalFiles}
**Existing Files:** ${report.existingFiles}
**Missing Files:** ${report.missingFiles.length}
**Empty Files:** ${report.emptyFiles.length}
**Stub Files:** ${report.stubFiles.length}
**Import Errors:** ${report.importErrors.length}

### ❌ Critical Issues - Missing Files
${report.missingFiles.length > 0 ? report.missingFiles.map(f => `- ${f}`).join('\n') : 'None'}

### ⚠️ Empty Files
${report.emptyFiles.length > 0 ? report.emptyFiles.map(f => `- ${f}`).join('\n') : 'None'}

### 🔸 Stub Files (Not Implemented)
${report.stubFiles.length > 0 ? report.stubFiles.map(f => `- ${f}`).join('\n') : 'None'}

### 🔴 Import/Dependency Errors
${report.importErrors.length > 0 ? report.importErrors.map(e => `- ${e}`).join('\n') : 'None'}

### 📊 Integrity Score
**${((report.existingFiles - report.emptyFiles.length - report.stubFiles.length) / report.totalFiles * 100).toFixed(2)}%**

### 🚨 Blocking Issues
${(report.missingFiles.length + report.importErrors.length) > 0 ? 
  '**BUILD WILL FAIL** - Critical files missing or have import errors. Must fix before proceeding.' : 
  'No blocking issues detected.'}
`;

    // Append to claude.md
    const existingContent = fs.readFileSync(claudePath, 'utf-8');
    fs.writeFileSync(claudePath, existingContent + summary);
    
    console.log(`\n📝 Results appended to: ${claudePath}`);
  }
}

// Run verification
async function main() {
  const verifier = new AstrologyManifestVerifier();
  
  try {
    const report = await verifier.verify();
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 VERIFICATION SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total Files: ${report.totalFiles}`);
    console.log(`Existing: ${report.existingFiles} (${(report.existingFiles/report.totalFiles*100).toFixed(1)}%)`);
    console.log(`Missing: ${report.missingFiles.length}`);
    console.log(`Empty: ${report.emptyFiles.length}`);
    console.log(`Stubs: ${report.stubFiles.length}`);
    console.log(`Import Errors: ${report.importErrors.length}`);
    console.log('='.repeat(60));
    
    // Generate reports
    verifier.generateIntegrityStatus(report);
    verifier.updateClaudeMd(report);
    
    // Exit with error if critical issues
    if (report.missingFiles.length > 0 || report.importErrors.length > 0) {
      console.error('\n❌ VERIFICATION FAILED - Critical issues detected');
      process.exit(1);
    }
    
    console.log('\n✅ Verification complete');
    
  } catch (error) {
    console.error('❌ Verification failed:', error);
    process.exit(1);
  }
}

// Run if executed directly
main();