// server/utils/pdfParser.js

import fs from 'fs';
import { PDFParse } from 'pdf-parse';

export const extractTextFromPDF = async (filePath) => {
  try {
    console.log(`[PDF Parser] Starting extraction for: ${filePath}`);

    if (!fs.existsSync(filePath)) {
      console.error(`[PDF Parser] File Read Failure: File does not exist at ${filePath}`);
      throw new Error(`File does not exist: ${filePath}`);
    }

    const dataBuffer = fs.readFileSync(filePath);
    console.log(`[PDF Parser] File read successful. Buffer size: ${dataBuffer.length} bytes`);

    // Create PDFParse instance with options
    const pdfParser = new PDFParse({ data: dataBuffer });
    
    // Load the PDF document
    console.log(`[PDF Parser] Loading PDF document...`);
    await pdfParser.load();
    
    // Extract text using getText method
    console.log(`[PDF Parser] Extracting text...`);
    const textResult = await pdfParser.getText();
    
    // getText returns { pages: [...], text: string, total: number }
    const textContent = textResult?.text || '';
    
    console.log(`[PDF Parser] Parser finished execution.`);

    if (!textContent || typeof textContent !== 'string' || textContent.trim().length === 0) {
      console.warn(`[PDF Parser] Empty or Scanned PDF: No text extracted.`);
      throw new Error('PDF parsing resulted in empty or invalid text (possible scanned document)');
    }

    console.log(`[PDF Parser] Extraction successful. Text length: ${textContent.length} chars`);
    return textContent;
  } catch (error) {
    console.error('--- PDF PARSING ERROR START ---');
    console.error('File Path:', filePath);
    console.error('Error Message:', error.message);
    console.error('--- PDF PARSING ERROR END ---');
    throw new Error(`PDF Extraction Failed: ${error.message}`);
  }
};
