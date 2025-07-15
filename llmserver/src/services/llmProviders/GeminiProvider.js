import { GoogleGenAI } from '@google/genai';
import { config } from '../../config/config.js';
import { LLMProvider } from './LLMProvider.js';

export class GeminiProvider extends LLMProvider {
  constructor() {
    super();
    this.gemini = new GoogleGenAI({ apiKey: config.googleApiKey });
  }

  async ask(question, prompt) {
    const contents = `${prompt}\n\nPregunta: ${question}`;
    const response = await this.gemini.models.generateContent({
      model: 'gemini-2.0-flash',
      contents,
    });
    return response.text;
  }
}
