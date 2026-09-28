import type { AiProviderConfig } from './types.js';

export function getGroqProvider(apiKey: string): AiProviderConfig<'groq'> {
  return {
    getClientOptions: () => ({
      apiKey,
      baseURL: 'https://api.groq.com/openai/v1',
    }),
    getCreateParams: ({ messages, model = 'openai/gpt-oss-120b' }) => ({
      model,
      messages,
      stream: true,
    }),
  };
}
