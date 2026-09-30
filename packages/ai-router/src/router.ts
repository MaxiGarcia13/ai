import type { AiProviderName } from '@maxigarcia/ai-types';
import type { AiRouterInterface, AiRouterOptions } from './types.js';
import { createAiRequest } from './create.js';

export function AiRouter<const TFallback extends Array<AiProviderName>>(
  options: AiRouterOptions<TFallback>,
): AiRouterInterface {
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
