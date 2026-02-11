// Quick verification script for AI fixes
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

console.log('=== AI FIX VERIFICATION ===\n');

// Test 1: PDF Parse Import
console.log('Test 1: PDF Parse Import');
try {
    const pdfParse = require('pdf-parse');
    console.log('✅ pdf-parse imported successfully');
    console.log('   Type:', typeof pdfParse);
    console.log('   Is function:', typeof pdfParse === 'function');
} catch (error) {
    console.log('❌ pdf-parse import failed:', error.message);
}

// Test 2: Gemini Config
console.log('\nTest 2: Gemini Configuration');
try {
    const { isGeminiConfigured, geminiModel } = await import('./config/gemini.js');
    console.log('✅ Gemini config imported successfully');
    console.log('   API Key configured:', isGeminiConfigured());
    console.log('   Model available:', !!geminiModel);
} catch (error) {
    console.log('❌ Gemini config failed:', error.message);
}

// Test 3: AI Controller
console.log('\nTest 3: AI Controller');
try {
    const aiController = await import('./controllers/aiController.js');
    console.log('✅ AI Controller imported successfully');
    console.log('   askAI:', typeof aiController.askAI);
    console.log('   generateMCQs:', typeof aiController.generateMCQs);
    console.log('   generateExam:', typeof aiController.generateExam);
    console.log('   generateNotes:', typeof aiController.generateNotes);
} catch (error) {
    console.log('❌ AI Controller failed:', error.message);
}

// Test 4: PDF Parser
console.log('\nTest 4: PDF Parser');
try {
    const { extractTextFromPDF } = await import('./utils/pdfParser.js');
    console.log('✅ PDF Parser imported successfully');
    console.log('   extractTextFromPDF:', typeof extractTextFromPDF);
} catch (error) {
    console.log('❌ PDF Parser failed:', error.message);
}

console.log('\n=== VERIFICATION COMPLETE ===');
