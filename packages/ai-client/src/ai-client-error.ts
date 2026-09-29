export class AiClientError extends Error {
  readonly status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'AiClientError';
    this.status = status;
  }
}
