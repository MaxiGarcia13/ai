import type { ChatCompletionChunk } from 'openai/resources.js';
import { AIError } from './ai-error.js';

export async function* readNdjsonStream(
  body: ReadableStream<Uint8Array>,
): AsyncGenerator<ChatCompletionChunk> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        const trimmed = line.trim();

        if (!trimmed) {
          continue;
        }

        yield parseLlmStreamLine(trimmed);
      }
    }

    const remaining = buffer.trim();

    if (remaining) {
      yield parseLlmStreamLine(remaining);
    }
  } finally {
    reader.releaseLock();
  }
}

function parseLlmStreamLine(line: string): ChatCompletionChunk {
  const parsed = JSON.parse(line) as ChatCompletionChunk | { error?: string | { message?: string } };

  if ('error' in parsed && parsed.error) {
    const error = parsed.error;
    const message = typeof error === 'string' ? error : error.message ?? 'Request failed';
    throw new AIError(message);
  }

  return parsed as ChatCompletionChunk;
}
