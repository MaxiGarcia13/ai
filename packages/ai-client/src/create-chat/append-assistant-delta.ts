import type { ChatMessage } from './types.js';

/** Returns a new messages array with `delta` appended to the last assistant message. */
export function appendAssistantDelta(
  messages: ChatMessage[],
  delta: string,
): ChatMessage[] | null {
  const last = messages[messages.length - 1];

  if (!last || last.role !== 'assistant') {
    return null;
  }

  const next = [...messages];
  next[next.length - 1] = {
    role: 'assistant',
    content: last.content + delta,
  };
  return next;
}
