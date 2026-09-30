import type { ChatCompletionChunk } from 'openai/resources';

export function writeNdjsonStream(
  stream: AsyncIterable<ChatCompletionChunk>,
): BodyInit {
  return new ReadableStream<Uint8Array>({
    async start(controller) {
      const encoder = new TextEncoder();
      try {
        for await (const chunk of stream) {
          controller.enqueue(encoder.encode(`${JSON.stringify(chunk)}\n`));
        }
        controller.close();
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Request failed';
        controller.enqueue(encoder.encode(`${JSON.stringify({ error: message })}\n`));
        controller.close();
      }
    },
  });
}
