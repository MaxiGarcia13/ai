import type { AiProviderConfig } from './types.js';

export function getGeminiProvider(apiKey: string): AiProviderConfig<'gemini'> {
  return {
    getClientOptions: () => ({
      apiKey,
      baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai',
    }),
    getCreateParams: ({ messages, model = 'gemini-3.7-flash' }) => ({
      model,
      messages,
      stream: true,
    }),
  };
}
