import type { AiProviderModels, AiProviderName } from './providers/types.js';

export interface AiRouterOptions {
  fallback: Array<AiProviderName>;
  providers: Partial<{
    [key in AiProviderName]: {
      apiKey: string;
      url?: string;
      model?: AiProviderModels[key];
    };
  }>;
}
