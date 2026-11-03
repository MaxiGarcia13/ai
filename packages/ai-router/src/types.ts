import type { AiProviderModels, AiProviderName } from '@maxigarcia/ai-types';
import type { AiError } from '@maxigarcia/ai-utils';
import type { ChatCompletionChunk, ChatCompletionCreateParamsStreaming, ChatCompletionMessageParam } from 'openai/resources';

export interface AiRouterInterface {
  lastUsedProvider: AiProviderName | null;
  create: (
    messages: ChatCompletionMessageParam[],
  ) => Promise<AsyncIterable<ChatCompletionChunk> | Array<AiError>>;
}

export type AiRouterCompletionParams = Omit<ChatCompletionCreateParamsStreaming, 'messages' | 'model' | 'stream'>;

export interface AiRouterProviderConfig<K extends AiProviderName>
  extends AiRouterCompletionParams {
  apiKey: string;
  model?: AiProviderModels[K] | string;
}

export interface AiRouterOptions<
  TFallback extends Array<AiProviderName> = Array<AiProviderName>,
> {
  fallback: TFallback;
  providers: {
    [K in TFallback[number]]: AiRouterProviderConfig<K>;
  };
}
