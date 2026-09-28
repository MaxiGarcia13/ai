import type { AiProviderModels, AiProviderName } from './providers/types.js';

export interface AiRouterOptions {
  order: Array<AiProviderName>;
  providerConfig: {
    [key in AiProviderName]: {
      apiKey: string;
      url?: string;
      model?: AiProviderModels[key];
    };
  };
}
