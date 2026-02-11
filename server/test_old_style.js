// Test old-style pdf-parse (v1.x compatible)
import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
const require = createRequire(import.meta.url);

console.log('=== TESTING OLD-STYLE PDF-PARSE ===\n');

// Try to get the default export the old way
let pdfParse;
try {
    // Method 1: Direct require (CommonJS default)
    const mod = require('pdf-parse');

    // Check if module itself is callable
    if (typeof mod === 'function') {
        pdfParse = mod;
        console.log('✅ Module is directly callable (v1.x style)');
    } else if (mod.default && typeof mod.default === 'function') {
        pdfParse = mod.default;
        console.log('✅ Module has .default function');
    } else if (mod.PDFParse && typeof mod.PDFParse === 'function') {
        // Try calling PDFParse directly (not as constructor)
        pdfParse = mod.PDFParse;
        console.log('✅ Module has PDFParse function');
    } else {
        console.log('❌ Cannot find callable function');
        console.log('Module type:', typeof mod);
        console.log('Module keys:', Object.keys(mod));
        process.exit(1);
    }
} catch (error) {
    console.log('❌ Import failed:', error.message);
    process.exit(1);
}

// Test with actual PDF
const uploadsDir = './uploads';
const files = fs.readdirSync(uploadsDir);
const pdfFile = files.find(f => f.endsWith('.pdf'));

if (!pdfFile) {
    console.log('❌ No PDF files found');
    process.exit(1);
}

const pdfPath = path.join(uploadsDir, pdfFile);
console.log('\nTesting with:', pdfFile);

try {
    const dataBuffer = fs.readFileSync(pdfPath);
    console.log('Buffer size:', dataBuffer.length, 'bytes');

    // Call as function (v1.x style)
    const data = await pdfParse(dataBuffer);

    console.log('\n✅ SUCCESS!');
    console.log('Text length:', data.text.length);
    console.log('Number of pages:', data.numpages);
    console.log('First 200 chars:', data.text.substring(0, 200));
} catch (error) {
    console.log('\n❌ FAILED:', error.message);
    console.log('Stack:', error.stack);
}

console.log('\n=== TEST COMPLETE ===');
