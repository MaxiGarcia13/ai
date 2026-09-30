export function writeNdjsonStream(stream: ReadableStream<Uint8Array>) {
  return new ReadableStream({
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
