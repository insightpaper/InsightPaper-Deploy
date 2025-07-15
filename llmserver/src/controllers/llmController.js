import { getLLMProvider } from '../services/llmProviders/LLMFactory.js';
import { ACADEMIC_ASSISTANT_PROMPT } from '../services/llmProviders/prompts.js';

export const askLLM = async (req, res) => {
  const { question, provider, chatHistory  } = req.body;
  if (!question || !provider || !chatHistory ) {
    return res.status(400).json({ error: 'Faltan parámetros' });
  }

  let contextStr = '';
  if (Array.isArray(chatHistory) && chatHistory.length > 0) {
    // Tomar los últimos 5 pares pregunta-respuesta
    const last5 = chatHistory.slice(-5);
    contextStr = last5.map(
      (entry, idx) =>
        `Pregunta ${idx + 1}: ${entry.question}\nRespuesta ${idx + 1}: ${entry.response}`
    ).join('\n');
  }

  const fullPrompt = contextStr
    ? `${ACADEMIC_ASSISTANT_PROMPT}\n\nContexto del chat reciente:\n${contextStr}\n`
    : ACADEMIC_ASSISTANT_PROMPT;

  try {
    const llm = getLLMProvider(provider);
    const answer = await llm.ask(question, fullPrompt);
    res.json({ answer });
  } catch (error) {
    console.error('Error con LLM:', error);
    res.status(500).json({ error: error.message });
  }
};
