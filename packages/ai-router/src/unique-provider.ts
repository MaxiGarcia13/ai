import type { AiProviderName } from './providers/types.js';

export function uniqueProvider(providers: AiProviderName[]) {
  return [...new Set(providers)];
}
