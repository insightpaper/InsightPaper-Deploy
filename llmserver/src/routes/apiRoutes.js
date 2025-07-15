import express from 'express';
import { gptSearch, gptFullContext } from '../controllers/gptController.js';
import { askLLM } from '../controllers/llmController.js';
import { insertDocumentToPinecone, deleteDocumentInPinecone } from '../controllers/pineconeController.js';

const router = express.Router();

// Ruta para interactuar con las busquedas avanzadas
router.post('/gptSearch', gptSearch);
router.post('/gptContext', gptFullContext);

// Ruta para agregar o eliminar documentos a la base vectorial
router.post('/addDocumentPinecone', insertDocumentToPinecone);
router.post('/deleteDocumentPinecone', deleteDocumentInPinecone);

// Ruta para interactuar con los modelos
router.post('/llm', askLLM);

export default router;