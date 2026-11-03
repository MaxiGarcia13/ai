import type { AiProviderName } from '@maxigarcia/ai-types';
import type { AiRouterInterface, AiRouterOptions } from './types.js';
import { createAiRequest } from './create.js';

export function AiRouter<const TFallback extends Array<AiProviderName>>(
  options: AiRouterOptions<TFallback>,
): AiRouterInterface {
  let lastUsedProvider: AiProviderName | null = null;

  return {
    get lastUsedProvider() {
      return lastUsedProvider;
    },
    create: createAiRequest(
      options,
      () => lastUsedProvider,
      (provider) => {
        lastUsedProvider = provider;
      },
    ),
  };
}
