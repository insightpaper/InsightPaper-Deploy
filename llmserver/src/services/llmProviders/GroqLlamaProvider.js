import { OpenAI } from "openai";
import { LLMProvider } from "./LLMProvider.js";
import { config } from "../../config/config.js";

const MODEL = "llama3-70b-8192";

export class GroqLlamaProvider extends LLMProvider {
  constructor() {
    super();
    this.groq = new OpenAI({
      apiKey: config.groqApiKey, 
      baseURL: "https://api.groq.com/openai/v1"
    });
  }

  async ask(question, prompt) {
    const response = await this.groq.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: prompt },
        { role: "user", content: question }
      ],
      max_tokens: 200
    });
    return response.choices[0].message.content;
  }
}
