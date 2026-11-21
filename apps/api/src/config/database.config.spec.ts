import { DEFAULT_DEV_DATABASE_URL, resolveDatabaseUrl } from './database.config.js';

describe('resolveDatabaseUrl', () => {
  it('uses DATABASE_URL when it is set', () => {
    expect(resolveDatabaseUrl({ DATABASE_URL: 'postgres://u:p@db:5432/app' })).toBe(
      'postgres://u:p@db:5432/app',
    );
  });

  it('requires DATABASE_URL in production', () => {
    expect(() => resolveDatabaseUrl({ NODE_ENV: 'production' })).toThrow(
      /required in production/,
    );
  });

  it('falls back to the docker compose database outside production', () => {
    expect(resolveDatabaseUrl({})).toBe(DEFAULT_DEV_DATABASE_URL);
  });
});
