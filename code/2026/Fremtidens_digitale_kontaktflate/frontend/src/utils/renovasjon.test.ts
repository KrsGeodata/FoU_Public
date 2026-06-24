import { normalizeWasteKey, toWasteCategory, toStringList, toWasteCollectionItems } from './renovasjon';

describe('normalizeWasteKey', () => {
  it('lowercases and strips non-alphanumeric characters', () => {
    expect(normalizeWasteKey('Restavfall')).toBe('restavfall');
    expect(normalizeWasteKey('  Papp og papir  ')).toBe('pappogpapir');
  });

  it('replaces Norwegian characters', () => {
    expect(normalizeWasteKey('Matavfåll')).toBe('matavfall');
    expect(normalizeWasteKey('Øst')).toBe('ost');
    expect(normalizeWasteKey('Ærlig')).toBe('aerlig');
  });

  it('handles empty string', () => {
    expect(normalizeWasteKey('')).toBe('');
  });
});

describe('toWasteCategory', () => {
  it('recognizes restavfall variants', () => {
    expect(toWasteCategory('Restavfall')).toBe('restavfall');
    expect(toWasteCategory('rest')).toBe('restavfall');
    expect(toWasteCategory('residual')).toBe('restavfall');
    expect(toWasteCategory('Mat og restavfall')).toBe('restavfall');
  });

  it('recognizes matavfall variants', () => {
    expect(toWasteCategory('Matavfall')).toBe('matavfall');
    expect(toWasteCategory('food')).toBe('matavfall');
    expect(toWasteCategory('organic')).toBe('matavfall');
    expect(toWasteCategory('Bioavfall')).toBe('matavfall');
  });

  it('recognizes papir variants', () => {
    expect(toWasteCategory('Papir')).toBe('papir');
    expect(toWasteCategory('Papp og papir')).toBe('papir');
    expect(toWasteCategory('paper')).toBe('papir');
    expect(toWasteCategory('cardboard')).toBe('papir');
  });

  it('recognizes plast variants', () => {
    expect(toWasteCategory('Plast')).toBe('plast');
    expect(toWasteCategory('Plastemballasje')).toBe('plast');
    expect(toWasteCategory('plastic')).toBe('plast');
  });

  it('recognizes glass/metall variants', () => {
    expect(toWasteCategory('Glass')).toBe('glass');
    expect(toWasteCategory('Metall')).toBe('glass');
    expect(toWasteCategory('Glass og metall')).toBe('glass');
    expect(toWasteCategory('Glass og metallemballasje')).toBe('glass');
  });

  it('returns null for unknown categories', () => {
    expect(toWasteCategory('Farlig avfall')).toBeNull();
    expect(toWasteCategory('Hageavfall')).toBeNull();
    expect(toWasteCategory('')).toBeNull();
    expect(toWasteCategory(undefined)).toBeNull();
  });

  it('uses title as fallback when id is unknown', () => {
    expect(toWasteCategory('unknown-id', 'Restavfall')).toBe('restavfall');
  });
});

describe('toStringList', () => {
  it('filters to strings only', () => {
    expect(toStringList(['a', 'b', 'c'])).toEqual(['a', 'b', 'c']);
    expect(toStringList(['a', 1, null, 'b'])).toEqual(['a', 'b']);
  });

  it('returns empty array for non-array input', () => {
    expect(toStringList(null)).toEqual([]);
    expect(toStringList(undefined)).toEqual([]);
    expect(toStringList('string')).toEqual([]);
    expect(toStringList(42)).toEqual([]);
  });
});

describe('toWasteCollectionItems', () => {
  it('parses a valid renovasjon response', () => {
    const payload = {
      adresse: 'Testveien 1',
      kommune: 'Kristiansand',
      kommunenummer: '4204',
      provider: 'Avfall Sør',
      hentedager: [
        { fraksjon: 'Restavfall', neste_henting: '2026-04-10', kommende_datoer: ['2026-04-10', '2026-04-24'] },
        { fraksjon: 'Papir', neste_henting: '2026-04-12', kommende_datoer: ['2026-04-12'] },
      ],
    };

    const items = toWasteCollectionItems(payload);
    expect(items).toHaveLength(2);
    expect(items[0].id).toBe('restavfall');
    expect(items[0].title).toBe('Restavfall');
    expect(items[0].nextPickups).toEqual(['2026-04-10', '2026-04-24']);
    expect(items[1].id).toBe('papir');
  });

  it('uses generic title for glass category', () => {
    const payload = {
      hentedager: [
        { fraksjon: 'Glass', neste_henting: null, kommende_datoer: [] },
      ],
    };
    const items = toWasteCollectionItems(payload);
    expect(items[0].title).toBe('Glass og metall');
  });

  it('skips unknown fraksjon values', () => {
    const payload = {
      hentedager: [
        { fraksjon: 'Farlig avfall', neste_henting: null, kommende_datoer: [] },
      ],
    };
    expect(toWasteCollectionItems(payload)).toEqual([]);
  });

  it('returns empty array for invalid input', () => {
    expect(toWasteCollectionItems(null)).toEqual([]);
    expect(toWasteCollectionItems(undefined)).toEqual([]);
    expect(toWasteCollectionItems('string')).toEqual([]);
    expect(toWasteCollectionItems([])).toEqual([]);
    expect(toWasteCollectionItems({ hentedager: 'not-array' })).toEqual([]);
  });
});
