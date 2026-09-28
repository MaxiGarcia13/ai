import { describe, expect, it } from 'vitest';
import { balanceProvidersOrder } from '../src/balance-provider.js';

describe('balanceProvidersOrder', () => {
  const order = ['groq', 'open-router'] as const;

  it('returns the original order when lastUsedProvider is null', () => {
    expect(balanceProvidersOrder(null, [...order])).toEqual(['groq', 'open-router']);
  });

  it('moves the last used provider to the front when it is at the end', () => {
    expect(balanceProvidersOrder('open-router', [...order])).toEqual(['open-router', 'groq']);
  });

  it('keeps the last used provider first when it is already first', () => {
    expect(balanceProvidersOrder('groq', [...order])).toEqual(['groq', 'open-router']);
  });

  it('rotates from a middle provider in a longer order', () => {
    const longerOrder = ['groq', 'open-router', 'groq'] as const;

    expect(balanceProvidersOrder('open-router', [...longerOrder])).toEqual([
      'open-router',
      'groq',
      'groq',
    ]);
  });
});
