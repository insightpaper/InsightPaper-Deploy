import dotenv from 'dotenv';
dotenv.config();

export const config = {
  openaiApiKey: process.env.OPENAI_API_KEY,
  googleApiKey: process.env.GOOGLE_API_KEY,
  groqApiKey: process.env.GROQ_API_KEY,
  deepseekApiKey: process.env.DEEPSEEK_API_KEY
};