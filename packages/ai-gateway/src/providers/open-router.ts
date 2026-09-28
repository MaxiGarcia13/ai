import type { AiProviderConfig } from './types.js';

export function getOpenRouterProvider(apiKey: string): AiProviderConfig<'open-router'> {
  return {
    getClientOptions: () => ({
      apiKey,
      baseURL: 'https://openrouter.ai/api/v1',
    }),
    getCreateParams: ({ messages, model = 'openrouter/free' }) => ({
      model,
      messages,
      stream: true,
    }),
  };
}
