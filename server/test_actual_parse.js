// Test actual PDF parsing with both approaches
import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
const require = createRequire(import.meta.url);

const pdfParseModule = require('pdf-parse');

console.log('=== PDF PARSE ACTUAL TEST ===\n');

// Find a test PDF in uploads
const uploadsDir = './uploads';
const files = fs.readdirSync(uploadsDir);
const pdfFile = files.find(f => f.endsWith('.pdf'));

if (!pdfFile) {
    console.log('❌ No PDF files found in uploads directory');
    process.exit(1);
}

const pdfPath = path.join(uploadsDir, pdfFile);
console.log('Testing with:', pdfFile);

// Approach 1: Direct call (CommonJS default export style)
console.log('\nApproach 1: Direct module call');
try {
    const dataBuffer = fs.readFileSync(pdfPath);
    const data = await pdfParseModule(dataBuffer);
    console.log('✅ Success!');
    console.log('   Text length:', data.text.length);
    console.log('   First 100 chars:', data.text.substring(0, 100));
} catch (error) {
    console.log('❌ Failed:', error.message);
}

// Approach 2: PDFParse named export
console.log('\nApproach 2: PDFParse named export');
try {
    const PDFParse = pdfParseModule.PDFParse;
    const dataBuffer = fs.readFileSync(pdfPath);
    const data = await PDFParse(dataBuffer);
    console.log('✅ Success!');
    console.log('   Text length:', data.text.length);
    console.log('   First 100 chars:', data.text.substring(0, 100));
} catch (error) {
    console.log('❌ Failed:', error.message);
}

console.log('\n=== TEST COMPLETE ===');
