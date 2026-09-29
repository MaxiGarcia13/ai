export type AiProviderName = 'groq' | 'open-router' | 'gemini';

export interface AiProviderModels {
  'groq': 'openai/gpt-oss-120b';
  'open-router': 'openrouter/free';
  'gemini': 'gemini-3.7-flash';
}
