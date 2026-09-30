import type { ChatCompletionMessageParam } from 'openai/resources';
import { trimMessagesToContext } from '@maxigarcia/ai-utils';

function getMessageContent(message: ChatCompletionMessageParam): string {
  return typeof message.content === 'string' ? message.content : '';
}

export function trimMessagesForModel(
  messages: ChatCompletionMessageParam[],
  contextWindowSize: number,
  maxOutputTokens: number,
): ChatCompletionMessageParam[] {
  const systemMessages = messages.filter((message) => message.role === 'system');
  const conversationMessages = messages.filter((message) => message.role !== 'system');
  const systemPrompt = systemMessages.map(getMessageContent).join('\n');

  return [
    ...systemMessages,
    ...trimMessagesToContext({
      messages: conversationMessages,
      systemPrompt,
      contextWindowSize,
      maxOutputTokens,
    }),
  ];
}
