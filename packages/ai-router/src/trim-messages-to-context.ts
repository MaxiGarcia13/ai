import type { ChatCompletionCreateParamsStreaming, ChatCompletionMessageParam } from 'openai/resources';

interface Options {
  messages: ChatCompletionCreateParamsStreaming['messages'];
  systemPrompt?: string;
  contextWindowSize?: number;
  maxOutputTokens?: number;
  charsPerToken?: number;
  chatTemplateOverheadChars?: number;
}

const CONTEXT_WINDOW_SIZE = 128000;
const MAX_OUTPUT_TOKENS = 1024;
const CHARS_PER_TOKEN = 4;
const CHAT_TEMPLATE_OVERHEAD_CHARS = 32;

/**
 * Trims conversation messages so they fit within a model's context window.
 *
 * @param {Options} options - The options for the function.
 * @param {ChatCompletionCreateParamsStreaming['messages']} options.messages - The messages to trim.
 * @param {string} [options.systemPrompt] - System prompt counted against the budget but not returned.
 * @param {number} [options.contextWindowSize] - The context window size to use.
 * @param {number} [options.maxOutputTokens] - Tokens reserved for the model output.
 * @param {number} [options.charsPerToken] - Approximate characters per token.
 * @param {number} [options.chatTemplateOverheadChars] - Per-message chat template overhead in chars.
 * @returns Trimmed messages that fit the remaining input budget.
 */
export function trimMessagesToContext(
  {
    messages,
    systemPrompt = '',
    contextWindowSize = CONTEXT_WINDOW_SIZE,
    maxOutputTokens = MAX_OUTPUT_TOKENS,
    charsPerToken = CHARS_PER_TOKEN,
    chatTemplateOverheadChars = CHAT_TEMPLATE_OVERHEAD_CHARS,
  }: Options,
): ChatCompletionCreateParamsStreaming['messages'] {
  const maxInputChars = (contextWindowSize - maxOutputTokens) * charsPerToken;
  let remainingChars = maxInputChars - systemPrompt.length - chatTemplateOverheadChars;

  if (remainingChars <= chatTemplateOverheadChars) {
    const lastUserMessage = messages.findLast((message) => message.role === 'user');
    return lastUserMessage ? [truncateMessage(lastUserMessage, remainingChars, chatTemplateOverheadChars)] : [];
  }

  const kept: Options['messages'] = [];

  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i];
    const size = getMessageCharCount(message, chatTemplateOverheadChars);

    if (size <= remainingChars) {
      kept.push(message);
      remainingChars -= size;
      continue;
    }

    if (kept.length === 0) {
      kept.push(truncateMessage(message, remainingChars, chatTemplateOverheadChars));
    }

    break;
  }

  kept.reverse();

  if (kept.length > 1 && kept[0]?.role === 'assistant') {
    kept.shift();
  }

  return kept;
}

function getMessageContent(message: ChatCompletionMessageParam): string {
  return typeof message.content === 'string' ? message.content : '';
}

function getMessageCharCount(message: ChatCompletionMessageParam, chatTemplateOverheadChars: number): number {
  return getMessageContent(message).length + chatTemplateOverheadChars;
}

function truncateMessage(message: ChatCompletionMessageParam, maxChars: number, chatTemplateOverheadChars: number): ChatCompletionMessageParam {
  const maxContent = Math.max(0, maxChars - chatTemplateOverheadChars);

  return {
    ...message,
    content: getMessageContent(message)
      .slice(-maxContent),
  };
}
