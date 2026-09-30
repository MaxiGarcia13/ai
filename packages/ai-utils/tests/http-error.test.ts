import { describe, expect, it } from 'vitest';
import { HttpError, isHttpError } from '../src/http-error.js';

describe('http-error', () => {
  it('sets name, message, and optional status', () => {
    const error = new HttpError('something went wrong', 502);

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(HttpError);
    expect(error.name).toBe('HttpError');
    expect(error.message).toBe('something went wrong');
    expect(error.status).toBe(502);
  });

  it('leaves status undefined when omitted', () => {
    const error = new HttpError('stream failed');

    expect(error.message).toBe('stream failed');
    expect(error.status).toBeUndefined();
  });
});

describe('isHttpError', () => {
  it('returns true when the error is a HttpError', () => {
    const error = new HttpError('something went wrong', 502);
    expect(isHttpError(error)).toBe(true);
  });

  it('returns true when the error has status', () => {
    const error = { status: 502 };
    expect(isHttpError(error)).toBe(true);
  });

  it('returns false when the error is not a HttpError', () => {
    const error = new Error('something went wrong');
    expect(isHttpError(error)).toBe(false);
  });
});
