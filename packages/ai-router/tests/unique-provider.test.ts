import { describe, expect, it } from 'vitest';
import { uniqueProvider } from '../src/unique-provider.js';

describe('uniqueProvider', () => {
  it('returns an empty array when given no providers', () => {
    expect(uniqueProvider([])).toEqual([]);
  });

  it('returns the same providers when they are already unique', () => {
    expect(uniqueProvider(['groq', 'open-router'])).toEqual(['groq', 'open-router']);
  });

  it('removes duplicate providers while preserving first-seen order', () => {
    expect(uniqueProvider(['groq', 'open-router', 'groq'])).toEqual(['groq', 'open-router']);
  });

  it('collapses an array of identical providers to a single entry', () => {
    expect(uniqueProvider(['open-router', 'open-router', 'open-router'])).toEqual(['open-router']);
  });
});
