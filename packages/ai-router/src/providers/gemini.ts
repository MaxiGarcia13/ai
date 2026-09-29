import type { AiModelLimits, AiProviderConfig } from './types.js';

const DEFAULT_MODEL = 'gemini-3.7-flash';

const MODEL_LIMITS: Record<string, AiModelLimits> = {
  [DEFAULT_MODEL]: {
    contextWindowSize: 1_048_576,
    maxOutputTokens: 1024,
  },
};

export function getGeminiProvider(apiKey: string): AiProviderConfig<'gemini'> {
  return {
    getClientOptions: () => ({
      apiKey,
      baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai',
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
