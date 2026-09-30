import type { AiProviderName } from '@maxigarcia/ai-types';
import type { ChatCompletionCreateParamsStreaming, ChatCompletionMessageParam } from 'openai/resources';
import type { AiRouterInterface, AiRouterOptions } from './types.js';
import { AiError, isHttpError } from '@maxigarcia/ai-utils';
import OpenAI from 'openai';
import { balanceProvidersOrder } from './balance-provider.js';
import { getAiProvider } from './providers/index.js';
import { trimMessagesForModel } from './trim-messages-for-model.js';
import { uniqueProvider } from './unique-provider.js';

export function createAiRequest<const TFallback extends Array<AiProviderName>>(
  { fallback, providers }: AiRouterOptions<TFallback>,
  lastUsedProvider: AiProviderName | null,
  setLastUsedProvider: (provider: AiProviderName) => void,
): AiRouterInterface['create'] {
  return async (
    messages: ChatCompletionMessageParam[],
    options?: Omit<ChatCompletionCreateParamsStreaming, 'messages' | 'model'>,
  ) => {
    const errors: Array<AiError> = [];
    const providerNames = uniqueProvider(fallback);
    const providersOrder = balanceProvidersOrder(lastUsedProvider, providerNames);

    for (const providerName of providersOrder) {
      const config = providers[providerName as TFallback[number]];

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
        const baseParams = provider.getCreateParams({ messages, model: config.model });
        const model = baseParams.model;

        const limits = provider.getModelLimits(model);

        const maxOutputTokens = options?.max_completion_tokens
          ?? options?.max_tokens
          ?? limits.maxOutputTokens;
        const trimmedMessages = trimMessagesForModel(
          messages,
          limits.contextWindowSize,
          maxOutputTokens,
        );
        const createParams = provider.getCreateParams({
          messages: trimmedMessages,
          model: config.model,
        });

        const response = await client.chat.completions.create({
          ...createParams,
          ...options,
        });

        setLastUsedProvider(providerName);

        return response;
      } catch (error) {
        if (isHttpError(error)) {
          errors.push(new AiError(error.message, error.status, providerName));
        }

        continue;
      }
    }

    return Promise.reject(errors);
  };
}
