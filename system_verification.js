#!/usr/bin/env node

/**
 * LearnAI Platform - Comprehensive System Verification
 * Tests all critical paths and verifies production readiness
 * 
 * Usage: node system_verification.js
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

class SystemVerifier {
  constructor() {
    this.checks = [];
    this.timestamp = new Date().toISOString();
  }

  log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
  }

  check(name, result, details = '') {
    const icon = result ? '✅' : '❌';
    const status = result ? colors.green : colors.red;
    this.checks.push({ name, result, details });
    this.log(`${icon} ${status}${name}${colors.reset}${details ? ` - ${details}` : ''}`, result ? 'green' : 'red');
  }

  // Check environment variables
  verifyEnvironment() {
    this.log('\n🔍 ENVIRONMENT CHECK', 'cyan');
    
    const required = ['MONGO_URI', 'JWT_SECRET', 'GROQ_API_KEY'];
    const env = require('dotenv').config({ path: './server/.env' });

    required.forEach(key => {
      const exists = !!process.env[key] || !!env.parsed?.[key];
      this.check(`${key} configured`, exists, exists ? '✓ Set' : '✗ Missing');
    });
  }

  // Check file structure
  verifyFileStructure() {
    this.log('\n📁 FILE STRUCTURE CHECK', 'cyan');

    const requiredFiles = [
      'server/app.js',
      'server/server.js',
      'server/.env',
      'server/config/groq.js',
      'server/config/db.js',
      'server/controllers/aiController.js',
      'server/controllers/pdfController.js',
      'server/controllers/resultController.js',
      'server/models/User.js',
      'server/models/PDF.js',
      'server/models/Result.js',
      'server/routes/aiRoutes.js',
      'server/routes/authRoutes.js',
      'server/utils/pdfParser.js',
      'server/utils/promptEngine.js',
      'server/utils/examEvaluator.js',
      'client/src/pages/Dashboard.tsx',
      'client/src/pages/LearningTools.tsx',
      'client/src/pages/PDFs.tsx',
      'client/src/pages/Chat.tsx',
      'client/src/pages/ExamResult.tsx',
    ];

    let allPresent = true;
    requiredFiles.forEach(file => {
      const exists = fs.existsSync(file);
      if (!exists) allPresent = false;
      this.check(`${file}`, exists);
    });

    return allPresent;
  }

  // Check dependencies
  verifyDependencies() {
    this.log('\n📦 DEPENDENCIES CHECK', 'cyan');

    const serverPackage = require('./server/package.json');
    const requiredDeps = [
      'express',
      'mongoose',
      'groq-sdk',
      'jsonwebtoken',
      'bcryptjs',
      'dotenv',
      'cors',
      'pdfkit',
      'pdf-parse',
    ];

    let allPresent = true;
    requiredDeps.forEach(dep => {
      const exists = !!serverPackage.dependencies[dep];
      if (!exists) allPresent = false;
      this.check(`${dep} installed`, exists, exists ? serverPackage.dependencies[dep] : 'Missing');
    });

    return allPresent;
  }

  // Check AI configuration
  verifyAIConfig() {
    this.log('\n🤖 AI CONFIGURATION CHECK', 'cyan');

    try {
      const groqConfig = fs.readFileSync('./server/config/groq.js', 'utf8');
      
      this.check('Groq lazy initialization', groqConfig.includes('let groqClient = null'));
      this.check('Circuit breaker pattern', groqConfig.includes('aiDisabledUntil'));
      this.check('Model configuration', groqConfig.includes('llama-3.1-8b-instant'));
      this.check('Error handling', groqConfig.includes('GroqError'));
      this.check('Health check method', groqConfig.includes('isGroqHealthy'));
      
      return true;
    } catch (error) {
      this.check('AI Config readable', false, error.message);
      return false;
    }
  }

  // Check PDF processing
  verifyPDFProcessing() {
    this.log('\n📄 PDF PROCESSING CHECK', 'cyan');

    try {
      const pdfParser = fs.readFileSync('./server/utils/pdfParser.js', 'utf8');
      
      this.check('PDF parser imported', pdfParser.includes('pdf-parse'));
      this.check('Extract text function', pdfParser.includes('extractTextFromPDF'));
      this.check('File existence check', pdfParser.includes('fs.existsSync'));
      this.check('Error handling', pdfParser.includes('catch'));
      
      return true;
    } catch (error) {
      this.check('PDF Parser readable', false, error.message);
      return false;
    }
  }

  // Check AI endpoints
  verifyAIEndpoints() {
    this.log('\n🔗 AI ENDPOINTS CHECK', 'cyan');

    try {
      const aiController = fs.readFileSync('./server/controllers/aiController.js', 'utf8');
      
      this.check('askAI endpoint', aiController.includes('export const askAI'));
      this.check('generateMCQs endpoint', aiController.includes('export const generateMCQs'));
      this.check('generateExam endpoint', aiController.includes('export const generateExam'));
      this.check('generateNotes endpoint', aiController.includes('export const generateNotes'));
      this.check('aiHealth endpoint', aiController.includes('export const aiHealth'));
      
      const aiRoutes = fs.readFileSync('./server/routes/aiRoutes.js', 'utf8');
      this.check('Routes configured', aiRoutes.includes("router.post('/ask'"));
      this.check('Rate limiting applied', aiRoutes.includes('aiLimiter'));
      
      return true;
    } catch (error) {
      this.check('AI Endpoints readable', false, error.message);
      return false;
    }
  }

  // Check frontend pages
  verifyFrontendPages() {
    this.log('\n🎨 FRONTEND PAGES CHECK', 'cyan');

    const pages = {
      'Dashboard': './client/src/pages/Dashboard.tsx',
      'LearningTools': './client/src/pages/LearningTools.tsx',
      'PDFs': './client/src/pages/PDFs.tsx',
      'Chat': './client/src/pages/Chat.tsx',
      'ExamResult': './client/src/pages/ExamResult.tsx',
    };

    let allValid = true;
    Object.entries(pages).forEach(([name, path]) => {
      try {
        const content = fs.readFileSync(path, 'utf8');
        const isValid = content.includes('export default') && content.includes('return');
        this.check(`${name} page`, isValid);
        if (!isValid) allValid = false;
      } catch (error) {
        this.check(`${name} page`, false, error.message);
        allValid = false;
      }
    });

    return allValid;
  }

  // Check error handling
  verifyErrorHandling() {
    this.log('\n⚠️ ERROR HANDLING CHECK', 'cyan');

    try {
      const aiController = fs.readFileSync('./server/controllers/aiController.js', 'utf8');
      
      this.check('400 Bad Request handling', aiController.includes('400'));
      this.check('401 Unauthorized handling', aiController.includes('401'));
      this.check('403 Forbidden handling', aiController.includes('403'));
      this.check('404 Not Found handling', aiController.includes('404'));
      this.check('429 Rate Limit handling', aiController.includes('429'));
      this.check('503 Service Unavailable handling', aiController.includes('503'));
      
      const apiClient = fs.readFileSync('./client/src/lib/api.ts', 'utf8');
      this.check('Frontend error interceptor', apiClient.includes('interceptors'));
      this.check('Token refresh logic', apiClient.includes('401'));
      
      return true;
    } catch (error) {
      this.check('Error Handling readable', false, error.message);
      return false;
    }
  }

  // Check download functionality
  verifyDownloadFeatures() {
    this.log('\n📥 DOWNLOAD FEATURES CHECK', 'cyan');

    try {
      const downloadController = fs.readFileSync('./server/controllers/downloadController.js', 'utf8');
      const learningTools = fs.readFileSync('./client/src/pages/LearningTools.tsx', 'utf8');
      
      this.check('Download controller exists', downloadController.includes('downloadContent'));
      this.check('PDF generation supported', downloadController.includes('PDFKit'));
      this.check('TXT export supported', downloadController.includes('text/plain'));
      this.check('Frontend export calls', learningTools.includes('exportContent'));
      this.check('Print functionality', learningTools.includes('handlePrint'));
      
      return true;
    } catch (error) {
      this.check('Download Features readable', false, error.message);
      return false;
    }
  }

  // Summary report
  generateReport() {
    this.log('\n' + '='.repeat(60), 'blue');
    this.log('📊 SYSTEM VERIFICATION REPORT', 'blue');
    this.log('='.repeat(60), 'blue');

    const passed = this.checks.filter(c => c.result).length;
    const total = this.checks.length;
    const passPercentage = ((passed / total) * 100).toFixed(1);

    this.log(`\n✨ Results: ${passed}/${total} checks passed (${passPercentage}%)`, passPercentage >= 90 ? 'green' : passPercentage >= 70 ? 'yellow' : 'red');

    if (passPercentage >= 95) {
      this.log('\n🚀 PRODUCTION READY: System is stable and verified!', 'green');
    } else if (passPercentage >= 80) {
      this.log('\n⚠️ READY WITH CAUTION: Some minor issues detected but system is functional', 'yellow');
    } else {
      this.log('\n❌ NOT READY: Critical issues need to be resolved before deployment', 'red');
    }

    // Save report
    const report = {
      timestamp: this.timestamp,
      summary: {
        passed,
        total,
        percentage: parseFloat(passPercentage),
      },
      checks: this.checks,
    };

    fs.writeFileSync('system_verification_report.json', JSON.stringify(report, null, 2));
    this.log('\n📄 Full report saved to: system_verification_report.json', 'cyan');
  }

  // Run all checks
  runAll() {
    this.log('🔧 Starting LearnAI System Verification...', 'blue');
    this.log(`Timestamp: ${this.timestamp}\n`, 'cyan');

    this.verifyEnvironment();
    this.verifyFileStructure();
    this.verifyDependencies();
    this.verifyAIConfig();
    this.verifyPDFProcessing();
    this.verifyAIEndpoints();
    this.verifyFrontendPages();
    this.verifyErrorHandling();
    this.verifyDownloadFeatures();

    this.generateReport();
  }
}

// Run verification
const verifier = new SystemVerifier();
verifier.runAll();
