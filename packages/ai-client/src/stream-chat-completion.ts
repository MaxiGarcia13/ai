import type { ChatCompletionCreateParamsStreaming } from 'openai/resources.js';
import { HttpError } from '@maxigarcia/ai-utils';
import { readNdjsonStream } from './read-ndjson-stream.js';

type BaseBody = Pick<ChatCompletionCreateParamsStreaming, 'messages'>;
type DefaultBody = Omit<ChatCompletionCreateParamsStreaming, 'model'>;

interface ChatCompletionStreamOptions<Tbody extends BaseBody = DefaultBody> extends
  Omit<RequestInit, 'body' | 'headers'> {
  body: Tbody;
  headers?: Record<string, string>;
}

export async function streamChatCompletion<Tbody extends BaseBody>(
  url: string,
  options: ChatCompletionStreamOptions<Tbody>,
) {
  const response = await fetch(url, {
    method: 'POST',
    ...options,
    body: JSON.stringify({
      ...options.body,
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

    throw new HttpError(message, response.status);
  }

  if (!response.body) {
    throw new HttpError('Response has no body', response.status);
  }

  return readNdjsonStream(response.body);
}
