import { describe, expect, it } from 'vitest';
import { scenes } from '@/content';
import { activeUnit, assetProgress, lightAt, lightForUnit, unitStart } from './scene-light';

const s0 = scenes.scenes[0];
const s0b = scenes.scenes[1];

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
  it('cena 0B: lead-in de 40 % e vídeo termina quando a pergunta aparece', () => {
    expect(activeUnit(0.39, 3, s0b.leadIn)).toBe(-1);
    expect(activeUnit(0.41, 3, s0b.leadIn)).toBe(0);
    expect(assetProgress(s0b, 0.2)).toBeCloseTo(0.5);
    expect(assetProgress(s0b, 0.4)).toBe(1);
    expect(assetProgress(s0b, 0.9)).toBe(1);
    expect(assetProgress(s0, 0.9)).toBe(0.9);
  });
  it('cena 2: vídeo termina exatamente onde a pergunta 1 começa', () => {
    const s2 = scenes.scenes[3];
    expect(s2.asset?.span).toBeCloseTo(unitStart(5, 8), 2);
    expect(activeUnit(s2.asset!.span!, 8)).toBe(5);
    expect(assetProgress(s2, s2.asset!.span! - 0.01)).toBeLessThan(1);
  });
  it('cena 3: clara o tempo todo e vídeo termina onde a pergunta 4 começa', () => {
    const s3 = scenes.scenes[4];
    expect(lightAt(s3, 0)).toBe('clara');
    expect(lightAt(s3, 1)).toBe('clara');
    expect(s3.asset?.span).toBeCloseTo(unitStart(4, 7), 2);
    expect(activeUnit(s3.asset!.span!, 7)).toBe(4);
  });
  it('activeUnit e unitStart são consistentes', () => {
    for (let u = 0; u < 3; u++) expect(activeUnit(unitStart(u, 3) + 0.001, 3)).toBe(u);
    expect(activeUnit(0.01, 3)).toBe(-1);
  });
});
