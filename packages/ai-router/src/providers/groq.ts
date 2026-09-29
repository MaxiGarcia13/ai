import type { AiModelLimits, AiProviderConfig } from './types.js';

const DEFAULT_MODEL = 'openai/gpt-oss-120b';

const MODEL_LIMITS: Record<string, AiModelLimits> = {
  [DEFAULT_MODEL]: {
    contextWindowSize: 131_072,
    maxOutputTokens: 1024,
  },
};

export function getGroqProvider(apiKey: string): AiProviderConfig<'groq'> {
  return {
    getClientOptions: () => ({
      apiKey,
      baseURL: 'https://api.groq.com/openai/v1',
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
