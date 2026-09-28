import type { AiProviderName } from './providers/types.js';
import type { AiClientOptions } from './types.js';
import { createAiRequest } from './create.js';

export async function AiClient(options: AiClientOptions) {
  let lastUsedProvider: AiProviderName | null = null;

  const setLastUsedProvider = (provider: AiProviderName) => {
    lastUsedProvider = provider;
  };

  return {
    lastUsedProvider,
    create: createAiRequest(options, lastUsedProvider, setLastUsedProvider),
  };
}
