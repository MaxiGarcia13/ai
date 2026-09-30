import type { AiProviderModels, AiProviderName } from '@maxigarcia/ai-types';
import type { AiError } from '@maxigarcia/ai-utils';
import type { ChatCompletionChunk, ChatCompletionCreateParamsStreaming, ChatCompletionMessageParam } from 'openai/resources';

interface ProviderEntry<K extends AiProviderName> {
  apiKey: string;
  model?: AiProviderModels[K];
}

export interface AiRouterOptions<
  TFallback extends Array<AiProviderName> = Array<AiProviderName>,
> {
  fallback: TFallback;
  providers: {
    [K in TFallback[number]]: ProviderEntry<K>;
  };
}

export interface AiRouterInterface {
  lastUsedProvider: AiProviderName | null;
  create: (
    messages: ChatCompletionMessageParam[],
    options?: Omit<ChatCompletionCreateParamsStreaming, 'messages' | 'model'>,
  ) => Promise<AsyncIterable<ChatCompletionChunk> | Array<AiError>>;
}
