// server/controllers/downloadController.js
import PDFKit from 'pdfkit';

export const downloadContent = async (req, res) => {
  try {
    const { filename = 'export', format = 'pdf', content = '' } = req.body;

    if (format === 'txt') {
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.txt"`);
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      return res.send(content);
    }

    // PDF generation
    res.setHeader('Content-Disposition', `attachment; filename="${filename}.pdf"`);
    res.setHeader('Content-Type', 'application/pdf');

    const doc = new PDFKit({ size: 'A4', margin: 40 });
    doc.pipe(res);
    doc.fontSize(18).text(filename, { align: 'center' });
    doc.moveDown();
    doc.fontSize(11).text(content, { align: 'left' });
    doc.end();
  } catch (error) {
    console.error('[Download] Error generating file', error?.message || error);
    res.status(500).json({ message: 'Failed to generate download' });
  }
};
