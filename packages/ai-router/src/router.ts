import type { AiProviderName } from './providers/types.js';
import type { AiRouterOptions } from './types.js';
import { createAiRequest } from './create.js';

export async function AiRouter(options: AiRouterOptions) {
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
