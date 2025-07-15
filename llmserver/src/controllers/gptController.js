import { OpenAI } from 'openai';
import { config } from '../config/config.js';
import { queryTopDocuments } from '../services/pineconeService.js';
import { extractPageFromPDF } from '../services/pdfService.js';

const openai = new OpenAI({
  apiKey: config.openaiApiKey,
});

export const gptSearch = async (req, res) => {
  const { question, courseId, documentsNumber} = req.body;
  if (!question || !courseId || !documentsNumber)
    return res.status(400).json({ error: 'Faltan datos obligatorios' });

  try {
    // Embedding del query
    const embeddingResp = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: question,
    });
    const queryVector = embeddingResp.data[0].embedding;

    //Buscar los top 5 documentos
    const topResults = await queryTopDocuments(queryVector, courseId, documentsNumber, 200);

    res.json({
      matches: topResults.map(match => ({
        id: match.id,
        documentId: match.metadata?.documentId,
        type: match.metadata?.type,
        page: match.metadata?.page,
        similarityScore: match.score.toFixed(4),
      })),
    });
  } catch (error) {
    console.error('Error en búsqueda vectorial con Pinecone:', error);
    res.status(500).json({ error: 'Error al realizar la búsqueda en Pinecone.' });
  }
};

export const gptFullContext = async (req, res) => {
  const { question, documents } = req.body;

  if (!question || !documents) {
    return res.status(400).json({ error: 'Faltan la pregunta o los documentos.' });
  }

  try {
    // Enriquecer los documentos con las 2 primeras páginas
    const enrichedDocs = await Promise.all(
      documents.slice(0, 10).map(async (doc) => {
        let pages = [];
        try {
          pages = await extractPageFromPDF(doc.firebaseUrl);
        } catch (e) {
          // Si hay error, deja las páginas vacías
          pages = [];
        }
        return {
          ...doc,
          pages: pages.slice(0, 2), // Solo 2 primeras páginas
        };
      })
    );

    // Prepara el contexto para el prompt
    const docsContext = enrichedDocs.map(doc =>
      `ID: ${doc.documentId}\nTítulo: ${doc.title}\nDescripción: ${doc.description}\nEtiquetas: ${Array.isArray(doc.labels) ? doc.labels.join(', ') : doc.labels}\nPáginas:\n1: ${doc.pages[0] || '[Sin texto]'}\n2: ${doc.pages[1] || '[Sin texto]'}`
    ).join('\n\n---\n\n');

    // PROMPT
    const systemPrompt = `
      Eres un asistente académico experto en análisis de textos. 
      Vas a recibir hasta 10 documentos, cada uno con su ID, título, descripción, etiquetas y las 2 primeras páginas de contenido. 
      Analiza los documentos y, para la pregunta del usuario, selecciona y ORDENA los 5 documentos más relevantes (si hay menos de 5, incluye los que haya).

      Debes devolver un JSON que tenga:
      - "explanation": una breve explicación de por qué ordenaste así los documentos (máximo 5 líneas).
      - "ids": un arreglo de los 5 GUIDs (o menos si no hay más) en orden de relevancia, del más relevante al menos relevante.

      No agregues ningún texto extra fuera del JSON. Ejemplo de formato:

      {
        "explanation": "Ordené los documentos priorizando los que mencionan explícitamente el tema de la pregunta. Los primeros dos abordan el tema principal, los siguientes lo relacionan indirectamente.",
        "ids": ["id1", "id2", "id3", "id4", "id5"]
      }
          `.trim();

          const userPrompt = `
      Documentos:
      ${docsContext}

      Pregunta del usuario:
      ${question}

      Recuerda, SOLO responde con el JSON requerido, sin explicación adicional.
    `.trim();

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 700 // Puedes ajustar si necesitas más contexto
    });

    const content = response.choices[0].message.content.trim();

    // Simplemente retorna la respuesta del modelo
    res.json({ gptResponse: content });

  } catch (error) {
    console.error('Error en búsqueda semántica con GPT:', error);
    res.status(500).json({ error: 'Error al consultar GPT para ordenar los documentos.' });
  }
};