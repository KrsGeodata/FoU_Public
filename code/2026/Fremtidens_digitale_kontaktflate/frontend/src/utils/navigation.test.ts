import { toViewFromHash, toHashFromView } from './navigation';

describe('toViewFromHash', () => {
  it('maps known hashes to views', () => {
    expect(toViewFromHash('#byggesak')).toBe('byggesak');
    expect(toViewFromHash('#naboliste')).toBe('naboliste');
    expect(toViewFromHash('#avfall')).toBe('avfall');
    expect(toViewFromHash('#avgifter')).toBe('avgifter');
  });

  it('defaults to min-eiendom for unknown hashes', () => {
    expect(toViewFromHash('#min-eiendom')).toBe('min-eiendom');
    expect(toViewFromHash('#unknown')).toBe('min-eiendom');
    expect(toViewFromHash('')).toBe('min-eiendom');
  });
});

describe('toHashFromView', () => {
  it('maps known views to hashes', () => {
    expect(toHashFromView('byggesak')).toBe('#byggesak');
    expect(toHashFromView('naboliste')).toBe('#naboliste');
    expect(toHashFromView('avfall')).toBe('#avfall');
    expect(toHashFromView('avgifter')).toBe('#avgifter');
  });

  it('defaults to #min-eiendom', () => {
    expect(toHashFromView('min-eiendom')).toBe('#min-eiendom');
  });
});
