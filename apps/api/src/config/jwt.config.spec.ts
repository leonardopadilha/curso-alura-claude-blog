import { Logger } from '@nestjs/common';
import { vi } from 'vitest';
import { resolveJwtSecret } from './jwt.config.js';

describe('resolveJwtSecret', () => {
  const longSecret = 'a'.repeat(32);

  beforeEach(() => {
    vi.spyOn(Logger.prototype, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('uses JWT_SECRET when it is set', () => {
    expect(resolveJwtSecret({ JWT_SECRET: longSecret })).toBe(longSecret);
  });

  it('rejects a secret shorter than 32 bytes', () => {
    expect(() => resolveJwtSecret({ JWT_SECRET: 'curto' })).toThrow(/at least 32 bytes/);
  });

  it('requires JWT_SECRET in production', () => {
    expect(() => resolveJwtSecret({ NODE_ENV: 'production' })).toThrow(/required in production/);
  });

  it('falls back to a random per-process secret outside production', () => {
    const first = resolveJwtSecret({});
    const second = resolveJwtSecret({});

    expect(Buffer.byteLength(first)).toBeGreaterThanOrEqual(32);
    expect(first).not.toBe(second);
  });
});
