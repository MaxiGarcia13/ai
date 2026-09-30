import type { AiProviderModels, AiProviderName } from '@maxigarcia/ai-types';

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

export interface AiRouterProviderError {
  providerName: AiProviderName;
  error: unknown;
}
