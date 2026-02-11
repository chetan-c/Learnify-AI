// Test PDFParse as constructor
import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
const require = createRequire(import.meta.url);

const { PDFParse } = require('pdf-parse');

console.log('=== PDF PARSE CONSTRUCTOR TEST ===\n');

const uploadsDir = './uploads';
const files = fs.readdirSync(uploadsDir);
const pdfFile = files.find(f => f.endsWith('.pdf'));

if (!pdfFile) {
    console.log('❌ No PDF files found');
    process.exit(1);
}

const pdfPath = path.join(uploadsDir, pdfFile);
console.log('Testing with:', pdfFile);

// Test as constructor
console.log('\nTest: new PDFParse({ data: buffer })');
try {
    const dataBuffer = fs.readFileSync(pdfPath);
    const parser = new PDFParse({ data: dataBuffer });
    const data = await parser.getText();
    console.log('✅ Success!');
    console.log('   Text length:', data.text.length);
    console.log('   First 100 chars:', data.text.substring(0, 100));

    // Clean up
    if (parser.destroy) {
        await parser.destroy();
        console.log('   Cleanup: destroy() called');
    }
} catch (error) {
    console.log('❌ Failed:', error.message);
    console.log('   Stack:', error.stack);
}

console.log('\n=== TEST COMPLETE ===');
