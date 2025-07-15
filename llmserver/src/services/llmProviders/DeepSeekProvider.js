import { OpenAI } from "openai";
import { LLMProvider } from "./LLMProvider.js";
import { config } from "../../config/config.js";

const MODEL = "deepseek-chat"; 

export class DeepSeekProvider extends LLMProvider {
  constructor() {
    super();
    this.deepseek = new OpenAI({
      baseURL: "https://api.deepseek.com", 
      apiKey: config.deepseekApiKey 
    });
  }

  async ask(question, prompt) {
    const response = await this.deepseek.chat.completions.create({
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
