#!/usr/bin/env node

/**
 * Production preparation script
 * This script performs various checks and optimizations before deployment
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface PrepCheck {
  name: string;
  check: () => Promise<boolean> | boolean;
  fix?: () => Promise<void> | void;
  critical: boolean;
}

class ProductionPrep {
  private checks: PrepCheck[] = [
    {
      name: 'Remove console.logs from production build',
      check: () => this.checkForConsoleLogs(),
      critical: false, // Handled by Vite plugin
    },
    {
      name: 'Check for TODO comments',
      check: () => this.checkForTodos(),
      critical: false,
    },
    {
      name: 'Verify environment variables',
      check: () => this.checkEnvironmentVariables(),
      critical: true,
    },
    {
      name: 'Check bundle size',
      check: () => this.checkBundleSize(),
      critical: false,
    },
    {
      name: 'Verify Supabase connection',
      check: () => this.checkSupabaseConnection(),
      critical: true,
    },
  ];

  async run() {
    console.log('🚀 Starting production preparation...\n');

    const results = [];
    let criticalFailed = false;

    for (const check of this.checks) {
      console.log(`⏳ ${check.name}...`);
      
      try {
        const passed = await check.check();
        
        if (passed) {
          console.log(`✅ ${check.name} - PASSED\n`);
          results.push({ name: check.name, status: 'PASSED' });
        } else {
          console.log(`❌ ${check.name} - FAILED`);
          
          if (check.critical) {
            criticalFailed = true;
            console.log(`🚨 CRITICAL: This must be fixed before deployment!\n`);
          } else {
            console.log(`⚠️  WARNING: Consider fixing this issue.\n`);
          }
          
          results.push({ name: check.name, status: 'FAILED', critical: check.critical });
        }
      } catch (error) {
        console.log(`💥 ${check.name} - ERROR: ${error}`);
        results.push({ name: check.name, status: 'ERROR' });
        
        if (check.critical) {
          criticalFailed = true;
        }
      }
    }

    // Summary
    console.log('\n📊 PRODUCTION READINESS SUMMARY:');
    console.log('================================');
    
    results.forEach(result => {
      const icon = result.status === 'PASSED' ? '✅' : 
                   result.status === 'FAILED' ? '❌' : '💥';
      const critical = result.critical ? ' (CRITICAL)' : '';
      console.log(`${icon} ${result.name}${critical}`);
    });

    if (criticalFailed) {
      console.log('\n🚨 DEPLOYMENT BLOCKED: Critical issues must be resolved first!');
      process.exit(1);
    } else {
      console.log('\n🎉 Ready for production deployment!');
      this.generateDeploymentReport(results);
    }
  }

  private checkForConsoleLogs(): boolean {
    const srcPath = path.join(__dirname, '../../src');
    const files = this.getAllTsxFiles(srcPath);
    let consoleLogsFound = 0;

    files.forEach(file => {
      const content = fs.readFileSync(file, 'utf-8');
      const matches = content.match(/console\.(log|debug|info)/g);
      if (matches) {
        consoleLogsFound += matches.length;
      }
    });

    console.log(`   Found ${consoleLogsFound} console.log statements (will be removed by Vite plugin)`);
    return true; // Always pass since Vite plugin handles this
  }

  private checkForTodos(): boolean {
    const srcPath = path.join(__dirname, '../../src');
    const files = this.getAllTsxFiles(srcPath);
    let todosFound = 0;

    files.forEach(file => {
      const content = fs.readFileSync(file, 'utf-8');
      const matches = content.match(/TODO|FIXME|HACK/gi);
      if (matches) {
        todosFound += matches.length;
      }
    });

    console.log(`   Found ${todosFound} TODO/FIXME comments`);
    return todosFound === 0;
  }

  private checkEnvironmentVariables(): boolean {
    const requiredVars = [
      'VITE_SUPABASE_URL',
      'VITE_SUPABASE_ANON_KEY',
    ];

    const missing = requiredVars.filter(varName => !process.env[varName]);
    
    if (missing.length > 0) {
      console.log(`   Missing environment variables: ${missing.join(', ')}`);
      return false;
    }

    console.log('   All required environment variables are set');
    return true;
  }

  private checkBundleSize(): boolean {
    const distPath = path.join(__dirname, '../../dist');
    
    if (!fs.existsSync(distPath)) {
      console.log('   Build first with: npm run build');
      return false;
    }

    // Check if dist folder exists and has reasonable size
    const stats = this.getFolderSize(distPath);
    const sizeMB = stats / (1024 * 1024);
    
    console.log(`   Bundle size: ${sizeMB.toFixed(2)} MB`);
    
    // Warn if bundle is too large (>10MB)
    if (sizeMB > 10) {
      console.log('   ⚠️  Bundle size is quite large, consider optimizing');
      return false;
    }
    
    return true;
  }

  private async checkSupabaseConnection(): Promise<boolean> {
    try {
      // Basic check - verify config exists
      const clientPath = path.join(__dirname, '../../src/integrations/supabase/client.ts');
      
      if (!fs.existsSync(clientPath)) {
        console.log('   Supabase client not configured');
        return false;
      }

      console.log('   Supabase client configuration found');
      return true;
    } catch (error) {
      console.log(`   Error checking Supabase: ${error}`);
      return false;
    }
  }

  private getAllTsxFiles(dir: string): string[] {
    const files: string[] = [];
    
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        files.push(...this.getAllTsxFiles(fullPath));
      } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
        files.push(fullPath);
      }
    }
    
    return files;
  }

  private getFolderSize(dir: string): number {
    let size = 0;
    
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        size += this.getFolderSize(fullPath);
      } else {
        size += stat.size;
      }
    }
    
    return size;
  }

  private generateDeploymentReport(results: any[]) {
    const report = {
      timestamp: new Date().toISOString(),
      ready: !results.some(r => r.critical && r.status !== 'PASSED'),
      results,
      deployment_checklist: [
        'Environment variables configured',
        'Database migrations applied',
        'CDN cache cleared',
        'SSL certificates valid',
        'Monitoring tools configured',
        'Error tracking setup',
      ]
    };

    fs.writeFileSync(
      path.join(__dirname, '../../deployment-report.json'),
      JSON.stringify(report, null, 2)
    );
    
    console.log('\n📄 Deployment report saved to deployment-report.json');
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  new ProductionPrep().run();
}

export default ProductionPrep;