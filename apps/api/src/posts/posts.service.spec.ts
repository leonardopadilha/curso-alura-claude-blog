import { normalizeTags, toTsQuery } from './posts.service.js';

describe('normalizeTags', () => {
  it('lowercases, trims and removes duplicates', () => {
    expect(normalizeTags(['React', ' react ', 'Front-end', ''])).toEqual(['react', 'front-end']);
  });
});

describe('toTsQuery', () => {
  it('turns every word into a prefix term joined by AND', () => {
    expect(toTsQuery('acessibilidade react')).toBe('acessibilidade:* & react:*');
  });

  it('keeps accented letters and numbers', () => {
    expect(toTsQuery('ação 2024')).toBe('ação:* & 2024:*');
  });

  it("drops every operator so user input can't change the query", () => {
    expect(toTsQuery("react' | !(& :*")).toBe('react:*');
  });

  it('returns undefined when there is nothing to search', () => {
    expect(toTsQuery('   ')).toBeUndefined();
    expect(toTsQuery('!!!')).toBeUndefined();
    expect(toTsQuery(undefined)).toBeUndefined();
  });
});
