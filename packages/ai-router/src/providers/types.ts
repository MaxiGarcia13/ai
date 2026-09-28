import type { ClientOptions } from 'openai';
import type { ChatCompletionCreateParamsStreaming, ChatCompletionMessageParam } from 'openai/resources/chat/completions';

export type AiProviderName = 'groq' | 'open-router';

export interface AiProviderConfig<ProviderName extends AiProviderName = AiProviderName> {
  getClientOptions: (url: string) => ClientOptions;
  getCreateParams: (
    options: {
      messages: ChatCompletionMessageParam[];
      model?: AiProviderModels[ProviderName];
    },
  ) => ChatCompletionCreateParamsStreaming;
}

export interface AiProviderModels {
  'groq': 'openai/gpt-oss-120b';
  'open-router': 'openrouter/free';
}
