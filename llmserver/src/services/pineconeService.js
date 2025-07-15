import { Pinecone } from '@pinecone-database/pinecone';
import { config as envConfig } from 'dotenv';
envConfig();

const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY});
const index = pinecone.Index('document-embeddings');

export const upsertDocumentEmbeddingsToPinecone = async (docEmbeddings, courseId) => {
  try {
    const vectors = docEmbeddings.batches.map(batch => ({
      id: buildVectorId(batch, courseId),
      values: batch.embedding,
      metadata: {
        documentId: batch.documentId,
        type: batch.type, 
        page: batch.page !== undefined ? batch.page : -1,
      }
    }));

    // Upsert todos los lotes
    await index.upsert(vectors);

    return true;
  } catch (error) {
    console.error('Error subiendo a Pinecone:', error.message);
    return false;
  }
};

function buildVectorId(batch, courseId) {
  if (batch.type === 'metadata') {
    return `${batch.documentId}_${courseId}_metadata`;
  } else if (batch.type === 'page') {
    return `${batch.documentId}_${courseId}_page_${batch.page}`;
  }
  return batch.documentId; // fallback
}

export const deleteDocumentInPineconeService = async (documentId, courseId, namespace = '__default__') => {
  try {
    // Listar todos los IDs con el prefijo del documento
    const prefixDoc = documentId + '_' + courseId;
    const idListResponse = await index.listPaginated({ prefix: prefixDoc });
    const pageOneVectorIds  = idListResponse.vectors.map((vector) => vector.id);

    if (pageOneVectorIds.length > 0) {
      await index.deleteMany(pageOneVectorIds);
    }

    const nextToken = idListResponse.pagination?.next;
    if (nextToken) {
      const pageTwoList = await index.listPaginated({ prefix: prefixDoc, paginationToken: nextToken });
      const pageTwoVectorIds = pageTwoList.vectors.map((vector) => vector.id);
      
      if (pageTwoVectorIds.length > 0) {
        await index.deleteMany(pageTwoVectorIds);
      }
    }

    return true;
  } catch (error) {
    if (error.message == "Cannot read properties of undefined (reading 'next')")
        return true
    console.error('Error eliminando documento en Pinecone:', error.message);
    return false;
  }
};

export const queryTopDocuments = async (vector, courseId, topDocs = 5, oversample = 200) => {
  try {
    const response = await index.query({
      vector,
      topK: oversample,
      includeMetadata: true,
    });
    const matches = response.matches || [];

    const filtered = matches.filter(match =>
      match.id && match.id.includes(`_${courseId}_`)
    );

    // Agrupa por documentId y toma el batch con mejor score de cada documento
    const bestByDoc = {};
    for (const match of filtered) {
      // El documentId original es la parte antes del primer "_"
      const docId = match.id.split('_')[0];
      if (!docId) continue;
      if (!bestByDoc[docId] || bestByDoc[docId].score < match.score) {
        bestByDoc[docId] = match;
      }
    }

    // Toma los top N documentos
    const sorted = Object.values(bestByDoc)
      .sort((a, b) => b.score - a.score)
      .slice(0, topDocs);

    return sorted;
  } catch (error) {
    console.error('Error consultando Pinecone:', error.message);
    throw error;
  }
};