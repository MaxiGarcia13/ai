import type { ChatCompletionCreateParamsStreaming } from 'openai/resources.js';
import { AIError } from './ai-error.js';
import { readNdjsonStream } from './read-ndjson-stream.js';

interface ChatCompletionStreamOptions extends
  RequestInit,
  ChatCompletionCreateParamsStreaming {
}

export async function chatCompletionStream(
  url: string,
  options: ChatCompletionStreamOptions,
) {
  const response = await fetch(url, {
    method: 'POST',
    ...options,
    body: JSON.stringify({
      messages: options.messages,
    }),
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    let message = `Request failed: ${response.status}`;

    try {
      const body = await response.json() as { error?: string };

      if (body.error) {
        message = body.error;
      }
    } catch {
      // Keep the status fallback when the body is not JSON.
    }

    throw new AIError(message, response.status);
  }

  if (!response.body) {
    throw new AIError('Response has no body', response.status);
  }

  return readNdjsonStream(response.body);
}
