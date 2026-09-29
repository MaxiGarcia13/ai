import type { AiProviderName, AiRouterOptions } from '@maxigarcia/ai-types';
import { createAiRequest } from './create.js';

export function AiRouter<const TFallback extends Array<AiProviderName>>(
  options: AiRouterOptions<TFallback>,
) {
  let lastUsedProvider: AiProviderName | null = null;

  const setLastUsedProvider = (provider: AiProviderName) => {
    lastUsedProvider = provider;
  };

  return {
    lastUsedProvider,
    create: createAiRequest(
      options,
      lastUsedProvider,
      setLastUsedProvider,
    ),
  };
}
