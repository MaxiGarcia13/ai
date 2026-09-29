export class AIError extends Error {
  readonly status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'AIError';
    this.status = status;
  }
}
