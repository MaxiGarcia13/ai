import type { AiProviderName } from '@maxigarcia/ai-types';

export function uniqueProvider(providers: AiProviderName[]) {
  return [...new Set(providers)];
}
