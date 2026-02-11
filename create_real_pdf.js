const PDFDocument = require('pdfkit');
const fs = require('fs');

// Create a PDF with real text content using PDFKit
const doc = new PDFDocument();
const stream = fs.createWriteStream('real_test.pdf');

doc.pipe(stream);
doc.fontSize(20).text('Educational Content Test Document', { align: 'center' });
doc.fontSize(12).moveDown();
doc.text('This is a test PDF document for educational purposes.');
doc.text('It contains meaningful content that can be extracted and used to generate MCQs.');
doc.moveDown();
doc.fontSize(14).text('Chapter 1: Introduction to Physics');
doc.fontSize(12).moveDown();
doc.text('Physics is the fundamental natural science that studies matter, energy, and forces.');
doc.text('It provides a framework for understanding how the universe works.');
doc.text('Classical mechanics deals with motion and forces on everyday objects.');
doc.text('Quantum mechanics describes behavior at atomic scales.');
doc.moveDown();
doc.fontSize(14).text('Chapter 2: Laws of Motion');
doc.fontSize(12).moveDown();
doc.text('Newton\'s First Law: An object in motion stays in motion unless acted upon by an external force.');
doc.text('Newton\'s Second Law: Force equals mass times acceleration (F = ma).');
doc.text('Newton\'s Third Law: For every action, there is an equal and opposite reaction.');
doc.moveDown();
doc.fontSize(14).text('Key Concepts');
doc.fontSize(12).moveDown();
doc.text('- Force: A push or pull that causes changes in motion');
doc.text('- Acceleration: Rate of change of velocity');
doc.text('- Momentum: Mass times velocity');
doc.text('- Energy: Capacity to do work');
doc.moveDown();
doc.text('This content is suitable for generating exam questions and study materials.');
doc.end();

console.log('✅ Real PDF created: real_test.pdf');
