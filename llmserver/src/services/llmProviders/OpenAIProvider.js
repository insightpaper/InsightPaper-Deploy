import { OpenAI } from 'openai';
import { config } from '../../config/config.js';
import { LLMProvider } from './LLMProvider.js';

export class OpenAIProvider extends LLMProvider {
  constructor() {
    super();
    this.openai = new OpenAI({ apiKey: config.openaiApiKey });
  }

  async ask(question, prompt) {
    const response = await this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content: question }
      ],
      max_tokens: 200,
    });
    return response.choices[0].message.content;
  }
}
