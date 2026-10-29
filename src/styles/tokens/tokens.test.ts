import { describe, expect, it } from 'vitest';
import { colors, duration, easing } from './tokens';

describe('tokens', () => {
  it('cores de marca são hex de 6 dígitos', () => {
    for (const v of Object.values(colors)) expect(v).toMatch(/^#[0-9A-F]{6}$/);
  });
  it('easing JS é monotônico e vai de 0 a 1', () => {
    const f = easing.gsap.inOutCubic;
    expect(f(0)).toBe(0);
    expect(f(1)).toBe(1);
    let prev = 0;
    for (let t = 0; t <= 1; t += 0.05) { expect(f(t)).toBeGreaterThanOrEqual(prev); prev = f(t); }
  });
  it('durações são positivas', () => {
    for (const v of Object.values(duration)) expect(v).toBeGreaterThan(0);
  });
});
