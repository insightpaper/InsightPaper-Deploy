import { PDFDocument } from 'pdf-lib';
import pdf from 'pdf-parse/lib/pdf-parse.js';
import axios from 'axios';

export const extractPageFromPDF = async (url) => {
  const response = await axios.get(url, { responseType: 'arraybuffer' });
  const mainDoc = await PDFDocument.load(response.data);
  const totalPages = mainDoc.getPageCount();
  const pages = [];

  for (let i = 0; i < totalPages; i++) {
    const newPdf = await PDFDocument.create();
    const [copiedPage] = await newPdf.copyPages(mainDoc, [i]);
    newPdf.addPage(copiedPage);
    const pdfBytes = await newPdf.save();
    // Extrae texto de cada página individual
    const pageData = await pdf(pdfBytes);
    pages.push(pageData.text.trim());
  }
  return pages;
};
