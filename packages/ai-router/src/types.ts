import type { AiProviderModels, AiProviderName } from './providers/types.js';

export interface AiRouterOptions {
  order: Array<AiProviderName>;
  providerConfig: Partial<{
    [key in AiProviderName]: {
      apiKey: string;
      url?: string;
      model?: AiProviderModels[key];
    };
  }>;
}
