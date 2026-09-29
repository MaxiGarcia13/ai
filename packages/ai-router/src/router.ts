import type { AiProviderName } from './providers/types.js';
import type { AiRouterOptions } from './types.js';
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
