import type { AiModelLimits, AiProviderConfig } from './types.js';

const DEFAULT_MODEL = 'openrouter/free';

const MODEL_LIMITS: Record<string, AiModelLimits> = {
  [DEFAULT_MODEL]: {
    contextWindowSize: 128_000,
    maxOutputTokens: 1024,
  },
};

export function getOpenRouterProvider(apiKey: string): AiProviderConfig<'open-router'> {
  return {
    getClientOptions: () => ({
      apiKey,
      baseURL: 'https://openrouter.ai/api/v1',
    }),
    getCreateParams: ({ messages, model = DEFAULT_MODEL }) => ({
      model,
      messages,
      stream: true,
    }),
    getModelLimits: (model = DEFAULT_MODEL) =>
      MODEL_LIMITS[model] ?? MODEL_LIMITS[DEFAULT_MODEL]!,
  };
}
