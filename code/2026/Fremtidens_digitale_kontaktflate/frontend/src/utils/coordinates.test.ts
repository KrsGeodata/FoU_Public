import { toNumber, toMapCoordinates } from './coordinates';

describe('toNumber', () => {
  it('returns finite numbers as-is', () => {
    expect(toNumber(42)).toBe(42);
    expect(toNumber(-3.14)).toBe(-3.14);
    expect(toNumber(0)).toBe(0);
  });

  it('parses numeric strings', () => {
    expect(toNumber('58.15')).toBe(58.15);
    expect(toNumber('-10')).toBe(-10);
    expect(toNumber('0')).toBe(0);
  });

  it('returns null for non-numeric strings', () => {
    expect(toNumber('abc')).toBeNull();
    expect(toNumber('')).toBeNull();
  });

  it('returns null for NaN and Infinity', () => {
    expect(toNumber(NaN)).toBeNull();
    expect(toNumber(Infinity)).toBeNull();
    expect(toNumber(-Infinity)).toBeNull();
  });

  it('returns null for non-number/string types', () => {
    expect(toNumber(null)).toBeNull();
    expect(toNumber(undefined)).toBeNull();
    expect(toNumber({})).toBeNull();
    expect(toNumber([])).toBeNull();
    expect(toNumber(true)).toBeNull();
  });
});

describe('toMapCoordinates', () => {
  it('returns coordinates for valid lat/lon', () => {
    expect(toMapCoordinates({ lat: 58.15, lon: 8.0 })).toEqual({ lat: 58.15, lng: 8.0 });
  });

  it('returns null for null input', () => {
    expect(toMapCoordinates(null)).toBeNull();
  });

  it('returns null when lat or lon is missing', () => {
    expect(toMapCoordinates({ lat: 58.15 })).toBeNull();
    expect(toMapCoordinates({ lon: 8.0 })).toBeNull();
    expect(toMapCoordinates({})).toBeNull();
  });

  it('returns null for out-of-range coordinates', () => {
    expect(toMapCoordinates({ lat: 91, lon: 8.0 })).toBeNull();
    expect(toMapCoordinates({ lat: -91, lon: 8.0 })).toBeNull();
    expect(toMapCoordinates({ lat: 58.15, lon: 181 })).toBeNull();
    expect(toMapCoordinates({ lat: 58.15, lon: -181 })).toBeNull();
  });

  it('handles string values that parse to valid coordinates', () => {
    expect(toMapCoordinates({ lat: '58.15' as unknown as number, lon: '8.0' as unknown as number })).toEqual({ lat: 58.15, lng: 8.0 });
  });

  it('returns null for null lat/lon values', () => {
    expect(toMapCoordinates({ lat: null, lon: null })).toBeNull();
  });
});
