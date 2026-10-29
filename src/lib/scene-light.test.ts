import { describe, expect, it } from 'vitest';
import { scenes } from '@/content';
import { activeUnit, lightAt, lightForUnit, unitStart } from './scene-light';

const s0 = scenes.scenes[0];

describe('luz por posição de scroll', () => {
  it('cena 0: clara antes do dossel, escura depois', () => {
    expect(lightAt(s0, 0)).toBe('clara');
    expect(lightAt(s0, 0.64)).toBe('clara');
    expect(lightAt(s0, 0.65)).toBe('escura');
    expect(lightAt(s0, 1)).toBe('escura');
  });
  it('cena sem light é escura; string constante vale o tempo todo', () => {
    expect(lightAt({}, 0.9)).toBe('escura');
    expect(lightAt({ light: 'clara' }, 0.9)).toBe('clara');
  });
  it('cena 0 tem 3 unidades: 2 textos claros e escolhas escuras', () => {
    expect(lightForUnit(s0, 0, 3)).toBe('clara');
    expect(lightForUnit(s0, 1, 3)).toBe('clara');
    expect(lightForUnit(s0, 2, 3)).toBe('escura');
  });
  it('activeUnit e unitStart são consistentes', () => {
    for (let u = 0; u < 3; u++) expect(activeUnit(unitStart(u, 3) + 0.001, 3)).toBe(u);
    expect(activeUnit(0.01, 3)).toBe(-1);
  });
});
