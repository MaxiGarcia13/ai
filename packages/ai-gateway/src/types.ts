import type { AiProviderModels, AiProviderName } from './providers/types.js';

export interface AiClientOptions {
  order: Array<AiProviderName>;
  providerConfig: {
    [key in AiProviderName]: {
      apiKey: string;
      url?: string;
      model?: AiProviderModels[key];
    };
  };
}
