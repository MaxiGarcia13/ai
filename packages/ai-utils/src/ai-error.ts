import { HttpError, isHttpError } from './http-error.js';

export class AiError extends HttpError {
  readonly status?: number;
  readonly providerName?: string;

  constructor(message: string, status?: number, providerName?: string) {
    super(message, status);

    this.name = 'AiError';
    this.status = status;
    this.providerName = providerName;
  }
}

export function isAiErrorArray(error: unknown): error is AiError[] {
  return Array.isArray(error) && error.every((item) => item instanceof AiError || isHttpError(item));
}
