import { PDFParse } from 'pdf-parse';
import fs from 'fs';

(async () => {
  try {
    console.log('📋 Testing PDFParse API...\n');
    
    const dataBuffer = fs.readFileSync('../real_test.pdf');
    console.log('✅ PDF Buffer loaded:', dataBuffer.length, 'bytes\n');
    
    // Create PDFParse instance
    const pdfParser = new PDFParse({ data: dataBuffer });
    console.log('✅ PDFParse instance created');
    
    // Try load first, then getText
    console.log('\n🔍 Step 1: Calling load()...');
    await pdfParser.load();
    console.log('✅ Load completed');
    
    // Now getText
    console.log('\n🔍 Step 2: Calling getText()...');
    const textObj = await pdfParser.getText();
    console.log('✅ getText() returned:', typeof textObj);
    console.log('Keys:', Object.keys(textObj).slice(0, 10));
    console.log('Full object:', JSON.stringify(textObj, null, 2).substring(0, 200));
    
    // Try different ways to extract text
    if (textObj.text) {
      console.log('\n✅ textObj.text found:', textObj.text.substring(0, 100));
    } else if (typeof textObj === 'string') {
      console.log('\n✅ textObj is string:', textObj.substring(0, 100));
    } else if (Array.isArray(textObj)) {
      console.log('\n✅ textObj is array, items:', textObj.length);
    }
    
  } catch(e) {
    console.log('❌ Error:', e.message);
  }
})();
