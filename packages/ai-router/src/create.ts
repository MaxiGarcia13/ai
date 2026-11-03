import type { AiProviderName } from '@maxigarcia/ai-types';
import type { ChatCompletionMessageParam } from 'openai/resources';
import type {
  AiRouterCreateOptions,
  AiRouterInterface,
  AiRouterOptions,
} from './types.js';
import { AiError, isHttpError } from '@maxigarcia/ai-utils';
import OpenAI from 'openai';
import { balanceProvidersOrder } from './balance-provider.js';
import { getAiProvider } from './providers/index.js';
import { trimMessagesForModel } from './trim-messages-for-model.js';
import { uniqueProvider } from './unique-provider.js';

export function createAiRequest<const TFallback extends Array<AiProviderName>>(
  { fallback, providers }: AiRouterOptions<TFallback>,
  getLastUsedProvider: () => AiProviderName | null,
  setLastUsedProvider: (provider: AiProviderName) => void,
): AiRouterInterface['create'] {
  return (async (
    messages: ChatCompletionMessageParam[],
    options: AiRouterCreateOptions = {},
  ) => {
    const { stream = true, ...callOptions } = options;
    const errors: Array<AiError> = [];
    const providerNames = uniqueProvider(fallback);
    const providersOrder = balanceProvidersOrder(getLastUsedProvider(), providerNames);

    for (const providerName of providersOrder) {
      const config = providers[providerName as TFallback[number]];

      if (!config?.apiKey) {
        throw new Error(`API key for provider ${providerName} not found`);
      }

      const providerFn = getAiProvider(providerName);

      if (!providerFn) {
        throw new Error(`Provider ${providerName} not found`);
      }

      const { apiKey, model, ...providerOptions } = config;
      const provider = providerFn(apiKey);

      try {
        const client = new OpenAI(provider.getClientOptions(apiKey));
        const baseParams = provider.getCreateParams({ messages, model });
        const resolvedModel = baseParams.model;

        const limits = provider.getModelLimits(resolvedModel);

        const maxOutputTokens = providerOptions.max_completion_tokens
          ?? providerOptions.max_tokens
          ?? limits.maxOutputTokens;
        const trimmedMessages = trimMessagesForModel(
          messages,
          limits.contextWindowSize,
          maxOutputTokens,
        );
        const createParams = provider.getCreateParams({
          messages: trimmedMessages,
          model,
        });

        const response = stream
          ? await client.chat.completions.create({
              ...createParams,
              ...providerOptions,
              ...callOptions,
              stream: true,
            })
          : await client.chat.completions.create({
              ...createParams,
              ...providerOptions,
              ...callOptions,
              stream: false,
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
  }) as AiRouterInterface['create'];
}
