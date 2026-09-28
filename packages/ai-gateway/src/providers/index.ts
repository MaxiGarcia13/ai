import type { AiProviderConfig, AiProviderName } from './types.js';
import { getGroqProvider } from './groq.js';
import { getOpenRouterProvider } from './open-router.js';

type Provider<ProviderName extends AiProviderName> = (apiKey: string) => AiProviderConfig<ProviderName>;

const providers: { [Name in AiProviderName]: Provider<Name> } = {
  'groq': getGroqProvider,
  'open-router': getOpenRouterProvider,
};

export function getAiProvider<
  ProviderName extends AiProviderName,
>(name?: ProviderName): Provider<ProviderName> | null {
  if (!name || !(name in providers)) {
    return null;
  }

  return providers[name];
}
