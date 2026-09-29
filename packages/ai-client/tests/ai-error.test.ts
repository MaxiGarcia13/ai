import { describe, expect, it } from 'vitest';
import { AiClientError } from '../src/ai-client-error.js';

describe('aiClientError', () => {
  it('sets name, message, and optional status', () => {
    const error = new AiClientError('something went wrong', 502);

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(AiClientError);
    expect(error.name).toBe('AiClientError');
    expect(error.message).toBe('something went wrong');
    expect(error.status).toBe(502);
  });

  it('leaves status undefined when omitted', () => {
    const error = new AiClientError('stream failed');

    expect(error.message).toBe('stream failed');
    expect(error.status).toBeUndefined();
  });
});
