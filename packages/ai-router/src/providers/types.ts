import type { AiProviderModels, AiProviderName } from '@maxigarcia/ai-types';
import type { ClientOptions } from 'openai';
import type { ChatCompletionCreateParams, ChatCompletionMessageParam } from 'openai/resources';

export interface AiModelLimits {
  contextWindowSize: number;
  maxOutputTokens: number;
}

export type AiProviderCreateParams = Pick<ChatCompletionCreateParams, 'model' | 'messages'>;

export interface AiProviderConfig<ProviderName extends AiProviderName = AiProviderName> {
  getClientOptions: (url: string) => ClientOptions;
  getCreateParams: (
    options: {
      messages: ChatCompletionMessageParam[];
      model?: AiProviderModels[ProviderName] | string;
    },
  ) => AiProviderCreateParams;
  getModelLimits: (model?: string) => AiModelLimits;
}
