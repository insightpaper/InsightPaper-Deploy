import { generateDocumentEmbeddings } from '../services/documentEmbeddingService.js';
import { upsertDocumentEmbeddingsToPinecone, deleteDocumentInPineconeService } from '../services/pineconeService.js';

export const insertDocumentToPinecone = async (req, res) => {
  const { documentId, title, description, labels, firebaseUrl, courseId } = req.body;

  if (!documentId || !title || !description || !firebaseUrl || !courseId) {
    return res.status(400).json({ error: 'Faltan datos obligatorios' });
  }

  // Arma el objeto documento
  const doc = { documentId, title, description, labels, firebaseUrl};

  // Genera los embeddings
  const docEmbeddings = await generateDocumentEmbeddings(doc);

  if (!docEmbeddings) {
    return res.status(500).json({ success: false, message: 'Error generando embeddings' });
  }

  // Insertar en Pinecone
  const ok = await upsertDocumentEmbeddingsToPinecone(docEmbeddings, courseId);

  if (ok) {
    return res.json({ success: true, documentId });
  } else {
    return res.status(500).json({ success: false, message: 'Error insertando en Pinecone' });
  }
};

export const deleteDocumentInPinecone = async (req, res) => {
  const { documentId, courseId } = req.body;
  if (!documentId || !courseId) {
    return res.status(400).json({ success: false, error: 'Faltan datos obligatorios' });
  }

  const ok = await deleteDocumentInPineconeService(documentId, courseId);
  if (ok) {
    return res.json({ success: true, documentId });
  } else {
    return res.status(500).json({ success: false, error: 'Error eliminando el documento en Pinecone.' });
  }
};