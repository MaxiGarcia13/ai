import type { ChatCompletionCreateParamsStreaming, ChatCompletionMessageParam } from 'openai/resources';
import type { AiProviderName } from './providers/types.js';
import type { AiRouterOptions } from './types.js';
import OpenAI from 'openai';
import { balanceProvidersOrder } from './balance-provider.js';
import { getAiProvider } from './providers/index.js';
import { uniqueProvider } from './unique-provider.js';

export function createAiRequest(
  { order, providerConfig }: AiRouterOptions,
  lastUsedProvider: AiProviderName | null,
  setLastUsedProvider: (provider: AiProviderName) => void,
) {
  return async (
    messages: ChatCompletionMessageParam[],
    options: Omit<ChatCompletionCreateParamsStreaming, 'messages'>,
  ) => {
    const errors: { providerName: AiProviderName; error: unknown }[] = [];
    const providers = uniqueProvider(order);
    const providersOrder = balanceProvidersOrder(lastUsedProvider, providers);

    for (const providerName of providersOrder) {
      const config = providerConfig[providerName];

      if (!config?.apiKey) {
        throw new Error(`API key for provider ${providerName} not found`);
      }

      const providerFn = getAiProvider(providerName);

      if (!providerFn) {
        throw new Error(`Provider ${providerName} not found`);
      }

      const provider = providerFn(config.apiKey);

      try {
        const client = new OpenAI(provider.getClientOptions(config.apiKey));
        const createParams = provider.getCreateParams({ messages, model: config.model });

        const response = await client.chat.completions.create({
          ...createParams,
          ...options,
        });

        setLastUsedProvider(providerName);

        return response;
      } catch (error) {
        errors.push({ providerName, error });
        continue;
      }
    }

    return Promise.reject(errors);
  };
}
