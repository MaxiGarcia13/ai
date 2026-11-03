import type { AiProviderModels, AiProviderName } from '@maxigarcia/ai-types';
import type {
  ChatCompletion,
  ChatCompletionChunk,
  ChatCompletionCreateParams,
  ChatCompletionCreateParamsStreaming,
  ChatCompletionMessageParam,
} from 'openai/resources';

export type AiRouterCallOptions = Pick<
  ChatCompletionCreateParams,
  'tools' | 'tool_choice' | 'parallel_tool_calls'
>;

export type AiRouterCreateOptions = AiRouterCallOptions & {
  stream?: boolean;
};

export interface AiRouterInterface {
  readonly lastUsedProvider: AiProviderName | null;
  create: ((
    messages: ChatCompletionMessageParam[],
    options: AiRouterCallOptions & { stream: false },
  ) => Promise<ChatCompletion>) & ((
    messages: ChatCompletionMessageParam[],
    options?: AiRouterCallOptions & { stream?: true },
  ) => Promise<AsyncIterable<ChatCompletionChunk>>);
}

export type AiRouterCompletionParams = Omit<
  ChatCompletionCreateParamsStreaming,
  'messages' | 'model' | 'stream' | 'tools' | 'tool_choice' | 'parallel_tool_calls'
>;

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
