import { OpenAIProvider } from './OpenAIProvider.js';
import { GeminiProvider } from './GeminiProvider.js';
import { GroqLlamaProvider } from './GroqLlamaProvider.js';
import { DeepSeekProvider } from './DeepSeekProvider.js';
// Importa otros providers aquí

export function getLLMProvider(providerName) {
  switch (providerName) {
    case 'openai':
      return new OpenAIProvider();
    case 'gemini':
      return new GeminiProvider();
    case "groq-llama":
      return new GroqLlamaProvider();
    case "deepseek":
      return new DeepSeekProvider();
    default:
      throw new Error('Proveedor LLM no soportado');
  }
}
