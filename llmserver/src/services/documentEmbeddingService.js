
import { extractPageFromPDF } from './pdfService.js';
import { OpenAI } from 'openai';
import { config as envConfig } from 'dotenv';
envConfig();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const generateDocumentEmbeddings = async (doc) => {
  try {
    // Embedding para metadatos
    const metadataInput = [
      doc.title,
      doc.description,
      Array.isArray(doc.labels) ? doc.labels.join(', ') : doc.labels,
    ].join('\n');

    const metadataEmbedding = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: metadataInput,
    });

    // Embeddings para cada página del PDF
    const pages = await extractPageFromPDF(doc.firebaseUrl);

    const pageEmbeddings = [];
    for (let i = 0; i < pages.length; i++) {
      const pageText = pages[i].trim();
      if (pageText) {
        const pageEmbedding = await openai.embeddings.create({
          model: 'text-embedding-3-small',
          input: pageText,
        });
        pageEmbeddings.push({
          type: 'page',
          page: i,
          documentId: doc.documentId,
          embedding: pageEmbedding.data[0].embedding,
        });
      }
    }

    // Junta todos los lotes
    const batches = [
      {
        type: 'metadata',
        documentId: doc.documentId,
        embedding: metadataEmbedding.data[0].embedding,
      },
      ...pageEmbeddings
    ];

    return {
      id: doc.documentId,
      batches
    };
  } catch (error) {
    console.error('Error generando embeddings del documento:', error.message);
    return false;
  }
};
