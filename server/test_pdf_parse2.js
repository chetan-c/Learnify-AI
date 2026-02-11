// Check PDFParse structure
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const pdfParseModule = require('pdf-parse');
const PDFParse = pdfParseModule.PDFParse;

console.log('PDFParse type:', typeof PDFParse);
console.log('PDFParse is function?', typeof PDFParse === 'function');
console.log('PDFParse.name:', PDFParse?.name);

// Check if it's the default export
console.log('\nChecking module structure:');
console.log('Module has default?', 'default' in pdfParseModule);

// Try to find the actual parser function
for (const key of Object.keys(pdfParseModule)) {
    const val = pdfParseModule[key];
    if (typeof val === 'function') {
        console.log(`${key}: function (name: ${val.name})`);
    }
}
