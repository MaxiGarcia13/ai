import type { AiProviderModels, AiProviderName } from './provider.js';

interface ProviderEntry<K extends AiProviderName> {
  apiKey: string;
  model?: AiProviderModels[K];
}

export interface AiRouterOptions<
  TFallback extends Array<AiProviderName> = Array<AiProviderName>,
> {
  fallback: TFallback;
  providers: {
    [K in TFallback[number]]: ProviderEntry<K>;
  };
}
