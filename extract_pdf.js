const fs = require('fs');
const path = require('path');
const PDFParser = require('pdf2json');

const filePath = path.join(process.cwd(), 'real_test.pdf');
const parser = new PDFParser(null, 1);

parser.on('pdfParser_dataError', (errData) => {
  console.error('PDF Parse Error:', errData.parserError);
});

parser.on('pdfParser_dataReady', (pdfData) => {
  try {
    let text = '';
    const pages = pdfData.Pages;
    
    if (pages && pages.length > 0) {
      pages.forEach((page) => {
        if (page.Texts) {
          page.Texts.forEach((textObj) => {
            if (textObj.R) {
              textObj.R.forEach((run) => {
                if (run.T) {
                  text += decodeURIComponent(run.T) + ' ';
                }
              });
            }
          });
          text += '\n';
        }
      });
    }
    
    console.log(text || 'No text extracted');
  } catch (err) {
    console.error('Error parsing PDF data:', err.message);
  }
});

fs.readFile(filePath, (err, data) => {
  if (err) {
    console.error('Error reading file:', err);
    return;
  }
  parser.parseBuffer(data);
});
