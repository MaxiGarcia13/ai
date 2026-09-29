import type { AiProviderModels, AiProviderName } from '@maxigarcia/ai-types';
import type { ClientOptions } from 'openai';
import type { ChatCompletionCreateParamsStreaming, ChatCompletionMessageParam } from 'openai/resources';

export interface AiModelLimits {
  contextWindowSize: number;
  maxOutputTokens: number;
}

export interface AiProviderConfig<ProviderName extends AiProviderName = AiProviderName> {
  getClientOptions: (url: string) => ClientOptions;
  getCreateParams: (
    options: {
      messages: ChatCompletionMessageParam[];
      model?: AiProviderModels[ProviderName];
    },
  ) => ChatCompletionCreateParamsStreaming;
  getModelLimits: (model?: string) => AiModelLimits;
}
