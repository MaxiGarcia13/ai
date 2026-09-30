import { describe, expect, it } from 'vitest';
import { AiError, isAiErrorArray } from '../src/ai-error.js';

describe('http-error', () => {
  it('sets name, message, and optional status', () => {
    const error = new AiError('something went wrong', 502, 'provider');

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(AiError);
    expect(error.name).toBe('AiError');
    expect(error.providerName).toBe('provider');
    expect(error.message).toBe('something went wrong');
    expect(error.status).toBe(502);
  });

  it('leaves status undefined when omitted', () => {
    const error = new AiError('stream failed');

    expect(error.message).toBe('stream failed');
    expect(error.status).toBeUndefined();
  });
});

describe('isAiErrorArray', () => {
  it('returns true when the error is an array of AiErrors', () => {
    const error = new AiError('something went wrong', 502, 'provider');

    const errors = [error, error];
    expect(isAiErrorArray(errors)).toBe(true);
  });

  it('returns false when the error is not an array of AiErrors', () => {
    const error = new Error('something went wrong');
    expect(isAiErrorArray(error)).toBe(false);
  });
});
